# QArify Align Intent V2.0

> **Align Intent** — 사람의 의도를 AI에게 효과적으로 전달하기 위한 프로토콜

## Concept (lite)

### 원칙
1. 사람은 두 번만 멈춘다: 결정(G1)과 확인(G2). 나머지는 AI가 끝까지 진행한다.
2. 점검 항목은 수행 전에 정한다. 수행 후에 쓰면 AI가 자기 결과로 자기를 채점한다.
3. 결정에는 사람만 답한다. AI는 옵션·추천·영향을 제시하고 멈춘다.
4. 사실은 결정이 아니다. 코드·문서로 확인 가능한 것은 AI가 확인해 "현재 상태"에 적는다.
5. 검증은 수행하지 않은 에이전트가 한다(새 컨텍스트, intent·decisions·checks·변경분만 읽음).

### 절차
| 단계 | 주체 | 산출물 | 통과 조건 |
|---|---|---|---|
| 0 의도 | 사용자 | intent.md 본문 | 본문 존재 |
| 1 정렬 | AI | intent.md `## 현재 상태`, decisions.md, checks.md(계획) | — |
| G1 결정 | 사용자 | D-n 답변, C-n 확인·수정 | 차단 D-n 전부 answered |
| 2 수행 | AI | 변경, 수행 중 결정 기록 | 자체 테스트·typecheck 통과 |
| 3 검증 | AI(verifier) | checks.md 결과·증거, 사람 확인 절차 | 모든 C-n에 결과 |
| G2 확인 | 사용자 | 수락 / 재작업 / 새 D-n | 수락 → done |

G2에서 재작업이면 2로, 새 결정이면 1로 돌아간다.

### 수행 중 새 결정이 생기면
- 되돌리기 쉽고 intent·확정된 D-n과 충돌하지 않음 → AI가 정하고 `| ai-decided`로 기록 후 진행. G2에서 함께 확인.
- intent나 확정된 D-n을 바꿔야 함, 또는 되돌리기 어려움(스키마·공개 API·데이터 삭제·의존성 추가)
  → 멈추고 `| open`으로 추가, 사용자에게 보고.

### 파일
.qarify/intents/{YYMMDD-slug}/
├─ intent.md     # 본문 = 사용자 소유(AI 수정 금지). frontmatter: stage, status
├─ decisions.md  # D-n
├─ checks.md     # C-n: 계획(G1 전) + 결과(검증 후)
└─ work/         # 자유 형식: 측정, 조사, 증거

### Decision 항목

```
## D-1 — {한 문장 질문} | open            # open | answered | ai-decided | superseded by D-k
- 차단: yes                                # no = 무응답 시 추천안으로 진행 가능
- 배경: 이 결정이 결과를 어떻게 바꾸는가(≤2줄)
- 옵션:
  - (a) {내용} — 장점 / 비용·위험 / 되돌리기: 쉬움|어려움
  - (b) {내용} — ...
- 추천: (a) — {현 상황 근거 한 줄}
- 답: pending
- 영향: C-2, C-3
```

규칙: 결과를 바꾸는 것만 올린다 · 한 항목 한 질문 · 영향 큰 순서 ·
7개를 넘으면 intent를 나눌지 먼저 묻는다 · 모든 D-n은 하나 이상의 C-n에 연결된다.

### Check 항목
| C | 확인할 것(관찰 가능) | 근거 | 방법 | 결과 | 증거 |
|---|---|---|---|---|---|
| C-1 | ... | D-1(a) | auto: `bun test ...` | pass | work/verify/c1.txt |
| C-2 | ... | intent §2 | manual: 1) ... 2) ... → 기대: ... | needs-human | — |

- 방법은 auto(재실행 가능한 명령)와 manual(사용자가 따라 할 절차 + 기대 결과)로 나눈다.
- 결과: pass | fail | blocked | needs-human. 근거 없는 pass는 금지(증거 필수).
- 범위 밖 변경: 변경분 중 어떤 D-n·C-n에도 연결되지 않는 것은 verifier가 별도 목록으로 보고한다.
- G2의 "검증 방법 확인" = 사용자는 manual 항목을 실행하고 auto 항목은 증거를 본다.

## 2.0 구성 (역할 기준)

에이전트는 **권한과 컨텍스트**(관리 / 수행 / 검증)로 나누고, 업무 전문성(기획·설계·아키텍처·QA)은 스킬로 둔다. 1.x 업무별 에이전트(`agents/`)와 `intent-protocol`은 그대로 두며, 1.x intent(`spec/acceptance.md`, `work/HANDOFF.md`가 있는 디렉토리)는 1.x 규칙으로 처리한다.

### 이름 규칙

디렉토리를 나누지 않고 이름으로 구분한다. `link.sh`가 모두 같은 `.claude/agents`, `.claude/skills`에 링크하므로 이름이 곧 구분이다.

| 접두사 | 대상 | 예 |
|---|---|---|
| `align-` | 2.0 프로토콜·절차 스킬과 역할 에이전트 | `align-protocol`, `align-plan`, `align-executor` |
| 없음 | 업무 지식 스킬(executor가 필요할 때 불러 씀), 1.x 에이전트 | `test-plan-design`, `react-expert` |

### Agents (`agents-by-role/`)

| Agent | 실행 형태 | 역할 | 쓰기 범위 |
|---|---|---|---|
| `align-manager` | 메인 스레드: `claude --agent align-manager` (또는 일반 세션에서 `/align-*` 스킬) | 사실 확인, D-n·C-n 작성, G1·G2 진행, 위임 | intent 파일 |
| `align-executor` | 서브에이전트 | 확정된 D-n대로 수행, 필요한 테스트 추가, 수행 중 결정 기록 | 제품 코드, `work/build.md` |
| `align-verifier` | 서브에이전트(새 컨텍스트) | C-n 실행·증거, 범위 밖 변경, 사람 확인 절차 | `checks.md` 결과 열, `work/verify/` |

manager가 서브에이전트가 아닌 이유: `AskUserQuestion`은 모든 서브에이전트에서 제거된다. 넓은 코드 조사는 내장 `Explore` 서브에이전트를 쓴다.

### Skills

| Skill | 호출 | 역할 |
|---|---|---|
| `align-protocol` | 모든 `align-*` 에이전트가 preload | 레이아웃, 게이트, intent/decisions/checks 형식, 수행 중 결정 규칙, 변경분 기준점, no-commit |
| `align-plan` | `/align-plan [id \| 요청]` | 1 정렬 + G1 결정 |
| `align-build` | `/align-build [id]` | 기준점 기록 → executor → verifier → G2 |
| `align-verify` | `/align-verify [id] [C-n…]` | 검증만 다시 |

## Usage

```sh
# start a tool with `align-manager` as main agent
claude --agent align-manager

# write intent plan
> /align-plan

# proceed with the intent
> /align-build
```
