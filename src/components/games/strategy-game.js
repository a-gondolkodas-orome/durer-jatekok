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

    const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);
    const isPlayerWinner = G.hasPlayerWon === null
      ? G.isGameEnd(board) && (next === 1 - playerIndex)
      : G.hasPlayerWon({ board: board, playerIndex });

    const endGame = () => {
      setPhase('gameEnd');
      setIsGameEndDialogOpen(true);
    };

    const makeAiMove = ({ currentBoard }) => {
      const newBoard = G.aiStep(currentBoard);
      const time = Math.floor(Math.random() * 500 + 500);
      setTimeout(() => {
        setBoard(newBoard);
        setNext(next => 1 - next);
        if (G.isGameEnd(newBoard)) {
          endGame();
        }
      }, time);
    };

    const endPlayerTurn = (newBoard) => {
      setBoard(newBoard);
      setNext(next => 1 - next);

      if (G.isGameEnd(newBoard)) {
        endGame();
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
              ctx={{
                shouldPlayerMoveNext,
                endPlayerTurn,
                isGameEnd: phase === 'gameEnd'
              }}
            />
            <GameSidebar
              stepDescription={G.stepDescription()}
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
