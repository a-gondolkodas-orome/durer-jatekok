import React, { useState } from 'react';
import { range, cloneDeep } from 'lodash';
import { getGameStateAfterMove } from './strategy';
import { SharkSvg } from './assets/shark-chase-shark-svg';
import { SubmarineSvg } from './assets/shark-chase-submarine-svg';

export const BoardClient = ({ board, ctx, events, moves }) => {
  const [chosenPiece, setChosenPiece] = useState(null);

  let possibleMoves=[]
  if (ctx.shouldRoleSelectorMoveNext) {
    if (ctx.chosenRoleIndex === 1) {
      possibleMoves = range(16).filter(i => distance(board.shark, i) <= 1)
    } else if (ctx.turnStage === 'movePiece') {
      possibleMoves = range(16).filter(i => distance(chosenPiece, i) === 1)
    }
  }

  const isAllowed_choosePiece = (id) => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    if (ctx.chosenRoleIndex === 0) return board.submarines[id] >= 1;
    if (ctx.chosenRoleIndex === 1) return board.shark === id;
  }

  const isAllowed_movePiece = (id) => {
    if (!ctx.shouldRoleSelectorMoveNext) return false;
    if (ctx.chosenRoleIndex === 0) return distance(chosenPiece, id) === 1;
    if (ctx.chosenRoleIndex === 1) return distance(board.shark, id) <= 1;
  }

  const clickField = (id) => {
    if (ctx.chosenRoleIndex === 0) {
      if (ctx.turnStage === 'choosePiece') {
        if (!isAllowed_choosePiece(id)) return;
        setChosenPiece(id)
        events.setTurnStage('movePiece');
      } else if (ctx.turnStage === 'movePiece') {
        if (!isAllowed_movePiece(id)) {
          if (id === chosenPiece) {
            events.setTurnStage('choosePiece');
            setChosenPiece(null);
          }
          return;
        };
        const nextBoard = cloneDeep(board);
        nextBoard.submarines[chosenPiece] -= 1;
        nextBoard.submarines[id] += 1;
        nextBoard.turn += 1;
        setChosenPiece(null);
        events.setTurnStage('choosePiece');
        moves.setBoard(nextBoard);
        const { isGameEnd, winnerIndex } = getGameStateAfterMove(nextBoard);
        events.endTurn();
        if (isGameEnd) {
          events.endGame({ winnerIndex });
        }
      }
    }
    if (ctx.chosenRoleIndex === 1) {
      if (!isAllowed_movePiece(id)) return;
      const nextBoard = cloneDeep(board);
      nextBoard.shark = id;
      if (ctx.turnStage !== 'secondSharkMove') {
        if (nextBoard.submarines[id] >= 1) {
          // instant lose
          moves.setBoard(nextBoard);
          const { isGameEnd, winnerIndex } = getGameStateAfterMove(nextBoard);
          events.endTurn();
          if (isGameEnd) {
            events.endGame({ winnerIndex });
          }
          return;
        }
        if (id !== board.shark) {
          moves.setBoard(nextBoard);
          events.setTurnStage('secondSharkMove');
          return;
        }
      }

      nextBoard.turn += 1;
      setChosenPiece(null);
      events.setTurnStage('firstSharkMove');
      moves.setBoard(nextBoard);
      const { isGameEnd, winnerIndex } = getGameStateAfterMove(nextBoard);
      events.endTurn();
      if (isGameEnd) {
        events.endGame({ winnerIndex });
      }
    }
  };

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
    <p className='font-bold text-lg'>Hátralévő lépések száma: {12-board.turn}</p>
    <SubmarineSvg/>
    <SharkSvg/>
    <div className="grid grid-cols-4 gap-0 border-2">
      {range(16).map(id => (
        <button
          key={id}
          onClick={() => clickField(id)}
          disabled={!isAllowed_choosePiece(id) && !isAllowed_movePiece(id)}
          className={`
            aspect-square p-[0%] border-2 relative flex justify-center items-center
            ${possibleMoves.includes(id) && ctx.chosenRoleIndex === 1 && board.submarines[id] && 'border-red-600'}
          `}
        >
          {possibleMoves.includes(id) && ctx.chosenRoleIndex === 0 && (
            <OptionalNextSubmarine existingSubmarineCount={board.submarines[id]} />
          )}
          {possibleMoves.includes(id) && ctx.chosenRoleIndex === 1 && (
            <OptionalNextShark />
          )}
          {board.submarines[id] >= 1 && (
            <SubmarinesInCell count={board.submarines[id]} />
          )}
          {board.shark === id && (
            <svg className="aspect-square top-0 absolute z-10 opacity-80">
              <use xlinkHref="#shark" />
            </svg>
          )}
          {board.shark === id && ctx.chosenRoleIndex === 1 && ctx.shouldRoleSelectorMoveNext && (
            <span
              className="absolute z-50 w-[75%] text-black border-2 rounded bg-white opacity-80"
            >Itt maradok</span>
          )}
      </button>
      ))}
    </div>
  </section>
  );
};

const distance = (fieldA, fieldB) => {
  if (fieldA === null || fieldB === null) return null;
  return (
    Math.abs((fieldA % 4) - (fieldB % 4)) +
    Math.abs(Math.floor(fieldA / 4) - Math.floor(fieldB / 4))
  );
};

const OptionalNextShark = () => {
  return <svg className="aspect-square top-0 absolute z-40 opacity-50">
    <use xlinkHref="#shark" />
  </svg>;
};

const OptionalNextSubmarine = ({ existingSubmarineCount }) => {
  return <>
    {(existingSubmarineCount === 1) && (
      <svg className="aspect-square top-[10%] absolute z-40 opacity-50">
        <use xlinkHref="#submarine" />
      </svg>
    )}
    {(existingSubmarineCount !== 1) && (
      <svg className="aspect-square top-0 absolute z-40 opacity-50">
        <use xlinkHref="#submarine" />
      </svg>
    )}
  </>;
};

const SubmarinesInCell = ({ count }) => {
  return <>
    {count === 1 && (
      <svg className="aspect-square top-0 absolute z-20 opacity-80">
        <use xlinkHref="#submarine" />
      </svg>
    )}
    {count === 2 && (
      <>
        <svg className="aspect-square top-[-10%] absolute z-20 opacity-80">
          <use xlinkHref="#submarine" />
        </svg>
        <svg className="aspect-square top-[10%] absolute z-20 opacity-80">
          <use xlinkHref="#submarine" />
        </svg>
      </>
    )}
    {count === 3 && (
      <>
        <svg className="aspect-square top-[-10%] absolute z-20 opacity-80">
          <use xlinkHref="#submarine" />
        </svg>
        <svg className="aspect-square top-0 absolute z-20 opacity-80">
          <use xlinkHref="#submarine" />
        </svg>
        <svg className="aspect-square top-[10%] absolute z-20 opacity-80">
          <use xlinkHref="#submarine" />
        </svg>
      </>
    )}
  </>;
};
