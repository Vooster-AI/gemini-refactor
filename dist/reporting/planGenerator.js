import { create } from 'xmlbuilder2';
import fs from 'fs-extra';
import { PromptManager } from '../llm/PromptManager.js';
import { GeminiClient } from '../llm/GeminiClient.js';
export async function generatePlanXml(fromReportXml, toPlanXml, tdd) {
    const xmlContent = await fs.readFile(fromReportXml, 'utf-8');
    let planText = '';
    try {
        const prompt = PromptManager.planFromReport(tdd, xmlContent);
        const client = new GeminiClient();
        planText = await client.generateText(prompt);
    }
    catch (e) {
        planText = 'LLM 비활성화 상태에서 기본 계획을 사용합니다.';
    }
    const xml = create({ version: '1.0' })
        .ele('gemini-refactor-plan')
        .ele('content')
        .txt(planText)
        .up()
        .end({ prettyPrint: true });
    await fs.outputFile(toPlanXml, xml, 'utf-8');
}
//# sourceMappingURL=planGenerator.js.map