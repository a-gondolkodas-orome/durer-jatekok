import { getGameStateAfterAiTurn } from './bot-strategy';

describe('TicTacToe strategy', () => {
  describe('getGameStateAfterAiTurn', () => {
    describe('new piece placing phase', () => {
      it('should win the game in 1 move if possible', () => {
        const board = [
          'red', 'red', null,
          null, null, null,
          'blue', 'blue', null
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[2]).toEqual('red');
        expect(result.isGameEnd).toBe(true);
      });

      it('should win the game in 1 move if possible for 0th place as well', () => {
        const board = [
          null, 'red', 'red',
          null, null, null,
          'blue', 'blue', null
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[0]).toEqual('red');
        expect(result.isGameEnd).toBe(true);
      });

      it('should identify a diagonal winning position', () => {
        const board = [
          'blue', 'blue', 'red',
          null, 'red', null,
          null, null, 'blue'
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[6]).toEqual('red');
        expect(result.isGameEnd).toBe(true);
      });

      it('should place to player winning place', () => {
        const board = [
          'blue', 'blue', 'red',
          'blue', null, null,
          null, 'red', null
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[6]).toEqual('red');
        expect(result.isGameEnd).toBe(false);
      });

      it('should place to middle place if still empty', () => {
        const board = [
          'blue', null, null,
          null, null, null,
          null, null, null
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[4]).toEqual('red');
        expect(result.isGameEnd).toBe(false);
      });

      it('should place to corner if middle is not empty', () => {
        const board = [
          null, null, null,
          null, 'blue', null,
          null, null, null
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(
          result.nextBoard[0] === 'red' || result.nextBoard[2] === 'red' ||
          result.nextBoard[6] === 'red' || result.nextBoard[8] === 'red'
        ).toBe(true);
        expect(result.isGameEnd).toBe(false);
      });

      it('should place to defending corner if 1 diagonal is occupied', () => {
        const board = [
          'red', null, null,
          null, 'blue', null,
          null, null, 'blue'
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[2] === 'red' || result.nextBoard[6] === 'red').toBe(true);
        expect(result.isGameEnd).toBe(false);
      });
    });

    describe('board is already full phase', () => {
      it('should color middle field to white if allowed', () => {
        const board = [
          'red', 'blue', 'red',
          'red', 'blue', 'blue',
          'blue', 'red', 'blue'
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[4]).toEqual('white');
        expect(result.isGameEnd).toBe(false);
      });

      it('should win the game in one move is possible', () => {
        const board = [
          'red', 'blue', 'red',
          'white', 'white', 'blue',
          'blue', 'red', 'blue'
        ];

        const result = getGameStateAfterAiTurn({ board });
        expect(result.nextBoard[5]).toEqual('white');
        expect(result.isGameEnd).toBe(true);
      });

      describe('r b r, b r b, b r b scenario', () => {
        it('should color 3 to white (and similarly in rotated scenarios)', () => {
          const res1 = getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'red',
            'blue', 'red', 'blue',
            'blue', 'red', 'blue'
          ] }).nextBoard;
          expect(res1[3] === 'white' || res1[5] === 'white').toBe(true);

          const res2 = getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'blue',
            'blue', 'red', 'red',
            'red', 'blue', 'blue'
          ] }).nextBoard;
          expect(res2[7] === 'white' || res2[1] === 'white').toBe(true);
        });

        it('should color 8 to white as 3rd if no instant win (and similarly in rotated scenarios)', () => {
          expect(getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'white',
            'white', 'red', 'blue',
            'blue', 'red', 'blue'
          ] }).nextBoard[8]).toEqual('white');
          expect(getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'red',
            'white', 'red', 'blue',
            'blue', 'white', 'blue'
          ] }).nextBoard[8]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'white', 'red',
            'white', 'red', 'blue',
            'blue', 'blue', 'red'
          ] }).nextBoard[6]).toEqual('white');
          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'white', 'red',
            'red', 'red', 'blue',
            'blue', 'blue', 'white'
          ] }).nextBoard[6]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'white', 'blue',
            'blue', 'red', 'white',
            'red', 'blue', 'red'
          ] }).nextBoard[0]).toEqual('white');
          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'red', 'blue',
            'blue', 'red', 'white',
            'white', 'blue', 'red'
          ] }).nextBoard[0]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'blue',
            'blue', 'red', 'white',
            'red', 'white', 'blue'
          ] }).nextBoard[2]).toEqual('white');
          expect(getGameStateAfterAiTurn({ board: [
            'white', 'blue', 'blue',
            'blue', 'red', 'red',
            'red', 'white', 'blue'
          ] }).nextBoard[2]).toEqual('white');
        });
      });

      describe('r b b, b r r, b r b scenario', () => {
        it('should color 2 to white (and similarly in rotated scenarios)', () => {
          const res = getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'blue',
            'blue', 'red', 'red',
            'blue', 'red', 'blue'
          ] }).nextBoard;
          expect(res[2] === 'white' || res[6] === 'white').toBe(true);
        });

        it('should color 3 to white (and similarly in rotated scenarios)', () => {
          expect(getGameStateAfterAiTurn({ board: [
            'red', 'blue', 'white',
            'blue', 'red', 'red',
            'blue', 'white', 'blue'
          ] }).nextBoard[3]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'blue', 'red',
            'white', 'red', 'blue',
            'blue', 'red', 'white'
          ] }).nextBoard[1]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'blue', 'white', 'blue',
            'red', 'red', 'blue',
            'white', 'blue', 'red'
          ] }).nextBoard[5]).toEqual('white');

          expect(getGameStateAfterAiTurn({ board: [
            'white', 'red', 'blue',
            'blue', 'red', 'white',
            'red', 'blue', 'blue'
          ] }).nextBoard[7]).toEqual('white');
        });
      });
    });
  });
});
