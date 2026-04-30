import React, { useState } from 'react';
import { sample, range, random } from 'lodash';
import { strategyGameFactory } from '../../game-factory/strategy-game';
import { gameList } from '../gameList';
import { useTranslation } from '../../language/translate';


const memo = new Map();

const isLosing = (board) => {
  const sorted = [...board].sort((a, b) => a - b);
  const key = sorted.join(',');
  if (memo.has(key)) return memo.get(key);
  if (sorted.length === 0) { memo.set(key, true); return true; }

  const hasWinningMove = sorted.some((size, i) => {
    const afterRemove = sorted.filter((_, idx) => idx !== i);
    if (size > 1) afterRemove.push(size - 1);
    if (isLosing(afterRemove)) return true;
    return sorted.slice(i + 1).some((_, rel) => {
      const j = i + 1 + rel;
      const afterMerge = sorted.filter((_, idx) => idx !== i && idx !== j);
      afterMerge.push(sorted[i] + sorted[j]);
      return isLosing(afterMerge);
    });
  });

  memo.set(key, !hasWinningMove);
  return !hasWinningMove;
};

const aiBotStrategy = ({ board, moves }) => {
  const winningMoves = [];

  board.forEach((_, i) => {
    const next = board.filter((_, idx) => idx !== i);
    if (board[i] > 1) next.push(board[i] - 1);
    if (isLosing(next)) winningMoves.push({ type: 'remove', i });
  });

  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      const next = board.filter((_, idx) => idx !== i && idx !== j);
      next.push(board[i] + board[j]);
      if (isLosing(next)) winningMoves.push({ type: 'merge', i, j });
    }
  }

  const allMoves = [];
  board.forEach((_, i) => allMoves.push({ type: 'remove', i }));
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) allMoves.push({ type: 'merge', i, j });
  }

  const chosen = sample(winningMoves.length > 0 ? winningMoves : allMoves);
  if (chosen.type === 'remove') {
    moves.removeOne(board, chosen.i);
  } else {
    moves.mergePiles(board, [chosen.i, chosen.j]);
  }
};

const randomBotStrategy = ({ board, moves }) => {
  const winIn1 = [];
  board.forEach((_, i) => {
    const next = board.filter((_, idx) => idx !== i);
    if (board[i] > 1) next.push(board[i] - 1);
    if (next.length === 0) winIn1.push({ type: 'remove', i });
  });

  const allMoves = [];
  board.forEach((_, i) => allMoves.push({ type: 'remove', i }));
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) allMoves.push({ type: 'merge', i, j });
  }

  const chosen = sample(winIn1.length > 0 ? winIn1 : allMoves);
  if (chosen.type === 'remove') {
    moves.removeOne(board, chosen.i);
  } else {
    moves.mergePiles(board, [chosen.i, chosen.j]);
  }
};

const Matchstick = ({ dimmed }) => (
  <div
    className={`w-3 h-14 flex flex-col items-center ${dimmed ? 'opacity-40' : ''}`}
    style={{ transform: 'scaleY(-1)' }}
  >
    <div className="w-2 h-3 bg-red-800 rounded-sm" />
    <div className="w-1.5 grow bg-stone-400" />
  </div>
);

const BoardClient = ({ board, ctx, moves }) => {
  const { t } = useTranslation();
  const [uiMode, setUiMode] = useState('remove');
  const [mergeFirst, setMergeFirst] = useState(null);
  const [hoveredPile, setHoveredPile] = useState(null);

  const canInteract = ctx.isClientMoveAllowed;

  const handlePileClick = (pileIndex) => {
    if (!canInteract) return;
    if (uiMode === 'remove') {
      moves.removeOne(board, pileIndex);
      setUiMode('remove');
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
      {board.length > 0 && (
        <fieldset className="mb-4 max-w-[40ch]" disabled={!canInteract}>
          <div className={`flex rounded-lg overflow-hidden border border-slate-300 text-sm
            has-focus-visible:ring-2 has-focus-visible:ring-red-400 has-focus-visible:ring-offset-1`}>
            <label className={`grow py-1 px-2 text-center
              ${uiMode === 'remove' && canInteract
                ? 'bg-blue-500 text-white font-semibold cursor-pointer'
                : !canInteract
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`}>
              <input type="radio" className="sr-only"
                checked={uiMode === 'remove'}
                onChange={() => setUiMode('remove')} />
              {t({ hu: 'Elveszek 1-et', en: 'Remove 1' })}
            </label>
            <div className="w-px bg-slate-300" />
            <label className={`grow py-1 px-2 text-center
              ${uiMode === 'merge' && canInteract
                ? 'bg-blue-500 text-white font-semibold cursor-pointer'
                : !canInteract || board.length < 2
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`}>
              <input type="radio" className="sr-only"
                checked={uiMode === 'merge'}
                onChange={() => { setUiMode('merge'); setMergeFirst(null); }}
                disabled={board.length < 2} />
              {t({ hu: 'Egyesítek', en: 'Merge' })}
            </label>
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-4 items-end">
        {board.map((size, pileIndex) => {
          const isSelected = uiMode === 'merge' && mergeFirst === pileIndex;
          const isRemoveHovered = uiMode === 'remove' && hoveredPile === pileIndex;
          const isMergeHovered = uiMode === 'merge' && hoveredPile === pileIndex;
          return (
            <button
              key={pileIndex}
              disabled={!canInteract}
              onClick={() => handlePileClick(pileIndex)}
              onMouseEnter={() => setHoveredPile(pileIndex)}
              onMouseLeave={() => setHoveredPile(null)}
              onFocus={() => setHoveredPile(pileIndex)}
              onBlur={() => setHoveredPile(null)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded border-2 transition-colors
                ${isSelected ? 'border-blue-300 bg-blue-600/40' :
                  isRemoveHovered ? 'border-slate-200 bg-slate-800/5' :
                  isMergeHovered ? 'border-blue-300 bg-blue-600/20' :
                  'border-transparent'}
                disabled:cursor-default
              `}
            >
              <div className="flex flex-col gap-0.5 items-center" style={{ transform: 'scaleY(-1)' }}>
                {range(Math.ceil(size / 5)).map(row => (
                  <div key={row} className="flex gap-0.5">
                    {range(Math.min(5, size - row * 5)).map(col => {
                      const isLastMatch = row * 5 + col === size - 1;
                      return (
                        <Matchstick
                          key={col}
                          dimmed={isRemoveHovered && isLastMatch}
                        />
                      );
                    })}
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
            hu: `Kattints egy másik kupacra az egyesítéshez,` +
              ` vagy ugyanerre a kupacra a kijelölés visszavonásához.`,
            en: `Click another pile to merge,` +
              ` or the same pile again to deselect.`
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
    if (nextBoard.length === 0) events.endGame();
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
      hu: 'Vegyél el egy gyufát a kupacból.',
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
  variants: [
    {
      botStrategy: randomBotStrategy,
      label: { hu: 'Teszt 🤖', en: 'Test 🤖' }
    },
    {
      botStrategy: aiBotStrategy,
      generateStartBoard: () => {
        const numPiles = random(2, 4);
        return Array.from({ length: numPiles }, () => random(2, 5));
      },
      label: { hu: 'Okos 🤖', en: 'Smart 🤖' },
      isDefault: true
    }
  ]
});
