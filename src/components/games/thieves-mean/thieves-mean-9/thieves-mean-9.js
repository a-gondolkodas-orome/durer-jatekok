import React from 'react';
import { strategyGameFactory } from '../../strategy-game';
import { range, cloneDeep, difference } from 'lodash';
import { aiBotStrategy } from './bot-strategy';

const BoardClient = ({ board, ctx, moves }) => {
  const isAllowedMove = index => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    return isAllowedCard(index);
  }

  const isAllowedCard = index => {
    return !board.thiefCards.includes(index) && !board.sheriffCards.includes(index)
  }

  const clickCard = (index) => {
    if (!isAllowedMove(index)) return;
    moves.takeCard(board, index);
  }

  const getCardColor = num => {
    if (board.thiefCards.includes(num)) return 'bg-red-600';
    if (board.sheriffCards.includes(num)) return 'bg-blue-600';
    return 'bg-white';
  }

  return(
    <section className="p-2 shrink-0 basis-2/3">
      <div>
        {range(1, 10).map(num =>
        <button
          key={num}
          disabled={!isAllowedMove(num)}
          onClick={() => clickCard(num)}
          className={`
            m-1 min-h-28 w-18
            border-2 shadow-md border-slate-800 rounded-xl text-4xl
            text-center font-bold
            ${ctx.chosenRoleIndex === 1
              ? "enabled:hover:bg-red-400 enabled:focus:bg-red-400"
              : "enabled:hover:bg-blue-400 enabled:focus:bg-blue-400"
            }
            ${getCardColor(num)}
          `}
        >
          {num}
        </button>)}
      </div>
    </section>
    );
};

const moves = {
  takeCard: (board, { ctx, events }, idx) => {
    const nextBoard = cloneDeep(board);

    if (ctx.currentPlayer === 0) {
      nextBoard.sheriffCards.push(idx);
    }
    else {
      nextBoard.thiefCards.push(idx);
    }
    nextBoard.numTurns += 1;
    if (nextBoard.numTurns === 8) {
      nextBoard.sheriffCards.push(findLast(nextBoard)[0]);
      const winner = getWinner(nextBoard.thiefCards);
      events.endGame({ winnerIndex: winner });
    }
    events.endTurn();
    return { nextBoard };
  }
}

const findLast = (board) => {
  return difference(
    range(1, 10),
    [...board.thiefCards, ...board.sheriffCards]
  );
}

const rule = <>
    <b>Nyomozó és Tolvaj</b> az alábbi játékot játssza. Kilenc kártya van az asztalon lévő készletben,
    az 1, 2, ..., 9 számokkal jelölve. Nyomozó és Tolvaj felváltva vesz a kezébe egyet-egyet
    az asztalon lévő kártyák közül úgy, hogy az első kártyát Nyomozó veszi el.
    Tolvaj akkor nyer, ha a játék végéig összegyűjt három olyan kártyát, melyek közül az egyiken
lévő szám a másik kettőnek az átlaga. Nyomozó pedig akkor nyer, ha Tolvaj nem gyűjt össze
három ilyen kártyát.
    <br></br>
</>;

const generateStartBoard = () => {
  return {
    thiefCards: [],
    sheriffCards: [],
    numTurns: 0
  };
}

const getWinner = (thiefCards) => {
  const thiefCardsSort = thiefCards.slice().sort((a, b) => a - b);
  for (let a = 0; a <= 3; a++) {
    for (let b = a + 1; b <= 3; b++) {
      for (let c = b + 1; c <= 4; c++) {
        const valA = thiefCardsSort[a];
        const valB = thiefCardsSort[b];
        const valC = thiefCardsSort[c];
        if (valA + valC === 2 * valB) {
          return 1;
        }
      }
    }
  }
  return 0;
}

export const ThievesMean9 = strategyGameFactory({
  rule,
  title: 'Tolvajnál átlag (1-9)',
  BoardClient,
  getPlayerStepDescription: () => 'Válassz egy kártyát.',
  roleLabels: ['Nyomozó leszek', 'Tolvaj leszek'],
  generateStartBoard,
  moves,
  aiBotStrategy
});
