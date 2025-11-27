// src/screens/GameScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity
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
  const [game, setGame] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const resetGame = async () => {
    let newGame = initGame();
    newGame = ensureFoundations(newGame);
    newGame.moves = 0;
    setSelected(null);
    setGame(newGame);
    await AsyncStorage.setItem("solitaire_game", JSON.stringify(newGame));
  };

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

  const afterMove = (updatedGameBase) => {
    const moves = (game?.moves || 0) + 1;
    const updated = ensureFoundations({
      ...updatedGameBase,
      moves
    });

    setGame(updated);
    setSelected(null);

    if (isGameWon(updated.foundations)) {
      Alert.alert("축하합니다!", "모든 카드를 완성했습니다 🎉");
    }
  };

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
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomLabel}>설정</Text>
        </View>
        <TouchableOpacity style={styles.randomButton} onPress={resetGame}>
          <Text style={styles.randomButtonText}>랜덤 게임</Text>
        </TouchableOpacity>
        <View style={styles.bottomRight}>
          <Text style={styles.bottomLabel}>알림</Text>
        </View>
      </View>
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
    justifyContent: "space-between", // 7개를 가로에 쫙
    alignItems: "flex-start",
    marginTop: 4
  },
  bottomBar: {
    height: 48,
    backgroundColor: "#001017",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12
  },
  bottomLeft: {
    width: 60,
    alignItems: "flex-start"
  },
  bottomRight: {
    width: 60,
    alignItems: "flex-end"
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
  }
});