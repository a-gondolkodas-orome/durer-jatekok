import { getBoardIndices } from "./helpers";

/* This strategy file is relevant for the 4x7 case */
const [ROWS, COLS] = [4, 7];
const [DUCK] = [1, 2];

const flipH = ([r, c]) => [ROWS - 1 - r, c];
const flipV = ([r, c]) => [r, COLS - 1 - c];

const boardIndices = getBoardIndices(ROWS, COLS);

export const getOptimalThirdStep = (board) => {
  const ducks = boardIndices.filter(({ row, col }) => board[row][col] === DUCK);
  const [r1, c1, r2, c2] = [ducks[0]['row'], ducks[0]['col'], ducks[1]['row'], ducks[1]['col']];

  const equivalentPositions = [
    { 'ducks': [[r1, c1], [r2, c2]], type: 'original' }
  ];

  // vertical flip
  let mb1 = flipV([r1, c1]);
  let mb2 = flipV([r2, c2]);
  equivalentPositions.push({ 'ducks': [mb1, mb2], type: 'flipV' });
  equivalentPositions.push({ 'ducks': [mb2, mb1], type: 'flipV' });

  // rotate 180
  mb1 = flipH(mb1);
  mb2 = flipH(mb2);
  equivalentPositions.push({ 'ducks': [mb1, mb2], type: 'rotate180' });
  equivalentPositions.push({ 'ducks': [mb2, mb1], type: 'rotate180' });

  // horizontal flip
  mb1 = flipV(mb1);
  mb2 = flipV(mb2);
  equivalentPositions.push({ 'ducks': [mb1, mb2], type: 'flipH' });
  equivalentPositions.push({ 'ducks': [mb2, mb1], type: 'flipH' });

  const pos = equivalentPositions.find(({ ducks: [[r1, c1], [r2, c2]] }) =>
    aiOptimalThirdSteps[`${r1};${c1} - ${r2};${c2}`] !== undefined
  )

  if (pos !== undefined) {
    const ducks = pos['ducks'];
    const optimalStep =  aiOptimalThirdSteps[`${ducks[0][0]};${ducks[0][1]} - ${ducks[1][0]};${ducks[1][1]}`]
    const transformedStep = invertTransformation(
      [optimalStep['row'], optimalStep['col']],
      pos['type']
    );
    return { row: transformedStep[0], col: transformedStep[1] };
  } {
    return undefined;
  }
};

const invertTransformation = (stepCoords, type) => {
  switch (type) {
    case 'original': return stepCoords;
    case 'flipV': return flipV(stepCoords);
    case 'rotate180': return flipV(flipH(stepCoords));
    case 'flipH': return flipH(stepCoords);
  }
};

// see scripts/pre-generate-ai-moves/chess-ducks-optimal-2nd-moves.cjs
export const aiOptimalSecondSteps = {
  '0;0': { row: 0, col: 6 },
  '0;1': { row: 3, col: 1 },
  '0;2': { row: 3, col: 1 },
  '0;3': { row: 1, col: 6 },
  '0;4': { row: 2, col: 4 },
  '0;5': { row: 2, col: 5 },
  '0;6': { row: 2, col: 2 },
  '1;0': { row: 3, col: 1 },
  '1;1': { row: 3, col: 5 },
  '1;2': { row: 1, col: 0 },
  '1;3': { row: 2, col: 4 },
  '1;4': { row: 3, col: 2 },
  '1;5': { row: 2, col: 0 },
  '1;6': { row: 2, col: 3 },
  '2;0': { row: 3, col: 3 },
  '2;1': { row: 2, col: 4 },
  '2;2': { row: 3, col: 1 },
  '2;3': { row: 3, col: 1 },
  '2;4': { row: 3, col: 3 },
  '2;5': { row: 1, col: 0 },
  '2;6': { row: 3, col: 4 },
  '3;0': { row: 1, col: 4 },
  '3;1': { row: 0, col: 1 },
  '3;2': { row: 2, col: 1 },
  '3;3': { row: 2, col: 4 },
  '3;4': { row: 0, col: 2 },
  '3;5': { row: 2, col: 0 },
  '3;6': { row: 2, col: 5 }
};

// see scripts/pre-generate-ai-moves/chess-ducks-optimal-3rd-moves.cjs
const aiOptimalThirdSteps = {
  '0;0 - 0;2': { row: 1, col: 5 },
  '0;0 - 0;3': { row: 3, col: 2 },
  '0;0 - 0;4': { row: 3, col: 0 },
  '0;0 - 0;5': { row: 3, col: 0 },
  '0;0 - 1;2': { row: 0, col: 4 },
  '0;0 - 1;3': { row: 3, col: 0 },
  '0;0 - 1;4': { row: 2, col: 1 },
  '0;0 - 1;5': { row: 3, col: 6 },
  '0;0 - 1;6': { row: 1, col: 2 },
  '0;0 - 2;1': { row: 3, col: 6 },
  '0;0 - 2;2': { row: 3, col: 0 },
  '0;0 - 2;3': { row: 1, col: 5 },
  '0;0 - 2;5': { row: 1, col: 2 },
  '0;0 - 2;6': { row: 3, col: 0 },
  '0;0 - 3;0': { row: 1, col: 5 },
  '0;0 - 3;2': { row: 0, col: 3 },
  '0;0 - 3;4': { row: 3, col: 0 },
  '0;0 - 3;5': { row: 3, col: 0 },
  '0;0 - 3;6': { row: 1, col: 5 },
  '0;2 - 0;4': { row: 2, col: 3 },
  '0;2 - 1;4': { row: 3, col: 3 },
  '0;2 - 1;5': { row: 3, col: 0 },
  '0;2 - 2;1': { row: 1, col: 5 },
  '0;2 - 2;3': { row: 0, col: 6 },
  '0;2 - 2;5': { row: 3, col: 0 },
  '0;2 - 3;2': { row: 1, col: 5 },
  '0;2 - 3;3': { row: 3, col: 0 },
  '0;3 - 1;1': { row: 2, col: 4 },
  '0;3 - 2;0': { row: 2, col: 4 },
  '0;3 - 2;2': { row: 1, col: 5 },
  '1;0 - 1;4': { row: 0, col: 6 },
  '1;1 - 1;3': { row: 3, col: 0 },
  '1;1 - 1;5': { row: 3, col: 6 },
  '1;1 - 2;2': { row: 3, col: 0 },
  '1;1 - 2;3': { row: 0, col: 4 },
  '1;1 - 2;4': { row: 0, col: 3 },
  '1;1 - 2;5': { row: 0, col: 4 }
};
