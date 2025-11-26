import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function Card({ card, onPress, isSelected }) {
  const handlePress = () => {
    if (!card.faceUp) return;        // 뒷면이면 클릭 무시
    onPress && onPress(card);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
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
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: -70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  back: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1e90ff",
    borderRadius: 8
  },
  text: {
    fontSize: 20,
    fontWeight: "bold"
  },
  selectedCard: {
    borderColor: "#ff6347",
    borderWidth: 2
  }
});