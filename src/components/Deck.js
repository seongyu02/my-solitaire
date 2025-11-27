import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Deck({ deck, waste, onFlip, onWastePress, selected }) {
  const topWaste = waste[waste.length - 1];

  const isWasteSelected =
    selected &&
    selected.pile === "waste" &&
    selected.index === waste.length - 1;

  return (
    <View style={styles.container}>
      {/* 덱 */}
      <TouchableOpacity
        style={[styles.deck, deck.length === 0 && styles.deckEmpty]}
        onPress={onFlip}
        activeOpacity={deck.length > 0 ? 0.8 : 1}
      >
        {deck.length === 0 ? null : <View style={styles.deckBack} />}
      </TouchableOpacity>

      {/* 버린 카드 더미 */}
      <TouchableOpacity
        style={[styles.waste, isWasteSelected && styles.selectedWaste]}
        onPress={() =>
          topWaste &&
          onWastePress &&
          onWastePress({
            pile: "waste",
            index: waste.length - 1,
            card: topWaste
          })
        }
        activeOpacity={topWaste ? 0.8 : 1}
      >
        {topWaste ? (
          <Text style={{ fontSize: 16, color: topWaste.color }}>
            {topWaste.suit} {topWaste.num}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const CARD_W = 52;
const CARD_H = 78;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  deck: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 6,
    backgroundColor: "#0057a6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#003a70"
  },
  deckBack: {
    width: "90%",
    height: "90%",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ffffff"
  },
  deckEmpty: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#777"
  },
  waste: {
    width: CARD_W,
    height: CARD_H,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    backgroundColor: "#ffffff"
  },
  selectedWaste: {
    borderColor: "#ffcc33",
    borderWidth: 2
  }
});