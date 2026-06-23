import React, { useState, useEffect, useRef } from 'react';
import { GameHeader, GameFooter, GameRule } from './game-parts/game-chrome';
import { GameSidebar } from './game-parts/game-sidebar';
import { GameEndDialog } from './game-parts/game-end-dialog';
import { mapValues, cloneDeep } from 'lodash';
import { useTranslation, type TranslatableNode, type I18nString } from '../language';
import { useLocation } from 'react-router';
import { useGameStats } from './use-game-stats';
import type {
  Phase, Mode, Ctx, Events, MoveResult, MoveFunction, GameMoves,
  BoardClientProps, Variant as DisplayVariant, VariantInput
} from './types';
import { resolveVariants } from './resolve-variants';

const DEFAULT_PLAYER_NAMES: I18nString[] = [
  { hu: '1. játékos', en: '1st player' },
  { hu: '2. játékos', en: '2nd player' }
];

export interface Presentation<TBoard> {
  rule: TranslatableNode
  roleLabels?: [I18nString, I18nString]
  getPlayerStepDescription: (args: { board: TBoard; ctx: Ctx }) => TranslatableNode
}

export interface Gameplay<TBoard> {
  moves: Record<string, MoveFunction<TBoard>>
  endOfTurnMove?: string
}

export type StrategyGameConfig<TBoard> = {
  presentation: Presentation<TBoard>
  BoardClient: React.ComponentType<BoardClientProps<TBoard>>
  gameplay: Gameplay<TBoard>
  variants: VariantInput<TBoard>[]
}

