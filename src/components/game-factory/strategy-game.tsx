import React, { useState, useEffect } from 'react';
import { GameHeader, GameFooter, GameRule } from './game-parts/game-chrome';
import { GameSidebar } from './game-parts/game-sidebar';
import { GameEndDialog } from './game-parts/game-end-dialog';
import { DEFAULT_PLAYER_NAMES } from './game-parts/game-controls';
import { mapValues } from 'lodash';
import { useTranslation, TranslatableNode, Translatable, I18nString } from '../language/translate';
import { useLocation } from 'react-router';
import { useGameStats } from './use-game-stats';
import type {
  Phase, PlayerIndex, Ctx, Events, MoveResult, MoveFunction, GameMoves,
  DisplayCtx, Variant as DisplayVariant, VariantInput
} from './types';
import { resolveVariants } from './resolve-variants';

interface Presentation<TBoard> {
  rule: TranslatableNode
  roleLabels?: [I18nString, I18nString]
  getPlayerStepDescription: (args: { board: TBoard; ctx: Ctx }) => Translatable
}

interface Gameplay<TBoard> {
  moves: Record<string, MoveFunction<TBoard>>
  endOfTurnMove?: string
}

interface StrategyGameFactoryParams<TBoard> {
  presentation: Presentation<TBoard>
  BoardClient: React.ComponentType<{ board: TBoard; ctx: Ctx; events: Events; moves: GameMoves<TBoard> }>
  gameplay: Gameplay<TBoard>
  variants: VariantInput<TBoard>[]
}


