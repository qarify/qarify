---
name: test-plan-design
description: Create comprehensive test plans for an intent. Use this skill to define test cases, test scenarios, success criteria, and testing approach for TypeScript/React/Firebase projects with Playwright E2E. Generates .qarify/intents/{id}/work/test-plan.md with functional, performance, and security test specifications. Trigger on "test plan", "testing strategy", "test cases", "define tests", "plan testing", or when organizing QA work for an intent.
---

# Test Plan Design Skill

## Purpose

Create detailed testing plans that ensure quality and prevent regressions within an intent. Defines what to test, how to test it using Playwright and Firebase Emulator, and when testing is complete.

## When to Use

- After design and implementation plans are complete for the intent
- When defining test coverage requirements for the intent
- When planning E2E Playwright test structure
- When setting up Firebase Emulator test environments
- When organizing test execution for QA

## Output Format

Generate `.qarify/intents/{id}/work/test-plan.md` with this structure:

````markdown
# Test Plan: Intent {id}

## Intent Testing Overview

Summary of what will be tested, the testing approach, and success criteria for this intent.

**Intent Under Test:** {intent id — title}; AC in scope: {AC ids from spec/acceptance.md}
**Primary Test Tool:** Playwright (E2E) + Vitest (unit/integration) + Firebase Emulator Suite

## Test Scope

### In Scope

- All new features introduced in this intent
- Every locked AC in `spec/acceptance.md` (an AC without a test is listed as a gap, never dropped)
- Critical paths from `work/requirements.md` functional requirements (FR-\*)
- Security requirements: auth, data isolation, input validation
- Performance: API response times, Firestore query latency, frontend LCP

### Out of Scope

- Features from previous intents (covered by regression suite in CI)
- Manual exploratory testing (focused automated testing only)
- Load testing above 100 concurrent users (infrastructure scaling separate)

## Test Environment

### Firebase Emulator Suite (Primary)

All tests run against Firebase Emulator — never against production or staging.

