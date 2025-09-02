export function estimateTokenUsage(text, options) {
    // 간단한 휴리스틱: 토큰 ~= 문자수 / 4
    const tokens = Math.ceil((text?.length || 0) / 4);
    const costUSD = (tokens / 1_000_000) * options.pricePerMTokUSD;
    return { tokens, costUSD };
}
//# sourceMappingURL=tokens.js.map