'use strict';

import Game from './game';
import { mountComponent } from '../../../test-helpers';

describe('Game', () => {
  it('should clear selected game when navigating back to overview page', async () => {
    const { wrapper, store } = await mountComponent(Game,  { propsData: { gameId: 'HeapSplitter' } });

    wrapper.find('.js-first-player').trigger('click');
    expect(store.state.gameStatus).toBe('inProgress');

    await wrapper.find('.js-back-to-overview').trigger('click');

    expect(store.state.gameStatus).toBe(null);
  });

  it('should set game on store based on gameId when mounted', async () => {
    const { store } = await mountComponent(Game,  { propsData: { gameId: 'HeapSplitter' } });
    expect(store.state.game.component).toEqual('HeapSplitter');
  });

  it('should load page with new game when url changes', async () => {
    const { wrapper, store } = await mountComponent(Game,  { propsData: { gameId: 'HeapSplitter' } });
    await wrapper.setProps({ gameId: 'HunyadiAndTheJanissaries' });
    expect(store.state.game.component).toEqual('HunyadiAndTheJanissaries');
  });

  it('should show not found page if gameId is unknown', async () => {
    const { wrapper, store } = await mountComponent(Game,  { propsData: { gameId: 'UnknownGame' } });
    expect(store.state.game).toBe(null);
    expect(wrapper.find('div').text()).toMatch(/a keresett oldal nem található/);
  });
});
