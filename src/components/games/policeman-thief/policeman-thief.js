import React, { useState } from "react";
import { range, random } from "lodash";
import { strategyGameFactory } from "../strategy-game";
import { getGameStateAfterAiTurn, getGameStateAfterMove } from "./strategy";

const generateNewBoard = () => {
  const blueStartPosition = random(0, 7);
  let redStartPosition = random(0, 7);
  while (blueStartPosition === redStartPosition) {
    redStartPosition = random(0, 7);
  }
  return {
    turnCount: 0,
    blue1: blueStartPosition, // Start positions for blue pieces
    blue2: blueStartPosition,
    red: redStartPosition // Start position for red piece
  };
};

const cubeCoords = [
  { cx: "30%", cy: "30%" },
  { cx: "30%", cy: "70%" },
  { cx: "70%", cy: "30%" },
  { cx: "70%", cy: "70%" },
  { cx: "10%", cy: "10%" },
  { cx: "10%", cy: "90%" },
  { cx: "90%", cy: "10%" },
  { cx: "90%", cy: "90%" }
];

const neighbours = {
  0: [1, 2, 4],
  1: [0, 3, 5],
  2: [0, 3, 6],
  3: [1, 2, 7],
  4: [0, 5, 6],
  5: [1, 4, 7],
  6: [2, 4, 7],
  7: [3, 5, 6]
};

const isAllowedStep = (currentVertex, targetVertex) => {
  if (
    !neighbours[currentVertex] ||
    !neighbours[currentVertex].includes(targetVertex)
  ) return false;
  return true;
};

const GameBoard = ({ board, setBoard, ctx }) => {
  const currentPlayer = () => {
    return ctx.playerIndex === 0 ? "blue" : "red";
  };

  const [isBlue1Moved, setIsBlue1Moved] = useState(false);
  const [isBlue2Moved, setIsBlue2Moved] = useState(false);
  const [turnStage, setTurnStage] = useState("choose");

  const handleMove = (circle, targetVertex, currentVertex) => {
    if (!isAllowedStep(currentVertex, targetVertex, board.board)) {
      return null;
    }

    const newboard = { ...board, ...circle };
    if (currentPlayer() === "red") {
      newboard.turnCount++;
      ctx.endPlayerTurn(getGameStateAfterMove(newboard));
    } else {
      let isTurnEnd = false;
      setBoard(newboard);
      setTurnStage("choose");
      if (currentVertex === board.blue1) {
        setIsBlue1Moved(true);
        if (isBlue2Moved) {
          isTurnEnd = true;
        }
      } else if (currentVertex === board.blue2) {
        setIsBlue2Moved(true);
        if (isBlue1Moved) {
          isTurnEnd = true;
        }
      }
      if (isTurnEnd) {
        newboard.turnCount++;
        setIsBlue1Moved(false);
        setIsBlue2Moved(false);
        setTurnStage("choose");
        ctx.endPlayerTurn(getGameStateAfterMove(newboard));
      }
    }
  };

  const handleCircleClick = (vertex) => {
    if (!ctx.shouldPlayerMoveNext) return;
    if (currentPlayer() === "red" && board.red !== vertex) {
      handleMove({ red: vertex }, vertex, board.red);
    }
    if (turnStage === "choose") {
      if (board.blue1 === vertex && !isBlue1Moved) {
        setTurnStage("move1");
      } else if (board.blue2 === vertex && !isBlue2Moved) {
        setTurnStage("move2");
      }
      return;
    } else {
      if (turnStage === "move1") {
        if (currentPlayer() === "blue" && board.blue1 !== vertex) {
          handleMove({ blue1: vertex }, vertex, board.blue1);
        }
      } else if (turnStage === "move2") {
        if (currentPlayer() === "blue" && board.blue2 !== vertex) {
          handleMove({ blue2: vertex }, vertex, board.blue2);
        }
      }
    }
  };

  const getColor = (nodeId) => {
    if (board.blue1 === nodeId) {
      return "blue";
    } else if (board.blue2 === nodeId) {
      return "blue";
    } else if (board.red === nodeId) {
      return "red";
    } else {
      return "white";
    }
  };

  const toBeChosenToMove = (nodeId) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (ctx.playerIndex !== 0) return false;
    if (board.blue1 === nodeId && turnStage === "choose" && !isBlue1Moved) {
      return true;
    }
    if (board.blue2 === nodeId && turnStage === "choose" && !isBlue2Moved) {
      return true;
    }
  };

  const isDuringMove = (nodeId) => {
    if (!ctx.shouldPlayerMoveNext) return false;
    if (ctx.playerIndex !== 0) return false;
    if (board.blue1 === nodeId && turnStage === "move1" && !isBlue1Moved) {
      return true;
    }
    if (board.blue2 === nodeId && turnStage === "move2" && !isBlue2Moved) {
      return true;
    }
  };

  return (
    <section className="p-2 shrink-0 grow basis-2/3">
      <svg className="aspect-square stroke-black stroke-[3]">
        <rect
          x="30%"
          y="30%"
          width="40%"
          height="40%"
          className="fill-transparent"
        />
        <rect
          x="10%"
          y="10%"
          width="80%"
          height="80%"
          className="fill-transparent"
        />

        <line x1="10%" y1="10%" x2="30%" y2="30%" />
        <line x1="90%" y1="90%" x2="70%" y2="70%" />
        <line x1="10%" y1="90%" x2="30%" y2="70%" />
        <line x1="90%" y1="10%" x2="70%" y2="30%" />

        {range(8).map((nodeId) => (
          <>
            <circle
              key={nodeId}
              cx={cubeCoords[nodeId].cx}
              cy={cubeCoords[nodeId].cy}
              className={
                isDuringMove(nodeId) &&
                board.blue1 !== board.blue2 &&
                "opacity-50"
              }
              r="4%"
              stroke={toBeChosenToMove(nodeId) ? "orange" : ""}
              fill={getColor(nodeId)}
              onClick={() => handleCircleClick(nodeId)}
            />
            {nodeId === board.blue1 && nodeId === board.blue2 && (
              <text
                style={{ transform: "translate(-1%,1%)" }}
                x={cubeCoords[nodeId].cx}
                y={cubeCoords[nodeId].cy}
              >
                2x
              </text>
            )}
          </>
        ))}
      </svg>
    </section>
  );
};

