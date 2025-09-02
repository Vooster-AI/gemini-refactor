export interface TokenEstimateOptions {
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro' | string;
  pricePerMTokUSD: number; // 1M tokens 당 USD
}

export function estimateTokenUsage(text: string, options: TokenEstimateOptions): { tokens: number; costUSD: number } {
  // 간단한 휴리스틱: 토큰 ~= 문자수 / 4
  const tokens = Math.ceil((text?.length || 0) / 4);
  const costUSD = (tokens / 1_000_000) * options.pricePerMTokUSD;
  return { tokens, costUSD };
}
