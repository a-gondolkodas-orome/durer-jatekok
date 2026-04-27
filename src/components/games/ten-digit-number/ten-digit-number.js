import React from 'react';
import { sample } from 'lodash';
import { strategyGameFactory } from '../../game-factory/strategy-game';
import { gameList } from '../gameList';
import { useTranslation } from '../../language/translate';

const totalDigits = 10;
const availableDigits = [1, 2, 3, 4, 5, 6];

// Precompute winner(sumMod9, turnsLeft): 0 = Jenő wins, 1 = Béla wins, with optimal play.
// Jenő is player 0 (first mover), Béla is player 1.
// Béla wins iff the final digit sum ≡ 0 (mod 9).
const winnerFromState = (() => {
  const memo = {};
  const compute = (sumMod9, turnsLeft) => {
    const key = `${sumMod9},${turnsLeft}`;
    if (key in memo) return memo[key];
    if (turnsLeft === 0) return (memo[key] = sumMod9 === 0 ? 1 : 0);
    const currentPlayer = (totalDigits - turnsLeft) % 2;
    for (const d of availableDigits) {
      if (compute((sumMod9 + d) % 9, turnsLeft - 1) === currentPlayer) {
        return (memo[key] = currentPlayer);
      }
    }
    return (memo[key] = 1 - currentPlayer);
  };
  for (let t = 0; t <= totalDigits; t++) for (let s = 0; s < 9; s++) compute(s, t);
  return compute;
})();

const BoardClient = ({ board, ctx, moves }) => {
  const { t } = useTranslation();
  const slots = Array.from({ length: totalDigits }, (_, i) =>
    i < board.digits.length ? board.digits[i] : null
  );

  let numberSummary = null;
  if (board.digits.length === totalDigits) {
    const num = parseInt(board.digits.join(''), 10);
    const quotient = Math.floor(num / 9);
    const remainder = board.sumMod9;
    const expr = remainder === 0
      ? `${num} = ${quotient} · 9`
      : `${num} = ${quotient} · 9 + ${remainder}`;
    numberSummary = t({ hu: `A szám: ${expr}`, en: `The number: ${expr}` });
  }

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <div className="flex gap-1 mb-2 flex-wrap">
        {slots.map((d, i) => (
          <div
            key={i}
            className={`border-2 w-10 h-12 flex items-center justify-center text-2xl font-bold
              ${d !== null
                ? 'border-slate-600'
                : 'bg-slate-100 border-slate-400 text-slate-400'}`}
          >
            {d !== null ? d : '?'}
          </div>
        ))}
      </div>
      {numberSummary && <p className="text-sm text-slate-500 mb-2">{numberSummary}</p>}
      {ctx.isClientMoveAllowed && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex gap-2 flex-wrap">
            {availableDigits.map(d => (
              <button
                key={d}
                onClick={(e) => { moves.chooseDigit(board, d); e.currentTarget.blur(); }}
                className="border-2 border-slate-300 rounded-xl text-2xl w-12 h-12 font-bold shadow-sm
                  hover:bg-sky-100 hover:border-sky-300 focus:bg-sky-100 focus:border-sky-300 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const moves = {
  chooseDigit: (board, { events }, digit) => {
    const newDigits = [...board.digits, digit];
    const newSumMod9 = (board.sumMod9 + digit) % 9;
    const nextBoard = { digits: newDigits, sumMod9: newSumMod9 };
    if (newDigits.length === totalDigits) {
      events.endGame({ winnerIndex: newSumMod9 === 0 ? 1 : 0 });
    } else {
      events.endTurn();
    }
    return { nextBoard };
  }
};

const aiBotStrategy = ({ board, moves }) => {
  const turnsLeft = totalDigits - board.digits.length;
  const currentPlayer = (totalDigits - turnsLeft) % 2;

  // Jenő (player 0) always has a winning strategy: on the first move any digit works;
  // on later moves, 7 minus Béla's last digit guarantees the total sum ≡ d₁+28 (mod 9),
  // which is never 0. Pick randomly among all winning moves.
  const winningDigits = availableDigits.filter(
    d => winnerFromState((board.sumMod9 + d) % 9, turnsLeft - 1) === currentPlayer
  );
  if (winningDigits.length > 0) {
    moves.chooseDigit(board, sample(winningDigits));
    return;
  }

  // Losing position: minimise opponent's winning replies, pick randomly among equally bad moves.
  const opponentWinCount = d => {
    const nextSumMod9 = (board.sumMod9 + d) % 9;
    if (turnsLeft < 2) return 0;
    return availableDigits.filter(
      d2 => winnerFromState((nextSumMod9 + d2) % 9, turnsLeft - 2) === (1 - currentPlayer)
    ).length;
  };
  const minCount = Math.min(...availableDigits.map(opponentWinCount));
  const leastBadDigits = availableDigits.filter(d => opponentWinCount(d) === minCount);
  moves.chooseDigit(board, sample(leastBadDigits));
};

const rule = {
  hu: <>
    Jenő és Béla felváltva választanak egy-egy számjegyet az &#123;1, 2, 3, 4, 5, 6&#125; halmazból
    (Jenő kezd), és egymás mellé írják őket – így közösen felépítenek egy 10 jegyű számot.
    Béla nyer, ha a kapott szám osztható 9-cel, egyébként Jenő nyer.
  </>,
  en: <>
    Jenő and Béla alternately choose a digit from &#123;1, 2, 3, 4, 5, 6&#125; (Jenő starts),
    writing them one after another to build a 10-digit number together.
    Béla wins if the resulting number is divisible by 9; otherwise Jenő wins.
  </>
};

const { name, title, credit } = gameList.TenDigitNumber;
export const TenDigitNumber = strategyGameFactory({
  presentation: {
    rule,
    title: title || name,
    credit,
    roleLabels: [
      { hu: 'Jenő (1.)', en: 'Jenő (1.)' },
      { hu: 'Béla (2.)', en: 'Béla (2.)' }
    ],
    getPlayerStepDescription: () => ({
      hu: 'Válassz egy számjegyet 1 és 6 között.',
      en: 'Choose a digit between 1 and 6.'
    })
  },
  BoardClient,
  gameplay: { moves },
  variants: [{ botStrategy: aiBotStrategy, generateStartBoard: () => ({ digits: [], sumMod9: 0 }) }]
});
