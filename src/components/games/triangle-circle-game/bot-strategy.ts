import { sample } from 'lodash';
import { EDGES } from './geometry';
import {
  type Board, LINE,
  applyShade, freeEdges, freeTriangles, shadedCount,
  liveThreats, preThreatEdges, isWinningShade
} from './helpers';
import { makeMoveEvaluator } from './search';
import type { Ctx, GameMoves } from '../../game-factory';

// Strong bot — tactically exact, heuristic elsewhere. NOT proven optimal.
//
// The exact solver only settles tiny boards (side ≤ 3, where the circle player
// wins), so on the real side-6 grid this bot combines two layers:
//   1. A bounded-depth minimax over the threat-reduced game (see search.ts):
//      it always grabs a forced win, always refuses a move that hands the other
//      player a forced win, within a per-move node budget and depth horizon.
//   2. A threat heuristic that orders the search and decides positions the
//      search leaves 'unknown' (typically the wide-open opening).
//
// This is far stronger than pure greedy — it never misses a tactic inside the
// horizon — but a perfect opponent may still beat it in the deep opening. The
// same function serves whichever side the human did not choose; it branches on
// `ctx.currentPlayer` (0 = line player, 1 = circle player).

type Moves = GameMoves<Board>;
type SearchOpts = { depth: number; budget: number };

// Per-move search limits. Budget is kept modest so a bot turn never blocks the
// main thread for long: the wide-open opening (where the search can only return
// 'unknown' anyway) resolves quickly, while tactical mid/endgame positions —
// which collapse fast under the forced-move pruning — are searched to the end.
const SEARCH: SearchOpts = { depth: 12, budget: 45_000 };

// Build a bot with a given search budget. Exposed so tests (and cheaper
// variants) can dial the search down; the shipped bot uses SEARCH.
export const makeHeuristicBotStrategy = (searchOpts: SearchOpts = SEARCH) =>
  ({ board, ctx, moves }: { board: Board; ctx: Ctx; moves: Moves }) => {
    if (ctx.currentPlayer === LINE) {
      moves.shadeEdge(board, chooseLineMove(board, searchOpts));
    } else {
      moves.placeCircle(board, chooseCircleMove(board, searchOpts));
    }
  };

export const heuristicBotStrategy = makeHeuristicBotStrategy(SEARCH);

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

// Higher = a more promising shading move (used to order the search and to break
// ties among positions the search can't decide).
const lineHeuristicScore = (board: Board, edgeId: number): number => {
  const next = applyShade(board, edgeId);
  return 100 * preThreatEdges(next).length + 10 * liveThreats(next).length + lineProgress(next);
};

const chooseLineMove = (board: Board, searchOpts: SearchOpts): number => {
  const candidates = freeEdges(board);

  // 1. Immediate win: complete an un-circled triangle right now.
  const winning = candidates.filter(e => isWinningShade(board, e));
  if (winning.length > 0) return sample(winning)!;

  // 2. Forced win next turn: create two live threats at once (a double threat).
  const doubleThreat = candidates.filter(e => liveThreats(applyShade(board, e)).length >= 2);
  if (doubleThreat.length > 0) return sample(doubleThreat)!;

  // 3. Search the most promising moves first. Grab a proven forced win, drop any
  //    move that lets the circle player force a win, and keep the rest as safe.
  const ordered = candidates
    .map(e => ({ e, score: lineHeuristicScore(board, e) }))
    .sort((a, b) => b.score - a.score);

  const evaluator = makeMoveEvaluator(searchOpts);
  const safe: number[] = [];
  for (const { e } of ordered) {
    const outcome = evaluator.evalAfterShade(board, e);
    if (outcome === 'lineWins') return e;
    if (outcome === 'lineLoses') continue;
    safe.push(e);
  }
  // Best heuristic move that isn't a proven loss; if every move is a proven loss
  // inside the horizon, fall back to the best heuristic move as a swindle.
  return safe.length > 0 ? safe[0] : ordered[0].e;
};

// Sum of shaded edges across un-circled, not-yet-complete triangles: rewards
// concentrating shading where it can still turn into a threat.
const lineProgress = (board: Board): number =>
  freeTriangles(board).reduce((sum, t) => {
    const count = shadedCount(board, t);
    return sum + (count < 3 ? count : 0);
  }, 0);

// --- Circle player ---------------------------------------------------------

// Higher = a more urgent triangle to circle: primarily how many pre-threat edges
// it sits on, then how shaded it already is.
const circleHeuristicScore = (board: Board, triangleId: number, preThreatCover: Map<number, number>): number =>
  100 * (preThreatCover.get(triangleId) ?? 0) + shadedCount(board, triangleId);

const chooseCircleMove = (board: Board, searchOpts: SearchOpts): number => {
  // 1. Cover a live threat (un-circled triangle with two shaded edges). If more
  //    than one exists the position is already lost, but cover one anyway.
  const threats = liveThreats(board);
  if (threats.length > 0) return sample(threats)!;

  // Pre-threat coverage per triangle, for ordering.
  const preThreatCover = new Map<number, number>();
  for (const e of preThreatEdges(board)) {
    for (const t of EDGES[e].triangleIds) preThreatCover.set(t, (preThreatCover.get(t) ?? 0) + 1);
  }

  const ordered = freeTriangles(board)
    .map(t => ({ t, score: circleHeuristicScore(board, t, preThreatCover) }))
    .sort((a, b) => b.score - a.score);

  // 2. Search the most promising fills first. Take a move that provably denies
  //    the line player a win in the horizon, skip any that hand one over.
  const evaluator = makeMoveEvaluator(searchOpts);
  const safe: number[] = [];
  for (const { t } of ordered) {
    const outcome = evaluator.evalAfterCircle(board, t);
    if (outcome === 'lineLoses') return t;
    if (outcome === 'lineWins') continue;
    safe.push(t);
  }
  return safe.length > 0 ? safe[0] : ordered[0].t;
};

// Purely random fallbacks, exposed for a "test" bot / property tests.
export const randomLineMove = (board: Board): number => sample(freeEdges(board))!;
export const randomCircleMove = (board: Board): number => sample(freeTriangles(board))!;
