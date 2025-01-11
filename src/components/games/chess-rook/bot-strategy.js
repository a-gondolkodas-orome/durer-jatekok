'use strict';

import { last, random, cloneDeep } from 'lodash';
import { markVisitedFields, getAllowedMoves } from './helpers';

export const getGameStateAfterAiTurn = ({ board }) => {
  const aiMove = getOptimalAiMove(board);
  return getGameStateAfterMove(board, aiMove);
};

export const getGameStateAfterMove = (board, { row, col }) => {
  const nextBoard = cloneDeep(board);
  markVisitedFields(nextBoard, nextBoard.rookPosition, { row, col });

  nextBoard.chessBoard[row][col] = 'rook';
  nextBoard.rookPosition = { row, col };

  return { nextBoard, isGameEnd: getAllowedMoves(nextBoard).length === 0, winnerIndex: null };
};

const getOptimalAiMove = (board) => {
  const { row, col } = board.rookPosition;

  const allowedHorizontalMoves = [];
  let i = 1;
  while (col - i >= 0 && board.chessBoard[row ][col - i] === null) {
    allowedHorizontalMoves.push({ row, col: col - i });
    i += 1;
  }
  i = 1;
  while (col + i <= 7 && board.chessBoard[row][col + i] === null) {
    allowedHorizontalMoves.push({ row, col: col + i });
    i += 1;
  }

  const allowedVerticalMoves = [];
  i = 1;
  while (row - i >= 0 && board.chessBoard[(row - i)][col] === null) {
    allowedVerticalMoves.push({ row: row - i, col });
    i += 1;
  }
  i = 1;
  while (row + i <= 7 && board.chessBoard[(row + i)][col] === null) {
    allowedVerticalMoves.push({ row: row + i, col });
    i += 1;
  }

  if (allowedHorizontalMoves.length < allowedVerticalMoves.length) {
    return last(allowedVerticalMoves);
  } else if (allowedHorizontalMoves.length > allowedVerticalMoves.length) {
    return last(allowedHorizontalMoves);
  }
  if (random(0, 1) === 1) {
    return last(allowedHorizontalMoves);
  } else {
    return last(allowedVerticalMoves);
  }
};
