import { cloneDeep, last } from "lodash";
import type { Events } from '../../game-factory';
import { type Board, type MoveType, applyAttackMove } from "./danger"

const attackerMove = (type: MoveType) =>
  (board: Board, { events }: { events: Events }, { row, col }) => {
    const { nextBoard, reachedGoal } = applyAttackMove(board, { type, row, col });
    events.endTurn();
    if (reachedGoal) events.endGame();
    return { nextBoard };
  };

export const moves = {
  defend: (board: Board, { events }: { events: Events }, { row, col }) => {
    const nextBoard = cloneDeep(board);

    nextBoard.bacteria[row][col] -= 1;
    events.endTurn();

    if (areAllBacteriaRemoved(nextBoard.bacteria)) {
      events.endGame();
    }

    return { nextBoard };
  },
  shiftRight: attackerMove('shiftRight'),
  shiftLeft: attackerMove('shiftLeft'),
  jump: attackerMove('jump'),
  spread: attackerMove('spread')
};

export const isShiftRight = ({ attackRow, attackCol, row, col }) => {
  return attackRow === row && (col === (attackCol + 1));
};

export const isShiftLeft = ({ attackRow, attackCol, row, col }) => {
  return attackRow === row && (col === (attackCol - 1));
};

export const isSpread = ({ attackRow, attackCol, row, col }) => {
  return (
    row === attackRow + 1 &&
    (col === attackCol || col === attackCol + (-1) ** (1 + attackRow))
  );
};

export const isJump = ({ attackRow, attackCol, row, col }) => {
  return row === attackRow + 2 && col === attackCol;
};

export const isAllowedAttackClick = (attack) => {
  return (
    isShiftRight(attack) || isShiftLeft(attack) || isSpread(attack) || isJump(attack)
  );
};

const areAllBacteriaRemoved = (bacteria) => {
  for (let row = 0; row < bacteria.length; row++) {
    for (let col = 0; col <= lastCol(bacteria, row); col++) {
      if (bacteria[row][col] > 0) return false;
    }
  }
  return true;
};

export const lastCol = (bacteria, row) => bacteria[0].length - 0.5 - 0.5 * (-1) ** row;

/* Currently only correct for board with adjacent goals */
export const isDangerous = (board: Board, { row, col }) => {
  return distanceFromDangerousAttackZone(board, { row, col }).dist === 0;
};

export const distanceFromDangerousAttackZone = (board: Board, { row, col }) => {
  const boardWidth = board.bacteria[0].length;
  const goalRowIdx = board.bacteria.length - 1;
  const finalLeft = board.goals[0] === 0 ? 0 : board.goals[0] - 1;
  const leftEdge = finalLeft + Math.floor((goalRowIdx - row)/2);
  const finalRight = last(board.goals) === boardWidth - 1 ? boardWidth - 1 : last(board.goals)! + 1;
  const rightEdge = finalRight - Math.ceil((goalRowIdx - row)/2);
  if (board.goals[0] === 0) {
    if (col === 0 && row === (goalRowIdx - 2)) {
      return { dist: 0, dir: "center" };
    }
  }
  if (last(board.goals) === boardWidth - 1) {
    if (col === (boardWidth - 1) && row === (goalRowIdx - 2)) {
      return { dist: 0, dir: "center" };
    }
  }
  if (col >= leftEdge && col <= rightEdge) {
    return { dist: 0, dir: "center" };
  } else if (col < leftEdge) {
    return { dist: leftEdge - col, dir: "left" };
  } else {
    return { dist: col - rightEdge, dir: "right" };
  };
};

export const isOddEdge = (bacteria, { row, col }) =>
  (col === 0 || col === lastCol(bacteria, row)) && row % 2 === 0;
