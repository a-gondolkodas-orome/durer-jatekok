import React from 'react';
import { strategyGameFactory } from '../strategy-game';
import { range, cloneDeep, sample, random } from 'lodash';

const BoardClient = ({ board, ctx, moves }) => {
  const getAngle = (index) => {
    const step = Math.PI*2/board.circle.length;
    return index*step;
  };

  const isAllowedMove = index => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    return isAllowedBank(index);
  }

  const isAllowedBank = index => {
    return getAllowedBanks(board).includes(index);
  }

  const clickBank = (index) => {
    if (!isAllowedMove(index)) return;
    moves.rob(board, index);
  }

  const getBankColor = index => {
    if (index === board.lastMove) return "fill-red-800 stroke-red-600";
    if (board.circle[index] === false) return "fill-red-800";
    if (!isAllowedBank(index)) return "fill-gray-400";
    return "fill-emerald-600";
  }

  return(
    <section className="p-2 shrink-0 grow basis-2/3">
      <svg width="100%" height="100%" viewBox='0 0 110 110'>
      {
        range(board.circle.length).map(index => (
          <line
          key={`${index-1}-${index}`}
          className="stroke-gray-600"
          x1={55+50*Math.cos(getAngle(index))} y1={55+50*Math.sin(getAngle(index))}
          x2={55+50*Math.cos(getAngle(index-1))} y2={55+50*Math.sin(getAngle(index-1))}
          strokeWidth={1.5}
          />
        ))}
    {range(board.circle.length).map(index => (
      <circle
        key={index}
        cx={55+50*Math.cos(getAngle(index))} cy={55+50*Math.sin(getAngle(index))}
        r="4%"
        className={`${getBankColor(index)}`}
        strokeWidth={index === board.lastMove ? "1%" : "0"}
        onClick={() => clickBank(index)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') clickBank(index);
        }}
        tabIndex={isAllowedMove(index) ? 0 : 'none'}
      ></circle>
    ))}
    </svg>
    </section>
  );
};

const moves = {
  rob: (board, { events }, index) => {
    const nextBoard = cloneDeep(board);
    nextBoard.lastMove = index;
    nextBoard.circle[index] = false;
    events.endTurn();
    if (getAllowedBanks(nextBoard).length === 0) {
      events.endGame();
    }
    return { nextBoard };
  }
}

const getAllowedBanks = board => {
  return range(board.circle.length).filter(i => {
    return board.circle[i] && (board.circle.at(i-1) || board.circle[(i+1)%board.circle.length]);
  })
}

const aiBotStrategy = ({ board, moves }) => {
  const allowedBank = sample(getAllowedBanks(board));
  moves.rob(board, allowedBank);
}

const rule = <>
  Bergengócia fővárosában legalább 3 és legfeljebb 10 bank található, melyek körben,
  a Nagykörút mentén helyezkednek el. Két rivális bűnbanda ezen bankok kirablását tervezi,
  mégpedig úgy, hogy felváltva választanak ki egy-egy bankot. Nem választanak ki olyat,
  amit már korábban az egyikük kifosztott, és olyat sem, aminek már mindkét szomszédját kirabolták,
  mert ott már lesben áll a rendőrség. Az a banda veszt, aki már nem talál bankot, amit kirabolhat.
</>;

export const BankRobbersE = strategyGameFactory({
  rule,
  title: 'Bankrablók: 3-10 bank',
  BoardClient,
  getPlayerStepDescription: () => 'Válassz egy kirabolható bankot.',
  generateStartBoard: () => ({
    circle: Array(random(5, 10)).fill(true),
    lastMove: null
  }),
  moves,
  aiBotStrategy
});
