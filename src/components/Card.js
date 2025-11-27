// src/components/Card.js
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function Card({ card, onPress, isSelected }) {
  const handlePress = () => {
    if (!card.faceUp) return;
    onPress && onPress(card);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      {card.faceUp ? (
        <Text style={[styles.text, { color: card.color }]}>
          {card.suit} {card.num}
        </Text>
      ) : (
        <View style={styles.back} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",          // 가로는 컬럼 폭에 맞게
    aspectRatio: 52 / 78,   // 카드 비율 고정
    borderRadius: 6,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    overflow: "hidden"
    // 여기에 marginBottom 같은 건 두지 않는다 (겹치는 건 Column에서)
  },
  back: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0057a6",
    borderRadius: 6
  },
  text: {
    fontSize: 17,
    fontWeight: "bold"
  },
  selectedCard: {
    borderColor: "#ffcc33",
    borderWidth: 2
  }
});