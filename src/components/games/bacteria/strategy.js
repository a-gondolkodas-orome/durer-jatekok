"use strict";

import { cloneDeep, sample, difference } from "lodash";
import {
  areAllBacteriaRemoved,
  isGoal,
  lastCol,
  makeJump,
  makeShiftOrSpread,
  reachedFieldsWithAttack,
  isDangerous
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

  const bacteriaCoords = getBacteriaCoords(board.bacteria);
  const dangerousBacteria = bacteriaCoords.filter(([row, col]) => isDangerous(board, { row, col }));
  if (dangerousBacteria.length >= 1) {
    const [defenseRow, defenseCol] = sample(dangerousBacteria);
    newBoard.bacteria[defenseRow][defenseCol] -= 1;
  } else {
    const [defenseRow, defenseCol] = sample(bacteriaCoords);
    newBoard.bacteria[defenseRow][defenseCol] -= 1;
  }

  const isGameEnd = areAllBacteriaRemoved(newBoard.bacteria);
  return { newBoard, isGameEnd };
};

const aiAttack = (board) => {
  const newBoard = cloneDeep(board);
  const { bacteria, goals } = board;

  const bacteriaCoords = getBacteriaCoords(bacteria);
  const dangerousBacteria = bacteriaCoords.filter(([row, col]) => isDangerous(board, { row, col }));
  let attackRow, attackCol;
  let attackChoice;

  if (dangerousBacteria.length === 0) {
    // TODO: still try to be as dangerous as possible?
    [attackRow, attackCol] = sample(bacteriaCoords);
    let attackOptions = ["shiftRight", "shiftLeft", "jump", "spread"];
    if (attackRow >= 7) {
      attackOptions = difference(attackOptions, ["jump"]);
    }
    if (attackRow === 8) {
      attackOptions = difference(attackOptions, ["spread"]);
    }
    attackChoice = sample(attackOptions);
    if (attackChoice === "shiftRight" && attackCol === lastCol(bacteria, attackRow)) {
      attackChoice = "shiftLeft";
    } else if (attackChoice === "shiftLeft" && attackCol === 0) {
      attackChoice = "shiftRight";
    }
  } else {
    [attackRow, attackCol] = sample(dangerousBacteria);
    if (attackRow === 8) {
      attackChoice = (attackCol === goals[0] - 1) ? "shiftRight" : "shiftLeft";
    } else {
      attackChoice = "spread";
    }
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
