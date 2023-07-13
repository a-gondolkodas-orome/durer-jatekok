import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { every, range, last } from 'lodash';

//    0
//   1 2
//  3 4 5
// 6 7 8 9

// x, y, z: 3 "axis" showing parallel lines to triangle sides
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

const superSets = {
  '0-1': [[0, 3], [0, 6]],
  '0-3': [[0, 6]],
  '1-3': [[0, 3], [1, 6]],
  '1-6': [[0, 6]],
  '3-6': [[1, 6], [0, 6]],
  '0-2': [[0, 5], [0, 9]],
  '0-5': [[0, 9]],
  '2-5': [[0, 5], [2, 9]],
  '2-9': [[0, 9]],
  '5-9': [[2, 9], [0, 9]],
  '6-7': [[6, 8], [6, 9]],
  '6-8': [[6, 9]],
  '7-8': [[7, 9]],
  '7-9': [[6, 9]],
  '8-9': [[7, 9], [6, 9]],
  '3-4': [[3, 5]],
  '4-5': [[3, 5]],
  '1-4': [[1, 8]],
  '4-8': [[1, 8]],
  '2-4': [[2, 7]],
  '4-7': [[2, 7]]
};

const edgeDirection = (nodeA, nodeB) => {
  const vertexA = vertices[nodeA];
  const vertexB = vertices[nodeB];
  if (vertexA.x === vertexB.x) return 'x';
  if (vertexA.y === vertexB.y) return 'y';
  if (vertexA.z === vertexB.z) return 'z';
  return null;
};

const isParallel = (nodeA, nodeB) => {
  return edgeDirection(nodeA, nodeB) !== null;
};

const isPartOfExistingRope = (board, { from, to }) => {
  return board.some(e => {
    const middlePoints = getMiddlePoints(e);
    const edgePoints = [...middlePoints, e.from, e.to];
    return edgePoints.includes(from) && edgePoints.includes(to);
  });
};

const getMiddlePoints = ({ from, to }) => {
  const dir = edgeDirection(from, to);
  if (dir === null) return [];
  return range(10).filter(id => {
    return vertices[from][dir] === vertices[id][dir] && (
      (from > id && id > to) ||
      (from < id && id < to)
    );
  });
};

const getNodesWithRope = board => {
  return range(10).filter(id => {
    return board.some(e => {
      const isEndpoint = e.from === id || e.to === id;
      const isMiddlePoint = getMiddlePoints(e).includes(id);
      return isEndpoint || isMiddlePoint;
    });
  });
};

const isAllowed = (board, { from, to }) => {
  if (!isParallel(from, to)) return false;
  if (isPartOfExistingRope(board, { from, to })) return false;
  const middlePoints = getMiddlePoints({ from, to });
  const nodesWithRope = getNodesWithRope(board);
  return every(middlePoints, p => !nodesWithRope.includes(p));
};

const isGameEnd = board => {
  let anyAllowed = false;
  range(10).map(from => {
    range(10).map(to => {
      if (isAllowed(board, { from, to }) && from !== to) {
        anyAllowed = true;
      }
    });
  });
  return !anyAllowed;
};

const getAllowedSuperset = (board, { from, to }) => {
  if (from === null || to === null || from === to) return null;
  if (!isAllowed(board, { from, to })) return { from, to };
  const edgeSupsersets = superSets[`${from}-${to}`] || superSets[`${to}-${from}`] || [];
  const allowedSupersets = edgeSupsersets.filter(e => isAllowed(board, { from: e[0], to: e[1] }));
  if (allowedSupersets.length > 0) {
    const e = last(allowedSupersets);
    return { from: e[0], to: e[1] };
  }
  return { from, to };
};

const GameBoard = ({ board, setBoard, ctx }) => {
  const [firstNode, setFirstNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const connectNode = node => {
    if (!ctx.shouldPlayerMoveNext) return;
    if (firstNode === null) {
      setFirstNode(node);
    } else if (node === firstNode) {
      setFirstNode(null);
    } else {
      if (!isAllowed(board, { from: firstNode, to: node })) return;
      const newBoard = [...board];
      newBoard.push(getAllowedSuperset(board, { from: firstNode, to: node }));
      ctx.endPlayerTurn({ newBoard, isGameEnd: isGameEnd(board), winnerIndex: null });
      setFirstNode(null);
    }
  };

  const isCandidateAllowed = (
    firstNode !== null && hoveredNode !== null &&
    isAllowed(board, { from: firstNode, to: hoveredNode })
  );

  const candidateEdge = getAllowedSuperset(board, { from: firstNode, to: hoveredNode });
  const candidateFromV = candidateEdge ? vertices[candidateEdge.from] : null;
  const candidateToV = candidateEdge ? vertices[candidateEdge.to] : null;

  return (
  <section className="p-2 shrink-0 grow basis-2/3">
  <svg className="aspect-square">

    {/* edges */}
    {board.map(({ from, to }) => (
      <line
        key={`${from}-${to}`}
        x1={vertices[from].cx} y1={vertices[from].cy}
        x2={vertices[to].cx} y2={vertices[to].cy}
        stroke="blue" strokeWidth="2"
      />
    ))}

    {/* candidate next edge */}
    {firstNode !== null && hoveredNode !== null && firstNode !== hoveredNode && (
      <line
      x1={candidateFromV.cx} y1={candidateFromV.cy}
      x2={candidateToV.cx} y2={candidateToV.cy}
      stroke={isCandidateAllowed ? 'black' : 'red'}
      strokeWidth="1" strokeDasharray="4"
      />
    )}

    {/* grid nodes */}
    {vertices.map(vertex => (
      <circle
        key={vertex.id}
        cx={vertex.cx} cy={vertex.cy} r="2%" fill="black"
        className={`${vertex.id === firstNode ? 'fill-slate-600' : ''}`}
        onClick={() => connectNode(vertex.id)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') connectNode(vertex.id);
        }}
        tabIndex={0}
        onFocus={() => setHoveredNode(vertex.id)}
        onBlur={() => setHoveredNode(null)}
        onMouseOver={() => setHoveredNode(vertex.id)}
        onMouseOut={() => setHoveredNode(null)}
      />
    ))}
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
    getGameStateAfterAiTurn: ({ board }) => ({ newBoard: board, isGameEnd: isGameEnd(board) })
  }
});

export const TriangularGridRopes = () => {
  const [board, setBoard] = useState([]);

  return <Game board={board} setBoard={setBoard} />;
};
