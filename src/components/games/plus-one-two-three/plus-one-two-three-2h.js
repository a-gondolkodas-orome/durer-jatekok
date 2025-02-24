import React from 'react';
import { strategyHHGameFactory } from '../strategy-game';
import { range } from 'lodash';

const target = 40;
const maxStep = 3;

const BoardClient = ({ board, ctx, moves }) => {

  const isMoveAllowed = number => {
    if (ctx.phase !== 'play') return false;
    return isIncreaseValid({ board, number });
  }

  const clickNumber = (number) => {
    if (!isMoveAllowed(number)) return;
    moves.increaseTo(board, number);
  };

  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      <div className="flex flex-wrap mb-1">
      {range(target + maxStep + 1).map(i =>
        <button
          key={i}
          disabled={!isMoveAllowed(i)}
          onClick={() => clickNumber(i)}
          className={`
            border-2 text-2xl min-w-[4ch] text-center p-1 my-1 font-bold
            enabled:bg-emerald-200 enabled:hover:bg-emerald-400 enabled:focus:bg-emerald-400
            ${i === target ? 'border-8 border-black' : '' }
            ${i < board ? 'bg-slate-400' : ''}
            ${i === board ? 'bg-slate-200' : ''}
            ${i > target ? 'text-slate-400 border-rose-600' : ''}
          `}
        >{ i === board ? 'X' : i }
      </button>
      )}
    </div>
    </section>
  );
};

const isIncreaseValid = ({ board, number }) => {
  if (number <= board) return false;
  return (number - board) <= maxStep;
}

const moves = {
  increaseTo: (board, { ctx, events }, number) => {
    if (!isIncreaseValid({ board, number })) {
      console.error('invalid_move');
    }
    events.endTurn();
    if (number > target) {
      events.endGame({ winnerIndex: 1 - ctx.currentPlayer })
    }
    return { nextBoard: number }
  }
};

const rule = <>
  A játék a nullával indul. A játékosok felváltva
  lépnek a pozitív egész számokon: a soron következő játékos mindig 1-gyel, 2-vel vagy 3-mal
  léphet előre. Az veszít, aki először lép {target}-nél nagyobb számra.
</>;

export const PlusOneTwoThree2H = strategyHHGameFactory({
  rule,
  title: '+1, +2, +3',
  BoardClient,
  getPlayerStepDescription: () => 'Válaszd ki, hogy melyik számra lépsz.',
  generateStartBoard: () => 0,
  moves
});
