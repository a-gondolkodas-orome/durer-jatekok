import type { I18nString } from '../language/translate';

export type Phase = 'roleSelection' | 'play' | 'gameEnd'
export type PlayerIndex = 0 | 1

export interface Ctx {
  isHumanVsHumanGame: boolean
  playerNames: string[]
  chosenRoleIndex: PlayerIndex | null
  phase: Phase
  turnState: unknown
  currentPlayer: PlayerIndex | null
  currentPlayerName: string | null
  isClientMoveAllowed: boolean
  isRoleSelectorWinner: boolean
  winnerIndex: PlayerIndex | null
  winnerName: string | null
}

export interface Events {
  endTurn: () => void
  endGame: (options?: { winnerIndex?: PlayerIndex | null }) => void
  setTurnState: (state: unknown) => void
}

export type MoveResult<TBoard> = { nextBoard: TBoard; autoEndOfTurn?: boolean }
export type MoveFunction<TBoard> = (
  board: TBoard, meta: { ctx: Ctx; events: Events }, ...args: any[]
) => MoveResult<TBoard>
export type GameMoves<TBoard> = Record<string, (board: TBoard, ...args: any[]) => MoveResult<TBoard>>
export type StrategyArgs<TBoard> = { board: TBoard; ctx: Ctx; moves: GameMoves<TBoard> }
export type BoardClientProps<TBoard> = StrategyArgs<TBoard> & { events: Events }

export interface Variant {
  originalIndex: number
  disabled?: boolean
  label?: I18nString
  botStrategy?: unknown
}

export interface VariantInput<TBoard> {
  label?: I18nString
  isDefault?: boolean
  generateStartBoard?: () => TBoard
  botStrategy?: (args: StrategyArgs<TBoard>) => void
}

// Subset of Ctx used for display (CTA text, game-end dialog). Play-only fields are optional
// so the frozen game-end snapshot (which omits them) satisfies this type.
export interface DisplayCtx {
  phase: Phase
  isHumanVsHumanGame: boolean
  isClientMoveAllowed?: boolean
  isRoleSelectorWinner?: boolean
  currentPlayerName?: string | null
  winnerName?: string | null
}
