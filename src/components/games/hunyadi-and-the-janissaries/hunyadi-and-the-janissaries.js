import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { CastleSvg } from './castle-svg';
import { SoldierSvg } from './soldier-svg';
import {
  generateNewBoard,
  getGameStateAfterKillingGroup,
  getGameStateAfterAiMove
} from './strategy/strategy';
import { cloneDeep } from 'lodash';

const getGameStateAfterAiTurn = ({ board, playerIndex }) => {
  return getGameStateAfterAiMove(board, playerIndex === 0);
};

const GameBoard = ({ board, setBoard, ctx }) => {
  const [hoveredPiece, setHoveredPiece] = useState(null);

  const isPlayerSultan = ctx.playerIndex === 0;
  const groupOfHoveredPiece = hoveredPiece
    ? board[hoveredPiece.rowIndex][hoveredPiece.pieceIndex]
    : null;

  const showToBeKilled = (group) => {
    if (!ctx.shouldPlayerMoveNext || isPlayerSultan) return false;
    if (!hoveredPiece) return false;
    return group === groupOfHoveredPiece;
  };

  const toggleGroup = (rowIndex, pieceIndex) => {
    if (!ctx.shouldPlayerMoveNext || !isPlayerSultan) return;
    const newBoard = cloneDeep(board);
    newBoard[rowIndex][pieceIndex] = board[rowIndex][pieceIndex] === 'blue' ? 'red' : 'blue';
    setBoard(newBoard);
  };

  const finalizeSoldierGrouping = () => {
    ctx.endPlayerTurn({ newBoard: board, isGameEnd: false });
  };

  const killGroup = (group) => {
    ctx.endPlayerTurn(getGameStateAfterKillingGroup(board, group));
  };

  const clickOnSoldier = (rowIndex, pieceIndex) => {
    if (!ctx.shouldPlayerMoveNext) return;
    if (ctx.playerIndex === 0) {
      toggleGroup(rowIndex, pieceIndex);
      return;
    } else {
      killGroup(board[rowIndex][pieceIndex]);
    }
  };

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <SoldierSvg />
      <CastleSvg />
      <svg className="block m-auto w-[40%] fill-slate-600">
        <use xlinkHref="#game-castle" />
      </svg>
      {[0, 1, 2, 3, 4, 5].map(rowIndex => (
        <div
          key={rowIndex}
          style={{ 'aspectRatio': rowIndex === 5 ? 24 : 8, 'marginLeft': (5-rowIndex) + 'rem', 'marginRight': (5-rowIndex) + 'rem' }}
          className="border-t-black border-t-2 p-0.5 text-center whitespace-nowrap"
        >
          {board[rowIndex] && board[rowIndex].map((group, pieceIndex) => (
            <button
              key={pieceIndex}
              disabled={!ctx.shouldPlayerMoveNext}
              className="aspect-square w-[10%] inline-block mx-1 js-clickable-soldier"
              onClick={() => clickOnSoldier(rowIndex, pieceIndex)}
              onFocus={() => setHoveredPiece({ rowIndex, pieceIndex })}
              onBlur={() => setHoveredPiece(null)}
              onMouseOver={() => setHoveredPiece({ rowIndex, pieceIndex })}
              onMouseOut={() => setHoveredPiece(null)}
            >
              <svg
                className={`
                  w-full aspect-square inline-block border-dashed border-black
                  ${showToBeKilled(group) ? 'outline-dashed opacity-50' : ''}
                  ${group === 'blue' ? 'fill-blue-600' : 'fill-red-600'}
                `}
              >
                <use xlinkHref="#game-soldier-icon" />
              </svg>
            </button>
          ))}
        </div>
      ))}
      {isPlayerSultan && (
        <button
          className={`cta-button ${ctx.isEnemyMoveInProgress ? 'opacity-50' : ''}`}
          onClick={() => finalizeSoldierGrouping()}
        >
          Befejezem a kettéosztást
        </button>
      )}
    </section>
  );
};

const getPlayerStepDescription = ({ playerIndex }) => {
  return playerIndex === 0
  ? 'Kattints a katonákra és válaszd két részre a seregedet'
  : 'Kattints egy katonára, hogy megsemmisítsd a vele azonos színű sereget.';
};

const rule = <>
  A török szultán serege megtámadta Hunyadi várát. A várlépcső egyes fokain néhány janicsár áll.
  Minden reggel a szultán kettéosztja a hadseregét egy piros és egy kék hadtestre.
  Hunyadi a nap folyamán vagy a piros, vagy a kék sereget megsemmisíti, választása szerint. Éjszaka minden megmaradt
  janicsár egy lépcsőfokot fellép.
  Hunyadi nyer, ha a szultán egész seregét megsemmisítette.
  A szultán nyer, ha lesz olyan janicsár, aki felér a várhoz.

  A kezdőállás ismeretében te döntheted e, hogy Hunyadiként vagy a török szultánként szeretnél-e játszani.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: 'Hunyadi és a janicsárok',
  GameBoard,
  G: {
    getPlayerStepDescription,
    generateNewBoard,
    getGameStateAfterAiTurn
  }
});

export const HunyadiAndTheJanissaries = () => {
  const [board, setBoard] = useState(generateNewBoard());

  return <Game board={board} setBoard={setBoard} />;
};
