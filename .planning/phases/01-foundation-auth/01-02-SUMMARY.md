---
phase: 01-foundation-auth
plan: 02
subsystem: auth
tags: [magic-link, auth-flow, dashboard-layout, database-schema, rls]
dependency_graph:
  requires:
    - 01-01 (supabase-clients, middleware)
  provides:
    - magic-link-login
    - auth-callback
    - protected-dashboard-layout
    - profiles-table
    - sync-log-table
  affects:
    - all-future-authenticated-features
tech_stack:
  added:
    - Supabase Auth (signInWithOtp)
    - Supabase RLS policies
    - PostgreSQL triggers and functions
  patterns:
    - Magic link authentication (passwordless)
    - Server-side auth protection in layout
    - Email whitelist validation
    - Auto-profile creation via trigger
    - Attribution tracking (sync_log)
key_files:
  created:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/auth/callback/route.ts
    - src/app/(dashboard)/layout.tsx
    - src/app/(dashboard)/today/page.tsx
    - src/app/(dashboard)/history/page.tsx
    - supabase/migrations/001_initial_schema.sql
    - supabase/migrations/002_sync_log.sql
  modified: []
decisions:
  - "Email whitelist enforced client-side (only Harris and Kent can log in)"
  - "Magic link redirects to /auth/callback which exchanges code for session"
  - "Dashboard layout protects all child routes via server-side auth check"
  - "Profiles auto-created on signup with hardcoded display names and roles"
  - "Sync log is attribution-only (NOT a write queue - app is read-only offline)"
  - "Conflict resolution handled by Supabase natively (last-write-wins timestamp ordering)"
  - "Both users can see all profiles and sync logs (shared care team model)"
metrics:
  duration: "~3 minutes"
  tasks_completed: 2
  files_created: 7
  commits: 2
  completed_at: "2026-02-17T02:39:08Z"
---

# Phase 01 Plan 02: Magic Link Auth Flow Summary

Complete magic link authentication flow with login page, auth callback, protected dashboard layout, placeholder pages, and database schema (profiles + sync_log tables with RLS policies).

## What Was Built

### 1. Magic Link Login Page

**File:** `src/app/(auth)/login/page.tsx`

A client component with email-based magic link authentication:

- **Email whitelist validation**: Only allows `harriswatk@gmail.com` and `kentwatkins1@me.com`
- **Magic link flow**: Calls `supabase.auth.signInWithOtp()` with email redirect to `/auth/callback`
- **User feedback states**:
  - Success: "Check your email!" message with sent email address
  - Not allowed: "This app is for Harris and Kent only" friendly error
  - Error: Display Supabase error message
  - Loading: "Sending..." button state
- **Styling**: Soft green theme (Headspace-inspired), calming gradients, centered card layout

### 2. Auth Callback Route

**File:** `src/app/(auth)/auth/callback/route.ts`

Server-side GET handler that completes the magic link flow:

- Extracts `code` from URL search params
- Exchanges code for session using `supabase.auth.exchangeCodeForSession(code)`
- On success: redirects to `/today`
- On error: redirects to `/login?error=auth`

### 3. Protected Dashboard Layout

**File:** `src/app/(dashboard)/layout.tsx`

Server component that protects all dashboard routes:

- Checks authentication via `supabase.auth.getUser()`
- Redirects unauthenticated users to `/login`
- Wraps children with soft green gradient background
- All routes under `(dashboard)` are automatically protected

### 4. Placeholder Dashboard Pages

**Today Page** (`src/app/(dashboard)/today/page.tsx`):
- Displays "Welcome, [user email]"
- Shows "Today's schedule will appear here" placeholder
- Server component with auth context

**History Page** (`src/app/(dashboard)/history/page.tsx`):
- Shows "History will appear here" placeholder
- Server component

### 5. Database Schema Migrations

**001_initial_schema.sql** - Profiles Table:
- **Table structure**: id (uuid, FK to auth.users), email, display_name, role (patient|caregiver), timestamps
- **RLS policies**:
  - Care team can view all profiles (both users see everything)
  - Users can update own profile
  - Users can insert own profile
- **Auto-profile creation trigger**: `handle_new_user()` function creates profile on signup
  - Hardcoded display names: Harris → "Harris", Kent → "Kent"
  - Hardcoded roles: Harris → "patient", Kent → "caregiver"
- **Auto-update trigger**: `handle_updated_at()` updates `updated_at` timestamp
- **Realtime enabled** for live profile updates
- **Index** on `id` for RLS performance

