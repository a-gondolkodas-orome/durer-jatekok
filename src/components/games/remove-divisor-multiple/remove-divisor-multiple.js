import React, { Fragment } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { range, cloneDeep } from 'lodash';

const BoardClient = ({ board, ctx, moves }) => {
  const isMoveAllowed = n => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    if (board.previousMove === null) {
      return true;
    }
    if (board.previousMove > n && board.previousMove % n === 0) {
      return true;
    } else if (board.previousMove < n && n % board.previousMove === 0) {
      return true;
    }
    return false;
  }
  const removeNumber = n => {
    if (!isMoveAllowed(n)) return;
    moves.removeNumber(board, n);
  }
  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <svg width="100%" height="100%" viewBox='0 0 200 200'>
        {
          range(board.numbersOnTable.length).map(n => (
            <Fragment key={n}>
              <rect
                key={`${n}rect`}
                x={(n%5)*40+5} y={Math.floor(n/5)*40+5+20+20} width={30} height={30} fill="white"
                stroke= {board.numbersOnTable[n] ?
                                (board.previousMove%(n+1)===0 || (n+1)%board.previousMove===0)? "green" : "lightgreen" : "red"}
                opacity={ board.numbersOnTable[n] ? 1 : 0.1}
                strokeWidth="1%"
                onClick={() => removeNumber(n+1)}
              />
              <text
                key={`${n}text`}
                x={(n%5)*40+20}
                y={Math.floor(n/5)*40+20+20+20}
                fontSize="100%"
                textAnchor="middle"
                dominantBaseline="middle"
                opacity={ board.numbersOnTable[n] ? 1 : 0.1}
                fill="black"
                onClick={() => removeNumber(n+1)}>
                  {n+1}
              </text>
            </Fragment>
          ))}
        <text x="5" y="30" fontSize="10" textAnchor="start"  fill="black">Az előző lépés: {board.previousMove === null ? "" : board.previousMove}</text>
        <text x="5" y="10" fontSize="10" textAnchor="start"  fill="black">A mostani játékban n={board.numbersOnTable.length}</text>
      </svg>
    </section>
  )
};

const moves = {
  removeNumber: (board, { events }, n) => {
    const nextBoard = cloneDeep(board);
    nextBoard.numbersOnTable[n - 1] = false;
    nextBoard.previousMove = n;
    events.endTurn();
    if (nextBoard.numbersOnTable.filter(x => x).length === 0) {
      events.endGame();
    }
    return { nextBoard };
  }
};

const aiBotStrategy = ({ board, moves }) => {
  moves.removeNumber(board, 1);
};

const rule = <>
  Egy táblára az <i>1</i>, <i>2</i>, <i>...</i>, <i>n</i> számok (<i>n &#8804; 9</i>)
  vannak felírva. Két játékos játszik, felváltva lépnek. A kezdőjátékos az első
  lépésében kiválaszt egy tetszőleges számot a tábláról és letörli azt. Ezután
  minden lépésben egy olyan számot kell letörölni, ami az előző (másik játékos
  által letörölt) számnak osztója vagy többszöröse. Az veszít, aki nem tud lépni.
</>;

const getPlayerStepDescription = () =>
  'Válassz egyet a letörölhető számok közül.';

export const RemoveDivisorMultiple = strategyGameFactory({
  rule,
  title: 'Osztó/Többszörös Törlés',
  BoardClient,
  getPlayerStepDescription,
  generateStartBoard: () => ({
    numbersOnTable: Array(8).fill(true),
    previousMove: null
  }),
  aiBotStrategy,
  moves
});
