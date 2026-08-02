import { moves as moves10 } from './triangular-grid-ropes-10/triangular-grid-ropes-10';
import { moves as moves15 } from './triangular-grid-ropes-15/triangular-grid-ropes-15';
import * as helpers10 from './triangular-grid-ropes-10/helpers';
import * as helpers15 from './triangular-grid-ropes-15/helpers';
import { makeCtx } from '../../../test-utils';

// A rope may not pass a pole another rope already touches, so the grid runs out
// of legal ropes on its own; the player who stretches the last one wins.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

describe.each([
  ['10 poles', moves10, helpers10],
  ['15 poles', moves15, helpers15]
])('%s end of game', (_name, moves, helpers) => {
  it('ends exactly on the move that uses up the grid', () => {
    let board = [];
    let player = 0;
    let outcome;

    while (!helpers.isGameEnd(board)) {
      const next = helpers.getAllowedMoves(board)[0];
      outcome = moves.stretchRope.apply(board, asPlayer(player), next);
      if (!helpers.isGameEnd(outcome.nextBoard)) {
        expect(outcome.gameEnd).toBeUndefined();
        expect(outcome.isTurnEnd).toBe(true);
      }
      board = outcome.nextBoard;
      player = 1 - player;
    }

    expect(outcome).toBeDefined();
    expect(helpers.isGameEnd(outcome!.nextBoard)).toBe(true);
    // `player` has already flipped past the mover of the final rope
    expect(outcome!.gameEnd).toEqual({ winnerIndex: 1 - player });
    expect(outcome!.isTurnEnd).toBeUndefined();
  });
});
