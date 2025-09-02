## `gemini-refactor`: AI 기반 코드베이스 분석 및 리팩토링 계획 CLI 도구

제안하신 `gemini-refactor`는 매우 흥미롭고 강력한 개발자 도구가 될 잠재력을 가지고 있습니다. LLM을 활용하여 코드베이스의 구조적, 논리적 분석을 자동화하고 구체적인 개선 계획까지 제시하는 아이디어는 개발 생산성을 획기적으로 높일 수 있습니다.

아래에 `gemini-refactor`의 설계, 구현 계획, 핵심 로직을 구체화하여 정리했습니다.

---

### 1. 프로젝트 개요 (Project Overview)

- **도구명**: `gemini-refactor`
- **목표**: Node.js (및 플러그인을 통해 다른 플랫폼) 코드베이스를 분석하여 복잡도, 응집도, 모듈화 관점의 문제점을 진단하고, 이를 개선하기 위한 구체적인 디렉토리 구조 및 리팩토링 계획을 제안하는 CLI 도구.
- **핵심 기술**: Google Gemini (LLM), Node.js, Plugin-based Architecture
- **사용자**: 코드베이스의 유지보수성을 개선하고 싶은 개발자, 프로젝트에 새로 합류하여 빠르게 구조를 파악하고 싶은 개발자.

---

### 2. 아키텍처 및 핵심 개념 (Architecture & Core Concepts)

#### 가. Plugin-based Architecture

핵심 로직은 플랫폼에 독립적으로 설계하고, 특정 플랫폼(Node.js, Python, Java 등)에 종속적인 부분은 플러그인으로 분리합니다.

- **`Analyzer` (Core Engine)**: 전체 분석 프로세스를 조율하는 오케스트레이터.
- **`Plugin` (Interface)**: 플랫폼별로 구현해야 하는 인터페이스.
  - `detectProject(directory)`: 해당 플러그인이 처리할 수 있는 프로젝트인지 감지. (e.g., `package.json`이 있으면 `NodejsPlugin` 활성화)
  - `getDependencies(directory)`: 의존성 목록을 추출. (`package.json` 파싱)
  - `getProjectTree(directory)`: 프로젝트의 파일/폴더 구조를 텍스트로 생성.
  - `isBusinessLogic(filePath)`: 파일 경로를 기반으로 핵심 비즈니스 로직일 가능성이 높은지 판단하는 휴리스틱 제공.
- **`NodejsPlugin` (Implementation)**: `Plugin` 인터페이스의 Node.js 구현체.

#### 나. LLM Interaction Layer

Gemini API와의 모든 통신을 담당하는 모듈입니다. 프롬프트 엔지니어링이 가장 중요한 부분입니다.

- **`PromptManager`**: 각 분석 단계에 맞는 최적화된 프롬프트를 생성.
- **`GeminiClient`**: API 요청, 응답 처리, 에러 핸들링, 비용 관리 등을 담당.

---

### 3. 상세 워크플로우 (Detailed Workflow)

`gemini-refactor` 실행 시 내부적으로 일어나는 단계별 프로세스입니다.

**시작**: 사용자가 터미널에서 `gemini-refactor` 실행

#### **1단계: 프로젝트 초기화 및 의존성 파악**

- `NodejsPlugin.detectProject()`를 실행하여 `package.json` 파일 존재 여부 확인.
- `NodejsPlugin.getDependencies()`를 통해 `dependencies`와 `devDependencies`를 읽음.
- **LLM 입력**: 의존성 목록 (`"express", "react", "mongoose", ...`)
- **LLM 프롬프트**:
  > "다음 라이브러리 목록을 사용하는 Node.js 프로젝트입니다: [라이브러리 목록]. 이 프로젝트는 어떤 종류의 애플리케이션(예: 웹 서버, 프론트엔드 앱, CLI 도구)일 가능성이 높으며, 주요 기술 스택은 무엇입니까? 이 정보를 바탕으로 코드베이스 분석 시 어떤 점에 중점을 둬야 할지 간략히 요약해주세요."
- **결과**: LLM으로부터 프로젝트의 컨텍스트(e.g., "MERN 스택 기반의 웹 서비스")를 받아 후속 분석의 정확도를 높임.

#### **2단계: 빌딩 블록 및 핵심 로직 식별**

- `NodejsPlugin.getProjectTree()`를 통해 전체 폴더 구조를 텍스트 트리로 생성.
- **LLM 입력**: 폴더 트리, 1단계에서 파악한 프로젝트 컨텍스트.
- **LLM 프롬프트**:
  > "당신은 시니어 소프트웨어 아키텍트입니다. 다음은 [프로젝트 컨텍스트] 프로젝트의 디렉토리 구조입니다.
  >
  > ```
  > [폴더 트리 텍스트]
  > ```
  >
  > 이 구조를 바탕으로, top-level building blocks (e.g., controllers, services, models, routes)를 설명하고, 핵심 비즈니스 로직을 포함할 것으로 예상되는 가장 중요한 디렉토리 또는 파일을 5개에서 10개 사이로 중요도 순으로 나열해주세요."
