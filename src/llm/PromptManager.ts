export const PromptManager = {
  projectContext(deps: Record<string, string>, devDeps: Record<string, string>): string {
    const depsList = Object.entries(deps).map(([n, v]) => `${n}@${v}`).join(', ');
    const devList = Object.entries(devDeps).map(([n, v]) => `${n}@${v}`).join(', ');
    return [
      '당신은 숙련된 소프트웨어 아키텍트입니다.',
      '다음 의존성 정보를 바탕으로 프로젝트의 기술 스택과 목적을 요약하세요.',
      `dependencies: ${depsList || '없음'}`,
      `devDependencies: ${devList || '없음'}`,
      '출력은 한국어 한 단락으로 작성하세요.'
    ].join('\n');
  },

  identifyBuildingBlocks(fileTreeSample: string): string {
    return [
      '다음 파일 트리에서 핵심 비즈니스 로직과 관련된 디렉토리/파일 상위 10개를 식별하세요.',
      '각 항목은 간단한 이유를 덧붙이세요. 한국어 리스트로 응답하세요.',
      '파일 트리 샘플:',
      fileTreeSample
    ].join('\n');
  },

  planFromReport(tdd: boolean, xmlReport: string): string {
    return [
      '아래 XML 리포트를 바탕으로 실행 계획을 작성하세요.',
      tdd ? 'TDD 전략(RED/GREEN/REFACTOR)을 분명히 반영하세요.' : '일반 구현 계획으로 작성하세요.',
      '산출물은 XML 형식의 계획이어야 합니다.',
      xmlReport
    ].join('\n');
  }
};
