import { moves as incrementOrDouble } from './increment-or-double/increment-or-double';
import { moves as plusOneTwoThree } from './plus-one-two-three/plus-one-two-three';
import { moves as superstitiousCounting } from './superstitious-counting/superstitious-counting';
import { makeCtx } from '../../../test-utils';

// All three games count upward towards a limit and the player who reaches or
// passes it *loses*, so every ending here credits the opponent of the mover —
// the opposite of most games in the repo, and the thing worth pinning.
type Meta = { ctx: ReturnType<typeof makeCtx> };
const asPlayer = (currentPlayer: number): Meta => ({ ctx: makeCtx({ currentPlayer }) });

const games = [
  {
    name: 'increment-or-double (increment past 99)',
    passTheLimit: (m: Meta) => incrementOrDouble.increment.apply(99, m),
    stayBelow: (m: Meta) => incrementOrDouble.increment.apply(5, m)
  },
  {
    name: 'increment-or-double (double past 99)',
    passTheLimit: (m: Meta) => incrementOrDouble.double.apply(50, m),
    stayBelow: (m: Meta) => incrementOrDouble.double.apply(4, m)
  },
  {
    name: 'plus-one-two-three',
    passTheLimit: (m: Meta) => plusOneTwoThree.increaseTo.apply(39, m, 41),
    stayBelow: (m: Meta) => plusOneTwoThree.increaseTo.apply(10, m, 12)
  },
  {
    name: 'superstitious-counting',
    passTheLimit: (m: Meta) => superstitiousCounting.step.apply(
      { current: 95, target: 100, restricted: null }, m, 5
    ),
    stayBelow: (m: Meta) => superstitiousCounting.step.apply(
      { current: 50, target: 100, restricted: null }, m, 5
    )
  }
];

describe.each(games)('$name end of game', ({ passTheLimit, stayBelow }) => {
  it.each([0, 1])('ends against the mover (player %i) when the limit is passed', player => {
    const outcome = passTheLimit(asPlayer(player));
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 - player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn while short of the limit', () => {
    const outcome = stayBelow(asPlayer(0));
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('plus-one-two-three exactly on the target', () => {
  it('does not end the game — only passing 40 loses', () => {
    const outcome = plusOneTwoThree.increaseTo.apply(38, asPlayer(0), 40);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('superstitious-counting exactly on the target', () => {
  it('does end the game — reaching m loses, unlike plus-one-two-three', () => {
    const outcome = superstitiousCounting.step.apply(
      { current: 95, target: 100, restricted: null }, asPlayer(0), 5
    );
    expect(outcome.gameEnd).toEqual({ winnerIndex: 1 });
  });
});
