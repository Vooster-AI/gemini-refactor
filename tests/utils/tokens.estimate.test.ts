import { estimateTokenUsage } from '../../src/utils/tokens';

describe('estimateTokenUsage', () => {
  it('문자 수 기반의 단순 추정값을 반환해야 한다', () => {
    const text = 'a'.repeat(1000);
    const { tokens, costUSD } = estimateTokenUsage(text, {
      model: 'gemini-1.5-flash',
      pricePerMTokUSD: 0.075,
    });
    expect(tokens).toBeGreaterThan(0);
    expect(costUSD).toBeGreaterThan(0);
  });
});


