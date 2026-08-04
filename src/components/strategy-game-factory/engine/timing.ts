// One beat: long enough to follow what happened, short enough not to stall the
// game. Paces the moves of a bot's multi-phase turn and the auto endOfTurnMove,
// and — through useDeferredMove — the second half of a human turn that one
// click submits whole.
export const STEP_DELAY = 750;
