import React, { useState } from 'react';
import { random, sample, cloneDeep, shuffle } from 'lodash';
import { strategyGameFactory } from '../../game-factory/strategy-game';
import { useTranslation } from '../../language/translate';

// Level sizes: levels[0]=8 slots, levels[1]=4, levels[2]=2, levels[3]=1
const MAX_SLOTS = [8, 4, 2, 1];

// Slot states: null = empty placeholder, { value, state:'active'|'consumed' }
const activeSlotIndices = (level) =>
  level.flatMap((s, i) => (s?.state === 'active' ? [i] : []));

const activeCount = (level) => activeSlotIndices(level).length;

const twoLargestActiveIndices = (level) => {
  let first = -1, second = -1;
  for (let i = 0; i < level.length; i++) {
    if (level[i]?.state !== 'active') continue;
    if (first === -1 || level[i].value >= level[first].value) { second = first; first = i; }
    else if (second === -1 || level[i].value >= level[second].value) { second = i; }
  }
  return [first, second];
};

const twoSmallestActiveIndices = (level) => {
  let first = -1, second = -1;
  for (let i = 0; i < level.length; i++) {
    if (level[i]?.state !== 'active') continue;
    if (first === -1 || level[i].value <= level[first].value) { second = first; first = i; }
    else if (second === -1 || level[i].value <= level[second].value) { second = i; }
  }
  return [first, second];
};

const isP2WinningPosition = (sortedInitial, k) => {
  const s = sortedInitial;
  return s[0] + s[1] + s[6] + s[7] < k && s[2] + s[3] + s[4] + s[5] >= k;
};

