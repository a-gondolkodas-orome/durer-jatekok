import React, { useState } from 'react';
import { range, isEqual, random, cloneDeep } from 'lodash';
import { strategyGameFactory } from '../../strategy-game';
import { aiBotStrategy } from './bot-strategy';

const generateStartBoard = () => {
  const x = random(2, 8) * 2 + 1;
  const y = random(3, Math.min(20, 33 - x));
  return [x, y, 37 - x - y];
};

const BoardClient = ({ board, ctx, moves }) => {
  const [removedPileId, setRemovedPileId] = useState(null);
  const [hoveredPiece, setHoveredPiece] = useState(null);

  const isDisabled = ({ pileId, pieceId }) => {
    if (!ctx.shouldRoleSelectorMoveNext) return true;
    if (removedPileId === null) return false;
    return pileId !== removedPileId && pieceId === board[pileId] - 1;
  };

  const clickPiece = ({ pileId, pieceId }) => {
    if (!ctx.shouldRoleSelectorMoveNext) return;

    if (removedPileId === pileId) {
      setRemovedPileId(null);
      return;
    }
    if (removedPileId === null) {
      setRemovedPileId(pileId);
      return;
    }
    if (pieceId === board[pileId] - 1) return;

    const { nextBoard } = moves.removePile(board, removedPileId)

    setTimeout(() => {
      moves.splitPile(nextBoard, { pileId, pieceId })

      setRemovedPileId(null);
      setHoveredPiece(null);
    }, 750);
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
    const pieceCountInPile = board[pileId];

    // pieceCountInPile can be 0 in intermediateBoard during AI turn
    if (!ctx.shouldRoleSelectorMoveNext) return pieceCountInPile || '🗑️';
    if (pileId === removedPileId) {
      // pieceCountInPile can be 0 in intermediateBoard
      return pieceCountInPile ? `${pieceCountInPile} → 🗑️` : '🗑️';
    }
    if (!hoveredPiece) return pieceCountInPile || '🗑️';
    if (removedPileId === null && hoveredPiece.pileId === pileId) {
      return `${pieceCountInPile} → 🗑️`;
    }
    if (hoveredPiece.pileId !== pileId) return pieceCountInPile || '🗑️';

    return `${pieceCountInPile} → ${hoveredPiece.pieceId + 1}, ${pieceCountInPile - hoveredPiece.pieceId - 1}`;
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    {[0, 1, 2].map(pileId => (
      <div
        key={pileId}
        className={`
          w-[50%] pl-1 inline-block text-center py-2
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
                inline-block bg-blue-600 w-[20%] aspect-square rounded-full mx-0.5
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

const moves = {
  removePile: (board, _, pileId) => {
    const nextBoard = cloneDeep(board);
    nextBoard[pileId] = 0;
    return { nextBoard };
  },
  splitPile: (board, { events }, { pileId, pieceId }) => {
    const nextBoard = cloneDeep(board);
    const removedPileId = [0, 1, 2].find(i => nextBoard[i] === 0)
    if (removedPileId === undefined) console.error('invalid_move');
    if (removedPileId < pileId) {
      nextBoard[removedPileId] = pieceId + 1;
      nextBoard[pileId] = nextBoard[pileId] - pieceId - 1;
    } else {
      nextBoard[removedPileId] = nextBoard[pileId] - pieceId - 1;
      nextBoard[pileId] = pieceId + 1;
    }
    events.endTurn();
    if (isEqual(nextBoard, [1, 1, 1])) {
      events.endGame();
    }
    return { nextBoard };
  }
};

const getPlayerStepDescription = () =>
  'Először kattints az eltávolítandó kupacra, majd arra a korongra, ahol ketté akarod vágni a kupacot.';

const rule = <>
  A pályán kezdetben 37 korong van, három kupacban.
  A soron következő játékos először az egyik kupacot teljes egészében kiveszi a játékból;
  majd egy másik kupacot kettéoszt két kisebb kupacra (mindkettőbe legalább 1 korongnak kerülnie kell).
  Egy lépést követően tehát újra három kupac marad. Az veszít, aki nem tud lépni.
</>;

export const PileSplitter3 = strategyGameFactory({
  rule,
  title: 'Kupac kettéosztó 3 kupaccal',
  BoardClient,
  getPlayerStepDescription,
  generateStartBoard,
  moves,
  aiBotStrategy
});
