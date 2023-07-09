import React, { useState } from 'react';
import { range, sum, isEqual } from 'lodash';
import { strategyGameFactory } from '../strategy-game';
import { getOptimalTileIndex } from './strategy';

const generateNewBoard = () => [0, 0, 0, 0];

const isGameEnd = board => sum(board) === 6;

const hasPlayerWon = ({ board, playerIndex }) => {
  if (!isGameEnd(board)) return false;
  const isAllDifferent = isEqual([...board].sort(), [0, 1, 2, 3]);
  return (
    (playerIndex === 0 && !isAllDifferent) ||
    (playerIndex === 1 && isAllDifferent)
  );
};

const addPiece = (board, pileId) => {
  const newBoard = [...board];
  newBoard[pileId] += 1;
  return newBoard;
};

const aiStep = (board) => {
  const pileId = getOptimalTileIndex(board);
  return addPiece(board, pileId);
};

const GameBoard = ({ board, ctx }) => (
  <section className="p-2 shrink-0 grow basis-2/3">
    <div className="grid grid-cols-2 gap-0 border-2">
      {range(board.length).map(id =>
        <button
          key={id}
          disabled={!ctx.shouldPlayerMoveNext}
          onClick={() => ctx.endPlayerTurn(addPiece(board, id))}
          className="aspect-square border-2 p-[4%]"
        >
          {range(board[id]).map((i) =>
            <span
              key={i}
              className={`m-[3%] aspect-square inline-block bg-blue-600 rounded-full ${board[id] <= 4 ? 'w-[40%]' : 'w-[25%]'}`}
            >
            </span>
          )}
      </button>
      )}
    </div>
  </section>
);

const stepDescription = () => 'Kattints arra a mezőre, ahova korongot szeretnél lerakni.';

const rule = <>
  Adott egy 2 × 2-es táblázat, és hozzá mindkét játékosnak van 3 db korongja. A
  játék során felváltva tesznek le ezekből egyet-egyet a táblázat tetszőleges mezőjére. A második
  játékos akkor nyer, ha a játék végén minden mezőben különböző számú korong található. (Azaz
  0, 1, 2, 3 a kiosztás a végén valamilyen sorrendben). Minden egyéb esetben pedig a kezdő játékos
  nyer.

  Te döntheteted el, hogy a kezdő vagy a második játékos bőrébe szeretnél e bújni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: '2x2-es játék',
  GameBoard,
  G: {
    stepDescription,
    generateNewBoard,
    aiStep,
    isGameEnd,
    hasPlayerWon
  }
});

export const TwoTimesTwo = () => {
  const [board, setBoard] = useState(generateNewBoard());

  return <Game board={board} setBoard={setBoard} />;
};
