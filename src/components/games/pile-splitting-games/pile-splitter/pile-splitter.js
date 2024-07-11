import React, { useState } from 'react';
import { range, isEqual, random } from 'lodash';
import { strategyGameFactory } from '../../strategy-game';
import { getBoardAfterAiTurn } from './strategy';

const generateNewBoard = () => ([random(3, 10), random(3, 10)]);

const isGameEnd = (board) => isEqual(board, [1, 1]);

const getGameStateAfterAiTurn = ({ board }) => {
  const { intermediateBoard, newBoard } = getBoardAfterAiTurn(board);
  return { intermediateBoard, newBoard, isGameEnd: isGameEnd(newBoard), winnerIndex: null };
};

const GameBoard = ({ board, setBoard, ctx }) => {
  const [hoveredPiece, setHoveredPiece] = useState(null);

  const isDisabled = ({ pileId, pieceId }) => {
    if (!ctx.shouldPlayerMoveNext) return true;
    return pieceId === board[pileId] - 1;
  };

  const clickPiece = ({ pileId, pieceId }) => {
    if (isDisabled({ pileId, pieceId })) return;

    setBoard(pileId === 0 ? [board[0], 0] : [0, board[1]]);

    setTimeout(() => {
      const newBoard = [pieceId + 1, board[pileId] - pieceId - 1];
      ctx.endPlayerTurn({ newBoard, isGameEnd: isGameEnd(newBoard), winnerIndex: null });

      setHoveredPiece(null);
    }, 750);
  };

  const toBeLeft = ({ pileId, pieceId }) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (hoveredPiece === null) return false;
    if (pileId !== hoveredPiece.pileId) return false;
    if (hoveredPiece.pieceId === board[pileId] - 1) return false;
    if (pieceId > hoveredPiece.pieceId) return false;
    return true;
  };

  const toBeRemoved = ({ pileId }) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (hoveredPiece === null) return false;
    return hoveredPiece.pileId !== pileId;
  };

  const currentChoiceDescription = (pileId) => {
    const pieceCountInPile = board[pileId];

    if (!ctx.shouldPlayerMoveNext) return pieceCountInPile;
    if (!hoveredPiece) return pieceCountInPile;
    if (hoveredPiece.pileId !== pileId) return `${pieceCountInPile} → 🗑️`;

    return `${pieceCountInPile} → ${hoveredPiece.pieceId + 1}, ${pieceCountInPile - hoveredPiece.pieceId - 1}`;
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    {[0, 1].map(pileId => (
      <div
        key={pileId}
        className={`
          w-[50%] pl-1 inline-block text-center
          ${pileId === 0 && board[0] >= board[1] ? 'border-r-2' : ''}
          ${pileId === 1 && board[0] < board[1] ? 'border-l-2' : ''}
        `}
        style={{ transform: 'scaleY(-1)' }}
      >
        <p className="text-xl" style={{ transform: 'scaleY(-1)' }}>
          {currentChoiceDescription(pileId)}
        </p>
          {range(board[pileId]).map(pieceId => (
            <button
              key={pieceId}
              disabled={isDisabled({ pileId, pieceId })}
              className={`
                inline-block bg-blue-600 w-[20%] aspect-square rounded-full mx-0.5
                ${toBeRemoved({ pileId }) ? 'opacity-50 bg-red-600' : ''}
                ${toBeLeft({ pileId, pieceId }) ? 'bg-blue-900' : ''}
              `}
              onClick={() => clickPiece({ pileId, pieceId })}
              onFocus={() => setHoveredPiece({ pileId, pieceId })}
              onBlur={() => setHoveredPiece(null)}
              onMouseOver={() => setHoveredPiece({ pileId, pieceId })}
              onMouseOut={() => setHoveredPiece(null)}
            ></button>
          ))}
      </div>
    ))}
  </section>
  );
};

const getPlayerStepDescription = () =>
  'Kattints egy korongra, hogy azzal kettéosztd azt a kupacot.';

const rule = <>
  A pályán mindig két kupac korong található.
  A soron következő játékos választ egy kupacot, és azt szétosztja két kisebb kupacra (mindkettőbe
  legalább 1 korongnak kerülnie kell), a másik kupacot pedig kidobjuk.
  Az a játékos veszít, aki nem tud szabályosan lépni (azaz egyik kupacot se tudja szétosztani).

  A kezdőállás ismeretében te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: 'Kupac kettéosztó',
  GameBoard,
  G: {
    getPlayerStepDescription,
    generateNewBoard,
    getGameStateAfterAiTurn
  }
});

export const PileSplitter = () => {
  const [board, setBoard] = useState(generateNewBoard());

  return <Game board={board} setBoard={setBoard} />;
};
