import { useEffect, useState } from 'react';
import { useTranslation } from '../../language';
import { GameBoard, type BoardClientProps } from '../../game-factory';
import { BOARD_OUTLINE, EDGES, TRIANGLES } from './geometry';
import { type Board, LINE, CIRCLE } from './helpers';

// Two very different interactions share one board: on the line player's turn the
// edges are clickable, on the circle player's turn the triangles are. Only the
// active layer receives pointer/keyboard events, so a click near an edge never
// gets swallowed by a triangle (or vice versa).
export const BoardClient = ({ board, ctx, moves }: BoardClientProps<Board>) => {
  const { t } = useTranslation();
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  useEffect(() => {
    setHoveredEdge(null);
  }, [ctx.moveCount]);

  const myTurn = ctx.isClientMoveAllowed;
  const lineToMove = myTurn && ctx.currentPlayer === LINE;
  const circleToMove = myTurn && ctx.currentPlayer === CIRCLE;

  const edgeClickable = (e: number) => lineToMove && !board.edges[e];
  const triangleClickable = (t: number) => circleToMove && !board.circles[t];

  const shadeEdge = (e: number) => {
    if (!edgeClickable(e)) return;
    moves.shadeEdge(board, e);
  };
  const placeCircle = (t: number) => {
    if (!triangleClickable(t)) return;
    moves.placeCircle(board, t);
  };

  const triangleClass = (t: number) => {
    if (board.circles[t]) return 'fill-slate-900/5 dark:fill-white/5';
    if (triangleClickable(t)) {
      return 'fill-transparent hocus:fill-blue-100 dark:hocus:fill-blue-900/50 cursor-pointer outline-none';
    }
    return 'fill-transparent';
  };

  return (
    <GameBoard>
      <svg className="aspect-square w-full" viewBox="0 0 100 100">
        {/* Triangles: fills + circle-player clicks */}
        <g>
          {TRIANGLES.map(tri => (
            <polygon
              key={`tri-${tri.id}`}
              points={tri.points}
              className={triangleClass(tri.id)}
              onClick={() => placeCircle(tri.id)}
              onKeyUp={event => { if (event.key === 'Enter') placeCircle(tri.id); }}
              tabIndex={triangleClickable(tri.id) ? 0 : undefined}
              role={triangleClickable(tri.id) ? 'button' : undefined}
              aria-label={triangleClickable(tri.id)
                ? t({ hu: `${tri.id + 1}. háromszög — tegyél bele kört`, en: `Triangle ${tri.id + 1} — drop a circle` })
                : undefined}
            />
          ))}
        </g>

        {/* Circles already placed */}
        <g className="pointer-events-none">
          {TRIANGLES.filter(tri => board.circles[tri.id]).map(tri => (
            <circle
              key={`circle-${tri.id}`}
              cx={tri.cx}
              cy={tri.cy}
              r={tri.dir === 'up' ? 2.6 : 2.2}
              className="fill-none stroke-blue-700 dark:stroke-blue-400"
              strokeWidth="0.9"
            />
          ))}
        </g>

        {/* Grid lines: thin for free edges, thick red for shaded ones */}
        <g className="pointer-events-none">
          {EDGES.map(edge => {
            const shaded = board.edges[edge.id];
            const hovered = hoveredEdge === edge.id;
            return (
              <line
                key={`edge-${edge.id}`}
                x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                strokeLinecap="round"
                className={
                  shaded
                    ? 'stroke-red-500'
                    : hovered
                      ? 'stroke-red-300 dark:stroke-red-700'
                      : 'stroke-slate-300 dark:stroke-slate-600'
                }
                strokeWidth={shaded ? 1.6 : hovered ? 1.4 : 0.4}
              />
            );
          })}
        </g>

        {/* Board outline */}
        <polygon
          points={BOARD_OUTLINE}
          className="fill-none stroke-slate-500 dark:stroke-slate-400 pointer-events-none"
          strokeWidth="0.5"
        />

        {/* Invisible wide hit targets for edges — only on the line player's turn */}
        {lineToMove && (
          <g>
            {EDGES.filter(edge => !board.edges[edge.id]).map(edge => (
              <line
                key={`hit-${edge.id}`}
                x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke="transparent"
                strokeWidth="4"
                strokeLinecap="round"
                className="cursor-pointer outline-none"
                onClick={() => shadeEdge(edge.id)}
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onFocus={() => setHoveredEdge(edge.id)}
                onBlur={() => setHoveredEdge(null)}
                onKeyUp={event => { if (event.key === 'Enter') shadeEdge(edge.id); }}
                tabIndex={0}
                role="button"
                aria-label={t({ hu: `${edge.id + 1}. él — satírozd be`, en: `Edge ${edge.id + 1} — shade it` })}
              />
            ))}
          </g>
        )}
      </svg>
    </GameBoard>
  );
};
