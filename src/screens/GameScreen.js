import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Button,
  Alert
} from "react-native";
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
  const [game, setGame] = useState(null);     // deck, waste, columns, foundations
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null); // 선택된 카드 정보

  // 🔥 게임 불러오기 (자동 이어하기)
  useEffect(() => {
    const loadGame = async () => {
      try {
        const saved = await AsyncStorage.getItem("solitaire_game");
        if (saved) {
          const parsed = JSON.parse(saved);
          // foundations 없으면 기본값 추가
          if (!parsed.foundations || parsed.foundations.length !== 4) {
            parsed.foundations = [[], [], [], []];
          }
          setGame(parsed);
        } else {
          const fresh = initGame();
          if (!fresh.foundations) {
            fresh.foundations = [[], [], [], []];
          }
          setGame(fresh);
        }
      } catch (e) {
        console.log("불러오기 에러:", e);
        const fresh = initGame();
        fresh.foundations = fresh.foundations || [[], [], [], []];
        setGame(fresh);
      }
      setLoaded(true);
    };

    loadGame();
  }, []);

  // 🔥 게임 상태 자동 저장
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

  const ensureFoundations = (g) => {
    if (!g.foundations || g.foundations.length !== 4) {
      return { ...g, foundations: [[], [], [], []] };
    }
    return g;
  };

  // 새 게임
  const resetGame = async () => {
    let newGame = initGame();
    newGame = ensureFoundations(newGame);
    setSelected(null);
    setGame(newGame);
    await AsyncStorage.setItem("solitaire_game", JSON.stringify(newGame));
  };

  // 덱에서 한 장 뒤집기
  const flipDeck = () => {
    setSelected(null);
    setGame((prev) => {
      if (!prev || prev.deck.length === 0) return prev;
      const top = { ...prev.deck[0], faceUp: true };
      const newWaste = [...prev.waste, top];
      const newDeck = prev.deck.slice(1);
      return ensureFoundations({
        ...prev,
        deck: newDeck,
        waste: newWaste
      });
    });
  };

  // 이동 후 승리 체크
  const afterMove = (newGame) => {
    setGame(ensureFoundations(newGame));
    setSelected(null);

    if (isGameWon(newGame.foundations)) {
      Alert.alert("축하합니다!", "모든 카드를 완성했습니다 🎉");
    }
  };

  // 테이블(컬럼)으로 이동 시도
  const moveSelectionToColumn = (destColumnIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    // 출발 카드들 계산
    let movingCards = [];
    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      movingCards = srcCol.slice(selected.cardIndex);

      if (!isValidSequence(movingCards)) {
        console.log("유효하지 않은 시퀀스");
        return;
      }
    } else if (selected.pile === "waste") {
      // waste 맨 위 카드만 이동 가능
      if (selected.index !== waste.length - 1) return;
      movingCards = [selected.card];
    } else {
      // foundation에서 tableau로는 이동 안 함(간단 버전)
      return;
    }

    const destCol = columns[destColumnIndex];
    if (!canMoveToTableau(movingCards, destCol)) {
      console.log("여기로는 못 옮김");
      return;
    }

    // 실제 이동 처리
    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      const remain = srcCol.slice(0, selected.cardIndex);
      columns[selected.columnIndex] = remain;

      // 남아 있는 컬럼에서 맨 위 카드 앞면으로 뒤집기
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

  // 파운데이션으로 이동 시도
  const moveSelectionToFoundation = (foundationIndex) => {
    if (!selected || !game) return;

    const columns = game.columns.map((col) => [...col]);
    const foundations = game.foundations.map((pile) => [...pile]);
    let deck = [...game.deck];
    let waste = [...game.waste];

    let card = null;

    if (selected.pile === "tableau") {
      const srcCol = columns[selected.columnIndex];
      // 맨 위 카드만 가능
      if (selected.cardIndex !== srcCol.length - 1) return;
      card = srcCol[selected.cardIndex];
      if (!card.faceUp) return;
      if (!canMoveToFoundation(card, foundations[foundationIndex])) return;

      // 컬럼에서 제거
      const remain = srcCol.slice(0, srcCol.length - 1);
      columns[selected.columnIndex] = remain;

      // 남은 카드 맨 위 뒤집기
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
      // waste 맨 위 카드만
      if (selected.index !== waste.length - 1) return;
      card = selected.card;
      if (!canMoveToFoundation(card, foundations[foundationIndex])) return;
      waste = waste.slice(0, waste.length - 1);
    } else {
      // foundation 간 이동/다른 곳에서 이동은 지원 X
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

  // 컬럼 안/컬럼 간 카드 눌렀을 때
  const handleCardPress = (info) => {
    if (!game) return;

    if (!selected) {
      setSelected(info);
      return;
    }

    // 같은 카드 다시 누르면 선택 해제
    if (
      selected.pile === info.pile &&
      selected.columnIndex === info.columnIndex &&
      selected.cardIndex === info.cardIndex
    ) {
      setSelected(null);
      return;
    }

    // 이미 선택된 카드가 있고, 다른 컬럼을 눌렀으면 → 그 컬럼으로 이동 시도
    moveSelectionToColumn(info.columnIndex);
  };

  // 빈 컬럼 눌렀을 때
  const handleEmptyColumnPress = (columnIndex) => {
    moveSelectionToColumn(columnIndex);
  };

  // waste 카드 눌렀을 때
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

  // 파운데이션 칸 눌렀을 때
  const handleFoundationPress = (info) => {
    if (!selected) {
      // foundation에서 다시 빼오는 기능은 지금은 안 넣음
      return;
    }
    moveSelectionToFoundation(info.foundationIndex);
  };

  if (!loaded || !game) {
    return (
      <View style={styles.loading}>
        <Text>게임 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>노아의 솔리테어 🎴</Text>
        <Text style={styles.sub}>클론다이크 규칙 + 자동 이어하기</Text>
        <Button title="새 게임" onPress={resetGame} />
      </View>

      {/* 상단: 덱 + 파운데이션 */}
      <View style={styles.topRow}>
        <Deck
          deck={game.deck}
          waste={game.waste}
          onFlip={flipDeck}
          onWastePress={handleWastePress}
          selected={selected}
        />
        <Foundations
          foundations={game.foundations}
          onPress={handleFoundationPress}
          selected={selected}
        />
      </View>

      {/* 7개의 테이블 컬럼 */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "bold"
  },
  sub: {
    marginVertical: 4,
    color: "#555"
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  columns: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  }
});