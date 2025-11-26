import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Card from "./Card";

export default function Column({
  columnIndex,
  cards,
  onCardPress,
  onEmptyPress,
  selected
}) {
  const handleEmptyPress = () => {
    onEmptyPress && onEmptyPress(columnIndex);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={cards.length === 0 ? handleEmptyPress : undefined}
      style={styles.column}
    >
      {cards.map((card, index) => {
        const isSelected =
          selected &&
          selected.pile === "tableau" &&
          selected.columnIndex === columnIndex &&
          selected.cardIndex === index;

        return (
          <View key={card.id} style={{ marginTop: index === 0 ? 0 : 20 }}>
            <Card
              card={card}
              isSelected={isSelected}
              onPress={() =>
                onCardPress &&
                onCardPress({
                  pile: "tableau",
                  columnIndex,
                  cardIndex: index,
                  card
                })
              }
            />
          </View>
        );
      })}
      {cards.length === 0 && <View style={styles.placeholder} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 70,
    minHeight: 120,
    marginHorizontal: 5
  },
  placeholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#aaa"
  }
});