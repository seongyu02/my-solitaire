import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

// 1. 내 카드 컴포넌트 불러오기
import Card from "./Card";

// 2. 빈 슬롯 이미지 (c0, d0, h0, s0) 불러오기
import c0 from "../assets/images/c/c0.png";
import d0 from "../assets/images/d/d0.png";
import h0 from "../assets/images/h/h0.png";
import s0 from "../assets/images/s/s0.png";

export default function Foundations({ foundations, onPress, selected }) {
  // 인덱스 순서대로 배경 이미지 지정 (클로버, 다이아, 하트, 스페이드 순)
  // 게임 로직에 따라 순서를 바꾸셔도 됩니다 (예: [h0, c0, d0, s0])
  const placeholders = [c0, d0, h0, s0];

  return (
    <View style={styles.row}>
      {foundations.map((pile, index) => {
        // 맨 위 카드 가져오기
        const top = pile.length > 0 ? pile[pile.length - 1] : null;

        const isSelected =
          selected &&
          selected.pile === "foundation" &&
          selected.foundationIndex === index;

        // 해당 인덱스의 배경 이미지 가져오기 (0->c0, 1->d0 ...)
        // 만약 foundations가 4개보다 많으면 안전하게 모듈러 연산 사용
        const bgImage = placeholders[index % placeholders.length];

        return (
          <TouchableOpacity
            key={index}
            style={styles.slot}
            onPress={() =>
              onPress &&
              onPress({
                pile: "foundation",
                foundationIndex: index,
                card: top,
              })
            }
            activeOpacity={top ? 0.8 : 1}
          >
            {top ? (
              // 1. 카드가 있으면: 내 카드 컴포넌트 사용
              <Card
                card={top}
                onPress={() =>
                  onPress &&
                  onPress({
                    pile: "foundation",
                    foundationIndex: index,
                    card: top,
                  })
                }
                isSelected={isSelected}
              />
            ) : (
              // 2. 카드가 없으면: c0, d0, h0, s0 이미지 표시
              <Image source={bgImage} style={styles.baseImage} resizeMode="contain" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Card.js, Deck.js와 크기를 맞춰줍니다 (60 x 90)
const CARD_W = 49;
const CARD_H = 70;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start", // 왼쪽 정렬 (일반적으로 파운데이션이 왼쪽이나 위쪽에 위치)
    marginBottom: 10,
    paddingLeft: 10, // 왼쪽 여백
  },
  slot: {
    width: CARD_W,
    height: CARD_H,
    marginRight: 7, // 슬롯 사이 간격
    justifyContent: "center",
    alignItems: "center",
    // 기존의 흰색 배경과 테두리는 이미지로 대체되므로 제거하거나 투명하게 변경
  },
  baseImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5, // 빈 칸은 약간 흐리게
  },
});