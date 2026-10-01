# QArify QA Studio

QArify는 AI Native Task Automation 플랫폼입니다.

## Task Automation Overview

---

### **1. 업무자동화 용어 재정의**

- **Task (업무)**: 최종 목적을 달성하기 위한 하나의 전체 프로세스
- **Sub-task (세부 공정)**: 업무(Task)를 구성하는 독립적인 단위 작업 단계
- **Phase (공정 주기)**: Sub-task 내부의 실행 시점별 구분
- **Pre-phase (전처리)**: 작업 실행을 위한 데이터 수집, 검증, 환경 설정
- **Main-phase (본작업)**: 핵심 로직 실행 및 결과물 생성
- **Post-phase (후처리)**: 결과 저장, 알림 발송, 이력 기록 및 정리

- **Action (단위 행동)**: Phase 내에서 실행되는 최소 단위의 개별 동작 (예: 버튼 클릭, API 호출, 텍스트 생성)

---

### **2. 작업 처리 주체 분류 (Decision Engine)**

입력값의 성격과 판단 필요 여부에 따라 실행 주체를 3가지로 분기합니다.

| 분류                  | 실행 주체 | 적용 조건                                                      | 대표 사례                                             |
| --------------------- | --------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| **Rule-based**        | CODE      | 입력값과 규칙이 정형화되고 확정적인 경우                       | 정형 데이터 추출, 파일 이동, 템플릿 기반 이메일 발송  |
| **AI-assisted**       | AI        | 입력값이 비정형이고 가변적이지만 패턴화 가능한 경우            | 평가 코멘트 요약/생성, 감정 분석, 비정형 문서 분류    |
| **Human-in-the-Loop** | HUMAN     | 판단 기준이 모호하거나 최종 승인/고위험 의사결정이 필요한 경우 | 예외 상황 처리, 최종 성과 등급 확정, 법적/윤리적 승인 |

---

### **3. 하이레벨 실행 아키텍처**

```text
[Task: 전체 업무]
 └── [Sub-task 1: 세부 공정]
      ├── Pre-phase (전처리)  ──> Action A, B (Rule-based)
      ├── Main-phase (본작업) ──> Action C (AI-assisted) / Action D (Human)
      └── Post-phase (후처리) ──> Action E (Rule-based)

```

## [QA Studio for QA Task Automation](./qa-studio/README.md)
