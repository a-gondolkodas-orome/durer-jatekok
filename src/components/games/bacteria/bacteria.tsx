import { useState } from "react";
import { range, random, sample } from "lodash";
import { strategyGameFactory, type BoardClientProps, GameBoard } from "../../game-factory";
import { smartBotStrategy, randomBotStrategy } from "./bot-strategy";
import {
  isJump,
  isSpread,
  isShiftRight,
  isShiftLeft,
  isAllowedAttackClick,
  moves
} from "./helpers";
import type { Board } from "./danger";

const rowCount = 9;

const emptyBacteria = (boardWidth: number): number[][] =>
  range(rowCount).map(rowIndex => Array(rowIndex % 2 === 0 ? boardWidth : boardWidth - 1).fill(0));

// "Adjacent goals" sub-game: goals form a contiguous block in the top row.
const generateAdjacentStartBoard = (): Board => {
  const bacteria = emptyBacteria(11);

  const boardVariantId = random(1, 8);
  switch (boardVariantId) {
    case 1: {
      [2, 4, 6, 8].forEach(b => bacteria[2][b] = 1);
      return { bacteria, goals: [3, 4, 5, 6, 7] };
    }
    case 2: {
      [3, 5, 7].forEach(b => bacteria[2][b] = 1);
      return { bacteria, goals: [3, 4, 5, 6, 7] };
    }
    case 3: {
      [1, 2, 3, 4].forEach(b => bacteria[1][b] = 1);
      return { bacteria, goals: [0, 1, 2, 3, 4, 5] };
    }
    case 4: {
      [0, 1, 3].forEach(b => bacteria[2][b] = 1);
      return { bacteria, goals: [0, 1, 2, 3, 4, 5] };
    }
    case 5: {
      [2, 3, 7, 9].forEach(b => bacteria[0][b] = 1);
      return { bacteria, goals: range(0, 11) };
    }
    case 6: {
      [1, 2, 4, 8].forEach(b => bacteria[0][b] = 1);
      return { bacteria, goals: range(0, 11) };
    }
    case 7: {
      [5, 6, 7, 8].forEach(b => bacteria[1][b] = 1);
      return { bacteria, goals: [5, 6, 7, 8, 9, 10] };
    }
    case 8: {
      [7, 9, 10].forEach(b => bacteria[2][b] = 1);
      return { bacteria, goals: [5, 6, 7, 8, 9, 10] };
    }
  }
  throw new Error('unreachable');
};

// "Scattered goals" sub-game: goals (top row) are not necessarily adjacent.
// Curated positions keep each side winning roughly half the time; verified in
// bot-strategy.spec.ts.
const scatteredStartConfigs: { starts: number[], goals: number[] }[] = [
  // attacker-winning
  { starts: [0, 1, 5, 8, 15], goals: [2, 5, 7, 8] },
  { starts: [1, 3, 4, 8, 11, 14], goals: [0, 5, 8, 12, 14] },
  { starts: [3, 7, 9, 12], goals: [4, 5, 9, 10, 11, 13] },
  { starts: [2, 5, 6, 14, 16], goals: [1, 5, 7, 8, 11] },
  { starts: [2, 5, 6, 8, 12, 16], goals: [3, 8, 9, 10, 13, 16] },
  // defender-winning
  { starts: [2, 5, 12, 16], goals: [4, 6, 7, 11, 12] },
  { starts: [3, 5, 9, 12], goals: [2, 3, 5, 13, 16] },
  { starts: [1, 8, 9, 10], goals: [3, 9, 13, 16] },
  { starts: [0, 4, 5, 11, 12, 13], goals: [4, 7, 10, 12] },
  { starts: [1, 3, 4, 11, 12, 15], goals: [1, 4, 5, 10, 12, 16] }
];

const generateScatteredStartBoard = (): Board => {
  const bacteria = emptyBacteria(17);
  const { starts, goals } = sample(scatteredStartConfigs)!;
  starts.forEach(col => { bacteria[0][col] = 1; });
  return { bacteria, goals };
};

// Test variant covers both sub-games.
const generateTestStartBoard = (): Board =>
  sample([generateAdjacentStartBoard, generateScatteredStartBoard])!();

const BacteriaDisplay = ({ count, onGoal, dimmed = false }) => {
  if (count === 0) return null;
  const dotColor = dimmed
    ? "bg-transparent border-2 border-green-500"
    : onGoal ? "bg-green-300" : "bg-green-600";
  const sizeClass = count === 1 ? "w-[45%]" : count <= 4 ? "w-[35%]" : "w-[25%]";
  return (
    <div className="flex flex-wrap justify-center items-center gap-[4%] p-[8%] w-full h-full">
      {range(count).map(i => (
        <div key={i} className={`${dotColor} ${sizeClass} rounded-full aspect-square`} />
      ))}
    </div>
  );
};

