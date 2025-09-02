import ora from 'ora';
import { readFile } from '../utils/fileSystem.js';
import { PromptManager } from '../llm/PromptManager.js';
import { GeminiClient } from '../llm/GeminiClient.js';
import { logger } from '../utils/logger.js';

export interface DeepAnalyzeItemResult {
  path: string;
  summary: string;
}

export async function deepAnalyze(cwd: string, items: string[]): Promise<DeepAnalyzeItemResult[]> {
  const spinner = ora('Analyzing files...').start();
  let client: GeminiClient | null = null;
  try {
    client = new GeminiClient();
  } catch (e) {
    logger.warn('GEMINI_API_KEY가 없어 LLM 분석을 건너뜁니다.');
  }
  const results: DeepAnalyzeItemResult[] = [];
  try {
    for (const rel of items) {
      spinner.text = `Analyzing ${rel}...`;
      const content = await readFile(`${cwd}/${rel}`);
      let summary = '';
      if (client) {
        const prompt = [
          '다음 파일의 역할과 핵심 로직을 간략히 요약하세요. 한국어 한 단락으로.',
          '---',
          content
        ].join('\n');
        try {
          summary = await client.generateText(prompt);
        } catch (e) {
          summary = '(LLM 요청 실패)';
        }
      } else {
        summary = '(LLM 비활성화)';
      }
      results.push({ path: rel, summary });
    }
  } finally {
    spinner.stop();
  }
  logger.info(`심층 분석 완료: ${results.length}개 항목`);
  return results;
}
