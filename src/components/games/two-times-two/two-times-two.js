import React, { useState } from 'react';
import {
  GameSidebar, GameFooter, GameHeader, GameRule, GameEndDialog
} from '../game-parts';
import { range } from 'lodash';
import { getOptimalTileIndex, isGameEnd, hasPlayerWon, generateNewBoard } from './strategy';

const rule = <>
  Adott egy 2 × 2-es táblázat, és hozzá mindkét játékosnak van 3 db korongja. A
  játék során felváltva tesznek le ezekből egyet-egyet a táblázat tetszőleges mezőjére. A második
  játékos akkor nyer, ha a játék végén minden mezőben különböző számú korong található. (Azaz
  0, 1, 2, 3 a kiosztás a végén valamilyen sorrendben). Minden egyéb esetben pedig a kezdő játékos
  nyer.

  Te döntheteted el, hogy a kezdő vagy a második játékos bőrébe szeretnél e bújni.
  Sok sikert! :)
</>;

export const TwoTimesTwo = () => {
  const [phase, setPhase] = useState('roleSelection');
  const [playerIndex, setPlayerIndex] = useState(null);
  const [next, setNext] = useState(null);
  const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);
  const [board, setBoard] = useState(generateNewBoard());

  const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);
  const isPlayerWinner = hasPlayerWon({ board, playerIndex });

  const makeAiMove = ({ currentBoard }) => {
    const pileId = getOptimalTileIndex(currentBoard);
    const newBoard = addPiece(currentBoard, pileId);
    const time = Math.floor(Math.random() * 500 + 500);
    setTimeout(() => {
      setBoard(newBoard);
      setNext(next => 1 - next);
      if (isGameEnd(newBoard)) {
        setTimeout(() => {
          setPhase('gameEnd');
          setIsGameEndDialogOpen(true);
        }, 200);
        return;
      }
    }, time);
  };

  const endPlayerTurn = (pileId) => {
    const newBoard = addPiece(board, pileId);
    setBoard(newBoard);
    setNext(next => 1 - next);

    if (isGameEnd(newBoard)) {
      setTimeout(() => {
        setPhase('gameEnd');
        setIsGameEndDialogOpen(true);
      }, 200);
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
    setBoard(generateNewBoard());
    setPhase('roleSelection');
    setPlayerIndex(null);
    setNext(null);
    setIsGameEndDialogOpen(false);
  };

  const GameBoard = () => (
    <section className="p-2 shrink-0 grow basis-2/3">
      <div className="grid grid-cols-2 gap-0 border-2">
        {range(board.length).map(id =>
          <button
            key={id}
            disabled={!shouldPlayerMoveNext}
            onClick={() => endPlayerTurn(id)}
            className="aspect-square border-2 p-[4%]"
          >
            {range(board[id]).map((i) =>
              <span
                key={i}
                className={`m-[3%] aspect-square inline-block bg-blue-600 rounded-full ${board[id] <= 4 ? 'w-[40%]' : 'w-[25%]'}`}
              >
              </span>
            )}
        </button>
        )}
      </div>
    </section>
  );

  return (
  <main className="p-2">
    <GameHeader title='2x2-es játék' />
    <div className="flex justify-center">
      <div className="max-w-[100ch] w-full">
        <GameRule ruleDescription={rule} />
        <div className="flex flex-wrap">
          <GameBoard />
          <GameSidebar
            stepDescription={'Kattints arra a mezőre, ahova korongot szeretnél lerakni.'}
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

const addPiece = (board, pileId) => {
  const newBoard = [...board];
  newBoard[pileId] += 1;
  return newBoard;
};
