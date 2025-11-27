import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. 필요한 이미지와 컴포넌트 불러오기
import backImg from "../assets/images/back.png";
import Card from "./Card";

// 👇 [수정] c0 대신 emp(empty.png)를 불러옵니다.
import emp from "../assets/images/emp.png";

export default function Deck({ deck = [], waste = [], onFlip, onWastePress, selected }) {
  // 맨 위 버린 카드
  const topWaste = waste.length > 0 ? waste[waste.length - 1] : null;

  const isWasteSelected =
    selected &&
    selected.pile === "waste" &&
    selected.index === waste.length - 1;

  const handleWastePress = (card) => {
    if (onWastePress) {
      onWastePress({
        pile: "waste",
        index: waste.length - 1,
        card: card,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. 덱 (카드 뒷면 더미) */}
      <TouchableOpacity
        style={styles.cardSlot}
        onPress={onFlip}
        activeOpacity={deck.length > 0 ? 0.8 : 1}
      >
        {deck.length > 0 ? (
          // 카드가 있으면: 뒷면 이미지
          <Image source={backImg} style={styles.image} resizeMode="contain" />
        ) : (
          // 카드가 없으면: 빈 배경(emp) + 새로고침 아이콘
          <View style={styles.emptyContainer}>
            <Image source={emp} style={styles.baseImage} resizeMode="contain" />
            <View style={styles.overlay}>
              <Text style={styles.refreshIcon}>↺</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* 2. 버린 카드 더미 (오른쪽) */}
      <View style={styles.cardSlot}>
        {topWaste ? (
          // 카드가 있으면: 내 카드 컴포넌트 사용
          <Card
            card={topWaste}
            onPress={handleWastePress}
            isSelected={isWasteSelected}
          />
        ) : (
          // 👇 [수정] 카드가 없으면: emp 이미지 보여줌
          <Image source={emp} style={styles.baseImage} resizeMode="contain" />
        )}
      </View>
    </View>
  );
}

const CARD_W = 60;
const CARD_H = 90;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // 오른쪽 정렬
    paddingRight: 10,
    marginBottom: 10,
  },
  cardSlot: {
    width: CARD_W,
    height: CARD_H,
    marginLeft: 15, // 덱과 버린 카드 사이 간격
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  baseImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    opacity: 0.5,
  },
  emptyContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshIcon: {
    fontSize: 24,
    color: "black",
    fontWeight: "bold",
  },
});