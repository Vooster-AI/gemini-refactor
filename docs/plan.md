## `gemini-refactor` 상세 구현 계획서

이 문서는 `gemini-refactor` CLI 도구 개발을 위한 단계별 구현 계획을 상세히 기술합니다.

### 1. 기술 스택 및 주요 라이브러리

- **언어**: Node.js (v18.x 이상 권장)
- **런타임**: TypeScript (코드 안정성 및 유지보수성 확보)
- **CLI 프레임워크**: `commander.js` (인자 파싱 및 명령어 관리)
- **LLM API 클라이언트**: `@google/generative-ai` (Google Gemini API 공식 SDK)
- **파일 시스템**: `fs-extra` (Node.js `fs` 모듈의 확장 버전), `glob` (파일 패턴 매칭)
- **XML 생성**: `xmlbuilder2` (직관적인 API로 XML 생성)
- **사용자 경험(UX)**: `chalk` (터미널 출력 색상), `ora` (진행 상태 스피너)
- **환경 변수 관리**: `dotenv` (API 키 등 민감 정보 관리)
- **테스트 프레임워크**: `jest` (유닛 및 통합 테스트), `ts-jest` (Jest에서 TypeScript 지원)
- **패키지 매니저**: `npm` 또는 `yarn`

---

### 2. 프로젝트 구조 (디렉토리)

```
gemini-refactor/
├── bin/
│   └── gemini-refactor.js      # CLI 실행 스크립트
├── src/
│   ├── analysis/               # 분석 워크플로우 로직
│   │   ├── 1_initializeProject.ts
│   │   ├── 2_identifyBuildingBlocks.ts
│   │   ├── 3_deepAnalyze.ts
│   │   └── ... (각 단계별 모듈)
│   ├── cli/                    # CLI 인터페이스 및 옵션 처리
│   │   └── commands.ts
│   ├── core/                   # 핵심 엔진 및 오케스트레이터
│   │   └── Analyzer.ts
│   ├── llm/                    # LLM 상호작용 관련
│   │   ├── GeminiClient.ts
│   │   └── PromptManager.ts
│   ├── plugins/                # 플랫폼별 플러그인
│   │   ├── IPlugin.ts          # 플러그인 인터페이스
│   │   └── NodejsPlugin.ts
│   ├── reporting/              # 리포트 및 계획 생성
│   │   ├── reportGenerator.ts
│   │   └── planGenerator.ts
│   ├── types/                  # 공통 타입 정의
│   │   └── index.ts
│   └── utils/                  # 유틸리티 함수
│       ├── fileSystem.ts
│       └── logger.ts
├── tests/
│   ├── __mocks__/
│   └── analysis/
│       └── ... (분석 로직 테스트)
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

### 3. 개발 단계별 계획 (Phased Implementation Plan)

#### **Phase 1: 프로젝트 기초 및 CLI 골격 (예상 소요: 1주)**

1.  **프로젝트 초기화**:
    - `npm init` 및 `tsc --init` 실행.
    - `package.json`에 `devDependencies` (`typescript`, `ts-node`, `@types/node` 등)와 `dependencies` 추가.
    - `.gitignore`, `.env.example`, `tsconfig.json` 설정.
2.  **CLI 엔트리 포인트 설정**:
    - `package.json`의 `bin` 필드에 실행 파일 경로(`bin/gemini-refactor.js`) 추가.
    - `bin/gemini-refactor.js` 파일 작성 (shebang `#!/usr/bin/env node` 포함). 이 파일은 컴파일된 `dist/` 폴더의 메인 파일을 실행.
3.  **CLI 명령어 및 옵션 정의**:
    - `src/cli/commands.ts`에서 `commander`를 사용하여 `gemini-refactor` 기본 명령어와 `--ultrathink`, `--tdd`, `--output-dir` 옵션을 정의.
4.  **로거 및 파일 시스템 유틸리티 구현**:
    - `src/utils/logger.ts`: `chalk`를 사용해 정보, 경고, 에러 메시지를 색상으로 구분하여 출력하는 로거 구현.
    - `src/utils/fileSystem.ts`: 디렉토리 트리 생성, 파일 내용 읽기, 글자 수 계산 등 파일 관련 함수 구현.
5.  **플러그인 아키텍처 기초 설계**:
    - `src/plugins/IPlugin.ts`: 플러그인 인터페이스 정의.
    - `src/plugins/NodejsPlugin.ts`: 인터페이스의 기본 골격 구현. `detectProject()`와 `getDependencies()` 함수 우선 구현.

**Phase 1 완료 목표**: `gemini-refactor` 실행 시 "분석을 시작합니다..." 메시지를 출력하고, `package.json`을 읽어 의존성 목록을 콘솔에 출력할 수 있다.

#### **Phase 2: LLM 연동 및 핵심 파일 식별 (예상 소요: 1.5주)**

1.  **LLM 클라이언트 및 프롬프트 매니저 구현**:
    - `src/llm/GeminiClient.ts`: `dotenv`로 API 키를 로드하고, `@google/generative-ai` SDK를 사용하여 LLM에 텍스트를 전송하고 응답을 받는 클래스 구현.
    - `src/llm/PromptManager.ts`: 각 분석 단계별 프롬프트를 생성하는 함수들을 모아놓은 모듈. 프롬프트는 템플릿 문자열 형태로 관리.
