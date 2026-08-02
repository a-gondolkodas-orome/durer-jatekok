import { moves as tictactoe } from './tictactoe/tictactoe';
import { moves as antiTictactoe } from './anti-tictactoe/anti-tictactoe';
import { moves as doubleStart } from './tictactoe-doublestart/tictactoe-doublestart';
import { isGameEnd as antiIsGameEnd, hasFirstPlayerWon } from './anti-tictactoe/helpers';
import { makeCtx } from '../../../test-utils';

// The three variants share a 3x3 grid but not an ending: the anti- games hand
// a completed line to the *other* player, and a full board without a line is a
// first-player win rather than a draw.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

// 'red' is player 0, 'blue' is player 1, in board order.
const grid = (cells: (string | null)[]) => cells;

describe('anti-tictactoe end of game', () => {
  it('gives the game to the second player when the first completes a line', () => {
    // red already holds cells 0 and 1; taking 2 makes the top row
    const board = grid(['red', 'red', null, 'blue', 'blue', null, null, null, null]);
    const outcome = antiTictactoe.placePiece.apply(board, asPlayer(0), 2);
    expect(antiIsGameEnd(outcome.nextBoard)).toBe(true);
    expect(hasFirstPlayerWon(outcome.nextBoard)).toBe(false);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn while no line is complete', () => {
    const outcome = antiTictactoe.placePiece.apply(grid(Array(9).fill(null)), asPlayer(0), 4);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('tictactoe-doublestart end of game', () => {
  it('leaves the turn open after the first of the two opening pieces', () => {
    const outcome = doubleStart.placePiece.apply(grid(Array(9).fill(null)), asPlayer(0), 0);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('closes the turn on the second of them', () => {
    const board = grid(['red', null, null, null, null, null, null, null, null]);
    const outcome = doubleStart.placePiece.apply(board, asPlayer(0), 1);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });

  it('ends only on a blue line or a full board — a red line is not an ending', () => {
    // red completing the top row leaves the game running, because the first
    // player gets two opening pieces and only blue's line stops play
    const redLine = grid(['red', 'red', null, 'blue', 'blue', null, null, null, null]);
    const carriesOn = doubleStart.placePiece.apply(redLine, asPlayer(0), 2);
    expect(carriesOn.gameEnd).toBeUndefined();
    expect(carriesOn.isTurnEnd).toBe(true);

    // blue completing the middle row does end it, for blue
    const blueLine = grid(['red', 'red', 'red', 'blue', 'blue', null, null, null, null]);
    const outcome = doubleStart.placePiece.apply(blueLine, asPlayer(1), 5);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
    expect(outcome.isTurnEnd).toBeUndefined();
  });
});

describe('tictactoe end of game', () => {
  // Which colour a placement writes depends on the mode, so these run in
  // human-vs-human, where player 0 is blue and player 1 is red.
  const vsHuman = (currentPlayer: number) =>
    ({ ctx: makeCtx({ currentPlayer, isHumanVsHumanGame: true }) });

  it('ends for the mover when placing completes a line', () => {
    const board = grid(['blue', 'blue', null, 'red', 'red', null, null, null, null]);
    const outcome = tictactoe.placePiece.apply(board, vsHuman(0), 2);
    expect(outcome.nextBoard[2]).toBe('blue');
    expect(outcome.gameEnd).toEqual({ winnerIndex: 0 });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('ends for the mover when whitening completes a line of whites', () => {
    // whitening cell 2 leaves three whites across the top row
    const board = grid(['white', 'white', 'red', 'blue', 'red', 'blue', 'red', 'blue', 'red']);
    const outcome = tictactoe.whitenPiece.apply(board, vsHuman(1), 2);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
  });

  it('passes the turn on an ordinary placement', () => {
    const outcome = tictactoe.placePiece.apply(grid(Array(9).fill(null)), vsHuman(0), 4);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});
