import KupacKetteoszto from '../kupac-ketteoszto/kupac-ketteoszto';
import HunyadiEsAJanicsarok from '../hunyadi-es-a-janicsarok/hunyadi-es-a-janicsarok';
import '@/assets/css/style.css';

export default {
  name: 'jatek-lista',
  template: require('./jatek-lista.html'),
  components: {
    KupacKetteoszto,
    HunyadiEsAJanicsarok
  },
  data: () => ({
    openedGame: null,
    gameList: [
      { year: 6, round: 'döntő', category: 'D', component: 'HunyadiEsAJanicsarok', name: 'Hunyadi és a janicsárok' },
      { year: 8, round: 'döntő', category: 'A', component: 'KupacKetteoszto', name: 'Kupac kettéosztó' }
    ]
  })
}
