---
name: frontend-plan-design
description: Plan frontend implementation including components, state management, and routing for an intent. Use this skill to break down UI designs into component architecture, plan Firebase SDK integration, design routing structure, and sequence API integrations. Generates .qarify/intents/{id}/work/frontend-plan.md with component trees, state design, and integration plans. Trigger on "frontend plan", "component architecture", "state management plan", "routing design", "structure React app", or when organizing frontend work for an intent.
---

# Frontend Plan Design Skill

## Purpose

Create detailed implementation plans for frontend applications within an intent. Ensures frontend work is organized, components are well-structured, and state management is clear.

## When to Use

- After UX design is complete for the intent
- When planning React/component implementation
- When designing state management
- When planning Firebase SDK integration
- When organizing component structure for an intent

## Output Format

Generate `.qarify/intents/{id}/work/frontend-plan.md` with this structure:

```markdown
# Frontend Implementation Plan: Intent {id}

## Overview

Summary of frontend scope for this intent

## Component Architecture

### Component Tree
```

App
├─ Layout
│ ├─ Header
│ │ ├─ Logo
│ │ ├─ Navigation
│ │ └─ UserMenu (Firebase Auth)
│ └─ Footer
├─ Pages (React Router routes)
│ ├─ Home
│ ├─ {Feature}List
│ │ ├─ {Feature}Filter
│ │ ├─ {Feature}Table
│ │ └─ {Feature}Detail
│ └─ Settings
└─ Shared
├─ LoadingSpinner
├─ ErrorBoundary
└─ EmptyState

````

### Component Specifications

#### Page: `{Feature}List`
- **Purpose:** Display list of {feature} items with filtering
- **Route:** `/{feature}`
- **Data:** Firebase Firestore `onSnapshot` subscription
- **Props:** None (reads from Firebase directly)
- **Child Components:** `{Feature}Filter`, `{Feature}Table`

#### Component: `{Feature}Table`
- **Purpose:** Display tabular data
- **Props:**
  ```typescript
  interface {Feature}TableProps {
    items: {Feature}[];
    onRowClick: (id: string) => void;
    loading: boolean;
  }
````

- **State:** Local (sort column, direction)
- **Accessibility:** `role="table"`, keyboard navigation, ARIA labels

## Implementation Tasks

### Task 1: Project Setup & Layout

- [ ] Configure Vite + React + TypeScript (strict)
- [ ] Install and configure Tailwind CSS v4
- [ ] Set up shadcn/ui base components
- [ ] Implement Layout (Header, Nav, Footer)
- [ ] Configure React Router v6+ framework mode
- **Effort:** X hours
- **Dependencies:** None

### Task 2: Firebase SDK Integration Layer

- [ ] Initialize Firebase (Auth, Firestore, Storage)
- [ ] Create `useAuth()` hook (onAuthStateChanged)
- [ ] Create `useCollection()` and `useDocument()` hooks
- [ ] Create protected route wrapper
- **Effort:** X hours
- **Dependencies:** Task 1

### Task 3: {Feature} Page Components

- [ ] {Feature}List page
- [ ] {Feature}Detail page
- [ ] {Feature}Form (create/edit)
- **Effort:** X hours
- **Dependencies:** Task 2

### Task 4: State Management

- [ ] Identify global state (auth user, UI config)
- [ ] Implement with React Context or Zustand
- [ ] Local state stays in components (form inputs, modals)
- **Effort:** X hours

### Task 5: Accessibility & Responsive

- [ ] WCAG 2.1 AA compliance check
- [ ] Mobile layout (375px)
- [ ] Tablet layout (768px)
- [ ] Keyboard navigation throughout
- **Effort:** X hours
- **Dependencies:** Task 3

### Task 6: Testing

- [ ] Unit tests (Vitest + React Testing Library)
- [ ] Component tests: user interactions, loading/error states
- **Effort:** X hours
- **Dependencies:** Task 3

## Firebase SDK Integration Design

### Auth Hook

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return user;
}
```

### Firestore Real-Time Hooks

```typescript
// hooks/useCollection.ts
export function useCollection<T>(
  collectionPath: string,
  queryConstraints: QueryConstraint[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionPath), ...queryConstraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T),
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [collectionPath]);

  return { data, loading, error };
}
```

### Protected Route

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

## Routing Design (React Router v6+)

```typescript
// app/routes.ts (framework mode)
export const routes = [
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: '{feature}', element: <ProtectedRoute><{Feature}List /></ProtectedRoute> },
    { path: '{feature}/:id', element: <ProtectedRoute><{Feature}Detail /></ProtectedRoute> },
    { path: 'settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
    { path: '*', element: <NotFound /> },
  ]},
  { path: '/login', element: <Login /> },
];
```

## State Management Strategy

| State Type          | Tool                        | Examples                |
| ------------------- | --------------------------- | ----------------------- |
| Server/remote state | Firebase `onSnapshot` hooks | Collections, documents  |
| Auth state          | `useAuth()` hook            | Current user            |
| UI-only state       | `useState` in component     | Modal open, form values |
| Global UI config    | React Context / Zustand     | Theme, locale           |

**Decision rule:** Use Firebase hooks for anything that comes from Firestore. Avoid redundant Redux/Zustand for server state.

## Component Code Organization

