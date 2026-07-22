import { sample } from 'lodash';
import { EDGES } from './geometry';
import {
  type Board, LINE,
  applyShade, freeEdges, freeTriangles, shadedCount,
  liveThreats, preThreatEdges, isWinningShade
} from './helpers';
import type { Ctx, GameMoves } from '../../game-factory';

// Heuristic bot — NOT proven optimal.
//
// The full game (side-6 grid) has no known short optimal characterisation we've
// implemented yet, so this bot plays the threat race greedily: it always takes a
// forced win and always parries a forced loss, and otherwise plays the move that
// most improves its threat position. It beats casual play and punishes obvious
// mistakes, but a perfect opponent may still beat it. Replace with an optimal
// strategy once the competition solution's invariant is available.
//
// The same function serves whichever side the human did not choose; it branches
// on `ctx.currentPlayer` (0 = line player, 1 = circle player).

type Moves = GameMoves<Board>;

export const heuristicBotStrategy = (
  { board, ctx, moves }: { board: Board; ctx: Ctx; moves: Moves }
) => {
  if (ctx.currentPlayer === LINE) {
    moves.shadeEdge(board, chooseLineMove(board));
  } else {
    moves.placeCircle(board, chooseCircleMove(board));
  }
};

// Easy "test" bot: plays uniformly at random for whichever side it holds. Good
// for getting a feel for the rules before a real game.
export const randomBotStrategy = (
  { board, ctx, moves }: { board: Board; ctx: Ctx; moves: Moves }
) => {
  if (ctx.currentPlayer === LINE) {
    moves.shadeEdge(board, randomLineMove(board));
  } else {
    moves.placeCircle(board, randomCircleMove(board));
  }
};

// --- Line player -----------------------------------------------------------

const chooseLineMove = (board: Board): number => {
  const candidates = freeEdges(board);

  // 1. Immediate win: complete an un-circled triangle right now.
  const winning = candidates.filter(e => isWinningShade(board, e));
  if (winning.length > 0) return sample(winning)!;

  // 2. Forced win next turn: create two live threats at once (a double threat),
  //    which the circle player cannot both cover.
  const doubleThreat = candidates.filter(e => liveThreats(applyShade(board, e)).length >= 2);
  if (doubleThreat.length > 0) return sample(doubleThreat)!;

  // 3. Otherwise build pressure: prefer moves that leave the most pre-threat
  //    edges (setups the circle player must answer) and the most single
  //    threats, breaking ties by how much they advance un-circled triangles.
  let best: number[] = [];
  let bestScore = -Infinity;
  for (const e of candidates) {
    const next = applyShade(board, e);
    const score =
      100 * preThreatEdges(next).length +
      10 * liveThreats(next).length +
      lineProgress(next);
    if (score > bestScore) {
      bestScore = score;
      best = [e];
    } else if (score === bestScore) {
      best.push(e);
    }
  }
  return sample(best)!;
};

// Sum of shaded edges across un-circled, not-yet-complete triangles: rewards
// concentrating shading where it can still turn into a threat.
const lineProgress = (board: Board): number =>
  freeTriangles(board).reduce((sum, t) => {
    const count = shadedCount(board, t);
    return sum + (count < 3 ? count : 0);
  }, 0);

// --- Circle player ---------------------------------------------------------

const chooseCircleMove = (board: Board): number => {
  const free = freeTriangles(board);

  // 1. Cover a live threat (un-circled triangle with two shaded edges). If more
  //    than one exists the position is already lost, but cover one anyway.
  const threats = liveThreats(board);
  if (threats.length > 0) return sample(threats)!;

  // 2. No live threat yet: defuse pre-threat edges before they become double
  //    threats. Circle the triangle that sits on the most pre-threat edges, so
  //    one move neutralises as many setups as possible.
  const preThreats = preThreatEdges(board);
  if (preThreats.length > 0) {
    const coverCount = new Map<number, number>();
    for (const e of preThreats) {
      for (const t of EDGES[e].triangleIds) {
        coverCount.set(t, (coverCount.get(t) ?? 0) + 1);
      }
    }
    const maxCover = Math.max(...coverCount.values());
    const bestCoverers = [...coverCount.entries()]
      .filter(([, c]) => c === maxCover)
      .map(([t]) => t);
    return sample(bestCoverers)!;
  }

  // 3. Nothing pressing: circle the most-advanced un-circled triangle (most
  //    shaded edges) to slow the line player down, breaking ties randomly.
  let best: number[] = [];
  let bestCount = -1;
  for (const t of free) {
    const count = shadedCount(board, t);
    if (count > bestCount) {
      bestCount = count;
      best = [t];
    } else if (count === bestCount) {
      best.push(t);
    }
  }
  return sample(best)!;
};

// Purely random fallbacks, exposed for a "test" bot / property tests.
export const randomLineMove = (board: Board): number => sample(freeEdges(board))!;
export const randomCircleMove = (board: Board): number => sample(freeTriangles(board))!;
