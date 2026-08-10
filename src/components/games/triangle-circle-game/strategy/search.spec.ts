import { cloneDeep } from 'lodash';
import { EDGES, TRIANGLES, TRIANGLE_COUNT } from '../geometry';
import {
  type Board, LINE, CIRCLE,
  startBoards, applyShade
} from '../gameplay';
import { evaluatePosition } from './search';

// `startBoards` is shared module data; a spec that steps a board forward
// needs its own copy, the way the engine takes one per match.
const freshStartBoard = () => cloneDeep(startBoards[0]);

const otherEdge = (t: number, notEdge: number) => TRIANGLES[t].edgeIds.find(e => e !== notEdge)!;

describe('bounded minimax search', () => {
  it('reports lineLoses once every triangle is circled', () => {
    const board: Board = { edges: freshStartBoard().edges, circles: new Array(TRIANGLE_COUNT).fill(true) };
    expect(evaluatePosition(board, LINE)).toBe('lineLoses');
    expect(evaluatePosition(board, CIRCLE)).toBe('lineLoses');
  });

  it('sees an immediate line win (line to move, a triangle at two shaded edges)', () => {
    const t = 5;
    const [e0, e1] = TRIANGLES[t].edgeIds;
    const board = applyShade(applyShade(freshStartBoard(), e0), e1);
    expect(evaluatePosition(board, LINE)).toBe('lineWins');
  });

  it('sees a forced line win via a double threat (line to move on a pre-threat edge)', () => {
    const edge = EDGES.find(e => e.triangleIds.length === 2)!;
    const [t1, t2] = edge.triangleIds;
    let board = freshStartBoard();
    board = applyShade(board, otherEdge(t1, edge.id));
    board = applyShade(board, otherEdge(t2, edge.id));
    // Line has no immediate win, but shading `edge` makes two live threats.
    expect(evaluatePosition(board, LINE)).toBe('lineWins');
  });

  it('sees the line win for the circle player facing two live threats', () => {
    // Two disjoint triangles each at two shaded edges, circle to move: it can
    // only cover one, so the line player wins.
    const upTris = TRIANGLES.filter(t => t.dir === 'up');
    const a = upTris[0].id;
    const b = upTris[upTris.length - 1].id;
    let board = freshStartBoard();
    for (const e of TRIANGLES[a].edgeIds.slice(0, 2)) board = applyShade(board, e);
    for (const e of TRIANGLES[b].edgeIds.slice(0, 2)) board = applyShade(board, e);
    expect(evaluatePosition(board, CIRCLE)).toBe('lineWins');
  });

  it('degrades to unknown on the wide-open board within a small budget', () => {
    const board = freshStartBoard();
    expect(evaluatePosition(board, LINE, { depth: 6, budget: 1500 })).toBe('unknown');
  });
});
