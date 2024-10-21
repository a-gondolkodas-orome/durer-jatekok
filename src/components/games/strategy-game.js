import React, { useState, useRef, useEffect } from 'react';
import {
  GameSidebar, GameFooter, GameHeader, GameRule, GameEndDialog
} from './game-parts';
import { v4 as uuidv4 } from 'uuid';

export const strategyGameFactory = ({
  rule,
  title,
  roleLabels,
  initialTurnStages,
  BoardClient,
  generateStartBoard,
  moves,
  getGameStateAfterAiTurn,
  getPlayerStepDescription
}) => {
  return () => {
    const [board, setBoard] = useState(generateStartBoard())
    const [phase, setPhase] = useState('roleSelection');
    const [playerIndex, setPlayerIndex] = useState(null);
    const [next, setNext] = useState(null);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const [gameUuid, setGameUuid] = useState(uuidv4());
    const [turnStage, setTurnStage] = useState(null);

    const gameOverRef = useRef(winnerIndex !== null)
    // player -> ai -> player is triggered from one render that is why next is not enough
    const currentPlayerIdxRef = useRef(next);

    useEffect(() => {
      if (phase === 'play' && next === (1 - playerIndex)) {
        doAiTurn({ currentBoard: board });
      }
    }, [next])

    const startNewGame = () => {
      setBoard(generateStartBoard());
      setPhase('roleSelection');
      setPlayerIndex(null);
      setNext(null);
      currentPlayerIdxRef.current = null;
      setIsGameEndDialogOpen(false);
      setWinnerIndex(null);
      gameOverRef.current = false;
      setGameUuid(uuidv4());
      setTurnStage(null);
    };

    const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);
    const isPlayerWinner = winnerIndex === playerIndex;

    const endGame = (winnerIndex) => {
      setPhase('gameEnd');
      // default: last player to move is the winner
      setWinnerIndex(winnerIndex === null ? currentPlayerIdxRef.current : winnerIndex);
      gameOverRef.current = true;
      setIsGameEndDialogOpen(true);
    };

    const advanceCurrentPlayer = () => {
      setNext(next => 1 - next);
      currentPlayerIdxRef.current = 1 - currentPlayerIdxRef.current;
    };

    const endPlayerTurn = ({ nextBoard, isGameEnd, winnerIndex }) => {
      setBoard(nextBoard);

      if (isGameEnd) {
        endGame(winnerIndex);
      }

      advanceCurrentPlayer();
    };

    const chooseRole = (playerIdx) => {
      setPhase('play');
      setNext(0);
      currentPlayerIdxRef.current = 0;
      setPlayerIndex(playerIdx);
      if (initialTurnStages !== undefined) {
        setTurnStage(initialTurnStages[playerIdx]);
      }
    };

    const ctx = {
      shouldPlayerMoveNext,
      playerIndex,
      phase,
      turnStage
    };

    const events = {
      endPlayerTurn,
      setTurnStage
    };

    const doAiTurn = ({ currentBoard }) => {
      if (gameOverRef.current) {
        return;
      }

      const time = Math.floor(Math.random() * 500 + 1000);
      setTimeout(() => {
        const { intermediateBoard, nextBoard, isGameEnd, winnerIndex } = getGameStateAfterAiTurn({
          board: currentBoard,
          ctx,
          events,
          moves: {
            // FIXME: general move, should not be needed if specialized functions
            // are provided for each move
            setBoard,
            ...moves
          }
        });
        const stageTimeout = intermediateBoard !== undefined ? 750 : 0;
        if (intermediateBoard !== undefined) {
          setBoard(intermediateBoard);
        }
        setTimeout(() => {
          setBoard(nextBoard);
          if (isGameEnd) {
            endGame(winnerIndex);
          }
          advanceCurrentPlayer();
        }, stageTimeout);
      }, time);
    };

    return (
    <main className="p-2">
      <GameHeader title={title} />
      <div className="flex justify-center">
        <div className="max-w-[100ch] w-full">
          <GameRule ruleDescription={rule} />
          <div className="flex flex-wrap">
            <BoardClient
              key={gameUuid}
              board={board}
              ctx={ctx}
              events={events}
              moves={{ setBoard, ...moves }}
            />
            <GameSidebar
              roleLabels={roleLabels}
              stepDescription={getPlayerStepDescription({ board, ctx })}
              ctx={{ phase, shouldPlayerMoveNext, isPlayerWinner }}
              moves={{ chooseRole, startNewGame }}
            />
          </div>
        </div>
      </div>
      <GameFooter />
      <GameEndDialog
        isOpen={isGameEndDialogOpen}
        setIsOpen={setIsGameEndDialogOpen}
        startNewGame={startNewGame}
        isPlayerWinner={isPlayerWinner}
      />
    </main>
    );
  };
};
