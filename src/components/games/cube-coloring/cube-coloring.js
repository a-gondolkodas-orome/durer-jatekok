import { mapGetters, mapActions, mapState } from 'vuex';
import GameSidebar from '../../common/game-sidebar/game-sidebar';
import { getGameStateAfterMove, isAllowedStep } from './strategy/strategy';

export default {
  name: 'cube-coloring',
  template: require('./cube-coloring.html'),
  components: { GameSidebar },
  computed: {
    ...mapState(['game', 'board', 'shouldPlayerMoveNext']),
    ...mapGetters(['isGameInProgress']),
    stepDescription() {
      return this.isGameInProgress && this.shouldPlayerMoveNext
        ? 'Színezz meg egy csúcsot!'
        : '';
    }
  },
  data() {
    return {
      color: "",
      show: false,
      x: 0,
      y: 0
  
    }
  },
  methods: {
    ...mapActions(['playerMove', 'initializeGame']),
    clickPicker(color) {
      if (!this.shouldPlayerMoveNext) return;
      if (this.color === color) {
        this.show = !this.show;
      } else {
        this.show = true;
        this.color = color;
      }
    },
    drawPickedColor(event) {
      this.x = event.offsetX;
      this.y = event.offsetY;
    },
    setColor(vertex) {
      if (!this.shouldPlayerMoveNext) return;
      if (this.show && isAllowedStep(this.board, vertex, this.color)) {
          this.board.colors[vertex] = this.color;
          this.playerMove(getGameStateAfterMove(this.board));
      }
    }
  },
  created() {
    this.initializeGame();
  }
};
