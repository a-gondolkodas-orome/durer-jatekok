import React from 'react';
import { render } from '@testing-library/react';
import { Overview } from './overview';
import { gameList } from '../games/gameList';
import { HashRouter } from 'react-router-dom';

describe('Overview', () => {
  it('should show a list of available games', async () => {
    const { container } = render(<HashRouter><Overview /></HashRouter>);

    const gamesToShow = Object.values(gameList).filter(game => !game.isHiddenFromOverview);

    expect(container.querySelectorAll('.js-game-card')).toHaveLength(gamesToShow.length);
  });
});
