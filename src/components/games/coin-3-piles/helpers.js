'use strict';

export const getPlayerStepDescription = ({ ctx: { turnStage } }) => {
  if (turnStage === 'placeBack') {
    return 'Kattints egy érmére a kupac alatt, hogy betegyél egy olyan pénzérmét.';
  }
  return 'Kattints egy érmére, hogy elvegyél egy olyan pénzérmét.';
};

export const isWinningState = ({ board }) => {
  const oddPiles = [0, 1, 2].filter(i => board[i] % 2 === 1);

  return (oddPiles.length === 3 || oddPiles.length === 0);
}

export const isGameEnd = (nextBoard) => nextBoard[0] === 0 && nextBoard[1] === 0 && nextBoard[2] === 0;
