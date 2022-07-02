import { mapGetters, mapActions, mapState } from 'vuex';
import GameSidebar from '../../common/game-sidebar/game-sidebar';
import { getGameStateAfterMove, inPlacingPhase } from './strategy/strategy';

export default {
  template: require('./tictactoe.html'),
  components: { GameSidebar },
  computed: {
    ...mapState(['board', 'shouldPlayerMoveNext']),
    ...mapGetters(['isGameInProgress']),
    stepDescription() {
      return inPlacingPhase(this.board)
        ? 'Kattints egy üres mezőre.'
        : 'Kattints egy piros korongra.';
    }
  },
  methods: {
    ...mapActions(['endPlayerTurn', 'initializeGame']),
    clickField({ row, col }) {
      if (!this.shouldPlayerMoveNext) return;
      if (inPlacingPhase(this.board)) {
        if (this.board[row * 3 + col]) return;
        else this.board[row * 3 + col] = 'blue';
      } else {
        if (this.board[row * 3 + col] !== 'red') return;
        this.board[row * 3 + col] = 'purple';
      }
      this.endPlayerTurn(getGameStateAfterMove(this.board));
    },
    pieceColor({ row, col }) {
      const colorCode = this.board[row * 3 + col];
      if (colorCode === 'red') return 'bg-red-600';
      if (colorCode === 'purple') return 'bg-purple-600';
      return 'bg-blue-600';
    }
  },
  created() {
    this.initializeGame();
  }
};