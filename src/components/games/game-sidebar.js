export const GameSidebar = ({
  ctaText,
  stepDescription,
  ctx,
  moves
}) => {
  return (
    <div className="p-2 flex flex-col grow shrink-0 basis-64">
      <p className="text-center font-bold text-lg basis-[3.5rem]">{ctaText}</p>
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
