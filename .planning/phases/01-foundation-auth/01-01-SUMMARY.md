---
phase: 01-foundation-auth
plan: 01
subsystem: foundation
tags: [scaffolding, supabase-ssr, middleware, next15]
dependency_graph:
  requires: []
  provides:
    - supabase-browser-client
    - supabase-server-client
    - session-middleware
    - route-protection
    - database-types
  affects:
    - all-future-plans
tech_stack:
  added:
    - Next.js 15 (App Router)
    - "@supabase/ssr": "^0.6.1"
    - "@supabase/supabase-js": "^2.47.14"
    - shadcn/ui (button, input, label, card)
    - Tailwind CSS
    - TypeScript
    - zod
  patterns:
    - Async cookies (Next.js 15)
    - Server Components
    - Middleware-based session refresh
    - Route-based auth protection
key_files:
  created:
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - middleware.ts
    - src/types/database.types.ts
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - .env.local
  modified:
    - package.json
    - tsconfig.json
    - next.config.ts
    - tailwind.config.ts
    - components.json
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
decisions:
  - "Used @supabase/ssr for Next.js 15 compatibility (required for async cookies)"
  - "Placed middleware.ts at project root (Next.js convention)"
  - "Used matcher pattern to exclude static assets from middleware"
  - "Created hand-written database types as starter (will regenerate from schema later)"
  - "Configured middleware to redirect unauthenticated users to /login"
  - "Set viewport-fit=cover for iPhone safe area handling"
metrics:
  duration: "~45 minutes"
  tasks_completed: 2
  files_created: 20
  commits: 1
  checkpoint_type: "human-action"
  completed_at: "2026-02-17T02:33:03Z"
---

# Phase 01 Plan 01: Next.js + Supabase SSR Scaffold Summary

Next.js 15 app scaffolded with Supabase SSR clients (browser + server), middleware for session refresh and route protection, shadcn/ui components, and real Supabase credentials configured.

## What Was Built

### 1. Next.js 15 Project Structure
- App Router with TypeScript and Tailwind CSS
- `src/` directory structure
- Global styles with CSS variables for theming
- Metadata configuration (title, description, viewport)

### 2. Supabase SSR Integration
- **Browser client** (`src/lib/supabase/client.ts`): Uses `createBrowserClient` from `@supabase/ssr`
- **Server client** (`src/lib/supabase/server.ts`): Uses `createServerClient` with Next.js 15 async cookies
- Proper cookie handling: `getAll()` and `setAll()` methods for SSR

### 3. Middleware & Route Protection
- Session refresh on every request via `supabase.auth.getUser()`
- Matcher excludes static assets: `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`
- Redirects:
  - Unauthenticated users from dashboard routes → `/login`
  - Authenticated users from `/login` → `/today`

### 4. TypeScript Types
- Hand-written `Database` type in `src/types/database.types.ts`
- Includes `profiles` table schema with Row/Insert/Update types
- Fields: id (uuid), email, display_name, role (patient|caregiver), timestamps

### 5. shadcn/ui Components
- Initialized with defaults
- Added components: button, input, label, card
- Configured with CSS variables for theming

### 6. Environment Configuration
- Real Supabase credentials in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`: https://ishhmpxejnzpoxuwaajn.supabase.co
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [configured]

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | Scaffold Next.js 15 project and configure Supabase clients | 2e2a42d | COMPLETE |
| 2 | Configure Supabase credentials (checkpoint:human-action) | N/A | RESOLVED |

### Task 1: Scaffold Next.js 15 project and configure Supabase clients
**Type:** auto
**Commit:** 2e2a42d

**What was done:**
1. Created Next.js 15 app with TypeScript, Tailwind, App Router, src/ directory
2. Installed dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `zod`
3. Initialized shadcn/ui and added button, input, label, card components
4. Created browser Supabase client using `createBrowserClient`
5. Created server Supabase client using `createServerClient` with async cookies
6. Implemented middleware for session refresh and route protection
7. Created initial TypeScript database types with profiles table
8. Updated layout with proper metadata and viewport configuration
9. Updated homepage to redirect to `/today`

**Files created:**
- `src/lib/supabase/client.ts` (280 bytes)
- `src/lib/supabase/server.ts` (862 bytes)
- `middleware.ts` (2029 bytes)
- `src/types/database.types.ts` (1262 bytes)
- `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`
- `.gitignore`, `components.json`, `package.json`, `tsconfig.json`, etc.

**Verification:**
- App starts successfully with `npm run dev`
- TypeScript compiles with `npx tsc --noEmit` (no errors)
- All key files exist and are importable

### Task 2: Configure Supabase credentials
**Type:** checkpoint:human-action
**Status:** RESOLVED

**What was needed:**
User had to provide real Supabase credentials from the Supabase dashboard (project `ishhmpxejnzpoxuwaajn`) and configure authentication settings.

**User completed:**
1. Updated `.env.local` with real Supabase URL and anon key
2. Verified email auth provider is enabled in Supabase dashboard
3. Set Site URL to `http://localhost:3000`
4. Added redirect URL: `http://localhost:3000/auth/callback`
5. Verified app starts successfully at localhost:3000 (curl returned 307 redirect)

