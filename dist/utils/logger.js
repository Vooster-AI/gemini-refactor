import chalk from 'chalk';
const formatTime = () => new Date().toISOString();
const format = (level, message) => {
    return `[${level} ${formatTime()}] ${message}`;
};
export const logger = {
    info: (message, ...args) => {
        console.log(chalk.blue(format('INFO', message)), ...args);
    },
    warn: (message, ...args) => {
        console.warn(chalk.yellow(format('WARN', message)), ...args);
    },
    error: (message, ...args) => {
        console.error(chalk.red(format('ERROR', message)), ...args);
    },
};
//# sourceMappingURL=logger.js.map