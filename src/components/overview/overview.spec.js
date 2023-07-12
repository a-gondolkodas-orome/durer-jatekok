import React from 'react';
import { render } from '@testing-library/react';
import { Overview } from './overview';
import { gameList } from '../games/gameList';
import { HashRouter } from 'react-router-dom';

describe('Overview', () => {
  it('should show a list of available games', async () => {
    const { container } = render(<HashRouter><Overview /></HashRouter>);

    expect(container.querySelectorAll('.js-game-card')).toHaveLength(Object.values(gameList).length - 1);
  });
});