const rule = (
  <>
    Az ábrán egy kisváros úthálózata látható, ahol az útkereszteződéseket
    pöttyök jelölik. A játék kezdetén a szervezők az egyik útkereszteződésbe
    letesznek egy tolvajt ábrázoló (piros) korongot, egy másikba pedig két
    rendőrt ábrázoló (kék) korongot. Egy körben előbb a rendőrök mennek át
    egy-egy szomszédos útkereszteződésbe egy út mentén (szét is válhatnak), majd
    a tolvaj is hasonlóan lép. Minden körben kötelező mindenkinek helyet
    változtatnia, és a két rendőr különválhat. A rendőrök nyernek, ha a rabló
    bármikor azonos kereszteződésben van egy rendőrrel. A tolvaj nyer, ha a
    harmadik kör végéig nem kapták el.
  </>
);

const Game = strategyGameFactory({
  rule,
  title: "Rendőr-tolvaj",
  firstRoleLabel: "Rendőrök",
  secondRoleLabel: "Tolvaj",
  GameBoard,
  G: {
    getPlayerStepDescription: ({ playerIndex }) => {
      if (playerIndex === 0) {
        return "Kattints először az egyik rendőrre, majd arra az útkereszteződésre, ahová lépni szeretnél vele, majd hasonlóan a másik rendőrrel.";
      } else {
        return "Kattints arra az útkereszteződésre, ahová a tolvajjal lépni szeretnél.";
      }
    },
    generateNewBoard,
    getGameStateAfterAiTurn
  }
});

export const Policemanthief = () => {
  const [board, setBoard] = useState(generateNewBoard());
  return <Game board={board} setBoard={setBoard} />;
};
