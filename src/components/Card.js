import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. 기본 이미지들 (공통)
import backImg from "../assets/images/back.png";
import selectedBorder from "../assets/images/selected_border.png";

//
// ====== [A] base 테마 카드 이미지 ======
//

// [Club - 클로버]
import c1 from "../assets/images/base/c/c1.png";
import c10 from "../assets/images/base/c/c10.png";
import c11 from "../assets/images/base/c/c11.png";
import c12 from "../assets/images/base/c/c12.png";
import c13 from "../assets/images/base/c/c13.png";
import c2 from "../assets/images/base/c/c2.png";
import c3 from "../assets/images/base/c/c3.png";
import c4 from "../assets/images/base/c/c4.png";
import c5 from "../assets/images/base/c/c5.png";
import c6 from "../assets/images/base/c/c6.png";
import c7 from "../assets/images/base/c/c7.png";
import c8 from "../assets/images/base/c/c8.png";
import c9 from "../assets/images/base/c/c9.png";

// [Heart - 하트]
import h1 from "../assets/images/base/h/h1.png";
import h10 from "../assets/images/base/h/h10.png";
import h11 from "../assets/images/base/h/h11.png";
import h12 from "../assets/images/base/h/h12.png";
import h13 from "../assets/images/base/h/h13.png";
import h2 from "../assets/images/base/h/h2.png";
import h3 from "../assets/images/base/h/h3.png";
import h4 from "../assets/images/base/h/h4.png";
import h5 from "../assets/images/base/h/h5.png";
import h6 from "../assets/images/base/h/h6.png";
import h7 from "../assets/images/base/h/h7.png";
import h8 from "../assets/images/base/h/h8.png";
import h9 from "../assets/images/base/h/h9.png";

// [Diamond - 다이아]
import d1 from "../assets/images/base/d/d1.png";
import d10 from "../assets/images/base/d/d10.png";
import d11 from "../assets/images/base/d/d11.png";
import d12 from "../assets/images/base/d/d12.png";
import d13 from "../assets/images/base/d/d13.png";
import d2 from "../assets/images/base/d/d2.png";
import d3 from "../assets/images/base/d/d3.png";
import d4 from "../assets/images/base/d/d4.png";
import d5 from "../assets/images/base/d/d5.png";
import d6 from "../assets/images/base/d/d6.png";
import d7 from "../assets/images/base/d/d7.png";
import d8 from "../assets/images/base/d/d8.png";
import d9 from "../assets/images/base/d/d9.png";

// [Spade - 스페이드]
import s1 from "../assets/images/base/s/s1.png";
import s10 from "../assets/images/base/s/s10.png";
import s11 from "../assets/images/base/s/s11.png";
import s12 from "../assets/images/base/s/s12.png";
import s13 from "../assets/images/base/s/s13.png";
import s2 from "../assets/images/base/s/s2.png";
import s3 from "../assets/images/base/s/s3.png";
import s4 from "../assets/images/base/s/s4.png";
import s5 from "../assets/images/base/s/s5.png";
import s6 from "../assets/images/base/s/s6.png";
import s7 from "../assets/images/base/s/s7.png";
import s8 from "../assets/images/base/s/s8.png";
import s9 from "../assets/images/base/s/s9.png";

//
// ====== [B] original 테마 카드 이미지 ======
//   (폴더 구조가 base와 똑같다고 가정)
//

// [Club - 클로버]
import oc1 from "../assets/images/original/c/c1.png";
import oc10 from "../assets/images/original/c/c10.png";
import oc11 from "../assets/images/original/c/c11.png";
import oc12 from "../assets/images/original/c/c12.png";
import oc13 from "../assets/images/original/c/c13.png";
import oc2 from "../assets/images/original/c/c2.png";
import oc3 from "../assets/images/original/c/c3.png";
import oc4 from "../assets/images/original/c/c4.png";
import oc5 from "../assets/images/original/c/c5.png";
import oc6 from "../assets/images/original/c/c6.png";
import oc7 from "../assets/images/original/c/c7.png";
import oc8 from "../assets/images/original/c/c8.png";
import oc9 from "../assets/images/original/c/c9.png";

// [Heart - 하트]
import oh1 from "../assets/images/original/h/h1.png";
import oh10 from "../assets/images/original/h/h10.png";
import oh11 from "../assets/images/original/h/h11.png";
import oh12 from "../assets/images/original/h/h12.png";
import oh13 from "../assets/images/original/h/h13.png";
import oh2 from "../assets/images/original/h/h2.png";
import oh3 from "../assets/images/original/h/h3.png";
import oh4 from "../assets/images/original/h/h4.png";
import oh5 from "../assets/images/original/h/h5.png";
import oh6 from "../assets/images/original/h/h6.png";
import oh7 from "../assets/images/original/h/h7.png";
import oh8 from "../assets/images/original/h/h8.png";
import oh9 from "../assets/images/original/h/h9.png";

// [Diamond - 다이아]
import od1 from "../assets/images/original/d/d1.png";
import od10 from "../assets/images/original/d/d10.png";
import od11 from "../assets/images/original/d/d11.png";
import od12 from "../assets/images/original/d/d12.png";
import od13 from "../assets/images/original/d/d13.png";
import od2 from "../assets/images/original/d/d2.png";
import od3 from "../assets/images/original/d/d3.png";
import od4 from "../assets/images/original/d/d4.png";
import od5 from "../assets/images/original/d/d5.png";
import od6 from "../assets/images/original/d/d6.png";
import od7 from "../assets/images/original/d/d7.png";
import od8 from "../assets/images/original/d/d8.png";
import od9 from "../assets/images/original/d/d9.png";

