import React from 'react';

export const rule = <>
  Two players play on a 3 × 3 board with blue and red pieces following standard tic-tac-toe rules:
  they alternate placing pieces, and the first to get three pieces of the same colour in a row,
  column, or diagonal wins. If after all 9 pieces are placed neither player has won (a draw),
  play continues: the next player may recolour one of their opponent&apos;s pieces to white.
  From that point on, the winner is the first to form three white pieces in a row, column, or diagonal.
</>;

export const stepPlacing = 'Click an empty cell to place a piece.';
export const stepWhitening = 'Click a red piece.';
