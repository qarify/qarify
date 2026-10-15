---
name: align-protocol
description: Align 2.0 shared rules for .qarify/intents/{id}/ — layout, the two human gates (G1 decide, G2 accept), intent.md / decisions.md / checks.md formats, in-flight decision rule, change-set baseline and no-commit rule. Preloaded by the align-* agents; read it before touching any file under .qarify/intents/ in a 2.0 intent.
---

# Align Protocol (2.0)

An **Intent** is one unit of human intent: a feature, a change or a fix. Agents do the work; the human stops the flow only twice — to **decide** (G1) and to **accept** (G2).

## 1. Principles

1. **Two human gates.** G1: the human answers blocking decisions and confirms the checks. G2: the human accepts the verified result. Between gates, agents work to completion without asking.
2. **Checks before work.** `checks.md` is drafted with the decisions and confirmed at G1. Writing checks after the work lets the worker grade itself.
3. **Only the human answers a decision.** Agents propose options, a recommendation and the impact, then stop.
4. **Facts are not decisions.** Anything the code, docs or a command can answer is looked up and written under `## 현재 상태` — never asked.
5. **The worker does not verify.** Verification runs in a fresh context (`align-verifier`) that reads only intent, decisions, checks and the change set.

## 2. Roles

| Role | Runs as | Writes |
|---|---|---|
| manager | main session (`/align-plan`, `/align-build`, `/align-verify`, or `claude --agent align-manager`) | `intent.md` frontmatter and `## 현재 상태`, `decisions.md`, `checks.md` plan columns, `work/` |
| executor | subagent `align-executor` | product code, `ai-decided`/`open` D-n entries, `work/build.md` |
| verifier | subagent `align-verifier` | `checks.md` 결과·증거 columns and `## 범위 밖 변경`, `work/verify/` — never product code |

Subagents cannot ask the human (`AskUserQuestion` is removed from every subagent), so every human question goes through the manager in the main thread. Executor and verifier are not given the `Agent` tool: they do their step themselves, and the verifier's context stays independent of the work.

## 3. Layout

```
.qarify/intents/{id}/          # id = {YYMMDD}-{slug}, never renamed
├─ intent.md                   # human request + frontmatter + ## 현재 상태
├─ decisions.md                # D-n
├─ checks.md                   # C-n: plan (before G1) + result (after verify)
└─ work/                       # free form: build.md, verify/, measurements, notes
```

- id: creation date (local) + ASCII kebab slug `^[a-z0-9][a-z0-9-]{0,47}$`; same date+slug exists → `-2`, `-3`. No sequence numbers.
- Create an intent only when the human asks or confirms. Not named → list `.qarify/intents/` and ask.
- Legacy input: `USER.md` or `IDEA.md` in the directory is read as the intent body. A directory with `spec/acceptance.md` or `work/HANDOFF.md` is a 1.x intent → use `intent-protocol`, not this skill.
- Write intent files in the language the human wrote the intent in.

## 4. intent.md

```markdown
---
title: 로그인 5회 실패 시 잠금
stage: plan          # plan | decide | build | verify | accept | done
status: active       # active | blocked | done | dropped
created: 2026-10-12
base:                # set by /align-build: git HEAD + pre-existing dirty paths (§8)
---
# Intent
{the human's words, verbatim}

## 현재 상태
<!-- AI-maintained. Facts only, each with a source: path:Symbol, command → result, doc §. -->
```

- Everything above `## 현재 상태` is **human-owned**: never edit it. A needed change becomes a D-n.
- `## 현재 상태` holds facts that bear on the decisions — what exists, what is missing, constraints found. Mark unverified items `[검증 필요]`.

| stage | meaning | who moves it on |
|---|---|---|
| plan | manager is investigating and drafting D-n / C-n | manager → decide |
| decide | waiting at G1 | human answers → manager → build |
| build | executor working | manager → verify |
| verify | verifier running | manager → accept |
| accept | waiting at G2 | human |
| done | accepted | — |

`status: blocked` + one line in `## 현재 상태` whenever work stops on something only the human can resolve.

## 5. decisions.md

