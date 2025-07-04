import React from 'react';
import { strategyGameFactory } from '../strategy-game';
import { cloneDeep, some, flatMap, range, isEqual, sample } from 'lodash';

const [ROWS, COLS] = [4, 6];
const [DUCK, FORBIDDEN] = [1, 2]

const generateStartBoard = () => {
  return range(0, ROWS).map(() => range(0, COLS).map(() => null));
};

const boardIndices = flatMap(range(0, ROWS), row => range(0, COLS).map(col => ({ row, col })));

const getAllowedMoves = (board) => {
  return boardIndices.filter(({ row, col }) => board[row][col] === null);
};

const markForbiddenFields = (board, { row, col }) => {
  if (row - 1 >= 0) {
    board[(row - 1)][col] = FORBIDDEN;
  }
  if (row + 1 <= (ROWS - 1)) {
    board[(row + 1)][col] = FORBIDDEN;
  }
  if (col - 1 >= 0) {
    board[(row)][col - 1] = FORBIDDEN;
  }
  if (col + 1 <= (COLS - 1)) {
    board[(row)][col + 1] = FORBIDDEN;
  }
};


const BoardClient = ({ board, ctx, moves }) => {
  const clickField = (field) => {
    if (!isMoveAllowed(field)) return;

    moves.placeDuck(board, field);
  };

  const isMoveAllowed = (targetField) => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    return some(getAllowedMoves(board), field => isEqual(field, targetField));
  };

  const isForbidden = ({ row, col }) => {
    return board[row][col] === FORBIDDEN;
  };
  const isDuck = ({ row, col }) => {
    return board[row][col] === DUCK;
  };

  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      <table className="m-2 w-full border-collapse table-fixed">
      <tbody>
        {range(ROWS).map(row => (
          <tr key={row}>
            {range(COLS).map(col => (
              <td
                key={col}
                onClick={() => clickField({ row, col })}
                className={`
                  border-4
                  ${isForbidden({ row, col }) ? 'bg-slate-400 cursor-not-allowed' : ''}
                `}
              >
                <div className="aspect-square p-[5%] w-full">
                  {isDuck({ row, col }) && 'KACSA'}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </section>
  );
};

const moves = {
  placeDuck: (board, { events }, { row, col }) => {
    const nextBoard = cloneDeep(board);
    nextBoard[row][col] = DUCK;
    markForbiddenFields(nextBoard, { row, col });
    events.endTurn();
    if (getAllowedMoves(nextBoard).length === 0) {
      events.endGame();
    }
    return { nextBoard }
  }
};

const aiBotStrategy = ({ board, moves }) => {
  const allowedMoves = getAllowedMoves(board);
  const aiMove = sample(allowedMoves);
  moves.placeDuck(board, aiMove);
};

const rule = <>
  Azt sokan tudják, hogy egy ló hogy lép a sakktáblán, de azt már nagyon kevesen, hogy
egy kacsa hogyan: a négy oldalszomszédos mezőre tud lépni. A két játékos felváltva rak le a 4 × 6-os
táblára kacsákat úgy, hogy a lerakott bábu ne üsse a táblán levő kacsák egyikét sem. Az veszít, aki
nem tud lépni.
</>;

export const ChessDucks = strategyGameFactory({
  rule,
  title: 'Egyet vegyél vagy felezz',
  BoardClient,
  getPlayerStepDescription: () => 'Kattints egy mezőre, amit nem üt egyik kacsa sem.',
  generateStartBoard,
  aiBotStrategy,
  moves
});