- **후처리 로직**:
  1. LLM이 제안한 목록(e.g., `src/services`, `src/controllers/userController.js`)을 받음.
  2. 각 항목에 포함된 파일들의 총 글자 수를 계산.
  3. 글자 수가 300만 자(`ultrathink` 옵션 시 500만 자)를 초과하면, 해당 디렉토리를 더 작은 하위 디렉토리나 개별 파일로 분할하도록 LLM에 재요청하거나, 도구 자체적으로 분할. (e.g., `src/services`가 너무 크면 `src/services/payment`, `src/services/user`로 분리하여 분석하도록 유도)

#### **3단계: 각 빌딩 블록 심층 분석 및 평가**

- 2단계에서 식별된 각 디렉토리/파일에 대해 반복 수행.
- **LLM 입력**: 해당 디렉토리/파일에 포함된 모든 코드의 내용.
- **LLM 프롬프트 (Multi-turn Conversation 활용 가능)**:
  > "다음 코드 스니펫은 [프로젝트 컨텍스트]의 일부입니다.
  >
  > ```javascript
  > [선택된 디렉토리/파일의 전체 코드]
  > ```
  >
  > 위 코드를 심층적으로 분석하여 다음 항목에 대해 자세히 설명해주세요:
  >
  > 1.  **Code Guideline & Convention**: 이 코드에서 유추할 수 있는 코딩 스타일, 네이밍 컨벤션, 에러 처리 방식 등 가이드라인을 설명하세요.
  > 2.  **Detailed User Story**: 이 코드가 구현하고 있는 사용자 스토리 또는 기능 명세를 비즈니스 관점에서 구체적으로 서술하세요. (e.g., "사용자는 이메일과 비밀번호로 로그인할 수 있다.")
  > 3.  **Data Flow**: 주요 데이터의 흐름(입력, 처리, 출력)을 단계별로 설명하세요. 외부 API 호출이나 데이터베이스 상호작용이 있다면 명시하세요.
  > 4.  **Evaluation Score (100점 만점)**: 다음 세 가지 관점에서 코드를 평가하고, 각 항목에 대한 점수와 구체적인 근거를 제시하세요.
  >     - **Over-engineering**: 불필요하게 복잡하거나 과도한 추상화가 있는지 (높을수록 좋음)
  >     - **Modularity (모듈화/응집도)**: 기능 단위로 잘 분리되어 있고, 하나의 모듈이 하나의 책임만 지고 있는지 (높을수록 좋음)
  >     - **Clean Code (클린 코드)**: 변수명, 함수 길이, 주석, 가독성 등이 얼마나 뛰어난지 (높을수록 좋음)"
- **결과**: 각 핵심 영역에 대한 구조화된 분석 결과 및 정량적 평가 점수 확보.

#### **4단계: 디렉토리 구조 개선 제안**

- **LLM 입력**: 현재 폴더 트리, 3단계에서 얻은 모든 빌딩 블록의 분석 내용 (특히 모듈화/응집도 문제점).
- **LLM 프롬프트**:
  > "지금까지 분석한 내용을 종합하겠습니다. [3단계 분석 결과 요약]. 현재 디렉토리 구조는 다음과 같습니다:
  >
  > ```
  > [현재 폴더 트리]
  > ```
  >
  > 분석된 문제점(특히 낮은 응집도, 불분명한 책임 분리)을 해결하고, 도메인 주도 설계(DDD) 또는 기능 기반(feature-based) 구조와 같은 모범 사례를 적용하여 이상적인 최종 디렉토리 구조를 제안해주세요. 각 디렉토리의 역할에 대해 간략한 설명을 덧붙여주세요."
- **결과**: 개선된 폴더 트리 구조 텍스트.

#### **5단계: 종합 개선 포인트 나열**

- 3단계에서 도출된 모든 평가 항목(Over-engineering, Modularity, Clean Code)의 문제점들을 취합하고 요약.
- **LLM 입력**: 3단계의 모든 평가 결과.
- **LLM 프롬프트**:
  > "3단계에서 평가된 모든 코드 블록의 'Over-engineering', 'Modularity', 'Clean Code' 관련 문제점들을 종합하여, 개발자가 즉시 실행에 옮길 수 있는 구체적인 개선 액션 아이템 목록을 만들어주세요. 비슷한 문제는 하나로 묶어서 요약해주세요."
- **결과**: 구체적인 리팩토링 제안 목록.

#### **6단계: 리포트 파일 생성 (`gemini-refactor-report.xml`)**

- 4단계와 5단계의 결과를 XML 형식으로 구조화하여 파일로 저장. `xmlbuilder-js` 같은 라이브러리 사용.

#### **7단계: 실행 계획 파일 생성 (`gemini-refactor-plan.xml`)**

- **LLM 입력**: `gemini-refactor-report.xml` 파일의 내용.
- **LLM 프롬프트 (기본)**:
  > "다음 코드베이스 분석 리포트를 기반으로, 리팩토링을 위한 상세하고 단계적인 작업 계획을 세워주세요. 각 작업은 제목, 상세 설명, 예상 난이도(상/중/하)를 포함해야 합니다. 의존성이 있는 작업은 순서를 고려하여 계획을 수립해주세요."