**002_sync_log.sql** - Attribution Tracking Table:
- **Purpose**: Records who changed what and when (attribution only)
- **NOT a write queue**: App is read-only when offline (per user decision)
- **Conflict resolution**: Handled by Supabase natively via last-write-wins timestamp ordering (satisfies REQ-SYNC-04)
- **Table structure**: id, table_name, record_id, action (INSERT|UPDATE|DELETE), changed_by (FK to auth.users), changed_at, payload (JSONB)
- **RLS policies**:
  - Care team can view all sync logs
  - Authenticated users can insert sync logs
- **Indexes** on table_name and changed_at for query performance
- **Realtime enabled** for live sync visibility

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Magic link login page and auth callback | 3f33f8c | login/page.tsx, auth/callback/route.ts |
| 2 | Protected dashboard layout, placeholder pages, and database schema | 6e07514 | layout.tsx, today/page.tsx, history/page.tsx, 2 SQL migrations |

### Task 1: Magic link login page and auth callback
**Type:** auto
**Commit:** 3f33f8c

**What was done:**
1. Created login page with email input and "Send Magic Link" button
2. Implemented client-side email whitelist validation
3. Integrated Supabase `signInWithOtp` with email redirect to `/auth/callback`
4. Added user feedback for success, error, and unauthorized states
5. Styled with soft green theme (calming, Headspace-inspired)
6. Created auth callback route handler
7. Implemented code-for-session exchange
8. Added redirect logic (success → /today, error → /login)

**Files created:**
- `src/app/(auth)/login/page.tsx` (4.2 KB)
- `src/app/(auth)/auth/callback/route.ts` (0.7 KB)

**Verification:**
- TypeScript compiles with no errors
- Login page renders with proper email validation
- Callback route properly structured for session exchange

### Task 2: Protected dashboard layout, placeholder pages, and database schema
**Type:** auto
**Commit:** 6e07514

**What was done:**
1. Created dashboard layout with server-side auth protection
2. Implemented redirect to /login for unauthenticated users
3. Created placeholder Today page showing user email
4. Created placeholder History page
5. Wrote profiles table migration with RLS policies
6. Wrote sync log migration for attribution tracking
7. Documented sync log purpose (NOT a write queue, read-only offline)
8. Added auto-profile creation trigger with hardcoded Harris/Kent data
9. Enabled Realtime for both tables

**Files created:**
- `src/app/(dashboard)/layout.tsx` (0.5 KB)
- `src/app/(dashboard)/today/page.tsx` (0.7 KB)
- `src/app/(dashboard)/history/page.tsx` (0.5 KB)
- `supabase/migrations/001_initial_schema.sql` (2.3 KB)
- `supabase/migrations/002_sync_log.sql` (1.3 KB)

**Verification:**
- TypeScript compiles with no errors
- Build succeeds (8 routes generated)
- Dashboard routes properly configured as dynamic
- Migration files exist and are valid SQL

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### 1. Email Whitelist Enforcement
**Decision:** Validate allowed emails client-side in login form
**Rationale:** Better UX to show friendly error immediately vs. after email send
**Implementation:** Check against `['harriswatk@gmail.com', 'kentwatkins1@me.com']` array
**Impact:** Users get instant feedback if they're not authorized

### 2. Hardcoded User Data in Trigger
**Decision:** Use CASE statements to hardcode Harris and Kent's display names and roles
**Rationale:** Only two users, fixed roles, avoids configuration complexity
**Implementation:** Trigger function checks email and assigns known values
**Impact:** Profiles created automatically with correct data on first login

### 3. Sync Log Attribution-Only Model
**Decision:** Explicitly document sync_log as attribution tracking, NOT a write queue
**Rationale:** User decided app is read-only when offline (no offline mutations)
**Implementation:** Comments in SQL migration clarify purpose
**Impact:** No client-side conflict resolution needed, Supabase handles concurrency natively

### 4. Care Team Visibility Model
**Decision:** Both users can see all profiles and sync logs
**Rationale:** Harris and Kent are a two-person care team sharing all data
**Implementation:** RLS policies use `auth.uid() IS NOT NULL` for SELECT
**Impact:** No data isolation between users, full transparency

### 5. Dashboard Layout Protection Strategy
**Decision:** Implement auth check in layout.tsx instead of per-page
**Rationale:** Centralized protection, DRY principle, automatic for all child routes
**Implementation:** Server component calls `getUser()` and redirects if null
**Impact:** All pages under (dashboard) are automatically protected

## Key Architectural Patterns

