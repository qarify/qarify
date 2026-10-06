---
name: backend-plan-design
description: Plan backend implementation including APIs, databases, and services for an intent. Use this skill to break down architecture into implementation tasks, plan Firestore schema and migrations, sequence API development with TypeScript contracts, and identify dependencies. Generates .qarify/intents/{id}/work/backend-plan.md with task lists, database plans, and code structure. Trigger on "backend plan", "backend design", "API implementation plan", "database migration plan", "structure backend code", or when organizing backend work for an intent.
---

# Backend Plan Design Skill

## Purpose

Create detailed implementation plans for backend services, APIs, and data layers for an intent. Ensures backend work is organized, sequenced correctly, and can be parallelized when possible.

## When to Use

- After architecture design is complete for the intent
- When planning implementation tasks for an intent
- When designing Firestore schema and migrations
- When sequencing dependent work
- When setting up project structure for backend

## Output Format

Generate `.qarify/intents/{id}/work/backend-plan.md` with this structure:

````markdown
# Backend Implementation Plan: Intent {id}

## Overview

Summary of backend scope for this intent

## Implementation Tasks

### Task 1: [Feature Name]

- **Description:** What are we building?
- **Why:** Business value or technical importance
- **Effort:** Estimated hours (target: 2-4h per task)
- **Dependencies:** What must be done first?
- **Serves AC:** AC ids from `spec/acceptance.md`
- **Done when:**
  - [ ] API endpoint working and tested
  - [ ] Firestore schema created / migrated
  - [ ] Error handling in place
  - [ ] Logging instrumented
  - [ ] Unit + integration tests passing (≥90% coverage)

### Task 2: ...

## Firestore Schema

### Collection: `{collectionName}`

```typescript
interface {DocumentType} {
  id: string;           // auto-generated document ID
  fieldA: string;
  fieldB: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```
````

**Indexes:**

- `fieldA` (ascending) + `createdAt` (descending) — for list queries
- `fieldB` (ascending) — for filtering

**Security Rules:** `auth.uid === resource.data.userId`

## API Endpoint Specifications

### Endpoint 1: POST /api/{resource}

**Request:**

```typescript
interface Create{Resource}Request {
  field: string;
}
```

**Response (201):**

```typescript
interface Create{Resource}Response {
  id: string;
  field: string;
  createdAt: string; // ISO 8601
}
```

**Error Responses:**

- `400` — validation error (Zod)
- `401` — not authenticated
- `403` — not authorized
- `500` — internal server error

### Endpoint 2: GET /api/{resource}/:id

...

## Service Layer Architecture

```
backend/src/
├─ services/          # Business logic (pure TypeScript, easily testable)
│   └─ {feature}Service.ts
├─ routes/            # Express route handlers (thin, delegate to services)
│   └─ {feature}.ts
├─ models/            # TypeScript interfaces + Zod schemas
│   └─ {feature}.ts
├─ repositories/      # Firestore data access layer
│   └─ {feature}Repository.ts
├─ middleware/        # Auth (Firebase JWT), logging, error handling
├─ utils/             # Helper functions
├─ config/            # Environment configuration
└─ tests/             # Unit & integration tests
    ├─ services/
    └─ routes/
```

## 3rd-Party Integration Plan

### Integration: Firebase Auth

- **Purpose:** JWT verification for protected endpoints
- **Setup:** Firebase Admin SDK, `verifyIdToken()` middleware
- **Error Handling:** Expired tokens → 401, Invalid tokens → 401

### Integration: {Other Service}

...

## Technology Stack

| Component  | Choice                       | Reasoning                              |
| ---------- | ---------------------------- | -------------------------------------- |
| Framework  | Express.js                   | Lightweight, TypeScript support        |
| Database   | Firestore                    | Managed, real-time, scales             |
| Auth       | Firebase Auth (JWT)          | Native Firebase integration            |
| Testing    | Vitest + Supertest           | Standard, good DX                      |
| Validation | Zod                          | Runtime type safety + TypeScript types |
| Logging    | Winston / structured console | Structured logs                        |

