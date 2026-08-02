import { range } from 'lodash';
import { moves, getAllowedMoves, withDuckPlaced, type Board } from './helpers';
import { makeCtx } from '../../../test-utils';

// A duck forbids its four neighbours, so the free squares run out; the player
// who places the last duck wins.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

const emptyBoard = (rows: number, cols: number): Board =>
  range(rows).map(() => range(cols).map(() => null));

describe.each([[4, 7], [4, 6]])('end of game on a %ix%i board', (rows, cols) => {
  it('ends exactly on the placement that fills the board', () => {
    let board = emptyBoard(rows, cols);
    let player = 0;
    let outcome = moves.placeDuck.apply(board, asPlayer(player), getAllowedMoves(board)[0]);

    while (getAllowedMoves(outcome.nextBoard).length > 0) {
      expect(outcome.gameEnd).toBeUndefined();
      expect(outcome.isTurnEnd).toBe(true);
      board = outcome.nextBoard;
      player = 1 - player;
      outcome = moves.placeDuck.apply(board, asPlayer(player), getAllowedMoves(board)[0]);
    }

    expect(getAllowedMoves(outcome.nextBoard)).toEqual([]);
    expect(outcome.gameEnd).toEqual({ winnerIndex: player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });
});

describe('withDuckPlaced', () => {
  it('produces exactly the board the move returns — the bot search shares it', () => {
    const board = emptyBoard(4, 7);
    const field = { row: 1, col: 2 };
    expect(moves.placeDuck.apply(board, asPlayer(0), field).nextBoard)
      .toEqual(withDuckPlaced(board, field));
  });
});