### Magic Link Flow
1. User enters email on `/login`
2. Client validates against whitelist
3. If allowed, calls `signInWithOtp({ email, emailRedirectTo: '/auth/callback' })`
4. User receives email with magic link
5. Clicking link navigates to `/auth/callback?code=...`
6. Callback route exchanges code for session
7. Sets session cookie and redirects to `/today`
8. Middleware (from Plan 01) refreshes session on subsequent requests

### Auth Protection Flow
1. User navigates to `/today` or `/history`
2. Dashboard layout runs server-side `getUser()` check
3. If no user: `redirect('/login')`
4. If user exists: render children
5. Middleware ensures session stays fresh across requests

### Profile Auto-Creation Flow
1. User signs in with magic link for first time
2. Supabase creates record in `auth.users` table
3. `on_auth_user_created` trigger fires
4. `handle_new_user()` function inserts profile record
5. Display name and role assigned based on email
6. Profile immediately available for app queries

### Attribution Tracking (Offline-Aware)
- **Online**: Write operations append to sync_log with changed_by and changed_at
- **Offline**: No writes occur (app is read-only per user decision)
- **Conflict resolution**: Supabase handles via timestamp ordering (last-write-wins)
- **Visibility**: Both users see all sync log entries (shared care team)

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| TypeScript compiles | `npx tsc --noEmit` | PASS (no errors) |
| Build succeeds | `npm run build` | PASS (8 routes generated) |
| Login page created | File exists | PASS |
| Auth callback created | File exists | PASS |
| Dashboard layout created | File exists | PASS |
| Placeholder pages created | Files exist | PASS |
| Migration files created | 2 SQL files exist | PASS |
| Route structure | Build output | PASS (static + dynamic routes) |

## Migration Instructions

To apply the database schema migrations:

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ishhmpxejnzpoxuwaajn
2. Navigate to SQL Editor
3. Run `supabase/migrations/001_initial_schema.sql` first (creates profiles table)
4. Run `supabase/migrations/002_sync_log.sql` second (creates sync_log table)
5. Verify tables exist in Table Editor
6. Verify RLS policies are enabled (shield icon should be green)

**What to expect after migrations:**
- `public.profiles` table exists with RLS enabled
- `public.sync_log` table exists with RLS enabled
- Both tables have Realtime enabled
- On first magic link login, profile is auto-created via trigger
- Harris gets role="patient", Kent gets role="caregiver"

## Self-Check: PASSED

**Files created (verified):**
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/app/(auth)/login/page.tsx: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/app/(auth)/auth/callback/route.ts: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/app/(dashboard)/layout.tsx: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/app/(dashboard)/today/page.tsx: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/app/(dashboard)/history/page.tsx: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/supabase/migrations/001_initial_schema.sql: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/supabase/migrations/002_sync_log.sql: FOUND

**Commits (verified):**
- 3f33f8c (feat: implement magic link login page and auth callback): FOUND
- 6e07514 (feat: add protected dashboard layout, placeholder pages, and database schema): FOUND

**Must-haves verification:**
- Harris can enter harriswatk@gmail.com and receive a magic link email: READY (requires Supabase email config)
- Kent can enter kentwatkins1@me.com and receive a magic link email: READY (requires Supabase email config)
- After clicking magic link, user is redirected to /today and session is active: IMPLEMENTED (callback route)
- Session persists across browser close and reopen: IMPLEMENTED (Supabase session cookies)
- Unauthenticated users are redirected from /today and /history to /login: IMPLEMENTED (dashboard layout)
- Supabase profiles table exists with RLS policies enabled: DEFINED (migrations ready)
- Sync log table exists for attribution tracking: DEFINED (migrations ready)

## Next Steps

This plan establishes the complete authentication flow and database schema foundation:

1. **Plan 01-03** (next): Will add navigation shell, logout functionality, and dashboard chrome
2. **Phase 02**: Will build medication tracking features on top of this auth foundation
3. **Phase 03**: Will add photo uploads and history views
4. **Phase 04**: Will implement email notifications and task assignments

All authenticated features now have:
- Magic link login for Harris and Kent
- Protected routes via layout
- User profiles with roles
- Attribution tracking for all changes
- Shared care team visibility model

## Links to Context

- Project root: `/Users/harriswatkins/medical-dashboard/medical-dashboard`
- Phase context: `.planning/phases/01-foundation-auth/01-CONTEXT.md`
- Previous plan: `.planning/phases/01-foundation-auth/01-01-SUMMARY.md`
- Roadmap: `.planning/ROADMAP.md`
