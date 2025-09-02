import { logger } from '../utils/logger.js';
import { NodejsPlugin } from '../plugins/NodejsPlugin.js';
import { initializeProject } from '../analysis/1_initializeProject.js';
import { identifyBuildingBlocks } from '../analysis/2_identifyBuildingBlocks.js';
import { deepAnalyze } from '../analysis/3_deepAnalyze.js';
import { generateReportXml } from '../reporting/reportGenerator.js';
import { generatePlanXml } from '../reporting/planGenerator.js';
import path from 'path';
import readline from 'readline/promises';
import { estimateTokenUsage } from '../utils/tokens.js';
export class Analyzer {
    options;
    constructor(options) {
        this.options = options;
    }
    async run() {
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
        // Phase 2 Step 2 - 샘플과 간단 비용 추정 출력 + 사용자 확인
        const blocks = await identifyBuildingBlocks(this.options.cwd, this.options.ultrathink);
        const sampleCount = blocks.fileTreeSample.length;
        const samplePreview = blocks.fileTreeSample.slice(0, 10).join(', ');
        const concatenated = blocks.fileTreeSample.slice(0, 100).join('\n');
        const estimate = estimateTokenUsage(concatenated, { model: 'gemini-1.5-flash', pricePerMTokUSD: 0.075 });
        logger.info('핵심 파일/디렉토리 식별 결과:');
        logger.info(blocks.identified || '(LLM 식별 결과 없음)');
        // 사용자 확인
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await rl.question(`LLM 분석을 시작할까요? (대상 파일 수 ${sampleCount}개, 예상 토큰 ${estimate.tokens}개, 예상 비용 ~$${estimate.costUSD.toFixed(6)}) [Y/n]: `);
        rl.close();
        const normalized = (answer ?? '').trim().toLowerCase();
        if (normalized === 'n' || normalized === 'no') {
            logger.warn('사용자가 분석을 취소했습니다.');
            return;
        }
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
//# sourceMappingURL=Analyzer.js.map