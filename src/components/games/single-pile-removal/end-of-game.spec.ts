import { moves as doublingReduction } from './doubling-reduction/doubling-reduction';
import { moves as primeExponentials } from './prime-exponentials/prime-exponentials';
import { moves as primelyToZero } from './primely-to-zero/primely-to-zero';
import { moves as take1OrHalve } from './take-1-or-halve/take-1-or-halve';
import { moves as takePowerOfTwo } from './take-power-of-two/take-power-of-two';
import { moves as threeMore } from './three-more/three-more';
import { moves as waningStones } from './waning-stones/waning-stones';
import { makeCtx } from '../../../test-utils';

// Every game in this family is a race to empty the pile, and every one of them
// credits the player who takes the last stone. What differs is only the rule
// capping the take, which legality (not the outcome) enforces — so the ending
// is asserted once per game against the same expectation.
type Meta = { ctx: ReturnType<typeof makeCtx> };
const asPlayer = (currentPlayer: number): Meta => ({ ctx: makeCtx({ currentPlayer }) });

const games = [
  {
    name: 'doubling-reduction',
    clearThePile: (m: Meta) => doublingReduction.take.apply({ stones: 3, maxTake: 3 }, m, 3),
    leaveStones: (m: Meta) => doublingReduction.take.apply({ stones: 9, maxTake: 9 }, m, 3)
  },
  {
    name: 'three-more',
    clearThePile: (m: Meta) => threeMore.take.apply({ stones: 3, maxTake: 4 }, m, 3),
    leaveStones: (m: Meta) => threeMore.take.apply({ stones: 9, maxTake: 4 }, m, 3)
  },
  {
    name: 'waning-stones',
    clearThePile: (m: Meta) => waningStones.take.apply({ stones: 3, maxTake: 3 }, m, 3),
    leaveStones: (m: Meta) => waningStones.take.apply({ stones: 9, maxTake: 4 }, m, 3)
  },
  {
    name: 'prime-exponentials',
    clearThePile: (m: Meta) => primeExponentials.subtractPrimeExponent.apply(
      8, m, { prime: 2, exponent: 3 }
    ),
    leaveStones: (m: Meta) => primeExponentials.subtractPrimeExponent.apply(
      20, m, { prime: 2, exponent: 3 }
    )
  },
  {
    name: 'take-power-of-two',
    clearThePile: (m: Meta) => takePowerOfTwo.subtractPowerOfTwo.apply(8, m, 3),
    leaveStones: (m: Meta) => takePowerOfTwo.subtractPowerOfTwo.apply(20, m, 2)
  },
  {
    // this one names the number it moves *to* rather than the amount taken
    name: 'primely-to-zero',
    clearThePile: (m: Meta) => primelyToZero.moveTo.apply(5, m, 0),
    leaveStones: (m: Meta) => primelyToZero.moveTo.apply(9, m, 4)
  },
  {
    name: 'take-1-or-halve',
    clearThePile: (m: Meta) => take1OrHalve.take1.apply(1, m),
    leaveStones: (m: Meta) => take1OrHalve.take1.apply(5, m)
  }
];

describe.each(games)('$name end of game', ({ clearThePile, leaveStones }) => {
  it.each([0, 1])('ends for the mover (player %i) when the pile is cleared', player => {
    const outcome = clearThePile(asPlayer(player));
    expect(outcome.gameEnd).toEqual({ winnerIndex: player });
    expect(outcome.isTurnEnd).toBeUndefined();
  });

  it('passes the turn while stones remain', () => {
    const outcome = leaveStones(asPlayer(0));
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});

describe('take-1-or-halve halving', () => {
  it('never ends the game — halving an even pile always leaves at least one', () => {
    const outcome = take1OrHalve.halve.apply(2);
    expect(outcome.nextBoard).toBe(1);
    expect(outcome.gameEnd).toBeUndefined();
    expect(outcome.isTurnEnd).toBe(true);
  });
});
