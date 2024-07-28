import React, { useState } from 'react';
import { range, cloneDeep } from 'lodash';
import { strategyGameFactory } from '../strategy-game';
import { getGameStateAfterMove, getGameStateAfterAiTurn } from './strategy';
import { SharkSvg } from './shark-chase-shark-svg';
import { SubmarineSvg } from './shark-chase-submarine-svg';


export const generateStartBoard = () => {
  return {
    submarines: [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    shark: 12,
    turn: 1
  };
}

const distance = (fieldA, fieldB) => {
  return Math.abs(fieldA%4-fieldB%4) + Math.abs(Math.floor(fieldA/4)-Math.floor(fieldB/4))
}

const GameBoard = ({ board, setBoard, ctx }) => {
  const [playerState, setPlayerState] = useState('choosePiece');
  const [chosenPiece, setChosenPiece] = useState(12);

  let possibleMoves=[]
  if (ctx.shouldPlayerMoveNext && ctx.playerIndex === 1) {
    possibleMoves = range(16).filter(i => distance(board.shark, i) <= 1)
  } else if (ctx.shouldPlayerMoveNext && ctx.playerIndex === 0 && playerState === 'movePiece') {
    possibleMoves = range(16).filter(i => distance(chosenPiece, i) <= 1)
  }

  const isAllowed_choosePiece = (id) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (ctx.playerIndex === 0) return board.submarines[id] !== 0;
    if (ctx.playerIndex === 1) return board.shark === id;
  }

  const isAllowed_movePiece = (id) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (board.submarines[id] !== 0) return false;
    if (ctx.playerIndex === 0) return distance(chosenPiece, id) <= 1;
    else return distance(board.shark, id) <= 1;
  }

  const clickField = (id) => {
    if (ctx.playerIndex === 0) {
      if (playerState === 'choosePiece') {
        if (!isAllowed_choosePiece(id)) return;
        setChosenPiece(id)
        setPlayerState('movePiece');
      } else if (playerState === 'movePiece') {
        if (!isAllowed_movePiece(id)) return;
        const nextBoard = cloneDeep(board);
        nextBoard.submarines[chosenPiece] -= 1;
        nextBoard.submarines[id] += 1;
        nextBoard.turn += 1;
        setPlayerState('choosePiece');
        ctx.endPlayerTurn(getGameStateAfterMove(nextBoard));
      }
    }
    if (ctx.playerIndex === 1) {
      if (!isAllowed_movePiece(id)) return;
      const nextBoard = cloneDeep(board);
      nextBoard.shark = id;
      if (playerState !== 'secondSharkMove') {
        setBoard(nextBoard);
        setPlayerState('secondSharkMove');
      } else {
        setPlayerState('firstSharkMove');
        nextBoard.turn += 1;
        ctx.endPlayerTurn(getGameStateAfterMove(nextBoard));
      }
    }
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    <b><font size="4">Hátralévő lépések száma: {12-board.turn}</font></b>
    <SubmarineSvg/>
    <SharkSvg/>
    <div className="grid grid-cols-4 gap-0 border-2">
      {range(16).map(id => (
        <button
          key={id}
          onClick={() => clickField(id)}
          className="aspect-square p-[0%] border-2"
        > {(possibleMoves.includes(id) && ctx.playerIndex === 0 && board.submarines[id] === 0) && (
            <span>
            <svg className="w-full aspect-square opacity-30 inline-block">
              <use xlinkHref="#submarine" />
            </svg>
            </span>
          )}
         {(possibleMoves.includes(id) && ctx.playerIndex === 1 && board.submarines[id] === 0 && board.shark !== id) && (
            <span>
            <svg className="w-full aspect-square opacity-30 inline-block">
              <use xlinkHref="#shark" />
            </svg>
            </span>
          )}
          {board.submarines[id] >= 1 && (
            <span>
            <svg className="w-full aspect-square inline-block">
              <use xlinkHref="#submarine" />
            </svg>
            </span>
          )}
          {board.shark === id && board.submarines[id] === 0 && (
            <span>
            <svg className="w-full aspect-square inline-block">
              <use xlinkHref="#shark" />
            </svg>
            </span>

          )}
      </button>
      ))}
    </div>
  </section>
  );
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
  nyer, ha még a 11. nap végén is szabad.<br></br>
  Ti dönthetitek el, hogy a kutatók vagy a cápa bőrébe szeretnétek bújni.
  <br></br>Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: 'Cápa üldözés',
  firstRoleLabel: 'Kutató leszek!',
  secondRoleLabel: 'Cápa leszek!',
  GameBoard,
  G: {
    getPlayerStepDescription: ({ playerIndex }) => {
      return playerIndex === 0
        ? 'Válassz ki egy tengeralattjárót, majd válassz egy szomszédos mezőt.'
        : 'Válassz ki a cápától egy maximum 1 távolságra lévő mezőt. Kattints a cápára, ha helyben szeretnél maradni.';
    },
    generateStartBoard,
    getGameStateAfterAiTurn
  }
});

export const SharkChase = () => {
  const [board, setBoard] = useState(generateStartBoard());

  return <Game board={board} setBoard={setBoard} />;
};
