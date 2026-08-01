import { isArchitectStepAllowed, isDestructionAllowed } from './helpers';

// The 8-vertex variant: the architect starts at A(0) with 40 km per day.
const octagon = (over: Partial<{ architectPosition: number; towers: boolean[]; kmUsedToday: number }> = {}) => ({
  architectPosition: 0,
  towers: Array(8).fill(true),
  day: 1,
  kmUsedToday: 0,
  ...over
});

const KM_PER_DAY = 40;
const stepAllowed = (board, target: number) => isArchitectStepAllowed(board, target, KM_PER_DAY);

describe('isArchitectStepAllowed', () => {
  it('allows a step to either neighbour along the wall', () => {
    expect(stepAllowed(octagon({ architectPosition: 3 }), 2)).toBe(true);
    expect(stepAllowed(octagon({ architectPosition: 3 }), 4)).toBe(true);
  });

  it('allows the step that wraps round between the last and first vertex', () => {
    expect(stepAllowed(octagon({ architectPosition: 0 }), 7)).toBe(true);
    expect(stepAllowed(octagon({ architectPosition: 7 }), 0)).toBe(true);
  });

  it('rejects a jump across the polygon', () => {
    expect(stepAllowed(octagon({ architectPosition: 0 }), 4)).toBe(false);
    expect(stepAllowed(octagon({ architectPosition: 0 }), 2)).toBe(false);
  });

  it('rejects staying put', () => {
    expect(stepAllowed(octagon({ architectPosition: 3 }), 3)).toBe(false);
  });

  it("allows the last edge of the day's allowance but not one more", () => {
    expect(stepAllowed(octagon({ kmUsedToday: 30 }), 1)).toBe(true);
    expect(stepAllowed(octagon({ kmUsedToday: 40 }), 1)).toBe(false);
  });

  it('rejects a vertex that is not on the wall', () => {
    expect(stepAllowed(octagon(), 8)).toBe(false);
    expect(stepAllowed(octagon(), -1)).toBe(false);
  });

  it('scales with the wall the board actually has', () => {
    const decagon = { architectPosition: 0, towers: Array(10).fill(true), day: 1, kmUsedToday: 0 };
    // 9 wraps round to 0 on a 10-gon, but is not a neighbour of 0 on an 8-gon
    expect(isArchitectStepAllowed(decagon, 9, 50)).toBe(true);
    expect(stepAllowed(octagon(), 9)).toBe(false);
  });
});

describe('isDestructionAllowed', () => {
  it('allows knocking down a standing tower', () => {
    expect(isDestructionAllowed(octagon(), 5)).toBe(true);
  });

  it('rejects a vertex with no tower on it', () => {
    const towers = Array(8).fill(true);
    towers[5] = false;
    expect(isDestructionAllowed(octagon({ towers }), 5)).toBe(false);
  });

  it('rejects a vertex that is not on the wall', () => {
    expect(isDestructionAllowed(octagon(), 8)).toBe(false);
    expect(isDestructionAllowed(octagon(), 1.5)).toBe(false);
  });
});
