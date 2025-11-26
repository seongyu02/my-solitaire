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
      <TouchableOpacity style={styles.deck} onPress={onFlip}>
        {deck.length > 0 ? <Text>🂠</Text> : <Text>❌</Text>}
      </TouchableOpacity>

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
        {topWaste && (
          <Text style={{ fontSize: 18, color: topWaste.color }}>
            {topWaste.suit} {topWaste.num}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginBottom: 20 },
  deck: {
    width: 60,
    height: 90,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 10
  },
  waste: {
    width: 60,
    height: 90,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc"
  },
  selectedWaste: {
    borderColor: "#ff6347",
    borderWidth: 2
  }
});