export const PromptManager = {
  projectContext(
    deps: Record<string, string>,
    devDeps: Record<string, string>
  ): string {
    const depsList = Object.entries(deps)
      .map(([n, v]) => `${n}@${v}`)
      .join(", ");
    const devList = Object.entries(devDeps)
      .map(([n, v]) => `${n}@${v}`)
      .join(", ");
    return [
      "당신은 숙련된 소프트웨어 아키텍트입니다.",
      "다음 의존성 정보를 바탕으로 프로젝트의 기술 스택과 목적을 요약하세요.",
      `dependencies: ${depsList || "없음"}`,
      `devDependencies: ${devList || "없음"}`,
      "출력은 한국어 한 단락으로 작성하세요.",
    ].join("\n");
  },

  identifyBuildingBlocks(fileTreeSample: string): string {
    return [
      "다음 파일 트리를 검토하고, 상위 레벨 빌딩 블록(예: controllers, services, models, routes)을 요약한 뒤,",
      "핵심 비즈니스 로직을 포함할 것으로 예상되는 디렉토리/파일 5~10개를 중요도 순으로 나열하세요.",
      "- 각 항목에 간단한 이유를 덧붙이세요.",
      "- 가능하면 도메인 기준(feature-based) 관점도 고려하세요.",
      "한국어 리스트로 응답하세요.",
      "파일 트리 샘플:",
      fileTreeSample,
    ].join("\n");
  },

  deepAnalyzeFile(
    path: string,
    projectContext: string | undefined,
    fileContent: string
  ): string {
    const context = projectContext
      ? `프로젝트 컨텍스트 요약: ${projectContext}\n`
      : "";
    return [
      "당신은 시니어 소프트웨어 아키텍트이자 코드 리뷰어입니다.",
      context,
      `대상 파일 경로: ${path}`,
      "아래 코드에 대해 구조화된 JSON으로만 응답하세요. 설명 텍스트를 JSON 바깥에 쓰지 마세요.",
      "JSON 스키마는 다음과 같습니다:",
      "{",
      '  "path": string,',
      '  "codeGuideline": string,',
      '  "userStories": string[],',
      '  "dataFlow": string[],',
      '  "evaluation": {',
      '    "overEngineering": { "score": number, "reason": string },',
      '    "modularity": { "score": number, "reason": string },',
      '    "cleanCode": { "score": number, "reason": string }',
      "  },",
      '  "improvementPoints": [',
      '    { "category": "Over-engineering" | "Modularity" | "Clean Code",',
      '      "location": string, "issue": string, "suggestion": string }',
      "  ]",
      "}",
      "--- 코드 시작 ---",
      fileContent,
      "--- 코드 끝 ---",
      "주의사항:",
      "- 점수(score)는 0~100 정수로 작성하세요.",
      "- 한국어로 작성하세요.",
      "- 반드시 유효한 JSON만 출력하세요.",
    ].join("\n");
  },

  proposeStructure(currentTree: string, analysisSummary: string): string {
    return [
      "아래의 현재 프로젝트 파일 트리와 분석 요약을 바탕으로, 이상적인 최종 디렉토리 구조를 제안하세요.",
      "출력은 반드시 JSON으로만 작성하세요.",
      "{",
      '  "proposedTree": string,',
      '  "rationale": string',
      "}",
      "요구사항:",
      "- 도메인/기능 기반(feature-based) 구조 또는 DDD 관점을 적용하세요.",
      "- 역할 별 디렉토리의 책임을 간략히 설명에 포함하세요.",
      "--- 현재 파일 트리 ---",
      currentTree,
      "--- 분석 요약 ---",
      analysisSummary,
    ].join("\n");
  },

  planFromReport(tdd: boolean, xmlReport: string): string {
    return [
      "아래 코드베이스 분석 리포트를 바탕으로 리팩토링 실행 계획 XML을 생성하세요.",
      tdd
        ? "Kent Beck의 TDD 사이클(RED -> GREEN -> REFACTOR)을 각 작업에 반드시 포함하세요."
        : "각 작업에 제목/설명/우선순위를 포함한 일반 계획을 작성하세요.",
      "응답은 완전한 XML 문서로만 출력하세요. 루트 태그는 <plan> 여야 합니다.",
      "리포트:",
      xmlReport,
      "스키마 예시:",
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<plan basedOnReport="gemini-refactor-report.xml">',
      '  <task id="1" priority="high">',
      "    <title>작업 제목</title>",
      "    <description>작업 상세 설명</description>",
      tdd
        ? '    <tddCycle><step type="RED">...</step><step type="GREEN">...</step><step type="REFACTOR">...</step></tddCycle>'
        : "",
      "  </task>",
      "</plan>",
    ].join("\n");
  },
};