- **LLM 프롬프트 (`--tdd` 옵션 사용 시)**:
  > "다음 코드베이스 분석 리포트를 기반으로, 리팩토링을 위한 상세하고 단계적인 작업 계획을 세워주세요. **Kent Beck의 Red/Green/Refactor 접근법**을 반드시 적용해야 합니다. 각 주요 리팩토링 작업에 대해 다음 3단계로 계획을 나누어 제시해주세요.
  >
  > - **RED**: 이 리팩토링이 필요한 이유를 검증할 수 있는 '실패하는 테스트 케이스'를 작성하는 방법에 대한 가이드.
  > - **GREEN**: 테스트를 통과시키기 위한 최소한의 코드 변경 또는 구현 가이드.
  > - **REFACTOR**: 테스트가 통과하는 상태에서, 코드의 구조를 개선하고 중복을 제거하는 방법에 대한 가이드."

---

### 4. CLI 사용법 및 옵션 (CLI Usage & Options)

```bash
# 전역 설치
npm i -g gemini-refactor

# 현재 디렉토리에서 분석 시작
gemini-refactor

# 옵션과 함께 사용
gemini-refactor --ultrathink --tdd --output-dir ./refactor-reports
```

- `--ultrathink`: 분석할 코드 청크의 최대 글자 수를 500만으로 늘립니다 (API 비용 증가 가능).
- `--tdd`: 리팩토링 계획을 TDD (Red/Green/Refactor) 사이클에 맞춰 생성합니다.
- `--output-dir <path>`: 리포트와 계획 파일이 생성될 디렉토리를 지정합니다. (기본값: 현재 디렉토리)
- `-h, --help`: 도움말을 표시합니다.

---

### 5. 결과물 예시 (Output Examples)

#### `gemini-refactor-report.xml` 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<report project="my-awesome-app" timestamp="2023-10-27T10:00:00Z">
  <summary>
    <projectType>Node.js Express-based REST API with Mongoose</projectType>
    <overallScore modularity="65" cleanCode="78" overEngineering="85" />
    <keyFindings>
      The 'services' directory has low cohesion, mixing user authentication with payment processing. The 'utils' directory has become a dumping ground for unrelated functions.
    </keyFindings>
  </summary>
  <directoryStructureAnalysis>
    <current>
      <![CDATA[
.
├── src
│   ├── controllers
│   │   └── user.js
│   ├── models
│   │   └── user.js
│   └── services
│       └── api.js
      ]]>
    </current>
    <proposed>
      <![CDATA[
.
├── src
│   ├── features
│   │   ├── auth
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   └── payment
│   │       ├── payment.controller.js
│   │       ├── payment.service.js
│   │       └── payment.model.js
│   ├── core
│   │   ├── middleware
│   │   └── config
      ]]>
    </proposed>
    <rationale>
      The proposed feature-based structure improves cohesion by grouping related files by domain. This makes the codebase easier to navigate and maintain.
    </rationale>
  </directoryStructureAnalysis>
  <improvementPoints>
    <category name="Modularity">
      <point priority="high">
        <location>src/services/api.js</location>
        <issue>This single service file handles user logic, product logic, and payment logic. Its responsibility is too broad.</issue>
        <suggestion>Split 'api.js' into 'auth.service.js', 'product.service.js', and 'payment.service.js' and place them in their respective feature directories.</suggestion>
      </point>
    </category>
    <category name="Clean Code">
      <point priority="medium">
        <location>src/controllers/user.js</location>
        <issue>The 'processUserData' function is over 150 lines long and has a high cyclomatic complexity.</issue>
        <suggestion>Refactor 'processUserData' by extracting smaller, single-purpose functions like 'validateInput', 'hashPassword', and 'saveUserToDB'.</suggestion>
      </point>
    </category>
  </improvementPoints>
</report>
```

#### `gemini-refactor-plan.xml` (`--tdd` 옵션) 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plan basedOnReport="gemini-refactor-report.xml">
  <task id="1" priority="high">
    <title>Refactor 'services/api.js' into feature-based services</title>
    <description>
      Split the monolithic 'api.js' service into smaller, more focused services (auth, product, payment) to improve modularity and cohesion.
    </description>
    <tddCycle>
      <step type="RED">
        Write an integration test for the user authentication endpoint that currently uses 'api.js'. Confirm it fails if 'api.js' is modified. This test will serve as a safety net.
      </step>
      <step type="GREEN">
        Create a new 'src/features/auth/auth.service.js' file. Copy the authentication-related methods from 'api.js' to the new file with minimal changes. Update the auth controller to use the new 'auth.service.js'. Run the test from the RED step to ensure it now passes.
      </step>
      <step type="REFACTOR">
        With the tests passing, clean up the newly created 'auth.service.js'. Remove any unused dependencies, improve variable names, and add necessary documentation. Finally, remove the now-redundant authentication code from the original 'api.js'.
      </step>
    </tddCycle>
  </task>
  <task id="2" priority="medium">
    <title>Simplify 'processUserData' function in 'user.js' controller</title>
    ...
  </task>
</plan>
```
