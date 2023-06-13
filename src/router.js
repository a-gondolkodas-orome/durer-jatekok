import { createRouter, createWebHashHistory } from 'vue-router';
import Overview from './components/overview/overview';
import StrategyGame from './components/strategy-game/strategy-game';
import PageNotFound from './components/page-not-found/page-not-found';
import FourPilesSpreadAhead from './components/games/four-piles-spread-ahead/four-piles-spread-ahead';
"import AddReduceDouble from './components/games/add-reduce-double/add-reduce-double';"

const routes = [
  { path: '/', component: Overview },
  { path: '/game/:gameId/', component: StrategyGame, props: true },
  { path: '/:path(.*)*', component: PageNotFound },
  { path: '/four-piles-spread-ahead', component: FourPilesSpreadAhead }
];

"{ path: '/add-reduce-double', component: AddReduceDouble }"

export default () => createRouter({
  history: createWebHashHistory(),
  routes
});
