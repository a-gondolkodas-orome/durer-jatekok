'use strict';

import { random, cloneDeep } from 'lodash';
import { getGameStateAfterKillingGroup } from './helpers';

export const getGameStateAfterAiTurn = ({ board, ctx }) => {
  if (ctx.chosenRoleIndex === 0) {
    const optimalGroupToKill = getOptimalGroupToKill(board);
    return getGameStateAfterKillingGroup(board, optimalGroupToKill);
  } else {
    return { nextBoard: colorBoardOptimally(board), isGameEnd: false };
  }
};

const colorBoardOptimally = (board) => {
  const groupScores = { blue: 0, red: 0 };
  const firstColor = random(0, 1) === 1 ? 'red' : 'blue';
  const secondColor = firstColor === 'blue' ? 'red' : 'blue';
  const nextBoard = cloneDeep(board);

  for (let i = 1; i < nextBoard.length; i++) {
    for (let j = 0; j < nextBoard[i].length; j++) {
      const nextGroup = groupScores[firstColor] < groupScores[secondColor] ? firstColor : secondColor;
      nextBoard[i][j] = nextGroup;
      groupScores[nextGroup] += (1 / 2) ** (i - 1);
    }
  }

  return nextBoard;
};

const getOptimalGroupToKill = (board) => {
  if (board[1].length > 0) {
    return board[1][0];
  }

  const groupScores = { blue: 0, red: 0 };
  for (let i = 1; i < board.length; i++) {
    for (const soldier of board[i]) {
      groupScores[soldier] += (1 / 2) ** (i - 1);
    }
  }

  return groupScores['blue'] > groupScores['red'] ? 'blue' : 'red';
};
