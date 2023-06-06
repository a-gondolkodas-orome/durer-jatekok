import React from 'react';
import { Link } from 'react-router-dom';
import { Disclosure, Dialog } from '@headlessui/react';

export const GameSidebar = ({
  stepDescription,
  ctx,
  moves
}) => {
  return (
    <div className="p-2 flex flex-col grow shrink-0 basis-64">
      <p className="text-center font-bold text-lg basis-[3.5rem]">
        {getCtaText(ctx)}
      </p>
      {ctx.phase === 'play' && ctx.shouldPlayerMoveNext === false && (
        <div
          v-show="isEnemyMoveInProgress"
          className="animate-spin h-8 w-8 place-self-center border-t-blue-600 rounded-full border-4 mb-[4rem]"
        ></div>
      )}
      {ctx.phase === 'play' && ctx.shouldPlayerMoveNext && (
        <p className="italic text-justify basis-[6rem]">
          {stepDescription}
        </p>
      )}
      {ctx.phase === 'roleSelection' && (
        <span className="basis-[6rem]">
          <button
            className="cta-button js-first-player"
            onClick={() => moves.chooseRole({ isFirst: true })}
          >
            Kezdő leszek
          </button>
          <button
            className="cta-button js-second-player"
            onClick={() => moves.chooseRole({ isFirst: false })}
          >
            Második leszek
          </button>
        </span>
      )}
      <button
        className="cta-button mt-[2vh] js-restart-game"
        onClick={() => moves.startNewGame()}>
        Új játék
      </button>
    </div>
  );
};

export const GameHeader = ({ title }) => {
  return (
  <>
    <header className="flex flex-wrap items-baseline">
      <Link
        to='/'
        className="rounded-lg px-2 md:px-4 bg-blue-400 hover:bg-blue-600 md:basis-44 text-black no-underline"
      >← <span className="hidden md:inline">Vissza a listához</span></Link>
      <h1 className="grow text-blue-600 font-bold pb-4 text-center">
        {title}
      </h1>
      <span className="basis-44 text-right hidden md:inline">
        <a
          href="https://forms.gle/7DwugmXNrvKgkiiu8"
          target="_blank"
          className="px-4"
        >
          Hibabejelentő
        </a>
      </span>
    </header>
    <hr />
  </>);
};

export const GameFooter = () => {
  return (
    <footer className="text-right md:hidden">
      <a
        href="https://forms.gle/7DwugmXNrvKgkiiu8"
        target="_blank"
        className="px-4"
      >
        Hibabejelentő
      </a>
    </footer>
  );
};

export const GameRule = ({ ruleDescription }) => {
  return <section className="flex justify-center mb-4 mt-1 max-w-[100ch]">
    <Disclosure>
      {({ open }) => (
        <div className="border-2 rounded grow">
          <Disclosure.Button className="w-full bg-slate-200 text-xl flex justify-center">
            <span className="grow">Játékszabályok</span>
            { !open && <span className="text-right pr-4">⛛</span>}
            { open && <span className="text-right pr-4" style={{ transform: 'scaleY(-1)' }}>⛛</span>}
          </Disclosure.Button>
            <Disclosure.Panel className="w-full p-2">
              <p className="text-justify">
                {ruleDescription}
              </p>
            </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  </section>;
};

export const GameEndDialog = ({ isOpen, setIsOpen, startNewGame, hasPlayerWon }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="rounded bg-white max-w-sm w-full p-2">
          <header className="flex items-baseline mb-2">
            <Dialog.Title className="grow block text-2xl text-center">
              A játék véget ért
            </Dialog.Title>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-slate-200 rounded text-2xl px-1"
            >×</button>
          </header>
          <Dialog.Description className="text-lg block text-justify">
            {getResultDescription(hasPlayerWon)}
          </Dialog.Description>

          <button onClick={() => startNewGame()} className="cta-button mt-2">
            Új játék
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const getCtaText = ({ phase, shouldPlayerMoveNext, hasPlayerWon }) => {
  if (phase === 'roleSelection') return 'Válassz szerepet, utána indul a játék!';
  if (phase === 'play') return shouldPlayerMoveNext ? 'Te jössz' : 'Mi jövünk';
  if (phase === 'gameEnd') return getResultDescription(hasPlayerWon);
};

const getResultDescription = hasPlayerWon => hasPlayerWon
  ? 'Nyertél. Gratulálunk! :)'
  : 'Sajnos, most nem nyertél, de ne add fel.';
