---
name: requirements-analysis
description: Analyze a vague intent and convert it into concrete intent requirements. Use this skill when translating an intent.md into measurable requirements, Decision items (D-n) and acceptance-criteria drafts (AC-n) with dependencies. Generates .qarify/intents/{id}/work/requirements.md with functional and non-functional specifications. Trigger on "analyze requirements", "define requirements", "requirements for this intent", or when you need to formalize a brainstorm into actionable intent work.
---

# Requirements Analysis Skill

## Purpose

Transform an intent into actionable requirements that guide the Preview, the acceptance baseline, architecture, design and implementation. Ensures the human agrees on what "done" means before any production code is written.

Under the Align Intent protocol (`intent-protocol` skill): open policy questions become **Decisions** in `decisions.md` (D-n), and each observable acceptance check becomes an **AC** in `spec/acceptance.md` (AC-n, `locked: false`). `requirements.md` references those ids instead of holding its own checklists. Only the human answers Decisions and locks AC.

## When to Use

- After the intent is written (`intent.md`), before the Preview and architecture design
- When requirements seem unclear or vague
- When prioritizing what belongs in this intent versus a later one
- When drafting acceptance criteria (AC-n) for user stories
- When identifying external dependencies or blockers

## Output Format

Generate `.qarify/intents/{id}/work/requirements.md` with this structure:

```markdown
# Requirements: Intent {id}

## Intent Goal

One-sentence summary of what this intent accomplishes and why it matters.

## Functional Requirements

### [Feature Area 1]

- **FR-1.1:** {Specific, measurable requirement statement}
  - **AC:** AC-1, AC-2 (drafted in `spec/acceptance.md`; one observable behavior each)
  - **Open:** D-1 (policy question in `decisions.md`, if any)
  - **Example Scenario:** {Concrete example of the requirement in action}

- **FR-1.2:** ...

### [Feature Area 2]

- **FR-2.1:** ...

## Non-Functional Requirements

- **NFR-1 Performance:** {Specific targets}
  - API endpoints: p95 < 500ms
  - Frontend LCP: < 2.5s (standard 4G)
  - Firestore reads: < 100ms
- **NFR-2 Reliability:** {Error rates, retry behavior, recovery}
- **NFR-3 Security:** {Auth requirements, data isolation, encryption}
- **NFR-4 Scalability:** {Concurrent users, data volume expectations}
- **NFR-5 Maintainability:** {Code coverage targets, TypeScript strict, documentation}
- **NFR-6 Accessibility:** WCAG 2.1 AA minimum

## Dependencies

### External

- [ ] {Infrastructure or 3rd-party service required}
- [ ] {Other team dependencies}

### Internal (Intent Dependencies)

- [ ] {Prior intent deliverables required} (from intent {id})
- [ ] {Shared components or libraries needed}

## Constraints & Assumptions

- **Technology:** TypeScript strict mode, React, Firebase stack
- **Timeline:** {Target date and key milestones}
- **Team capacity:** {Known capacity constraints}
- **Assumptions:** {List key assumptions — if wrong, requirements change}

## Definition of Done

Product-level acceptance lives in `spec/acceptance.md` (AC-n) and is signed off by the human. The intent is done when:

- [ ] Every locked AC has a passing test or an exception the human accepted at sign-off
- [ ] All functional requirements (FR-\*) implemented
- [ ] All non-functional targets met (performance, security, accessibility)
- [ ] Test coverage: backend services ≥ 90%, frontend components ≥ 85%
- [ ] E2E tests pass for all critical user flows
- [ ] `docs/` updated by documentation-writer
- [ ] Code review approved
- [ ] Human sign-off recorded

## Risks & Mitigation

| Risk               | Impact       | Likelihood   | Mitigation            |
| ------------------ | ------------ | ------------ | --------------------- |
| {Risk description} | High/Med/Low | High/Med/Low | {Mitigation strategy} |

## Out of Scope (This Intent)

- {Feature explicitly deferred to a later intent}
- {Known limitation not addressed this intent}

## Success Metrics

How will we know this intent succeeded?

- {Quantitative metric 1} (e.g., test pass rate ≥ 95%)
- {Quantitative metric 2} (e.g., API p95 < 500ms)
- {User-facing outcome} (e.g., user can complete checkout in < 3 clicks)
```

## Analysis Process

### Step 1: Extract Core Requirements from Idea

From `.qarify/intents/{id}/intent.md` (and `feedback/*/feedback.md` when a Preview already ran), identify:

- **Must have** (critical path) — the intent fails without these
- **Should have** (adds value) — include if capacity allows
- **Nice to have** (deferred) — explicitly mark as out of scope

