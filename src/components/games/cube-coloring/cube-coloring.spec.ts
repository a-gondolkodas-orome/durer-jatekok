import { range, every, sample } from 'lodash';
import { moves } from './cube-coloring';
import { generateStartBoard, isAllowedStep, isColored, colors, type Board } from './helpers';
import { makeCtx } from '../../../test-utils';

// The first player wants all eight vertices coloured; the second wants the
// colouring to get stuck first. The move reads no ctx, so the winner is fixed
// by the resulting position.
const meta = { ctx: makeCtx() };

const legalSteps = (board: Board) =>
  range(0, 8).flatMap(vertex => colors
    .filter(color => isAllowedStep(board, vertex, color))
    .map(color => ({ vertex, color })));

describe('end of game', () => {
  // The board is small enough to walk to the end many times over, which covers
  // both endings without hand-building a stuck cube.
  it.each(range(30))('ends exactly on the last legal step (run %i)', () => {
    let board = generateStartBoard();
    let outcome = moves.colorVertex.apply(board, meta, sample(legalSteps(board))!);

    while (legalSteps(outcome.nextBoard).length > 0) {
      expect(outcome.gameEnd).toBeUndefined();
      expect(outcome.isTurnEnd).toBe(true);
      board = outcome.nextBoard;
      outcome = moves.colorVertex.apply(board, meta, sample(legalSteps(board))!);
    }

    const allColoured = every(range(0, 8), v => isColored(outcome.nextBoard, v));
    expect(outcome.gameEnd).toEqual({ winnerIndex: allColoured ? 0 : 1 });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('gives the game to the first player when every vertex ends up coloured', () => {
    // one uncoloured vertex left, and a colour that fits it
    const board: Board = ['red', 'blue', 'blue', 'red', 'blue', 'red', 'red', ''];
    const step = legalSteps(board)[0];
    expect(step).toBeDefined();
    const outcome = moves.colorVertex.apply(board, meta, step);
    expect(every(range(0, 8), v => isColored(outcome.nextBoard, v))).toBe(true);
    expect(outcome.gameEnd).toEqual({ winnerIndex: 0 });
  });
});
