import { findIndex } from 'lodash';

export const aiBotStrategy = ({ board, moves }) => {
  const oddPiles = [1, 2, 3].filter(i => board[i - 1] % 2 === 1);

  if (oddPiles.length === 3 || oddPiles.length === 0) {
    const valueToRemove = findIndex(board, i => i > 0) + 1;
    moves.removeCoin(board, valueToRemove);
  }
  if (oddPiles.length === 2) {
    const { nextBoard } = moves.removeCoin(board, oddPiles[1]);
    setTimeout(() => {
      moves.addCoin(nextBoard, oddPiles[0]);
    }, 750)
  }
  if (oddPiles.length === 1) {
    moves.removeCoin(board, oddPiles[0]);
  }
};
