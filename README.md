# gemini-refactor

AI 기반 코드베이스 분석 및 리팩토링 계획 CLI 도구

## 개요

`gemini-refactor`는 Google Gemini LLM을 활용하여 Node.js 프로젝트의 코드베이스를 자동으로 분석하고, 구조적 개선점과 구체적인 리팩토링 계획을 제안하는 CLI 도구입니다.

### 주요 기능

- 📊 **자동 코드베이스 분석**: 프로젝트 구조, 의존성, 핵심 로직을 AI가 분석
- 🎯 **상세 평가**: Over-engineering, Modularity, Clean Code 관점에서 0-100점 평가
- 🏗️ **구조 개선 제안**: DDD/Feature-based 구조로 디렉토리 재구성 제안
- 📋 **실행 계획 생성**: 구체적인 리팩토링 작업 단계별 계획
- 🧪 **TDD 지원**: Kent Beck의 RED/GREEN/REFACTOR 사이클 적용 계획
- 🚫 **`.gitignore` 반영**: 분석 대상에서 불필요한 파일 자동 제외

## 설치

### 전역 설치 (권장)

```bash
npm install -g gemini-refactor
```

## 사용법

### 1. 환경 설정

Google Gemini API 키가 필요합니다:

```bash
# .env 파일 생성 또는 환경변수 설정
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

### 2. 기본 사용

프로젝트 루트에서 실행:

```bash
gemini-refactor
```

### 3. 옵션 사용

```bash
# 상세 분석 (더 많은 파일 분석, 비용 증가 가능)
gemini-refactor --ultrathink

# TDD 최적화 계획 생성
gemini-refactor --tdd

# 출력 디렉토리 지정
gemini-refactor --output-dir ./analysis-results

# 모든 옵션 조합
gemini-refactor --ultrathink --tdd --output-dir ./reports
```

### 4. 결과 확인

분석 완료 후 다음 파일들이 생성됩니다:

- `gemini-refactor-report.xml`: 상세 분석 리포트
- `gemini-refactor-plan.xml`: 실행 계획

## 리포트 예시

### 분석 리포트 (`gemini-refactor-report.xml`)

```xml
<?xml version="1.0"?>
<gemini-refactor-report>
  <summary>
    <projectContext>Express.js 기반 REST API 서버...</projectContext>
    <overallScore modularity="65" cleanCode="78" overEngineering="85"/>
    <keyFindings>
      src/services/api.js: 단일 서비스 파일이 너무 많은 책임을 가짐
      src/controllers/user.js: processUserData 함수가 150줄 이상으로 복잡함
    </keyFindings>
  </summary>
  <directoryStructureAnalysis>
    <current><![CDATA[
      src/
      ├── controllers/
      ├── models/
      └── services/
    ]]></current>
    <proposed><![CDATA[
      src/
      ├── features/
      │   ├── auth/
      │   ├── user/
      │   └── payment/
      └── core/
          ├── middleware/
          └── config/
    ]]></proposed>
  </directoryStructureAnalysis>
  <improvementPoints>
    <category name="Modularity">
      <point>
        <location>src/services/api.js</location>
        <issue>단일 파일이 인증, 결제, 사용자 로직을 모두 처리</issue>
        <suggestion>도메인별로 auth.service.js, payment.service.js로 분리</suggestion>
      </point>
    </category>
  </improvementPoints>
</gemini-refactor-report>
```

### 실행 계획 (`gemini-refactor-plan.xml`)

TDD 옵션 사용 시:

```xml
<?xml version="1.0"?>
<plan basedOnReport="gemini-refactor-report.xml">
  <task id="1" priority="high">
    <title>services/api.js를 도메인별 서비스로 분리</title>
    <description>모놀리식 api.js를 auth, user, payment 서비스로 분리하여 응집도 향상</description>
    <tddCycle>
      <step type="RED">기존 API 엔드포인트에 대한 통합 테스트 작성 후 실패 확인</step>
      <step type="GREEN">auth.service.js 생성 및 인증 관련 메서드 이동, 테스트 통과</step>
      <step type="REFACTOR">코드 정리, 중복 제거, 문서화 추가</step>
    </tddCycle>
  </task>
</plan>
```

## 시스템 요구사항

- **Node.js**: >= 18.0.0
- **Google Gemini API Key**: 필수
- **지원 프로젝트**: Node.js (package.json 필요)

## 비용 고려사항

- Gemini API 사용량에 따라 비용 발생
- `--ultrathink` 옵션 사용 시 더 많은 토큰 소모
- 분석 전 예상 비용이 표시되며 사용자 확인 후 진행

## 라이선스

ISC

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 문제 해결

### 일반적인 문제

**Q: "GEMINI_API_KEY가 없다" 오류**
A: `.env` 파일에 `GEMINI_API_KEY=your_key` 추가 또는 환경변수 설정

**Q: 분석 대상 파일이 너무 많아 비용이 걱정됨**
A: `.gitignore`에 제외할 디렉토리 추가 또는 `--ultrathink` 옵션 제거

**Q: 특정 파일이 분석되지 않음**
A: `.gitignore` 규칙 확인, 파일이 실제로 존재하는지 확인

---

**gemini-refactor**로 더 나은 코드 구조를 만들어보세요! 🚀
