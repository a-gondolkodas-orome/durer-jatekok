import { moves as moves4 } from './shark-4-by-4/shark-chase';
import { moves as moves5 } from './shark-5-by-5/shark-chase';
import * as helpers4 from './shark-4-by-4/helpers';
import * as helpers5 from './shark-5-by-5/helpers';
import { RESEARCHERS, SHARK, type Board } from './helpers';
import { makeCtx } from '../../../test-utils';

// The researchers win by moving a submarine onto the shark (or steering the
// shark into one); the shark wins by surviving the turn limit.
const asPlayer = (currentPlayer: number) => ({ ctx: makeCtx({ currentPlayer }) });

describe.each([
  ['4x4', moves4, helpers4, 16, 11],
  ['5x5', moves5, helpers5, 25, 15]
])('shark-chase %s end of game', (_name, moves, helpers, cellCount, lastTurn) => {
  const board = (overrides: Partial<Board> = {}): Board => ({
    submarines: Array(cellCount).fill(0),
    shark: 2,
    turn: 1,
    sharkMovesInTurn: 0,
    ...overrides
  });

  it('gives the game to the researchers when a submarine reaches the shark', () => {
    const submarines = Array(cellCount).fill(0);
    submarines[1] = 1;
    const outcome = moves.moveSubmarine.apply(
      board({ submarines, shark: 2 }), asPlayer(RESEARCHERS), { from: 1, to: 2 }
    );
    expect(helpers.isGameEnd(outcome.nextBoard)).toBe(true);
    expect(outcome.gameEnd).toEqual({ winnerIndex: RESEARCHERS });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('gives the game to the shark when the turn limit runs out', () => {
    const submarines = Array(cellCount).fill(0);
    submarines[0] = 1; // far from the shark, so nothing catches it
    const outcome = moves.moveShark.apply(
      board({ submarines, shark: 2, turn: lastTurn, sharkMovesInTurn: 1 }), asPlayer(SHARK), 3
    );
    expect(outcome.nextBoard.turn).toBe(lastTurn + 1);
    expect(helpers.isGameEnd(outcome.nextBoard)).toBe(true);
    expect(outcome.gameEnd).toEqual({ winnerIndex: SHARK });
  });

  it('gives the game to the researchers when the shark swims into a submarine', () => {
    const submarines = Array(cellCount).fill(0);
    submarines[3] = 1;
    const outcome = moves.moveShark.apply(
      board({ submarines, shark: 2, sharkMovesInTurn: 1 }), asPlayer(SHARK), 3
    );
    expect(outcome.gameEnd).toEqual({ winnerIndex: RESEARCHERS });
  });

  it('leaves the shark turn open after a free first step', () => {
    const outcome = moves.moveShark.apply(board({ shark: 2 }), asPlayer(SHARK), 3);
    expect(outcome.nextBoard.sharkMovesInTurn).toBe(1);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn on an ordinary submarine move', () => {
    const submarines = Array(cellCount).fill(0);
    submarines[0] = 1;
    const outcome = moves.moveSubmarine.apply(
      board({ submarines, shark: 2 }), asPlayer(RESEARCHERS), { from: 0, to: 1 }
    );
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});
