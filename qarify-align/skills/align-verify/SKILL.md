---
name: align-verify
description: Align 2.0 — re-run verification only for a 2.0 intent (fresh align-verifier pass over checks.md and the change set), e.g. after the human fixed something by hand or edited checks. Use when the user runs /align-verify. Runs in the main session.
argument-hint: "[intent-id] [C-n ...]"
---

# /align-verify — verify again (manager)

Follow `align-protocol`.

1. Resolve the intent; require `base` in `intent.md` frontmatter (if missing: the build never ran through `/align-build` — ask the human which commit to diff against and record it).
2. If C-n ids are given, verify only those; otherwise all.
3. Delegate to `align-verifier` with: intent id and path, `base`, the C-n scope. Nothing about expected results.
4. Present gate G2 exactly as `align-build` §6.
