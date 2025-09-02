import chalk from 'chalk';

export type LogMethod = (message: string, ...args: unknown[]) => void;

export interface Logger {
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
}

const formatTime = (): string => new Date().toISOString();

const format = (level: 'INFO' | 'WARN' | 'ERROR', message: string): string => {
  return `[${level} ${formatTime()}] ${message}`;
};

export const logger: Logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(chalk.blue(format('INFO', message)), ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(chalk.yellow(format('WARN', message)), ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(chalk.red(format('ERROR', message)), ...args);
  },
};


