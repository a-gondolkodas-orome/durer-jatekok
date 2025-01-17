'use strict';

import { getGameStateAfterKillingGroup, generateStartBoard } from './helpers';
import { uniq, flatten } from 'lodash';

describe('HunyadiAndTheJanissaries helpers', () => {
  describe('getGameStateAfterKillingGroup', () => {
    it('should claim victory for Hunyadi if all soldiers are killed', () => {
      expect(getGameStateAfterKillingGroup([[], ['red', 'red']], 'red')).toEqual({
        intermediateBoard: [[], []],
        nextBoard: [[], []],
        isGameEnd: true,
        winnerIndex: 1
      });
    });

    it('should claim loss for Hunyadi if a soldier reaches the castle', () => {
      expect(getGameStateAfterKillingGroup([[], ['red', 'blue'], ['blue']], 'red')).toEqual({
        intermediateBoard: [[], ['blue'], ['blue']],
        nextBoard: [['blue'], ['blue'], []],
        isGameEnd: true,
        winnerIndex: 0
      });
    });

    it('should report game as still in progress and advance remaining soldiers otherwise', () => {
      const board = [[], ['red'], ['blue', 'red'], [], ['blue', 'blue']];
      expect(getGameStateAfterKillingGroup(board, 'red')).toEqual({
        intermediateBoard: [[], [], ['blue'], [], ['blue', 'blue']],
        nextBoard: [[], ['blue'], [], ['blue', 'blue'], []],
        isGameEnd: false
      });
    });
  });

  describe('generateStartBoard', () => {
    it('should generate a board of 5 + 1 possibly empty soldier groups', () => {
      const board = generateStartBoard();
      expect(board).toHaveLength(6);
      expect(uniq(flatten(board))).toEqual(['blue']);
    });
  });
});
