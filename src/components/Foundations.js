import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Foundations({ foundations, onPress, selected }) {
  return (
    <View style={styles.row}>
      {foundations.map((pile, index) => {
        const top = pile[pile.length - 1];

        const isSelected =
          selected &&
          selected.pile === "foundation" &&
          selected.foundationIndex === index;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.slot, isSelected && styles.selectedSlot]}
            onPress={() =>
              onPress &&
              onPress({
                pile: "foundation",
                foundationIndex: index,
                card: top
              })
            }
            activeOpacity={top ? 0.8 : 1}
          >
            {top ? (
              <Text style={{ fontSize: 18, color: top.color }}>
                {top.suit} {top.num}
              </Text>
            ) : (
              <Text style={styles.placeholder}>A</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16
  },
  slot: {
    width: 60,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#fff"
  },
  selectedSlot: {
    borderColor: "#ff6347",
    borderWidth: 2
  },
  placeholder: {
    fontSize: 16,
    color: "#aaa"
  }
});