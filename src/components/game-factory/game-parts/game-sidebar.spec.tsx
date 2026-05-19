import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { GameSidebar } from './game-sidebar';

type SidebarProps = React.ComponentProps<typeof GameSidebar>
type SidebarCtx = SidebarProps['ctx']
type SidebarMoves = SidebarProps['moves']

beforeAll(() => {
  const { unmount } = render(
    <MemoryRouter>
      <GameSidebar
        roleLabels={undefined}
        stepDescription=""
        ctx={{ ...defaultCtx, isHumanVsHumanGame: true, phase: 'roleSelection' }}
        moves={defaultMoves}
        variants={defaultVariants}
        selectedVariantIndex={0}
      />
    </MemoryRouter>
  );
  unmount();
});

const defaultVariants: SidebarProps['variants'] = [
  { botStrategy: () => {}, originalIndex: 0, disabled: false }
];

const defaultCtx: SidebarCtx = {
  isHumanVsHumanGame: false,
  phase: 'roleSelection',
  isClientMoveAllowed: false,
  isRoleSelectorWinner: false,
  playerNames: ['Player 1', 'Player 2'],
  currentPlayerName: 'Player 1',
  currentPlayer: 0,
  winnerName: null
};

const defaultMoves: SidebarMoves = {
  switchMode: vi.fn(),
  startGame: vi.fn(),
  setPlayerNames: vi.fn(),
  setDifficulty: vi.fn(),
  resetGameState: vi.fn()
};

const renderSidebar = (
  ctxOverrides: Partial<SidebarCtx> = {},
  movesOverrides: Partial<SidebarMoves> = {},
  variants: SidebarProps['variants'] = defaultVariants
) => {
  const ctx = { ...defaultCtx, ...ctxOverrides };
  const moves = { ...defaultMoves, ...movesOverrides };
  const { container } = render(
    <MemoryRouter>
      <GameSidebar
        roleLabels={undefined}
        stepDescription=""
        ctx={ctx}
        moves={moves}
        variants={variants}
        selectedVariantIndex={0}
      />
    </MemoryRouter>
  );
  return { container, moves };
};

describe('GameSidebar', () => {
  it('shows name inputs in vsHuman roleSelection', () => {
    renderSidebar({ isHumanVsHumanGame: true, phase: 'roleSelection' });
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('does not show name inputs in vsComputer roleSelection', () => {
    renderSidebar({ isHumanVsHumanGame: false, phase: 'roleSelection' });
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('shows spinner in vsComputer play when it is the computer turn', () => {
    const { container } = renderSidebar({
      isHumanVsHumanGame: false,
      phase: 'play',
      isClientMoveAllowed: false
    });
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('does not show spinner in vsHuman play', () => {
    const { container } = renderSidebar({
      isHumanVsHumanGame: true,
      phase: 'play',
      isClientMoveAllowed: true
    });
    expect(container.querySelector('.animate-spin')).toBeNull();
  });
});
