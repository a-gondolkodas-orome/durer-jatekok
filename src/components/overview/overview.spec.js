import React from 'react';
import { render } from '@testing-library/react';
import { Overview } from './overview';
import { gameList } from '../games/gameList';

describe('Overview', () => {
  it('should show a list of available games', async () => {
    const { container } = render(<Overview></Overview>);

    const gamesToShow = Object.values(gameList).filter(game => !game.isHiddenFromOverview);

    expect(container.querySelectorAll('.js-game-card')).toHaveLength(gamesToShow.length);
  });
});
