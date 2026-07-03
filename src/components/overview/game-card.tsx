import { Link } from 'react-router';
import type { GameEntry } from '../games/gameList';
import { useTranslation } from '../language';
import { GameIcon } from './game-icons';
import { categoryColorClass, chipBase } from './tokens';

export const GameCard = ({ gameId, gameProps }: { gameId: string; gameProps: GameEntry }) => {
  const { t } = useTranslation();

  const round = gameProps.round === 'döntő'
    ? t({ hu: 'döntő', en: 'final' })
    : gameProps.round;

  const primaryCategory = gameProps.category[0];
  const categoryColor = categoryColorClass[primaryCategory];

  return <Link
    to={`/game/${gameId}`}
    data-testid="game-card"
    className={`
      rounded-lg border p-1 sm:p-2 max-w-[20ch] sm:max-w-[32ch] w-full flex flex-col items-center
      cursor-pointer hocus:bg-blue-50 dark:hocus:bg-blue-950 hocus:border-blue-400
      no-underline text-inherit
    `}
  >
    <span
      className={`
        rounded-full p-2 mt-1 mb-2 w-10 h-10 sm:w-12 sm:h-12
        flex items-center justify-center ${categoryColor}
      `}
      aria-hidden="true"
    >
      <GameIcon iconKey={gameProps.icon} />
    </span>
    <h2 className="mb-2 sm:mb-4 text-base sm:text-xl text-center">
      {t(gameProps.name)}
    </h2>
    <div className="grow"></div>
    <div className="flex flex-wrap items-baseline gap-1 text-xs w-full">
      <span className={`${chipBase} bg-surface-elevated`} title={gameProps.year.k}>{gameProps.year.v}</span>
      <span className={`${chipBase} bg-surface-elevated`}>{round}</span>
      <span className={`${chipBase} ${categoryColor}`}>{gameProps.category.join(', ')}</span>
      <span className="ml-auto" aria-hidden="true">→</span>
    </div>
  </Link>;
};
