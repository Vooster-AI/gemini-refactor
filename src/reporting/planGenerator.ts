import { create } from "xmlbuilder2";
import fs from "fs-extra";
import { PromptManager } from "../llm/PromptManager.js";
import { GeminiClient } from "../llm/GeminiClient.js";

export async function generatePlanXml(
  fromReportXml: string,
  toPlanXml: string,
  tdd: boolean
): Promise<void> {
  const xmlContent = await fs.readFile(fromReportXml, "utf-8");
  let planText = "";
  try {
    const prompt = PromptManager.planFromReport(tdd, xmlContent);
    const client = new GeminiClient();
    planText = await client.generateText(prompt);
  } catch (e) {
    planText = "LLM 비활성화 상태에서 기본 계획을 사용합니다.";
  }

  const stripFence = (text: string): string => {
    const trimmed = (text || "").trim();
    if (trimmed.startsWith("```")) {
      const withoutFirst = trimmed.replace(/^```[a-zA-Z]*\n?/, "");
      const withoutLast = withoutFirst.replace(/```\s*$/, "");
      return withoutLast.trim();
    }
    return trimmed;
  };

  const sanitized = stripFence(planText);
  const isXmlPlan =
    /^<\?xml[\s\S]*<plan[\s\S]*>/i.test(sanitized) ||
    /^<plan[\s\S]*>/i.test(sanitized);
  if (isXmlPlan) {
    await fs.outputFile(toPlanXml, sanitized, "utf-8");
    return;
  }

  const xml = create({ version: "1.0" })
    .ele("gemini-refactor-plan")
    .ele("content")
    .txt(sanitized)
    .up()
    .end({ prettyPrint: true });

  await fs.outputFile(toPlanXml, xml, "utf-8");
}
