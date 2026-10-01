# QA Studio

QA Studio는 AI Native 웹/모바일 애플리케이션의 개발 및 QA 프로세스를 가속화하기 위해 설계된 AI Native 테스팅 자동화 플랫폼입니다.

## QA 업무 자동화 용어 정의

- Task: Test Suite -- 여러개의 Test Case로 구성된 업무묶음
- Sub-task: Test Case -- 실제적인 단일 업무 단위
- Pre-phase: before in Test Case -- 업무 수행전 데이터 수집, 환경 설정등을 하는 단계
- Main-phase: test steps in Test Case -- 업무 수행의 핵심 로직을 실행하는 단계
- Post-phase: after in Test Case -- 업무 수행 후 결과 저장, 알림 발송등을 하는 단계
- Step: before, test steps, after를 아우르는 표현. 각각은 여러 step으로 이루어짐.
- Action: Step 안에서의 구체적인 행동 단위
- Tool: action을 실행할 수 있는 도구. 실행 주체에 따라 다름.
  - CODE : action을 실행하는 코드
  - AI : action을 실행하는 AI
  - HUMAN : action을 실행하는 사람

## QA 주요 업무 별 자동화

### 0. 테스트 계획 수립: 주체 -- AI, HUMAN

- 테스트 범위 정의
- 테스트 전략, 테스트 환경, 테스트 일정, 테스트 예산 등을 정의
- 테스트 계획서 작성
- 테스트 데이터 준비
- Happy-path 시나리오 작성

**자동화**: 사용자 시나리오 기반 테스트 계획 생성

> Input: 사용자 시나리오
> Output: 테스트 계획서, happy-path 시나리오
> 주체: AI, (HUMAN)
> 사용자 시나리오를 기반으로 테스트 계획서를 작성하고 happy-path 시나리오를 생성함

### 1. 테스트 작성: 주체 -- CODE, AI

> 수립된 계획에 따른 다양한 테스트 작성

- Happy-path 테스트
  - Happy-path 시나리오 기반 테스트 확장

**자동화**: 사용자 시나리오 녹화 기반 테스트 생성

> Input: 테스트 계획, happy-path 시나리오
> Output: happy-path 테스트 스크립트
> 주체: CODE, AI, (HUMAN)
> happy-path 시나리오를 기반으로 Application을 실행하면 happy-path 테스트를 생성됨

- Unhappy-path 테스트
  - Unhappy 시나리오 기반 테스트 확장

**자동화**: 생성된 Happy-path 테스트를 변형한 Unhappy-path 테스트 생성

> Input: happy-path 테스트 스크립트
> Output: unhappy-path 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 unhappy-path 테스트를 생성함

- Boundary(Edge-case) 테스트
  - Boundary 시나리오 기반 테스트 확장

**자동화**: 생성된 Happy-path 테스트의 Boundary 테스트 케이스 생성

> Input: happy-path 테스트 스크립트
> Output: boundary-path 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 boundary-path 테스트를 생성함

- API 테스트
  - API 명세서 기반 테스트 작성

**자동화**: API 명세서 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, API 명세서
> Output: API 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 API 테스트 스크립트를 생성함

- Accessibility Test
  - WCAG 스펙 기반 테스트 작성

**자동화**: WCAG 스펙 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, WCAG 스펙
> Output: Accessibility 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Accessibility 테스트 스크립트를 생성함

- Visual Test
  - Design 가이드 기반 테스트 작성

**자동화**: Design 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Design 가이드
> Output: Visual 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Visual 테스트 스크립트를 생성함

- Localization Test
  - Design 가이드 기반 테스트 작성

**자동화**: Design 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Design 가이드
> Output: Localization 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Localization 테스트 스크립트를 생성함

- Usability Test
  - User Experience 가이드 기반 테스트 작성

**자동화**: Design 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Design 가이드
> Output: Usability 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Usability 테스트 스크립트를 생성함

- Load Test
  - Load Test 가이드 기반 테스트 작성

**자동화**: Load Test 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Load Test 가이드
> Output: Load 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Load 테스트 스크립트를 생성함

- Performance Test
  - Performance Test 가이드 기반 테스트 작성

**자동화**: Performance Test 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Performance Test 가이드
> Output: Performance 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Performance 테스트 스크립트를 생성함

- Security Test
  - Security Test 가이드 기반 테스트 작성

**자동화**: Security Test 가이드 기반 테스트 케이스 생성

> Input: happy-path 테스트 스크립트, Security Test 가이드
> Output: Security 테스트 스크립트
> 주체: CODE, AI
> happy-path 테스트 스크립트를 실행하면서 Security 테스트 스크립트를 생성함

### 2. 테스트 실행 및 결과 분석: 주체 -- CODE, AI, HUMAN (예외사항의 경우)

> 테스트를 수행하고 결과를 분석하는 단계

- 테스트 실행 및 결과 취합
  **자동화**: AI+Code 기반 자동화 테스트 실행 및 결과 취합

> Input: 모든 테스트 스크립트
> Output: 모든 테스트 결과
> 주체: CODE, AI
> 모든 테스트 스크립트를 실행하면서 모든 테스트 결과를 취합함

- 테스트 결과 분석 및 개선 사항 제안
  - 테스트 실행 결과를 분석하여 개선 사항을 제안
  - 테스트 실패 원인을 분석하여 개발자에게 전달
    **자동화**: AI 기반 테스트 결과 분석 자동화

> Input: 모든 테스트 결과
> Output: 개선 사항 제안, 테스트 실패 원인 분석
> 주체: AI
> 모든 테스트 결과를 분석하여 개선 사항을 제안하고 테스트 실패 원인을 분석함

### 3. 테스트 유지보수: 주체 -- AI, HUMAN

> 기획 변경에 따른 테스트 케이스 수정

- 테스트 업데이트
  **자동화**: AI 기반 테스트 업데이트 자동화

> Input: 기획 및 요구사항 변경 사항, 기존 테스트 스크립트
> Output: 수정된 테스트 스크립트
> 주체: AI, HUMAN(검수)
> 기획 및 요구사항 변경 사항을 분석하여 기존 테스트 스크립트를 수정함. 사용자 최종 컨펌.

- 실패 테스트 수정
  **자동화**: AI 기반 실패 테스트 수정 자동화

> Input: 테스트 실패 결과, 기획 및 요구사항 변경 사항
> Output: 수정된 테스트 스크립트
> 주체: AI, HUMAN(검수)
> 테스트 실패 결과와 기획 및 요구사항 변경 사항을 분석하여 테스트 스크립트를 수정함. 사용자 최종 컨펌.
