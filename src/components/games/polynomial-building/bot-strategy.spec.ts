import { makeCtx, type GameMoves, type StrategyArgs } from '../../game-factory';
import { smartBotStrategy, randomBotStrategy } from './bot-strategy';
import { type Board, type Coef, hasThreeIntegerRoots, canComplete } from './helpers';

type Strategy = (args: StrategyArgs<Board>) => void;

// Run a bot on a board and capture the single move it makes.
const runWith = (strategy: Strategy) => (board: Board): { coef: Coef; value: number } => {
  let played: { coef: Coef; value: number } | null = null;
  const moves: GameMoves<Board> = {
    setCoefficient: (b: Board, ...args: unknown[]) => {
      const [coef, value] = args as [Coef, number];
      played = { coef, value };
      return { nextBoard: { ...b, [coef]: value } };
    }
  };
  strategy({ board, ctx: makeCtx({ phase: 'play', currentPlayer: 0 }), moves });
  if (!played) throw new Error('bot made no move');
  return played;
};

const runBot = runWith(smartBotStrategy);
const range = (lo: number, hi: number) =>
  Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

describe('smartBotStrategy — first player (integer roots)', () => {
  it('plays c = 0 as the first move', () => {
    expect(runBot({ a: null, b: null, c: null })).toEqual({ coef: 'c', value: 0 });
  });

  it('completes to three integer roots after the opponent sets a (c = 0)', () => {
    for (const a of range(-30, 30)) {
      const { coef, value } = runBot({ a, b: null, c: 0 });
      expect(coef).toBe('b');
      expect(hasThreeIntegerRoots(a, value, 0)).toBe(true);
    }
  });

  it('completes to three integer roots after the opponent sets b (c = 0)', () => {
    for (const b of range(-30, 30)) {
      const { coef, value } = runBot({ a: null, b, c: 0 });
      expect(coef).toBe('a');
      expect(hasThreeIntegerRoots(value, b, 0)).toBe(true);
    }
  });
});

describe('smartBotStrategy — second player (prevent)', () => {
  it('blocks every losing first move (anything other than c=0 or b=-1)', () => {
    const blunders: Board[] = [
      ...range(-50, 50).map(a => ({ a, b: null, c: null } as Board)),
      ...range(-50, 50).filter(b => b !== -1).map(b => ({ a: null, b, c: null } as Board)),
      ...range(-50, 50).filter(c => c !== 0).map(c => ({ a: null, b: null, c } as Board))
    ];
    for (const board of blunders) {
      const { coef, value } = runBot(board);
      expect(board[coef]).toBeNull(); // targets an empty coefficient
      const after = { ...board, [coef]: value };
      // The first player can no longer complete to three integer roots.
      expect(canComplete(after)).toBe(false);
    }
  });

  it('blocks large losing first moves too (no cap)', () => {
    const bigBlunders: Board[] = [
      { a: 1000, b: null, c: null },
      { a: -997, b: null, c: null },
      { a: null, b: 1000, c: null },
      { a: null, b: -1000, c: null },
      { a: null, b: null, c: 997 },
      { a: null, b: null, c: -1000 }
    ];
    for (const board of bigBlunders) {
      const { coef, value } = runBot(board);
      const after = { ...board, [coef]: value };
      expect(canComplete(after)).toBe(false);
    }
  });

  it.each([
    { first: { a: null, b: null, c: 0 } as Board, trapCoef: 'b' as Coef },
    { first: { a: null, b: -1, c: null } as Board, trapCoef: 'a' as Coef }
  ])('plays a legal, non-losing trap when the first player sealed the win with $first',
    ({ first, trapCoef }) => {
      const { coef, value } = runBot(first);
      expect(coef).toBe(trapCoef);
      expect(value).not.toBe(0);
      // The move does not throw away the win: the first player can still complete.
      expect(canComplete({ ...first, [coef]: value })).toBe(true);
    });
});

describe('randomBotStrategy (test bot)', () => {
  const runRandom = runWith(randomBotStrategy);

  it('completes to a win on the last move when it can', () => {
    for (let i = 0; i < 20; i++) {
      const { coef, value } = runRandom({ a: 5, b: null, c: 0 });
      expect(coef).toBe('b');
      expect(hasThreeIntegerRoots(5, value, 0)).toBe(true);
    }
  });

  it('always plays a legal integer move on an empty coefficient', () => {
    const boards: Board[] = [
      { a: null, b: null, c: null },
      { a: null, b: null, c: 0 },
      { a: 3, b: null, c: -2 },
      { a: 0, b: null, c: -1 } // last move, no winning completion exists
    ];
    for (const board of boards) {
      for (let i = 0; i < 20; i++) {
        const { coef, value } = runRandom(board);
        expect(board[coef]).toBeNull();
        expect(Number.isInteger(value)).toBe(true);
      }
    }
  });
});
