import React, { useState, useRef } from 'react';
import {
  GameSidebar, GameFooter, GameHeader, GameRule, GameEndDialog
} from '../game-parts';

const rule = <>
  <span className='text-slate-600'>Ez egy példa játék.</span>

  A kezdőállás ismeretében te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

export const Demonstration = () => {
  const [phase, setPhase] = useState('roleSelection');
  const [playerIndex, setPlayerIndex] = useState(null);
  const [next, setNext] = useState(null);
  const [isGameEndDialogOpen, setIsGameEndDialogOpen] = useState(false);

  const turn = useRef(0);
  const hasPlayerWon = phase === 'gameEnd' && turn.current === 5;

  const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);

  const makeAiMove = () => {
    turn.current += 1;
    const time = Math.floor(Math.random() * 250 + 250);
    setTimeout(() => {
      setNext(next => 1 - next);
    }, time);
  };

  const endPlayerTurn = () => {
    turn.current += 1;
    if (turn.current >= 5) {
      setPhase('gameEnd');
      setIsGameEndDialogOpen(true);
      return;
    }
    setNext(next => 1 - next);
    makeAiMove();
  };

  const chooseRole = ({ isFirst }) => {
    setPhase('play');
    setNext(0);
    if (isFirst) {
      setPlayerIndex(0);
    } else {
      setPlayerIndex(1);
      makeAiMove();
    }
  };

  const startNewGame = () => {
    turn.current = 0;
    setPhase('roleSelection');
    setPlayerIndex(null);
    setNext(null);
    setIsGameEndDialogOpen(false);
  };

  const GameBoard = () => (
    <section className="p-2 shrink-0 grow basis-2/3">
      {shouldPlayerMoveNext && (
        <button
          className="cta-button"
          onClick={endPlayerTurn}
        >Lépek!</button>
      )}
    </section>
  );

  return (
  <main className="p-2">
    <GameHeader title='Példa játék' />
    <div className="flex justify-center">
      <div className="max-w-[100ch] w-full">
        <GameRule ruleDescription={rule} />
        <div className="flex flex-wrap">
          <GameBoard />
          <GameSidebar
            stepDescription={'Kattints a \'Lépek\' gombra, hogy lépj.'}
            ctx={{ phase, shouldPlayerMoveNext, hasPlayerWon }}
            moves={{ chooseRole, startNewGame }}
          />
        </div>
      </div>
    </div>
    <GameFooter />
    <GameEndDialog
      isOpen={isGameEndDialogOpen}
      setIsOpen={setIsGameEndDialogOpen}
      startNewGame={startNewGame}
      hasPlayerWon={hasPlayerWon}
    />
  </main>
  );
};