```bash
# Start emulators
firebase emulators:start --only auth,firestore,storage

# Environment variables for tests
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
STORAGE_EMULATOR_HOST=localhost:9199
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Cases

### Feature 1: {Feature Name}

#### FT-1.1: {Happy Path Description}

- **AC:** AC-1 (every locked AC needs ≥1 test; tag the test title with `@AC-1`)
- **Objective:** {What user behavior is verified}
- **Preconditions:** {Firebase Emulator seeded with: user account, specific documents}
- **Steps:**
  1. {Action 1}
  2. {Action 2}
  3. {Verify outcome}
- **Expected Result:** {Specific, observable outcome}
- **Test Type:** Functional / E2E
- **Tool:** Playwright
- **Priority:** Critical / High / Medium

```typescript
test('FT-1.1: {description}', async ({ page }) => {
  // Arrange: seed Firebase Emulator
  const user = await createTestUser({ email: 'test@example.com' });
  await seedFirestore('collection', [{ id: 'doc-1', userId: user.uid, ... }]);

  // Act
  await page.goto('/{feature}');
  await page.getByLabel('...').fill('...');
  await page.getByRole('button', { name: '...' }).click();

  // Assert
  await expect(page.getByRole('heading', { name: '...' })).toBeVisible();
  await expect(page).toHaveURL('/{feature}/doc-1');
});
```

#### FT-1.2: {Error Path Description}

- **Objective:** {What error handling is verified}
- **Preconditions:** {Conditions causing error}
- **Steps:**
  1. {Action triggering error}
  2. {Verify error message shown}
- **Expected Result:** User-friendly error message displayed (not raw error code)
- **Test Type:** Functional / E2E
- **Tool:** Playwright
- **Priority:** High

#### FT-1.3: {Auth / Authorization Check}

- **Objective:** Verify unauthenticated users cannot access protected resource
- **Preconditions:** No signed-in user
- **Steps:**
  1. Navigate to `/{protected-route}` without auth
  2. Verify redirect to `/login`
- **Expected Result:** Redirect to login page
- **Test Type:** Security / E2E
- **Tool:** Playwright
- **Priority:** Critical

### Feature 2: {Feature Name}

#### FT-2.1: ...

## API / Integration Test Cases

#### IT-1.1: {Endpoint} Happy Path

- **Objective:** {API behavior verified}
- **Preconditions:** Firebase Auth Emulator token obtained
- **Steps:**
  1. `POST /api/{resource}` with valid payload and auth token
  2. Verify 201 response
  3. Verify Firestore document created in Emulator
- **Expected Result:** 201 with created resource; document exists in Firestore
- **Test Type:** Integration / API
- **Tool:** Vitest + Supertest + Firebase Emulator

```typescript
describe("POST /api/{resource}", () => {
  it("IT-1.1: creates resource for authenticated user", async () => {
    const token = await getTestToken(testUser.uid); // Firebase Auth Emulator

    const res = await request(app)
      .post("/api/{resource}")
      .set("Authorization", `Bearer ${token}`)
      .send({ field: "value" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();

    // Verify Firestore document
    const doc = await adminDb.collection("{collection}").doc(res.body.id).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.userId).toBe(testUser.uid);
  });
});
```

#### IT-1.2: {Endpoint} Unauthorized Access

- **Objective:** Verify users cannot access other users' data
- **Steps:**
  1. Create resource owned by User A
  2. Authenticate as User B
  3. `GET /api/{resource}/{user-a-resource-id}` with User B token
- **Expected Result:** 403 Forbidden
- **Priority:** Critical

## Non-Functional Test Cases

### Performance Tests

#### PT-1: API Response Time

- **Objective:** API endpoints respond within SLA under normal load
- **Targets:**
  - GET /api/{resource}: p95 < 200ms
  - POST /api/{resource}: p95 < 500ms
  - GET /api/{resource}?filter=...: p95 < 500ms (requires Firestore composite index)
- **Tool:** k6 or Autocannon
- **Priority:** High

#### PT-2: Frontend Performance (Lighthouse)

- **Objective:** Page load metrics meet targets
- **Targets:**
  - LCP (Largest Contentful Paint): < 2.5s
  - TTI (Time to Interactive): < 5s
  - Lighthouse Performance score: ≥ 80
- **Tool:** Playwright + Lighthouse CI
- **Priority:** High

#### PT-3: Firestore Query Performance

- **Objective:** Common queries execute within target times
- **Targets:** < 100ms for indexed queries
- **Tool:** Firebase Emulator + Vitest timing assertions
- **Priority:** Medium

### Security Tests

#### SEC-1: Firebase Auth Enforcement

- **Objective:** All protected API endpoints require valid Firebase Auth token
- **Steps:**
  1. Call protected endpoint without Authorization header
  2. Call with expired/invalid token
  3. Call with valid token from wrong Firebase project
- **Expected Result:** 401 for all three cases
- **Tool:** Vitest + Supertest
- **Priority:** Critical

#### SEC-2: Firestore Data Isolation (Security Rules)

- **Objective:** Users cannot read/write other users' documents
- **Steps:**
  1. Create document owned by User A via Firestore Emulator Admin SDK
  2. Attempt to read it as User B via client SDK
  3. Attempt to modify it as User B via client SDK
- **Expected Result:** Both fail with permission-denied
- **Tool:** Firebase Security Rules Test Suite (`@firebase/rules-unit-testing`)
- **Priority:** Critical

```typescript
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

describe("Firestore Security Rules: {collection}", () => {
  it("SEC-2.1: User A cannot read User B documents", async () => {
    const userACtx = testEnv.authenticatedContext("user-a");
    const userBCtx = testEnv.authenticatedContext("user-b");

    // Set up User A document
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx
        .firestore()
        .collection("{collection}")
        .doc("doc-1")
        .set({ userId: "user-a", data: "secret" });
    });

    // User B tries to read it
    await assertFails(
      userBCtx.firestore().collection("{collection}").doc("doc-1").get(),
    );

    // User A can read their own
    await assertSucceeds(
      userACtx.firestore().collection("{collection}").doc("doc-1").get(),
    );
  });
});
```

#### SEC-3: Input Validation (Zod Schemas)

- **Objective:** Malformed input rejected with 400, not causing server error
- **Test Cases:**
  - Missing required field
  - Wrong type (string where number expected)
  - Oversized input (string exceeding max length)
  - Malicious input (XSS strings, SQL patterns)
- **Expected Result:** 400 with descriptive error, no 500
- **Tool:** Vitest + Supertest
- **Priority:** High

### Accessibility Tests

#### ACC-1: Keyboard Navigation

- **Objective:** All interactive elements accessible via keyboard
- **Steps:**
  1. Navigate to page
  2. Tab through all interactive elements
  3. Verify logical focus order
  4. Verify focus indicators visible
  5. Activate key actions with Enter/Space
- **Tool:** Playwright keyboard interaction
- **Priority:** High

#### ACC-2: Screen Reader Compatibility (axe)

- **Objective:** No WCAG 2.1 AA violations
- **Tool:** Playwright + axe-playwright

```typescript
import { checkA11y } from "axe-playwright";

