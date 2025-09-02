import { program } from 'commander';
import { registerCommands } from './commands.js';
program
    .name('gemini-refactor')
    .description('프로젝트 분석 및 리팩터링 계획 생성을 돕는 CLI')
    .version('0.1.0');
registerCommands(program);
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map