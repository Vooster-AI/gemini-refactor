import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { buildFileTree } from '../../src/utils/fileSystem';

describe('buildFileTree - lock 파일 제외', () => {
  const tmp = path.join(os.tmpdir(), `gr-lock-${Date.now()}`);

  beforeAll(async () => {
    await fs.ensureDir(tmp);
    await fs.outputFile(path.join(tmp, 'package-lock.json'), '{}');
    await fs.outputFile(path.join(tmp, 'yarn.lock'), '');
    await fs.outputFile(path.join(tmp, 'pnpm-lock.yaml'), '');
    await fs.outputFile(path.join(tmp, 'npm-shrinkwrap.json'), '{}');
    await fs.ensureDir(path.join(tmp, 'src'));
    await fs.outputFile(path.join(tmp, 'src', 'index.ts'), 'console.log("hi")');
  });

  afterAll(async () => {
    await fs.remove(tmp);
  });

  it('lock 파일들을 결과에서 제외해야 한다', async () => {
    const files = await buildFileTree(tmp);
    expect(files.some((f) => f.endsWith('package-lock.json'))).toBe(false);
    expect(files.some((f) => f.endsWith('yarn.lock'))).toBe(false);
    expect(files.some((f) => f.endsWith('pnpm-lock.yaml'))).toBe(false);
    expect(files.some((f) => f.endsWith('npm-shrinkwrap.json'))).toBe(false);
    expect(files.some((f) => f.endsWith('src/index.ts'))).toBe(true);
  });
});


