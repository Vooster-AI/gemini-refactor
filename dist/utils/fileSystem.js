import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
export const ensureDir = async (dirPath) => {
    await fs.ensureDir(dirPath);
};
export const readFile = async (filePath) => {
    return fs.readFile(filePath, 'utf-8');
};
export const countChars = (content) => content.length;
export const buildFileTree = async (cwd, pattern = '**/*', ignore = ['**/node_modules/**', '**/dist/**', '**/.git/**']) => {
    const results = await glob(pattern, { cwd, ignore, nodir: true, dot: false });
    return results.map((p) => path.normalize(p));
};
//# sourceMappingURL=fileSystem.js.map