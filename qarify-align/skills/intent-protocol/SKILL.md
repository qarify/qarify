---
name: intent-protocol
description: Shared Align Intent rules for every agent working in .qarify/intents/{id}/ — layout and id rules, stage gates that only a human may pass, intent/decision/acceptance file formats, AC traceability, what to read, the work/HANDOFF.md ledger, output budgets and the no-commit rule. Preloaded by intent subagents; read it before touching any .qarify/intents/ file.
---

# Intent Protocol

An **Intent** is one unit of human intent — a feature, a change request or a fix. It moves from the human's words, through a Preview the human can operate, to an **acceptance baseline (AC)** the human locks, to an implementation verified against that baseline, to the human's sign-off. Agents do the production work; **only the human validates.**

Every token an agent writes into an intent directory is re-read by later agents and shown to the human in the Intent view. Write for the next reader, not for the record.

## 1. Layout

```
.qarify/intents/{id}/                  # id = {YYMMDD}-{slug}, immutable
├─ intent.md                           # [human] source of truth + frontmatter state (§2)
├─ decisions.md                        # D-n: agents propose, the human answers (§4)
├─ spec/
│  ├─ acceptance.md                    # AC-n baseline (§5)
│  └─ *.suite.json                     # executable spec before promotion
└─ work/                               # agent workspace (shown folded as "Docs")
   ├─ PIPELINE.md · STATUS.md          # PM-owned
   ├─ HANDOFF.md · handoffs/{step}-{agent}.md   # ledger (§8)
   ├─ requirements.md · architecture.md · ui-ux-design.md · *-plan.md · e2e-test-plan.md
   ├─ reports/test-round-{N}.md · reports/test-round-final.md · review-report.md
   └─ CHANGELOG.md
```

Other `.qarify/` directories are unchanged: `suites/` (promoted suites), `mocks/`, `drafts/`, `logs/`, `skills/`. `.qarify/.gitignore` keeps `logs/` out of git.

### 1.1 Intent id

- `{YYMMDD}-{slug}`: creation date (local time) + ASCII kebab-case slug matching `^[a-z0-9][a-z0-9-]{0,47}$`. Example: `261003-login-lockout`.
- **Never rename an intent directory.** Suites link to it (`origin: "intent/{id}#AC-n"`). The human-readable title lives in `intent.md` `title` (any language, freely editable).
- Same date and slug already exists → append `-2`, `-3`.
- No sequence numbers (`0007-…`): parallel branches collide.
- Create a new intent only when the human asks or confirms. If the brief or the human does not name an intent, list `.qarify/intents/` (newest last) and ask — never guess.

## 2. intent.md

```markdown
---
title: 로그인 5회 실패 시 잠금
stage: intent            # intent | align | baseline | build | verify | signoff | done
status: active           # active | blocked | done | dropped
size: M                  # S | M | L — optional; the PM classifies when absent
ref: JIRA-123            # optional external tracker link
created: 2026-10-03
---
# Intent
{the human's request in their own words}

## Context / Constraints
## Out of scope
```

- The **body is human-owned.** Agents never rewrite it; a needed change becomes a Decision (§4).
- Agents may update frontmatter `stage`, `status` as part of their step
- Legacy input: a `USER.md` or `IDEA.md` handed over by the human is read as the intent body.

## 3. Stages and gates

| Stage | Who works | Exit gate (all must hold) |
| --- | --- | --- |
| `intent` | Human | `intent.md` body exists |
| `align` | Agents ⇄ Human | Every Decision is `answered`; each Preview's feedback is `approved` — or `preview: skip` with a reason |
| `baseline` | Agents draft, Human locks | `spec/acceptance.md` has `locked: true`, set only after the human's explicit OK |
| `build` | Agents | Implementation done; every AC has at least one test; tests green |
| `verify` | Agents ⇄ Human | Per-AC results reported; executable spec recorded/reviewed on the **real** implementation |
| `signoff` | Human | The human approves each AC (or accepts listed exceptions); suites promoted |
| `done` | — | — |

**Preview need** (`preview:`): `skip` for bug fixes, regressions and small internal changes with no new UI behavior where the intent is already concrete; `required` when the human's expectation is mostly visual or interactive, or the intent leaves policy open; otherwise `optional`. The human may override.

### Human-validated rules — never break

1. Agents never answer a Decision, approve a feedback comment, lock AC or sign off on the human's behalf. Reach the gate, report what the human must do, stop.
2. **Mock feedback is never promoted to a suite.** It becomes AC. The executable spec is recorded on the real implementation (or a Draft that the real implementation extends).
3. An AC with no verifying test is reported in `Risks/Open` and in the round report — never silently dropped.
4. After `locked: true`, an AC changes only through a new Decision with `Supersedes: AC-n` that the human answers, or through a new intent.

## 4. decisions.md

```markdown
## D-1 — 잠금 해제는 시간 경과인가, 관리자 해제인가 | open
- Context: {why it matters, ≤2 lines; link feedback comment `fb_ab12#c3` or `POLICY-TODO[unlock]`}
- Options: (a) 30분 후 자동 해제 (b) 관리자 해제 — Recommended: (a) because {one line}
- Answer: pending
- Affects: AC-2, POLICY-TODO[unlock]
```

- Status in the heading: `open` → `answered` → `superseded by D-k`.
- Agents add Decisions with options and a recommendation. **Only the human answers.** An agent may transcribe an answer the human gave in conversation, verbatim, as `Answer: {text} (transcribed {YYYY-MM-DD})`.
- One question per Decision. Policy questions that a Preview cannot show (limits, retention, permissions) belong here, not in a recording.
- Ids are never reused.

## 5. spec/acceptance.md

```markdown
---
locked: false
lockedAt:
lockedBy:
---
# Acceptance Criteria — {intent title}