// [Spade - 스페이드]
import os1 from "../assets/images/original/s/s1.png";
import os10 from "../assets/images/original/s/s10.png";
import os11 from "../assets/images/original/s/s11.png";
import os12 from "../assets/images/original/s/s12.png";
import os13 from "../assets/images/original/s/s13.png";
import os2 from "../assets/images/original/s/s2.png";
import os3 from "../assets/images/original/s/s3.png";
import os4 from "../assets/images/original/s/s4.png";
import os5 from "../assets/images/original/s/s5.png";
import os6 from "../assets/images/original/s/s6.png";
import os7 from "../assets/images/original/s/s7.png";
import os8 from "../assets/images/original/s/s8.png";
import os9 from "../assets/images/original/s/s9.png";

export default function Card({ card, onPress, isSelected }) {
  // ⭐ 카드 스킨 테마 (base / original) – AsyncStorage에서 읽어옴
  const [theme, setTheme] = useState("base");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("card_theme");
        if (saved) setTheme(saved);
      } catch (e) {
        // 실패하면 그냥 base 유지
      }
    };
    loadTheme();
  }, []);

  const handlePress = () => {
    if (!card.faceUp) return;
    onPress && onPress(card);
  };

  const getSuitCode = (suit) => {
    const s = suit.toLowerCase();
    if (s === "♣" || s.includes("club") || s.includes("c")) return "c";
    if (s === "♥" || s.includes("heart") || s.includes("h")) return "h";
    if (s === "♦" || s.includes("dia") || s.includes("d")) return "d";
    if (s === "♠" || s.includes("spade") || s.includes("s")) return "s";
    return suit;
  };

  const getRankNumber = (num) => {
    const n = String(num);
    if (n === "A") return 1;
    if (n === "J") return 11;
    if (n === "Q") return 12;
    if (n === "K") return 13;
    return parseInt(n);
  };

  // ⚙ base / original 두 세트 준비
  const baseImageMap = {
    c: { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6, 7: c7, 8: c8, 9: c9, 10: c10, 11: c11, 12: c12, 13: c13 },
    h: { 1: h1, 2: h2, 3: h3, 4: h4, 5: h5, 6: h6, 7: h7, 8: h8, 9: h9, 10: h10, 11: h11, 12: h12, 13: h13 },
    d: { 1: d1, 2: d2, 3: d3, 4: d4, 5: d5, 6: d6, 7: d7, 8: d8, 9: d9, 10: d10, 11: d11, 12: d12, 13: d13 },
    s: { 1: s1, 2: s2, 3: s3, 4: s4, 5: s5, 6: s6, 7: s7, 8: s8, 9: s9, 10: s10, 11: s11, 12: s12, 13: s13 }
  };

  const originalImageMap = {
    c: { 1: oc1, 2: oc2, 3: oc3, 4: oc4, 5: oc5, 6: oc6, 7: oc7, 8: oc8, 9: oc9, 10: oc10, 11: oc11, 12: oc12, 13: oc13 },
    h: { 1: oh1, 2: oh2, 3: oh3, 4: oh4, 5: oh5, 6: oh6, 7: oh7, 8: oh8, 9: oh9, 10: oh10, 11: oh11, 12: oh12, 13: oh13 },
    d: { 1: od1, 2: od2, 3: od3, 4: od4, 5: od5, 6: od6, 7: od7, 8: od8, 9: od9, 10: od10, 11: od11, 12: od12, 13: od13 },
    s: { 1: os1, 2: os2, 3: os3, 4: os4, 5: os5, 6: os6, 7: os7, 8: os8, 9: os9, 10: os10, 11: os11, 12: os12, 13: os13 }
  };

  const suitCode = getSuitCode(card.suit);
  const rankNum = getRankNumber(card.num);

  // 현재 테마 기준 이미지 맵 선택
  const currentMap = theme === "original" ? originalImageMap : baseImageMap;
  const cardImageSource = currentMap[suitCode] && currentMap[suitCode][rankNum];

  // 이미지가 존재하는지 확인
  const hasImage = (card.faceUp && cardImageSource) || !card.faceUp;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={handlePress}
      style={[styles.card, !hasImage && styles.textCard]}
    >
      {/* 앞/뒷면 이미지 뒤에 흰 배경 한 겹 */}
      {hasImage && <View style={styles.shrunkBackground} />}

      {/* 카드 내용 */}
      {card.faceUp ? (
        cardImageSource ? (
          <Image source={cardImageSource} style={styles.fullImage} resizeMode="stretch" />
        ) : (
          <Text style={[styles.text, { color: card.color }]}>
            {card.suit} {card.num}
          </Text>
        )
      ) : (
        <Image source={backImg} style={styles.fullImage} resizeMode="stretch" />
      )}

      {/* 선택 테두리 */}
      {isSelected && (
        <Image
          source={selectedBorder}
          style={styles.overlayImage}
          resizeMode="stretch"
          pointerEvents="none"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 49,
    height: 70,
    borderRadius: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  textCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0"
  },
  shrunkBackground: {
    position: "absolute",
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
    backgroundColor: "#ffffff",
    zIndex: -1
  },
  fullImage: {
    width: "100%",
    height: "100%"
  },
  overlayImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 99
  },
  text: {
    fontSize: 20,
    fontWeight: "bold"
  }
});