import { getAiStep } from "./bot-strategy";

describe('getAiStep', () => {
  it('odd, odd, odd, odd case: split a non-1 pile', () => {
    const aiStep = getAiStep([1, 3, 1, 1]);
    expect(aiStep.pileId).toEqual(1);
  });

  it('odd, odd, odd, even case: split the even pile into odd-odd', () => {
    const aiStep = getAiStep([3, 5, 4, 7]);
    expect(aiStep.pileId).toEqual(2);
    expect(aiStep.pieceId === 0 || aiStep.pieceId === 2);
  });

  it('odd, odd, even, even case: remove one even, split the other into odd-odd', () => {
    const aiStep = getAiStep([4, 4, 3, 5]);
    expect(aiStep.pileId === 0 || aiStep.pileId === 1);
    expect(aiStep.pieceId === 0 || aiStep.pieceId === 2)
  });

  it('even, even, even, even case: follow strategy for halfed piles recursively', () => {
    const aiStep = getAiStep([20, 28, 8, 12]);
    expect(aiStep.pileId).toEqual(2);
    expect(aiStep.pieceId).toEqual(3);
  });

  describe('even, even, even, odd case', () => {
    it('2, 2, 2, 1', () => {
      const aiStep = getAiStep([2, 2, 2, 1]);
      expect([0, 1, 2]).toContainEqual(aiStep.pileId);
      expect(aiStep.pieceId).toEqual(0);
    });

    it('2, 2, 2, 3', () => {
      const aiStep = getAiStep([2, 2, 2, 3]);
      expect(aiStep.pileId).toEqual(3);
      expect(aiStep.pieceId).toEqual(0);
    });

    it('4, 4, 4, 15', () => {
      const aiStep = getAiStep([4, 15, 4, 4]);
      expect(aiStep.pileId).toEqual(1);
      expect(aiStep.pieceId).toEqual(10);
    });

    it('4, 4, 4, 11', () => {
      const aiStep = getAiStep([4, 11, 4, 4]);
      expect(aiStep.pileId).toEqual(1);
      expect(aiStep.pieceId).toEqual(2);
    });
  });
});