| AC | Criterion (observable) | Source | Verified by |
| --- | --- | --- | --- |
| AC-1 | 비밀번호 5회 연속 실패 시 "계정이 잠겼습니다" 메시지가 표시되고 로그인 버튼이 비활성화된다 | fb_ab12#c3, D-1 | suite login-page › [AC-1] lockout |
```

- One observable behavior per AC (URL, visible text, element state, response) — the kind a test or a human replay can check.
- `Source` is mandatory: a feedback comment, a Decision or an `intent.md` section.
- `Verified by` is filled in `build`/`verify`.
- Ids are never reused. A withdrawn AC stays as `~~AC-n …~~ — withdrawn by D-k`.
- Approved feedback comments with no assertion still become AC; they are not dropped.

## 6. Traceability

- Suites promoted from an intent carry `origin: "intent/{id}#AC-n"` once qy supports the field; until then put `[AC-n]` in the test case title.
- Project E2E tests tag the title with `@AC-n` (several allowed).
- Round reports and HANDOFF entries cite AC ids, not restated criteria.

## 7. What to read

- **Your brief is the PM's prompt.** It names the intent, your step, mode, inputs and the HANDOFF entries you need. Do not read `work/PIPELINE.md` or `work/STATUS.md` unless the brief says to.
- Read `intent.md`, `decisions.md` and `spec/acceptance.md` only in the sections the brief names; they are short by design.
- **Never Read `work/HANDOFF.md` whole.** Index it first: `grep -n '^## ' work/HANDOFF.md`, then Read only the entries addressed to you (and any the brief names) with `offset`/`limit`.
- Open a `work/handoffs/*.md` detail file only when a ledger entry or the brief points you to it.
- For any file over ~400 lines: `grep -n '^#'` for its headings, then Read only the sections you need.
- Read packages through `dist/index.d.ts` before source when it exists.
- Do not read other intents' directories unless the brief names a specific file.

## 8. work/HANDOFF.md ledger (append-only)

One entry per completed invocation. **Hard cap: 30 lines.** No code blocks, no command output, no restated requirements, no file contents.

```markdown
## {step} @{agent} ({mode}) → @{next} | {YYYY-MM-DD HH:MM UTC}
- Done: {output paths, comma-separated}
- AC: {AC ids this step covered/affected} | n/a
- Decisions: {≤5 bullets: technical decision — reason; open policy questions go to decisions.md as D-n}
- For @{next}: {≤5 bullets: what they must know / do}
- Risks/Open: {question or risk (Owner: @x | human)} | none
- Verify: {exact command(s) that prove the work} → {result in ≤10 words}
- Detail: work/handoffs/{step}-{agent}.md | none
```

Anything longer (evidence tables, investigation logs, per-file change lists) goes into `work/handoffs/{step}-{agent}.md`. PM briefs live in the Agent prompt, not in HANDOFF.md; the PM logs at most a 5-line entry when it changes plan or reaches a human gate.

## 9. Output budgets

Targets, not padding goals — shorter is better when complete.

| Output | Budget | Rule |
| --- | --- | --- |
| HANDOFF entry | ≤ 30 lines | §8 |
| decisions.md | ≤ 10 KB | One question per D-n. |
| spec/acceptance.md | ≤ 8 KB | One observable behavior per AC. |
| work/requirements.md | ≤ 15 KB | Reference `intent.md` sections, D-n and AC-n instead of restating them. Omit template sections that don't apply. |
| work/architecture.md | ≤ 20 KB | Delta against the existing system only. Cite `path:Symbol`; new contracts as TS signatures only. |
| work/ui-ux-design.md | ≤ 12 KB | Only new/changed screens and components. |
| work/reports/test-round-N.md | ≤ 6 KB | Summary + AC coverage + issue registry + failures only. |
| work/CHANGELOG.md / docs delta | ≤ 5 KB | User-facing changes only. |

If you must exceed a budget, say why in one line at the top of the file.

## 10. Writing rules

- Never paste passing test output, full stack traces, or more than 10 lines of code into an intent file. Reference `path:Symbol` or `path:line`.
- Write each fact once. Link (`see work/architecture.md §3`) instead of copying between files.
- Item ids are the shared vocabulary — `AC-n`, `D-n`, `FR-xx`, `ISS-xxx`, `POLICY-TODO[id]`. Use them instead of re-describing.

## 11. Always

- **Never run `git commit`, `git add`, `git push`, `git stash` or `git reset`.** The human decides commits.
- Verify claims from older docs/memory against the live tree before relying on them.
- Load other skills on demand with the Skill tool only when the current task needs them.

## 12. Memory hygiene (`memory: project`)

`MEMORY.md` is injected into every invocation, so keep it small:
- One line per entry, ≤ 150 chars.
- Delete superseded entries (and their files) instead of marking them SUPERSEDED.
- A lesson confirmed in 2+ intents becomes a one-line standing rule; drop its intent narrative.
