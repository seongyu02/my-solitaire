import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text, Button } from "react-native";
import { initGame } from "../game/initGame";
import Deck from "../components/Deck";
import Column from "../components/Column";

export default function GameScreen() {
  // 초기 게임 상태
  const [game, setGame] = useState(initGame());

  // 새 게임
  const resetGame = () => {
    setGame(initGame());
  };

  // 덱에서 카드 한 장 뒤집기
  const flipDeck = () => {
    setGame((prev) => {
      if (prev.deck.length === 0) return prev;

      const newWaste = [
        ...prev.waste,
        { ...prev.deck[0], faceUp: true }
      ];
      const newDeck = prev.deck.slice(1);

      return {
        ...prev,
        deck: newDeck,
        waste: newWaste
      };
    });
  };

  // 카드 눌렀을 때 (지금은 로그만)
  const handleCardPress = (info) => {
    console.log("카드 눌림:", info);
  };

  const handleEmptyColumnPress = (columnIndex) => {
    console.log("빈 컬럼 눌림:", columnIndex);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>노아의 솔리테어 🎴</Text>
        <Text style={styles.sub}>기말 대체 과제용 기본 버전</Text>
        <Button title="새 게임" onPress={resetGame} />
      </View>

      {/* 덱 + 버린 카드 */}
      <Deck
        deck={game.deck}
        waste={game.waste}
        onFlip={flipDeck}
        onWastePress={(info) => console.log("waste 클릭:", info)}
        selected={null}
      />

      {/* 7개의 컬럼 */}
      <View style={styles.columns}>
        {game.columns.map((col, index) => (
          <Column
            key={index}
            columnIndex={index}
            cards={col}
            onCardPress={handleCardPress}
            onEmptyPress={handleEmptyColumnPress}
            selected={null}
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
  columns: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  }
});