'use strict';

import { moves, generateStartBoard } from './helpers';
import { uniq, flatten } from 'lodash';

describe('HunyadiAndTheJanissaries helpers', () => {
  describe('moves', () => {
    it('should claim victory for Hunyadi if all soldiers are killed', () => {
      let winnerIndexMock = null;
      const events = {
        endTurn: () => {},
        endGame: ({ winnerIndex }) => { winnerIndexMock = winnerIndex; }
      }
      moves.killGroup([[], ['red', 'red']], { events }, 'red')
      setTimeout(() => {
        expect(winnerIndexMock).toBe(1);
      }, 0);
    });

    it('should claim loss for Hunyadi if a soldier reaches the castle', () => {
      let winnerIndexMock = null;
      const events = {
        endTurn: () => {},
        endGame: ({ winnerIndex }) => { winnerIndexMock = winnerIndex; }
      }
      moves.killGroup([[], ['red', 'blue'], ['blue']], { events }, 'red');
      setTimeout(() => {
        expect(winnerIndexMock).toBe(0);
      }, 0);
    });

    it('should report game as still in progress and advance remaining soldiers otherwise', () => {
      let winnerIndexMock = 'mock';
      const events = {
        endTurn: () => {},
        endGame: ({ winnerIndex }) => { winnerIndexMock = winnerIndex; }
      }
      const board = [[], ['red'], ['blue', 'red'], [], ['blue', 'blue']];
      const { nextBoard } = moves.killGroup(board, { events }, 'red');
      setTimeout(() => {
        expect(nextBoard).toEqual([[], ['blue'], [], ['blue', 'blue']])
        expect(winnerIndexMock).toBe('mock');
      }, 0);
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
