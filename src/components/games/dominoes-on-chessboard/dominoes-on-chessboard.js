import React, { useState } from 'react';
import { range, cloneDeep, isEqual, flatMap, sample } from 'lodash';
import { strategyGameFactory } from '../strategy-game';

const BOARDSIZE = 8;
const getId = ({ row, col }) => row * BOARDSIZE + col;

const BoardClient = ({ board, ctx, moves }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);

  const hasEmptyNeighbor = ({ row, col }) => {
    if (col < (BOARDSIZE - 1) && !isCovered({ row, col: col + 1 })) return true;
    if (col >= 1 && !isCovered({ row, col: col -1 })) return true;
    if (row < (BOARDSIZE - 1) && !isCovered({ row: row + 1, col })) return true;
    if (row >= 1 && !isCovered({ row: row - 1, col })) return true;
    return false;
  }

  const clickField = (field) => {
    if (!ctx.shouldRoleSelectorMoveNext) return;
    if (isCovered(field)) return;
    if (!hasEmptyNeighbor(field)) return;
    if (selectedField === null) {
      setSelectedField(field);
      return;
    }
    if (isEqual(field, selectedField)) {
      setSelectedField(null);
      return;
    }
    if (!isNeighborOfSelected(field)) return;
    moves.placeDomino(board, [getId(selectedField), getId(field)]);
    setSelectedField(null);
  };

  const isCovered = (field) => {
    return flatMap(board).includes(getId(field));
  }

  const isNeighborOfSelected = ({ row, col }) => {
    if (selectedField === null) return false;
    if (row === selectedField.row && Math.abs(col - selectedField.col) === 1) return true;
    if (col === selectedField.col && Math.abs(row - selectedField.row) === 1) return true;
    return false;
  }

  const isClickAllowed = (field) => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    if (isCovered(field)) return false;
    if (!hasEmptyNeighbor(field)) return false;
    if (selectedField !== null && isEqual(field, selectedField)) return true;
    if (selectedField !== null && !isNeighborOfSelected(field)) return false;
    return true;
  }

  const getDominoBorders = (field) => {
    if (!isCovered(field)) return '';
    const domino = board.find(d => d.includes(getId(field)));
    const neighbor = domino[0] === getId(field) ? domino[1] : domino[0];
    const nCol = neighbor % BOARDSIZE;
    const nRow = ((neighbor - nCol) / BOARDSIZE);
    if (field.row === nRow) {
      if (field.col === nCol - 1) return 'rounded-l-md border-t-4 border-l-4 border-b-4';
      return 'rounded-r-md border-t-4 border-r-4 border-b-4'
    }
    if (field.col === nCol) {
      if (field.row === nRow - 1) return 'rounded-t-md border-r-4 border-l-4 border-t-4';
      return 'rounded-b-md border-r-4 border-l-4 border-b-4';
    }
    return '';
  }

  const getOuterBoarders = field => {
    if (!isCovered(field)) return 'border-2';
    const domino = board.find(d => d.includes(getId(field)));
    const neighbor = domino[0] === getId(field) ? domino[1] : domino[0];
    const nCol = neighbor % BOARDSIZE;
    const nRow = ((neighbor - nCol) / BOARDSIZE);
    if (field.row === nRow) {
      if (field.col === nCol - 1) return 'border-t-2 border-l-2 border-b-2 border-r-4 border-r-yellow-400';
      return 'border-t-2 border-r-2 border-b-2 border-l-4 border-l-yellow-400'
    }
    if (field.col === nCol) {
      if (field.row === nRow - 1) return 'border-r-2 border-l-2 border-t-2 border-b-4 border-b-yellow-400';
      return 'border-r-2 border-l-2 border-b-2 border-t-4 border-t-yellow-400';
    }
    return 'border-2';
  }

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    <table className="m-2 w-full border-collapse table-fixed">
      <tbody>
        {range(BOARDSIZE).map(row => (
          <tr key={row}>
            {range(BOARDSIZE).map(col => (
              <td
                key={col}
                className={getOuterBoarders({ row, col })}
              >
                <button
                  className={`
                    aspect-square w-full p-[5%] relative
                    ${!isClickAllowed({ row, col }) ? 'cursor-not-allowed' : ''}
                    ${isCovered({ row, col }) ? `bg-slate-600 border-black` : ''}
                    ${getDominoBorders({ row, col })}
                    ${isEqual(selectedField, { row, col }) ? 'bg-teal-600' : ''}
                    ${isNeighborOfSelected({ row, col }) && !isCovered({ row, col }) ? 'bg-teal-200' : ''}
                    ${isNeighborOfSelected({ row, col }) && !isCovered({ row, col }) && isEqual(hoveredField, { row, col }) ? 'bg-teal-400' : ''}
                  `}
                  disabled={!isClickAllowed({ row, col })}
                  onClick={() => clickField({ row, col })}
                  onMouseOver={() => setHoveredField({ row, col })}
                  onMouseOut={() => setHoveredField(null)}
                  onFocus={() => setHoveredField({ row, col })}
                  onBlur={() => setHoveredField(null)}
                >
                  {isCovered({ row, col }) &&
                  <span
                    className={`
                      aspect-square rounded-full bg-yellow-400 inline-block
                      absolute z-20 left-[40%] right-[40%] bottom-[40%]
                    `}
                  ></span>}
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
  );
};

const getPossibleMoves = board => {
  const possibleMoves = [];
  const boardIndices = flatMap(
    range(0, BOARDSIZE), row => range(0, BOARDSIZE).map(col => ({ row, col }))
  );
  const isCovered = (field) => {
    return flatMap(board).includes(getId(field));
  }
  boardIndices.forEach(({ row, col }) => {
    if (isCovered({ row, col })) return;
    if (col < (BOARDSIZE - 1) && !isCovered({ row, col: col + 1 })) {
      possibleMoves.push([getId({row, col }), getId({ row, col: col + 1 })])
    };
    if (col >= 1 && !isCovered({ row, col: col -1 })) {
      possibleMoves.push([getId({row, col }), getId({ row, col: col -1 })])
    };
    if (row < (BOARDSIZE - 1) && !isCovered({ row: row + 1, col })) {
      possibleMoves.push([getId({row, col }), getId({ row: row + 1, col })])
    };
    if (row >= 1 && !isCovered({ row: row - 1, col })) {
      possibleMoves.push([getId({row, col }), getId({ row: row - 1, col })])
    };
    return;
  });

  return possibleMoves;
}

const moves = {
  placeDomino: (board, { events }, domino) => {
    const nextBoard = cloneDeep(board);
    nextBoard.push(domino);
    events.endTurn();
    if (getPossibleMoves(nextBoard).length === 0) {
      events.endGame();
    }
    return { nextBoard };
  }
}

const aiBotStrategy = ({ board, moves }) => {
  const randomDomino = sample(getPossibleMoves(board));
  moves.placeDomino(board, randomDomino);
}

const rule = <>
  Két játékos felváltva tesz egy egy dominót egy 8 × 8-as sakktáblára úgy, hogy két
  élszomszédos üres mezőt fedjen le. Az veszít aki nem tud tenni.
</>;

export const DominoesOnChessboard = strategyGameFactory({
  rule,
  title: 'Sakktáblára Dominók',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy üres mezőre, majd egy szomszédjára, hogy lehelyezz egy dominót.',
  generateStartBoard: () => [],
  moves,
  aiBotStrategy
});
