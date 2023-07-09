import React, { useState } from 'react';
import { range, isEqual, random } from 'lodash';
import { strategyGameFactory } from '../../strategy-game';
import { getBoardAfterAiMove } from './strategy';

const generateNewBoard = () => {
  const x = random(4, 20);
  const y = random(Math.max(4, 17 - x), Math.min(20, 33 - x));
  return [x, y, 37 - x - y];
};

const isGameEnd = (board) => isEqual(board, [1, 1, 1]);

const aiStep = ({ board }) => {
  const newBoard = getBoardAfterAiMove(board);
  return { newBoard, isGameEnd: isGameEnd(newBoard), winnerIndex: null };
};

const getBoardAfterMove = (board, { removedPileId, splitPileId, pieceId }) => {
  const newBoard = [...board];
  if (removedPileId < splitPileId) {
    newBoard[removedPileId] = pieceId + 1;
    newBoard[splitPileId] = newBoard[splitPileId] - pieceId - 1;
  } else {
    newBoard[removedPileId] = newBoard[splitPileId] - pieceId - 1;
    newBoard[splitPileId] = pieceId + 1;
  }
  return newBoard;
};

const GameBoard = ({ board, ctx }) => {
  const [removedPileId, setRemovedPileId] = useState(null);
  const [hoveredPiece, setHoveredPiece] = useState(null);

  const resetTurnState = () => {
    setRemovedPileId(null);
    setHoveredPiece(null);
  };

  const isDisabled = ({ pileId, pieceId }) => {
    if (!ctx.shouldPlayerMoveNext) return true;
    if (removedPileId === null) return false;
    return pileId !== removedPileId && pieceId === board[pileId] - 1;
  };

  const clickPiece = ({ pileId, pieceId }) => {
    if (!ctx.shouldPlayerMoveNext) return;

    if (removedPileId === pileId) {
      setRemovedPileId(null);
      return;
    }
    if (removedPileId === null) {
      setRemovedPileId(pileId);
      return;
    }
    if (pieceId === board[pileId] - 1) return;

    const newBoard = getBoardAfterMove(board, {
      removedPileId: removedPileId,
      splitPileId: pileId,
      pieceId
    });
    ctx.endPlayerTurn({ newBoard, isGameEnd: isGameEnd(newBoard), winnerIndex: null });
    resetTurnState();
  };

  const toBeLeft = ({ pileId, pieceId }) => {
    if (hoveredPiece === null) return false;
    if (removedPileId === null) return false;
    if (removedPileId === pileId) return false;
    if (pileId !== hoveredPiece.pileId) return false;
    if (hoveredPiece.pieceId === board[pileId] - 1) return false;
    if (pieceId > hoveredPiece.pieceId) return false;
    return true;
  };

  const currentChoiceDescription = (pileId) => {
    if (ctx.isGameEnd) return '';

    const pieceCountInPile = board[pileId];

    if (!ctx.shouldPlayerMoveNext) return pieceCountInPile;
    if (pileId === removedPileId) {
      if (hoveredPiece && hoveredPiece.pileId === pileId) {
        return 'Mégse?';
      }
      return `${pieceCountInPile} → 🗑️`;
    }
    if (!hoveredPiece) return pieceCountInPile;
    if (removedPileId === null && hoveredPiece.pileId === pileId) {
      return `${pieceCountInPile} → 🗑️`;
    }
    if (hoveredPiece.pileId !== pileId) return pieceCountInPile;

    return `${pieceCountInPile} → ${hoveredPiece.pieceId + 1}, ${pieceCountInPile - hoveredPiece.pieceId - 1}`;
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    {[0, 1, 2].map(pileId => (
      <div
        key={pileId}
        className={`
          js-pile w-[50%] pl-1 inline-block text-center py-2
          ${pileId < 2 ? 'border-t-2': ''}
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
                js-pebble inline-block bg-blue-600 w-[20%] aspect-square rounded-full mx-0.5
                ${pileId === removedPileId ? 'bg-red-600' : ''}
                ${pileId === removedPileId ? 'opacity-50' : ''}
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

const stepDescription = () => 'Először kattints az eltávolítandó kupacra, majd arra a korongra, ahol ketté akarod vágni a kupacot.';

const rule = <>
  A pályán kezdetben 37 korong van, három kupacban.
  A soron következő játékos először az egyik kupacot teljes egészében kiveszi a játékból;
  majd egy másik kupacot kettéoszt két kisebb kupacra (mindkettőbe legalább 1 korongnak kerülnie kell).
  Egy lépést követően tehát újra három kupac marad. Az a játékos veszít, aki nem tud szabályosan
  lépni (azaz egyik kupacot se tudja szétosztani).

  A kezdőállás ismeretében te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: 'Kupac kettéosztó 3 kupaccal',
  GameBoard,
  G: {
    stepDescription,
    generateNewBoard,
    aiStep
  }
});

export const PileSplitter3 = () => {
  const [board, setBoard] = useState(generateNewBoard());

  return <Game board={board} setBoard={setBoard} />;
};
