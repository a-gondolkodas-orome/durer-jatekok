// @vitest-environment jsdom
import { render, screen, within, fireEvent } from '@testing-library/react';
import { Overview } from './overview';
import type { GameList } from '../games/gameList';
import { HashRouter } from 'react-router';

vi.mock('../games/gameList', (): { gameList: GameList } => ({
  gameList: {
    GameA1: {
      name: { hu: 'A egy' },
      category: ['A'],
      year: { k: '', v: '11/12' },
      round: 'döntő',
      featured: true,
      icon: 'chess'
    },
    GameA2: { name: { hu: 'A kettő' }, category: ['A'], year: { k: '', v: '12/13' }, round: 'döntő' },
    GameB1: { name: { hu: 'B egy' }, category: ['B'], year: { k: '', v: '13/14' }, round: 'döntő' },
    GameC1: { name: { hu: 'C egy' }, category: ['C'], year: { k: '', v: '14/15' }, round: 'online' },
    GameCD: { name: { hu: 'CD' }, category: ['C', 'D'], year: { k: '', v: '15/16' }, round: 'döntő' }
  }
}));

const renderOverview = () => render(<HashRouter><Overview /></HashRouter>);

describe('Overview', () => {
  it('shows the featured strip with only featured games', () => {
    renderOverview();
    const strip = screen.getByTestId('featured-strip');
    expect(within(strip).getAllByTestId('game-card')).toHaveLength(1);
    expect(within(strip).getByText('A egy')).toBeTruthy();
  });

  it('keeps both sections collapsed by default, showing only the strip', () => {
    renderOverview();
    // both section headers are present...
    expect(screen.getByText(/A-B kategória/)).toBeTruthy();
    expect(screen.getByText(/C-D-E kategória/)).toBeTruthy();
    // ...but no section's cards are rendered until expanded
    expect(screen.queryByText('A kettő')).toBeNull();
    expect(screen.queryByText('B egy')).toBeNull();
    expect(screen.queryByText('C egy')).toBeNull();
    // the featured strip is the only visible game list
    expect(screen.getByTestId('featured-strip')).toBeTruthy();
  });

  it('expands a collapsed section when its header is clicked', () => {
    renderOverview();
    expect(screen.queryByText('C egy')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /C-D-E kategória/ }));
    // both games in the C–E+ bracket appear
    expect(screen.getByText('C egy')).toBeTruthy();
    expect(screen.getByText('CD')).toBeTruthy();
  });

  it('filtering force-opens matching sections and hides the rest (and the strip)', () => {
    renderOverview();
    fireEvent.click(screen.getByRole('button', { name: 'C' }));
    // C–E+ section force-opened with its matching cards
    expect(screen.getByText('C egy')).toBeTruthy();
    expect(screen.getByText('CD')).toBeTruthy();
    // A–B section gone entirely
    expect(screen.queryByText('A kettő')).toBeNull();
    expect(screen.queryByText('B egy')).toBeNull();
    // no featured game matches C → strip hidden
    expect(screen.queryByTestId('featured-strip')).toBeNull();
  });

  it('renders a fallback icon for a game without an icon', () => {
    renderOverview();
    fireEvent.click(screen.getByRole('button', { name: /A-B kategória/ }));
    const card = screen.getByText('A kettő').closest('a');
    expect(card?.querySelector('svg')).toBeTruthy();
  });
});
