import type { I18nString, TranslatableNode } from '../../language';

export type Phase = 'roleSelection' | 'play' | 'gameEnd'
export type Mode = 'vsComputer' | 'vsHuman'

export interface Ctx {
  isHumanVsHumanGame: boolean
  resolvedPlayerNames: [string, string]
  chosenRoleIndex: number | null
  phase: Phase
  turnState: unknown
  currentPlayer: number | null
  isClientMoveAllowed: boolean
  winnerIndex: number | null
  moveCount: number
}

export interface Events {
  endTurn: () => void
  endGame: (winnerIndex?: number | null) => void
  setTurnState: (state: unknown) => void
}

export type MoveResult<TBoard> = { nextBoard: TBoard; autoEndOfTurn?: boolean }
export type MoveFunction<TBoard> = (
  board: TBoard, meta: { ctx: Ctx; events: Events }, ...args: any[]
) => MoveResult<TBoard>
// Pure, side-effect-free legality predicate for a single move. Keyed by move
// name in `gameplay.moveValidators`. Because it depends only on `board` + `ctx`
// (no React, no `events`), the same function drives the UI (button `disabled`),
// the engine (illegal-move enforcement) and, in the future, an authoritative
// server-side check.
export type MoveValidator<TBoard> = (
  board: TBoard, meta: { ctx: Ctx }, ...args: any[]
) => boolean
export type GameMoves<TBoard> = Record<string, (board: TBoard, ...args: any[]) => MoveResult<TBoard>>
export type StrategyArgs<TBoard> = { board: TBoard; ctx: Ctx; moves: GameMoves<TBoard> }
export type BoardClientProps<TBoard> = StrategyArgs<TBoard> & { events: Events }

export interface Variant {
  originalIndex: number
  disabled?: boolean
  label?: I18nString
  botStrategy?: unknown
  notAlwaysOptimal?: boolean
}

export interface VariantInput<TBoard> {
  label?: I18nString
  isDefault?: boolean
  generateStartBoard?: () => TBoard
  botStrategy?: (args: StrategyArgs<TBoard>) => void
  notAlwaysOptimal?: boolean
  // Optional per-variant rule text. Falls back to `presentation.rule` when
  // omitted — used when sibling games are merged into one game whose variants
  // differ only in their rule wording (e.g. board size / coin values).
  rule?: TranslatableNode
}
