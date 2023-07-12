import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';

const GameBoard = ({ board, ctx }) => {
  return (
  <section className="p-2 shrink-0 grow basis-2/3">

  <svg className="aspect-square">
    {/* <!-- row 1 --> */}
    <circle cx="50%" cy="12.5%" r="1%" fill="black"/>
    {/* <!-- row 2 --> */}
    <circle cx="41.625%" cy="27.5%" r="1%" fill="black"/>
    <circle cx="58.375%" cy="27.5%" r="1%" fill="black"/>
    {/* <!-- row 3 -->/ */}
    <circle cx="33.25%" cy="42.5%" r="1%" fill="black"/>
    <circle cx="50%" cy="42.5%" r="1%" fill="black"/>
    <circle cx="66.75%" cy="42.5%" r="1%" fill="black"/>
    {/* <!-- row 4 --> */}
    <circle cx="25%" cy="57.5%" r="1%" fill="black"/>
    <circle cx="41.625%" cy="57.5%" r="1%" fill="black"/>
    <circle cx="58.375%" cy="57.5%" r="1%" fill="black"/>
    <circle cx="75%" cy="57.5%" r="1%" fill="black"/>
  </svg>
  </section>
  );
};

const rule = <>
  Egy indiánrezervátumban 10 totemoszlopot állítottak fel a bal oldali ábrán látható háromszögrács szerint.
  Csendes Patak és Vörös Tűz a következő játékot szokták itt játszani: felváltva feszítenek ki köteleket két-két oszlop
  között, és minden kötél kifeszítésénél figyelnek arra, hogy a kifeszített kötél párhuzamos legyen a nagy háromszög
  egyik oldalával, illetve a kötél nem haladhat el olyan oszlop mellett, amelyet már egy másik kötél érint.
  Ezenkívül ha a jelenleg kifeszített kötél helyett annak egy egyenes vonalú meghosszabbítása is kifeszíthető
  a fenti feltételek mellett, akkor azt kell kifeszíteniük. Az veszít, amelyikőjük már nem tud a
  szabályoknak megfelelően több kötelet kifeszíteni.

  Te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: '10 totemoszlop',
  GameBoard,
  G: {
    getPlayerStepDescription: () => 'Kattints két oszlopra, amik között kötelet szeretnél kifeszíteni.',
    generateNewBoard: () => [],
    getGameStateAfterAiTurn: ({ board }) => ({ newBoard: board, isGameEnd: false })
  }
});

export const TriangularGridRopes = () => {
  const [board, setBoard] = useState([]);

  return <Game board={board} setBoard={setBoard} />;
};
