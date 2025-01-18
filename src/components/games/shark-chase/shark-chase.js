import React from 'react';
import { strategyGameFactory } from '../strategy-game';
import { getGameStateAfterAiTurn } from './bot-strategy';
import { BoardClient } from './board-client';

const generateStartBoard = () => {
  return {
    submarines: [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    shark: 12,
    turn: 1
  };
};

const rule = <>
  Kutatók a Dürerencicás-tóban felfedezték a kihalófélben lévő egyenesenmozgó macskacápa faj
  egy nőstény példányát. Az állat a víz mélyén mozog, így
  befogásához három tengeralattjárót használnak. A kutatók kommunikálnak egymással
  és látják a cápát, továbbá a cápa is látja a kutatókat. A tó négyzet alakú és
  fel van osztva 4 × 4 darab négyzet alakú szektorra. Minden nap délben az egyik
  tengeralattjáró átúszik egy oldalszomszédos szektorba. A cápa 11 nap múlva nyugodt
  körülmények között tenné le a tojását, így addig menekülni próbál, ehhez minden
  éjszaka legfeljebb kétszer átúszik egy oldalszomszédos szektorba. A kutatók az első
  nap az alábbi kezdőhelyzetből mozognak először. A kutatók akkor nyernek, ha a 11.
  napig valamikor egy tengeralattjáró egy szektorba kerül a cápával, míg a cápa akkor
  nyer, ha még a 11. nap végén is szabad.
</>;

const getPlayerStepDescription = ({ ctx: { chosenRoleIndex, turnStage } }) => {
  if (chosenRoleIndex === 0) {
    return 'Válassz ki egy tengeralattjárót, majd válassz egy szomszédos szektort.'
  }
  return <>Válassz ki egy cápával oldalszomszédos szektort. Kattints a cápára,
    ha helyben szeretnél maradni.
    <br />
    Ebben a lépésben még legfeljebb <b>{turnStage === 'firstSharkMove' ? 'kétszer' : 'egyszer'} </b>
    úszhatsz át egy szomszédos szektorba.
  </>;
};

export const SharkChase = strategyGameFactory({
  rule,
  title: 'Cápa üldözés',
  roleLabels: ['Kutató leszek!', 'Cápa leszek!'],
  initialTurnStages: ['choosePiece', 'firstSharkMove'],
  BoardClient,
  getPlayerStepDescription,
  generateStartBoard,
  getGameStateAfterAiTurn
});
