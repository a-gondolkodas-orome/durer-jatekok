import { moves } from './triangular-grid-ropes-10';
import { isGameEnd, getAllowedMoves } from './helpers';
import { makeCtx } from '../../../../test-utils';

// A rope may not pass a pole another rope already touches, so the grid runs out
// of legal ropes on its own; the player who stretches the last one wins.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

describe('10 poles end of game', () => {
  it('ends exactly on the move that uses up the grid', () => {
    let board = [];
    let player = 0;
    let outcome;

    while (!isGameEnd(board)) {
      const next = getAllowedMoves(board)[0];
      outcome = moves.stretchRope.apply(board, asPlayer(player), next);
      if (!isGameEnd(outcome.nextBoard)) {
        expect(outcome.gameEnd).toBeUndefined();
        expect(outcome.isTurnEnd).toBe(true);
      }
      board = outcome.nextBoard;
      player = 1 - player;
    }

    expect(outcome).toBeDefined();
    expect(isGameEnd(outcome!.nextBoard)).toBe(true);
    // `player` has already flipped past the mover of the final rope
    expect(outcome!.gameEnd).toEqual({ winnerIndex: 1 - player });
    expect(outcome!.isTurnEnd).toBeUndefined();
  });
});
