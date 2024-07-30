import React, { useState } from 'react';
import { random, sum } from 'lodash';
import { strategyGameFactory } from '../strategy-game';
import { getGameStateAfterAiTurn, isWinningState  } from './strategy/strategy';
import { GameBoard, getPlayerStepDescription } from './coin-3-piles';

const generateStartBoard = () => {
  if (random(0, 1)) {
    return generateWinningStartBoard();
  } else {
    return generateLosingStartBoard();
  }
};

const generateWinningStartBoard = () => {
  const board = [random(0, 5), random(0, 7), random(1, 8)];
  if (!isWinningState({ board }) && sum(board) >= 4) return board;
  return generateWinningStartBoard();
}

const generateLosingStartBoard = () => {
  const board = [random(0, 5), random(0, 7), random(1, 8)];
  if (isWinningState({ board }) && sum(board) >= 4) return board;
  return generateLosingStartBoard();
}

const rule = <>
  Van egy kupacban néhány érme, mindegyik 1, 2 vagy 3 pengős. Egy lépésben az
  éppen soron lévő játékos elvesz egy érmét a kupacból, és helyette berakhat egy darab kisebb
  értékű érmét, vagy dönthet úgy, hogy nem tesz be semmit. Az nyer, aki elveszi az utolsó érmét
  a kupacból.

  Az új játék gombra kattintva generálhatsz egy új kezdőállást. A kezdőállás ismeretében te döntheted el, hogy kezdeni
  szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: '3, 2, 1 érmék',
  GameBoard,
  G: {
    getPlayerStepDescription,
    generateStartBoard,
    getGameStateAfterAiTurn
  }
});

export const Coin123 = () => {
  const [board, setBoard] = useState(generateStartBoard());

  return <Game board={board} setBoard={setBoard} />;
};
