# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Harris and Kent can log in with email (once, never again), see a mobile-first app shell with bottom navigation, and have real-time sync working between their devices. This phase delivers the project scaffolding, Supabase schema, auth flow, app shell, and sync infrastructure. No medication tracking, tasks, or check-ins — those are Phases 2-3.

</domain>

<decisions>
## Implementation Decisions

### App Shell & Navigation
- **2 tabs only: Today and History** — minimal bottom navigation
- Today = daily schedule (populated in Phase 2+), History = past logs and records
- **Warm & soft visual tone** — rounded corners, warm colors (soft greens/purples), gentle feel. Think Headspace/Calm, not clinical.
- Show who did what: actions display attribution like "Kent - 2:30 PM" for accountability

### Sync & Offline Behavior
- **Read-only when offline** — user can view the dashboard but cannot take actions until reconnected. Simpler, avoids conflict resolution.
- Actions show attribution (who made the change) — important for care coordination between two people

### Supabase Project Setup
- **Reuse existing Supabase project** (ref: ishhmpxejnzpoxuwaajn) — saves setup time
- Credentials need to be looked up from Supabase dashboard before implementation begins
- Schema approach: Claude's discretion (drop old tables or build alongside)

### Claude's Discretion
- Auth method (magic link vs email+password) — pick what's simplest for 2-person persistent-session app
- Login screen empty state / Phase 1 "Today" tab placeholder content
- User identity display (name in header vs subtle indicator)
- Sync status indicator prominence (always visible vs on-change)
- Live update behavior (instant vs notification banner)
- Schema migration strategy for existing Supabase project

</decisions>

<specifics>
## Specific Ideas

- Visual reference: Headspace/Calm app feel — warm, soft, not clinical
- Only 2 users ever (Harris + Kent), so UX should be dead simple, not over-engineered for multi-tenant
- Session must persist forever after first login — this is critical for recovery usability
- Attribution on actions matters ("Kent marked Cefdinir as taken") for care coordination trust

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-02-16*
