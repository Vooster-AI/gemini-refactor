import { create } from 'xmlbuilder2';
import fs from 'fs-extra';
export async function generateReportXml(outputPath, data) {
    const root = create({ version: '1.0' })
        .ele('gemini-refactor-report')
        .ele('improvedStructure')
        .txt(data.improvedStructure)
        .up()
        .ele('insights');
    for (const i of data.insights) {
        root.ele('point').txt(i).up();
    }
    const xml = root.end({ prettyPrint: true });
    await fs.outputFile(outputPath, xml, 'utf-8');
}
//# sourceMappingURL=reportGenerator.js.map