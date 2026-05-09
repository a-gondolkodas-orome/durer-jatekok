import { isP2WinningPosition, findImmediateWin, aiBotStrategy } from './strategy';

const active = (value) => ({ value, state: 'active' });
const consumed = (value) => ({ value, state: 'consumed' });

const makeBoard = (level0Values, k, { sortedInitial } = {}) => {
  const sorted = sortedInitial ?? [...level0Values].sort((a, b) => b - a);
  return {
    levels: [
      level0Values.map(active),
      Array(4).fill(null),
      Array(2).fill(null),
      Array(1).fill(null)
    ],
    k,
    sortedInitial: sorted
  };
};

describe('isP2WinningPosition', () => {
  it('returns true when extremes < k and inner sum >= k', () => {
    // [9,8,7,6,5,4,2,2]: extremes=9+8+2+2=21, inner=7+6+5+4=22
    const s = [9, 8, 7, 6, 5, 4, 2, 2];
    expect(isP2WinningPosition(s, 22)).toBe(true);
    expect(isP2WinningPosition(s, 21)).toBe(false); // k <= extremes
    expect(isP2WinningPosition(s, 23)).toBe(false); // k > inner
  });

  it('returns false when extremes >= k', () => {
    const s = [10, 9, 6, 5, 4, 3, 2, 2]; // extremes=23, inner=18
    expect(isP2WinningPosition(s, 20)).toBe(false);
  });

  it('returns false when inner sum < k', () => {
    const s = [8, 7, 6, 5, 4, 4, 3, 3]; // extremes=21, inner=22
    expect(isP2WinningPosition(s, 25)).toBe(false);
  });
});

describe('findImmediateWin', () => {
  it('returns null when no pair in any level reaches k', () => {
    const board = makeBoard([5, 4, 3, 2, 2, 2, 2, 2], 20);
    expect(findImmediateWin(board.levels, 20)).toBeNull();
  });

  it('finds winning pair on level 0', () => {
    const board = makeBoard([10, 9, 3, 2, 2, 2, 2, 2], 15);
    const result = findImmediateWin(board.levels, 15);
    expect(result).not.toBeNull();
    expect(result.levelIdx).toBe(0);
    const vals = result.indices.map((i) => board.levels[0][i].value);
    expect(vals[0] + vals[1]).toBeGreaterThanOrEqual(15);
  });

  it('finds winning pair on a higher level', () => {
    const board = makeBoard([3, 3, 3, 3, 3, 3, 3, 3], 100);
    board.levels[1][0] = active(60);
    board.levels[1][1] = active(50);
    const result = findImmediateWin(board.levels, 100);
    expect(result).not.toBeNull();
    expect(result.levelIdx).toBe(1);
  });

  it('ignores consumed slots', () => {
    const board = makeBoard([10, 9, 3, 2, 2, 2, 2, 2], 15);
    board.levels[0][0] = consumed(10);
    expect(findImmediateWin(board.levels, 15)).toBeNull();
  });
});

describe('aiBotStrategy', () => {
  const makeMoveCapture = () => {
    const captured = [];
    return {
      moves: { combineTwo: (board, arg) => { captured.push(arg); } },
      captured
    };
  };

  it('takes an immediate winning move when available', () => {
    const board = makeBoard([10, 9, 3, 2, 2, 2, 2, 2], 15);
    const { moves: mockMoves, captured } = makeMoveCapture();
    aiBotStrategy({ board, ctx: { currentPlayer: 0 }, moves: mockMoves });
    expect(captured).toHaveLength(1);
    const vals = captured[0].indices.map((i) => board.levels[0][i].value);
    expect(vals[0] + vals[1]).toBeGreaterThanOrEqual(15);
  });

  it('P1 in a winning position combines largest pair from level 0', () => {
    // [8,7,6,5,4,4,3,3]: extremes=21, inner=19, k=23 → P1 wins (inner < k)
    const s = [8, 7, 6, 5, 4, 4, 3, 3];
    const board = {
      levels: [s.map(active), Array(4).fill(null), Array(2).fill(null), Array(1).fill(null)],
      k: 23,
      sortedInitial: s
    };
    const { moves: mockMoves, captured } = makeMoveCapture();
    aiBotStrategy({ board, ctx: { currentPlayer: 0 }, moves: mockMoves });
    expect(captured).toHaveLength(1);
    const vals = captured[0].indices.map((i) => board.levels[0][i].value);
    expect(Math.max(...vals)).toBe(8);
  });

  it('P2 in a winning position combines smallest pair from level 0', () => {
    // [9,8,7,6,5,4,2,2]: extremes=21, inner=22, k=22 → P2 wins
    const s = [9, 8, 7, 6, 5, 4, 2, 2];
    const board = {
      levels: [s.map(active), Array(4).fill(null), Array(2).fill(null), Array(1).fill(null)],
      k: 22,
      sortedInitial: s
    };
    const { moves: mockMoves, captured } = makeMoveCapture();
    aiBotStrategy({ board, ctx: { currentPlayer: 1 }, moves: mockMoves });
    expect(captured).toHaveLength(1);
    const vals = captured[0].indices.map((i) => board.levels[0][i].value);
    expect(Math.max(...vals)).toBe(2);
  });
});
