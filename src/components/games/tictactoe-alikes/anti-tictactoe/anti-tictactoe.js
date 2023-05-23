import { mapActions, mapState } from 'vuex';
import GameSidebar from '../../../common/game-sidebar/game-sidebar';
import GameRule from '../../../common/game-rule/game-rule';
import { getGameStateAfterMove, playerColor } from './strategy/strategy';

export default {
  template: require('./anti-tictactoe.html'),
  components: { GameSidebar, GameRule },
  computed: {
    ...mapState(['board', 'shouldPlayerMoveNext', 'isPlayerTheFirstToMove'])
  },
  methods: {
    ...mapActions(['endPlayerTurn', 'initializeGame']),
    isMoveAllowed(id) {
      if (!this.shouldPlayerMoveNext) return false;
      return this.board[id] === null;
    },
    clickField(id) {
      if (!this.isMoveAllowed(id)) return;

      this.board[id] = playerColor(this.isPlayerTheFirstToMove);
      this.endPlayerTurn(getGameStateAfterMove(this.board));
    },
    pieceColor(id) {
      const colorCode = this.board[id];
      if (colorCode === 'red') return 'bg-red-600';
      return 'bg-blue-600';
    }
  },
  created() {
    this.initializeGame();
  }
};