---
name: architecture-design-patterns
description: Design system architecture, APIs, and database schemas for intents. Use this skill when translating requirements into technical architecture decisions, planning API endpoints, designing database schemas, and considering scalability and integration. Generates .qarify/intents/{id}/work/architecture.md with system design, API specs, and migration plans. Trigger on "architecture design", "system design", "API design", "database schema", "design v1.1", or when planning technical implementation.
---

# Architecture Design Patterns Skill

## Purpose

Create architectural blueprints that guide backend and frontend implementation. Ensures consistent, scalable, maintainable system design.

## When to Use

- After requirements are defined, before implementation planning
- When designing new API endpoints or services
- When planning database schema changes
- When integrating with external systems
- When considering system scalability and performance

## Output Format

Generate `.qarify/intents/{id}/work/architecture.md` with this structure:

```markdown
# Architecture: Intent {id}

## System Overview

- What is the overall system architecture?
- How do major components interact?
- (Diagram: ASCII or reference external diagram)

## Major Changes in This Intent

List what changes from the previous intent

## API Design

### New Endpoints

- **GET /api/endpoint** - Purpose
  - Authentication: [JWT/OAuth/etc]
  - Query params: [list with types]
  - Response: [schema example]
  - Error codes: [list]
  - Rate limit: [requests/minute]

### Updated Endpoints

- **PUT /api/existing** - What changed?

### Deprecated Endpoints

- **DELETE /api/old** - Removal timeline

## Database Schema

### New Collections/Tables

- **Collection: test_results**
  - Fields: [list with types]
  - Indexes: [what should be indexed and why]
  - Sharding strategy: [if applicable]

### Schema Migrations

- Step-by-step migration plan
- Backward compatibility considerations
- Rollback procedure

## System Components

### Backend Services

- **Service 1:** Purpose, responsibilities
  - Technology stack
  - Dependencies
  - Scaling considerations

### Data Pipeline

- Where does data flow?
- How is it processed?
- Where is it stored?

### External Integrations

- **Service X:** Why integrated, what data exchange
- **3rd-party API:** Rate limits, error handling

## Scalability & Performance

### Load Distribution

- How does traffic scale?
- Caching strategy (Redis, CDN, etc)
- Database optimization

### Reliability

- Failure modes and recovery
- Data consistency guarantees
- Monitoring and alerting

### Security

- Authentication flow
- Authorization model
- Data encryption (at rest, in transit)
- Secrets management

## Technology Decisions

| Component     | Choice     | Reasoning                                  | Alternatives Considered |
| ------------- | ---------- | ------------------------------------------ | ----------------------- |
| Database      | Firestore  | Managed, real-time, good for this use case | PostgreSQL, MongoDB     |
| API Framework | Express.js | Lightweight, TypeScript support            | FastAPI, Spring         |
| Frontend      | React      | Component-driven, ecosystem                | Vue, Svelte             |

## Intent-Specific Diagrams
```

[Architecture diagrams, data flow, component relationships]

```

## Migration Path from Previous Intent

If changing major components:
- Old system state
- Parallel running period (if needed)
- Cutover strategy
- Rollback plan

## Dependencies & Assumptions

- External service availability
- Team expertise
- Infrastructure capacity
- Third-party service contracts
```

## Architecture Design Process

### Step 1: Review Requirements & System Context

- **Functional requirements:** What must the system do?
- **Non-functional requirements:** Performance, scale, security?
- **System constraints:** Technology choices, team skills, budget?
- **Existing architecture:** What's already in place? What stays, what changes?

### Step 2: Design API Surface

For each feature, define the APIs:

```typescript
// Example: Test Execution API
GET / api / test - executions / { id }; // Fetch a single execution
POST / api / test - executions; // Start a new test execution
GET / api / test - executions; // List recent executions (paginated)
PUT / api / test - executions / { id } / cancel; // Cancel a running execution
```

For each endpoint, document:

- **Purpose:** What business need does it serve?
- **Auth:** Who can call it?
- **Request/Response:** Data types, required fields
- **Errors:** What can go wrong?
- **Performance:** Latency target, concurrency?

### Step 3: Design Data Model

Think about:

- **Entity relationships:** How do things relate?
- **Querying patterns:** What queries will be common?
- **Consistency requirements:** What must be transactional?
- **Indexing:** What will be queried frequently?
- **Archiving:** How old data is handled?

