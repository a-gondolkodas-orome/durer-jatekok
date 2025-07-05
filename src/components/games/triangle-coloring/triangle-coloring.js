import React from 'react';
import { strategyGameFactory } from '../strategy-game';

const BoardClient = ({ board, ctx, moves }) => {
  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      Háromszög
    </section>
  );
};

const moves = {
};

const aiBotStrategy = ({ board, moves }) => {
};

const rule = <>
  Két játékos felváltva satíroz be az ábrán egy-egy kis háromszöget.
Nem szabad olyan háromszöget satírozni, amivel oldalszomszédos
már be van satírozva. Az veszít, aki nem tud satírozni.
</>;

export const TriangleColoring = strategyGameFactory({
  rule,
  title: 'Háromszög színezés',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy kis háromszögre.',
  generateStartBoard: () => Array(15).fill(null),
  aiBotStrategy,
  moves
});
