import { distance, isSharkMoveAllowed, isSubmarineMoveAllowed } from './helpers';

// A 4 × 4 lake, sectors numbered row by row:
//   0  1  2  3
//   4  5  6  7
//   8  9 10 11
//  12 13 14 15
const SIZE = 4;
const board = {
  submarines: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  shark: 5,
  turn: 1,
  sharkMovesInTurn: 0
};

describe('distance', () => {
  it('is the Manhattan distance of the two sectors', () => {
    expect(distance(0, 1, SIZE)).toBe(1); // side by side
    expect(distance(0, 4, SIZE)).toBe(1); // one above the other
    expect(distance(0, 5, SIZE)).toBe(2); // diagonal
    expect(distance(0, 15, SIZE)).toBe(6); // opposite corners
  });

  it('does not wrap around the edge of the lake', () => {
    // 3 and 4 are adjacent as numbers but sit in different rows, far apart
    expect(distance(3, 4, SIZE)).toBe(4);
  });
});

describe('isSubmarineMoveAllowed', () => {
  it('allows a submarine to swim into a side-adjacent sector', () => {
    expect(isSubmarineMoveAllowed(board, 2, 1, SIZE)).toBe(true);
    expect(isSubmarineMoveAllowed(board, 2, 6, SIZE)).toBe(true);
  });

  it('rejects a diagonal move', () => {
    expect(isSubmarineMoveAllowed(board, 2, 5, SIZE)).toBe(false);
  });

  it('rejects staying put', () => {
    expect(isSubmarineMoveAllowed(board, 2, 2, SIZE)).toBe(false);
  });

  it('rejects moving from a sector holding no submarine', () => {
    expect(isSubmarineMoveAllowed(board, 0, 1, SIZE)).toBe(false);
  });

  it('rejects a move off the edge of the lake', () => {
    // 3 is the end of the top row; 4 starts the next one
    expect(isSubmarineMoveAllowed({ ...board, submarines: [0, 0, 0, 1, ...Array(12).fill(0)] }, 3, 4, SIZE))
      .toBe(false);
    expect(isSubmarineMoveAllowed(board, 2, 16, SIZE)).toBe(false);
  });
});

describe('isSharkMoveAllowed', () => {
  it('allows the shark to swim into a side-adjacent sector', () => {
    expect([1, 4, 6, 9].every(to => isSharkMoveAllowed(board, to, SIZE))).toBe(true);
  });

  it('allows the shark to stay put, giving up the rest of its night', () => {
    expect(isSharkMoveAllowed(board, 5, SIZE)).toBe(true);
  });

  it('rejects a diagonal or longer move', () => {
    expect(isSharkMoveAllowed(board, 0, SIZE)).toBe(false);
    expect(isSharkMoveAllowed(board, 13, SIZE)).toBe(false);
  });

  it('rejects a sector outside the lake', () => {
    expect(isSharkMoveAllowed(board, 16, SIZE)).toBe(false);
    expect(isSharkMoveAllowed(board, -1, SIZE)).toBe(false);
  });
});
