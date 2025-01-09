'use strict';

import { isNull, range, random } from 'lodash';

export const aiBotStrategy = ({ board, ctx, moves }) => {
  const idx = getOptimalAiPlacingPosition(board, ctx.chosenRoleIndex);
  moves.removeSymbol(board, idx);
};

const getOptimalAiPlacingPosition = (board, chosenRoleIndex) => {
  const allowedPlaces = range(0, 9).filter(i => i !== 1 && i !== 4 && i !== 7 && isNull(board[i]));

  let freePlaces = [];
  for (let i = 0; i <= 8; i++){
    if (i === 1 || i === 4 || i === 7) continue;
    if (isNull(board[i])) {
      freePlaces.push(i);
    }
  }

  // start with a random place as a first step
  if (allowedPlaces.length === 6) {
    return random(0, 2);
  }

  // as a first player still try to win if second player may not play optimally
  if (chosenRoleIndex === 1) {
    // pairs to still have chance
    const pairs = [[0, 2], [1, 0], [2, 1], [0, 0], [1, 1], [2, 2]];
    for (const p of pairs) {

      // first is occupied, second is not from given pair
      if (!isNull(board[p[0] * 3]) && isNull(board[p[1] * 3 + 2])) {
        return p[1];
      }
    }
  }

  // as a second player proceed with chosing useless player's piece

  if (chosenRoleIndex === 0) {
    // pairs beating each other
    const pairs = [[0, 1], [1, 2], [2, 0]];
    for (const p of pairs) {
      // first is not occupied, second is occupied from given pair
      if (isNull(board[p[0] * 3]) && !isNull(board[p[1] * 3 + 2])) {
        return p[0];
      }
    }
  }
};
