import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { isEqual, range } from 'lodash';

//    0
//   1 2
//  3 4 5
// 6 7 8 9

const vertices = [
  { id: 0, x: 0, y: 3, z: 3, cx: "50%", cy: "12.5%" },
  { id: 1, x: 1, y: 2, z: 3, cx: "41.625%", cy: "27.5%" },
  { id: 2, x: 1, y: 3, z: 2, cx: "58.375%", cy: "27.5%" },
  { id: 3, x: 2, y: 1, z: 3, cx: "33.25%", cy: "42.5%" },
  { id: 4, x: 2, y: 2, z: 2, cx: "50%", cy: "42.5%" },
  { id: 5, x: 2, y: 3, z: 1, cx: "66.75%", cy: "42.5%" },
  { id: 6, x: 3, y: 0, z: 3, cx: "25%", cy: "57.5%" },
  { id: 7, x: 3, y: 1, z: 2, cx: "41.625%", cy: "57.5%" },
  { id: 8, x: 3, y: 2, z: 1, cx: "58.375%", cy: "57.5%" },
  { id: 9, x: 3, y: 3, z: 0, cx: "75%", cy: "57.5%" }
];

const isParallel = (nodeA, nodeB) => {
  const vertexA = vertices[nodeA];
  const vertexB = vertices[nodeB];
  return vertexA.x === vertexB.x || vertexA.y === vertexB.y || vertexA.y === vertexB.y;
};

const GameBoard = ({ board, setBoard, ctx }) => {
  const [firstNode, setFirstNode] = useState(null);

  const isConnected = (nodeA, nodeB) => {
    return board.some(edge =>
      isEqual(edge, ({ from: nodeA, to: nodeB })) || isEqual(edge, ({ from: nodeB, to: nodeA }))
    );
  };

  const connectNode = id => {
    if (!ctx.shouldPlayerMoveNext) return;
    if (firstNode === null) {
      setFirstNode(id);
    } else if (id === firstNode) {
      setFirstNode(null);
    } else {
      if (!isParallel(firstNode, id)) return;
      const newBoard = [...board];
      newBoard.push({ from: firstNode, to: id });
      setBoard(newBoard);
      setFirstNode(null);
    }
  };
  return (
  <section className="p-2 shrink-0 grow basis-2/3">
  <svg className="aspect-square">
    {vertices.map(vertex => (
      <circle
        key={vertex.id}
        cx={vertex.cx} cy={vertex.cy} r="2%" fill="black"
        className={`${vertex.id === firstNode ? 'fill-slate-600' : ''}`}
        onClick={() => connectNode(vertex.id)}
      />
    ))}

    {range(10).map(from => <>
      {range(10).map(to => <>
        {isConnected(from, to) && (
          <line
            x1={vertices[from].cx} y1={vertices[from].cy}
            x2={vertices[to].cx} y2={vertices[to].cy}
            stroke="black" strokeWidth="2"
          />
        )}
      </>)}
    </>)}
  </svg>
  </section>
  );
};

const rule = <>
  Egy indiánrezervátumban 10 totemoszlopot állítottak fel a bal oldali ábrán látható háromszögrács szerint.
  Csendes Patak és Vörös Tűz a következő játékot szokták itt játszani: felváltva feszítenek ki köteleket két-két oszlop
  között, és minden kötél kifeszítésénél figyelnek arra, hogy a kifeszített kötél párhuzamos legyen a nagy háromszög
  egyik oldalával, illetve a kötél nem haladhat el olyan oszlop mellett, amelyet már egy másik kötél érint.
  Ezenkívül ha a jelenleg kifeszített kötél helyett annak egy egyenes vonalú meghosszabbítása is kifeszíthető
  a fenti feltételek mellett, akkor azt kell kifeszíteniük. Az veszít, amelyikőjük már nem tud a
  szabályoknak megfelelően több kötelet kifeszíteni.

  Te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni.
  Sok sikert! :)
</>;

const Game = strategyGameFactory({
  rule,
  title: '10 totemoszlop',
  GameBoard,
  G: {
    getPlayerStepDescription: () => 'Kattints két oszlopra, amik között kötelet szeretnél kifeszíteni.',
    generateNewBoard: () => [],
    getGameStateAfterAiTurn: ({ board }) => ({ newBoard: board, isGameEnd: false })
  }
});

export const TriangularGridRopes = () => {
  const [board, setBoard] = useState([]);

  return <Game board={board} setBoard={setBoard} />;
};