export const strategyGameFactory = <TBoard,>({
  presentation,
  BoardClient,
  gameplay,
  variants
}: StrategyGameFactoryParams<TBoard>) => {
  const { rule, roleLabels, getPlayerStepDescription } = presentation;
  const { moves, endOfTurnMove } = gameplay;
  const { defaultVariantIndex, defaultVariant, resolvedVariants } = resolveVariants(variants);

  return () => {
    const { t } = useTranslation();
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(defaultVariantIndex);
    const activeVariant = resolvedVariants[selectedVariantIndex] ?? defaultVariant;
    const defaultGenerateStartBoard = defaultVariant.generateStartBoard!;
    const activeGenerateStartBoard = activeVariant.generateStartBoard ?? defaultGenerateStartBoard;

    const [board, setBoard] = useState<TBoard>(activeGenerateStartBoard());
    const [phase, setPhase] = useState<Phase>('roleSelection');
    const [chosenRoleIndex, setChosenRoleIndex] = useState<PlayerIndex | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerIndex | null>(null);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState<PlayerIndex | null>(null);
    const [gameUuid, setGameUuid] = useState(crypto.randomUUID());
    const [turnState, setTurnState] = useState<unknown>(null);
    const [mode, setMode] = useState('vsComputer');
    const [playerNames, setPlayerNames] = useState(['', '']);
    const [gameEndDisplayCtx, setGameEndDisplayCtx] = useState<DisplayCtx | null>(null);

    const isHumanVsHumanGame = mode === 'vsHuman';

    const gameId = useLocation().pathname.split('/').pop()!;
    const { stats, recordResult, resetStats } = useGameStats(gameId, selectedVariantIndex);

    useEffect(() => {
      if (!isHumanVsHumanGame && phase === 'play' && currentPlayer === (1 - chosenRoleIndex!)) {
        doBotTurn();
      }
    }, [currentPlayer]);

    let wrappedGameMoves: GameMoves<TBoard> = {} as GameMoves<TBoard>;

    const moveWrapper = (doMove: () => MoveResult<TBoard>): MoveResult<TBoard> => {
      const moveResult = doMove();
      setBoard(moveResult.nextBoard);
      if (endOfTurnMove && moveResult.autoEndOfTurn) {
        setTimeout(() => {
          wrappedGameMoves[endOfTurnMove]!(moveResult.nextBoard);
        }, 750);
      }
      return moveResult;
    };

    const resetGameState = ({ newMode = mode, generateBoard = activeGenerateStartBoard } = {}) => {
      setMode(newMode);
      let boardGenerator = generateBoard;
      if (newMode === 'vsHuman' && !activeVariant.generateStartBoard) {
        setSelectedVariantIndex(defaultVariantIndex);
        boardGenerator = defaultGenerateStartBoard;
      }
      setBoard(boardGenerator());
      setPhase('roleSelection');
      setChosenRoleIndex(null);
      setCurrentPlayer(null);
      setIsGameEndDialogOpen(false);
      setWinnerIndex(null);
      setGameUuid(crypto.randomUUID());
      setTurnState(null);
      setGameEndDisplayCtx(null);
    };

    const setDifficulty = (index: number) => {
      setSelectedVariantIndex(index);
      const newVariant = resolvedVariants[index] ?? defaultVariant;
      resetGameState({ generateBoard: newVariant.generateStartBoard ?? defaultGenerateStartBoard });
    };

    const changeMode = (newMode: string) => {
      setMode(newMode);
      if (newMode === 'vsHuman' && !activeVariant.generateStartBoard) {
        setSelectedVariantIndex(defaultVariantIndex);
      }
    };

    const playerNameOf = (index: PlayerIndex | null): string | null => {
      if (index === null) return null;
      return playerNames[index] || t(DEFAULT_PLAYER_NAMES[index]);
    };

    const endGame = ({ winnerIndex: wIdx = null }: { winnerIndex?: PlayerIndex | null } = {}) => {
      const resolvedWinner = wIdx === null ? currentPlayer : wIdx;
      setPhase('gameEnd');
      setWinnerIndex(resolvedWinner);
      setIsGameEndDialogOpen(true);
      if (!isHumanVsHumanGame) {
        recordResult(resolvedWinner === chosenRoleIndex ? 'win' : 'loss');
      }
      setGameEndDisplayCtx({
        phase: 'gameEnd',
        isHumanVsHumanGame,
        isRoleSelectorWinner: resolvedWinner === chosenRoleIndex,
        winnerName: playerNameOf(resolvedWinner),
        currentPlayerName: playerNameOf(currentPlayer)
      });
    };

    const endTurn = () => {
      setCurrentPlayer(p => (1 - p!) as PlayerIndex);
    };

    const startGame = (roleIndex: number | null = null) => {
      setPhase('play');
      setCurrentPlayer(0);
      setChosenRoleIndex(roleIndex as PlayerIndex | null);
    };

    const isClientMoveAllowed = phase === 'play'
      && (isHumanVsHumanGame || currentPlayer === chosenRoleIndex);

    const ctx: Ctx = {
      isHumanVsHumanGame,
      playerNames,
      chosenRoleIndex,
      phase,
      turnState,
      currentPlayer,
      currentPlayerName: playerNameOf(currentPlayer),
      isClientMoveAllowed,
      isRoleSelectorWinner: (winnerIndex === chosenRoleIndex),
      winnerIndex,
      winnerName: playerNameOf(winnerIndex)
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
      setTimeout(() => {
        botStrategy({ board, ctx, moves: wrappedGameMoves });
      }, time);
    };

    const visibleVariants: DisplayVariant[] = resolvedVariants
      .map((v, i) => ({ ...v, originalIndex: i, disabled: !isHumanVsHumanGame && !v.botStrategy }))
      .filter(v => !isHumanVsHumanGame || !!v.generateStartBoard);

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
              gameEndDisplayCtx={gameEndDisplayCtx}
              moves={{
                startGame,
                resetGameState,
                switchMode: (newMode) => resetGameState({ newMode }),
                setPlayerNames,
                setDifficulty
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
        resetGameState={resetGameState}
        ctx={gameEndDisplayCtx ?? ctx}
        isHumanVsHumanGame={isHumanVsHumanGame}
        onSwitchMode={changeMode}
        variants={visibleVariants}
        selectedVariantIndex={selectedVariantIndex}
        onSelectVariant={setSelectedVariantIndex}
      />
    </main>
    );
  };
};

export const dummyEvents: Events = {
  endTurn: () => {},
  endGame: () => {},
  setTurnState: () => {}
};