```typescript
// Example: Test Results Data Model
Collection: test_executions
  - id: string (primary key)
  - userId: string (indexed for per-user queries)
  - startedAt: timestamp
  - completedAt: timestamp (nullable)
  - status: enum ["running", "passed", "failed", "cancelled"]
  - duration: number (ms)

Collection: test_results (per test in execution)
  - id: string
  - executionId: string (foreign key, indexed)
  - testName: string
  - passed: boolean
  - duration: number
  - errorMessage: string (nullable)
```

### Step 4: Consider Integration Points

- **3rd-party services:** What external systems will we call?
- **Other intents:** What APIs or data from other work will we depend on?
- **Data flow:** How does data move between systems?

### Step 5: Plan for Scale & Performance

- **Concurrency:** How many simultaneous requests?
- **Data volume:** How much data will we store?
- **Query patterns:** What will be slow? (Use EXPLAIN on databases)
- **Caching:** Where can we cache for speed?
- **Async processing:** What doesn't need real-time?

**Example:**

- Test execution: Could be async, report results via WebSocket
- Result retrieval: Cache recent results, paginate large datasets
- Data aggregation: Pre-compute summaries, update periodically

### Step 6: Security Review

- **Authentication:** How do we verify users?
- **Authorization:** What can each user access?
- **Data protection:** Encryption, data isolation?
- **Secrets management:** API keys, database credentials?
- **Input validation:** Defend against injection, malformed data?

## Common Architecture Patterns

### Layered Architecture

```
Presentation Layer (UI)
  ↓
Business Logic Layer (Services)
  ↓
Data Access Layer (Repositories)
  ↓
Database/Storage
```

Best for: Traditional full-stack apps, clear separation of concerns

### Microservices Architecture

```
API Gateway
  ├─ Auth Service
  ├─ Test Service
  ├─ Result Service
  └─ Report Service
```

Best for: Large teams, independent scaling, clear domain boundaries

### Event-Driven Architecture

```
Event Source (Test Execution)
  ↓
Event Stream (Pub/Sub)
  ↓
Event Handlers (Result Processor, Report Generator, Notifier)
```

Best for: Async work, decoupling, real-time updates

## Technology Selection Framework

For each major component decision, document:

1. **Problem:** What are we trying to solve?
2. **Candidates:** What options exist?
3. **Evaluation:** Pros/cons of each
4. **Choice:** What we picked and why
5. **Risk:** What could go wrong? Mitigation?

**Example:**

| Aspect           | PostgreSQL            | Firestore         | MongoDB              |
| ---------------- | --------------------- | ----------------- | -------------------- |
| **Cost**         | Self-hosted or RDS    | Pay per operation | Self-hosted or Atlas |
| **Scalability**  | Vertical > Horizontal | Auto-scales       | Horizontal sharding  |
| **Real-time**    | Polling               | Native            | Polling              |
| **Transactions** | ACID                  | Limited           | Multi-doc ACID       |
| **Ops**          | Must manage           | Managed           | Must manage          |

**Decision:** Firestore (managed, real-time, good for our scale)

## API Versioning Strategy

Plan for evolution:

```
/api/v1/test-results      (current, maintained)
/api/v2/test-results      (new, features)
/api/v0/test-results      (deprecated, removed in 3 months)
```

Document:

- When new versions are introduced
- Deprecation timeline for old versions
- Migration path for clients

## Database Migration Strategy

When schema changes:

```sql
-- Step 1: Add new column (with default)
ALTER TABLE test_results ADD new_field VARCHAR DEFAULT 'default';

-- Step 2: Backfill existing rows
UPDATE test_results SET new_field = 'value' WHERE ...;

-- Step 3: Make column required (if needed)
ALTER TABLE test_results MODIFY new_field VARCHAR NOT NULL;

-- Step 4: Update app to use new_field
-- (Deploy code)

-- Step 5: Drop old column (if replacing)
ALTER TABLE test_results DROP old_field;
```

For zero-downtime deployments:

- Deploy code that supports both old and new schema
- Migrate data
- Update code to use new schema
- Deploy code that removes old schema support

## Tips

- **Simplicity first:** Don't over-architect. Use the simplest design that meets requirements.
- **Clear naming:** API endpoints and database fields should be obvious to new team members.
- **Document decisions:** Why we chose this technology over alternatives. Future maintainers will thank you.
- **Plan evolution:** Architecture should support reasonable growth. Plan for 3x current scale.
- **Security by default:** Don't bolt on security later. Design for it from the start.
