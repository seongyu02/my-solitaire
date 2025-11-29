// src/screens/GameScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { router } from "expo-router";

import Column from "../components/Column";
import Deck from "../components/Deck";
import Foundations from "../components/Foundations";
import { initGame } from "../game/initGame";
import {
  canMoveToFoundation,
  canMoveToTableau,
  isGameWon,
  isValidSequence
} from "../game/rules";

export default function GameScreen() {
  const [game, setGame] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const bgmSoundRef = useRef(null);
  const sfxSoundRef = useRef(null);

  // 시간
  const [seconds, setSeconds] = useState(0);

  // 점수
  const [score, setScore] = useState(0);

  // 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // -----------------------------
  // 게임 불러오기
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
  // 게임 저장
  // -----------------------------
  useEffect(() => {
    const saveGame = async () => {
      if (!game) return;
      await AsyncStorage.setItem("solitaire_game", JSON.stringify(game));
    };
    saveGame();
  }, [game]);

  // -----------------------------
  // 설정 불러오기
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
      } catch (e) {}
    };
    loadSettings();
  }, []);

  // -----------------------------
  // 설정 저장
  // -----------------------------
  useEffect(() => {
    const saveSettings = async () => {
      await AsyncStorage.setItem(
        "solitaire_settings",
        JSON.stringify({ bgmEnabled, sfxEnabled })
      );
    };
    saveSettings();
  }, [bgmEnabled, sfxEnabled]);

  // -----------------------------
  // BGM 처리
  // -----------------------------
  useEffect(() => {
    const handleBgm = async () => {
      try {
        if (bgmEnabled) {
          if (!bgmSoundRef.current) {
            const { sound } = await Audio.Sound.createAsync(
              require("../../assets/bgm.mp3"),
              { isLooping: true, volume: 0.5 }
            );
            bgmSoundRef.current = sound;
          }
          await bgmSoundRef.current.playAsync();
        } else {
          if (bgmSoundRef.current) {
            await bgmSoundRef.current.stopAsync();
          }
        }
      } catch (e) {}
    };

    handleBgm();

    return () => {
      if (bgmSoundRef.current) {
        bgmSoundRef.current.unloadAsync();
        bgmSoundRef.current = null;
      }
    };
  }, [bgmEnabled]);

  // -----------------------------
  // 효과음
  // -----------------------------
  const playSfx = async () => {
    if (!sfxEnabled) return;
    try {
      if (!sfxSoundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/card.mp3"),
          { volume: 0.9 }
        );
        sfxSoundRef.current = sound;
      }
      await sfxSoundRef.current.replayAsync();
    } catch (e) {}
  };

  const ensureFoundations = (g) => {
    if (!g.foundations || g.foundations.length !== 4) {
      return { ...g, foundations: [[], [], [], []] };
    }
    return g;
  };

  // -----------------------------
  // 게임 리셋
  // -----------------------------
  const resetGame = async () => {
    await playSfx();
    let newGame = initGame();
    newGame = ensureFoundations(newGame);
    newGame.moves = 0;
    setSelected(null);
    setSeconds(0);
    setScore(0);
    setGame(newGame);
    await AsyncStorage.setItem("solitaire_game", JSON.stringify(newGame));
  };

  // -----------------------------
  // 덱에서 카드 뽑기
  // -----------------------------
  const flipDeck = () => {
    setSelected(null);
    setGame((prev) => {
      if (!prev) return prev;

      // Waste → Deck 재활용: -20점
      if (prev.deck.length === 0) {
        const newDeck = prev.waste.map((card) => ({
          ...card,
          faceUp: false
        }));

        if (prev.waste.length > 0) {
          setScore((prevScore) => prevScore - 20);
        }

        return {
          ...prev,
          deck: newDeck,
          waste: []
        };
      }

      const top = { ...prev.deck[0], faceUp: true };
      const newWaste = [...prev.waste, top];
      const newDeck = prev.deck.slice(1);

      playSfx();
      return { ...prev, deck: newDeck, waste: newWaste };
    });
  };

  // -----------------------------
  // 이동 후 처리 (점수 포함)
  // -----------------------------
  const afterMove = async (updatedGameBase, deltaScore = 0) => {
    const moves = (game?.moves || 0) + 1;

    const updated = {
      ...updatedGameBase,
      moves
    };

    setGame(updated);
    setSelected(null);

    await playSfx();

    if (deltaScore !== 0) {
      setScore((prev) => prev + deltaScore);
    }

    // 게임 클리어 체크
    if (isGameWon(updated.foundations)) {
      const finalTime = formatTime(seconds);
      const finalMoves = updated.moves;
      const finalScore = score + deltaScore;

      // 기록 저장
      try {
        const saved = await AsyncStorage.getItem("solitaire_records");
        let list = saved ? JSON.parse(saved) : [];

        list.push({
          score: finalScore,
          time: finalTime,
          moves: finalMoves,
          date: new Date().toLocaleString()
        });

        list.sort((a, b) => b.score - a.score);
        list = list.slice(0, 7);

        await AsyncStorage.setItem(
          "solitaire_records",
          JSON.stringify(list)
        );
      } catch (e) {}

      router.push({
        pathname: "/end",
        params: {
          time: finalTime,
          moves: String(finalMoves),
          score: String(finalScore)
        }
      });

      return;
    }
  };

  // -----------------------------
  // 카드 이동 (Column)
  // -----------------------------
  const moveSelectionToColumn = (destColumnIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    let movingCards = [];
    const selCardIndex = selected.cardIndex ?? selected.index ?? null;
    let deltaScore = 0;

    if (selected.pile === "tableau") {
      if (selCardIndex === null) return;
      const srcCol = columns[selected.columnIndex];
      movingCards = srcCol.slice(selCardIndex);

      if (!isValidSequence(movingCards)) return;

      // T→T: +5
      deltaScore += 5;
    } else if (selected.pile === "waste") {
      const wasteIndex = selected.index ?? selected.cardIndex ?? null;
      if (wasteIndex !== waste.length - 1) return;
      movingCards = [selected.card];

      // W→T: +5
      deltaScore += 5;
    }

    const destCol = columns[destColumnIndex];
    if (!canMoveToTableau(movingCards, destCol)) return;

    // 원래 위치에서 제거
    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      const remain = srcCol.slice(0, selCardIndex);
      columns[selected.columnIndex] = remain;

      // 뒷면 뒤집기: +5
      if (remain.length > 0 && !remain[remain.length - 1].faceUp) {
        columns[selected.columnIndex][remain.length - 1] = {
          ...remain[remain.length - 1],
          faceUp: true
        };
        deltaScore += 5;
      }
    } else {
      waste = waste.slice(0, waste.length - 1);
    }

    // 대상 칼럼에 추가
    columns[destColumnIndex] = [...destCol, ...movingCards];

    const newGame = {
      ...game,
      columns,
      foundations,
      deck,
      waste
    };

    afterMove(newGame, deltaScore);
  };

  // -----------------------------
  // 카드 이동 (Foundation)
  // -----------------------------
  const moveSelectionToFoundation = (foundationIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    let card = null;
    let deltaScore = 0;
    const selCardIndex = selected.cardIndex ?? selected.index ?? null;

    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      if (selCardIndex !== srcCol.length - 1) return;

      card = srcCol[selCardIndex];
      if (!card.faceUp) return;
      if (!canMoveToFoundation(card, foundations[foundationIndex]))
        return;

      const remain = srcCol.slice(0, srcCol.length - 1);
      columns[selected.columnIndex] = remain;

      // Foundation: +10
      deltaScore += 10;

      // 뒷면: +5
      if (remain.length > 0 && !remain[remain.length - 1].faceUp) {
        columns[selected.columnIndex][remain.length - 1] = {
          ...remain[remain.length - 1],
          faceUp: true
        };
        deltaScore += 5;
      }
    } else if (selected.pile === "waste") {
      const wasteIndex = selected.index ?? selected.cardIndex ?? null;
      if (wasteIndex !== waste.length - 1) return;

      card = selected.card;

      if (!canMoveToFoundation(card, foundations[foundationIndex]))
        return;

      waste = waste.slice(0, waste.length - 1);

      // Foundation: +10
      deltaScore += 10;
    }

    foundations[foundationIndex] = [
      ...foundations[foundationIndex],
      card
    ];

    const newGame = {
      ...game,
      columns,
      foundations,
      deck,
      waste
    };

    afterMove(newGame, deltaScore);
  };

  // -----------------------------
  // 카드 탭
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

    if (info.pile !== "tableau" && !info.isTop?.isTop) {
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

  // -----------------------------
  // 렌더링
  // -----------------------------
  return (
    <View style={styles.root}>
      {/* 상단바 */}
      <View style={styles.statusBar}>
        {/* 시간 */}
        <Text style={styles.statusText}>{formatTime(seconds)}</Text>

        {/* ⭐ 점수를 오른쪽으로 이동 */}
        <Text style={styles.statusScore}>점수: {score}</Text>

        {/* 이동 */}
        <Text style={styles.statusText}>이동: {moves}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

      {/* 모달 */}
      {modalType && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

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
                    <Switch value={bgmEnabled} onValueChange={setBgmEnabled} />
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.modalTextLabel}>효과음</Text>
                    <Switch value={sfxEnabled} onValueChange={setSfxEnabled} />
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

                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => {
                      setModalType(null);
                      router.replace("/");
                    }}
                  >
                    <Text style={styles.exitButtonText}>나가기</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>
                    • 기본 클론다이크(1장 뽑기) 규칙을 사용합니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 같은 무늬 A → K 순으로 파운데이션에 쌓습니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 아래 7줄은 색을 번갈아가며 숫자가 1씩 작아지는 카드만 올릴 수 있습니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 빈 열에는 K로 시작하는 카드 묶음만 놓을 수 있습니다.
                  </Text>
                  <Text style={styles.modalText}>
                    • 덱을 눌러 새 카드를 뽑고, 버린 카드 맨 위만 사용할 수 있습니다.
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

// -----------------------------
// 스타일
// -----------------------------
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

  // ⭐ 상단 상태바
  statusBar: {
    height: 32,
    backgroundColor: "#001820",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#00352a"
  },

  statusText: {
    color: "#ffe89b",
    fontSize: 11
  },

  // ⭐ 점수 위치를 오른쪽으로 이동
  statusScore: {
    color: "#ffe89b",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 120   // ← 갤럭시 핸드폰 전면 카메라 때문에 오른쪽으로 이동
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
    alignItems: "flex-start"
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
  },

  exitButton: {
    marginTop: 10,
    paddingVertical: 9,
    backgroundColor: "#444",
    borderRadius: 8,
    alignItems: "center"
  },

  exitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  }
});
