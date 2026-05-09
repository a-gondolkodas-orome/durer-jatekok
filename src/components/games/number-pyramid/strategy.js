import { random, range, sample, sampleSize, shuffle, sum } from 'lodash';

// Slot states: null = empty placeholder, { value, state:'active'|'consumed' }
const activeSlotIndices = (level) =>
  level.flatMap((s, i) => (s?.state === 'active' ? [i] : []));

export const activeCount = (level) => activeSlotIndices(level).length;

const twoActiveIndicesByValue = (level, descending) => {
  const sign = descending ? -1 : 1;
  const sorted = activeSlotIndices(level).sort((a, b) => sign * (level[a].value - level[b].value));
  return sorted.slice(0, 2);
};

export const findImmediateWin = (levels, k) => {
  for (const [levelIdx, level] of levels.entries()) {
    const actives = activeSlotIndices(level);
    const pair = actives.flatMap((idx1, ii) =>
      actives.slice(ii + 1).map((idx2) => [idx1, idx2])
    ).find(([idx1, idx2]) => level[idx1].value + level[idx2].value >= k);
    if (pair) return { levelIdx, indices: pair };
  }
  return null;
};

export const isP2WinningPosition = (sortedInitial, k) => {
  const s = sortedInitial;
  return s[0] + s[1] + s[6] + s[7] < k && s[2] + s[3] + s[4] + s[5] >= k;
};

export const randomBotStrategy = ({ board, moves }) => {
  const { levels, k } = board;

  const win = findImmediateWin(levels, k);
  if (win) { moves.combineTwo(board, win); return; }

  const available = range(3).filter((li) => activeCount(levels[li]) >= 2);
  const li = sample(available);
  const actives = activeSlotIndices(levels[li]);
  moves.combineTwo(board, { levelIdx: li, indices: sampleSize(actives, 2) });
};

export const aiBotStrategy = ({ board, ctx, moves }) => {
  const { levels, k, sortedInitial } = board;

  const win = findImmediateWin(levels, k);
  if (win) { moves.combineTwo(board, win); return; }

  const botIsWinner = isP2WinningPosition(sortedInitial, k) === (ctx.currentPlayer === 1);

  const tryLevel = (levelIdx, descending = true) => {
    if (activeCount(levels[levelIdx]) < 2) return false;
    const indices = twoActiveIndicesByValue(levels[levelIdx], descending);
    moves.combineTwo(board, { levelIdx, indices });
    return true;
  };

  if (botIsWinner) {
    if (ctx.currentPlayer === 0) {
      if (tryLevel(1) || tryLevel(0) || tryLevel(2)) return;
    } else {
      if (tryLevel(1) || tryLevel(0, false)) return;
    }
  }

  for (let li = 0; li < 3; li++) {
    if (tryLevel(li)) return;
  }
};

export const generateStartBoard = () => {
  const nums = Array.from({ length: 8 }, () => random(2, 15));
  nums.sort((a, b) => b - a);
  const extremes = nums[0] + nums[1] + nums[6] + nums[7];
  const innerSum = nums[2] + nums[3] + nums[4] + nums[5];
  const total = sum(nums);
  const topTwo = nums[0] + nums[1];
  let k = null;
  if (random(0, 1) === 0 && extremes < innerSum && extremes > topTwo) {
    k = random(extremes + 1, innerSum);
  } else if (innerSum < total && innerSum > topTwo) {
    k = random(innerSum + 1, total);
  }
  if (k === null) return generateStartBoard();

  return {
    levels: [
      shuffle(nums).map((n) => ({ value: n, state: 'active' })),
      Array(4).fill(null),
      Array(2).fill(null),
      Array(1).fill(null)
    ],
    k,
    sortedInitial: [...nums]
  };
};
