import { findIndex, random } from 'lodash-es';

export const generateNewBoard = () => {
  const board = [random(0, 6), random(0, 6), random(0, 6)];
  if (board[1] !== 0 || board[2] !== 0) return board;
  return generateNewBoard();
};

export const isTheLastMoverTheWinner = true;

export const getGameStateAfterAiMove = (board) => {
  const oddPiles = [0, 1, 2].filter(i => board[i] % 2 === 1);

  if (oddPiles.length === 3 || oddPiles.length === 0) {
    board[findIndex(board, i => i > 0)] -= 1;
  }
  if (oddPiles.length === 2) {
    board[oddPiles[1]] -= 1;
    board[oddPiles[0]] += 1;
  }
  if (oddPiles.length === 1) {
    board[oddPiles[0]] -= 1;
  }
  return getGameStateAfterMove(board);
};

export const getGameStateAfterMove = (board) => {
  return { board, isGameEnd: isGameEnd(board) };
};

const isGameEnd = (board) => board[0] === 0 && board[1] === 0 && board[2] === 0;
