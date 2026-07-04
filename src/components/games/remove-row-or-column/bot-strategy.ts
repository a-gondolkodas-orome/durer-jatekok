import { sample } from 'lodash';
import type { StrategyArgs } from '../../game-factory';
import {
  type Board, type Grid, getRectangles, getAllMoves, applyMove, isEmpty
} from './helpers';

// Sprague–Grundy value of a single a×b rectangle. A move removes a full row
// (splitting a×b into (i-1)×b and (a-i)×b) or a full column (a×(j-1) and
// a×(b-j)); the value is the mex of the XORs of the resulting positions.
// It comes out to 0 exactly when both a and b are even — the official result.
const memo = new Map<string, number>();
export const grundy = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  if (a > b) [a, b] = [b, a];
  const key = `${a},${b}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  const reachable = new Set<number>();
  for (let i = 1; i <= a; i++) reachable.add(grundy(i - 1, b) ^ grundy(a - i, b));
  for (let j = 1; j <= b; j++) reachable.add(grundy(a, j - 1) ^ grundy(a, b - j));
  let mex = 0;
  while (reachable.has(mex)) mex++;
  memo.set(key, mex);
  return mex;
};

// The board is a disjunctive sum of independent rectangles: XOR their values.
export const boardGrundy = (grid: Grid): number =>
  getRectangles(grid).reduce(
    (acc, r) => acc ^ grundy(r.maxR - r.minR + 1, r.maxC - r.minC + 1),
    0
  );

const countWinningReplies = (grid: Grid): number =>
  getAllMoves(grid).filter(m => boardGrundy(applyMove(grid, m)) === 0).length;

// Optimal play: from a winning position (non-zero Grundy) move to a 0 position;
// such a move always exists. From a losing position every move hands the
// opponent a win, so pick the one leaving them the fewest winning replies —
// maximising the chance a human misses it.
export const smartBotStrategy = ({ board, moves }: StrategyArgs<Board>) => {
  const { grid } = board;
  const allMoves = getAllMoves(grid);
  const winning = allMoves.filter(m => boardGrundy(applyMove(grid, m)) === 0);

  let choice;
  if (winning.length) {
    choice = sample(winning)!;
  } else {
    let fewest = Infinity;
    let candidates: typeof allMoves = [];
    for (const m of allMoves) {
      const replies = countWinningReplies(applyMove(grid, m));
      if (replies < fewest) { fewest = replies; candidates = [m]; }
      else if (replies === fewest) candidates.push(m);
    }
    choice = sample(candidates)!;
  }
  moves.removeLine(board, choice);
};

// Test bot: random legal move, but grabs an immediate win (last disc) if offered.
export const randomBotStrategy = ({ board, moves }: StrategyArgs<Board>) => {
  const { grid } = board;
  const allMoves = getAllMoves(grid);
  const winningNow = allMoves.filter(m => isEmpty(applyMove(grid, m)));
  moves.removeLine(board, sample(winningNow.length ? winningNow : allMoves)!);
};
