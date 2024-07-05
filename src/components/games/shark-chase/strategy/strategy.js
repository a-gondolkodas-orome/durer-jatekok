'use strict';

import { isNull, some, range, groupBy, sample, cloneDeep } from 'lodash';
import { some, difference } from 'lodash';
//import { hasWinningSubset } from '../../helpers';

/*
export const hasWinningSubset = (indices) => {
  const winningIndexSets = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const isSubsetOfIndices = s => difference(s, indices).length === 0;
  return some(winningIndexSets, isSubsetOfIndices);
};
*/
const roleColors = ['red', 'blue'];

export const playerColor = playerIndex => playerIndex === 0 ? roleColors[0] : roleColors[1];
const aiColor = playerIndex => playerIndex === 0 ? roleColors[1] : roleColors[0];

const moveSubmarine = (from,to, board) => {
  const newBoard = cloneDeep(board);
  newBoard.board[from] = null;
  newBoard.board[to] = aiColor(playerIndex);
  return getGameStateAfterMove(newBoard);
}

export const getGameStateAfterAiTurn = ({ board, playerIndex }) => {
  const findSubmarineNextToShark = () => {
    if (board.shark+4 < 16 && board.board[board.shark+4] === 'red') return board.shark+4;
    if (board.shark-4 >= 0 && board.board[board.shark-4] === 'red') return board.shark-4;
    if (board.shark+1 < 16 && board.board[board.shark+1] === 'red') return board.shark+1;
    if (board.shark-1 >= 0 && board.board[board.shark-1] === 'red') return board.shark-1;
    return -1;
  }

  const moveSubmarine = (from,to) => {
    const newBoard = cloneDeep(board);
    if(board.shark === to) newBoard.shark = -1;
    newBoard.board[to] = aiColor(playerIndex);
    newBoard.board[from] = null;
    return getGameStateAfterMove(newBoard);
  }
  if (playerIndex === 0)
  {
    const newMove = getOptimalAiPlacingPositionShark(board, playerIndex);
    console.log(newMove);
    const newBoard = cloneDeep(board);
    newBoard.board[board.shark] = null;
    newBoard.board[newMove] = aiColor(playerIndex);
    newBoard.shark = newMove
    return getGameStateAfterMove(newBoard);
  }
  else
  {
    place = findSubmarineNextToShark();
    if(place!==-1)
    {
      return moveSubmarine(place, board.shark);

    }
    switch(board.turn){
      case 1:
        return moveSubmarine(2,1);
        break;
      case 2:
        return moveSubmarine(1,5);
        break;
      case 3:
        return moveSubmarine(7,6);
        break;
      case 4:
        return moveSubmarine(6,10);
        break;
      case 5:
        return moveSubmarine(10,14);
        break;
      case 6:
        return moveSubmarine(3,2);
        break;
      default:
        if (board.shark === 7 || board.shark === 11)
        {
          switch(board.turn){
            case 7:
              return moveSubmarine(2,3);
              break;
            case 8:
              return moveSubmarine(3,7);
              break;
            case 9:
              return moveSubmarine(7,11);
              break;
            //default:
          }
        }
        else
        {
          switch(board.turn){
            case 7:
              return moveSubmarine(2,1);
              break;
            case 8:
              return moveSubmarine(1,0);
              break;
            case 9:
              return moveSubmarine(0,4);
              break;
            case 10:
              return moveSubmarine(4,8);
              break;
            //default:
        }
        break;
      }
    }
  }
};

export const getGameStateAfterMove = (newBoard) => {
  return { newBoard, isGameEnd: isGameEnd(newBoard), winnerIndex: hasFirstPlayerWon(newBoard) ? 0 : 1 };
};

const isGameEnd = (board) => {
  return (board.shark === -1 || board.turn > 11);
};

const hasFirstPlayerWon = (board) => {
  return board.shark === -1;
};


const getOptimalAiPlacingPositionShark = (board, playerIndex) => {
  const possibleMoves = [];
  const isNextToSubmarine = (id) => {
    if (id+4 < 16 && board.board[id+4] === 'red') return true;
    if (id-4 >= 0 && board.board[id-4] === 'red') return true;
    if (id+1 < 16 && board.board[id+1] === 'red') return true;
    if (id-1 >= 0 && board.board[id-1] === 'red') return true;
    return false;
  }
  const distanceFromShark = (id) => {
    return Math.abs(board.shark%4-id%4) + Math.abs(Math.floor(board.shark/4)-Math.floor(id/4));
  }

  for (let i = 0; i <16; i++)
  {
    if (distanceFromShark(i) <=2 && 
        board.board[i] !== 'red' &&
        !isNextToSubmarine(i)
        ) possibleMoves.push(i);
  }
  if (possibleMoves.length === 0)
  {
    for (let i = 0; i <16; i++)
    {
      if (distanceFromShark(i) <=2 && 
        board.board[i] !== 'red') possibleMoves.push(i);
    }
  }
  return possibleMoves[Math.floor(Math.random()*(possibleMoves.length))];
}


/*
const getOptimalAiPlacingPosition = (board, playerIndex) => {
  const allowedPlaces = range(0, 9).filter(i => isNull(board.baord[i]));

  // start with middle place as a first step
  if (allowedPlaces.length === 9) return 4;

  // as a first player, proceed with placing at an empty place symmetrical to player's piece
  if (playerIndex === 1) {
    // pairs symmetric to middle place
    const pairs = [[0, 8], [1, 7], [2, 6], [3, 5], [5, 3], [6, 2],  [7, 1] [8, 0]];
    for (const p of pairs) {
      // first is occupied, second is not from given pair
      if (!isNull(board.board[p[0]]) && isNull(board.board[p[1]])) {
        return p[1];
      }
    }
  }

  // as a second player still try to win if first player may not play optimally
  const optimalPlaces = allowedPlaces.filter(i => {
    const boardCopy = cloneDeep(board);
    boardCopy.baord[i] = aiColor(playerIndex);
    return isWinningState(boardCopy, playerIndex === 1);
  });

  if (optimalPlaces.length > 0) return sample(optimalPlaces);

  // even if we are gonna lose, try to prolong it
  const aiPieces = range(0, 9).filter(i => board.board[i] === aiColor(playerIndex));
  const notInstantLosingPlaces = allowedPlaces.filter(i => !hasWinningSubset([...aiPieces, i]));
  if (notInstantLosingPlaces.length > 0) return sample(notInstantLosingPlaces);

  return sample(allowedPlaces);
};

// given board *after* your step, are you set up to win the game for sure?
const isWinningState = (board, amIFirst) => {
  if (isGameEnd(board)) {
    return amIFirst === hasFirstPlayerWon(board);
  }
  const allowedPlaces = range(0, 9).filter(i => isNull(board.board[i]));
  const optimalPlaceForOther = allowedPlaces.find(i => {
    const boardCopy = cloneDeep(board);
    boardCopy.baord[i] = roleColors[amIFirst ? 1 : 0];
    return isWinningState(boardCopy, !amIFirst);
  });
  return optimalPlaceForOther === undefined;
};
*/
