# QArify Align Intent 1.0 (Old)

## Workflow

1. [Human] Intent (의도 정의) — `.qarify/intents/{id}/intent.md` 또는 프롬프트
2. [AI] Decision Candidates - 현 상황에서 선택 가능한 결정 후보 정보
3. [Human] Human decisions - 사람이 내린 결정
4. [AI] 실제 구현

## 산출물 형식 (`.qarify/intents/{id}/`)

작업 단위는 **Intent**(업무 의도)다. Scrum의 기간 단위인 sprint와 구분하며, sprint를 쓰는 팀은 sprint 하나에 Intent 여러 개를 담는다.

```
.qarify/
  .gitignore                    # logs/ 등 커밋 제외
  intents/
    261003-login-lockout/       # id = {YYMMDD}-{slug}, 변경 불가
      intent.md                 # [사람] 의도 원문 + frontmatter(title, stage, status, size, ref)
      decisions.md              # D-n: agent가 질문·선택지 제안, 사람이 답
      work/                     # agent 작업 공간: PIPELINE/STATUS/HANDOFF, 설계 문서, 테스트 리포트, CHANGELOG
      spec/
        acceptance.md           # AC-n 목록, 출처, locked 여부
        *.suite.json            # Executable Spec (승격 전)
  suites/                       # 승격된 suite. origin: "intent/261003-login-lockout#AC-3"
  drafts/  mocks/  logs/  skills/
```

**id 규칙**
- `{YYMMDD}-{slug}`: 생성일(로컬) + ASCII kebab-case slug(`^[a-z0-9][a-z0-9-]{0,47}$`). 날짜 접두어로 IDE·Finder·GitHub 어디서나 시간순 정렬된다.
- id는 **변경 불가**(origin 링크의 기준). 사람이 읽는 제목은 `intent.md`의 `title`(한글 가능, 언제든 변경)에 둔다. Studio의 "이름 변경"은 `title`만 바꾼다.
- 순번(`0007-…`)은 쓰지 않는다(브랜치 병렬 생성 시 충돌). 같은 날 같은 slug면 생성 시점에 `-2`를 붙인다.
- 외부 이슈 트래커 연결은 경로가 아니라 frontmatter `ref`(예: `JIRA-123`)로 한다.

**경로 고정**
- 디렉토리 이름(`intents/`)과 위치(`.qarify/` 하위)는 고정하며 설정으로 바꾸지 않는다. origin 링크, skill, MCP 도구, CLI, Docs가 모두 이 경로를 전제로 한다.
- UI 표시 이름만 프로젝트 설정으로 바꿀 수 있다(예: "Intent" / "Sprint" / "Ticket").
- `.qarify/` 하위에 두는 이유: 사용자 저장소 최상위를 오염시키지 않고, QArify 흔적이 한 곳에 모인다. 숨김 디렉토리라 잘 보이지 않는 문제는 QReview Intent view(사람)와 MCP·skill의 명시 경로(agent)로 해결한다.

**Intent 단계(`intent.md` `stage`)**: `intent` → `align` → `baseline` → `build` → `verify` → `signoff` → `done`. Decision 답변, AC 확정(`locked`), Sign-off는 사람만 수행한다.

상세 규칙은 [`skills/intent-protocol/SKILL.md`](../skills/intent-protocol/SKILL.md).

## Align ↔ QReview 계약

- **AC id**: `spec/acceptance.md`의 `AC-n`
- **origin 링크**: 승격된 suite의 각 test는 `origin: "intent/{id}#AC-n"`을 가진다(qy 지원 전까지는 test 제목의 `[AC-n]`). 프로젝트 E2E 테스트는 제목에 `@AC-n`.
- 이 링크 위에서 Sign-off(AC별 통과 여부), Impact(깨진 테스트가 어느 합의에서 왔는지), Console 이력이 동작한다.

## 구성

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
