---
name: ui-ux-design-system
description: Design user interfaces and user experiences for intents. Use this skill to create mockups, user flows, design systems, accessibility plans, and responsive design specifications. Generates .qarify/intents/{id}/work/ui-ux-design.md with wireframes, interaction flows, and design specifications. Trigger on "UX design", "UI design", "user experience", "mockups", "design system", "user flows", or when planning what users will see and interact with.
---

# UI/UX Design System Skill

## Purpose

Create detailed UI/UX specifications that guide frontend implementation. Ensures consistent, accessible, user-centric interface design.

## When to Use

- After requirements are defined, before frontend implementation
- When designing new user-facing features
- When improving user experience
- When planning responsive design across devices
- When considering accessibility standards

## Output Format

Generate `.qarify/intents/{id}/work/ui-ux-design.md` with this structure:

```markdown
# UI/UX Design: Intent {id}

## Design Principles

- Clarity: Design is obvious, not surprising
- Efficiency: Users accomplish goals quickly
- Accessibility: Works for all users
- Consistency: Familiar patterns throughout
- [Custom principle specific to your product]

## Design System Overview

### Color Palette

- Primary: #0066cc (Usage: Call-to-action buttons)
- Secondary: #6f42c1 (Usage: Secondary actions)
- Success: #28a745 (Usage: Positive feedback)
- Error: #dc3545 (Usage: Errors, warnings)
- Neutral: #6c757d (Usage: Text, dividers)

### Typography

- Headline (H1): 32px, bold, #000
- Subheading (H2): 24px, bold, #000
- Body text: 16px, regular, #333
- Caption: 12px, regular, #666

### Component Library

- Button, Input, Select, Checkbox, Radio
- Card, Modal, Toast, Dropdown
- Table, Pagination, Tabs
- Forms, Validation

## Pages & Screens

### Page 1: [Name]

**Purpose:** What does this page do?
**Key flows:** What can users do here?

**Wireframe:**
```

┌─────────────────────────────────┐
│ Header with navigation │
├─────────────────────────────────┤
│ Sidebar │ Main Content Area │
│ │ │
│ │ [Component area] │
└─────────────────────────────────┘

```

**Interactive Elements:**
- Button: "Start Test" → Navigates to execution page
- Table: Test results → Click row to see details
- Filter: Status dropdown → Updates table (async)

**Responsive Behavior:**
- Desktop (1200px+): Sidebar visible, 2-column layout
- Tablet (768px-1199px): Sidebar collapses to hamburger, 1-column
- Mobile (<768px): Full-width, vertical stacking

### Page 2: [Name]
...

## User Flows

### Flow 1: [User Action Sequence]
```

Home
↓ [Click "Start Test"]
Execution Page (with form)
↓ [Select test suite, click "Run"]
Running Status (shows progress)
↓ [Test completes]
Results Page (shows pass/fail)
↓ [Click "View Details"]
Detailed Results (shows error info)

```

**Considerations:**
- Error states at each step
- Loading states
- Success confirmation

### Flow 2: ...

## Interaction Details

### Form: Start Test Execution
**Fields:**
- Test Suite: Dropdown (required)
- Environment: Radio (Dev, Staging, Prod)
- Parallel: Checkbox (Run in parallel?)
- Options: Expandable section

**Validation:**
- Test Suite: Must select one
- Real-time feedback on errors
- Clear error messages

**Submit Button:**
- Disabled until form is valid
- Shows loading spinner during submission
- Confirmation: Toast message on success

### Table: Test Results
**Columns:**
- Status (pass/fail icon)
- Test Name
- Duration
- Timestamp
- Actions (view details, re-run)

**Interactions:**
- Click row to view details
- Sort by column headers
- Filter by status (all, passed, failed)
- Pagination: 10 results per page
- Hover row to show actions

**Empty State:**
- If no results: "No test results yet. Start a new test execution."
- Clear call-to-action button

## Accessibility (WCAG 2.1 Level AA)

### Color Contrast
- Text on background: 4.5:1 minimum for normal text
- Text on buttons: 4.5:1 minimum
- Test with Color Contrast Checker

### Keyboard Navigation
- Tab order logical: Top to bottom, left to right
- Focus indicators visible
- All interactive elements keyboard-accessible
- No keyboard traps

### Screen Readers
- Semantic HTML: Use `<button>`, `<a>`, `<form>`, etc.
- ARIA labels for non-obvious elements
- Form labels associated with inputs
- Alt text for images

### Responsive Design
- Min font size: 14px (readable without zoom)
- Touch targets: 44x44px minimum
- Avoid small, easily missed buttons

## Mobile Responsive Design

### Breakpoints
```

Mobile: < 576px (phones)
Tablet: 576px - 1024px (tablets, small laptops)
Desktop: > 1024px (large laptops, desktops)

