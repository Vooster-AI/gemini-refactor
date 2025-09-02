export interface ProjectDetectionResult {
  projectType: 'node' | 'unknown';
  rootPath: string;
}

export interface IPlugin {
  detectProject(cwd: string): Promise<ProjectDetectionResult>;
  getDependencies(cwd: string): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }>;
}


