'use strict';

import { sum, isEqual, cloneDeep, random } from 'lodash-es';
import { getOptimalTileIndex, getOptimalTileIndices } from './ai-step';

export const generateNewBoard = () => {
  const board = Array(5).fill(0);
  const x = random(4);
  board[x] += 1;
  return board;
};

export const getGameStateAfterAiMove = (board, isPlayerTheFirstToMove) => {
  if(isPlayerTheFirstToMove){
    const tileIndices = getOptimalTileIndices(board);
    board[tileIndices[0]] += 1;
    return getGameStateAfterMove(board, tileIndices[1]);
  }
  else{
    const tileIndex = getOptimalTileIndex(board);
    return getGameStateAfterMove(board, tileIndex);
  }
};

export const getGameStateAfterMove = (board, tileIndex) => {
  const boardForStep = cloneDeep(board);
  boardForStep[tileIndex] = boardForStep[tileIndex] + 1;
  return {
    board: boardForStep,
    isGameEnd: sum(boardForStep) >= 10,
    hasFirstPlayerWon: !isEqual([...boardForStep].sort(), [0, 1, 2, 3, 4])
  };
};

export const isTheLastMoverTheWinner = null;