export const strategyGameFactory = <TBoard,>({
  presentation,
  BoardClient,
  gameplay,
  variants
}: StrategyGameConfig<TBoard>) => {
  const { rule, roleLabels, getPlayerStepDescription } = presentation;
  const { moves, endOfTurnMove } = gameplay;
  const { defaultVariantIndex, defaultVariant, resolvedVariants } = resolveVariants(variants);

  return () => {
    const { t } = useTranslation();
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(defaultVariantIndex);
    const activeVariant = resolvedVariants[selectedVariantIndex] ?? defaultVariant;
    const defaultGenerateStartBoard = defaultVariant.generateStartBoard!;
    const activeGenerateStartBoard = activeVariant.generateStartBoard ?? defaultGenerateStartBoard;

    type UndoSnapshot = { board: TBoard; currentPlayer: number };

    // Single source of truth for the per-session state, used both to seed the
    // initial state and to reset it (see resetGameState). The three persistent
    // values — selectedVariantIndex, mode, playerNames — are deliberately not
    // part of a session and survive resets.
    const createInitialSession = (boardGenerator: () => TBoard) => ({
      board: boardGenerator(),
      phase: 'roleSelection' as Phase,
      chosenRoleIndex: null as number | null,
      currentPlayer: null as number | null,
      isGameEndDialogOpen: false,
      winnerIndex: null as number | null,
      gameUuid: crypto.randomUUID(),
      moveCount: 0,
      turnState: null as unknown,
      undoSnapshot: null as UndoSnapshot | null
    });

    // Resolve which board generator (and variant index) to use for a fresh game.
    // In vsHuman mode, a variant without its own generateStartBoard falls back to
    // the default variant. Only used when starting a new game — the render path
    // above intentionally keeps no such index-correction.
    const resolveBoardGenerator = (variantIndex: number, m: Mode) => {
      const variant = resolvedVariants[variantIndex] ?? defaultVariant;
      const generator = variant.generateStartBoard ?? defaultGenerateStartBoard;
      if (m === 'vsHuman' && !variant.generateStartBoard) {
        return { index: defaultVariantIndex, generator: defaultGenerateStartBoard };
      }
      return { index: variantIndex, generator };
    };

    const [initialSession] = useState(() => createInitialSession(activeGenerateStartBoard));
    const [board, setBoard] = useState<TBoard>(initialSession.board);
    const [phase, setPhase] = useState<Phase>(initialSession.phase);
    const [chosenRoleIndex, setChosenRoleIndex] = useState<number | null>(initialSession.chosenRoleIndex);
    const [currentPlayer, setCurrentPlayer] = useState<number | null>(initialSession.currentPlayer);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(initialSession.isGameEndDialogOpen);
    const [winnerIndex, setWinnerIndex] = useState<number | null>(initialSession.winnerIndex);
    const [gameUuid, setGameUuid] = useState(initialSession.gameUuid);
    const [moveCount, setMoveCount] = useState(initialSession.moveCount);
    const [turnState, setTurnState] = useState<unknown>(initialSession.turnState);
    const [mode, setMode] = useState<Mode>('vsComputer');
    const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(initialSession.undoSnapshot);
    const currentTurnHasMovesRef = useRef(false);
    const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [playerNames, setPlayerNames] = useState<[string, string]>(() => {
      try {
        const stored = localStorage.getItem('durer-player-names');
        if (stored) return JSON.parse(stored) as [string, string];
      } catch {}
      return ['', ''];
    });

    useEffect(() => {
      localStorage.setItem('durer-player-names', JSON.stringify(playerNames));
    }, [playerNames]);

    const isHumanVsHumanGame = mode === 'vsHuman';

    const gameId = useLocation().pathname.split('/').pop()!;
    const { stats, recordResult, resetStats } = useGameStats(gameId, selectedVariantIndex);

    useEffect(() => {
      if (!isHumanVsHumanGame && phase === 'play' && currentPlayer === (1 - chosenRoleIndex!)) {
        doBotTurn();
      }
    }, [currentPlayer, isHumanVsHumanGame, phase, chosenRoleIndex]); // doBotTurn excluded: recreates every render

    let wrappedGameMoves: GameMoves<TBoard> = {} as GameMoves<TBoard>;

    const moveWrapper = (doMove: () => MoveResult<TBoard>): MoveResult<TBoard> => {
      if (!currentTurnHasMovesRef.current) {
        setUndoSnapshot({ board: cloneDeep(board), currentPlayer: currentPlayer! });
        currentTurnHasMovesRef.current = true;
      }
      const moveResult = doMove();
      setBoard(moveResult.nextBoard);
      setMoveCount(c => c + 1);
      if (endOfTurnMove && moveResult.autoEndOfTurn) {
        botTimeoutRef.current = setTimeout(() => {
          botTimeoutRef.current = null;
          wrappedGameMoves[endOfTurnMove]!(moveResult.nextBoard);
        }, 750);
      }
      return moveResult;
    };

    const resetGameState = ({ newMode = mode, newVariantIndex = selectedVariantIndex } = {}) => {
      const { index: finalVariantIndex, generator: boardGenerator } =
        resolveBoardGenerator(newVariantIndex, newMode);
      const s = createInitialSession(boardGenerator);
      setSelectedVariantIndex(finalVariantIndex);
      setMode(newMode);
      setBoard(s.board);
      setPhase(s.phase);
      setChosenRoleIndex(s.chosenRoleIndex);
      setCurrentPlayer(s.currentPlayer);
      setIsGameEndDialogOpen(s.isGameEndDialogOpen);
      setWinnerIndex(s.winnerIndex);
      setGameUuid(s.gameUuid);
      setMoveCount(s.moveCount);
      setTurnState(s.turnState);
      setUndoSnapshot(s.undoSnapshot);
      currentTurnHasMovesRef.current = false;
    };

    const setDifficulty = (index: number) => {
      resetGameState({ newVariantIndex: index });
    };

    const getVariantsForMode = (m: Mode): DisplayVariant[] => {
      const humanVsHuman = m === 'vsHuman';
      return resolvedVariants
        .map((v, i) => ({ ...v, originalIndex: i, disabled: !humanVsHuman && !v.botStrategy }))
        .filter(v => !humanVsHuman || !!v.generateStartBoard);
    };

    const resolvedPlayerNames: [string, string] = [
      playerNames[0] || t(DEFAULT_PLAYER_NAMES[0]),
      playerNames[1] || t(DEFAULT_PLAYER_NAMES[1])
    ];

    const endGame = (winnerIndex?: number | null) => {
      const resolvedWinner = winnerIndex ?? currentPlayer;
      setPhase('gameEnd');
      setWinnerIndex(resolvedWinner);
      setIsGameEndDialogOpen(true);
      if (!isHumanVsHumanGame) {
        recordResult(resolvedWinner === chosenRoleIndex ? 'win' : 'loss');
      }
    };

    const canUndo = phase === 'play'
      && undoSnapshot !== null
      && (isHumanVsHumanGame || undoSnapshot.currentPlayer === chosenRoleIndex);

    const undo = () => {
      if (!canUndo) return;
      if (botTimeoutRef.current !== null) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
      setBoard(undoSnapshot!.board);
      setCurrentPlayer(undoSnapshot!.currentPlayer);
      setTurnState(null);
      setUndoSnapshot(null);
      currentTurnHasMovesRef.current = false;
    };

    const endTurn = () => {
      currentTurnHasMovesRef.current = false;
      setCurrentPlayer(p => 1 - p!);
    };

    const startGame = (roleIndex: number | null = null) => {
      setPhase('play');
      setCurrentPlayer(0);
      setChosenRoleIndex(roleIndex);
    };

    const isClientMoveAllowed = phase === 'play'
      && (isHumanVsHumanGame || currentPlayer === chosenRoleIndex);

    const ctx: Ctx = {
      isHumanVsHumanGame,
      resolvedPlayerNames,
      chosenRoleIndex,
      phase,
      turnState,
      currentPlayer,
      isClientMoveAllowed,
      winnerIndex,
      moveCount
    };

    const events: Events = {
      endTurn,
      endGame,
      setTurnState
    };

    wrappedGameMoves = mapValues(
      moves,
      (f) => (board: TBoard, ...args: unknown[]) => moveWrapper(() => f(board, { ctx, events }, ...args))
    ) as GameMoves<TBoard>;

    const doBotTurn = () => {
      const { botStrategy } = activeVariant;
      if (!botStrategy) throw new Error('strategyGameFactory: no botStrategy available for vsComputer mode');
      const time = Math.floor(Math.random() * 500 + 1000);
      botTimeoutRef.current = setTimeout(() => {
        botTimeoutRef.current = null;
        botStrategy({ board, ctx, moves: wrappedGameMoves });
      }, time);
    };

    const visibleVariants = getVariantsForMode(mode);

    return (
    <main className="flex flex-col p-2 min-h-screen">
      <GameHeader />
      <div className="flex justify-center grow">
        <div className="max-w-[100ch] w-full">
          <GameRule ruleDescription={t(rule)} />
          <div className="flex flex-wrap">
            <BoardClient
              key={gameUuid}
              board={board}
              ctx={ctx}
              events={events}
              moves={wrappedGameMoves}
            />
            <GameSidebar
              roleLabels={roleLabels}
              stepDescription={t(getPlayerStepDescription({ board, ctx }))}
              ctx={ctx}
              playerNames={playerNames}
              moves={{
                startGame,
                resetGameState,
                switchMode: (newMode) => resetGameState({ newMode }),
                setPlayerNames,
                setDifficulty,
                undo,
                canUndo
              }}
              variants={visibleVariants}
              selectedVariantIndex={selectedVariantIndex}
              stats={stats}
              onResetStats={resetStats}
            />
          </div>
        </div>
      </div>
      <GameFooter />
      <GameEndDialog
        isOpen={isGameEndDialogOpen}
        setIsOpen={setIsGameEndDialogOpen}
        ctx={ctx}
        selectedVariantIndex={selectedVariantIndex}
        getVariantsForMode={getVariantsForMode}
        onNewGame={(newMode, variantIndex) => resetGameState({ newMode, newVariantIndex: variantIndex })}
      />
    </main>
    );
  };
};

// No-op `events` for production code paths that call a move purely to compute
// `nextBoard` (e.g. bot lookahead) and don't care about side effects. For tests
// that need to assert handlers were called, use `makeEvents` from `test-utils`
// (spies) instead — it can't be used here as it depends on vitest.
export const dummyEvents: Events = {
  endTurn: () => {},
  endGame: () => {},
  setTurnState: () => {}
};
