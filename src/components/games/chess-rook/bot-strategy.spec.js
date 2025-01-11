import { getGameStateAfterAiTurn, getGameStateAfterMove } from './bot-strategy';
import { generateStartBoard } from './helpers';
import { isEqual } from 'lodash';

describe('chess rook', () => {
  describe('getGameStateAfterAiTurn()', () => {
    it('should move to end of row or column as a first step', () => {
      const board = generateStartBoard();
      const rookPosition = getGameStateAfterAiTurn({ board }).nextBoard.rookPosition;
      expect(
        isEqual(rookPosition, { row: 0, col: 7 }) ||
        isEqual(rookPosition, { row: 7, col: 0 })
      ).toBe(true);
    });

    it('should create a narrow rectangle if possible', () => {
      const board = generateStartBoard();
      const { nextBoard } = getGameStateAfterMove(board, { row: 0, col: 5 });
      const rookPosition = getGameStateAfterAiTurn({ board: nextBoard }).nextBoard.rookPosition;
      expect(rookPosition).toEqual({ row: 7, col: 5 });
    });
  });
});
