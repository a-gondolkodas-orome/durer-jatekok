import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { range, sum, sample } from 'lodash';

const BoardClient = ({ board, ctx, events }) => {

  const clickNumber = (number) => {
    if (ctx.shouldRoleSelectorMoveNext) {
      let nextBoard = [...board];
      nextBoard[number-1] = -1;
      events.endTurn(getGameStateAfterMove(nextBoard));
    }
  };


  return(
    <section className="p-2 shrink-0 grow basis-2/3">
    <table className="border-collapse table-fixed w-full">
      <tbody>
        <tr>
        {range(board.length).map(i => (
          board[i]!==-1
          ? <td
              className='border-4 aspect-square text-center'
              key = {i}
            >
              <button
                disabled={!ctx.shouldRoleSelectorMoveNext}
                className='w-full enabled:hover:bg-gray-400 enabled:focus:bg-gray-400'
                onClick={() => clickNumber(i+1)}
              >
                {board[i]}
              </button>
            </td>
          : <td
              className='text-center border-4 bg-gray-600'
              key = {i}
            >X</td>
        ))}
        </tr>
      </tbody>
    </table>
    <p>Megmaradt számok összege: {sum(board.filter(i => i > 0))}</p>
    </section>
  );
};

const getGameStateAfterMove = (nextBoard) => {
  const remaining = nextBoard.filter(i => i>0);
  const isGameEnd = remaining.length === 2;
  const winnerIndex = isGameEnd ? sum(remaining) % 2 : null;
  return { nextBoard, isGameEnd, winnerIndex };
};

const getGameStateAfterAiTurn = ({ board, ctx }) => {
  let nextBoard = [...board];
  const notCovered = nextBoard.filter(i => i !== -1);
  const evens = notCovered.filter(i => i%2 === 0);
  const odds = notCovered.filter(i => i%2 === 1);
  if (evens.length===odds.length || evens.length === 0 || odds.length === 0) {
    nextBoard[sample(notCovered) - 1] = -1;
  } else {
    if (ctx.chosenRoleIndex === 0){
      const candidates = evens.length > odds.length ? evens : odds;
      nextBoard[sample(candidates) - 1] = -1;
    } else {
      const candidates = evens.length > odds.length ? odds : evens;
      nextBoard[sample(candidates) - 1] = -1;
    }
  }

  return getGameStateAfterMove(nextBoard);
};

const rule8 = <>
Egy táblázatban 1-től 8-ig szerepelnek a számok. Két játékos felváltva takar le egy-egy
számot addig, amíg csak két szám marad. Ha a megmaradt két szám összege páros, akkor a kezdő
nyer, ha pedig páratlan, akkor a második.
</>;

const rule10 = <>
Egy táblázatban 1-től 10-ig szerepelnek a számok. Két játékos felválva takar le egy-egy
számot addig, amíg csak két szám marad. Ha a megmaradt két szám összege páros, akkor a kezdő
nyer, ha pedig páratlan, akkor a második.
</>;

export const NumberCovering8 = strategyGameFactory({
  rule: rule8,
  title: 'Számok lefedés 1-től 8-ig',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy számra, hogy lefedd.',
  generateStartBoard: () => range(1, 9),
  getGameStateAfterAiTurn
});

export const NumberCovering10 = strategyGameFactory({
  rule: rule10,
  title: 'Számok lefedés 1-től 10-ig',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy számra, hogy lefedd.',
  generateStartBoard: () => range(1, 11),
  getGameStateAfterAiTurn
});
