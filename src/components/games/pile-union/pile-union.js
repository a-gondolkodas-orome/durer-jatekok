import React, { useState, useEffect } from 'react';
import { sample, range } from 'lodash';
import { strategyGameFactory } from '../../game-factory/strategy-game';
import { gameList } from '../gameList';
import { useTranslation } from '../../language/translate';

const canMove = (board) => board.length > 0;

// TODO: implement optimal AI strategy — this is a random placeholder
const randomBotStrategy = ({ board, moves }) => {
  const validMoves = [];
  board.forEach((_, i) => validMoves.push({ type: 'remove', i }));
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      validMoves.push({ type: 'merge', i, j });
    }
  }
  const chosen = sample(validMoves);
  if (chosen.type === 'remove') {
    moves.removeOne(board, chosen.i);
  } else {
    moves.mergePiles(board, [chosen.i, chosen.j]);
  }
};

const BoardClient = ({ board, ctx, moves }) => {
  const { t } = useTranslation();
  const [uiMode, setUiMode] = useState('remove');
  const [mergeFirst, setMergeFirst] = useState(null);

  useEffect(() => {
    if (board.length < 2) {
      setUiMode('remove');
      setMergeFirst(null);
    }
  }, [board]);

  const canInteract = ctx.isClientMoveAllowed;

  const handlePileClick = (pileIndex) => {
    if (!canInteract) return;
    if (uiMode === 'remove') {
      moves.removeOne(board, pileIndex);
    } else {
      if (mergeFirst === null) {
        setMergeFirst(pileIndex);
      } else if (mergeFirst === pileIndex) {
        setMergeFirst(null);
      } else {
        moves.mergePiles(board, [mergeFirst, pileIndex]);
        setMergeFirst(null);
        setUiMode('remove');
      }
    }
  };

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      {canInteract && board.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
              ${uiMode === 'remove'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            onClick={() => { setUiMode('remove'); setMergeFirst(null); }}
          >
            {t({ hu: 'Elveszünk 1-et', en: 'Remove 1' })}
          </button>
          {board.length >= 2 && (
            <button
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${uiMode === 'merge'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
              onClick={() => { setUiMode('merge'); setMergeFirst(null); }}
            >
              {t({ hu: 'Egyesítünk', en: 'Merge' })}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-end">
        {board.map((size, pileIndex) => {
          const isSelected = uiMode === 'merge' && mergeFirst === pileIndex;
          return (
            <button
              key={pileIndex}
              disabled={!canInteract}
              onClick={() => handlePileClick(pileIndex)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded border-2 transition-colors
                ${isSelected ? 'border-blue-400 bg-blue-950' : 'border-transparent'}
                ${canInteract && !isSelected ? 'hover:border-slate-500 hover:bg-slate-800' : ''}
                disabled:cursor-default
              `}
            >
              <div className="flex flex-col gap-0.5 items-center">
                {range(Math.ceil(size / 5)).map(row => (
                  <div key={row} className="flex gap-0.5">
                    {range(Math.min(5, size - row * 5)).map(col => (
                      <div key={col} className="w-3 h-14 bg-amber-600 rounded-t-sm" />
                    ))}
                  </div>
                ))}
              </div>
              <span className="text-lg font-bold">{size}</span>
            </button>
          );
        })}
      </div>

      {uiMode === 'merge' && mergeFirst !== null && canInteract && (
        <p className="mt-3 text-sm text-slate-400">
          {t({
            hu: `Kiválasztva: ${board[mergeFirst]} gyufás kupac. Kattints egy másik kupacra az egyesítéshez.`,
            en: `Selected: pile of ${board[mergeFirst]}. Click another pile to merge.`
          })}
        </p>
      )}
    </section>
  );
};

const moves = {
  removeOne: (board, { events }, pileIndex) => {
    const newSize = board[pileIndex] - 1;
    const nextBoard = [
      ...board.slice(0, pileIndex),
      ...(newSize > 0 ? [newSize] : []),
      ...board.slice(pileIndex + 1)
    ];
    events.endTurn();
    if (!canMove(nextBoard)) events.endGame();
    return { nextBoard };
  },
  mergePiles: (board, { events }, [pileIndex1, pileIndex2]) => {
    const [firstIdx, secondIdx] = [pileIndex1, pileIndex2].sort((a, b) => a - b);
    const merged = board[firstIdx] + board[secondIdx];
    const nextBoard = board.filter((_, i) => i !== firstIdx && i !== secondIdx);
    nextBoard.splice(firstIdx, 0, merged);
    events.endTurn();
    return { nextBoard };
  }
};

const getPlayerStepDescription = ({ board }) => {
  if (board.length === 1) {
    return {
      hu: 'Vegyél el 1 gyufát a kupacból.',
      en: 'Remove 1 match from the pile.'
    };
  }
  return {
    hu: 'Vegyél el 1 gyufát egy kupacból, vagy egyesíts két kupacot.',
    en: 'Remove 1 match from a pile, or merge two piles into one.'
  };
};

const rule = {
  hu: <>
    A játék kezdetén néhány kupac gyufa van az asztalon, mindegyikben legalább két szál.
    A játékosok felváltva lépnek, kétféle lépés megengedett: vagy egyetlen gyufát elveszünk valamelyik
    kupacból, vagy egyesítünk két kupacot. Az veszít, aki nem tud szabályosan lépni.
  </>,
  en: <>
    At the start of the game, several piles of matches are placed on the table, each containing
    at least two matches. Players alternate turns. Two moves are allowed: either remove one match
    from a pile, or merge two piles into one. The player who cannot make a legal move loses.
  </>
};

const { name, title, credit } = gameList.PileUnion;
export const PileUnion = strategyGameFactory({
  presentation: {
    rule,
    title: title || name,
    credit,
    getPlayerStepDescription
  },
  BoardClient,
  gameplay: { moves },
  variants: [{
    botStrategy: randomBotStrategy,
    generateStartBoard: () => {
      const numPiles = Math.floor(Math.random() * 3) + 2;
      return Array.from({ length: numPiles }, () => Math.floor(Math.random() * 4) + 2);
    }
  }]
});
