import { logger } from '../utils/logger.js';
import { NodejsPlugin } from '../plugins/NodejsPlugin.js';
import { initializeProject } from '../analysis/1_initializeProject.js';
import { identifyBuildingBlocks } from '../analysis/2_identifyBuildingBlocks.js';
import { deepAnalyze } from '../analysis/3_deepAnalyze.js';
import { generateReportXml } from '../reporting/reportGenerator.js';
import { generatePlanXml } from '../reporting/planGenerator.js';
import path from 'path';

export interface AnalyzerOptions {
  ultrathink?: boolean;
  tdd?: boolean;
  outputDir: string;
  cwd: string;
}

export class Analyzer {
  constructor(private readonly options: AnalyzerOptions) {}

  async run(): Promise<void> {
    logger.info('프로젝트 초기화를 시작합니다.');
    const plugin = new NodejsPlugin();
    const detection = await plugin.detectProject(this.options.cwd);
    if (detection.projectType === 'unknown') {
      logger.warn('지원되지 않는 프로젝트 타입이거나 package.json을 찾을 수 없습니다.');
      return;
    }
    const deps = await plugin.getDependencies(this.options.cwd);
    logger.info('의존성 목록:');
    for (const [name, version] of Object.entries(deps.dependencies)) {
      logger.info(`- ${name}@${version}`);
    }
    for (const [name, version] of Object.entries(deps.devDependencies)) {
      logger.info(`- (dev) ${name}@${version}`);
    }

    // Phase 2 Step 1
    const init = await initializeProject(this.options.cwd);
    if (init.projectSummary) {
      logger.info('프로젝트 컨텍스트 요약:');
      logger.info(init.projectSummary);
    }

    // Phase 2 Step 2
    const blocks = await identifyBuildingBlocks(this.options.cwd, this.options.ultrathink);
    logger.info('핵심 파일/디렉토리 식별 결과:');
    logger.info(blocks.identified || '(LLM 식별 결과 없음)');

    // Phase 3 Step 3
    const deep = await deepAnalyze(this.options.cwd, blocks.fileTreeSample.slice(0, 10));
    const insights = deep.map((d) => `${d.path}: ${d.summary}`);
    const improvedStructure = '미니 추천 구조 (예시): src/, tests/, docs/, dist/';
    const reportPath = path.join(this.options.cwd, this.options.outputDir, 'gemini-refactor-report.xml');
    await generateReportXml(reportPath, { improvedStructure, insights });
    logger.info(`리포트를 생성했습니다: ${reportPath}`);

    // Phase 4 Plan
    const planPath = path.join(this.options.cwd, this.options.outputDir, 'gemini-refactor-plan.xml');
    await generatePlanXml(reportPath, planPath, !!this.options.tdd);
    logger.info(`실행 계획을 생성했습니다: ${planPath}`);
  }
}


