import { logger } from '../utils/logger.js';
import { NodejsPlugin } from '../plugins/NodejsPlugin.js';
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
    }
}
//# sourceMappingURL=Analyzer.js.map