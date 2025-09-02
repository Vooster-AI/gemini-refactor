import { create } from "xmlbuilder2";
import fs from "fs-extra";

export interface ReportScore {
  overEngineering: number;
  modularity: number;
  cleanCode: number;
}

export interface ImprovementPoint {
  category: "Over-engineering" | "Modularity" | "Clean Code";
  location: string;
  issue: string;
  suggestion: string;
}

export interface ReportData {
  projectContext?: string;
  currentTree: string;
  proposedTree?: string;
  proposedRationale?: string;
  averageScore?: ReportScore;
  improvements: ImprovementPoint[];
}

export async function generateReportXml(
  outputPath: string,
  data: ReportData
): Promise<void> {
  const root = create({ version: "1.0" }).ele("gemini-refactor-report");

  const summary = root.ele("summary");
  if (data.projectContext) {
    summary.ele("projectContext").txt(data.projectContext).up();
  }
  const score = data.averageScore ?? {
    overEngineering: 0,
    modularity: 0,
    cleanCode: 0,
  };
  summary
    .ele("overallScore")
    .att("modularity", String(score.modularity))
    .att("cleanCode", String(score.cleanCode))
    .att("overEngineering", String(score.overEngineering))
    .up();

  const keyFindings = data.improvements
    .slice(0, 5)
    .map((p) => `${p.location}: ${p.issue}`)
    .join("\n");
  summary
    .ele("keyFindings")
    .txt(keyFindings || "No significant findings")
    .up();

  const dir = root.ele("directoryStructureAnalysis");
  dir.ele("current").dat(data.currentTree).up();
  if (data.proposedTree) {
    dir.ele("proposed").dat(data.proposedTree).up();
  }
  if (data.proposedRationale) {
    dir.ele("rationale").txt(data.proposedRationale).up();
  }

  const improvements = root.ele("improvementPoints");
  const categories: Array<"Over-engineering" | "Modularity" | "Clean Code"> = [
    "Over-engineering",
    "Modularity",
    "Clean Code",
  ];
  for (const cat of categories) {
    const catPoints = data.improvements.filter((p) => p.category === cat);
    if (catPoints.length === 0) continue;
    const catNode = improvements.ele("category").att("name", cat);
    for (const p of catPoints) {
      const point = catNode.ele("point");
      point.ele("location").txt(p.location).up();
      point.ele("issue").txt(p.issue).up();
      point.ele("suggestion").txt(p.suggestion).up();
      point.up();
    }
    catNode.up();
  }

  const xml = root.end({ prettyPrint: true });
  await fs.outputFile(outputPath, xml, "utf-8");
}
