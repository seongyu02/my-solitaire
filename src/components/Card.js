import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

// 👇👇👇 [중요] 이 줄이 없어서 에러가 났던 겁니다! 👇👇👇
import backImg from '../assets/images/back.png';

// [Club - 클로버]
import c1 from '../assets/images/c/c1.png';
import c10 from '../assets/images/c/c10.png';
import c11 from '../assets/images/c/c11.png';
import c12 from '../assets/images/c/c12.png';
import c13 from '../assets/images/c/c13.png';
import c2 from '../assets/images/c/c2.png';
import c3 from '../assets/images/c/c3.png';
import c4 from '../assets/images/c/c4.png';
import c5 from '../assets/images/c/c5.png';
import c6 from '../assets/images/c/c6.png';
import c7 from '../assets/images/c/c7.png';
import c8 from '../assets/images/c/c8.png';
import c9 from '../assets/images/c/c9.png';

// [Heart - 하트]
import h1 from '../assets/images/h/h1.png';
import h10 from '../assets/images/h/h10.png';
import h11 from '../assets/images/h/h11.png';
import h12 from '../assets/images/h/h12.png';
import h13 from '../assets/images/h/h13.png';
import h2 from '../assets/images/h/h2.png';
import h3 from '../assets/images/h/h3.png';
import h4 from '../assets/images/h/h4.png';
import h5 from '../assets/images/h/h5.png';
import h6 from '../assets/images/h/h6.png';
import h7 from '../assets/images/h/h7.png';
import h8 from '../assets/images/h/h8.png';
import h9 from '../assets/images/h/h9.png';

// [Diamond - 다이아]
import d1 from '../assets/images/d/d1.png';
import d10 from '../assets/images/d/d10.png';
import d11 from '../assets/images/d/d11.png';
import d12 from '../assets/images/d/d12.png';
import d13 from '../assets/images/d/d13.png';
import d2 from '../assets/images/d/d2.png';
import d3 from '../assets/images/d/d3.png';
import d4 from '../assets/images/d/d4.png';
import d5 from '../assets/images/d/d5.png';
import d6 from '../assets/images/d/d6.png';
import d7 from '../assets/images/d/d7.png';
import d8 from '../assets/images/d/d8.png';
import d9 from '../assets/images/d/d9.png';

// [Spade - 스페이드]
import s1 from '../assets/images/s/s1.png';
import s10 from '../assets/images/s/s10.png';
import s11 from '../assets/images/s/s11.png';
import s12 from '../assets/images/s/s12.png';
import s13 from '../assets/images/s/s13.png';
import s2 from '../assets/images/s/s2.png';
import s3 from '../assets/images/s/s3.png';
import s4 from '../assets/images/s/s4.png';
import s5 from '../assets/images/s/s5.png';
import s6 from '../assets/images/s/s6.png';
import s7 from '../assets/images/s/s7.png';
import s8 from '../assets/images/s/s8.png';
import s9 from '../assets/images/s/s9.png';

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

  const isImageVisible = card.faceUp && cardImageSource;
  const isBackImageVisible = !card.faceUp;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        // 이미지가 보일 때는 투명 배경
        (isImageVisible || isBackImageVisible) && styles.transparentContainer
      ]}
    >
      {card.faceUp ? (
        // [앞면]
        cardImageSource ? (
          <Image 
            source={cardImageSource} 
            style={styles.fullImage} 
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.text, { color: card.color }]}>
            {card.suit} {card.num}
          </Text>
        )
      ) : (
        // [뒷면] 여기에서 backImg를 사용합니다
        <Image 
          source={backImg} 
          style={styles.fullImage} 
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 49,
    height: 70,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    overflow: "hidden",
    margin: 2, 
  },
  transparentContainer: {
    backgroundColor: 'transparent', 
    borderWidth: 0,                 
    borderColor: 'transparent',
    overflow: 'visible',            
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold"
  },
  selectedCard: {
    borderColor: "#ffcc33",
    borderWidth: 2
  }
});