import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.ensureDir(dirPath);
};

export const readFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, 'utf-8');
};

export const countChars = (content: string): number => content.length;

export const buildFileTree = async (cwd: string, pattern = '**/*', ignore: string[] = ['**/node_modules/**', '**/dist/**', '**/.git/**']): Promise<string[]> => {
  const results = await glob(pattern, { cwd, ignore, nodir: true, dot: false });
  return results.map((p) => path.normalize(p));
};


