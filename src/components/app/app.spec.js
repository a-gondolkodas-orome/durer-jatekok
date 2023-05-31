import React from 'react';
import { render } from '@testing-library/react';
import { App } from './app';
import { gameList } from '../games/gameList';

describe('App', () => {
  it('should show a list of available games', async () => {
    const { container } = render(<App />);

    const gamesToShow = Object.values(gameList).filter(game => !game.isHiddenFromOverview);

    expect(container.querySelectorAll('.js-game-card')).toHaveLength(gamesToShow.length);
  });
});
