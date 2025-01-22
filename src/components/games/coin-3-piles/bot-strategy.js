import { findIndex } from 'lodash';
import { isGameEnd } from './helpers';

export const getGameStateAfterAiTurn = ({ board }) => {
  const nextBoard = [...board];
  const oddPiles = [0, 1, 2].filter(i => nextBoard[i] % 2 === 1);

  if (oddPiles.length === 3 || oddPiles.length === 0) {
    nextBoard[findIndex(nextBoard, i => i > 0)] -= 1;
  }
  if (oddPiles.length === 2) {
    nextBoard[oddPiles[1]] -= 1;
    nextBoard[oddPiles[0]] += 1;
  }
  if (oddPiles.length === 1) {
    nextBoard[oddPiles[0]] -= 1;
  }
  return { nextBoard, isGameEnd: isGameEnd(nextBoard), winnerIndex: null };
};
