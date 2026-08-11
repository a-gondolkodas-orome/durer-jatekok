import { range } from 'lodash';
import {
  runMatch, type BotStrategy, type MoveDefinition
} from 'strategy-game-factory';
import { makeCtx } from 'test-utils';
import { randomBotStrategy } from './bot-strategy';
import { isLosingForMover, moves, type Board } from './gameplay';
import { smartBotStrategy as smartTwoPileBot } from './pile-splitter/bot-strategy';
import { smartBotStrategy as smartThreePileBot } from './pile-splitter-3/bot-strategy';
import { smartBotStrategy as smartFourPileBot } from './pile-splitter-4/bot-strategy';

// The random bot reads the number of piles off the board, so one spec covers
// all three sibling games. `runMatch` throws on a move the rules reject, which
// is the assertion here: whatever it picks, both halves of the turn are legal —
// including on boards where only one pile can be split, so most removals are
// not allowed at all.
const startBoards: Board[] = [[2, 3], [1, 4], [3, 5, 4], [1, 1, 4], [2, 6, 3, 7], [1, 1, 1, 5]];

// It picks at random, so each board has to hold for every draw it can make.
const ITERATIONS = 20;

describe('random pile-splitting bot', () => {
  it.each(startBoards)('only ever plays legal turns, from %j', (...startBoard) => {
    for (let i = 0; i < ITERATIONS; i++) {
      const { winnerIndex } = runMatch({
        gameplay: { moves },
        strategies: [randomBotStrategy, randomBotStrategy],
        startBoard
      });
      expect([0, 1]).toContain(winnerIndex);
    }
  });
});

// Plays a whole named turn through the real moves, as the engine would. Each
// sibling names its turn as both halves at once, so the reduction runs them in
// the order the bot listed them.
const playSmartTurn = (botStrategy: BotStrategy<Board>, board: Board): Board => {
  const ctx = makeCtx({ currentPlayer: 0 });
  const named = botStrategy({ board, ctx });
  const turnMoves: Record<string, MoveDefinition<Board>> = moves;

  return (Array.isArray(named) ? named : [named]).reduce(
    (current, { move, args = [] }) => turnMoves[move]!.apply(current, { ctx }, ...args).nextBoard,
    board
  );
};

// Non-decreasing tuples: the value of a position depends on the pile sizes
// alone, so one ordering of each stands for all of them.
const boardsUpTo = (pileCount: number, maxPile: number): Board[] =>
  pileCount === 0
    ? [[]]
    : boardsUpTo(pileCount - 1, maxPile).flatMap(rest =>
      range(rest[rest.length - 1] ?? 1, maxPile + 1).map(size => [...rest, size]));

// The property that makes a bot optimal, checked a turn at a time rather than
// over a match: from a position the mover can win, the turn it names must hand
// the opponent one they cannot. A match only says who won — against a bot that
// plays at random a thrown-away win is usually not punished, which is how the
// four-pile bot gave one up in roughly a quarter of its turns unnoticed.
const smartBots = [
  { pileCount: 2, maxPile: 12, botStrategy: smartTwoPileBot },
  { pileCount: 3, maxPile: 9, botStrategy: smartThreePileBot },
  { pileCount: 4, maxPile: 7, botStrategy: smartFourPileBot }
];

describe('smart pile-splitting bots', () => {
  it.each(smartBots)('never gives up a won position, on $pileCount piles', (
    { pileCount, maxPile, botStrategy }
  ) => {
    const wonBoards = boardsUpTo(pileCount, maxPile).filter(board => !isLosingForMover(board));
    expect(wonBoards.length).toBeGreaterThan(20);

    wonBoards.forEach(board => {
      // Each bot shuffles among equally-optimal turns, so one board has to hold
      // for every draw it can make.
      range(ITERATIONS).forEach(() => {
        const nextBoard = playSmartTurn(botStrategy, board);
        const handedOver = nextBoard.every(size => size === 1) || isLosingForMover(nextBoard);
        expect([board, handedOver]).toEqual([board, true]);
      });
    });
  });
});
