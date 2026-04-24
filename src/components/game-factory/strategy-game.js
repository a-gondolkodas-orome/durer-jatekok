import React, { useState, useEffect } from 'react';
import {
  GameSidebar, GameFooter, GameHeader, GameRule, GameEndDialog
} from './game-parts';
import { partial, mapValues, wrap, _ } from 'lodash';
import { useTranslation } from '../language/translate';

export const strategyGameFactory = ({
  rule,
  metadata,
  roleLabels,
  BoardClient,
  generateStartBoard,
  moves,
  aiBotStrategy,
  variants,
  getPlayerStepDescription,
  endOfTurnMove
}) => {
  if (variants && (aiBotStrategy || generateStartBoard)) {
    throw new Error('strategyGameFactory: use either variants or aiBotStrategy/generateStartBoard, not both');
  }
  if (!variants && !aiBotStrategy && !generateStartBoard) {
    throw new Error('strategyGameFactory: provide either variants or aiBotStrategy/generateStartBoard');
  }
  if (variants && variants.filter(v => v.isDefault).length !== 1) {
    throw new Error('strategyGameFactory: exactly one variant must have isDefault: true');
  }

  const strategies = variants
    ?? [{ label: null, botStrategy: aiBotStrategy, generateStartBoard }];

  return () => {
    const { t } = useTranslation();
    const defaultStrategyIndex = Math.max(strategies.findIndex(s => s.isDefault), 0);
    const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(defaultStrategyIndex);
    const activeStrategy = strategies[selectedStrategyIndex] ?? strategies[0];
    const defaultGenerateStartBoard = strategies[defaultStrategyIndex].generateStartBoard;
    const activeGenerateStartBoard = activeStrategy.generateStartBoard ?? defaultGenerateStartBoard;

    const [board, setBoard] = useState(activeGenerateStartBoard());
    const [phase, setPhase] = useState('roleSelection');
    const [chosenRoleIndex, setChosenRoleIndex] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const [gameUuid, setGameUuid] = useState(crypto.randomUUID());
    const [turnStage, setTurnStage] = useState(null);
    const [mode, setMode] = useState('vsComputer');
    const [playerNames, setPlayerNames] = useState(['', '']);

    const isHumanVsHumanGame = mode === 'vsHuman';

    useEffect(() => {
      if (!isHumanVsHumanGame && phase === 'play' && currentPlayer === (1 - chosenRoleIndex)) {
        doAiTurn();
      }
    }, [currentPlayer]);

    let wrappedMoves;

    const moveWrapper = (moveFunc, ...args) => {
      const moveResult = moveFunc(...args);
      setBoard(moveResult.nextBoard);
      if (endOfTurnMove && moveResult.autoEndOfTurn) {
        setTimeout(() => {
          wrappedMoves[endOfTurnMove](moveResult.nextBoard);
        }, 750);
      }
      return moveResult;
    };

    const resetGameState = (generateBoard = activeGenerateStartBoard) => {
      setBoard(generateBoard());
      setPhase('roleSelection');
      setChosenRoleIndex(null);
      setCurrentPlayer(null);
      setIsGameEndDialogOpen(false);
      setWinnerIndex(null);
      setGameUuid(crypto.randomUUID());
      setTurnStage(null);
    };

    const startNewGame = () => {
      resetGameState();
    };

    const switchMode = (newMode) => {
      setMode(newMode);
      resetGameState();
    };

    const setDifficulty = (index) => {
      setSelectedStrategyIndex(index);
      const newStrategy = strategies[index] ?? strategies[0];
      resetGameState(newStrategy.generateStartBoard ?? defaultGenerateStartBoard);
    };

    const endGame = ({ winnerIndex } = { winnerIndex: null }) => {
      setPhase('gameEnd');
      setWinnerIndex(winnerIndex === null ? currentPlayer : winnerIndex);
      setIsGameEndDialogOpen(true);
    };

    const endTurn = () => {
      setCurrentPlayer(currentPlayer => 1 - currentPlayer);
    };

    const startGame = (roleIndex = null) => {
      setPhase('play');
      setCurrentPlayer(0);
      setChosenRoleIndex(roleIndex);
    };

    const playerNameOf = (index) => {
      if (index === null) return null;
      return playerNames[index] || t({
        hu: index === 0 ? '1. játékos' : '2. játékos',
        en: index === 0 ? '1st player' : '2nd player'
      });
    };

    const isClientMoveAllowed = isHumanVsHumanGame
      ? phase === 'play'
      : (phase === 'play' && currentPlayer === chosenRoleIndex);

    const ctx = {
      isHumanVsHumanGame,
      playerNames,
      chosenRoleIndex,
      phase,
      turnStage,
      currentPlayer,
      currentPlayerName: playerNameOf(currentPlayer),
      isClientMoveAllowed,
      isRoleSelectorWinner: (winnerIndex === chosenRoleIndex),
      winnerName: playerNameOf(winnerIndex)
    };

    const events = {
      endTurn,
      endGame,
      setTurnStage
    };

    /*
    Only second argument of move's is fixed here (_ special syntax). board
    (first argument) needs to be handled by ai strategy as it may change between
    moves, but for AI strategy there is no re-render between moves. In some
    cases there are multiple moves following single user event, in that case,
    there is also no re-render on client side between moves.
    */
    wrappedMoves = mapValues(
      moves,
      f => wrap(partial(f, _, { ctx, events }), moveWrapper)
    );

    const doAiTurn = () => {
      const botStrategy = activeStrategy.botStrategy
        ?? strategies[defaultStrategyIndex].botStrategy;
      if (!botStrategy) return;
      const time = Math.floor(Math.random() * 500 + 1000);
      setTimeout(() => {
        botStrategy({ board, ctx, moves: wrappedMoves });
      }, time);
    };

    return (
    <main className="flex flex-col p-2 min-h-screen">
      <GameHeader title={t(metadata.title || metadata.name)} />
      <div className="flex justify-center grow">
        <div className="max-w-[100ch] w-full">
          <GameRule ruleDescription={t(rule)} />
          <div className="flex flex-wrap">
            <BoardClient
              key={gameUuid}
              board={board}
              ctx={ctx}
              events={events}
              moves={wrappedMoves}
            />
            <GameSidebar
              roleLabels={roleLabels}
              stepDescription={t(getPlayerStepDescription({ board, ctx }))}
              ctx={ctx}
              moves={{ startGame, startNewGame, switchMode, setPlayerNames, setDifficulty }}
              variants={strategies}
              selectedVariantIndex={selectedStrategyIndex}
            />
          </div>
        </div>
      </div>
      <GameFooter credit={metadata.credit}/>
      <GameEndDialog
        isOpen={isGameEndDialogOpen}
        setIsOpen={setIsGameEndDialogOpen}
        startNewGame={startNewGame}
        ctx={ctx}
      />
    </main>
    );
  };
};

export const dummyEvents = {
  endTurn: () => {},
  endGame: () => {},
  setTurnStage: () => {}
}
