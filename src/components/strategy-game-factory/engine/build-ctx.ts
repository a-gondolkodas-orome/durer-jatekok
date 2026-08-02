import type { Ctx } from '../types';
import type { CoreState } from './store';

// Derives the ctx games see (moves, validators, BoardClient, bot) from the
// authoritative CoreState. Called fresh at every use, so consumers always see
// current values — there is no cached/stale ctx anywhere anymore.
export const buildCtx = <TBoard>(
  state: CoreState<TBoard>, resolvedPlayerNames: [string, string]
): Ctx => ({
  isHumanVsHumanGame: state.mode === 'vsHuman',
  resolvedPlayerNames,
  chosenRoleIndex: state.chosenRoleIndex,
  phase: state.phase,
  turnState: state.turnState,
  currentPlayer: state.currentPlayer,
  isClientMoveAllowed: state.phase === 'play'
    && (state.mode === 'vsHuman' || state.currentPlayer === state.chosenRoleIndex),
  winnerIndex: state.winnerIndex,
  moveCount: state.moveCount
});
