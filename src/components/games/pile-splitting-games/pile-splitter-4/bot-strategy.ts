import { random, range, sample } from 'lodash';
import { asTurn, getOptimalDivision, type Bot, type BotStep } from '../bot-strategy';
import type { Board } from './gameplay';

export { randomBotStrategy } from '../bot-strategy';

export const smartBotStrategy: Bot = ({ board }) => asTurn(getSmartBotStep(board));

export const getSmartBotStep = (board: Board): BotStep => {
  const start = random(0, 3);
  let removedPileId = -1, splitPileId = -1;

  const odds = board.filter(p => p % 2 === 1).length;

  if (odds === 4) {
    const notSinglePileIndices = range(4).filter(i => board[i] !== 1);
    const first = sample(notSinglePileIndices)!;
    removedPileId = (first + 1) % 4;
    splitPileId = first;
  }

  if (odds === 3) {
    const evenPileIndex = range(4).find(i => board[i] % 2 === 0)!;
    removedPileId = (evenPileIndex + 1) % 4;
    splitPileId = evenPileIndex;
  }

  if (odds === 2) {
    const evenPileIndices = range(4).filter(i => board[i] % 2 === 0);
    removedPileId = evenPileIndices[1];
    splitPileId = evenPileIndices[0];
  }

  if (odds === 1) {
    const oddPile = range(4).find(i => board[i] % 2 === 1)!;
    // [1, 2, 2, 2] is the one position the reduction below cannot be read back
    // off: topping the odd pile up gives four 2s, whose own branch picks the
    // pile to split at random and so may pick the one that is really a single
    // piece. The position is lost anyway, so any legal turn will do.
    if (
      board[oddPile] === 1 && board[(oddPile + 1) % 4] === 2 &&
      board[(oddPile + 2) % 4] === 2 && board[(oddPile + 3) % 4] === 2
    ) {
      removedPileId = (oddPile + 2) % 4;
      splitPileId = (oddPile + 1) % 4;
    } else {
      // Topping the lone odd pile up to even leaves the win/loss class alone
      // (`isLosingForMover`), and the turn that beats the topped-up board beats
      // this one unchanged: the piles it splits and discards are the same size
      // here, bar the topped-up one, which comes back a piece short in whichever
      // half it lands.
      const modifiedBoard = [...board];
      modifiedBoard[oddPile] += 1;
      return getSmartBotStep(modifiedBoard);
    }
  }

  if (odds === 0) {
    if (board.every(size => size === 2)) {
      removedPileId = (start + 1) % 4;
      splitPileId = start;
    } else {
      const botStep = getSmartBotStep(board.map((x) => x / 2));
      return { ...botStep, pieceCount: botStep.pieceCount * 2 };
    }
  }

  return {
    removedPileId,
    pileId: splitPileId,
    pieceCount: getOptimalDivision(board[splitPileId])
  };
};