## Implementation Dependencies

```
DB Schema → Core Models → Repository Layer → Service Layer → Route Handlers → Tests
```

## Testing Strategy

### Unit Tests (Vitest)

- Service logic: business rules, calculations
- Utils: helper functions
- Target: ≥90% coverage
- Mock: Firestore repository, external services

### Integration Tests (Supertest + Firebase Emulator)

- API endpoints: full request/response flow
- Firestore: real Emulator Suite (not mocks)
- Auth: Firebase Emulator Auth

```typescript
// Example integration test
describe("POST /api/users", () => {
  it("creates user and returns 201", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ email: "test@example.com" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

### Performance Targets

- API endpoints: p95 < 500ms
- Firestore reads: < 100ms
- Batch writes: < 500ms

## Security Checklist

- [ ] All inputs validated with Zod schemas
- [ ] All protected endpoints require Firebase Auth JWT
- [ ] Users can only access their own data (Firestore Security Rules)
- [ ] No secrets in code (use environment variables)
- [ ] Rate limiting applied to public endpoints
- [ ] CORS configured for known origins only

## Risk Mitigation

| Risk                                       | Impact | Mitigation                    |
| ------------------------------------------ | ------ | ----------------------------- |
| Firestore performance on large collections | High   | Composite indexes, pagination |
| Firebase Auth token expiry edge cases      | Medium | Refresh token handling        |
| Unclear requirements                       | Medium | Clarify before implementation |

## Code Review Checklist

- [ ] TypeScript strict mode: no `any`, explicit types
- [ ] Zod validation on all inputs
- [ ] Error handling on all async operations
- [ ] Firestore queries optimized (no N+1)
- [ ] Tests written and passing (≥90% coverage)
- [ ] No hardcoded secrets or credentials
- [ ] API changes documented

````

## Planning Process

### Step 1: Decompose Architecture into Tasks

From the architecture document:
- Each API endpoint → separate task
- Each Firestore collection → schema task
- Each integration → separate task
- Cross-cutting concerns (auth middleware, error handling) → shared tasks

### Step 2: Design TypeScript-First API Contracts

For each endpoint, define before implementing:
```typescript
// models/{feature}.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
});
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export interface CreateUserResponse {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
}
````

### Step 3: Plan Firestore Schema

For each collection:

- Document structure (TypeScript interface)
- Indexes needed for query patterns
- Security rules
- Migration strategy from current schema (if any)

### Step 4: Order Tasks by Dependency

```
Independent → Can parallelize
Blocked → Must wait
```

Typical order: Schema → Repository → Service → Routes → Tests

### Step 5: Plan Testing

For each task:

- Unit tests: service/util functions
- Integration tests: API endpoint with Firebase Emulator
- Performance benchmark if on critical path

## TypeScript Patterns to Follow

```typescript
// Result pattern for error handling (no thrown errors across boundaries)
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Repository pattern
class UserRepository {
  constructor(private db: Firestore) {}

  async findById(uid: string): Promise<User | null> {
    const doc = await this.db.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  async create(data: CreateUserRequest): Promise<User> {
    const ref = this.db.collection("users").doc();
    const user: User = {
      id: ref.id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    await ref.set(user);
    return user;
  }
}

// Service pattern (business logic, no framework coupling)
class UserService {
  constructor(private repo: UserRepository) {}

  async createUser(data: CreateUserRequest): Promise<Result<User>> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      return { success: false, error: new Error("Email already exists") };
    }
    const user = await this.repo.create(data);
    return { success: true, data: user };
  }
}
```

## Tips

- **Schema first:** Define Firestore schema and TypeScript types before writing any logic
- **API contracts before implementation:** Frontend and backend can start in parallel once contracts are defined
- **Firebase Emulator for all tests:** Never hit production Firestore in tests
- **Zod at the boundary:** Validate all inputs at the route level, not inside services
- **Repository pattern:** Isolate Firestore from business logic for testability
