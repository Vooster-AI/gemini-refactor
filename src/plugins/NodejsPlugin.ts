import fs from 'fs-extra';
import path from 'path';
import type { IPlugin, ProjectDetectionResult } from './IPlugin.js';

export class NodejsPlugin implements IPlugin {
  async detectProject(cwd: string): Promise<ProjectDetectionResult> {
    const pkgPath = path.join(cwd, 'package.json');
    const exists = await fs.pathExists(pkgPath);
    return {
      projectType: exists ? 'node' : 'unknown',
      rootPath: cwd,
    };
  }

  async getDependencies(cwd: string): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }> {
    const pkgPath = path.join(cwd, 'package.json');
    const pkg = await fs.readJSON(pkgPath);
    return {
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
    };
  }
}