test("ACC-2: {Page} has no accessibility violations", async ({ page }) => {
  await page.goto("/{page}");
  await checkA11y(page, undefined, {
    axeOptions: { runOnly: ["wcag2a", "wcag2aa"] },
  });
});
```

- **Priority:** High

#### ACC-3: Mobile Responsiveness

- **Objective:** UI functional and readable at 375px (mobile)
- **Tool:** Playwright `iPhone 13` device preset
- **Priority:** Medium

## Test Data Strategy (Firebase Emulator)

### Test Fixtures

```typescript
// tests/fixtures/firebase.ts
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export async function createTestUser(props: { email: string; password?: string }) {
  // Create user in Auth Emulator
  const userRecord = await adminAuth.createUser({ email: props.email, ... });
  return userRecord;
}

export async function seedFirestore(
  collection: string,
  docs: Array<{ id: string; data: Record<string, unknown> }>
) {
  // Bypass security rules via Admin SDK for test setup
  const batch = adminDb.batch();
  docs.forEach(({ id, data }) => {
    batch.set(adminDb.collection(collection).doc(id), data);
  });
  await batch.commit();
}

export async function cleanupFirestore() {
  // Clear all Emulator data between tests
  await fetch('http://localhost:8080/emulator/v1/projects/{projectId}/databases/(default)/documents', {
    method: 'DELETE',
  });
}
```

### User Personas for E2E Tests

| Persona          | Role                       | Purpose             |
| ---------------- | -------------------------- | ------------------- |
| `owner@test.com` | Resource owner             | Happy path tests    |
| `other@test.com` | Different user             | Authorization tests |
| `admin@test.com` | Admin role (if applicable) | Admin feature tests |

## Testing Phases

### Phase 1: Unit Testing (During Development)

- **Owner:** fullstack-developer
- **Scope:** Service functions, utility functions, Zod schemas
- **Tools:** Vitest + Firebase Emulator
- **Target:** ≥ 90% coverage for backend services, ≥ 85% for React components
- **Trigger:** Run on every file save (`vitest --watch`)

### Phase 2: Integration Testing (After Components Ready)

- **Owner:** fullstack-developer
- **Scope:** API endpoints, Firestore operations, Firebase Security Rules
- **Tools:** Vitest + Supertest + `@firebase/rules-unit-testing`
- **Target:** All critical API paths covered
- **Trigger:** Before committing

### Phase 3: E2E Testing (After Full Implementation)

- **Owner:** qa-manager
- **Scope:** Full user workflows, accessibility, mobile
- **Tools:** Playwright
- **Target:** All critical user flows in test-plan pass
- **Trigger:** Before the human sign-off

### Phase 4: Security Testing

- **Owner:** qa-manager
- **Scope:** Auth enforcement, Firestore security rules, input validation
- **Tools:** Playwright + `@firebase/rules-unit-testing` + Vitest
- **Target:** All SEC-\* cases pass
- **Trigger:** Parallel with Phase 3

## Success Criteria

Intent testing passes when:

- [ ] All FT-\* (Critical priority) test cases pass (100%)
- [ ] All FT-\* (High priority) test cases pass (100%)
- [ ] All SEC-\* test cases pass (100% — no exceptions)
- [ ] All IT-\* test cases pass (100%)
- [ ] Backend service coverage ≥ 90%
- [ ] Frontend component coverage ≥ 85%
- [ ] All ACC-\* WCAG 2.1 AA tests pass
- [ ] Performance targets met (PT-\*)
- [ ] No open Critical or High severity bugs

## Test Effort Estimates

| Phase                          | Duration                    | Owner                            |
| ------------------------------ | --------------------------- | -------------------------------- |
| Unit tests (continuous)        | During implementation       | fullstack-developer              |
| Integration tests              | +1 day after implementation | fullstack-developer              |
| E2E tests (write)              | +1 day                      | fullstack-developer              |
| E2E tests (execute + fix loop) | 1-2 days, max 5 rounds      | qa-manager                       |
| Security rules tests           | 0.5 day                     | fullstack-developer / qa-manager |
| Accessibility audit            | 0.5 day                     | qa-manager                       |

## Risk Assessment

| Risk                                  | Mitigation                                           |
| ------------------------------------- | ---------------------------------------------------- |
| Firebase Emulator version mismatch    | Pin emulator versions in `firebase.json`             |
| Flaky Playwright selectors            | Use `data-testid` attributes, not CSS classes        |
| Timing issues in async tests          | Use `waitFor` and Playwright auto-waiting            |
| Missing Firestore indexes in Emulator | Run `firebase emulators:export` after adding indexes |
````

## Planning Process

### Step 1: Extract Test Cases from Requirements

For each functional requirement in `work/requirements.md` (and each AC in `spec/acceptance.md`):

- **FR-X.Y → FT-X.Y (Happy Path):** Test the primary success scenario
- **FR-X.Y → FT-X.Y.err (Error Path):** Test invalid input or failure scenarios
- **FR-X.Y → IT-X.Y (Integration):** Test the API endpoint backing the feature

For each security requirement:

- **Auth enforcement → SEC-1.x:** Test unauthenticated access
- **Data isolation → SEC-2.x:** Test cross-user data access

### Step 2: Write Playwright Test Stubs

For each FT-\* case, write the test scaffold before implementation starts:

```typescript
test.describe("Feature: {Feature Name}", () => {
  test.beforeEach(async ({ page }) => {
    await cleanupFirestore();
    // seed emulator...
    await page.goto("/");
  });

  test("FT-1.1: {description}", async ({ page }) => {
    // TODO: implement
  });
});
```

This catches missing `data-testid` attributes early.

### Step 3: Plan Firebase Security Rules Tests

For each Firestore collection used in the intent:

- Who can read? Write? Delete?
- What conditions must be true?
- Write `assertSucceeds` + `assertFails` pairs

### Step 4: Define Test Data Fixtures

For each test case, define exactly what Firestore/Auth state must exist:

- User accounts (Auth Emulator)
- Pre-existing documents (Firestore Emulator, Admin SDK)
- Expected state after test action

### Step 5: Prioritize Test Cases

| Priority | Description                     | Criteria                                              |
| -------- | ------------------------------- | ----------------------------------------------------- |
| Critical | Intent fails if this test fails | Core auth flows, data isolation, primary user journey |
| High     | Important feature broken        | Secondary flows, error handling, performance          |
| Medium   | Degraded experience             | Edge cases, accessibility, mobile                     |

## Tips

- **`data-testid` from day 1:** Ask frontend developer to add `data-testid` attributes on all interactive elements during implementation, not as an afterthought
- **Firebase Emulator always:** Never run tests against real Firebase — use `clearFirestoreData()` between tests for isolation
- **Playwright auto-waiting:** Use `expect(locator).toBeVisible()` instead of `page.waitForTimeout()` — Playwright waits automatically
- **Security rules test separately:** Use `@firebase/rules-unit-testing` for Firestore security rules — it's faster and more precise than Playwright for this
- **Test IDs match requirements:** Use the same ID format (FT-1.1, SEC-2.1) in both `test-plan.md` and Playwright test names so failures can be traced back to requirements
- **Mobile viewport in Playwright:** Always run at least one test in `iPhone 13` device preset — catch responsive bugs early
