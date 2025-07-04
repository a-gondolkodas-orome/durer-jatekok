import React, { useState } from 'react';
import { range, random, cloneDeep } from 'lodash';
import { strategyGameFactory } from '../../strategy-game';
import { aiBotStrategy } from './bot-strategy';

const generateStartBoard = () => ([random(0, 9), random(0, 9), random(0, 9), random(4, 9)]);

const BoardClient = ({ board, ctx, moves }) => {
  const [hoveredPiece, setHoveredPiece] = useState(null);

  const nonExistent = ({ pileId, pieceId }) => {
    return pieceId >= board[pileId];
  };

  const isDisabled = ({ pileId, pieceId }) => {
    if (!ctx.shouldRoleSelectorMoveNext) return true;
    return pieceId>pileId-1 || (pieceId>board[pileId]-1);
  };

  const hoverPiece = (piece) => {
    if (piece === null) {
      setHoveredPiece(null);
      return;
    }
    if (isDisabled(piece)) return;
    setHoveredPiece(piece);
  }

  const clickPiece = ({ pileId, pieceId }) => {
    if (isDisabled({ pileId, pieceId })) return;

    moves.spreadPieces(board, { pileId, pieceCount: pieceId + 1 });
    setHoveredPiece(null);
  };

  const toBeRemoved = ({ pileId, pieceId }) => {
    if (hoveredPiece === null) return false;
    if (pileId !== hoveredPiece.pileId) return false;
    if (pieceId > hoveredPiece.pieceId) return false;
    return true;
  };

  const toAppear = ({ pileId, pieceId }) => {
    if (hoveredPiece === null) return false;
    return (
      (pileId<hoveredPiece.pileId) &&
      (pileId>hoveredPiece.pileId-hoveredPiece.pieceId-2) &&
      (pieceId===board[pileId])
    );
  };

  const currentChoiceDescription = (pileId) => {
    const pieceCountInPile = board[pileId];

    if (!ctx.shouldRoleSelectorMoveNext || !hoveredPiece) {
      return `${pileId+1}. kupac: ${pieceCountInPile} `;
    }

    if (pileId===hoveredPiece.pileId) {
      return `${pileId+1}. kupac: ${pieceCountInPile} → ${pieceCountInPile - hoveredPiece.pieceId - 1}`;
    }
    if ((pileId<hoveredPiece.pileId) && (pileId>hoveredPiece.pileId-hoveredPiece.pieceId-2)) {
      return `${pileId+1}. kupac: ${pieceCountInPile} → ${pieceCountInPile + 1}`;
    }
    return `${pileId+1}. kupac: ${pieceCountInPile} `;
  };

  const leftBorder = (pileId) => {
    return (
      (pileId === 1 && board[1] > board[0]) ||
      (pileId === 3 && board[3] > board[2])
    );
  };

  const rightBorder = (pileId) => {
    return (
      (pileId === 0 && board[1] <= board[0]) ||
      (pileId === 2 && board[3] <= board[2])
    );
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    {[0, 1, 2, 3].map(pileId => (
      <div
        key={pileId}
        className={`
          w-[50%] pl-1 inline-block text-center
          ${pileId < 2 ? 'border-t-2': ''}
          ${rightBorder(pileId) ? 'border-r-2' : ''}
          ${leftBorder(pileId) ? 'border-l-2' : ''}
        `}
        style={{ transform: 'scaleY(-1)' }}
      >
        <p className="text-xl" style={{ transform: 'scaleY(-1)' }}>
          {currentChoiceDescription(pileId)}
        </p>
          {range(board[pileId]+5).map(pieceId => (
            <button
              key={pieceId}
              disabled={isDisabled({ pileId, pieceId })}
              className={`
                w-[18%] aspect-square rounded-full mx-0.5 mt-0.5
                ${toAppear({ pileId, pieceId }) ? 'bg-blue-600 opacity-50' : ''}
                ${isDisabled({ pileId, pieceId }) && 'cursor-not-allowed bg-blue-600'}
                ${toBeRemoved({ pileId, pieceId }) ? 'bg-red-600 opacity-50' : ''}
                ${(nonExistent({ pileId, pieceId }) && !toAppear({ pileId, pieceId })) ? 'invisible inline-block' : 'inline-block'}
                ${!nonExistent({ pileId, pieceId }) && !isDisabled({ pileId, pieceId }) && !toBeRemoved({ pileId, pieceId }) ? 'bg-blue-900' : ''}
              `}
              onClick={() => clickPiece({ pileId, pieceId })}
              onFocus={() => hoverPiece({ pileId, pieceId })}
              onBlur={() => hoverPiece(null)}
              onMouseOver={() => hoverPiece({ pileId, pieceId })}
              onMouseOut={() => hoverPiece(null)}
            ></button>
          ))}
      </div>
    ))}
  </section>
  );
};

const moves = {
  spreadPieces: (board, { events }, { pileId, pieceCount }) => {
    if (pieceCount > pileId) console.error('invalid_move');
    const nextBoard = cloneDeep(board);
    nextBoard[pileId] = board[pileId] - pieceCount;
    for (let i = pileId - pieceCount; i < pileId; i++) {
      nextBoard[i] = board[i] + 1;
    }
    const isGameEnd = nextBoard[1]===0 && nextBoard[2]===0 && nextBoard[3]===0;
    events.endTurn();
    if (isGameEnd) {
      events.endGame();
    }
    return { nextBoard };
  }
}

const rule = <>
  Adott négy, korongokból álló kupac, melyek 1-től 4-ig vannak számozva. Egy lépésben a
  soron következő játékos választ m és n egész számokat, melyekre 1 ≤ m &lt; n ≤ 4, majd az n sorszámú
  kupacból elvesz m korongot, és az n − 1, n − 2, . . . , n − m sorszámú kupacokba egyesével szétosztja az
  elvett korongokat. Az veszít, aki nem tud lépni.
</>;

export const FourPilesSpreadAhead = strategyGameFactory({
  rule,
  title: '4 kupacban előrepakolás',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy korongra, hogy jelezd, hány korongot szeretnél elvenni a kupacból.',
  generateStartBoard,
  moves,
  aiBotStrategy
});
