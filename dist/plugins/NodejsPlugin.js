import fs from 'fs-extra';
import path from 'path';
export class NodejsPlugin {
    async detectProject(cwd) {
        const pkgPath = path.join(cwd, 'package.json');
        const exists = await fs.pathExists(pkgPath);
        return {
            projectType: exists ? 'node' : 'unknown',
            rootPath: cwd,
        };
    }
    async getDependencies(cwd) {
        const pkgPath = path.join(cwd, 'package.json');
        const pkg = await fs.readJSON(pkgPath);
        return {
            dependencies: pkg.dependencies ?? {},
            devDependencies: pkg.devDependencies ?? {},
        };
    }
}
//# sourceMappingURL=NodejsPlugin.js.map