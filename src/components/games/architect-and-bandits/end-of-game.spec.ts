import { moves as movesA } from './architect-and-bandits-a/architect-and-bandits-a';
import { moves as movesB } from './architect-and-bandits-b/architect-and-bandits-b';
import { ARCHITECT, BANDITS, type Board } from './helpers';
import { makeCtx } from '../../../test-utils';

// Both variants play the same game on a different polygon, so the end-of-game
// rule is asserted for each: after the fourth day the architect wins exactly
// when every vertex carries a tower.
// `endDay` reads neither ctx nor events, so it takes the board alone.
const meta = { ctx: makeCtx({ currentPlayer: BANDITS }) };

const boardWith = (towers: boolean[], day: number): Board =>
  ({ architectPosition: 0, towers, day, kmUsedToday: 20 });

describe.each([
  ['a', movesA, 8],
  ['b', movesB, 10]
])('architect-and-bandits-%s end of game', (_name, moves, vertexCount) => {
  const allStanding = () => Array(vertexCount).fill(true);

  it('gives the game to the architect when day 4 ends with every tower standing', () => {
    const outcome = moves.endDay.apply(boardWith(allStanding(), 4));
    expect(outcome.gameEnd).toEqual({ winnerIndex: ARCHITECT });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('gives the game to the bandits when any tower is missing on day 4', () => {
    const towers = allStanding();
    towers[vertexCount - 1] = false;
    const outcome = moves.endDay.apply(boardWith(towers, 4));
    expect(outcome.gameEnd).toEqual({ winnerIndex: BANDITS });
  });

  it.each([1, 2, 3])('only passes the turn at the end of day %i', day => {
    const outcome = moves.endDay.apply(boardWith(allStanding(), day));
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
    expect(outcome.nextBoard.kmUsedToday).toBe(0);
  });

  it('schedules the end-of-turn move after the bandits knock a tower down', () => {
    const outcome = moves.destroyTower.apply(boardWith(allStanding(), 2), meta, 3);
    expect(outcome.nextBoard.towers[3]).toBe(false);
    expect(outcome.autoEndOfTurn).toBe(true);
    // the scheduled `startNextDay` is what ends the turn, not this move
    expect(outcome.isTurnEnd).toBeUndefined();
  });
});
