"use strict";

import { cloneDeep, sample, difference } from "lodash";
import {
  areAllBacteriaRemoved,
  isGoal,
  lastCol,
  makeJump,
  makeShiftOrSpread,
  reachedFieldsWithAttack
} from "./helpers";

export const getGameStateAfterAiTurn = ({ board, playerIndex }) => {
  if (playerIndex === 0) {
    return aiDefense(board);
  } else {
    return aiAttack(board);
  }
};

const aiDefense = (board) => {
  const newBoard = cloneDeep(board);

  const [defenseRow, defenseCol] = sample(getBacteriaCoords(board.bacteria));
  newBoard.bacteria[defenseRow][defenseCol] -= 1;

  const isGameEnd = areAllBacteriaRemoved(newBoard.bacteria);
  return { newBoard, isGameEnd };
};

const aiAttack = (board) => {
  const newBoard = cloneDeep(board);
  const { bacteria } = board;

  const [attackRow, attackCol] = sample(getBacteriaCoords(bacteria));

  let attackOptions = ["shiftRight", "shiftLeft", "jump", "spread"];
  if (attackRow >= 7) {
    attackOptions = difference(attackOptions, ["jump"]);
  }
  if (attackRow === 8) {
    attackOptions = difference(attackOptions, ["spread"]);
  }
  let attackChoice = sample(attackOptions);
  if (attackChoice === "shiftRight" && attackCol === lastCol(bacteria, attackRow)) {
    attackChoice = "shiftLeft";
  } else if (attackChoice === "shiftLeft" && attackCol === 0) {
    attackChoice = "shiftRight";
  }

  const reachedFields = reachedFieldsWithAttack(attackChoice, { bacteria, attackRow, attackCol });
  const goalsReached = reachedFields.filter(([row, col]) => isGoal(board, row, col));
  const isGameEnd = goalsReached.length >= 1;

  if (attackChoice === "jump") {
    newBoard.bacteria = makeJump(bacteria, attackRow, attackCol);
  } else {
    newBoard.bacteria = makeShiftOrSpread(bacteria, attackRow, attackCol, reachedFields);
  }

  return { newBoard, isGameEnd };
};

const getBacteriaCoords = (bacteria) => {
  let bacteriaCoords = [];
  for (let row = 0; row < bacteria.length; row++) {
    for (let col = 0; col < bacteria[row].length; col++) {
      for (let i = 0; i < bacteria[row][col]; i++) {
        bacteriaCoords.push([row, col]);
      }
    }
  }
  return bacteriaCoords;
};
