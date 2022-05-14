'use strict';

import { random } from 'lodash-es';
import { generateNewBoard, getBoardAfterPlayerStep, makeAiMove } from './strategy';

jest.mock('lodash-es/random');

describe('HeapSplitter Strategy', () => {
  describe('generateNewBoard', () => {
    it('should generate a new board with two piles of random size', () => {
      random.mockReturnValueOnce(4).mockReturnValueOnce(6);
      expect(generateNewBoard()).toEqual([4, 6]);
    });
  });

  describe('getBoardAfterPlayerStep', () => {
    it('should return board and game end true if player move finished the game', () => {
      expect(
        getBoardAfterPlayerStep([5, 2], { rowIndex: 1, pieceIndex: 1 })
      ).toEqual({ board: [1, 1], isGameEnd: true });
    });

    it('should return board and game end false if player move does not finish the game', () => {
      expect(
        getBoardAfterPlayerStep([5, 2], { rowIndex: 0, pieceIndex: 2 })
      ).toEqual({ board: [2, 3], isGameEnd: false });
    })
  });

  describe('makeAiMove', () => {
    it.each([
      [2, 5],
      [1, 2],
      [23, 2],
      [2, 3]
    ])('should finish the game if one of the piles has 2 pebbles and the other an odd number (%d, %d)', (firstPile, secondPile) => {
      random.mockReturnValue(0);
      expect(makeAiMove([firstPile, secondPile])).toEqual({ board: [1, 1], isGameEnd: true });
    });

    it('should split a random pile randomly into two odd parts if both piles have an even number of pebbles', () => {
      random.mockReturnValueOnce(1).mockReturnValueOnce(1);
      expect(makeAiMove([4, 8])).toEqual({ board: [3, 5], isGameEnd: false });
    });

    it('should split a random pile randomly into two parts if both piles have an odd number of pebbles', () => {
      random.mockReturnValueOnce(0).mockReturnValueOnce(1);
      expect(makeAiMove([3, 7])).toEqual({ board: [3, 4], isGameEnd: false });
    });

    it('should split the even pile into two odd parts if one pile is even and the other is odd', () => {
      random.mockReturnValueOnce(0).mockReturnValueOnce(1);
      expect(makeAiMove([5, 8])).toEqual({ board: [3, 5], isGameEnd: false });
    });
  });
});