import { moves, type Board } from './helpers';
import { makeCtx } from '../../../test-utils';

// The board-client's `disabled` predicates and the engine's illegal-move
// enforcement both flow through these validators, so they are the single legality
// contract worth locking down. `ctx.isClientMoveAllowed` (whose turn) is out of
// scope here on purpose — that gate lives in the board-client, not the validator.
describe('coins-in-3-piles move validators', () => {
  type TurnState = { removedCoinValue: number } | null;
  const removeCoin = (board: Board, turnState: TurnState, value: number) =>
    moves.removeCoin.validate(board, { ctx: makeCtx({ turnState }) }, value);
  const addCoin = (board: Board, turnState: TurnState, value: number | null) =>
    moves.addCoin.validate(board, { ctx: makeCtx({ turnState }) }, value);

  describe('removeCoin', () => {
    it('allows removing from a non-empty pile at the start of a turn', () => {
      expect(removeCoin([3, 5, 7], null, 1)).toBe(true);
      expect(removeCoin([3, 5, 7], null, 3)).toBe(true);
    });

    it('rejects removing from an empty pile', () => {
      expect(removeCoin([0, 5, 7], null, 1)).toBe(false);
    });

    it('rejects a coin value out of the 1..3 range', () => {
      expect(removeCoin([3, 5, 7], null, 0)).toBe(false);
      expect(removeCoin([3, 5, 7], null, 4)).toBe(false);
    });

    it('rejects a second removal in the same turn', () => {
      expect(removeCoin([3, 5, 7], { removedCoinValue: 3 }, 1)).toBe(false);
    });
  });

  describe('addCoin', () => {
    it('rejects placing back before any coin was removed', () => {
      expect(addCoin([3, 5, 7], null, 1)).toBe(false);
      expect(addCoin([3, 5, 7], null, null)).toBe(false);
    });

    it('allows placing back a strictly smaller coin', () => {
      expect(addCoin([3, 5, 6], { removedCoinValue: 3 }, 1)).toBe(true);
      expect(addCoin([3, 5, 6], { removedCoinValue: 3 }, 2)).toBe(true);
    });

    it('rejects placing back a coin greater than or equal to the removed value', () => {
      expect(addCoin([3, 5, 6], { removedCoinValue: 2 }, 2)).toBe(false);
      expect(addCoin([3, 5, 6], { removedCoinValue: 2 }, 3)).toBe(false);
    });

    it('allows placing back nothing', () => {
      expect(addCoin([3, 5, 6], { removedCoinValue: 2 }, null)).toBe(true);
    });
  });
});
