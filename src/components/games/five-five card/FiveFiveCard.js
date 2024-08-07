import React, { useState } from 'react';
import { range, cloneDeep, isNull } from 'lodash';
import { strategyGameFactory } from '../strategy-game';
import { getGameStateAfterMove, getGameStateAfterAiTurn } from './strategy';

const GameBoard = ({ board, ctx }) => {
  const isMoveAllowed = (id) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    return board[id] === null;
  };
  const clickField = (id) => {
    if (!isMoveAllowed(id)) return;

    const nextBoard = cloneDeep(board);
    nextBoard[id] = 'removed';
    ctx.endPlayerTurn(getGameStateAfterMove(nextBoard));
  };

  const isDisabled = id => {
    if (!isMoveAllowed(id)) return true;
    if (id % 3 === 1) return true;
    if(ctx.playerIndex == 0 && id % 3 == 0) return true;
    if (ctx.playerIndex == 1 && id % 3 == 2) return true;
    return false;
  }

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    <div className="grid grid-cols-3">
      <span className="text-gray-500 text-xl text-center">Kezdő</span>
      <span></span>
      <span className="text-gray-500 text-xl text-center">Második</span>
    </div>
    <div className="grid grid-cols-3">
      {range(15).map(id => (
        [1, 4, 7, 10, 13].includes(id) || !isNull(board[id])
        ? <span className="aspect-[3/2] m-2" key={id}></span>
        : <button
          key={id}
          disabled={isDisabled(id)}
          onClick={() => clickField(id)}
          className={`
            p-2 m-2 aspect-[3/2] text-3xl border-4 rounded-xl shadow-md
            ${!isDisabled(id) && 'border-emerald-400 border-dashed hover:border-solid'}
            ${isDisabled(id) && 'cursor-not-allowed'}
          `}
        >
          { isNull(board[id]) && (id === 0 || id === 2) && '1'}
          { isNull(board[id]) && (id === 3 || id === 5) && '2'}
          { isNull(board[id]) && (id === 6 || id === 8) && '3'}
          { isNull(board[id]) && (id === 9 || id === 11) && '4'}
          { isNull(board[id]) && (id === 12 || id === 14) && '5'}
      </button>
      ))}
    </div>
  </section>
  );
};

const rule = <>
  Mindkét játékos elé leteszünk öt-öt kártyalapot, ezeken 1-től 5-ig az egész számok
szerepelnek. A játékosok felváltva elvesznek egy-egy lapot az ellenfelük elől, egészen addig, amíg
már csak egy-egy lap marad marad előttük. Ekkor vége van a játéknak. Ha a két megmaradt
szám összege páratlan, akkor az nyer, aki előtt a nagyobbik van; ha páros az összeg, akkor
pedig az, aki előtt a kisebbik (ha ugyanaz a szám marad meg a két játékos előtt, akkor az nyer,
aki kezdte a játékot). Sok sikert :)

</>;

const Game = strategyGameFactory({
  rule,
  title: 'Öt-öt lap',
  GameBoard,
  G: {
    getPlayerStepDescription: () => 'Vegyél el egy kártyát az ellenfél elől.',
    generateStartBoard: () => Array(15).fill(null),
    getGameStateAfterAiTurn
  }
});

export const FiveFiveCard = () => {
  const [board, setBoard] = useState(Array(15).fill(null));

  return <Game board={board} setBoard={setBoard} />;
};
