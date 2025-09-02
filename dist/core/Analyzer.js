import { logger } from '../utils/logger.js';
import { NodejsPlugin } from '../plugins/NodejsPlugin.js';
import { initializeProject } from '../analysis/1_initializeProject.js';
import { identifyBuildingBlocks } from '../analysis/2_identifyBuildingBlocks.js';
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
        // Phase 2 Step 2
        const blocks = await identifyBuildingBlocks(this.options.cwd, this.options.ultrathink);
        logger.info('핵심 파일/디렉토리 식별 결과:');
        logger.info(blocks.identified || '(LLM 식별 결과 없음)');
    }
}
//# sourceMappingURL=Analyzer.js.map