import React, { useState } from 'react';
import {
  GameSidebar, GameFooter, GameHeader, GameRule, GameEndDialog
} from './game-parts';

export const strategyGameFactory = ({ rule, title, GameBoard, G }) => {
  return ({ board, setBoard }) => {
    const [phase, setPhase] = useState('roleSelection');
    const [playerIndex, setPlayerIndex] = useState(null);
    const [next, setNext] = useState(null);
    const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState(null);

    const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);
    const isPlayerWinner = winnerIndex === playerIndex;

    const endGame = (winnerIndex) => {
      setPhase('gameEnd');
      setWinnerIndex(winnerIndex);
      setIsGameEndDialogOpen(true);
    };

    const makeAiMove = ({ currentBoard }) => {
      const { newBoard, isGameEnd, winnerIndex } = G.aiStep({ board: currentBoard, playerIndex });
      const time = Math.floor(Math.random() * 500 + 500);
      setTimeout(() => {
        setBoard(newBoard);
        setNext(next => 1 - next);
        if (isGameEnd) {
          // default: last player to move is the winner
          endGame(winnerIndex === null ? (1 - playerIndex) : winnerIndex);
        }
      }, time);
    };

    const endPlayerTurn = ({ newBoard, isGameEnd, winnerIndex }) => {
      setBoard(newBoard);
      setNext(next => 1 - next);

      if (isGameEnd) {
        // default: last player to move is the winner
        endGame(winnerIndex === null ? playerIndex : winnerIndex);
        return;
      }

      makeAiMove({ currentBoard: newBoard });
    };

    const chooseRole = (playerIdx) => {
      setPhase('play');
      setNext(0);
      setPlayerIndex(playerIdx);
      if (playerIdx === 1) {
        makeAiMove({ currentBoard: board });
      }
    };

    const startNewGame = () => {
      setBoard(G.generateNewBoard());
      setPhase('roleSelection');
      setPlayerIndex(null);
      setNext(null);
      setIsGameEndDialogOpen(false);
    };

    return (
    <main className="p-2">
      <GameHeader title={title} />
      <div className="flex justify-center">
        <div className="max-w-[100ch] w-full">
          <GameRule ruleDescription={rule} />
          <div className="flex flex-wrap">
            <GameBoard
              board={board}
              setBoard={setBoard}
              ctx={{
                shouldPlayerMoveNext,
                endPlayerTurn,
                playerIndex,
                isGameEnd: phase === 'gameEnd',
                isEnemyMoveInProgress: phase === 'play' && next === (1-playerIndex)
              }}
            />
            <GameSidebar
              stepDescription={G.stepDescription({ playerIndex })}
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
