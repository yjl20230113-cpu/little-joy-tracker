# Cloudy Archive Delete And Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permanent-delete controls to the cloudy archive, give the archive its own filterable date-grouped timeline, and align archive/letter backgrounds with rain shelter mode.

**Architecture:** Keep archive rendering in `CloudyArchiveView`, but move archive-specific filter and delete-mode state into `src/app/page.tsx` so data loading and destructive actions stay centralized. Reuse existing timeline filtering helpers and add a small archive-only mapping layer instead of coupling the archive to the main timeline state.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase client, Vitest, Testing Library

---

### Task 1: Lock behavior with tests

**Files:**
- Modify: `src/components/CloudyArchiveView.test.tsx`
- Modify: `src/components/EventDetailPanel.test.tsx`
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Write failing component tests for archive delete mode and archive filters**
- [ ] **Step 2: Run `npm.cmd test -- src/components/CloudyArchiveView.test.tsx src/components/EventDetailPanel.test.tsx` and verify the new assertions fail for the expected reasons**
- [ ] **Step 3: Write failing integration tests for archive deletion and archive-specific filtering**
- [ ] **Step 4: Run `npm.cmd test -- src/app/page.test.tsx` and verify the new assertions fail for the expected reasons**

### Task 2: Implement archive UI and shared delete flow

**Files:**
- Modify: `src/components/CloudyArchiveView.tsx`
- Modify: `src/components/CloudyLetterCard.tsx`
- Modify: `src/components/EventDetailPanel.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add archive filter/delete props and render delete-mode controls in `CloudyArchiveView`**
- [ ] **Step 2: Update detail delete copy to permanent-delete wording**
- [ ] **Step 3: Add archive-specific filter state, grouping, and permanent-delete handlers in `src/app/page.tsx`**
- [ ] **Step 4: Update archive and cloudy-letter backgrounds to match rain shelter mode**

### Task 3: Verify and clean up

**Files:**
- Modify: `src/components/CloudyArchiveView.test.tsx`
- Modify: `src/components/EventDetailPanel.test.tsx`
- Modify: `src/app/page.test.tsx`

- [ ] **Step 1: Run targeted tests for touched files until green**
- [ ] **Step 2: Run one broader regression command covering page + components**
- [ ] **Step 3: Review copy, state reset edges, and delete-mode exit behavior**
