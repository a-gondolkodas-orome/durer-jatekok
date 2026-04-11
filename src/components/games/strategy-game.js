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
  getPlayerStepDescription,
  endOfTurnMove,
  supportsHHMode
}) => {
  return () => {
    const { t } = useTranslation();
    const [board, setBoard] = useState(generateStartBoard());
    const [phase, setPhase] = useState('roleSelection');
    const [chosenRoleIndex, setChosenRoleIndex] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const [gameUuid, setGameUuid] = useState(crypto.randomUUID());
    const [turnStage, setTurnStage] = useState(null);
    const [mode, setMode] = useState('vsComputer');
    const [playerNames, setPlayerNames] = useState([
      t({ hu: 'Első játékos', en: 'First player' }),
      t({ hu: 'Második játékos', en: 'Second player' })
    ]);

    useEffect(() => {
      if (mode === 'vsComputer' && phase === 'play' && currentPlayer === (1 - chosenRoleIndex)) {
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

    const resetGameState = () => {
      setBoard(generateStartBoard());
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

    const shouldRoleSelectorMoveNext = mode === 'vsHuman'
      ? phase === 'play'
      : phase === 'play' && currentPlayer === chosenRoleIndex;
    const isRoleSelectorWinner = winnerIndex === chosenRoleIndex;

    const playerNameOf = (index) => {
      if (index === null) return null;
      return playerNames[index] || t({
        hu: index === 0 ? 'Első játékos' : 'Második játékos',
        en: index === 0 ? 'First player' : 'Second player'
      });
    };

    const currentPlayerName = playerNameOf(currentPlayer);
    const winnerName = playerNameOf(winnerIndex);

    const endGame = ({ winnerIndex } = { winnerIndex: null }) => {
      setPhase('gameEnd');
      setWinnerIndex(winnerIndex === null ? currentPlayer : winnerIndex);
      setIsGameEndDialogOpen(true);
    };

    const endTurn = () => {
      setCurrentPlayer(currentPlayer => 1 - currentPlayer);
    };

    const chooseRole = (playerIdx) => {
      setPhase('play');
      setCurrentPlayer(0);
      setChosenRoleIndex(playerIdx);
    };

    const startHHGame = () => {
      setPhase('play');
      setCurrentPlayer(0);
    };

    const ctx = {
      shouldRoleSelectorMoveNext,
      chosenRoleIndex,
      currentPlayer,
      phase,
      turnStage
    };

    const events = {
      endTurn,
      endGame,
      setTurnStage
    };

    // only second argument of move's is fixed here (_ special syntax)
    // board (first argument) needs to be handled by ai strategy as
    // it may change between moves but for AI strategy there is no re-render between moves
    // in some cases there are multiple moves following single user event in that
    // case there is also no re-render on client side between moves
    wrappedMoves = mapValues(moves, f => wrap(partial(f, _, { ctx, events }), moveWrapper));

    const doAiTurn = () => {
      const time = Math.floor(Math.random() * 500 + 1000);
      setTimeout(() => {
        aiBotStrategy({ board, ctx, moves: wrappedMoves });
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
              ctx={{ phase, shouldRoleSelectorMoveNext, isRoleSelectorWinner }}
              moves={{ chooseRole, startNewGame, startHHGame, switchMode }}
              mode={mode}
              hasHHMode={!!supportsHHMode}
              playerNames={playerNames}
              setPlayerNames={setPlayerNames}
              currentPlayerName={currentPlayerName}
              winnerName={winnerName}
            />
          </div>
        </div>
      </div>
      <GameFooter credit={metadata.credit}/>
      <GameEndDialog
        isOpen={isGameEndDialogOpen}
        setIsOpen={setIsGameEndDialogOpen}
        startNewGame={startNewGame}
        isRoleSelectorWinner={isRoleSelectorWinner}
        mode={mode}
        winnerName={winnerName}
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
