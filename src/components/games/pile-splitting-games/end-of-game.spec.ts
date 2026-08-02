import { moves as splitter } from './pile-splitter/pile-splitter';
import { moves as splitter3 } from './pile-splitter-3/pile-splitter-3';
import { moves as splitter4 } from './pile-splitter-4/pile-splitter-4';
import { withPileRemoved } from './helpers';
import { makeCtx } from '../../../test-utils';

// All three play the same two-move turn: empty one pile, then split another
// into it. The game ends once every pile is down to a single piece, since a
// pile of one cannot be split.
type Meta = { ctx: ReturnType<typeof makeCtx> };
const asPlayer = (currentPlayer: number): Meta => ({ ctx: makeCtx({ currentPlayer }) });

const games = [
  {
    name: 'pile-splitter',
    // remove pile 1, then split pile 0's two pieces into [1, 1]
    emptyAPile: (m: Meta) => splitter.removePile.apply([2, 5], m, 1),
    finishingSplit: (m: Meta) => splitter.splitPile.apply([2, 0], m, { pileId: 0, pieceCount: 1 }),
    ongoingSplit: (m: Meta) => splitter.splitPile.apply([5, 0], m, { pileId: 0, pieceCount: 1 }),
    dead: [1, 1]
  },
  {
    name: 'pile-splitter-3',
    emptyAPile: (m: Meta) => splitter3.removePile.apply([1, 2, 5], m, 2),
    finishingSplit: (m: Meta) => splitter3.splitPile.apply([1, 2, 0], m, { pileId: 1, pieceCount: 1 }),
    ongoingSplit: (m: Meta) => splitter3.splitPile.apply([1, 5, 0], m, { pileId: 1, pieceCount: 1 }),
    dead: [1, 1, 1]
  },
  {
    name: 'pile-splitter-4',
    emptyAPile: (m: Meta) => splitter4.removePile.apply([1, 1, 2, 5], m, 3),
    finishingSplit: (m: Meta) =>
      splitter4.splitPile.apply([1, 1, 2, 0], m, { pileId: 2, pieceCount: 1 }),
    ongoingSplit: (m: Meta) =>
      splitter4.splitPile.apply([1, 1, 5, 0], m, { pileId: 2, pieceCount: 1 }),
    dead: [1, 1, 1, 1]
  }
];

describe.each(games)('$name end of game', ({ emptyAPile, finishingSplit, ongoingSplit, dead }) => {
  it('leaves the turn open after emptying a pile', () => {
    const outcome = emptyAPile(asPlayer(0));
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it.each([0, 1])('ends for the mover (player %i) when every pile holds one', player => {
    const outcome = finishingSplit(asPlayer(player));
    expect(outcome.nextBoard).toEqual(dead);
    expect(outcome.gameEnd).toEqual({ winnerIndex: player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn while a pile can still be split', () => {
    const outcome = ongoingSplit(asPlayer(0));
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('withPileRemoved', () => {
  it('empties the pile in place rather than dropping it from the board', () => {
    expect(withPileRemoved([2, 5], 1)).toEqual([2, 0]);
  });
});