```markdown
## D-1 — 잠금 해제는 시간 경과인가, 관리자 해제인가 | open
- 차단: yes
- 배경: 해제 방식에 따라 관리자 화면 필요 여부가 갈린다.
- 옵션:
  - (a) 30분 후 자동 해제 — 구현 단순 / 공격자가 30분마다 재시도 가능 / 되돌리기: 쉬움
  - (b) 관리자 해제 — 안전 / 관리자 화면·권한 필요 / 되돌리기: 어려움
- 추천: (a) — 현재 관리자 화면이 없고 intent가 범위를 로그인 화면으로 한정
- 답: pending
- 영향: C-2, C-3
```

- Heading status: `open` → `answered` | `ai-decided` | `superseded by D-k`.
- `차단: yes` blocks `/align-build`. `차단: no` means the recommendation may be used if the human does not answer; record that as `답: 추천안 적용(무응답, {YYYY-MM-DD})`.
- Every option states 장점 / 비용·위험 / 되돌리기. Every decision has exactly one 추천 with a one-line reason tied to the current situation.
- Only decisions that change the result. One question per D-n. Order by impact. More than 7 → first ask whether to split the intent.
- Every D-n links to at least one C-n (`영향`).
- Only the human answers. An answer given in conversation may be transcribed verbatim: `답: (a) — {their words} (transcribed {YYYY-MM-DD})`.
- Ids are never reused.

## 6. checks.md

```markdown
# Checks — {title}

| C | 확인할 것 (관찰 가능) | 근거 | 방법 | 결과 | 증거 |
|---|---|---|---|---|---|
| C-1 | 5회 연속 실패 시 "계정이 잠겼습니다"가 표시되고 로그인 버튼이 비활성화된다 | D-1(a), intent §Intent | auto: `bun test apps/web/src/login.spec.ts -t lockout` | | |
| C-2 | 30분 뒤 같은 계정으로 로그인된다 | D-1(a) | manual: 1) 5회 실패 2) 시계를 30분 앞으로 3) 로그인 → 기대: 대시보드 이동 | | |

## 범위 밖 변경
## 수동 확인 절차
```

- One observable behavior per C-n (URL, visible text, element state, response, file content, exit code).
- `근거` is mandatory: a D-n (with the chosen option) or an intent section.
- `방법`: `auto:` a re-runnable command, or `manual:` numbered steps the human can follow + `기대:`. Prefer auto; use manual only for what a command cannot observe.
- `결과`: `pass` | `fail` | `blocked` | `needs-human`. `pass` without 증거 is invalid. 증거 is a path under `work/verify/` or a one-line command result.
- After G1 the plan columns (확인할 것, 근거, 방법) change only when the human edits them or through a D-n. A verifier that finds a check wrong reports it; it does not rewrite it.
- `## 범위 밖 변경`: changed paths/behaviors linked to no D-n or C-n (verifier).
- `## 수동 확인 절차`: the manual checks in run order, merged into one walkthrough (verifier).

## 7. In-flight decisions (during build)

| Situation | Action |
|---|---|
| Reversible **and** consistent with intent and every answered D-n | Decide, append `## D-n — … \| ai-decided` (same format; `답: (x) — executor 결정, {reason}`), continue. Shown to the human at G2. |
| Changes the intent or an answered D-n, **or** hard to reverse (schema/storage format, public API or wire protocol, deleting data or files, new dependency, security boundary) | Stop. Append `## D-n — … \| open` with `차단: yes`, report it. |

When unsure which row applies, use the second.

## 8. Change-set baseline

The verifier must see exactly what this intent changed.
- At the start of `/align-build`, record `base` in `intent.md` frontmatter: `git rev-parse --short HEAD` plus the paths `git status --porcelain` already lists (`base: abc1234 (dirty: path/a, path/b)`).
- Change set = `git diff <base> --stat` + untracked files, minus paths that were dirty at base unless the executor reports touching them. Include submodules (`git diff <base> --submodule=diff`, or diff inside each changed submodule).

## 9. Always

- **Never run `git commit`, `git add`, `git push`, `git stash`, `git reset` or `git checkout -- <path>`.** The human decides commits.
- Verify claims from older docs or memory against the live tree before relying on them.
- Write each fact once; refer by id (`D-n`, `C-n`, `path:Symbol`). No pasted passing test output, stack traces or more than 10 lines of code in intent files.
- Budgets: `decisions.md` ≤ 10 KB, `checks.md` ≤ 8 KB, `work/build.md` ≤ 4 KB. Detail goes to other `work/` files.
- Load domain skills (`requirements-analysis`, `architecture-design-patterns`, `*-plan-design`, `ui-ux-design-system`, `test-plan-design`, framework skills) only when the current step needs them.
