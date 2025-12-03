import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. 기본 이미지들
import backImg from '../assets/images/back.png';

// 테두리 이미지
import selectedBorder from '../assets/images/selected_border.png';

// [Club - 클로버]
import c1 from '../assets/images/base/c/c1.png';
import c10 from '../assets/images/base/c/c10.png';
import c11 from '../assets/images/base/c/c11.png';
import c12 from '../assets/images/base/c/c12.png';
import c13 from '../assets/images/base/c/c13.png';
import c2 from '../assets/images/base/c/c2.png';
import c3 from '../assets/images/base/c/c3.png';
import c4 from '../assets/images/base/c/c4.png';
import c5 from '../assets/images/base/c/c5.png';
import c6 from '../assets/images/base/c/c6.png';
import c7 from '../assets/images/base/c/c7.png';
import c8 from '../assets/images/base/c/c8.png';
import c9 from '../assets/images/base/c/c9.png';

// [Heart - 하트]
import h1 from '../assets/images/base/h/h1.png';
import h10 from '../assets/images/base/h/h10.png';
import h11 from '../assets/images/base/h/h11.png';
import h12 from '../assets/images/base/h/h12.png';
import h13 from '../assets/images/base/h/h13.png';
import h2 from '../assets/images/base/h/h2.png';
import h3 from '../assets/images/base/h/h3.png';
import h4 from '../assets/images/base/h/h4.png';
import h5 from '../assets/images/base/h/h5.png';
import h6 from '../assets/images/base/h/h6.png';
import h7 from '../assets/images/base/h/h7.png';
import h8 from '../assets/images/base/h/h8.png';
import h9 from '../assets/images/base/h/h9.png';

// [Diamond - 다이아]
import d1 from '../assets/images/base/d/d1.png';
import d10 from '../assets/images/base/d/d10.png';
import d11 from '../assets/images/base/d/d11.png';
import d12 from '../assets/images/base/d/d12.png';
import d13 from '../assets/images/base/d/d13.png';
import d2 from '../assets/images/base/d/d2.png';
import d3 from '../assets/images/base/d/d3.png';
import d4 from '../assets/images/base/d/d4.png';
import d5 from '../assets/images/base/d/d5.png';
import d6 from '../assets/images/base/d/d6.png';
import d7 from '../assets/images/base/d/d7.png';
import d8 from '../assets/images/base/d/d8.png';
import d9 from '../assets/images/base/d/d9.png';

// [Spade - 스페이드]
import s1 from '../assets/images/base/s/s1.png';
import s10 from '../assets/images/base/s/s10.png';
import s11 from '../assets/images/base/s/s11.png';
import s12 from '../assets/images/base/s/s12.png';
import s13 from '../assets/images/base/s/s13.png';
import s2 from '../assets/images/base/s/s2.png';
import s3 from '../assets/images/base/s/s3.png';
import s4 from '../assets/images/base/s/s4.png';
import s5 from '../assets/images/base/s/s5.png';
import s6 from '../assets/images/base/s/s6.png';
import s7 from '../assets/images/base/s/s7.png';
import s8 from '../assets/images/base/s/s8.png';
import s9 from '../assets/images/base/s/s9.png';

export default function Card({ card, onPress, isSelected }) {
  const handlePress = () => {
    if (!card.faceUp) return;
    onPress && onPress(card);
  };

  const getSuitCode = (suit) => {
    const s = suit.toLowerCase();
    if (s === '♣' || s.includes('club') || s.includes('c')) return 'c';
    if (s === '♥' || s.includes('heart') || s.includes('h')) return 'h';
    if (s === '♦' || s.includes('dia') || s.includes('d')) return 'd';
    if (s === '♠' || s.includes('spade') || s.includes('s')) return 's';
    return suit; 
  };

  const getRankNumber = (num) => {
    const n = String(num);
    if (n === 'A') return 1;
    if (n === 'J') return 11;
    if (n === 'Q') return 12;
    if (n === 'K') return 13;
    return parseInt(n);
  };

  const imageMap = {
    c: { 1:c1, 2:c2, 3:c3, 4:c4, 5:c5, 6:c6, 7:c7, 8:c8, 9:c9, 10:c10, 11:c11, 12:c12, 13:c13 },
    h: { 1:h1, 2:h2, 3:h3, 4:h4, 5:h5, 6:h6, 7:h7, 8:h8, 9:h9, 10:h10, 11:h11, 12:h12, 13:h13 },
    d: { 1:d1, 2:d2, 3:d3, 4:d4, 5:d5, 6:d6, 7:d7, 8:d8, 9:d9, 10:d10, 11:d11, 12:d12, 13:d13 },
    s: { 1:s1, 2:s2, 3:s3, 4:s4, 5:s5, 6:s6, 7:s7, 8:s8, 9:s9, 10:s10, 11:s11, 12:s12, 13:s13 },
  };

  const suitCode = getSuitCode(card.suit);
  const rankNum = getRankNumber(card.num);
  const cardImageSource = imageMap[suitCode] && imageMap[suitCode][rankNum];

  // 이미지가 존재하는지 확인 (앞면 이미지 존재 OR 뒷면인 경우)
  const hasImage = (card.faceUp && cardImageSource) || (!card.faceUp);

  return (
    <TouchableOpacity
      // 누를 때 투명도 50%
      activeOpacity={0.5} 
      onPress={handlePress}
      style={[
        styles.card,
        // 텍스트 카드일 때만 전체 흰색 배경 + 테두리 적용
        !hasImage && styles.textCard,
      ]}
    >
      {/* ★ [핵심 수정] 이미지가 있을 때만 뒤에 '축소된 흰색 배경'을 깝니다.
        top, left, right, bottom을 1씩 줘서 안쪽으로 숨깁니다.
      */}
      {hasImage && <View style={styles.shrunkBackground} />}

      {/* 2. 카드 내용 (앞면/뒷면) */}
      {card.faceUp ? (
        // [앞면]
        cardImageSource ? (
          <Image 
            source={cardImageSource} 
            style={styles.fullImage} 
            resizeMode="stretch" 
          />
        ) : (
          <Text style={[styles.text, { color: card.color }]}>
            {card.suit} {card.num}
          </Text>
        )
      ) : (
        // [뒷면]
        <Image 
          source={backImg} 
          style={styles.fullImage} 
          resizeMode="stretch"
        />
      )}

      {/* 3. 선택 효과 (테두리 이미지) */}
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
    // 49 x 70 크기
    width: 49,
    height: 70,
    borderRadius: 0,
    
    // 기본 배경 투명 (이미지 가장자리 빈 공간에 바닥색이 보이도록)
    backgroundColor: 'transparent',
    
    overflow: "hidden", 
    justifyContent: "center",
    alignItems: "center",
  },
  
  // 이미지가 없을 때(텍스트 카드) 적용할 스타일
  textCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },

  // ★ [추가] 축소된 흰색 배경 (이미지 뒤 비침 방지용)
  shrunkBackground: {
    position: 'absolute',
    top: 1,    // 위에서 1px 띄움
    bottom: 1, // 아래에서 1px 띄움
    left: 1,   // 왼쪽에서 1px 띄움
    right: 1,  // 오른쪽에서 1px 띄움
    backgroundColor: '#ffffff',
    zIndex: -1, // 이미지 뒤로 보냄
  },

  fullImage: {
    // 다시 100%로 복구 (확대 X)
    width: "100%",
    height: "100%",
  },
  
  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 99, 
  },
  
  text: {
    fontSize: 20,
    fontWeight: "bold"
  },
});
