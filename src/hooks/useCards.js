import { useEffect, useState } from 'react';

// 카드 덱 생성 헬퍼 함수
const createDeck = () => {
  const suits = ['c', 'h', 'd', 's'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let deck = [];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      // 색상 결정 (하트, 다이아는 red)
      const color = (suit === 'h' || suit === 'd') ? 'red' : 'black';
      deck.push({
        id: `${suit}${rank}`, // 고유 ID
        suit,
        num: rank,
        color,
        faceUp: false, // 기본은 뒷면
      });
    });
  });
  return deck;
};

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// 👇 이름을 useCards로 변경했습니다.
export default function useCards() {
  // --- 상태 관리 (State) ---
  const [deck, setDeck] = useState([]);           // 덱 (남은 카드)
  const [waste, setWaste] = useState([]);         // 버린 카드 더미
  const [foundations, setFoundations] = useState({ c: [], h: [], d: [], s: [] }); // 완성 덱
  const [columns, setColumns] = useState([], [], [], [], [], [], []); // 7개 컬럼
  const [selected, setSelected] = useState(null); // 현재 선택된 카드 정보 { pile, index, card }

  // --- 게임 초기화 ---
  const initializeGame = () => {
    const newDeck = shuffle(createDeck());
    const newColumns = [[], [], [], [], [], [], []];

    // 카드 배분 (1열 1장, 2열 2장 ...)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = newDeck.pop();
        if (j === i) card.faceUp = true; // 맨 위 카드는 앞면
        newColumns[i].push(card);
      }
    }

    setColumns(newColumns);
    setDeck(newDeck);
    setWaste([]);
    setFoundations({ c: [], h: [], d: [], s: [] });
    setSelected(null);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // --- 룰 검사 (이동 가능한지?) ---
  const canMoveToColumn = (card, targetColumn) => {
    // 1. 빈 컬럼에는 'K'만 올 수 있음
    if (targetColumn.length === 0) {
      return card.num === 'K';
    }
    
    // 2. 카드가 있다면? (색깔은 다르고, 숫자는 1 작아야 함)
    const targetCard = targetColumn[targetColumn.length - 1];
    
    // 숫자 변환 헬퍼 (A=1, J=11...)
    const getVal = (n) => {
      if (n === 'A') return 1;
      if (n === 'J') return 11;
      if (n === 'Q') return 12;
      if (n === 'K') return 13;
      return parseInt(n);
    };

    const cardVal = getVal(card.num);
    const targetVal = getVal(targetCard.num);

    return (card.color !== targetCard.color) && (targetVal === cardVal + 1);
  };

  const canMoveToFoundation = (card, suit) => {
    const pile = foundations[suit];
    // 1. 빈 파운데이션엔 'A'만 가능
    if (pile.length === 0) {
      return card.num === 'A' && card.suit === suit;
    }
    
    // 2. 같은 무늬, 숫자 +1 이어야 함
    const topCard = pile[pile.length - 1];
    
    const getVal = (n) => {
        if (n === 'A') return 1;
        if (n === 'J') return 11;
        if (n === 'Q') return 12;
        if (n === 'K') return 13;
        return parseInt(n);
    };

    return (card.suit === suit) && (getVal(card.num) === getVal(topCard.num) + 1);
  };

  // --- 액션 핸들러 (터치 로직) ---

  // 1. 컬럼(테이블) 터치
  const handleColumnPress = (colIndex, cardIndex) => {
    const clickedCard = columns[colIndex][cardIndex];

    // 뒷면인 카드는 선택 불가
    if (!clickedCard.faceUp) return;

    // A. 선택된 카드가 없을 때 -> 선택하기
    if (!selected) {
      setSelected({ pile: 'column', colIndex, cardIndex, card: clickedCard });
      return;
    }

    // B. 이미 선택된 카드가 있을 때 -> 이동 시도
    // 같은 카드를 또 누르면 선택 해제
    if (selected.pile === 'column' && selected.colIndex === colIndex && selected.cardIndex === cardIndex) {
      setSelected(null);
      return;
    }

    // 이동 로직 (선택된 카드 -> 지금 누른 컬럼으로)
    if (canMoveToColumn(selected.card, columns[colIndex])) {
        moveCard(selected, { pile: 'column', colIndex });
    } else {
        // 이동 불가능하면 새로운 카드로 선택 변경
        setSelected({ pile: 'column', colIndex, cardIndex, card: clickedCard });
    }
  };

  // 2. 파운데이션(완성덱) 터치
  const handleFoundationPress = (suit) => {
    if (!selected) return; // 파운데이션은 이동 목적지로만 사용 (여기선 꺼내오기 구현 안함)

    if (canMoveToFoundation(selected.card, suit)) {
      moveCard(selected, { pile: 'foundation', suit });
    }
  };

  // 3. 덱 뒤집기
  const handleDeckFlip = () => {
    if (deck.length === 0) {
      // 덱이 비었으면 waste를 다시 덱으로 (순서 뒤집어서)
      if (waste.length > 0) {
        const newDeck = [...waste].reverse().map(c => ({ ...c, faceUp: false }));
        setDeck(newDeck);
        setWaste([]);
      }
    } else {
      // 덱에서 한 장 꺼내서 waste로
      const newDeck = [...deck];
      const card = newDeck.pop();
      card.faceUp = true;
      setDeck(newDeck);
      setWaste([...waste, card]);
    }
    setSelected(null); // 덱 뒤집으면 선택 해제
  };

  // 4. 버린 카드(Waste) 터치
  const handleWastePress = () => {
    if (waste.length === 0) return;
    const card = waste[waste.length - 1];

    if (!selected) {
      setSelected({ pile: 'waste', card });
    } else if (selected.pile === 'waste') {
      setSelected(null);
    } else {
      setSelected({ pile: 'waste', card });
    }
  };

  // --- 실제 이동 실행 함수 ---
  const moveCard = (from, to) => {
    const newColumns = [...columns];
    const newFoundations = { ...foundations };
    const newWaste = [...waste];
    
    let movingCards = [];

    // 1. 소스(원래 위치)에서 카드 빼기
    if (from.pile === 'column') {
      // 컬럼에서는 해당 카드와 그 아래 카드를 통째로 잘라냄
      movingCards = newColumns[from.colIndex].splice(from.cardIndex);
      
      // 원래 자리에 남은 카드가 있으면 맨 위 카드를 뒤집어줌(faceUp)
      if (newColumns[from.colIndex].length > 0) {
        newColumns[from.colIndex][newColumns[from.colIndex].length - 1].faceUp = true;
      }
    } else if (from.pile === 'waste') {
      movingCards = [newWaste.pop()];
    }

    // 2. 타겟(목적지)에 카드 넣기
    if (to.pile === 'column') {
      newColumns[to.colIndex].push(...movingCards);
    } else if (to.pile === 'foundation') {
      newFoundations[to.suit].push(movingCards[0]);
    }

    // 3. 상태 업데이트
    setColumns(newColumns);
    setFoundations(newFoundations);
    setWaste(newWaste);
    setSelected(null); // 이동 후 선택 해제
  };

  return {
    deck,
    waste,
    foundations,
    columns,
    selected,
    handleColumnPress,
    handleFoundationPress,
    handleDeckFlip,
    handleWastePress,
    initializeGame
  };
}