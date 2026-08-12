import { range } from 'lodash';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

// How the pile reads while a discard is being aimed at it: `preview` is a pile
// the pointer is merely over, `chosen` one already picked this turn. Two piles
// of the family have no discard to aim (the two-pile game implies it), so both
// states are optional in practice.
export type DiscardState = 'no' | 'preview' | 'chosen';

type PileCardProps = {
  size: number;
  // the pile's count, plus what the move under the pointer would leave of it
  caption: ReactNode;
  discard?: DiscardState;
  // Pieces up to and including `splitAfter` are coloured as the first of the
  // two piles a cut here would leave behind, the rest as the second. `null`
  // previews nothing.
  splitAfter?: number | null;
  headerAction?: ReactNode;
  pieceProps: (pieceId: number) => ComponentPropsWithoutRef<'button'>;
  // spread onto the card itself, for a game where the pile as a whole is a
  // click target
  cardProps?: ComponentPropsWithoutRef<'div'>;
};

const pieceColor = (isDiscarded: boolean, isInFirstHalf: boolean) => {
  if (isDiscarded) return 'bg-slate-400 dark:bg-slate-600';
  return isInFirstHalf ? 'bg-blue-600' : 'bg-green-600';
};

// The ring sits a pixel off the piece, so its offset has to be painted in the
// card's own colour — `bg-surface-elevated` has no ring-offset counterpart.
const cutRing = 'ring-2 ring-blue-800 dark:ring-blue-300 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-800';

/**
 * One pile of a pile-splitting game, drawn as its own card: which piece belongs
 * to which pile is then a question the layout answers by itself, at any pile
 * count and any pile size, where a shared board with dividers between the piles
 * has to keep answering it as the sizes shift.
 *
 * The pieces sit five to a row and every card is the same width, so a pile is
 * read as full rows plus a remainder rather than counted piece by piece, and
 * two piles compare at a glance.
 *
 * The split preview is a colour and a ring on the piece cut at, and never a
 * gap: pieces the two halves would be laid out in stay in the one grid, in the
 * slots they already occupy. Moving them is what would put a different piece
 * under a stationary pointer, and — since a piece would change parent — drop
 * the focus of anyone walking the pile by keyboard.
 */
export const PileCard = ({
  size,
  caption,
  discard = 'no',
  splitAfter = null,
  headerAction,
  pieceProps,
  cardProps
}: PileCardProps) => {
  // An emptied pile is the beat between the two halves of a turn — the discard
  // has been played and the split has not — so it reads as discarded too.
  const isDiscarded = discard !== 'no' || size === 0;

  return (
    <div
      className={`
        w-36 sm:w-40 rounded-lg border-2 px-2 pt-1 pb-2 bg-surface-elevated
        ${discard === 'chosen' ? 'border-blue-500' : ''}
        ${isDiscarded ? 'opacity-60' : ''}
      `}
      {...cardProps}
    >
      {/* The caption grows as it takes on what the hovered move would leave
          ("15" → "15 → 🗑️"), so the action is pinned to the corner rather than
          laid out beside it: in a row the two share, hovering the button is
          what moves it out from under the pointer. */}
      <div className="relative flex items-center justify-center h-8">
        <span className="text-base sm:text-lg font-semibold tabular-nums whitespace-nowrap">
          {caption}
        </span>
        <span className="absolute right-0">{headerAction}</span>
      </div>
      <div className="grid grid-cols-5 justify-items-center min-h-7">
        {range(size).map(pieceId => (
          <button
            key={pieceId}
            type="button"
            className={`
              p-0.5 rounded-full
              enabled:hocus:bg-slate-200 dark:enabled:hocus:bg-slate-700
            `}
            {...pieceProps(pieceId)}
          >
            <span className={`
              block w-5 h-5 sm:w-6 sm:h-6 rounded-full
              ${pieceColor(isDiscarded, splitAfter === null || pieceId <= splitAfter)}
              ${pieceId === splitAfter ? cutRing : ''}
            `} />
          </button>
        ))}
      </div>
    </div>
  );
};

// Wrapping the cards as they happen to fit leaves four piles as a row of three
// and a stray fourth, so the column count is spelled out per pile count
// instead: two piles side by side, three in a row once there is room for one,
// four as a square. Four in a line is not among them — the board shares its
// width with the sidebar, and even a 1440px window leaves it too narrow.
const columnClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2'
};

export const PileArea = ({ pileCount, children }: { pileCount: number; children: ReactNode }) => (
  // `w-fit` so the columns are as wide as a card rather than a share of the
  // board: the piles read as one block whatever is left of the width.
  <div className={`
    grid w-fit mx-auto justify-items-center gap-2 sm:gap-3 p-1
    ${columnClass[pileCount] ?? 'grid-cols-2'}
  `}>
    {children}
  </div>
);
