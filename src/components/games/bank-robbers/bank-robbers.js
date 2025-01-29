import React from 'react';
import { strategyGameFactory } from '../strategy-game';

const BoardClient = () => {
  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      bankok
    </section>
  );
};

const rule = <>
  Szabály
</>;

export const BankRobbersE = strategyGameFactory({
  rule,
  title: 'Bankrablók: 3-10 bank',
  BoardClient,
  getPlayerStepDescription: () => 'Válassz egy szabad bankot.',
  generateStartBoard: () => Array(7).fill(true)
});
