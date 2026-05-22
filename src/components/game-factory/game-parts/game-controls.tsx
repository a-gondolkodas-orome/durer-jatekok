import React from 'react';
import { useTranslation,I18nString } from '../../language/translate';
import type { Phase } from '../strategy-game';

export interface Variant {
  originalIndex: number
  disabled?: boolean
  label?: I18nString
  botStrategy?: unknown
}

export interface CtaContext {
  phase: Phase
  isHumanVsHumanGame: boolean
  isClientMoveAllowed?: boolean
  isRoleSelectorWinner?: boolean
  currentPlayerName?: string | null
  winnerName?: string | null
}

export const DEFAULT_PLAYER_NAMES: I18nString[] = [
  { hu: '1. játékos', en: '1st player' },
  { hu: '2. játékos', en: '2nd player' }
];

export const ModeSelector = ({ isHumanVsHumanGame, onSwitchMode, disabled }: {
  isHumanVsHumanGame: boolean
  onSwitchMode: (mode: string) => void
  disabled: boolean
}) => {
  const { t } = useTranslation();
  const labelClass = (active: boolean) => `grow py-1 px-2 text-center
    ${active
      ? `bg-blue-500 text-white font-semibold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
      : disabled
        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-600'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`;
  return (
    <fieldset>
      <legend className="text-xs text-slate-500 mb-1.5">
        {t({ hu: 'Játékmód', en: 'Game mode' })}
      </legend>
      <div className={`flex rounded-lg overflow-hidden border border-slate-300 text-sm
        has-focus-visible:ring-2 has-focus-visible:ring-red-400 has-focus-visible:ring-offset-1`}>
        <label className={labelClass(!isHumanVsHumanGame)}>
          <input
            type="radio"
            name="mode"
            className="sr-only"
            data-testid="mode-vsComputer"
            checked={!isHumanVsHumanGame}
            onChange={() => onSwitchMode('vsComputer')}
            disabled={disabled}
          />
          🤖 {t({ hu: 'Gép ellen', en: 'vs Computer' })}
        </label>
        <label className={labelClass(isHumanVsHumanGame)}>
          <input
            type="radio"
            name="mode"
            className="sr-only"
            data-testid="mode-vsHuman"
            checked={isHumanVsHumanGame}
            onChange={() => onSwitchMode('vsHuman')}
            disabled={disabled}
          />
          🤝 {t({ hu: '2 játékos', en: '2 players' })}
        </label>
      </div>
    </fieldset>
  );
};

export const DifficultySelector = ({ variants, selectedIndex, onSelect, disabled: fieldsetDisabled }: {
  variants: Variant[]
  selectedIndex: number
  onSelect: (index: number) => void
  disabled: boolean
}) => {
  const { t } = useTranslation();
  const labelClass = (active: boolean, variantDisabled: boolean | undefined) => `min-w-0 grow py-1 px-2 text-center
    ${active && !variantDisabled
      ? `bg-blue-500 text-white font-semibold ${fieldsetDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
      : variantDisabled || fieldsetDisabled
        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-600'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'}`;
  return (
    <fieldset className="overflow-hidden">
      <legend className="text-xs text-slate-500 mb-1.5">
        {t({ hu: 'Nehézség', en: 'Difficulty' })}
      </legend>
      <div className={`flex rounded-lg overflow-hidden border border-slate-300 text-sm
        has-focus-visible:ring-2 has-focus-visible:ring-red-400 has-focus-visible:ring-offset-1`}>
        {variants.map(v => (
          <label
            key={v.originalIndex}
            className={labelClass(v.originalIndex === selectedIndex, v.disabled)}
            title={v.disabled ? t({ hu: 'Nincs gépi stratégia megadva', en: 'No bot strategy defined' }) : undefined}
          >
            <input
              type="radio"
              name="difficulty"
              className="sr-only"
              checked={v.originalIndex === selectedIndex}
              onChange={() => onSelect(v.originalIndex)}
              disabled={v.disabled || fieldsetDisabled}
            />
            {t(v.label ?? { hu: `${v.originalIndex + 1}. szint`, en: `Level ${v.originalIndex + 1}` })}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export const getCtaText = ({
  phase,
  isHumanVsHumanGame,
  isClientMoveAllowed,
  isRoleSelectorWinner,
  currentPlayerName,
  winnerName
}: CtaContext): I18nString => {
  if (phase === 'roleSelection') {
    return isHumanVsHumanGame
      ? { hu: 'Döntsétek el, hogy ki kezd.', en: 'Decide who goes first.' }
      : { hu: 'Válassz szerepet!', en: 'Choose a role!' };
  }
  if (phase === 'play') {
    return isHumanVsHumanGame
      ? { hu: `Következik: ${currentPlayerName}`, en: `Next: ${currentPlayerName}` }
      : isClientMoveAllowed
        ? { hu: 'Te jössz', en: 'Your turn' }
        : { hu: 'Mi jövünk', en: "Computer's turn" };
  }
  else {
    return isHumanVsHumanGame
      ? { hu: `A játékot nyerte: ${winnerName}`, en: `Winner: ${winnerName}` }
      : isRoleSelectorWinner
        ? { hu: 'Nyertél. Gratulálunk! :)', en: 'You won. Congratulations! :)' }
        : {
          hu: 'Sajnos, most nem nyertél, de ne add fel.',
          en: "Unfortunately you didn't win this time, but don't give up."
        };
  }
};
