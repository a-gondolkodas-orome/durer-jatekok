import {
  runMatch,
  type BotMove, type BotStrategy, type Ctx, type Gameplay, type MoveDefinition
} from './components/strategy-game-factory';
import { asBotMoves } from './components/strategy-game-factory/engine/bot-turn';

// Mock `ctx` for testing move functions and bot strategies. A game that pins
// its mid-turn state names it — `makeCtx<TurnState>({ turnState: … })` — so the
// spec type-checks the same shape the moves receive at runtime.
export const makeCtx = <TTurnState = unknown>(
  overrides: Partial<Ctx<TTurnState>> = {}
): Ctx<TTurnState> => ({
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

// Reads a move's legality the way the engine does — through the move itself —
// so a spec asserting a rule also pins that the rule is still wired to the move
// it governs. A bare predicate imported from `gameplay.ts` keeps passing after
// its `validate:` line is dropped; this does not.
export const moveValidator = <TBoard, TArgs extends unknown[], TTurnState = unknown>(
  move: { validate?: (board: TBoard, meta: { ctx: Ctx<TTurnState> }, ...args: TArgs) => boolean },
  ctx: Ctx<TTurnState> = makeCtx()
) => (board: TBoard, ...args: TArgs): boolean => move.validate!(board, { ctx }, ...args);

// A bot names its moves rather than playing them, so a spec reads its decision
// straight off the return value. A strategy that named a whole turn returns
// several; the one it would play next is the first.
export const botNextMove = (named: BotMove | BotMove[]): BotMove => asBotMoves(named)[0]!;

export const botNextMoveArgs = (named: BotMove | BotMove[]): any[] =>
  botNextMove(named).args ?? [];

// Ask a strategy for its turn and play its next move through the game's own
// move, as the engine would. Lets a spec step a position forward by one bot
// move without standing up a whole match.
export const playBotMove = <TBoard, TTurnState = unknown>(
  strategy: BotStrategy<TBoard>,
  moves: Record<string, MoveDefinition<TBoard, TTurnState>>,
  board: TBoard,
  ctx: Ctx<TTurnState> = makeCtx()
): TBoard => {
  const { move, args = [] } = botNextMove(strategy({ board, ctx }));
  return moves[move]!.apply(board, { ctx }, ...args).nextBoard;
};

// Which role can force the win from `startBoard`, read off the game's own
// optimal bot playing both sides. A curated start board has to be *decisive* —
// one role wins against best play — which is what makes choosing a role a real
// decision rather than a coin flip, so this is the assertion a `startBoards`
// list is worth committing behind.
//
// Bots shuffle among equally-optimal moves, so one playout samples one line;
// several disagreeing means the board is not decisive, or the bot it was
// verified against is not optimal. Either way the list is not what it claims,
// so this throws rather than returning a winner nobody can trust.
export const forcedWinnerIndex = <TBoard, TTurnState = unknown>({
  gameplay,
  botStrategy,
  startBoard,
  playouts = 5
}: {
  gameplay: Gameplay<TBoard, TTurnState>
  botStrategy: BotStrategy<TBoard>
  startBoard: TBoard
  playouts?: number
}): number => {
  const winners = new Set(Array.from({ length: playouts }, () => runMatch({
    gameplay,
    strategies: [botStrategy, botStrategy],
    startBoard
  }).winnerIndex));
  if (winners.size !== 1) {
    throw new Error(`forcedWinnerIndex: optimal play reached both outcomes over ${playouts} `
      + `playouts from ${JSON.stringify(startBoard)} — the board is not decisive, `
      + 'or the bot is not optimal');
  }
  return [...winners][0];
};
