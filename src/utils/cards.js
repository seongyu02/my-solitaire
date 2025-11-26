// 문양과 숫자 조합으로 52장 카드 생성
export const suits = ["♠", "♥", "♦", "♣"];
export const numbers = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K"
];

export const generateDeck = () => {
  let deck = [];
  suits.forEach((suit) => {
    numbers.forEach((num, index) => {
      deck.push({
        id: suit + num, // 카드 고유 id
        suit,           // 문양
        num,            // A,2,3...K
        value: index + 1, // 숫자 값 (A=1, K=13)
        color: suit === "♥" || suit === "♦" ? "red" : "black", // 색
        faceUp: false   // 앞면/뒷면 여부
      });
    });
  });
  return deck;
};