**Outcome:**
App is now connected to real Supabase backend and ready for authentication implementation.

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### 1. Supabase SSR Library Choice
**Decision:** Use `@supabase/ssr` instead of `@supabase/auth-helpers-nextjs`
**Rationale:** `@supabase/ssr` is the current recommended approach for Next.js 15 and handles async cookies correctly
**Impact:** All auth flows will use this library pattern

### 2. Middleware Matcher Pattern
**Decision:** Use comprehensive matcher to exclude static assets
**Pattern:** `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`
**Rationale:** Prevents unnecessary session refresh requests for images and static files
**Impact:** Better performance, cleaner logs

### 3. Database Types Strategy
**Decision:** Hand-write initial types, regenerate from schema later
**Rationale:** Need types for development, but schema doesn't exist yet in Supabase
**Impact:** Will run `npx supabase gen types typescript` in future plan after schema migrations

### 4. Route Protection Strategy
**Decision:** Middleware-based protection instead of per-page checks
**Rationale:** Centralized auth logic, runs before page renders, easier to maintain
**Impact:** All protected routes automatically handled by middleware

## Key Architectural Foundations

### Authentication Flow
1. User visits protected route (e.g., `/today`)
2. Middleware intercepts request
3. Supabase server client checks session via cookies
4. If no session: redirect to `/login`
5. If session exists: refresh session, allow request to continue

### Cookie Handling (Next.js 15)
- **Critical difference:** Next.js 15 made `cookies()` async
- Server client uses `await cookies()` before `getAll()` and `setAll()`
- Middleware handles cookie updates for session refresh

### Client-Side vs Server-Side
- **Browser client:** Used in Client Components for auth UI (login, signup)
- **Server client:** Used in Server Components, Server Actions, and middleware
- Both clients share the same session via cookies

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| App starts | `npm run dev` | PASS (localhost:3000) |
| TypeScript compiles | `npx tsc --noEmit` | PASS (no errors) |
| Supabase credentials | Check `.env.local` | PASS (real values) |
| Key files exist | `ls` verification | PASS (all files created) |
| Commit exists | `git show 2e2a42d` | PASS (20 files changed, 6867+ lines) |

## Self-Check: PASSED

**Files created (verified):**
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/lib/supabase/client.ts: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/lib/supabase/server.ts: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/middleware.ts: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/src/types/database.types.ts: FOUND
- /Users/harriswatkins/medical-dashboard/medical-dashboard/.env.local: FOUND

**Commits (verified):**
- 2e2a42d (feat: scaffold Next.js 15 with Supabase SSR clients): FOUND

**Must-haves verification:**
- Next.js 15 app starts with `npm run dev` and renders at localhost:3000: VERIFIED
- Supabase browser and server clients are configured and importable: VERIFIED
- Middleware refreshes session on every request and protects dashboard routes: VERIFIED (code review)
- Unauthenticated users are redirected from /today and /history to /login: VERIFIED (middleware logic)
- TypeScript compiles with no errors: VERIFIED

## Next Steps

This plan provides the foundation for all subsequent development:

1. **Plan 01-02** will build the login UI and magic link flow on top of these clients
2. **Plan 01-03** will create the auth callback handler using the server client
3. **Plan 01-04** will build the profiles table and RLS policies
4. **Plan 01-05** will implement the signup flow and profile creation

All future features (medication tracking, photo uploads, history views) depend on this authentication foundation.

## Links to Context

- Project root: `/Users/harriswatkins/medical-dashboard/medical-dashboard`
- Phase context: `.planning/phases/01-foundation-auth/01-CONTEXT.md`
- Phase research: `.planning/phases/01-foundation-auth/01-RESEARCH.md`
- Roadmap: `.planning/ROADMAP.md`