```
{FRONTEND_SOURCE}
├─ app/              # React Router entry, routes config
├─ components/       # Reusable UI components (Button, Table, etc.)
├─ features/         # Feature-specific components
│   └─ {feature}/
│       ├─ {Feature}List.tsx
│       ├─ {Feature}Detail.tsx
│       └─ {Feature}Form.tsx
├─ hooks/            # Custom hooks (useAuth, useCollection, etc.)
├─ lib/              # Firebase init, utilities
│   └─ firebase.ts
├─ types/            # Shared TypeScript interfaces
└─ tests/            # Component tests
```

## TypeScript Component Patterns

```typescript
// Typed props, explicit return type, no implicit any
interface {Feature}CardProps {
  item: {Feature};
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const {Feature}Card = React.memo(function {Feature}Card({
  item,
  onEdit,
  onDelete,
}: {Feature}CardProps): JSX.Element {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article aria-label={item.name}>
      <h3>{item.name}</h3>
      <button onClick={() => onEdit(item.id)}>Edit</button>
      <button onClick={handleDelete} disabled={deleting} aria-busy={deleting}>
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </article>
  );
});
```

## Performance Optimization Strategy

- **Code splitting:** `React.lazy()` for each page route
- **Memoization:** `React.memo` for pure list items, `useMemo` for expensive derivations
- **Firebase pagination:** `limit()` + `startAfter()` for large collections
- **Image optimization:** `loading="lazy"`, explicit `width`/`height`
- **Bundle target:** < 200KB gzipped initial JS

## Accessibility Requirements

- [ ] All interactive elements keyboard-accessible
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Form inputs have associated `<label>`
- [ ] ARIA labels on icon-only buttons
- [ ] Focus indicators visible
- [ ] `role="status"` for loading states
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Mobile touch targets ≥ 48×48px

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { {Feature}Card } from './{Feature}Card';
import { mockItem } from '../tests/fixtures';

describe('{Feature}Card', () => {
  it('renders item name', () => {
    render(<{Feature}Card item={mockItem} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
  });

  it('calls onEdit when Edit clicked', async () => {
    const onEdit = vi.fn();
    render(<{Feature}Card item={mockItem} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockItem.id);
  });
});
```

### Integration Tests (MSW for Firebase calls)

Use MSW or Firebase Emulator to mock Firestore responses in component tests when needed.

## Browser & Responsive Targets

| Breakpoint | Width  | Layout                      |
| ---------- | ------ | --------------------------- |
| Mobile     | 375px  | Single column, stacked nav  |
| Tablet     | 768px  | Two column where applicable |
| Desktop    | 1920px | Full multi-column           |

Browsers: Chrome (latest), Firefox (latest), Safari (latest)

## Dependency Order

1. Project setup + Firebase init (Day 1)
2. Layout + Router + Auth hooks (Day 1-2)
3. Feature page components (Day 2-4)
4. State management + data hooks (parallel)
5. Accessibility + responsive (Day 4-5)
6. Tests + optimization (Day 5-6)

```

## Planning Process

### Step 1: Component Decomposition

From the UX design (`work/ui-ux-design.md`), identify:
- **Pages:** Top-level route views
- **Sections:** Major page areas
- **Reusable Components:** Buttons, cards, tables, modals
- **Feature-specific Components:** Belong to one feature only

### Step 2: Firebase Integration Points

For each component, decide:
- Does it read from Firestore? → `useCollection()` or `useDocument()` hook
- Does it write to Firestore? → async handler calling `setDoc`/`addDoc`/`updateDoc`
- Does it need auth? → `useAuth()` hook + `ProtectedRoute`

### Step 3: State Classification

| Data | Tool | Why |
|---|---|---|
| Firestore collections | `onSnapshot` hook | Real-time, no cache duplication |
| Current user | `useAuth()` | Firebase manages session |
| Form input values | `useState` | Local UI state |
| Modal open/close | `useState` | Local UI state |
| Theme | React Context | Rarely changes, global |

### Step 4: Routing Structure

- Which pages exist?
- Which routes are protected (auth required)?
- Which routes need URL parameters?
- Lazy load all page-level routes

### Step 5: Task Ordering

Dependencies:
1. Firebase init → all data hooks
2. Auth hook → protected routes
3. Layout → all pages
4. Reusable components → feature components
5. Feature components → integration tests

## Technology Stack

| Aspect | Choice | Reasoning |
|---|---|---|
| Framework | React + TypeScript strict | Type safety |
| Build Tool | Vite | Fast, modern |
| Routing | React Router v6+ framework mode | Framework-aware routing |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first, accessible components |
| Data | Firebase SDK (`onSnapshot`) | Real-time, no extra layer |
| Auth | Firebase Auth | Native Firebase integration |
| Testing | Vitest + React Testing Library | Modern, performant |
| Linting | ESLint + TypeScript strict | Code quality |

## Tips

- **Firebase hooks over Redux for server state:** `onSnapshot` handles caching and real-time updates automatically
- **Components stay dumb:** Keep Firebase calls in hooks, not in JSX
- **TypeScript strict mode from day 1:** Harder to retrofit later
- **Accessibility is not an afterthought:** Test with keyboard from the first component
- **Error states are required:** Every `useCollection()` consumer must handle `error !== null`
- **Loading skeletons, not spinners:** Skeleton screens reduce perceived load time
```
