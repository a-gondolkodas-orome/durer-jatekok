'use strict';

import { isNull, some, groupBy, range, cloneDeep, sample } from 'lodash';
import { hasWinningSubset } from '../../helpers';

export const getGameStateAfterAiTurn = ({ board }) => {
  const nextBoard = cloneDeep(board);
  const aiPosition = getOptimalAiPosition(nextBoard);
  nextBoard[aiPosition] = getNextColor(nextBoard, false);
  return { nextBoard, isGameEnd: isGameEnd(nextBoard), winnerIndex: null };
};

export const pColor = 'blue';
export const aiColor = 'red';

export const inPlacingPhase = (board) => board.find(isNull) !== undefined;

const getOptimalAiPosition = (board) => {
  if (inPlacingPhase(board)) return getOptimalAiPlacingPosition(board);
  return getOptimalAiFlippingPosition(board);
};

const getOptimalAiPlacingPosition = (board) => {
  const allowedPlaces = getAllowedPlaces(board, false);

  if (allowedPlaces.length === 9) return(sample([0, 2, 4, 6, 8]));

  const instantWinningPlace = allowedPlaces.find((i) => {
    const localBoard = cloneDeep(board);
    localBoard[i] = aiColor;
    return isGameEnd(localBoard);
  });
  if (instantWinningPlace !== undefined) return instantWinningPlace;

  const instantDefendingPlace = allowedPlaces.find((i) => {
    const localBoard = cloneDeep(board);
    localBoard[i] = pColor;
    return isGameEnd(localBoard);
  });
  if (instantDefendingPlace !== undefined) return instantDefendingPlace;

  const optimalPlaces = allowedPlaces.filter(i => {
    const boardCopy = cloneDeep(board);
    boardCopy[i] = aiColor;
    return isWinningState(boardCopy, false);
  });

  if (optimalPlaces.length > 0) return sample(optimalPlaces);

  return sample(allowedPlaces);
};

const getOptimalAiFlippingPosition = (board) => {
  const allowedPlaces = getAllowedPlaces(board, false);

  const optimalPlaces = allowedPlaces.filter(i => {
    const boardCopy = cloneDeep(board);
    boardCopy[i] = 'white';
    return isWinningState(boardCopy, false);
  });

  // if you can win symmetrically, try to do so (only for beauty)
  if (optimalPlaces.find(i => i === 4) !== undefined) return 4;
  if (optimalPlaces.length > 0) return sample(optimalPlaces);

  return sample(allowedPlaces);
};

// given board *after* your step, are you set up to win the game for sure?
const isWinningState = (board, amIPlayer) => {
  if (isGameEnd(board)) {
    return true;
  }

  const allowedPlacesForOther = getAllowedPlaces(board, !amIPlayer);
  const colorForOther = getNextColor(board, !amIPlayer);

  const optimalPlaceForOther = allowedPlacesForOther.find(i => {
    const boardCopy = cloneDeep(board);
    boardCopy[i] = colorForOther;
    return isWinningState(boardCopy, !amIPlayer);
  });
  return optimalPlaceForOther === undefined;
};

const getAllowedPlaces = (board, amIPlayer) => {
  if (inPlacingPhase(board)) {
    return range(0, 9).filter(i => isNull(board[i]));
  }
  const enemyColor = amIPlayer ? aiColor : pColor;
  return range(0, 9).filter(i => board[i] === enemyColor);
};

const getNextColor = (board, amIPlayer) => {
  if (inPlacingPhase(board)) {
    return amIPlayer ? pColor : aiColor;
  }
  return 'white';
};

export const isGameEnd = (board) => {
  const occupiedPlaces = range(0, 9).filter((i) => board[i]);
  const boardIndicesByPieceColor = groupBy(occupiedPlaces, (i) => board[i]);
  return some(boardIndicesByPieceColor, hasWinningSubset);
};