```

### Mobile Adaptations
- Hide sidebar, use hamburger menu
- Full-width content
- Larger touch targets (44x44px)
- Single-column layout
- Simplified navigation
- Vertical stacking of components

### Testing Checklist
- [ ] Test on iPhone (375px), iPad (768px), Desktop (1920px)
- [ ] Test portrait and landscape
- [ ] Test zoom at 200%
- [ ] Test with keyboard only

## Dark Mode (Optional)

If supporting dark mode:
- Background: #1e1e1e
- Text: #e0e0e0
- Accent colors adjusted for contrast
- Toggle in user settings
- Persisted in localStorage

## Animation & Transitions

### Loading States
- Skeleton loaders for content areas
- Spinner for long operations (>1s)
- Progress bar for multi-step processes

### Transitions
- Page navigation: 300ms fade/slide
- Dropdown open: 200ms slide-down
- Modal: 200ms fade-in scale

### Performance
- Use CSS transforms (GPU-accelerated)
- Avoid heavy animations that drop frames
- Max animation duration: 300ms (user impatience)

## Notifications & Feedback

### Toast Messages
- Success: Green, auto-dismiss in 3s
- Error: Red, persistent until dismissed
- Info: Blue, auto-dismiss in 5s
- Position: Bottom-right, stack vertically

**Example:**
```

✓ Test execution started successfully
[x] (dismiss button)

```

### Inline Validation
- Real-time feedback as user types
- Green checkmark for valid
- Red error message for invalid
- Helpful message: "Password must be 8+ characters"

### Empty States
- Show illustration or icon
- Friendly message
- Call-to-action button

**Example:**
```

No test results yet
Start your first test to see results here
[Start Test] button

```

## Loading & Error States

### Loading Screen
- Page skeleton or spinner
- Placeholder content in expected areas
- Estimated time to load (if >2s expected)

### Error Screen
- Friendly error message
- What went wrong (brief, jargon-free)
- Recovery action: Retry button, go back, contact support

**Example:**
```

❌ Unable to load test results
Something went wrong. Please try again.
[Retry] [Go Back] [Contact Support]

```

### 404 Page
- Illustration
- "Page not found"
- Navigation back home

## Design Tokens

Centralized design variables for consistency:

```

Colors:
primary: #0066cc
primaryHover: #0052a3

Spacing:
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px

FontSizes:
h1: 32px
h2: 24px
body: 16px
small: 12px

Shadows:
sm: 0 1px 3px rgba(0,0,0,0.1)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)

BorderRadius:
sm: 4px
md: 8px
lg: 12px

```

## Performance Considerations

### Web Vitals Targets
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

### Optimization Strategies
- Lazy-load images below fold
- Code-split large pages
- Minimize JavaScript for initial load
- Cache static assets
- Use CDN for images/assets

## Design System Documentation

Provide frontend developers a living style guide:
- Component examples and props
- Usage guidelines
- Do's and don'ts
- Code snippets for common patterns

## Intent-Specific Design Mockups

Include actual mockups or wireframes:
- Hand-drawn sketches or
- Figma designs linked or
- ASCII art for simple layouts

## Accessibility Audit Checklist

Before implementation:
- [ ] Color contrast checked (WCAG AA)
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Focus indicators visible
- [ ] No color used as only differentiator
- [ ] Form labels present and associated
- [ ] Images have alt text
- [ ] Motion/animation not distracting
```

## Design Process

### Step 1: User Research & Empathy

- **User personas:** Who are we designing for?
- **User goals:** What do they want to accomplish?
- **Pain points:** What frustrates them?
- **Context:** When/where do they use the product?

### Step 2: Information Architecture

Organize content logically:

- **Navigation structure:** How do users move through the app?
- **Content grouping:** What information belongs together?
- **Hierarchy:** What's most important?

### Step 3: Wireframing

Low-fidelity mockups:

- Focus on layout, not visual design
- Show major content areas
- Indicate interactive elements
- Fast iteration (a Mock Preview is the quickest way to get the human's reaction)

### Step 4: Interaction Design

Define how users interact:

- **User flows:** Sequences of actions
- **State changes:** What changes when user acts?
- **Error handling:** What happens when things go wrong?
- **Feedback:** How does the system respond?

### Step 5: Visual Design

High-fidelity mockups:

- Apply design system
- Typography, colors, spacing
- Illustrations, icons, images
- Responsive variations

### Step 6: Accessibility Review

Check for accessibility barriers:

- Color contrast
- Keyboard navigation
- Screen reader compatibility
- Responsive design
- Focus indicators

### Step 7: Prototype & Test

Build interactive prototype:

- Test with real users
- Gather feedback
- Iterate
- Hand off to developers

## Common UX Patterns

### Data Tables

```
Columns with sort
Filter controls
Pagination
Empty state message
Loading skeleton
Selection (checkboxes)
Bulk actions
```

### Forms

```
Clear labels
Helpful hints
Inline validation
Error messages
Submit button
Clear/cancel actions
Progress indicator (if multi-step)
```

### Navigation

```
Main navigation (top or sidebar)
Breadcrumbs for depth
Search
Footer links
Mobile hamburger menu
```

### Lists

```
Item cards or rows
Consistent spacing
Hover states
Load more / pagination
Empty state
Search/filter
Sorting options
```

## Design Handoff to Development

**Provide developers:**

1. Design spec document (this file)
2. Figma/design tool link
3. Component library with props
4. Color & typography guide
5. Responsive behavior specs
6. Interaction animations
7. Accessibility requirements
8. Performance targets

**Include in code comments:**

- Link to design spec
- Implementation rationale
- Known browser quirks/workarounds

## Tips

- **Start simple:** Don't make it pretty until you've solved the problem
- **Test with users:** Don't assume what users want; ask them
- **Consistency matters:** Use the same pattern for similar problems
- **Mobile first:** Design for small screen first, then enhance
- **Accessibility is not optional:** WCAG AA is the baseline
- **Performance is UX:** Fast feels better than slow, always
- **Feedback is essential:** Let users know something happened
