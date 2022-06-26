import { mapGetters, mapActions } from 'vuex';
import EnemyLoader from '../enemy-loader/enemy-loader';

export default {
  name: 'game-sidebar',
  template: require('./game-sidebar.html'),
  props: { stepDescription: String },
  components: { EnemyLoader },
  computed: {
    ...mapGetters([
      'ctaText',
      'isGameReadyToStart'
    ])
  },
  methods: {
    ...mapActions(['startGameAsPlayer', 'initializeGame']),
    restartGame() {
      this.$emit('restart');
      this.initializeGame();
    }
  },
  created() {
    this.initializeGame();
  }
};