---
name: align-build
description: Align 2.0 manager steps 2–3 — after gate G1, record the change-set baseline, delegate the work to the align-executor subagent, handle in-flight decisions, then hand the result to the align-verifier subagent and present gate G2. Use when the user runs /align-build or says to proceed with a decided 2.0 intent. Runs in the main session.
argument-hint: "[intent-id]"
---

# /align-build — execute and verify (manager)

Follow `align-protocol`. You are the **manager**. You delegate; the executor changes code, the verifier checks it.

## 1. Gate check (refuse if it fails)

- `decisions.md`: no heading ending `| open` whose block has `차단: yes`. If any → list them and run the G1 step of `align-plan` instead.
- `checks.md` exists and the human confirmed it.
- `stage` is `decide` or `build` (resume). `accept`/`done` → ask whether this is rework; rework keeps the same intent and appends to `work/build.md`.

## 2. Baseline

Record `base` in `intent.md` frontmatter (`align-protocol` §8) unless resuming. Set `stage: build`.

## 3. Delegate to `align-executor`

Brief (the subagent sees nothing else — make it complete, ≤40 lines):
- Intent id and path; "read intent.md, decisions.md (answered + ai-decided), checks.md".
- What to build, in your words, citing D-n/C-n ids — not a restatement of the intent.
- Checks whose test does not exist yet and must be written.
- Relevant facts from `## 현재 상태` (paths, symbols) so it does not re-explore.
- Domain skills worth loading, if any (e.g. `react-expert`, `backend-plan-design`).
- Project commands for test/typecheck (from the project's CLAUDE.md).

**Small change exception:** if the change is ≤3 files, needs no new decision and the context is already in this session, you may do it yourself — follow the same rules and write `work/build.md` as the executor would. Verification is still delegated.

## 4. Handle the executor's result

- `blocked` with a new `open` D-n → set `status: blocked`, ask the human (as in G1), record the answer, re-brief the executor (resume, not restart). 
- `done` → read `work/build.md` and any new `ai-decided` D-n. Set `stage: verify`.

## 5. Delegate to `align-verifier`

Brief: intent id and path, the `base` value, and nothing about how the work was done beyond "the executor's notes are in work/build.md". Do not tell it what you expect to pass.

## 6. Gate G2 — present to the human

Set `stage: accept`. Report in this order, ≤20 lines:
1. Check summary: counts of pass / fail / blocked / needs-human, then each non-pass C-n in one line.
2. `ai-decided` D-n made during build — one line each (the human may object).
3. `## 범위 밖 변경` — anything listed.
4. `## 사람 확인 절차` — point to it in `checks.md`; give the first step inline.

Human response:
- accept → `stage: done`, `status: done`. Remind that commits are theirs.
- rework → note it in `work/build.md`, back to §3 with the failing C-n.
- new decision / changed intent → `align-plan` (new D-n, possibly new C-n), then here again.

`fail` on an auto check: do not present G2 as a pass. Offer one rework round first unless the failure is a check-plan problem (then it is a D-n).
