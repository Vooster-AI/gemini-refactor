import ora from "ora";
import { readFile } from "../utils/fileSystem.js";
import { PromptManager } from "../llm/PromptManager.js";
import { GeminiClient } from "../llm/GeminiClient.js";
import { logger } from "../utils/logger.js";

export interface DeepAnalyzeItemResult {
  path: string;
  codeGuideline: string;
  userStories: string[];
  dataFlow: string[];
  evaluation: {
    overEngineering: { score: number; reason: string };
    modularity: { score: number; reason: string };
    cleanCode: { score: number; reason: string };
  };
  improvementPoints: Array<{
    category: "Over-engineering" | "Modularity" | "Clean Code";
    location: string;
    issue: string;
    suggestion: string;
  }>;
  rawSummary?: string;
}

export async function deepAnalyze(
  cwd: string,
  items: string[],
  projectContext?: string
): Promise<DeepAnalyzeItemResult[]> {
  const spinner = ora("Analyzing files...").start();
  let client: GeminiClient | null = null;
  try {
    client = new GeminiClient();
  } catch (e) {
    logger.warn("GEMINI_API_KEY가 없어 LLM 분석을 건너뜁니다.");
  }
  const results: DeepAnalyzeItemResult[] = [];
  const stripFence = (text: string): string => {
    const trimmed = (text || "").trim();
    if (trimmed.startsWith("```")) {
      const withoutFirst = trimmed.replace(/^```[a-zA-Z]*\n?/, "");
      const withoutLast = withoutFirst.replace(/```\s*$/, "");
      return withoutLast.trim();
    }
    return trimmed;
  };
  try {
    for (const rel of items) {
      spinner.text = `Analyzing ${rel}...`;
      const content = await readFile(`${cwd}/${rel}`);
      if (client) {
        try {
          const prompt = PromptManager.deepAnalyzeFile(
            rel,
            projectContext,
            content
          );
          const raw = await client.generateText(prompt);
          const jsonText = stripFence(raw);
          const parsed = JSON.parse(jsonText);
          const item: DeepAnalyzeItemResult = {
            path: parsed.path ?? rel,
            codeGuideline: parsed.codeGuideline ?? "",
            userStories: Array.isArray(parsed.userStories)
              ? parsed.userStories
              : [],
            dataFlow: Array.isArray(parsed.dataFlow) ? parsed.dataFlow : [],
            evaluation: {
              overEngineering: {
                score: Number(parsed?.evaluation?.overEngineering?.score ?? 0),
                reason: parsed?.evaluation?.overEngineering?.reason ?? "",
              },
              modularity: {
                score: Number(parsed?.evaluation?.modularity?.score ?? 0),
                reason: parsed?.evaluation?.modularity?.reason ?? "",
              },
              cleanCode: {
                score: Number(parsed?.evaluation?.cleanCode?.score ?? 0),
                reason: parsed?.evaluation?.cleanCode?.reason ?? "",
              },
            },
            improvementPoints: Array.isArray(parsed.improvementPoints)
              ? parsed.improvementPoints
              : [],
          };
          results.push(item);
        } catch (e) {
          results.push({
            path: rel,
            codeGuideline: "",
            userStories: [],
            dataFlow: [],
            evaluation: {
              overEngineering: { score: 0, reason: "" },
              modularity: { score: 0, reason: "" },
              cleanCode: { score: 0, reason: "" },
            },
            improvementPoints: [],
            rawSummary: "(LLM 요청 실패)",
          });
        }
      } else {
        results.push({
          path: rel,
          codeGuideline: "",
          userStories: [],
          dataFlow: [],
          evaluation: {
            overEngineering: { score: 0, reason: "" },
            modularity: { score: 0, reason: "" },
            cleanCode: { score: 0, reason: "" },
          },
          improvementPoints: [],
          rawSummary: "(LLM 비활성화)",
        });
      }
    }
  } finally {
    spinner.stop();
  }
  logger.info(`심층 분석 완료: ${results.length}개 항목`);
  return results;
}
