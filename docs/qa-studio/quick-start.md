# Quick Start

## Prerequisites

- [Install QA Studio](./install.md)

## 1. Create Project

**테스트 및 Asset 관리를 위한 프로젝트 생성**

- app을 실행하고 Project List page에서 프로젝트 생성
- 새 프로젝트에는 비어 있는 `default.suite.json`이 자동으로 만들어지며 Studio에서 바로 선택됩니다. (기존 프로젝트는 변경되지 않습니다.)

## 기본 설정

**AI Provider를 포함한 프로젝트 기본 설정**

- Settings page에서 AI Provider를 포함한 프로젝트 기본 설정
- 설정 섹션은 헤더 전체를 클릭해 펼치거나 접을 수 있고, `Expand all`/`Collapse all`을 제공합니다. (펼침 상태는 세션 동안만 유지됩니다.)
- 저장하지 않은 변경이 있는 상태에서 다른 화면으로 이동하면 확인 창이 표시됩니다: `Save & leave`(저장 후 이동), `Discard changes`(변경 취소 후 이동). 창을 닫거나 Esc를 누르면 그대로 머뭅니다.

## Record Test Scenario(Happy Path)

**사용자가 Web Recorder를 사용하여 수행한 동작을 녹화해서 테스트 시나리오 생성**

- Studio page에서 `Web Recorder`을 실행하고 레코딩 시작해서 테스트 시나리오 녹화
- 테스트 트리가 비어 있으면 `New Root Suite` 옆의 `Recording` 버튼으로도 녹화를 시작할 수 있습니다. (상단 Recording 버튼과 동일하게 동작)
- 녹화가 완료 되면 Studio에 녹화된 시나리오를 **테스트(`Happy Path Test`)**로 변환
- 녹화 프로그램 사용법: [Web Recorder](./web-recorder.md)

## Convert and Improve Recorded Scenario to Test Suite

**`Happy path test`를 AI를 사용하여 개선 및 확장**

- Studio page에서 `Improve Test`/`Expand Test` 기능을 사용하여 테스트 개선 및 확장

## 테스트 실행

**테스트 스위트 실행 및 결과 확인**

- Studio page에서 `Run Test` 기능을 사용해서 Web Driver로 테스트 수행
- Results sidebar에서 실행 결과 확인
