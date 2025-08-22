export const [Sheriff, Thief] = [0, 1];

export const hasWinningTriple = (thiefCards) => {
  const thiefCardsSort = thiefCards.slice().sort((a, b) => a - b);
  const cardCount = thiefCards.length;
  if (cardCount < 3) return false;
  for (let a = 0; a < (cardCount - 2); a++) {
    for (let b = a + 1; b < (cardCount - 1); b++) {
      for (let c = b + 1; c < (cardCount); c++) {
        const valA = thiefCardsSort[a];
        const valB = thiefCardsSort[b];
        const valC = thiefCardsSort[c];
        if (valA + valC === 2 * valB) {
          return true;
        }
      }
    }
  }
  return false;
}
