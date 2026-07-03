import type { Category } from '../games/gameList';

// Category accent colours, increasing in difficulty A → E+. Used for the card
// chip and the icon badge; both adapt to dark mode. E/E+ carry `text-white`, so
// a `currentColor` icon placed on them turns white automatically.
export const categoryColorClass: Record<Category, string> = {
  'A':  'bg-green-200 dark:bg-green-700',
  'B':  'bg-teal-300 dark:bg-teal-700',
  'C':  'bg-blue-300 dark:bg-blue-700',
  'D':  'bg-blue-400 dark:bg-blue-600',
  'E':  'bg-blue-600 text-white',
  'E+': 'bg-blue-800 text-white'
};

export const chipBase = 'rounded-full drop-shadow-sm px-2 py-0.5 whitespace-nowrap';
