import { NodejsPlugin } from '../plugins/NodejsPlugin.js';
import { PromptManager } from '../llm/PromptManager.js';
import { GeminiClient } from '../llm/GeminiClient.js';
import { logger } from '../utils/logger.js';

export interface InitializeResult {
  projectSummary: string;
  deps: Record<string, string>;
  devDeps: Record<string, string>;
}

export async function initializeProject(cwd: string): Promise<InitializeResult> {
  const plugin = new NodejsPlugin();
  const { projectType } = await plugin.detectProject(cwd);
  if (projectType !== 'node') {
    throw new Error('현재는 Node.js 프로젝트만 지원합니다.');
  }
  const { dependencies, devDependencies } = await plugin.getDependencies(cwd);
  let projectSummary = '';
  try {
    const client = new GeminiClient();
    const prompt = PromptManager.projectContext(dependencies, devDependencies);
    projectSummary = await client.generateText(prompt);
  } catch (err) {
    logger.warn('LLM 요약 생성에 실패했습니다. 요약 없이 계속 진행합니다.');
  }
  return { projectSummary, deps: dependencies, devDeps: devDependencies };
}
