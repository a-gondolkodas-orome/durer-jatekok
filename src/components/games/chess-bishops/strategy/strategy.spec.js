import {
  getGameStateAfterMove,
  getGameStateAfterAiTurn,
  BISHOP, FORBIDDEN,
  generateNewBoard
} from './strategy';

describe('test bishop strategy', () => {
  describe('getGameStateAfterMove', () => {
    it('places bishop at given field and marks forbidden fields', () => {
      const board = generateNewBoard();
      const res = getGameStateAfterMove(board, { row: 2, col: 3 });
      const expectedBoard = [
        [null     , FORBIDDEN, null     , null  , null     , FORBIDDEN, null     , null     ],
        [null     , null     , FORBIDDEN, null  , FORBIDDEN, null     , null     , null     ],
        [null     , null     , null     , BISHOP, null     , null     , null     , null     ],
        [null     , null     , FORBIDDEN, null  , FORBIDDEN, null     , null     , null     ],
        [null     , FORBIDDEN, null     , null  , null     , FORBIDDEN, null     , null     ],
        [FORBIDDEN, null     , null     , null  , null     , null     , FORBIDDEN, null     ],
        [null     , null     , null,      null  , null     , null     , null     , FORBIDDEN],
        [null     , null     , null     , null  , null     , null     , null     , null     ]
      ];
      expect(res).toEqual({ newBoard: expectedBoard, isGameEnd: false, winnerIndex: null });
    });
  });

  describe('getGameStateAfterAiTurn()', () => {
    it('places 2nd bishop at a mirror position', () => {
      const board = generateNewBoard();
      const { newBoard } = getGameStateAfterMove(board, { row: 1, col: 5 });
      const res = getGameStateAfterAiTurn({ board: newBoard }).newBoard;
      expect(res[1][2] === BISHOP || res[6][5] === BISHOP).toBe(true);
    });

    it('places 4th bishop at a mirror position according to chosen axis', () => {
      const board = generateNewBoard();
      const { newBoard } = getGameStateAfterMove(board, { row: 1, col: 5 });
      const board2 = getGameStateAfterAiTurn({ board: newBoard }).newBoard;
      const { newBoard: newBoard2 } = getGameStateAfterMove(board2, { row: 6, col: 4 });
      const res = getGameStateAfterAiTurn({ board: newBoard2 }).newBoard;
      expect(
        (res[1][2] === BISHOP && res[6][3] === BISHOP) ||
        (res[6][5] === BISHOP && res[1][4] === BISHOP)
      ).toBe(true);
    });
  });
});
