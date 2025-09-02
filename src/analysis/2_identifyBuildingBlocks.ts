import { buildFileTree } from '../utils/fileSystem.js';
import { PromptManager } from '../llm/PromptManager.js';
import { GeminiClient } from '../llm/GeminiClient.js';
import { logger } from '../utils/logger.js';

export interface BuildingBlocksResult {
  fileTreeSample: string[];
  identified: string; // LLM 식별 결과 원문(간단히 문자열)
}

export async function identifyBuildingBlocks(cwd: string, ultrathink = false): Promise<BuildingBlocksResult> {
  const files = await buildFileTree(cwd);
  // ultrathink 가 아니면 샘플 크기를 제한
  const limit = ultrathink ? 5000 : 200;
  const sample = files.slice(0, limit);
  let identified = '';
  try {
    const prompt = PromptManager.identifyBuildingBlocks(sample.join('\n'));
    const client = new GeminiClient();
    identified = await client.generateText(prompt);
  } catch (err) {
    logger.warn('LLM 식별 요청 실패. 기본 리스트만 사용합니다.');
  }
  return { fileTreeSample: sample, identified };
}