For each "Must have", write a concise, specific functional requirement.

### Step 2: Apply the "Measurability Test"

Every requirement must pass this test:

❌ **Bad** (vague, untestable):

> "Dashboard must be fast"
> "API must be reliable"
> "App should be secure"

✅ **Good** (specific, measurable, testable):

> "Dashboard LCP < 2.5s on standard 4G network (Lighthouse measurement)"
> "API error rate < 0.1%; all 5xx errors logged and alerted within 30 seconds"
> "All protected endpoints return 401 without valid Firebase Auth token"

### Step 3: Define Non-Functional Requirements

Think through the "-ilities" for this intent's scope:

**Performance targets for Firebase/TypeScript stack:**

```
API endpoints:      p95 < 500ms
Firestore reads:    < 100ms
Frontend LCP:       < 2.5s
Frontend TTI:       < 5s
Bundle size:        < 200KB gzipped initial JS
```

**Security baseline (always required):**

```
- Firebase Auth JWT required on all protected routes
- Firestore Security Rules enforce data ownership
- No hardcoded secrets (use environment variables)
- Input validation with Zod at API boundary
```

**Accessibility baseline (always required):**

```
- WCAG 2.1 AA: color contrast ≥ 4.5:1
- Keyboard navigation throughout
- Screen reader compatible (ARIA labels, semantic HTML)
- Mobile-responsive: 375px, 768px, 1920px
```

### Step 4: Map Dependencies

What must be true **before** this intent can start?

- **Infrastructure:** Firebase project set up? Firestore security rules from a prior intent?
- **Prior intent deliverables:** Which APIs or components does this intent build on?
- **External:** 3rd-party services, credentials, or team dependencies?

### Step 5: Draft AC and the Definition of Done

Write each observable acceptance check as an AC-n in `spec/acceptance.md` with its `Source` (`intent-protocol` §5), and each open policy point as a D-n in `decisions.md`. Then write the intent-level Definition of Done. The human locks the AC — this is the baseline gate.

### Step 6: Identify Risks

For each identified risk:

- **Scenario:** What could go wrong?
- **Impact:** What breaks if it does?
- **Mitigation:** What's the plan to reduce probability or impact?

Common risks in Firebase/TypeScript projects:

- Firestore query performance on growing collections → plan indexes early
- TypeScript strict mode breaking changes → enforce from day 1
- Firebase Auth edge cases (token refresh, offline) → test these scenarios

## Common Requirement Patterns

### Firebase Auth Requirements

```markdown
- **FR-1.1:** User can sign in with email and password
  - **Acceptance Criteria:**
    - [ ] Firebase Auth `signInWithEmailAndPassword` succeeds for valid credentials
    - [ ] Invalid credentials show user-facing error (not raw Firebase error code)
    - [ ] Auth state persists across browser refresh (Firebase persistence)
    - [ ] Protected routes redirect unauthenticated users to `/login`
  - **Example:** User navigates to `/dashboard` without signing in → redirected to `/login`
```

### Firestore CRUD Requirements

```markdown
- **FR-2.1:** User can create a new {resource}
  - **Acceptance Criteria:**
    - [ ] POST /api/{resource} returns 201 with created document
    - [ ] Document appears in Firestore `{collection}` collection
    - [ ] Document is only readable by the creator (security rule enforced)
    - [ ] Invalid input returns 400 with descriptive error message
  - **Example:** User fills form and submits → new {resource} appears in list within 1 second (real-time)
```

### API Performance Requirements

```markdown
- **NFR-1:** API response times
  - GET /api/{resource}: p95 < 200ms (Firestore indexed query)
  - POST /api/{resource}: p95 < 500ms (write + response)
  - GET /api/{resource}?filter=...: p95 < 500ms (requires composite index)
```

### Frontend Real-Time Requirements

```markdown
- **FR-3.1:** {Resource} list updates in real time
  - **Acceptance Criteria:**
    - [ ] New {resource} created by any user appears within 2 seconds (Firestore `onSnapshot`)
    - [ ] Deleted {resource} disappears without page refresh
    - [ ] No loading flash when data updates
```

## Tips

- **Specificity wins:** Every number is better than no number
- **"What", not "How":** Requirements define what must be true, not how to implement it
- **Challenge vague ideas:** "User-friendly" → ask "what does that mean in measurable terms?"
- **Deferred is not forgotten:** Explicitly note out-of-scope items to avoid scope creep
- **Think adversarially:** What happens with bad input, slow networks, expired auth tokens?
- **Document assumptions:** Wrong assumptions early are cheap; wrong assumptions in production are expensive
