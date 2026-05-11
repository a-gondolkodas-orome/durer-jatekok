import React from 'react';
import { cloneDeep, isEqual, sumBy } from 'lodash';
import { strategyGameFactory } from '../../game-factory/strategy-game';
import { useTranslation } from '../../language/translate';
import { hasActivePair, aiBotStrategy, generateStartBoard, randomBotStrategy } from './strategy';

const BoardClient = ({ board, ctx, events, moves }) => {
  const { t } = useTranslation();

  const handleClick = ({ levelIdx, slotIdx }) => {
    if (!ctx.isClientMoveAllowed) return;
    const slot = board.levels[levelIdx][slotIdx];
    if (!slot || slot.state !== 'active') return;

    if (ctx.turnState === null) {
      if (!hasActivePair(board.levels[levelIdx])) return;
      events.setTurnState({ levelIdx, slotIdx });
      return;
    }
    if (isEqual(ctx.turnState, { levelIdx, slotIdx })) {
      events.setTurnState(null);
      return;
    }

    moves.combineTwo(board, { levelIdx, indices: [ctx.turnState.slotIdx, slotIdx] });
  };

  const activeChipClass = (isSelected, isDisabled) => {
    const base = 'rounded-lg border-2 px-3 py-2 font-bold text-lg min-w-12 text-center transition-colors ';
    if (isSelected) return base + 'bg-blue-600 border-blue-700 text-white';
    if (isDisabled) return base + 'bg-slate-100 border-slate-300 text-slate-500 cursor-default';
    return base + 'bg-white border-slate-400 hover:bg-blue-50 hover:border-blue-400 cursor-pointer';
  };

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <p className="text-center text-lg font-semibold mb-4">
        {t({ hu: 'Célszám (k)', en: 'Target (k)' })}:{' '}
        <span className="text-2xl font-bold text-blue-600">
          {board.target}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {[3, 2, 1, 0].map((levelIdx) => {
          const level = board.levels[levelIdx];
          const isWrongLevel = ctx.turnState !== null && ctx.turnState.levelIdx !== levelIdx;
          const isLoneLevel = ctx.turnState === null && !hasActivePair(level);
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
                  const isSelected = isEqual(ctx.turnState, { levelIdx, slotIdx });
                  const isDisabled = isWrongLevel || isLoneLevel || !ctx.isClientMoveAllowed;
                  const chipCls = activeChipClass(isSelected, isDisabled);
                  return (
                    <button
                      key={slotIdx}
                      className={chipCls}
                      onClick={() => handleClick({ levelIdx, slotIdx })}
                      disabled={isDisabled}
                    >
                      {slot.value}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-slate-400">
                {t({ hu: `${levelIdx + 1}. szint`, en: `Level ${levelIdx + 1}` })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const moves = {
  combineTwo: (board, { ctx, events }, { levelIdx, indices }) => {
    const nextBoard = cloneDeep(board);

    const slots = indices.map((idx) => nextBoard.levels[levelIdx][idx]);
    const combinedValue = sumBy(slots, 'value');
    slots.forEach((slot) => { slot.state = 'consumed'; });

    const emptyIdx = nextBoard.levels[levelIdx + 1].findIndex((s) => s === null);
    nextBoard.levels[levelIdx + 1][emptyIdx] = { value: combinedValue, state: 'active' };

    events.setTurnState(null);
    if (combinedValue >= board.target) {
      events.endGame({ winnerIndex: ctx.currentPlayer });
      return { nextBoard };
    }
    events.endTurn();
    return { nextBoard };
  }
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
  if (ctx.turnState) {
    const level = ctx.turnState.levelIdx + 1;
    return {
      hu: `Válassz egy másik számot a ${level}. szintről.`,
      en: `Select another number from level ${level}.`
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
