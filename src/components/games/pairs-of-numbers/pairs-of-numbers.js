import React from 'react';
import { strategyGameFactory } from '../strategy-game';
import { random } from 'lodash';

const BoardClient = ({ board, ctx, moves }) => {
  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      <p className='w-full text-8xl font-bold text-center'>
        <code>({board[0]},{board[1]})</code>
      </p>
      <div className="flex flex-wrap">
        <span className="grow px-2">
          <button
            className='cta-button'
            disabled={!ctx.shouldRoleSelectorMoveNext}
            onClick={() => moves.add1(board)}
          >
            Növelek {ctx.shouldRoleSelectorMoveNext && <>
              (→<code className="text-md">({board[0]},{board[1] + 1})</code>)
            </>}
          </button>
        </span>
        <span className='grow px-2'>
          <button
            className="cta-button"
            disabled={!ctx.shouldRoleSelectorMoveNext}
            onClick={() => moves.subtract(board)}
          >
            Kivonok {ctx.shouldRoleSelectorMoveNext && <>
              (→<code className="text-md">({board[0] - board[1]},{board[1]})</code>)
            </>}
          </button>
        </span>
      </div>
    </section>
  );
};

const moves = {
  add1: (board, { events }) => {
    events.endTurn();
    return { nextBoard: [board[0], board[1] + 1] }
  },
  subtract: (board, { events }) => {
    events.endTurn();
    if (board[0] - board[1] <= 0) {
      events.endGame();
    }
    return { nextBoard: [board[0] - board[1], board[1]] };
  }
};

const aiBotStrategy = ({ board, moves }) => {
  //TODO:
  moves.subtract(board);
};

const rule = <>
  Kezdetben egy pozitív egészekből álló <code>(n, k)</code> rendezett számpár van
  felírva egy lapra. Két játékos felváltva lép, ha a nem áthúzott <code>(a, b)</code> számpár
  szerepel a lapon, a soron lévő játékosnak egy lépésben át kell húznia <code>(a, b)</code>-t és
helyette felírnia vagy az <code>(a, b + 1)</code>, vagy az <code>(a − b, b)</code> számpárt.
Az nyer, aki először ír fel olyan számpárt, amelyben nem mindkét szám pozitív.
</>;

const getPlayerStepDescription = ({ board }) => {
  return 'Növeld a második számot eggyel vagy vond ki az elsőből.';
}

export const PairsOfNumbers = strategyGameFactory({
  rule,
  title: 'Számpár módosítás',
  BoardClient,
  getPlayerStepDescription,
  // TODO:
  generateStartBoard: () => [random(20, 40), random(10, 20)],
  aiBotStrategy,
  moves
});
