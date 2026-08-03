import type { BotMove, Ctx } from './components/strategy-game-factory';

// Mock `ctx` for testing move functions and bot strategies.
export const makeCtx = (overrides: Partial<Ctx> = {}): Ctx => ({
  phase: 'roleSelection',
  isHumanVsHumanGame: false,
  resolvedPlayerNames: ['Player 1', 'Player 2'],
  currentPlayer: null,
  isClientMoveAllowed: false,
  winnerIndex: null,
  chosenRoleIndex: null,
  turnState: null,
  moveCount: 0,
  ...overrides
});

// A bot names its moves rather than playing them, so a spec reads its decision
// straight off the return value. `botArgs` pulls the arguments of the move it
// named (the first one, for a bot that named a whole turn).
export const botArgs = (named: BotMove | BotMove[]): any[] =>
  (Array.isArray(named) ? named[0]! : named).args ?? [];
