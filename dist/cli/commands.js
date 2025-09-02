import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { Analyzer } from '../core/Analyzer.js';
export const registerCommands = (program) => {
    program
        .option('--ultrathink', 'LLM에 더 많은 컨텍스트를 제공하도록 글자 수 제한 완화')
        .option('--tdd', 'TDD 최적화 계획 생성')
        .option('--output-dir <path>', '출력 디렉토리', 'gemini-refactor-output')
        .action(async (options) => {
        logger.info('분석을 시작합니다...');
        logger.info(`옵션: ultrathink=${Boolean(options.ultrathink)} tdd=${Boolean(options.tdd)} outputDir=${options.outputDir}`);
        const analyzer = new Analyzer({
            ultrathink: Boolean(options.ultrathink),
            tdd: Boolean(options.tdd),
            outputDir: options.outputDir ?? 'gemini-refactor-output',
            cwd: process.cwd(),
        });
        await analyzer.run();
    });
};
//# sourceMappingURL=commands.js.map