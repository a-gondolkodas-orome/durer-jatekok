import { moves as movesFive } from './five-squares/five-squares';
import { moves as movesTwo } from './two-times-two/two-times-two';
import { makeCtx } from '../../../test-utils';

// Both games end on a fixed total of squares, and the second player wins only
// if the final counts are all distinct.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

describe('two-times-two end of game', () => {
  it('gives the game to the second player when the four counts are all distinct', () => {
    // 0+1+2+2 -> placing on the last pile makes 0,1,2,3
    const outcome = movesTwo.addPiece.apply([0, 1, 2, 2], asPlayer(0), 3);
    expect(outcome.nextBoard).toEqual([0, 1, 2, 3]);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('gives the game to the first player when two counts coincide', () => {
    // 1+1+1+2 -> the sixth square makes 2,1,1,2, which is not 0,1,2,3
    const outcome = movesTwo.addPiece.apply([1, 1, 1, 2], asPlayer(0), 0);
    expect(outcome.nextBoard).toEqual([2, 1, 1, 2]);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 0 });
  });

  it('passes the turn before the sixth square is placed', () => {
    const outcome = movesTwo.addPiece.apply([0, 1, 1, 2], asPlayer(0), 0);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('five-squares end of game', () => {
  it('gives the game to the second player when the five counts are all distinct', () => {
    // 0+1+2+3+3 -> the tenth square makes 0,1,2,3,4
    const outcome = movesFive.addPiece.apply([0, 1, 2, 3, 3], asPlayer(0), 4);
    expect(outcome.nextBoard).toEqual([0, 1, 2, 3, 4]);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
    expect(outcome.nextTurnState).toBeNull();
  });

  it('gives the game to the first player when two counts coincide', () => {
    // 1+1+2+3+2 -> the tenth square makes 1,1,2,3,3
    const outcome = movesFive.addPiece.apply([1, 1, 2, 3, 2], asPlayer(0), 4);
    expect(outcome.nextBoard).toEqual([1, 1, 2, 3, 3]);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 0 });
  });

  it('keeps the turn open for the second player\'s paired placement', () => {
    // player 1 placing the 3rd square starts a two-square turn
    const outcome = movesFive.addPiece.apply([1, 1, 0, 0, 0], asPlayer(1), 2);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBeUndefined();
    expect(outcome.nextTurnState).toEqual({ firstPlacedSquareIndex: 2 });
  });
});
