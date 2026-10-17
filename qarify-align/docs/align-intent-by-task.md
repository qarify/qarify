# QArify Align Intent by TASK

> **Align Intent** — 사람의 의도를 AI에게 효과적으로 전달하기 위한 프로토콜

## 구성 (업무 기준)

에이전트는 업무별(관리/기획/구현/검증)로 나누고, 업무 별 세부 전문성은(예, typescript, react) 스킬로 둔다.

### Skills

| Skill | 역할 |
| --- | --- |
| `intent-protocol` | 모든 agent가 preload하는 공통 규칙: 디렉토리·id, 단계와 사람 게이트, intent/decisions/acceptance 형식, AC 추적, HANDOFF ledger, 출력 예산, no-commit |
| `requirements-analysis` | 모호한 intent → `work/requirements.md` + D-n + AC 초안 |
| `architecture-design-patterns`, `backend-plan-design`, `frontend-plan-design`, `ui-ux-design-system`, `test-plan-design` | 설계·계획 문서 형식 (`work/` 하위) |

### Agents

| Agent | 역할 |
| --- | --- |
| `project-manager` | Intent 오케스트레이터: 크기·Preview 필요도 판정, `work/PIPELINE.md`, 위임, 사람 게이트에서 정지 |
| `service-planner` | PLAN / **ALIGN**(Decision·AC 초안) / RESEARCH / DOCUMENT |
| `ui-ux-designer` | **PREVIEW**(Mock 제작) / DESIGN(`work/ui-ux-design.md`) |
| `fullstack-developer` | **PREVIEW**(Draft 제작) / PLAN / IMPL / FIX — AC 확정 전 본 구현 금지 |
| `system-architect` | `work/architecture.md` (동작·정책 변경은 D-n으로) |
| `qa-engineer` | 확정 AC별 E2E 테스트(`@AC-n`) |
| `qa-manager` | 테스트 실행, AC 커버리지 리포트(Sign-off 입력) |
| `code-reviewer` | 코드 리뷰 + AC/Decision 범위 이탈 검출 |
| `brainstorming` | 토론 결과를 `intent.md`로 저장 |
