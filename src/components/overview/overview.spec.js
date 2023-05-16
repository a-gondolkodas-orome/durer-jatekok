'use strict';

import Overview from './overview';
import { gameList } from '../games/games';
import { mountComponent } from '../../../test-helpers';
import createStore from '../../store/store';

describe('Overview', () => {
  it('should show a list of available games', async () => {
    const { wrapper } = await mountComponent(Overview);

    const gamesToShow = Object.values(gameList).filter((game) => !game.isHiddenFromOverview);

    expect(wrapper.findAll('.js-game-card')).toHaveLength(gamesToShow.length);
  });

  it('should clear previously selected game when mounted', async () => {
    const store = createStore();
    store.commit('setGameDefinition', { gameId: 'HunyadiAndTheJanissaries' });
    store.commit('setGameStatus', 'readyToStart');
    await mountComponent(Overview, { store });

    expect(store.state.gameDefinition).toBe(null);
    expect(store.state.gameStatus).toBe(null);
  });
});
