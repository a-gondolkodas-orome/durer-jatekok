import { maxBy } from 'lodash';
import type { StrategyArgs } from '../../game-factory';
import type { Board } from './architect-and-bandits';

// Vertices A(0)..H(7) clockwise. Each edge = 10 km, max 4 edges/day.
// Architect wins by visiting all 8 vertices over 4 days despite 3 nightly destructions.
//
// Architect strategy (day by day):
//   Day 1: A→B→C→D→E
//   Day 2: depends on which tower was destroyed night 1
//     - A or E destroyed: E→F→G→H→A  (all 8 rebuilt)
//     - B destroyed:      E→F→G→H→A  (B still missing; end at A)
//     - C destroyed:      E→F→G→H→G  (C still missing; end at G, opposite C)
//     - D destroyed:      E→F→G→H    (D still missing; end at H, opposite D)
//   Day 3: rebuild remaining missing towers from night 2, position for day 4
//   Day 4: visit any towers destroyed on night 3 (always reachable ≤ 4 edges)

export const smartBotStrategy = ({ board, ctx, moves }: StrategyArgs<Board>) => {
  if (ctx.currentPlayer === 0) {
    const path = getOptimalArchitectPath(board);
    executeArchitectPath(path, board, moves);
  } else {
    executeBanditStrategy(board, moves);
  }
};

const executeArchitectPath = (path, board, moves) => {
  if (path.length === 0) {
    moves.endDay(board);
    return;
  }
  const [next, ...rest] = path;
  const { nextBoard } = moves.moveArchitect(board, next);
  setTimeout(() => executeArchitectPath(rest, nextBoard, moves), 600);
};

const getOptimalArchitectPath = (board: Board) => {
  const pos = board.architectPosition;
  const towers = board.towers;
  const day = board.day;
  const missing = towers.map((t, i) => (!t ? i : null)).filter(i => i !== null);

  if (day === 1) {
    return [1, 2, 3, 4]; // A→B→C→D→E
  }

  if (day === 2) {
    // Architect is at E(4). Find which vertex among 0-4 was destroyed night 1.
    const night1 = missing.find((v) => v <= 4);
    if (night1 === 2) return [5, 6, 7, 6]; // C: E→F→G→H→G
    if (night1 === 3) return [5, 6, 7];     // D: E→F→G→H
    return [5, 6, 7, 0];                    // A, E, B, or none: E→F→G→H→A
  }

  if (day === 3) {
    if (missing.length === 0) return []; // all 8 towers already stand; just end day

    if (missing.length === 1) {
      // All 8 were rebuilt on day 2 (A or E case); night 2 destroyed one vertex.
      // Architect is at A(0). Go to the missing vertex.
      return shortestPathTo(pos, missing[0]);
    }

    // 2 missing: one persists from night 1 (C or D), one from night 2.
    if (pos === 0) {
      // B(1) missing from night 1, architect at A. Night-2 destroyed v.
      const v = missing.find((m) => m !== 1);
      if (v === undefined) return shortestPathTo(0, 1);
      if ([0, 2, 3, 4].includes(v)) return [1, 2, 3, 4]; // A→B→C→D→E
      if (v === 5) return [1];          // A→B (end at B, opposite F)
      if (v === 6) return [1, 2];       // A→B→C (end at C, opposite G)
      return [1, 2, 3];                 // v=7: A→B→C→D (end at D, opposite H)
    }

    if (pos === 6) {
      // C(2) missing from night 1, architect at G(6).
      const v = missing.find((m) => m !== 2);
      // Path G→H→A→B→C covers {7,0,1} plus start(6); path G→F→E→D→C covers {5,4,3}
      if (v === undefined || [7, 0, 1, 6].includes(v)) return [7, 0, 1, 2];
      return [5, 4, 3, 2];
    }

    // pos === 7: D(3) missing from night 1, architect at H(7).
    const v = missing.find((m) => m !== 3);
    // Path H→A→B→C→D covers {0,1,2}; path H→G→F→E→D covers {6,5,4}
    if (v === undefined || [0, 1, 2, 7].includes(v)) return [0, 1, 2, 3];
    return [6, 5, 4, 3];
  }

  if (day === 4) {
    if (missing.length === 0) return [];

    if (missing.length === 1) {
      return shortestPathTo(pos, missing[0]);
    }

    // 2 missing: one is F/G/H (persists from night 2 in the B-case), one from night 3.
    // Architect is at B(1), C(2), or D(3) — the vertex opposite to the night-2 missing one.
    // Two equal-length paths (length 4) from pos to farMissing cover all other vertices.
    const farMissing = missing.find((v) => v >= 5); // F(5), G(6), or H(7)
    const nearMissing = missing.find((v) => v !== farMissing);

    const pathCW = clockwisePath(pos, farMissing!);
    if (nearMissing === undefined || pathCW.includes(nearMissing)) return pathCW;
    return counterclockwisePath(pos, farMissing!);
  }

  return [];
};

