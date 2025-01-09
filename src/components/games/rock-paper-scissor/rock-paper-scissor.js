import React from 'react';
import { range, cloneDeep, isNull } from 'lodash';
import { strategyGameFactory } from '../strategy-game';
import { aiBotStrategy } from './bot-strategy';
import { RockSvg } from './symbols/rock-svg';
import { PaperSvg } from './symbols/paper-svg';
import { ScissorSvg } from './symbols/scissor-svg';

const BoardClient = ({ board, ctx, moves }) => {
  const isMoveAllowed = (id) => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    return board[id] === null;
  };
  const clickField = (id) => {
    if (!isMoveAllowed(id)) return;

    const idx = Math.floor(id / 3);
    moves.removeSymbol(board, idx)
  };
  const isDisabled = (id) => {
    if (!isMoveAllowed(id)) return true;
    if ([1, 4, 7].includes(id)) return true;
    if (ctx.chosenRoleIndex === 1) return [2, 5, 8].includes(id);
    if (ctx.chosenRoleIndex === 0) return [0, 3, 6].includes(id);
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    <div className="grid grid-cols-3">
      <span className="text-gray-500 text-xl text-center">Kezdő</span>
      <span></span>
      <span className="text-gray-500 text-xl text-center">Második</span>
    </div>
    <div className="grid grid-cols-3">
      {range(9).map(id => (
        [1,4,7].includes(id) || !isNull(board[id])
        ? <span className="aspect-[4/5] m-2" key={id}></span>
        : <button
          key={id}
          disabled={isDisabled(id)}
          onClick={() => clickField(id)}
          className={`
            p-2 m-2 aspect-[4/5] border-4 rounded-xl shadow-md
            disabled:cursor-not-allowed
            enabled:border-emerald-400 enabled:border-dashed
            enabled:hover:border-solid enabled:focus:border-solid
          `}
        >
          { isNull(board[id]) && (id === 0 || id === 2) && (
            <RockSvg />
          )}
          { isNull(board[id]) && (id === 3 || id === 5) && (
            <PaperSvg />
          )}
          { isNull(board[id]) && (id === 6 || id === 8) && (
            <ScissorSvg />
          )}
      </button>
      ))}
    </div>
  </section>
  );
};

const isGameEnd = (board) => {
  if (board.filter(c => c).length === 4) return true;
  return false;
};

const hasFirstPlayerWon = (board) => {
  if (!isGameEnd(board)) return undefined;
  const pairs = [[6, 2], [0, 5], [3, 8]];
  for (const p of pairs) {

    // first is occupied, second is not from given pair
    if (isNull(board[p[0]]) && isNull(board[p[1]])) {
      return false;
    }
  }
  return true;
};

const moves = {
  removeSymbol: (board, { ctx, events }, idx) => {
    const nextBoard = cloneDeep(board);
    if (ctx.currentPlayer === 0) {
      nextBoard[idx * 3 + 2] = 'removed'
    } else {
      nextBoard[idx * 3] = 'removed'
    }
    events.endTurn();
    if (isGameEnd(nextBoard)) {
      events.endGame({ winnerIndex: hasFirstPlayerWon(nextBoard) ? 0 : 1 });
    }
    return { nextBoard };
  }
}

const rule = <>
  A játék kezdetekor mindkét játékos elé leteszünk három kártyát: az egyik követ, a
másik papírt, a harmadik ollót ábrázol. Ezután a játékosok felváltva elvesznek egy-egy kártyát az
ellenfelük elől, egészen addig, amíg már csak egy-egy kártya marad. Ekkor a megmaradt kártyákat
ütköztetik a „kő-papír-olló” játék szabályai szerint, így eldöntve, hogy ki a győztes; ha mindkét
kártyán ugyanaz van, akkor a Kezdő nyert.
</>;

export const RockPaperScissor = strategyGameFactory({
  rule,
  title: 'Kő-papír-olló',
  BoardClient,
  getPlayerStepDescription: () => 'Távolíts el egy kártyát az ellenfél elől.',
  generateStartBoard: () => Array(9).fill(null),
  moves,
  aiBotStrategy
});
