import { generateDeck } from "../utils/cards";

// 카드 셔플 함수
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const initGame = () => {
  const deck = shuffle(generateDeck());

  // 7개의 컬럼(테이블)
  const columns = [...Array(7)].map(() => []);

  let index = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[index];
      // 각 컬럼의 마지막 카드만 앞면
      card.faceUp = row === col;
      columns[col].push(card);
      index++;
    }
  }

  const restDeck = deck.slice(index);

  return {
    columns,                      // 테이블 카드들
    deck: restDeck,               // 덱(아직 안 뒤집힌 카드)
    waste: [],                    // 덱에서 뒤집힌 카드
    foundations: [[], [], [], []],// 4개의 파운데이션 칸
    moves: 0                      // 이동 횟수
  };
};