// Bandit heuristic: pick the tower that maximises the
// minimum path the architect needs to cover all missing+newly-destroyed vertices.
// Destroying the architect's current position is excluded: startNextDay rebuilds it for free.


// Night 2 is where it can fail. Let me try to construct a counterexample.

// State after day 2: architect at H(7), missing = {B(1)} — arises naturally if
// day 1 was optimal (A→B→C→D→E), night 1 destroyed B, and the human architect
// played day 2 as E→F→G→H instead of going back toward B.

// Heuristic evaluates minPathToVisitAll(H=7, {B=1, v}) for each candidate v:

// Destroy E(4): path = 5 (CW: H→A→B→C→D→E)
// Destroy F(5): path = 6 (need to span both B and F from H)
// Heuristic picks F. But E is the correct move. Here is why:

// After destroying F: missing = {B, F}. Architect can go H→A→B (covers B, 2 steps) ending at B(1).
// From B(1) with only F missing, checking all night-3 options: none can push path above 4.
// The architect can always go B→A→H→G→F or similar. Bandits cannot win.

// After destroying E: missing = {B, E}. Architect cannot cover both on day 3 (path = 5 > 4). Whatever they do:

// Cover B, end at B(1), E still missing → night 3 destroys A(0): minPathToVisitAll(1, {4,0}) = 5 > 4. Bandits win.
// Cover B, end at C(2), E still missing → night 3 destroys H(7): path = 6 > 4. Bandits win.
// Cover B, end at D(3), E still missing → night 3 destroys A(0): path = 5 > 4. Bandits win.
// Cover E, end at E(4), B still missing → night 3 destroys H(7): path = 5 > 4. Bandits win.
// Cover E, end at D(3), B still missing → night 3 destroys G(6): path = 5 > 4. Bandits win.
// Cover E, end at F(5), B still missing → night 3 destroys H(7): path = 6 > 4. Bandits win.
// So the heuristic is provably suboptimal: it picked F(5) (path 6) over E(4) (path 5),
// but E is the game-winning move and F is not.

const executeBanditStrategy = (board: Board, moves) => {
  const pos = board.architectPosition;
  const candidates = board.towers
    .map((t, i) => (t && i !== pos ? i : null))
    .filter(i => i !== null);
  if (candidates.length === 0) {
    moves.destroyTower(board, pos);
    return;
  };

  const missing = board.towers
    .map((t, i) => (!t && i !== pos ? i : null))
    .filter(i => i !== null);

  const best = maxBy(
    candidates.map(v => ({ v, len: minPathToVisitAll(pos, [...missing, v]) })),
    'len'
  )!;
  moves.destroyTower(board, best.v);
};

// Minimum moves to visit all targets from pos on an 8-cycle.
// Tries all k+1 arc splits: j targets covered going CW, the rest going CCW.
const minPathToVisitAll = (pos, targets) => {
  if (targets.length === 0) return 0;
  const cwDists = targets.map((v) => (v - pos + 8) % 8).sort((a, b) => a - b);
  const k = cwDists.length;
  let best = Infinity;
  for (let j = 0; j <= k; j++) {
    const cwReach = j > 0 ? cwDists[j - 1] : 0;
    const ccwReach = j < k ? 8 - cwDists[j] : 0;
    const cost = cwReach === 0 ? ccwReach
      : ccwReach === 0 ? cwReach
        : Math.min(2 * cwReach + ccwReach, cwReach + 2 * ccwReach);
    best = Math.min(best, cost);
  }
  return best;
};

const directedPath = (from, to, step) => {
  const path: number[] = [];
  let cur = from;
  while (cur !== to) {
    cur = (cur + step + 8) % 8;
    path.push(cur);
  }
  return path;
};

const shortestPathTo = (from, to) => {
  if (from === to) return [];
  const step = (to - from + 8) % 8 <= (from - to + 8) % 8 ? 1 : -1;
  return directedPath(from, to, step);
};

const clockwisePath = (from, to) => directedPath(from, to, 1);

const counterclockwisePath = (from, to) => directedPath(from, to, -1);
