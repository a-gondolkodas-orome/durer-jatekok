import { mapActions, mapState } from 'vuex';
import GameSidebar from '../../common/game-sidebar/game-sidebar';
import GameRule from '../../common/game-rule/game-rule';
import { getGameStateAfterMove } from './strategy/strategy';

export default {
  template: require('./two-times-two.html'),
  components: { GameSidebar, GameRule },
  computed: {
    ...mapState(['board', 'shouldPlayerMoveNext'])
  },
  methods: {
    ...mapActions(['endPlayerTurn', 'initializeGame']),
    placePiece(tileIndex) {
      if (!this.shouldPlayerMoveNext) return;
      this.endPlayerTurn(getGameStateAfterMove(this.board, tileIndex));
    }
  },
  created() {
    this.initializeGame();
  }
};