const BoardClient = ({ board, ctx, events, moves }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const handleClick = (levelIdx, slotIdx) => {
    if (!ctx.isClientMoveAllowed) return;
    const slot = board.levels[levelIdx][slotIdx];
    if (!slot || slot.state !== 'active') return;

    if (selected === null) {
      if (activeCount(board.levels[levelIdx]) < 2) return;
      setSelected({ levelIdx, numIdx: slotIdx });
      events.setTurnState('selectSecond');
      return;
    }
    if (selected.levelIdx === levelIdx && selected.numIdx === slotIdx) {
      setSelected(null);
      events.setTurnState(null);
      return;
    }
    if (selected.levelIdx !== levelIdx) return;

    moves.combineTwo(board, { levelIdx, idx1: selected.numIdx, idx2: slotIdx });
    setSelected(null);
    events.setTurnState(null);
  };

  const levelLabels = [
    t({ hu: '4. szint', en: 'Level 4' }),
    t({ hu: '3. szint', en: 'Level 3' }),
    t({ hu: '2. szint', en: 'Level 2' }),
    t({ hu: '1. szint', en: 'Level 1' })
  ];

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <p className="text-center text-lg font-semibold mb-4">
        {t({ hu: 'Célszám (k)', en: 'Target (k)' })}:{' '}
        <span className="text-2xl font-bold text-blue-600">
          {board.k}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {[3, 2, 1, 0].map((levelIdx) => {
          const level = board.levels[levelIdx];
          const isWrongLevel = selected !== null && selected.levelIdx !== levelIdx;
          const isLoneLevel = selected === null && activeCount(level) < 2;
          return (
            <div key={levelIdx} className="flex flex-col items-center gap-1">
              <div className="flex flex-wrap justify-center gap-2">
                {level.map((slot, slotIdx) => {
                  if (slot === null) {
                    return (
                      <div
                        key={slotIdx}
                        className={
                          'rounded-lg border-2 border-dashed border-slate-200 px-3 py-2' +
                          ' font-bold text-lg min-w-12 text-center bg-slate-50 text-transparent select-none'
                        }
                      >
                        0
                      </div>
                    );
                  }
                  if (slot.state === 'consumed') {
                    return (
                      <div
                        key={slotIdx}
                        className={
                          'rounded-lg border-2 border-slate-200 px-3 py-2' +
                          ' font-bold text-lg min-w-12 text-center bg-slate-50 text-slate-300 line-through'
                        }
                      >
                        {slot.value}
                      </div>
                    );
                  }
                  const isSelected = selected &&
                    selected.levelIdx === levelIdx && selected.numIdx === slotIdx;
                  const baseChip = 'rounded-lg border-2 px-3 py-2 font-bold' +
                    ' text-lg min-w-12 text-center transition-colors ';
                  let chipCls = baseChip;
                  if (isSelected) {
                    chipCls += 'bg-blue-600 border-blue-700 text-white';
                  } else if (isWrongLevel || isLoneLevel || !ctx.isClientMoveAllowed) {
                    chipCls += 'bg-slate-100 border-slate-300 text-slate-500 cursor-default';
                  } else {
                    chipCls += 'bg-white border-slate-400 hover:bg-blue-50 hover:border-blue-400 cursor-pointer';
                  }
                  return (
                    <button
                      key={slotIdx}
                      className={chipCls}
                      onClick={() => handleClick(levelIdx, slotIdx)}
                      disabled={!ctx.isClientMoveAllowed || isWrongLevel || isLoneLevel}
                    >
                      {slot.value}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-slate-400">{levelLabels[3 - levelIdx]}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const moves = {
  combineTwo: (board, { ctx, events }, { levelIdx, idx1, idx2 }) => {
    const nextBoard = cloneDeep(board);
    const slot1 = nextBoard.levels[levelIdx][idx1];
    const slot2 = nextBoard.levels[levelIdx][idx2];
    const sum = slot1.value + slot2.value;
    slot1.state = 'consumed';
    slot2.state = 'consumed';
    const emptyIdx = nextBoard.levels[levelIdx + 1].findIndex((s) => s === null);
    nextBoard.levels[levelIdx + 1][emptyIdx] = { value: sum, state: 'active' };
    if (sum >= board.k) {
      events.endGame({ winnerIndex: ctx.currentPlayer });
      return { nextBoard };
    }
    events.endTurn();
    return { nextBoard };
  }
};

const randomBotStrategy = ({ board, moves }) => {
  const { levels, k } = board;

  for (let li = 0; li < 3; li++) {
    const actives = activeSlotIndices(levels[li]);
    for (let ii = 0; ii < actives.length; ii++) {
      for (let jj = ii + 1; jj < actives.length; jj++) {
        const i = actives[ii], j = actives[jj];
        if (levels[li][i].value + levels[li][j].value >= k) {
          moves.combineTwo(board, { levelIdx: li, idx1: i, idx2: j });
          return;
        }
      }
    }
  }

  const available = [];
  for (let li = 0; li < 3; li++) {
    if (activeCount(levels[li]) >= 2) available.push(li);
  }
  const li = sample(available);
  const actives = activeSlotIndices(levels[li]);
  const i = sample(actives);
  const j = sample(actives.filter((x) => x !== i));
  moves.combineTwo(board, { levelIdx: li, idx1: i, idx2: j });
};

const aiBotStrategy = ({ board, ctx, moves }) => {
  const { levels, k, sortedInitial } = board;

  for (let li = 0; li < 3; li++) {
    const actives = activeSlotIndices(levels[li]);
    for (let ii = 0; ii < actives.length; ii++) {
      for (let jj = ii + 1; jj < actives.length; jj++) {
        const i = actives[ii], j = actives[jj];
        if (levels[li][i].value + levels[li][j].value >= k) {
          moves.combineTwo(board, { levelIdx: li, idx1: i, idx2: j });
          return;
        }
      }
    }
  }

  const p2Wins = isP2WinningPosition(sortedInitial, k);
  const botIsWinner = (ctx.currentPlayer === 0 && !p2Wins) || (ctx.currentPlayer === 1 && p2Wins);

  if (botIsWinner) {
    if (ctx.currentPlayer === 0) {
      if (activeCount(levels[1]) >= 2) {
        const [i, j] = twoLargestActiveIndices(levels[1]);
        moves.combineTwo(board, { levelIdx: 1, idx1: i, idx2: j });
        return;
      }
      if (activeCount(levels[0]) >= 2) {
        const [i, j] = twoLargestActiveIndices(levels[0]);
        moves.combineTwo(board, { levelIdx: 0, idx1: i, idx2: j });
        return;
      }
      if (activeCount(levels[2]) >= 2) {
        const [i, j] = twoLargestActiveIndices(levels[2]);
        moves.combineTwo(board, { levelIdx: 2, idx1: i, idx2: j });
        return;
      }
    } else {
      if (activeCount(levels[1]) >= 2) {
        const [i, j] = twoLargestActiveIndices(levels[1]);
        moves.combineTwo(board, { levelIdx: 1, idx1: i, idx2: j });
        return;
      }
      if (activeCount(levels[0]) >= 2) {
        const [i, j] = twoSmallestActiveIndices(levels[0]);
        moves.combineTwo(board, { levelIdx: 0, idx1: i, idx2: j });
        return;
      }
    }
  }

  for (let li = 0; li < 3; li++) {
    if (activeCount(levels[li]) >= 2) {
      const [i, j] = twoLargestActiveIndices(levels[li]);
      moves.combineTwo(board, { levelIdx: li, idx1: i, idx2: j });
      return;
    }
  }
};

const generateStartBoard = () => {
  let nums, k;
  do {
    nums = Array.from({ length: 8 }, () => random(2, 15));
    nums.sort((a, b) => b - a);
    const top2bot2 = nums[0] + nums[1] + nums[6] + nums[7];
    const mid4 = nums[2] + nums[3] + nums[4] + nums[5];
    const total = nums.reduce((s, n) => s + n, 0);
    const a1a2 = nums[0] + nums[1];
    k = null;
    if (random(0, 1) === 0 && top2bot2 < mid4 && top2bot2 > a1a2) {
      k = random(top2bot2 + 1, mid4);
    } else if (mid4 < total && mid4 > a1a2) {
      k = random(mid4 + 1, total);
    }
  } while (k === null);

  return {
    levels: [
      shuffle(nums).map((n) => ({ value: n, state: 'active' })),
      Array(MAX_SLOTS[1]).fill(null),
      Array(MAX_SLOTS[2]).fill(null),
      Array(MAX_SLOTS[3]).fill(null)
    ],
    k,
    sortedInitial: [...nums]
  };
};

const rule = {
  hu: <>
    A játék kezdetén adott nyolc pozitív egész szám az első szinten, és egy <code>k</code> pozitív
    egész szám, ami nem nagyobb a nyolc szám összegénél. Egy lépésben a soron következő játékos
    letöröl két számot ugyanarról a szintről, és az összegüket az eggyel nagyobb sorszámú szintre
    írja. Az a játékos nyer, aki először ír olyan számot, ami legalább <code>k</code>.
  </>,
  en: <>
    At the start of the game, eight positive integers are given on the first level, along with a
    positive integer <code>k</code> not exceeding their sum. On each turn, the current player
    erases two numbers from the same level and writes their sum onto the next level up. The first
    player to write a number of at least <code>k</code> wins.
  </>
};

const getPlayerStepDescription = ({ ctx }) => {
  if (ctx.turnState === 'selectSecond') {
    return {
      hu: 'Válassz egy másik számot ugyanarról a szintről.',
      en: 'Select another number from the same level.'
    };
  }
  return {
    hu: 'Válassz két számot ugyanarról a szintről – összegük a következő szintre kerül.',
    en: 'Select two numbers from the same level – their sum moves to the next level up.'
  };
};

export const NumberPyramid = strategyGameFactory({
  presentation: {
    rule,
    getPlayerStepDescription
  },
  BoardClient,
  gameplay: { moves },
  variants: [
    {
      botStrategy: randomBotStrategy,
      label: { hu: 'Teszt 🤖', en: 'Test 🤖' }
    },
    {
      botStrategy: aiBotStrategy,
      generateStartBoard,
      label: { hu: 'Okos 🤖', en: 'Smart 🤖' },
      isDefault: true
    }
  ]
});