const GoalMarker = () => (
  <span className="text-base leading-none">🚩</span>
);

// Board-driven: reads its width from the board, so it renders any goal layout.
const BoardClient = ({ board: { bacteria, goals }, ctx, moves }: BoardClientProps<Board>) => {
  const [attackRow, setAttackRow] = useState<number | null>(null);
  const [attackCol, setAttackCol] = useState<number | null>(null);

  const boardWidth = bacteria[0].length;

  const isPlayerAttacker = ctx.currentPlayer === 0;

  const isAllowedAttack = ({ row, col }) => {
    if (bacteria[row][col] === undefined) return false;
    return isAllowedAttackClick({ attackRow, attackCol, row, col });
  };

  const isGoal = ({ row, col }) => row === (bacteria.length - 1) && goals.includes(col);

  const clickField = ({ row, col }) => {
    if (!ctx.isClientMoveAllowed) return;
    if (attackRow === null && !(bacteria[row][col] >= 1)) return;
    if (isPlayerAttacker && attackRow === row && attackCol === col) {
      setAttackRow(null);
      setAttackCol(null);
      return;
    }
    if (attackRow !== null && !isAllowedAttack({ row, col })) return;

    if (isPlayerAttacker && attackRow === null) {
      setAttackRow(row);
      setAttackCol(col);
      return;
    }

    if (!isPlayerAttacker) {
      moves.defend({ bacteria, goals }, { row, col });
      return;
    }

    const attack = { attackRow, attackCol, row, col };
    if (isJump(attack)) {
      moves.jump({ bacteria, goals }, { row: attackRow, col: attackCol });
    }
    if (isSpread(attack)) {
      moves.spread({ bacteria, goals }, { row: attackRow, col: attackCol });
    }
    if (isShiftRight(attack)) {
      moves.shiftRight({ bacteria, goals }, { row: attackRow, col: attackCol });
    }
    if (isShiftLeft(attack)) {
      moves.shiftLeft({ bacteria, goals }, { row: attackRow, col: attackCol });
    }

    setAttackRow(null);
    setAttackCol(null);
  };

  const rowShift = row => row % 2 === 0 ? "0px" : `${100 / (2 * boardWidth)}%`;

  const isForbidden = ({ row, col }) => {
    if (attackRow !== null && row === attackRow && col === attackCol) return false;
    if (attackRow !== null && !isAllowedAttack({ row, col })) return true;
    if (attackRow === null && bacteria[row][col] < 1) return true;
    return false;
  };

  const isEdgeCell = ({ row, col }) => row % 2 === 1 && col === boardWidth - 1;

  const isDisabled = ({ row, col }) => (
    !ctx.isClientMoveAllowed
    || isForbidden({ row, col })
    || isEdgeCell({ row, col })
  );

  const cellClassName = ({ row, col }) => {
    if (isEdgeCell({ row, col })) return "aspect-4/3 w-full";
    const isSelected = row === attackRow && col === attackCol;
    const isValidTarget = attackRow !== null && isAllowedAttack({ row, col });
    const goal = isGoal({ row, col });
    let bg, border;
    if (isSelected) {
      bg = "bg-yellow-200"; border = "border-yellow-500";
    } else if (isValidTarget) {
      bg = "bg-amber-300"; border = "border-amber-500";
    } else if (goal) {
      bg = "bg-blue-700"; border = "border-blue-900";
    } else {
      bg = "bg-amber-100"; border = "border-stone-400";
    }
    const isDefenderTarget = !isPlayerAttacker && ctx.isClientMoveAllowed && bacteria[row][col] >= 1;
    return [
      "aspect-4/3 w-full border-2 rounded-sm flex items-center justify-center",
      bg,
      border,
      isForbidden({ row, col }) ? "opacity-50" : "",
      isDefenderTarget ? "enabled:hocus:bg-red-100 enabled:hocus:border-red-400" : ""
    ].filter(Boolean).join(" ");
  };

  const cellContent = ({ row, col }) => {
    if (isEdgeCell({ row, col })) return null;
    const count = bacteria[row][col] || 0;
    const goal = isGoal({ row, col });
    if (attackRow !== null && isAllowedAttack({ row, col })) {
      const attack = { attackRow, attackCol, row, col };
      const previewCount = isJump(attack) ? 1 : bacteria[attackRow!][attackCol!];
      return <BacteriaDisplay count={previewCount} onGoal={goal} dimmed />;
    }
    if (count > 0) return <BacteriaDisplay count={count} onGoal={goal} />;
    if (goal) return <GoalMarker />;
    return null;
  };

  return (
    <GameBoard>
      <table
        className="w-[95%] table-fixed"
        style={{ transform: "scaleY(-1)" }}
      >
        <tbody>
          {range(bacteria.length).map((row) => (
            <tr
              style={{ transform: `translateX(${rowShift(row)})`}}
              key={row}
            >
              {range(boardWidth).map((col) => (
                <td key={col}>
                  <button
                    disabled={isDisabled({ row, col })}
                    onClick={() => clickField({ row, col })}
                    className={cellClassName({ row, col })}
                    style={{ transform: "scaleY(-1)" }}
                  >
                    {cellContent({ row, col })}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </GameBoard>
  );
};

const getPlayerStepDescription = ({ ctx }) => {
  if (ctx.currentPlayer === 0) {
    return {
      hu: "Kattints egy mezőre, amin van baktérium és hajtsd végre " +
        "a három lehetséges támadás egyikét egy további szabályos kattintással.",
      en: "Click on a square with bacteria and perform one of the three possible attacks with a second valid click."
    };
  } else {
    return {
      hu: "Kattints egy mezőre, amin van baktérium, hogy eltávolíts egy bakériumot onnan.",
      en: "Click on a square with bacteria to remove one bacterium from it."
    };
  }
};

const ruleBody = (goalsClause: { hu: string; en: string }) => ({
  hu: <>
    A zöld körökkel jelölt mezőkön (a tábla alsó sorában) baktériumok találhatók,
    a tábla felső sorában {goalsClause.hu} mezők a CÉL mezők.
    A játékban egy Támadó és Védekező játékos felváltva lép. A Védekező játékos
    minden körében levesz pontosan 1 baktériumot bármely általa választott mezőről.
    A Támadó játékos a következő háromféle lépés egyikét választhatja:
    <br />
    1. Egy mezőn lévő összes baktériummal egyszerre balra vagy jobbra lép egyet.
    <br />
    2. Egyetlen baktériummal előre ugrik két sornyit.
    <br />
    3. Kijelöl egy mezőt, ahol végbemegy a sejtosztódás. Ekkor az ezen mezőn
    lévő összes baktérium osztódik: és mindegyikből egy-egy példány balra előre,
    ill. jobbra előre lép.
    <br />A Támadó akkor nyer, ha legalább egy baktérium bejut valamelyik CÉL
    mezőbe; a Védekező pedig akkor, ha az összes baktérium eltűnt a pályáról.
  </>,
  en: <>
    Squares with green dots (in the bottom row) contain bacteria; the marked squares
    in the top row {goalsClause.en} are GOAL squares.
    An Attacker and a Defender take turns. On each turn the
    Defender removes exactly 1 bacterium from any square of their choice.
    The Attacker chooses one of the following three moves:
    <br />
    1. Move all bacteria on one square one step left or right.
    <br />
    2. Move a single bacterium forward by two rows (a jump).
    <br />
    3. Select a square where cell division occurs: every bacterium on that square divides, and
    one copy moves diagonally forward-left and one copy moves diagonally forward-right.
    <br />The Attacker wins if at least one bacterium reaches a GOAL square; the Defender wins
    if all bacteria are removed from the board.
  </>
});

const rule = ruleBody({ hu: 'megjelölt', en: '' });
const adjacentRule = ruleBody({ hu: 'megjelölt (szomszédos)', en: '— which are adjacent —' });
const scatteredRule = ruleBody({ hu: 'megjelölt (nem feltétlenül szomszédos)', en: '— not necessarily adjacent —' });

const roleLabels: [{ hu: string; en: string }, { hu: string; en: string }] = [
  { hu: "Támadó", en: "Attacker" },
  { hu: "Védekező", en: "Defender" }
];

export const Bacteria = strategyGameFactory({
  presentation: {
    rule,
    roleLabels,
    getPlayerStepDescription
  },
  BoardClient,
  gameplay: { moves },
  variants: [
    {
      botStrategy: randomBotStrategy,
      generateStartBoard: generateTestStartBoard,
      label: { hu: 'Teszt', en: 'Test' }
    },
    // smart bot: verified as optimal (danger.ts solver; handles any goal layout)
    {
      botStrategy: smartBotStrategy,
      generateStartBoard: generateAdjacentStartBoard,
      rule: adjacentRule,
      label: { hu: 'Szomszédos', en: 'Adjacent' },
      isDefault: true
    },
    {
      botStrategy: smartBotStrategy,
      generateStartBoard: generateScatteredStartBoard,
      rule: scatteredRule,
      label: { hu: 'Szórt', en: 'Scattered' }
    }
  ]
});
