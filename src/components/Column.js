// src/components/Column.js
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native";
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
    <View style={styles.column}>
      {cards.length === 0 ? (
        <TouchableOpacity
          style={styles.emptySlot}
          onPress={handleEmptyPress}
          activeOpacity={0.8}
        />
      ) : (
        cards.map((card, index) => {
          const isSelected =
            selected &&
            selected.pile === "tableau" &&
            selected.columnIndex === columnIndex &&
            selected.cardIndex === index;

          return (
            <View
              key={card.id || `${columnIndex}-${index}`}
              // 두 번째 카드부터는 위 카드랑 겹치게
              style={index === 0 ? null : styles.overlap}
            >
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
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,                // 7개 컬럼이 가로를 7등분
    marginHorizontal: 2,    // 컬럼 사이 살짝 여백
    alignItems: "center"
  },
  overlap: {
    marginTop: -65          // 값 줄이면 카드 더 겹쳐짐 / 늘리면 더 벌어짐
  },
  emptySlot: {
    width: "100%",
    aspectRatio: 52 / 78,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "rgba(255,255,255,0.08)"
  }
});