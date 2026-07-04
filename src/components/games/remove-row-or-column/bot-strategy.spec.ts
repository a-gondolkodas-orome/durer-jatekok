import { describe, it, expect } from 'vitest';
import { makeCtx, type GameMoves } from '../../game-factory';
import { type Board, type Grid, type Move, applyMove, isEmpty } from './helpers';
import { grundy, boardGrundy, smartBotStrategy, randomBotStrategy } from './bot-strategy';

const full = (rows: number, cols: number): Grid =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => true));

// Capture the move a bot decides on without touching the real game engine.
const decide = (bot: typeof smartBotStrategy, grid: Grid): Move => {
  let played: Move;
  const moves = {
    removeLine: (_board: Board, move: Move) => { played = move; return { nextBoard: _board }; }
  } as unknown as GameMoves<Board>;
  bot({ board: { grid }, ctx: makeCtx(), moves });
  return played!;
};

// Play a full game; return the index (0 or 1) of the player who takes the last disc.
const playout = (grid: Grid, bots: [typeof smartBotStrategy, typeof smartBotStrategy]): number => {
  let g = grid;
  let turn = 0;
  for (let guard = 0; guard < 1000; guard++) {
    g = applyMove(g, decide(bots[turn % 2], g));
    if (isEmpty(g)) return turn % 2;
    turn++;
  }
  throw new Error('playout did not terminate');
};

describe('grundy', () => {
  it('is zero exactly when both sides are even', () => {
    for (let a = 1; a <= 8; a++) {
      for (let b = 1; b <= 8; b++) {
        const bothEven = a % 2 === 0 && b % 2 === 0;
        expect(grundy(a, b) === 0).toBe(bothEven);
      }
    }
  });

  it('is symmetric', () => {
    expect(grundy(3, 5)).toBe(grundy(5, 3));
    expect(grundy(2, 7)).toBe(grundy(7, 2));
  });
});

describe('boardGrundy', () => {
  it('xors the values of independent rectangles', () => {
    // two identical rectangles cancel to zero
    const grid: Grid = [
      [true, true, false, true, true],
      [true, true, false, true, true],
      [true, true, false, true, true]
    ];
    expect(boardGrundy(grid)).toBe(0);
  });
});

describe('smartBotStrategy', () => {
  it('moves to a zero (losing-for-opponent) position from a winning board', () => {
    for (const [r, c] of [[3, 3], [1, 4], [2, 3], [5, 2], [3, 6]] as const) {
      const grid = full(r, c);
      const move = decide(smartBotStrategy, grid);
      expect(boardGrundy(applyMove(grid, move))).toBe(0);
    }
  });

  it('wins as the first mover from every odd-sided board vs the random bot', () => {
    for (const [r, c] of [[3, 3], [1, 4], [2, 3], [5, 4], [3, 6]] as const) {
      for (let trial = 0; trial < 20; trial++) {
        expect(playout(full(r, c), [smartBotStrategy, randomBotStrategy])).toBe(0);
      }
    }
  });

  it('wins as the second mover from every both-even board vs the random bot', () => {
    for (const [r, c] of [[2, 2], [2, 4], [4, 4], [6, 2]] as const) {
      for (let trial = 0; trial < 20; trial++) {
        expect(playout(full(r, c), [randomBotStrategy, smartBotStrategy])).toBe(1);
      }
    }
  });

  it('the first mover wins an odd-sided board even in optimal-vs-optimal play', () => {
    expect(playout(full(3, 5), [smartBotStrategy, smartBotStrategy])).toBe(0);
  });
});

describe('randomBotStrategy', () => {
  it('takes an immediate winning move when one exists', () => {
    // a single row of discs: removing it empties the board
    const move = decide(randomBotStrategy, [[true, true, true, true]]);
    expect(isEmpty(applyMove([[true, true, true, true]], move))).toBe(true);
  });
});
