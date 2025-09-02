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

const readGitignore = async (cwd: string): Promise<string[]> => {
  const filePath = path.join(cwd, '.gitignore');
  const exists = await fs.pathExists(filePath);
  if (!exists) return [];
  const raw = await fs.readFile(filePath, 'utf-8');
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
};

const isDirectoryPattern = (pattern: string): boolean => pattern.endsWith('/');

const normalizeLeadingSlash = (pattern: string): string => {
  return pattern.startsWith('/') ? pattern.slice(1) : pattern;
};

const gitignoreToGlobIgnores = (pattern: string): string[] => {
  let p = normalizeLeadingSlash(pattern.trim());
  if (!p) return [];

  const hasWildcard = /[\*\?\[]/.test(p);
  if (isDirectoryPattern(p)) {
    const base = p.replace(/\/+$/, '');
    return [
      `${base}/**`,
      `**/${base}/**`,
    ];
  }

  if (hasWildcard) {
    return [p, `**/${p}`];
  }

  return [p, `**/${p}`];
};

export const buildFileTree = async (
  cwd: string,
  pattern = '**/*',
  ignore: string[] = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/npm-shrinkwrap.json',
  ]
): Promise<string[]> => {
  const gitignore = await readGitignore(cwd);
  const gitIgnores = gitignore.flatMap(gitignoreToGlobIgnores);
  const mergedIgnore = Array.from(new Set([...ignore, ...gitIgnores]));

  const results = await glob(pattern, { cwd, ignore: mergedIgnore, nodir: true, dot: false });
  return results.map((p) => path.normalize(p));
};


