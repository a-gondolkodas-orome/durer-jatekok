import { useEffect, useState } from 'react';
import { useTranslation } from '../../language';
import { GameBoard, type BoardClientProps } from '../../game-factory';
import { type Board, colorOf, moveTargets, placeTargets } from './helpers';

const discClass = (cell: 'red' | 'blue' | null): string => {
  if (cell === 'red') return 'bg-red-500';
  if (cell === 'blue') return 'bg-blue-500';
  return '';
};

export const BoardClient = ({ board, ctx, moves }: BoardClientProps<Board>) => {
  const { t } = useTranslation();
  const { cells } = board;
  const myColor = ctx.currentPlayer === null ? null : colorOf(ctx.currentPlayer);
  const canInteract = ctx.isClientMoveAllowed && myColor !== null;

  const [selectedFrom, setSelectedFrom] = useState<number | null>(null);

  // Drop any in-progress selection whenever the board advances.
  useEffect(() => setSelectedFrom(null), [ctx.moveCount]);

  const targets = selectedFrom !== null ? moveTargets(cells, selectedFrom) : [];
  const placeable = canInteract && myColor !== null ? placeTargets(cells, myColor) : [];

  const clickCell = (i: number) => {
    if (!canInteract || myColor === null) return;
    if (selectedFrom !== null) {
      if (targets.includes(i)) {
        moves.moveDisc(board, selectedFrom, i);
        return;
      }
      if (i === selectedFrom) return setSelectedFrom(null);
    }
    if (cells[i] === myColor) {
      return setSelectedFrom(moveTargets(cells, i).length > 0 ? i : null);
    }
    if (cells[i] === null && placeable.includes(i)) {
      moves.placeDisc(board, i);
      return;
    }
    setSelectedFrom(null);
  };

  const cellState = (i: number): 'selected' | 'target' | 'placeable' | 'movable' | 'plain' => {
    if (i === selectedFrom) return 'selected';
    if (selectedFrom !== null && targets.includes(i)) return 'target';
    if (selectedFrom === null && canInteract) {
      if (cells[i] === myColor && moveTargets(cells, i).length > 0) return 'movable';
      if (cells[i] === null && placeable.includes(i)) return 'placeable';
    }
    return 'plain';
  };

  const ring: Record<ReturnType<typeof cellState>, string> = {
    selected: 'border-blue-500 ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900',
    target: 'border-blue-400 border-dashed bg-blue-100 dark:bg-blue-900',
    placeable: 'border-green-500 border-dashed bg-green-100 dark:bg-green-900',
    movable: 'border-slate-400 hocus:border-blue-400',
    plain: 'border-slate-300 dark:border-slate-600'
  };

  const label = (i: number): string => {
    const content = cells[i] === 'red'
      ? t({ hu: 'piros korong', en: 'red disc' })
      : cells[i] === 'blue'
        ? t({ hu: 'kék korong', en: 'blue disc' })
        : t({ hu: 'üres', en: 'empty' });
    return t({ hu: `${i + 1}. mező, ${content}`, en: `Field ${i + 1}, ${content}` });
  };

  return (
    <GameBoard>
      {/* The strip is kept on a single line: cells share the available width
          (flex-1 + aspect-square) so up to 12 fields fit without wrapping, which
          keeps the row's linear order obvious. The max-width stops them from
          growing oversized on wide screens. */}
      <div className="flex gap-1 sm:gap-1.5 justify-center items-center py-2 w-full max-w-xl mx-auto">
        {cells.map((cell, i) => {
          const state = cellState(i);
          const actionable = canInteract
            && (state === 'movable' || state === 'placeable' || state === 'target' || state === 'selected');
          return (
            <button
              key={i}
              onClick={() => clickCell(i)}
              disabled={!actionable}
              aria-pressed={state === 'selected'}
              aria-label={label(i)}
              className={`relative flex-1 min-w-0 aspect-square rounded-md sm:rounded-lg border-2
                flex items-center justify-center bg-surface-elevated transition-colors ${ring[state]}
              `}
            >
              {cell !== null && (
                <span
                  className={`w-4/5 aspect-square rounded-full shadow-sm ${discClass(cell)}`}
                />
              )}
              {state === 'placeable' && (
                <span
                  className={`absolute w-4/5 aspect-square rounded-full border-2 border-dashed
                    ${myColor === 'red' ? 'border-red-400' : 'border-blue-400'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {canInteract && (
        <div className="flex justify-center mt-4">
          <button onClick={() => moves.pass(board)} className="primary-button w-auto">
            {t({ hu: 'Passzolok', en: 'Pass' })}
          </button>
        </div>
      )}
    </GameBoard>
  );
};
