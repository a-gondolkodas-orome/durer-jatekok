import type { FC, SVGProps } from 'react';
import type { IconKey } from '../games/gameList';

// Small, self-contained, monochrome icons for the overview cards. Everything is
// drawn with `currentColor` so each icon tints with the category-accent badge it
// sits in (see game-card.tsx). Deliberately no <symbol>/<use> or global ids —
// unlike the in-game SVGs — so they compose safely wherever they're rendered.

type IconProps = SVGProps<SVGSVGElement>;

const svgProps = (rest: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
  className: 'w-full h-full',
  ...rest
});

const ChessIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 3a2 2 0 0 0-1 3.7C9.8 7.6 9 9 9 10.5c0 1.4.7 2.2 1.5 2.8L9 19h6l-1.5-5.7c.8-.6 1.5-1.4
      1.5-2.8 0-1.5-.8-2.9-2-3.8A2 2 0 0 0 12 3Z" />
    <path d="M7 21h10" />
  </svg>
);

const BoardIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16" />
  </svg>
);

const ColoringIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 3 3 19h18L12 3Z" />
    <path d="M12 3 7.5 11h9L12 3Z" fill="currentColor" stroke="none" />
  </svg>
);

const CoinsIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="9" cy="9" r="5" />
    <path d="M14 6.2a5 5 0 1 1 0 9.6" />
    <path d="M9 6.8v4.4M7.3 9h3.4" />
  </svg>
);

const NumberIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M7 4v16M17 4v16" />
    <path d="M4 8.5h16M4 15.5h16" />
  </svg>
);

const GeometryIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 3 21 20H3L12 3Z" />
    <circle cx="12" cy="3" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="3" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="21" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const GraphIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M6 6 12 12M12 12 18 6M12 12 12 19" />
    <circle cx="6" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const PilesIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="15" width="5" height="5" rx="1" />
    <rect x="4" y="9" width="5" height="5" rx="1" />
    <rect x="15" y="15" width="5" height="5" rx="1" />
  </svg>
);

const CardsIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="8" y="5" width="10" height="14" rx="1.5" transform="rotate(8 13 12)" />
    <rect x="6" y="5" width="10" height="14" rx="1.5" transform="rotate(-8 11 12)" />
  </svg>
);

const DiscsIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="8" cy="9" r="4.5" />
    <circle cx="15" cy="15" r="4.5" fill="currentColor" stroke="none" />
  </svg>
);

const PursuitIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="12" r="2.5" fill="currentColor" stroke="none" />
    <path d="M9 12h6" />
    <path d="M13.5 9.5 16 12l-2.5 2.5" />
  </svg>
);

const PyramidIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 4 20 20H4L12 4Z" />
    <path d="M8 12h8M6 16h12" />
  </svg>
);

const DominoesIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="4" y="8" width="16" height="8" rx="1.5" />
    <path d="M12 8v8" />
    <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Neutral placeholder for games without a dedicated icon.
export const FallbackIcon: FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const gameIcons: Record<IconKey, FC<IconProps>> = {
  chess: ChessIcon,
  board: BoardIcon,
  coloring: ColoringIcon,
  coins: CoinsIcon,
  number: NumberIcon,
  geometry: GeometryIcon,
  graph: GraphIcon,
  piles: PilesIcon,
  cards: CardsIcon,
  discs: DiscsIcon,
  pursuit: PursuitIcon,
  pyramid: PyramidIcon,
  dominoes: DominoesIcon
};

export const GameIcon = ({ iconKey, ...rest }: { iconKey?: IconKey } & IconProps) => {
  const Icon = (iconKey && gameIcons[iconKey]) ?? FallbackIcon;
  return <Icon {...rest} />;
};
