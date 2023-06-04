import React, { useState, useRef } from 'react';
import { GameRule } from '../game-rule';
import { GameSidebar } from '../game-sidebar';

const rule = <>
  <span className='text-slate-600'>Ez egy példa játék.</span>

  A kezdőállás ismeretében te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

export const Demonstration = () => {
  const [phase, setPhase] = useState('roleSelection');
  const [playerIndex, setPlayerIndex] = useState(null);
  const [next, setNext] = useState(null);

  const turn = useRef(0);

  const shouldPlayerMoveNext = (phase === 'play' && next === playerIndex);

  const ctaText = (() => {
    if (phase === 'roleSelection') return 'Válassz szerepet, utána indul a játék!';
    if (phase === 'play') return shouldPlayerMoveNext ? 'Te jössz' : 'Mi jövünk';
    if (phase === 'gameEnd') return turn.current === 5 ? 'Gratulálunk, nyertél!' : 'Sajnos vesztettél';
  })();

  const makeAiMove = () => {
    turn.current += 1;
    const time = Math.floor(Math.random() * 750 + 750);
    setTimeout(() => {
      setNext(next => 1 - next);
    }, time);
  };

  const endPlayerTurn = () => {
    turn.current += 1;
    if (turn.current >= 5) {
      setPhase('gameEnd');
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
  };

  return (
  <div className="flex justify-center">
    <div className="max-w-[100ch] w-full">
      <GameRule ruleDescription={rule} />
      <div className="flex flex-wrap">
        <section className="p-2 shrink-0 grow basis-2/3">
          {shouldPlayerMoveNext && (
            <button
              className="cta-button"
              onClick={endPlayerTurn}
            >Lépek!</button>
          )}
        </section>
        <GameSidebar
          stepDescription={'Kattints a \'Lépek\' gombra, hogy lépj.'}
          ctaText={ctaText}
          ctx={{ phase, shouldPlayerMoveNext }}
          moves={{ chooseRole, startNewGame }}
        />
      </div>
    </div>
  </div>
  );
};
