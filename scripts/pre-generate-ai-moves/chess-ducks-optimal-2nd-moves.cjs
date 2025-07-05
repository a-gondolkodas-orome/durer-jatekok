'use strict';

/* 
  Finding optimal step is too slow real-time after only 1 or 2 ducks, that is why
  we pre-generate positions. Later, after more ducks have been placed, we
  calculate optimal moves real-time.
*/

const { range, sample, cloneDeep, shuffle } = require('lodash');
const fs = require('fs');
const {
  getBoardIndices,
  getAllowedMoves,
  markForbiddenFields,
  DUCK,
  moves
} = require('../../src/components/games/chess-ducks/helpers');
const { dummyEvents } = require('../../src/components/games/strategy-game');

const [ROWS, COLS] = [4, 7];

const boardIndices = getBoardIndices(ROWS, COLS);

const getOptimalAiMove = (board) => {
  const allowedMoves = getAllowedMoves(board);

  const optimalPlace = shuffle(allowedMoves).find(({ row, col }) => {
    const { nextBoard } = moves.placeDuck(board, { events: dummyEvents }, { row, col });
    return isWinningState(nextBoard, false);
  });


  if (optimalPlace !== undefined) {
    return { optimal: true, move: optimalPlace };
  }
  
  return { optimal: false, move: sample(allowedMoves) };
};

// given board *after* your step, are you set up to win the game for sure?
const isWinningState = (board, amIPlayer) => {
  if (getAllowedMoves(board).length === 0) {
    return true;
  }

  const allowedPlacesForOther = getAllowedMoves(board);

  const optimalPlaceForOther = allowedPlacesForOther.find(({ row, col }) => {
    const { nextBoard } = moves.placeDuck(board, { events: dummyEvents }, { row, col });
    return isWinningState(nextBoard, !amIPlayer);
  });
  return optimalPlaceForOther === undefined;
};

const optimalMoves = {};

// if too slow, optimize by discarding mirror pairs as they are the same from strategy perspective
const uniqueDuckPositions = cloneDeep(boardIndices).map(({ row, col }) => ([row, col]));

// get optimal move for each possible unique state after 1 duck has been placed
console.log(`Will search optimal step for ${uniqueDuckPositions.length} positions`)
uniqueDuckPositions.map(([r1, c1]) => {
  const nextBoard = range(0, ROWS).map(() => range(0, COLS).map(() => null));
  
  markForbiddenFields(nextBoard, { row: r1, col: c1 });
  nextBoard[r1][c1] = DUCK;
  
  const initialMessage = `Initial steps: ${JSON.stringify({ r1, c1 })}`;
  
  console.log(initialMessage);
  // fs.appendFileSync(
  //   './scripts/pre-generate-ai-moves/chess-ducks-2nd-steps.txt',
  //   initialMessage + '\n'
  // );
  
  const startDate = new Date();
  
  const optimalMove = getOptimalAiMove(nextBoard);
  
  const endDate = new Date();
  const calcDuration = Math.trunc((endDate - startDate)/1000);
  const aiMoveMessage = `
    ${new Date().toISOString()}:\
    AI Move: (calc took ${calcDuration.toString().padStart(3, '0')} seconds):\
    ${JSON.stringify(optimalMove)}\
  `.replace(/\s+/g, ' ');
  
  console.log(aiMoveMessage);
  // fs.appendFileSync(
  //   './scripts/pre-generate-ai-moves/chess-ducks-2nd-steps.txt',
  //   aiMoveMessage + '\n'
  // )

  if (optimalMove.optimal) {
    optimalMoves[`${r1};${c1}`] = optimalMove['move'];
  }
})

console.log(optimalMoves);
