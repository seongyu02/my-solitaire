// src/screens/GameScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
  Switch
} from "react-native";
import { BlurView } from "expo-blur";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initGame } from "../game/initGame";
import Deck from "../components/Deck";
import Column from "../components/Column";
import Foundations from "../components/Foundations";
import {
  canMoveToTableau,
  canMoveToFoundation,
  isGameWon,
  isValidSequence
} from "../game/rules";

export default function GameScreen() {
  const [game, setGame] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null); // null | "settings" | "rules"

  // 🔊 설정: 배경음악 / 효과음
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // 🔊 사운드 객체 ref
  const bgmSoundRef = useRef(null);
  const sfxSoundRef = useRef(null);

  // -----------------------------
  // 1) 게임 상태 불러오기
  // -----------------------------
  useEffect(() => {
    const loadGame = async () => {
      try {
        const saved = await AsyncStorage.getItem("solitaire_game");
        if (saved) {
          const parsed = JSON.parse(saved);
          const withFoundations = ensureFoundations(parsed);
          if (typeof withFoundations.moves !== "number") {
            withFoundations.moves = 0;
          }
          setGame(withFoundations);
        } else {
          let fresh = initGame();
          fresh = ensureFoundations(fresh);
          fresh.moves = 0;
          setGame(fresh);
        }
      } catch (e) {
        console.log("불러오기 에러:", e);
        let fresh = initGame();
        fresh = ensureFoundations(fresh);
        fresh.moves = 0;
        setGame(fresh);
      }
      setLoaded(true);
    };

    loadGame();
  }, []);

  // -----------------------------
  // 2) 게임 상태 저장
  // -----------------------------
  useEffect(() => {
    const saveGame = async () => {
      if (!game) return;
      try {
        await AsyncStorage.setItem("solitaire_game", JSON.stringify(game));
      } catch (e) {
        console.log("저장 에러:", e);
      }
    };

    saveGame();
  }, [game]);

  // -----------------------------
  // 3) 설정 불러오기 (배경음악/효과음)
  // -----------------------------
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem("solitaire_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.bgmEnabled === "boolean")
            setBgmEnabled(parsed.bgmEnabled);
          if (typeof parsed.sfxEnabled === "boolean")
            setSfxEnabled(parsed.sfxEnabled);
        }
      } catch (e) {
        console.log("설정 불러오기 에러:", e);
      }
    };
    loadSettings();
  }, []);

  // -----------------------------
  // 4) 설정 저장
  // -----------------------------
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          "solitaire_settings",
          JSON.stringify({ bgmEnabled, sfxEnabled })
        );
      } catch (e) {
        console.log("설정 저장 에러:", e);
      }
    };
    saveSettings();
  }, [bgmEnabled, sfxEnabled]);

  // -----------------------------
  // 5) 배경음악 on/off
  // -----------------------------
  useEffect(() => {
    const handleBgm = async () => {
      try {
        if (bgmEnabled) {
          // 이미 재생 중이면 무시
          if (bgmSoundRef.current) {
            const status = await bgmSoundRef.current.getStatusAsync();
            if (status.isLoaded && status.isPlaying) return;
          } else {
            // 배경음악 로드 (경로는 프로젝트 구조에 맞게 수정)
            const { sound } = await Audio.Sound.createAsync(
              require("../../assets/bgm.mp3"),
              {
                isLooping: true,
                volume: 0.5
              }
            );
            bgmSoundRef.current = sound;
          }
          await bgmSoundRef.current.playAsync();
        } else {
          // 끄기
          if (bgmSoundRef.current) {
            await bgmSoundRef.current.stopAsync();
          }
        }
      } catch (e) {
        console.log("BGM 에러:", e);
      }
    };

    handleBgm();

    return () => {
      // 언마운트 시 정리
      if (bgmSoundRef.current) {
        bgmSoundRef.current.unloadAsync();
        bgmSoundRef.current = null;
      }
    };
  }, [bgmEnabled]);

  // -----------------------------
  // 6) 효과음 재생 helper
  // -----------------------------
  const playSfx = async () => {
    if (!sfxEnabled) return;
    try {
      if (!sfxSoundRef.current) {
        // 효과음 로드 (경로는 프로젝트 구조에 맞게 수정)
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/card.mp3"),
          { volume: 0.9 }
        );
        sfxSoundRef.current = sound;
      }
      await sfxSoundRef.current.replayAsync();
    } catch (e) {
      console.log("SFX 에러:", e);
    }
  };

  const ensureFoundations = (g) => {
    if (!g.foundations || g.foundations.length !== 4) {
      return { ...g, foundations: [[], [], [], []] };
    }
    return g;
  };

  // -----------------------------
  // 게임 리셋 (= 게임 종료 후 새로 시작)
  // -----------------------------
  const resetGame = async () => {
    await playSfx();
    let newGame = initGame();
    newGame = ensureFoundations(newGame);
    newGame.moves = 0;
    setSelected(null);
    setGame(newGame);
    await AsyncStorage.setItem("solitaire_game", JSON.stringify(newGame));
  };

  // -----------------------------
  // 덱에서 카드 한 장 뽑기
  // -----------------------------
  const flipDeck = () => {
    setSelected(null);
    setGame((prev) => {
      if (!prev || prev.deck.length === 0) return prev;
      const top = { ...prev.deck[0], faceUp: true };
      const newWaste = [...prev.waste, top];
      const newDeck = prev.deck.slice(1);
      const updated = ensureFoundations({
        ...prev,
        deck: newDeck,
        waste: newWaste
      });
      // flip 할 때도 효과음
      playSfx();
      return updated;
    });
  };

  const afterMove = (updatedGameBase) => {
    const moves = (game?.moves || 0) + 1;
    const updated = ensureFoundations({
      ...updatedGameBase,
      moves
    });

    setGame(updated);
    setSelected(null);

    // 이동 성공하면 효과음
    playSfx();

    if (isGameWon(updated.foundations)) {
      Alert.alert("축하합니다!", "모든 카드를 완성했습니다 🎉");
    }
  };

  // -----------------------------
  // 카드 이동 (테이블로 7열 사이)
  // -----------------------------
  const moveSelectionToColumn = (destColumnIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    let movingCards = [];
    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      movingCards = srcCol.slice(selected.cardIndex);

      if (!isValidSequence(movingCards)) {
        return;
      }
    } else if (selected.pile === "waste") {
      if (selected.index !== waste.length - 1) return;
      movingCards = [selected.card];
    } else {
      return;
    }

    const destCol = columns[destColumnIndex];
    if (!canMoveToTableau(movingCards, destCol)) {
      return;
    }

    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      const remain = srcCol.slice(0, selected.cardIndex);
      columns[selected.columnIndex] = remain;

      if (remain.length > 0) {
        const last = remain[remain.length - 1];
        if (!last.faceUp) {
          columns[selected.columnIndex][remain.length - 1] = {
            ...last,
            faceUp: true
          };
        }
      }
    } else if (selected.pile === "waste") {
      waste = waste.slice(0, waste.length - 1);
    }

    columns[destColumnIndex] = [...destCol, ...movingCards];

    const newGame = {
      ...game,
      columns,
      foundations,
      deck,
      waste
    };
    afterMove(newGame);
  };

  // -----------------------------
  // 카드 이동 (파운데이션으로)
  // -----------------------------
  const moveSelectionToFoundation = (foundationIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    let card = null;

    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      if (selected.cardIndex !== srcCol.length - 1) return;
      card = srcCol[selected.cardIndex];
      if (!card.faceUp) return;
      if (!canMoveToFoundation(card, foundations[foundationIndex])) return;

      const remain = srcCol.slice(0, srcCol.length - 1);
      columns[selected.columnIndex] = remain;

      if (remain.length > 0) {
        const last = remain[remain.length - 1];
        if (!last.faceUp) {
          columns[selected.columnIndex][remain.length - 1] = {
            ...last,
            faceUp: true
          };
        }
      }
    } else if (selected.pile === "waste") {
      if (selected.index !== waste.length - 1) return;
      card = selected.card;
      if (!canMoveToFoundation(card, foundations[foundationIndex])) return;
      waste = waste.slice(0, waste.length - 1);
    } else {
      return;
    }

    foundations[foundationIndex] = [...foundations[foundationIndex], card];

    const newGame = {
      ...game,
      columns,
      foundations,
      deck,
      waste
    };
    afterMove(newGame);
  };

  // -----------------------------
  // 카드 탭 / 빈 컬럼 탭 / waste / foundation 처리
  // -----------------------------
  const handleCardPress = (info) => {
    if (!game) return;

    if (!selected) {
      setSelected(info);
      return;
    }

    if (
      selected.pile === info.pile &&
      selected.columnIndex === info.columnIndex &&
      selected.cardIndex === info.cardIndex
    ) {
      setSelected(null);
      return;
    }

    moveSelectionToColumn(info.columnIndex);
  };

  const handleEmptyColumnPress = (columnIndex) => {
    moveSelectionToColumn(columnIndex);
  };

  const handleWastePress = (info) => {
    if (!game || game.waste.length === 0) return;

    if (
      selected &&
      selected.pile === "waste" &&
      selected.index === info.index
    ) {
      setSelected(null);
    } else {
      setSelected(info);
    }
  };

  const handleFoundationPress = (info) => {
    if (!selected) return;
    moveSelectionToFoundation(info.foundationIndex);
  };

  // -----------------------------
  // 로딩 화면
  // -----------------------------
  if (!loaded || !game) {
    return (
      <View style={styles.loadingRoot}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>게임 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  const moves = game.moves || 0;

  return (
    <View style={styles.root}>
      {/* 상단 상태 바 (게임 내부 UI) */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>00:00</Text>
        <Text style={styles.statusCenter}>0</Text>
        <Text style={styles.statusText}>이동: {moves}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 위쪽: 왼쪽 파운데이션 / 오른쪽 덱 */}
        <View style={styles.topRow}>
          <View style={styles.foundationsWrapper}>
            <Foundations
              foundations={game.foundations}
              onPress={handleFoundationPress}
              selected={selected}
            />
          </View>
          <View style={styles.deckWrapper}>
            <Deck
              deck={game.deck}
              waste={game.waste}
              onFlip={flipDeck}
              onWastePress={handleWastePress}
              selected={selected}
            />
          </View>
        </View>

        {/* 7개 컬럼 */}
        <View style={styles.columns}>
          {game.columns.map((col, index) => (
            <Column
              key={index}
              columnIndex={index}
              cards={col}
              onCardPress={handleCardPress}
              onEmptyPress={handleEmptyColumnPress}
              selected={selected}
            />
          ))}
        </View>
      </ScrollView>

      {/* 하단 바 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomSide}
          onPress={() => setModalType("settings")}
        >
          <Text style={styles.bottomLabel}>설정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.randomButton} onPress={resetGame}>
          <Text style={styles.randomButtonText}>랜덤 게임</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomSide}
          onPress={() => setModalType("rules")}
        >
          <Text style={styles.bottomLabel}>규칙</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 / 규칙 모달 */}
      {modalType && (
        <View style={styles.modalOverlay}>
          {/* 뒤 배경 흐리게 */}
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {/* 가운데 박스 */}
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalType(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {modalType === "settings" ? "설정" : "게임 규칙"}
            </Text>

            <ScrollView style={styles.modalBody}>
              {modalType === "settings" ? (
                <>
                  <View style={styles.settingRow}>
                    <Text style={styles.modalTextLabel}>배경 음악</Text>
                    <Switch
                      value={bgmEnabled}
                      onValueChange={setBgmEnabled}
                    />
                  </View>
                  <View style={styles.settingRow}>
                    <Text style={styles.modalTextLabel}>효과음</Text>
                    <Switch
                      value={sfxEnabled}
                      onValueChange={setSfxEnabled}
                    />
                  </View>

                  <View style={styles.settingDivider} />

                  <TouchableOpacity
                    style={styles.endGameButton}
                    onPress={() => {
                      Alert.alert(
                        "게임 종료",
                        "현재 게임을 종료하고 새 게임을 시작할까요?",
                        [
                          { text: "취소", style: "cancel" },
                          {
                            text: "확인",
                            style: "destructive",
                            onPress: async () => {
                              await resetGame();
                              setModalType(null);
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.endGameButtonText}>게임 종료</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>
                    • 기본 클론다이크(1장 뽑기) 규칙을 사용합니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 위쪽 네 칸 파운데이션에는 같은 무늬 A → K 순서로
                    쌓습니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 아래 7줄은 색깔을 번갈아가며 숫자가 1씩 작아지는 카드만
                    올릴 수 있습니다. (빨강 위엔 검정, 검정 위엔 빨강)
                  </Text>
                  <Text style={styles.modalText}>
                    • 빈 열에는 K로 시작하는 카드 묶음만 놓을 수 있습니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 오른쪽 위 덱을 눌러 새 카드를 뽑고, 버린 더미 맨 위 카드만
                    사용할 수 있습니다.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#006b35"
  },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#006b35"
  },
  loadingBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  loadingText: {
    color: "#fff"
  },
  statusBar: {
    height: 32,
    backgroundColor: "#001820",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#00352a"
  },
  statusText: {
    color: "#ffe89b",
    fontSize: 11
  },
  statusCenter: {
    color: "#ffe89b",
    fontSize: 13,
    fontWeight: "bold"
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 4
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12
  },
  foundationsWrapper: {
    flex: 1
  },
  deckWrapper: {
    justifyContent: "flex-start",
    alignItems: "flex-end"
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4
  },
  bottomBar: {
    height: 80,
    backgroundColor: "#001017",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  bottomSide: {
    width: 70,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomLabel: {
    color: "#ccc",
    fontSize: 11
  },
  randomButton: {
    paddingHorizontal: 22,
    paddingVertical: 6,
    backgroundColor: "#00783a",
    borderRadius: 16
  },
  randomButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  modalClose: {
    position: "absolute",
    top: 8,
    right: 10,
    padding: 8,
    zIndex: 1
  },
  modalCloseText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold"
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8
  },
  modalBody: {
    marginTop: 8
  },
  modalText: {
    color: "#f0f0f0",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6
  },
  modalTextLabel: {
    color: "#f0f0f0",
    fontSize: 14
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 12
  },
  endGameButton: {
    paddingVertical: 10,
    backgroundColor: "#aa3333",
    borderRadius: 8,
    alignItems: "center"
  },
  endGameButtonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});