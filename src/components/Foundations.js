import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. 내 카드 컴포넌트 불러오기
import Card from "./Card";

// 2. base 테마용 빈 슬롯 이미지
import c0 from "../assets/images/base/c/c0.png";
import d0 from "../assets/images/base/d/d0.png";
import h0 from "../assets/images/base/h/h0.png";
import s0 from "../assets/images/base/s/s0.png";

// 3. original 테마용 빈 슬롯 이미지
import oc0 from "../assets/images/original/c/c0.png";
import od0 from "../assets/images/original/d/d0.png";
import oh0 from "../assets/images/original/h/h0.png";
import os0 from "../assets/images/original/s/s0.png";

export default function Foundations({ foundations, onPress, selected }) {
  // 카드 테마 (base / original)
  const [theme, setTheme] = useState("base");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("card_theme");
        if (saved) setTheme(saved);
      } catch (e) {}
    };
    loadTheme();
  }, []);

  // 테마에 따라 사용할 플레이스홀더 배열 선택
  const placeholdersBase = [c0, d0, h0, s0];
  const placeholdersOriginal = [oc0, od0, os0, oh0];
  const placeholders = theme === "original" ? placeholdersOriginal : placeholdersBase;

  return (
    <View style={styles.row}>
      {foundations.map((pile, index) => {
        const top = pile.length > 0 ? pile[pile.length - 1] : null;

        const isSelected =
          selected &&
          selected.pile === "foundation" &&
          selected.foundationIndex === index;

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
                card: top
              })
            }
            activeOpacity={top ? 0.8 : 1}
          >
            {top ? (
              <Card
                card={top}
                onPress={() =>
                  onPress &&
                  onPress({
                    pile: "foundation",
                    foundationIndex: index,
                    card: top
                  })
                }
                isSelected={isSelected}
              />
            ) : (
              <Image source={bgImage} style={styles.baseImage} resizeMode="contain" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const CARD_W = 49;
const CARD_H = 70;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    paddingLeft: 10
  },
  slot: {
    width: CARD_W,
    height: CARD_H,
    marginRight: 7,
    justifyContent: "center",
    alignItems: "center"
  },
  baseImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5
  }
});