import React from 'react';
import { strategyGameFactory } from '../strategy-game';
import { cloneDeep, isEqual } from 'lodash';

const BoardClient = ({ board, ctx, moves }) => {
  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <div className="flex flex-wrap">
        <span className="grow px-2">
          <button
            className="cta-button"
            onClick = {() => moves.removeStone(board, 0)}
            disabled={!ctx.shouldRoleSelectorMoveNext || board.isLastMoveFromLeftByPlayer[ctx.currentPlayer]}
          >
            Bal: {board.piles[0]}
          </button>
        </span>
        <span className='grow px-2'>
          <button
            className="cta-button"
            onClick = {() => moves.removeStone(board, 1)}
            disabled={!ctx.shouldRoleSelectorMoveNext}
          >
            Jobb: {board.piles[1]}
          </button>
        </span>
      </div>
    </section>
  )
};

const moves = {
  removeStone: (board, { ctx, events }, pileId) => {
    const nextBoard = cloneDeep(board);
    nextBoard.piles[pileId] = board.piles[pileId] - 1;
    nextBoard.isLastMoveFromLeftByPlayer[ctx.currentPlayer] = (pileId === 0);
    events.endTurn();
    if (isGameEnd(nextBoard, ctx)) {
      events.endGame();
    }
    return { nextBoard };
  }
};

const isGameEnd = (board, ctx) => {
  if (isEqual(board.piles, [0, 0])) {
    return true;
  }
  if (board.piles[1] === 0 && board.isLastMoveFromLeftByPlayer[1 - ctx.currentPlayer]) {
    return true;
  }
  return false;
}

const aiBotStrategy = ({ board, ctx, moves }) => {
  if (board.piles[1] > 0) {
    moves.removeStone(board, 1);
  } else {
    moves.removeStone(board, 0);
  }
};

const rule = <>
  Két kupacban kavicsok vannak elhelyezve, a bal oldaliban <i>b</i>, a jobb
  oldaliban <i>j</i> darab, amelyekkel két játékos játszik. Felváltva
  lépnek, és minden lépés során egy kavicsot kell elvenniük valamelyik kupacból.
  Egy játékos azonban nem vehet el két egymást követő lépésben a bal oldali
  kupacból. Az veszít, aki nem tud lépni.
</>;

const getPlayerStepDescription = () =>
  'Kattints a kupacra ahonnan el szeretnél venni egy kavicsot.';

const generateStartBoard = () => {
  return {
    piles: [6, 3],
    isLastMoveFromLeftByPlayer: [false, false]
  };
}

export const StonesRemoveOneNotTwiceFromLeft = strategyGameFactory({
  rule,
  title: 'Kavicsgyűjtés egyesével',
  BoardClient,
  getPlayerStepDescription,
  generateStartBoard,
  aiBotStrategy,
  moves
});
