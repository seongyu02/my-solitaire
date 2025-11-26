// src/game/rules.js
// 클론다이크 솔리테어 규칙 helper 함수들

// 연속된 카드들이 "내림차순 + 색 번갈아"로 잘 되어 있는지 체크
export function isValidSequence(cards) {
  if (!cards || cards.length === 0) return false;
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i];
    const b = cards[i + 1];

    if (!a.faceUp || !b.faceUp) return false;
    if (a.color === b.color) return false;     // 색이 같으면 안 됨
    if (a.num !== b.num + 1) return false;     // 숫자는 1씩 내려가야 함
  }
  return true;
}

// 테이블(컬럼)에 시퀀스를 옮길 수 있는지 체크
export function canMoveToTableau(sequence, destColumn) {
  if (!sequence || sequence.length === 0) return false;

  const firstCard = sequence[0];
  if (!firstCard.faceUp) return false;

  // 빈 컬럼에는 킹만 올 수 있음
  if (!destColumn || destColumn.length === 0) {
    return firstCard.num === 13;
  }

  const target = destColumn[destColumn.length - 1];

  // 목적지 맨 위 카드가 앞면이고, 색이 다르고, 숫자가 1 크면 OK
  return (
    target.faceUp &&
    target.color !== firstCard.color &&
    target.num === firstCard.num + 1
  );
}

// 파운데이션(완성 칸)으로 옮길 수 있는지 체크
export function canMoveToFoundation(card, foundationPile) {
  if (!card || !card.faceUp) return false;

  // 비어 있으면 A만 올 수 있음
  if (!foundationPile || foundationPile.length === 0) {
    return card.num === 1;
  }

  const top = foundationPile[foundationPile.length - 1];

  // 같은 무늬, 숫자는 1씩 증가
  return top.suit === card.suit && card.num === top.num + 1;
}

// 승리 체크: 4개의 파운데이션에 13장씩 쌓이면 승리
export function isGameWon(foundations) {
  if (!foundations || foundations.length !== 4) return false;
  return foundations.every((pile) => pile.length === 13);
}