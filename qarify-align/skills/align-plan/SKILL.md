---
name: align-plan
description: Align 2.0 manager step 1 + gate G1 — turn a human request into .qarify/intents/{id}/ with facts, decisions (D-n, options + recommendation) and planned checks (C-n), then collect the human's answers. Use when the user runs /align-plan, asks to start or plan an intent, or answers decisions of a 2.0 intent. Runs in the main session (it must ask the human).
argument-hint: "[intent-id | 새 요청 내용]"
---

# /align-plan — plan and decide (manager)

Follow `align-protocol` (read it first if it is not already loaded). You are the **manager** in the main session. You do not change product code in this step.

## 1. Resolve the intent

- Argument is an existing id → open it. If `stage` is `decide`, go to §5 (collect answers).
- Argument is a request, or the human described one → propose `{YYMMDD}-{slug}` and a `title`; create `intent.md` with the request **verbatim** in the body after the human confirms (a clear "go ahead" counts). `stage: plan`, `status: active`.
- Nothing given → list `.qarify/intents/` (newest last) with titles and stages, and ask.

## 2. Establish facts

Read the intent, then find what the code and docs already answer. For broad sweeps across many files use the built-in `Explore` subagent and keep only its conclusions. Write `## 현재 상태` in `intent.md`: short bullets, each with a source (`path:Symbol`, `command → result`, `doc §`). Anything you could not confirm is `[검증 필요]` — and becomes either a check or a decision, never a guess.

## 3. Draft decisions

For each open choice that **changes the result**, write a D-n in `decisions.md` (format: `align-protocol` §5).
- Not a decision: facts (§2), choices any competent engineer would make the same way, choices that are trivially reversible during build (leave those to the executor as `ai-decided`).
- Prefer fewer, sharper questions. More than 7 → ask whether to split the intent before drafting the rest.
- Recommendation must cite the current situation (what §2 found, what the intent limits), not general best practice.

## 4. Draft checks

Write `checks.md` (format: `align-protocol` §6), plan columns only.
- Cover: every intent requirement, every option a D-n recommends (re-point after the answer), and the regressions the change could plausibly cause (existing tests that must stay green).
- Each check observable and with a concrete `auto:` command or `manual:` steps + `기대:`. If no test exists yet for an auto check, name the test the executor must add (path + test name) and say so in the check.
- Link every D-n to at least one C-n.

## 5. Gate G1 — ask the human

Set `stage: decide`. Present the blocking decisions with `AskUserQuestion` (≤4 per call; the recommended option first, labelled "(추천)"; option descriptions = the trade-off in one line). Then show non-blocking ones in one compact list and say the recommendation applies unless they object. Then list the checks (C-n + one line each) and ask the human to confirm or edit them.

Record answers verbatim (`답: … (transcribed {date})`), flip headings to `answered`, re-point any C-n whose basis changed. A new question arising from an answer becomes a new D-n.

G1 passes when no `| open` D-n has `차단: yes` and the human has confirmed checks.md. Then say: "`/align-build {id}`로 진행합니다" and, if the human already said to proceed, invoke `align-build` directly.

## Report (end of turn)

≤10 lines: intent id, facts that surprised you, D-n still open, the next command.
