import { moves as movesA } from './magic-box-a/magic-box-a';
import { moves as movesB } from './magic-box-b/magic-box-b';
import { generateEmptyBoard as emptyA, hasFullLine } from './magic-box-a/helpers';
import { LINES, isLineFull } from './magic-box-b/helpers';
import { makeCtx } from '../../../test-utils';

// The two variants share a 3x3 box but invert who the ending favours: in A the
// player whose stone bursts the box loses, while in B the player who designates
// an already-full line wins, because the opponent cannot answer it.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

describe('magic-box-a end of game', () => {
  it.each([0, 1])('ends AGAINST the mover (player %i) when the box bursts', player => {
    // stones on the first two cells of the top row; the third bursts it
    const board = emptyA();
    board[0] = true;
    board[1] = true;
    const outcome = movesA.placeStone.apply(board, asPlayer(player), 2);
    expect(hasFullLine(outcome.nextBoard)).toBe(true);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 - player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn while no line is complete', () => {
    const outcome = movesA.placeStone.apply(emptyA(), asPlayer(0), 4);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('magic-box-b end of game', () => {
  const stonesFilling = (lineIndex: number) => {
    const stones = Array(9).fill(false);
    LINES[lineIndex].forEach(i => { stones[i] = true; });
    return stones;
  };

  it.each([0, 1])('ends FOR the mover (player %i) on designating a full line', player => {
    const board = { stones: stonesFilling(0), pendingLine: null };
    expect(isLineFull(board.stones, 0)).toBe(true);
    const outcome = movesB.designateLine.apply(board, asPlayer(player), 0);
    expect(outcome.gameEnd).toEqual({ winnerIndex: player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn when the designated line still has room', () => {
    const board = { stones: Array(9).fill(false), pendingLine: null };
    const outcome = movesB.designateLine.apply(board, asPlayer(0), 0);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });

  it('leaves the turn open after placing, before the line is designated', () => {
    const board = { stones: Array(9).fill(false), pendingLine: 0 };
    const outcome = movesB.placeStone.apply(board, asPlayer(0), 4);
    expect(outcome.nextBoard.pendingLine).toBeNull();
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBeUndefined();
  });
});
