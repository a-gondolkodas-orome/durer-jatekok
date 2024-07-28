'use strict';

import { cloneDeep, sample } from 'lodash';

export const getGameStateAfterAiTurn = ({ board, playerIndex }) => {
  const findSubmarineNextToShark = () => {
    if (board.shark+4 < 16 && board.submarines[board.shark+4] >= 1) return board.shark+4;
    if (board.shark-4 >= 0 && board.submarines[board.shark-4] >= 1) return board.shark-4;
    if (board.shark+1 < 16 && board.shark%4 !== 3 && board.submarines[board.shark+1] >= 1) return board.shark+1;
    if (board.shark-1 >= 0 && board.shark%4 !== 0 && board.submarines[board.shark-1] >= 1) return board.shark-1;
    return -1;
  }

  const moveSubmarine = (from,to) => {
    const nextBoard = cloneDeep(board);
    nextBoard.submarines[to] += 1;
    nextBoard.submarines[from] -= 1;
    return getGameStateAfterMove(nextBoard);
  }

  if (playerIndex === 0) {
    const nextMove = getOptimalAiPlacingPositionShark(board, playerIndex);
    const nextBoard = cloneDeep(board);
    nextBoard.shark = nextMove
    return getGameStateAfterMove(nextBoard);
  } else {
    let place = findSubmarineNextToShark();
    if (place!==-1) {
      return moveSubmarine(place, board.shark);
    }

    switch(board.turn){
      case 1:
        return moveSubmarine(2,1);
      case 2:
        return moveSubmarine(1,5);
      case 3:
        return moveSubmarine(7,6);
      case 4:
        return moveSubmarine(6,10);
      case 5:
        return moveSubmarine(10,14);
      case 6:
        return moveSubmarine(3,2);
      default:
        if (board.shark === 7 || board.shark === 11) {
          switch(board.turn) {
            case 7:
              return moveSubmarine(2,3);
            case 8:
              return moveSubmarine(3,7);
            case 9:
              return moveSubmarine(7,11);
          }
        } else {
          switch(board.turn){
            case 7:
              return moveSubmarine(2,1);
            case 8:
              return moveSubmarine(1,0);
            case 9:
              return moveSubmarine(0,4);
            case 10:
              return moveSubmarine(4,8);
        }
        break;
      }
    }
  }
};

export const getGameStateAfterMove = (nextBoard) => {
  return {
    nextBoard,
    isGameEnd: nextBoard.submarines[nextBoard.shark] >= 1 || nextBoard.turn > 11,
    winnerIndex: nextBoard.submarines[nextBoard.shark] >= 1 ? 0 : 1
  };
};

const getOptimalAiPlacingPositionShark = (board) => {
  const possibleMoves = [];
  const isNextToSubmarine = (id) => {
    if (id+4 < 16 && board.submarines[id+4] >= 1) return true;
    if (id-4 >= 0 && board.submarines[id-4] >= 1) return true;
    if (id+1 < 16 && id%4 !== 3 && board.submarines[id+1] >= 1) return true;
    if (id-1 >= 0 && id%4 !== 0 && board.submarines[id-1] >= 1) return true;
    if (board.submarines[id] >= 1) return true;
    return false;
  }
  const distanceFromShark = (id) => {
    return Math.abs(board.shark%4-id%4) + Math.abs(Math.floor(board.shark/4)-Math.floor(id/4));
  }

  const visited = Array(16).fill(false);
  const visited2 = Array(16).fill(false);
  const componentSizes = Array(16).fill(0);
  const queue = [];
  let first;

  for (let i = 0; i<16; i++)
  {
    if (!visited[i] && !isNextToSubmarine(i))
    {
      queue.push(i);
      visited[i] = true;
      let counter = 0;
      while(queue.length > 0)
      {
        counter++;
        first = queue.shift();
        if (first+4 < 16 && !isNextToSubmarine(first+4) && visited[first+4] == false) {
          queue.push(first+4); visited[first+4]=true
        }
        if (first-4 >= 0 && !isNextToSubmarine(first-4) && visited[first-4] == false) {
          queue.push(first-4); visited[first-4]=true
        }
        if (first+1 < 16 && first%4 !== 3 && !isNextToSubmarine(first+1) && visited[first+1] == false) {
          queue.push(first+1); visited[first+1]=true
        }
        if (first-1 >= 0 && first%4 !== 0 && !isNextToSubmarine(first-1) && visited[first-1] == false) {
          queue.push(first-1); visited[first-1]=true
        }
      }
      queue.push(i);
      visited2[i] = true;
      while(queue.length > 0)
      {
        first = queue.shift();
        componentSizes[first] = counter;
        if (first+4 < 16 && !isNextToSubmarine(first+4) && visited2[first+4] == false) {
          queue.push(first+4); visited2[first+4] = true;
        }
        if (first-4 >= 0 && !isNextToSubmarine(first-4) && visited2[first-4] == false) {
          queue.push(first-4); visited2[first-4] = true;
        }
        if (first+1 < 16 && first%4 !== 3 && !isNextToSubmarine(first+1) && visited2[first+1] == false) {
          queue.push(first+1); visited2[first+1] = true;
        }
        if (first-1 >= 0 && first%4 !== 0 && !isNextToSubmarine(first-1) && visited2[first-1] == false) {
          queue.push(first-1); visited2[first-1] = true;
        }
      }
    }
  }

  let maxi = 1;
  for (let i = 0; i < 16; i++) {
    if (distanceFromShark(i) <= 2) {
      if(maxi < componentSizes[i]) {
        maxi = componentSizes[i];
      }
    }
  }

  for (let ind = 0; ind < 4; ind++) {
    let i = [5,6,9,10][ind];
    if (componentSizes[i] === maxi && distanceFromShark(i) <=2) {
      possibleMoves.push(i);
    }
  }
  if (possibleMoves.length === 0) {
    for (let ind = 0; ind < 8; ind++) {
      let i = [1,2,4,7,8,11,13,14][ind];
      if (componentSizes[i] == maxi && distanceFromShark(i) <=2) {
        possibleMoves.push(i);
      }
    }
  }
  if (possibleMoves.length === 0) {
    for (let ind = 0; ind < 4; ind++) {
      let i = [0,3,12,15][ind];
      if (componentSizes[i] == maxi && distanceFromShark(i) <=2) {
        possibleMoves.push(i);
      }
    }
  }
  if (possibleMoves.length === 0) {
    for (let i = 0; i <16; i++) {
      if (distanceFromShark(i) <=2 && board.submarines[i] === 0) {
        possibleMoves.push(i);
      }
    }
  }

  return sample(possibleMoves);
}
