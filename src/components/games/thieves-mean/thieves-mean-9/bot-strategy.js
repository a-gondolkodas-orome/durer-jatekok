import { sample, _ } from 'lodash';
import { Sheriff, Thief } from '../helpers';

// TODO:
export const aiBotStrategy = ({ board, moves, ctx }) => {
    const move = getMove(board, ctx.chosenRoleIndex);
    moves.takeCard(board, move);
}

const getMove = (board) => {
  let cards = Array(9).fill(null);
  board.sheriffCards.forEach(card => {
    cards[card - 1] = Sheriff;
  });
  board.thiefCards.forEach(card => {
    cards[card - 1] = Thief;
  });
  const meanCounts = getMeanCounts(cards)
    .map((count, idx) => [count, idx])
    .filter((_, idx) => cards[idx] === null);
  // find max count that is not taken by sheriff or thief
  const maxCount = Math.max(...meanCounts.map(([count]) => count));
  // return the card that participates in the most good sets of three cards
  // take only ones with max value
  let maxIndices = meanCounts.filter(([count]) => count === maxCount)
    .map(([_, idx]) => idx);
  return sample(maxIndices) + 1;
}

const findPossibleMeans = (cards) => {
  // get all good sets of three cards
  let means = [];
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 8; j++) {
      for (let k = j + 1; k < 9; k++) {
        if (cards[i] === Sheriff || cards[j] === Sheriff || cards[k] === Sheriff) {
          continue;
        }
        if (i + k === 2 * j) {
          means.push([i, j, k]);
        }
      }
    }
  }
  return means;
}

const getMeanCounts = (cards) => {
  let counts = Array(9).fill(0);
  findPossibleMeans(cards).forEach(mean => {
    counts[mean[0]]++;
    counts[mean[1]]++;
    counts[mean[2]]++;
  });
  return counts;
}
