'use strict';

import { sample } from 'lodash';
import { getAllowedMoves } from './helpers';

export const aiBotStrategy = ({ board, moves }) => {
  const aiMove = getOptimalAiMove(board);
  moves.moveKnight(board, aiMove);
};

export const getOptimalAiMove = (board) => {
  return sample(getAllowedMoves(board));
};