2.  **`Analyzer` 오케스트레이터 구현**:
    - `src/core/Analyzer.ts`: 전체 분석 프로세스를 순차적으로 실행하는 메인 클래스. 옵션(context)을 생성자에서 받아 관리.
3.  **워크플로우 1, 2단계 구현**:
    - `src/analysis/1_initializeProject.ts`: `NodejsPlugin`을 사용해 의존성을 파악하고, `GeminiClient`를 통해 프로젝트 컨텍스트를 LLM으로부터 받아오는 로직 구현.
    - `src/analysis/2_identifyBuildingBlocks.ts`: 파일 트리를 생성하고, LLM에 전송하여 핵심 디렉토리/파일 목록을 받아오는 로직 구현.
    - 글자 수 제한 로직(`ultrathink` 옵션 처리) 구현.

**Phase 2 완료 목표**: `gemini-refactor` 실행 시, LLM이 식별한 "프로젝트 컨텍스트"와 "핵심 비즈니스 로직 포함 파일/디렉토리 목록"을 콘솔에 출력할 수 있다.

#### **Phase 3: 심층 분석 및 리포트 생성 (예상 소요: 2주)**

1.  **워크플로우 3단계(심층 분석) 구현**:
    - `src/analysis/3_deepAnalyze.ts` 모듈 구현.
    - 2단계에서 식별된 각 항목을 순회하며 파일 내용을 읽어 LLM에 전송.
    - LLM의 응답(가이드라인, 유저 스토리, 데이터 흐름, 평가 점수 등)을 파싱하여 구조화된 데이터 객체로 저장.
    - `ora` 스피너를 사용해 "Analyzing `src/services`..."와 같이 진행 상태를 사용자에게 표시.
2.  **워크플로우 4, 5단계(개선안 도출) 구현**:
    - 3단계에서 얻은 모든 분석 결과를 종합하여 LLM에 다시 전송.
    - 개선된 디렉토리 구조(4단계)와 종합 개선 포인트 목록(5단계)을 받아옴.
3.  **XML 리포트 생성 로직 구현**:
    - `src/reporting/reportGenerator.ts`: `xmlbuilder2`를 사용하여 4, 5단계 결과를 `gemini-refactor-report.xml` 파일 형식에 맞게 생성.

**Phase 3 완료 목표**: `gemini-refactor` 실행 후, 분석 대상 폴더에 상세 내용이 담긴 `gemini-refactor-report.xml` 파일이 성공적으로 생성된다.

#### **Phase 4: 실행 계획 생성 및 기능 완성 (예상 소요: 1주)**

1.  **워크플로우 7단계(실행 계획 생성) 구현**:
    - `src/reporting/planGenerator.ts` 모듈 구현.
    - 생성된 `gemini-refactor-report.xml` 파일을 읽음.
    - `--tdd` 옵션 유무에 따라 `PromptManager`에서 다른 프롬프트를 선택.
    - LLM에 리포트 내용을 전송하여 작업 계획을 받아오고, `gemini-refactor-plan.xml` 파일로 저장.
2.  **전체 워크플로우 통합**:
    - `src/core/Analyzer.ts`에서 1단계부터 7단계까지 모든 분석 모듈을 순차적으로 호출하도록 최종 조립.
    - CLI 옵션이 `Analyzer` 클래스에 올바르게 전달되어 각 단계에 영향을 미치는지 확인.

**Phase 4 완료 목표**: 모든 기능이 정상 작동한다. `--tdd` 옵션에 따라 다른 내용의 `gemini-refactor-plan.xml` 파일이 생성된다.

#### **Phase 5: 테스트, 리팩토링 및 배포 준비 (예상 소요: 1.5주)**

1.  **테스트 코드 작성**:
    - **유닛 테스트**: `utils`의 순수 함수들, `PromptManager`의 프롬프트 생성 로직 등 독립적인 모듈에 대한 테스트 작성.
    - **통합 테스트**: `GeminiClient`를 Mocking하여 실제 API 호출 없이 전체 `Analyzer` 워크플로우가 정상적으로 실행되는지 테스트.
2.  **에러 핸들링 강화**:
    - API 키가 없을 때, 파일 읽기 실패 시, LLM 응답이 예상과 다른 형식일 때 등 예외 상황에 대한 처리 로직 추가.
3.  **코드 리팩토링 및 문서화**:
    - 전체 코드베이스를 검토하며 가독성 및 유지보수성 개선.
    - `README.md` 파일에 상세한 사용법, 옵션 설명, 예시, API 키 설정 방법 등을 작성.
    - JSDoc 등을 활용하여 주요 함수 및 클래스에 주석 추가.
4.  **NPM 배포 준비**:
    - `package.json`의 `name`, `version`, `repository`, `files` 등 필드 최종 점검.
    - `npm publish`를 통한 배포.

---

### 4. 위험 요소 및 대응 방안

- **LLM 응답의 비일관성**:
  - **대응**: 프롬프트 엔지니어링을 지속적으로 개선하고, 출력 형식을 JSON으로 명시하여 안정성을 높인다. 응답 파싱 실패 시 재시도 로직을 추가한다.
- **LLM API 비용**:
  - **대응**: 개발/테스트 시에는 Mocking을 적극 활용한다. 사용자에게 토큰 사용량이나 예상 비용을 경고하는 옵션을 추가하는 것을 고려한다.
- **분석 가능한 코드 크기 제한**:
  - **대응**: 글자 수 제한 로직을 정교
