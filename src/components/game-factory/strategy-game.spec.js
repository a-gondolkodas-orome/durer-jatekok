import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { strategyGameFactory } from './strategy-game';

const MinimalBoardClient = ({ board, moves }) => (
  <button data-testid="move-btn" onClick={() => moves.mainMove(board)}>move</button>
);

const minimalConfig = (moves, endOfTurnMove) => ({
  rule: <></>,
  metadata: { name: 'Test' },
  BoardClient: MinimalBoardClient,
  moves,
  variants: [{ botStrategy: () => {}, generateStartBoard: () => ['initial'] }],
  getPlayerStepDescription: () => '',
  endOfTurnMove
});

const renderGame = (config) => {
  const Game = strategyGameFactory(config);
  return render(<MemoryRouter><Game /></MemoryRouter>);
};

const CtxAwareBoardClient = ({ board, ctx, moves }) => (
  <button
    data-testid="move-btn"
    disabled={!ctx.isClientMoveAllowed}
    onClick={() => moves.mainMove(board)}
  >move</button>
);

const ctxAwareConfig = (overrides = {}) => {
  const { botStrategy, ...rest } = overrides;
  return {
    rule: <></>,
    metadata: { name: 'Test' },
    BoardClient: CtxAwareBoardClient,
    moves: {
      mainMove: (board, { events }) => { events.endTurn(); return { nextBoard: board }; }
    },
    variants: [{ botStrategy: botStrategy ?? (() => {}), generateStartBoard: () => ['initial'] }],
    getPlayerStepDescription: () => '',
    ...rest
  };
};

describe('isClientMoveAllowed', () => {
  it('allows both players to move in vsHuman mode', () => {
    const { getByTestId } = renderGame(ctxAwareConfig());
    fireEvent.click(getByTestId('mode-vsHuman'));
    expect(getByTestId('move-btn').disabled).toBe(true);
    fireEvent.click(getByTestId('start-hh-game'));
    expect(getByTestId('move-btn').disabled).toBe(false);
    fireEvent.click(getByTestId('move-btn')); // endTurn → currentPlayer 1
    expect(getByTestId('move-btn').disabled).toBe(false);
  });

  it('disables moves during the computer turn in vsComputer mode', () => {
    const { getByTestId } = renderGame(ctxAwareConfig());
    fireEvent.click(getByTestId('role-btn-0'));
    expect(getByTestId('move-btn').disabled).toBe(false);
    fireEvent.click(getByTestId('move-btn')); // endTurn → bot's turn
    expect(getByTestId('move-btn').disabled).toBe(true);
  });
});

describe('Bot behavior by mode', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('does not call botStrategy in vsHuman mode', () => {
    const botStrategy = vi.fn();
    const { getByTestId } = renderGame(ctxAwareConfig({ botStrategy }));
    fireEvent.click(getByTestId('mode-vsHuman'));
    fireEvent.click(getByTestId('start-hh-game'));
    fireEvent.click(getByTestId('move-btn')); // endTurn → currentPlayer 1
    act(() => { vi.advanceTimersByTime(1500); });
    expect(botStrategy).not.toHaveBeenCalled();
  });

  it('calls botStrategy when it becomes the computer turn', () => {
    const botStrategy = vi.fn();
    const { getByTestId } = renderGame(ctxAwareConfig({ botStrategy }));
    fireEvent.click(getByTestId('role-btn-0'));
    fireEvent.click(getByTestId('move-btn')); // endTurn → bot's turn
    act(() => { vi.advanceTimersByTime(1500); });
    expect(botStrategy).toHaveBeenCalledOnce();
  });
});

describe('switchMode', () => {
  it('resets to roleSelection when switching mode during play', () => {
    const { getByTestId } = renderGame(ctxAwareConfig());
    fireEvent.click(getByTestId('role-btn-0'));
    expect(getByTestId('move-btn').disabled).toBe(false);
    fireEvent.click(getByTestId('mode-vsHuman'));
    expect(getByTestId('start-hh-game')).toBeTruthy();
  });

  it('resets to roleSelection when switching back to vsComputer', () => {
    const { getByTestId } = renderGame(ctxAwareConfig());
    fireEvent.click(getByTestId('mode-vsHuman'));
    fireEvent.click(getByTestId('start-hh-game'));
    fireEvent.click(getByTestId('move-btn'));
    fireEvent.click(getByTestId('mode-vsComputer'));
    expect(getByTestId('role-btn-0')).toBeTruthy();
  });
});

describe('strategyGameFactory endOfTurnMove', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('calls endOfTurnMove after 750ms when a move returns autoEndOfTurn: true', () => {
    const autoMove = vi.fn((board) => ({ nextBoard: board }));
    const moves = {
      mainMove: (board, { events }) => { events.endTurn(); return { nextBoard: board, autoEndOfTurn: true }; },
      autoMove
    };

    const { getByTestId } = renderGame(minimalConfig(moves, 'autoMove'));
    fireEvent.click(getByTestId('move-btn'));

    expect(autoMove).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(750); });

    expect(autoMove).toHaveBeenCalledOnce();
  });

  it('does not call endOfTurnMove when a move does not return autoEndOfTurn', () => {
    const autoMove = vi.fn((board) => ({ nextBoard: board }));
    const moves = {
      mainMove: (board, { events }) => { events.endTurn(); return { nextBoard: board }; },
      autoMove
    };

    const { getByTestId } = renderGame(minimalConfig(moves, 'autoMove'));
    fireEvent.click(getByTestId('move-btn'));
    act(() => { vi.advanceTimersByTime(750); });

    expect(autoMove).not.toHaveBeenCalled();
  });
});
