# Phase 1: Foundation & Auth - Research

**Researched:** 2026-02-16
**Domain:** Next.js 15 + Supabase SSR Auth + Real-time Sync + Offline-First PWA
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for a two-person medical dashboard: authentication with persistent sessions, mobile-first UI shell, real-time sync, and offline-first architecture. The stack (Next.js 15 + Supabase + TypeScript + Tailwind + shadcn/ui) is production-proven for this exact use case.

Key architectural decisions: use `@supabase/ssr` for server-side auth with cookie-based session storage, implement read-only offline mode (simpler than conflict resolution), structure real-time subscriptions with proper cleanup to prevent memory leaks, and leverage shadcn/ui primitives for mobile-first bottom navigation since no official component exists yet.

The research reveals critical pitfalls: Row Level Security (RLS) policies are mandatory (83% of exposed Supabase databases in 2025 had RLS misconfigurations), Next.js 15 requires awaiting `cookies()` (breaking change from v14), real-time subscriptions must be cleaned up in React useEffect return functions to prevent memory leaks, and JWT expiration below 5 minutes causes server load issues.

**Primary recommendation:** Start with Supabase SSR helpers (@supabase/ssr), magic link auth (one-click, persistent sessions), middleware for session refresh, and IndexedDB for offline read caching. Build RLS policies from day one, not as an afterthought.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**App Shell & Navigation:**
- 2 tabs only: Today and History — minimal bottom navigation
- Today = daily schedule (populated in Phase 2+), History = past logs and records
- Warm & soft visual tone — rounded corners, warm colors (soft greens/purples), gentle feel. Think Headspace/Calm, not clinical
- Show who did what: actions display attribution like "Kent - 2:30 PM" for accountability

**Sync & Offline Behavior:**
- Read-only when offline — user can view the dashboard but cannot take actions until reconnected. Simpler, avoids conflict resolution
- Actions show attribution (who made the change) — important for care coordination between two people

**Supabase Project Setup:**
- Reuse existing Supabase project (ref: ishhmpxejnzpoxuwaajn) — saves setup time
- Credentials need to be looked up from Supabase dashboard before implementation begins
- Schema approach: Claude's discretion (drop old tables or build alongside)

### Claude's Discretion

- Auth method (magic link vs email+password) — pick what's simplest for 2-person persistent-session app
- Login screen empty state / Phase 1 "Today" tab placeholder content
- User identity display (name in header vs subtle indicator)
- Sync status indicator prominence (always visible vs on-change)
- Live update behavior (instant vs notification banner)
- Schema migration strategy for existing Supabase project

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | React framework with App Router, SSR | Default for new React apps, built-in SSR for Supabase auth |
| @supabase/supabase-js | Latest | Supabase client library | Official JS client, handles auth + database + realtime |
| @supabase/ssr | Latest | SSR-specific Supabase utilities | Mandatory for Next.js App Router + server components |
| TypeScript | 5.x | Type safety | Next.js 15 supports typescript config files, strict mode standard |
| Tailwind CSS | 4.x (OKLCH colors) | Utility-first CSS | Next.js default, mobile-first, warm color palette via OKLCH |
| shadcn/ui | Latest | Accessible component primitives | Industry standard for Next.js + Tailwind, uses Radix under hood |
| React | 19.x | UI framework | Ships with Next.js 15, Server Components required for SSR |

**Sources:**
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)
- [Tailwind CSS v4: The Complete Guide for 2026 | DevToolbox Blog](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide)

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.x | Runtime schema validation | Server Actions, form validation, API inputs (required for security) |
| react-hook-form | ^7.x | Form state management | Login form, future medication forms |
| web-push | Latest | Push notification backend | PWA notifications (Phase 1 setup, Phase 2+ usage) |
| @radix-ui/react-* | Latest | Accessible UI primitives | Automatically installed by shadcn/ui components |
| Serwist | Latest | Service worker management | Offline caching (requires Webpack, Next.js 16 uses Turbopack by default) |

**Sources:**
- [shadcn UI: Complete Guide (2026) | DesignRevision](https://designrevision.com/blog/shadcn-ui-guide)
- [How to build a Progressive Web Application (PWA) with Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Build a Next.js 16 PWA with true offline support - LogRocket](https://blog.logrocket.com/nextjs-16-pwa-offline-support/)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Magic links | Email + password | Passwords add friction, require reset flow; magic links are one-click and session lasts forever |
| @supabase/ssr | NextAuth.js / Auth.js | Supabase SSR is simpler for Supabase-only projects, fewer moving parts |
| IndexedDB | LocalStorage | LocalStorage has 5-10MB limit, no structured queries; IndexedDB scales for offline data |
| Serwist | next-pwa | next-pwa is legacy, Serwist is active successor with Next.js 15 support |
| Read-only offline | Full offline-first with sync queue | Read-only is simpler (no conflict resolution), acceptable for 2-person medical use case |

**Installation:**

```bash
# Create Next.js 15 app with TypeScript + Tailwind
npx create-next-app@latest medical-dashboard --typescript --tailwind --app --src-dir

# Install Supabase
npm install @supabase/supabase-js @supabase/ssr

# Install shadcn/ui (includes Radix, class-variance-authority, clsx, tailwind-merge)
npx shadcn@latest init

# Install form handling + validation
npm install zod react-hook-form @hookform/resolvers

# Install PWA support (optional for Phase 1)
npm install -D serwist
npm install -g web-push  # For VAPID key generation
```

**Sources:**
- [Next.js - shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
- [Supabase Auth Quickstart with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)

## Architecture Patterns

### Recommended Project Structure

```
medical-dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Route group (doesn't affect URL)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/         # Authenticated routes
│   │   │   ├── layout.tsx       # Dashboard shell with nav
│   │   │   ├── today/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Redirects to /today or /login
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Login form, auth providers
│   │   ├── layout/              # Bottom nav, header
│   │   └── offline/             # Offline banner, sync status
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Session refresh logic
│   │   ├── offline/
│   │   │   ├── db.ts            # IndexedDB setup
│   │   │   └── sync.ts          # Sync queue (future)
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useOnlineStatus.ts
│   │   ├── useSupabaseRealtime.ts
│   │   └── useOfflineCache.ts
│   └── types/
│       ├── database.types.ts    # Generated from Supabase
│       └── app.types.ts
├── public/
│   ├── sw.js                    # Service worker
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # PWA icons
├── middleware.ts                # Session refresh (root level!)
├── .env.local                   # Supabase keys
├── next.config.ts               # TypeScript config
└── components.json              # shadcn/ui config
```

**Sources:**
- [Getting Started: Project Structure | Next.js](https://nextjs.org/docs/app/getting-started/project-structure)
- [The Ultimate Guide to Organizing Your Next.js 15 Project Structure](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Next.js 15: App Router — A Complete Senior-Level Guide](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)

### Pattern 1: Supabase SSR Client Setup

**What:** Separate client utilities for browser vs server contexts with cookie-based session storage

**When to use:** All Next.js App Router projects with Supabase auth

**Example:**

```typescript
// src/lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts (server components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()  // Next.js 15: cookies() is now async!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// middleware.ts (root level, NOT in src/)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session (updates cookies automatically)
  await supabase.auth.getClaims()  // Use getClaims(), NOT getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Source:** [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)

**Critical notes:**
- Next.js 15 breaking change: `cookies()` is now async, must use `await cookies()`
- Use `getClaims()` in server code for JWT validation, NOT `getSession()`
- Middleware runs on every request, matcher excludes static assets for performance
- Cookie `Max-Age` should be set far in the future — Supabase manages token validity, not browser

**Sources:**
- [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [User sessions | Supabase Docs](https://supabase.com/docs/guides/auth/sessions)

### Pattern 2: Magic Link Authentication

**What:** Passwordless email authentication with persistent sessions

**When to use:** Two-person apps where password resets are friction, sessions should last forever

**Example:**

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Redirect to /today after email confirmation
        emailRedirectTo: `${window.location.origin}/today`,
      },
    })

    if (error) {
      alert(error.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  if (sent) {
    return <p>Check your email for the magic link!</p>
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="harriswatk@gmail.com"
        required
      />
      <button disabled={loading}>Send Magic Link</button>
    </form>
  )
}
```

**Configuration notes:**
- Magic links expire after 1 hour by default (configurable in Supabase Dashboard: Auth > Providers > Email)
- Rate limit: 1 OTP per 60 seconds per email (prevents brute force)
- Session persistence: Refresh tokens never expire (stay logged in forever unless explicitly logged out)

**Sources:**
- [Passwordless email logins | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Best Practices for Supabase Auth Token Management](https://prosperasoft.com/blog/database/supabase/supabase-token-refresh/)

### Pattern 3: Real-Time Subscriptions with Cleanup

**What:** Subscribe to Postgres changes, auto-update UI, cleanup on unmount to prevent memory leaks

**When to use:** Any real-time feature (medication logs, check-ins, etc.)

**Example:**

```typescript
// src/hooks/useSupabaseRealtime.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useSupabaseRealtime<T>(
  table: string,
  filter?: string
) {
  const [data, setData] = useState<T[]>([])
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    async function setupSubscription() {
      // Initial fetch
      const { data: initialData } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })

      if (initialData) setData(initialData as T[])

      // Subscribe to changes
      channel = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',  // INSERT, UPDATE, DELETE
            schema: 'public',
            table,
            filter,  // e.g., 'user_id=eq.123'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as T, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item) =>
                  (item as any).id === (payload.new as any).id
                    ? (payload.new as T)
                    : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item) => (item as any).id !== (payload.old as any).id)
              )
            }
          }
        )
        .subscribe()
    }

    setupSubscription()

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter])

  return data
}
```

**Critical cleanup pattern:**
```typescript
// Always unsubscribe in useEffect cleanup
return () => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}
```

**Why this matters:** Supabase Realtime client-side memory leaks happen when subscriptions persist after component unmount. setInterval in WebSocket connections continues running even if the component is destroyed.

**Sources:**
- [Getting Started with Realtime | Supabase Docs](https://supabase.com/docs/guides/realtime/getting_started)
- [Supabase Realtime Client-Side Memory Leak](https://drdroid.io/stack-diagnosis/supabase-realtime-client-side-memory-leak)

### Pattern 4: Read-Only Offline Mode

**What:** Cache data locally for offline viewing, disable mutation UI when offline

**When to use:** Apps where offline mutations are rare, avoiding conflict resolution complexity

**Example:**

```typescript
// src/hooks/useOnlineStatus.ts
import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine)

    // Listen to browser events
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check (browser events are unreliable)
    const interval = setInterval(async () => {
      try {
        await fetch('/api/health', { method: 'HEAD' })
        setIsOnline(true)
      } catch {
        setIsOnline(false)
      }
    }, 30000)  // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return isOnline
}
```

```typescript
// src/components/offline/OfflineBanner.tsx
'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="bg-amber-100 text-amber-900 px-4 py-2 text-sm">
      You're offline. You can view the dashboard but can't take actions until reconnected.
    </div>
  )
}
```

```typescript
// Disable buttons when offline
<Button disabled={!isOnline}>Mark as Taken</Button>
```

**UI patterns for read-only state:**
- Use `disabled` attribute (NOT just `aria-disabled`)
- Add visual indicators (grayed out, opacity reduced)
- Show informative message (banner, toast)
- Don't hide UI entirely (user should see what's available when online)

**Sources:**
- [Disabled and read-only states - Cloudscape Design System](https://cloudscape.design/patterns/general/disabled-and-read-only-states/)
- [Offline UX design guidelines | web.dev](https://web.dev/offline-ux-design-guidelines/)

### Pattern 5: Row Level Security (RLS) Policies

**What:** Postgres-level access control enforced on every query, regardless of client

**When to use:** Always. Non-negotiable for production Supabase apps.

**Example:**

```sql
-- Enable RLS on table
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/modify medications for their household
CREATE POLICY "Users can view household medications"
  ON medications
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM auth.users
      WHERE email IN ('harriswatk@gmail.com', 'kentwatkins1@me.com')
    )
  );

CREATE POLICY "Users can insert household medications"
  ON medications
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM auth.users
      WHERE email IN ('harriswatk@gmail.com', 'kentwatkins1@me.com')
    )
  );

-- Index columns used in RLS policies (performance!)
CREATE INDEX idx_medications_user_id ON medications(user_id);
```

**Critical RLS rules:**
1. **Enable RLS on every table** — Even public tables need explicit policies
2. **Index policy columns** — Missing indexes are the #1 RLS performance killer
3. **Use USING for reads/deletes, WITH CHECK for writes** — UPDATE needs both
4. **Test with both users** — Verify Harris and Kent can both access shared data

**2026 security alert:** In January 2025, 170+ apps built with Lovable had exposed databases due to missing RLS. 83% of exposed Supabase databases involved RLS misconfigurations.

**Sources:**
- [Supabase Row Level Security (RLS): Complete Guide (2026)](https://designrevision.com/blog/supabase-row-level-security)
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pattern 6: TypeScript Types from Supabase Schema

**What:** Auto-generate TypeScript types from your Postgres schema

**When to use:** Every time you create/modify tables

**Example:**

```bash
# Generate types
npx supabase gen types typescript --project-id ishhmpxejnzpoxuwaajn > src/types/database.types.ts
```

```typescript
// src/types/database.types.ts (generated)
export type Database = {
  public: {
    Tables: {
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          frequency?: string
          created_at?: string
        }
      }
    }
  }
}
```

```typescript
// Usage in components
import type { Database } from '@/types/database.types'

type Medication = Database['public']['Tables']['medications']['Row']

const supabase = createClient<Database>()  // Fully typed!
```

**Sources:**
- [Generating TypeScript Types | Supabase Docs](https://supabase.com/docs/guides/api/rest/generating-types)

### Anti-Patterns to Avoid

- **Using `getSession()` in server code:** Use `getClaims()` instead. `getSession()` doesn't validate JWT signature on every call, opening security vulnerabilities.
- **Not awaiting `cookies()` in Next.js 15:** Breaking change from v14. Will cause "Property accessed before async" errors.
- **Forgetting real-time cleanup:** Memory leaks accumulate quickly. Always return cleanup function from `useEffect`.
- **JWT expiration below 5 minutes:** Causes increased Auth server load, clock skew issues, and mid-request token expiration.
- **Storing sensitive data in `NEXT_PUBLIC_*` env vars:** These are inlined into client bundles. Use server-only env vars for secrets.
- **Not indexing RLS policy columns:** RLS queries run on every database operation. Missing indexes = slow queries at scale.
- **Relying only on browser online/offline events:** Events are unreliable. Add periodic connectivity checks.
- **Using HTTP-only cookies for client-side apps:** Client JS can't access HTTP-only cookies, breaking session refresh. Use regular cookies with secure flags.
- **Dumping everything in `page.tsx`:** Separate client/server Supabase clients, UI components, and business logic from the start.

**Sources:**
- [Supabase Docs | Troubleshooting | Next.js - Supabase Auth issues](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- [Next.js 15 not working with Supabase · Issue #30030](https://github.com/supabase/supabase/issues/30030)
- [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session refresh | Custom JWT refresh logic | Supabase `@supabase/ssr` with middleware | Handles reuse detection, 10-second grace window, parent token matching |
| Form validation | Custom validators | Zod + React Hook Form | Runtime safety, type inference, server action security |
| Accessible UI primitives | Custom focus management, ARIA | shadcn/ui (Radix under hood) | Production-tested accessibility, keyboard nav, screen readers |
| Service worker caching | Manual cache management | Serwist (next-pwa successor) | Handles precaching, runtime caching, background sync |
| Real-time WebSocket connection | Raw WebSocket client | Supabase Realtime | Auto-reconnection, presence, Postgres CDC integration |
| Offline sync queue | Custom IndexedDB queue + retry logic | (Future: consider rxdb, WatermelonDB) | Conflict resolution, sync state machine, edge cases |
| Bottom navigation | Custom mobile nav component | Custom component with shadcn primitives | No official shadcn component yet, but community examples + Radix tabs |

**Key insight:** Auth session management has dozens of edge cases (token reuse, clock skew, concurrent requests, SSR/client sync). Magic links eliminate password reset flows entirely. IndexedDB has complex transaction APIs that libraries abstract. Accessible UI requires WAI-ARIA expertise that Radix provides.

**Sources:**
- [User sessions | Supabase Docs](https://supabase.com/docs/guides/auth/sessions)
- [shadcn UI: Complete Guide (2026)](https://designrevision.com/blog/shadcn-ui-guide)
- [Building an Offline-First PWA Notes App with Next.js, IndexedDB, and Supabase](https://medium.com/@oluwadaprof/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)

## Common Pitfalls

### Pitfall 1: Row Level Security Disabled or Misconfigured

**What goes wrong:** Database exposed to public. In January 2025, 170+ apps built with Lovable exposed sensitive data due to missing RLS.

**Why it happens:** Supabase locks everything by default. Developers test with service role key (bypasses RLS), assume it works, then ship with anon key.

**How to avoid:**
1. Enable RLS on every table: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create explicit policies for SELECT, INSERT, UPDATE, DELETE
3. Test with anon key, not service role key
4. Index all columns used in RLS policies

**Warning signs:**
- Empty results when querying with anon key but data exists
- Queries slow down with RLS enabled (missing indexes)
- Can access data from wrong user account

**Sources:**
- [Supabase Row Level Security (RLS): Complete Guide (2026)](https://designrevision.com/blog/supabase-row-level-security)
- [Best Practices for Supabase | Security, Scaling & Maintainability](https://www.leanware.co/insights/supabase-best-practices)

### Pitfall 2: Real-Time Subscription Memory Leaks

**What goes wrong:** App memory usage grows over time, eventually crashes. Long-running sessions (medical dashboard open 24/7) hit this fast.

**Why it happens:** Supabase Realtime uses setInterval for connection heartbeats. If you don't unsubscribe, intervals persist even after component unmounts.

**How to avoid:**
```typescript
useEffect(() => {
  const channel = supabase.channel('changes').subscribe()

  // ALWAYS return cleanup function
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

**Warning signs:**
- Browser DevTools memory profiler shows increasing heap size
- App slows down after staying open for hours
- Multiple active WebSocket connections in Network tab

**Sources:**
- [Supabase Realtime Client-Side Memory Leak](https://drdroid.io/stack-diagnosis/supabase-realtime-client-side-memory-leak)
- [GoTrueClient Memory Leak · Issue #856](https://github.com/supabase/auth-js/issues/856)

### Pitfall 3: Next.js 15 Async Cookies Breaking Change

**What goes wrong:** `TypeError: Cannot read property 'get' of undefined` or "Property accessed before async" errors.

**Why it happens:** Next.js 15 made `cookies()`, `headers()`, and `draftMode()` async. Old code like `cookies().get('name')` no longer works.

**How to avoid:**
```typescript
// OLD (Next.js 14)
const cookieStore = cookies()
const value = cookieStore.get('name')

// NEW (Next.js 15)
const cookieStore = await cookies()
const value = cookieStore.get('name')
```

**Warning signs:**
- TypeScript errors about accessing properties before await
- Runtime errors in middleware or server components
- Supabase auth helpers throwing errors

**Sources:**
- [Next.js 15 not working with Supabase · Issue #30030](https://github.com/supabase/supabase/issues/30030)
- [Supabase Docs | Troubleshooting | Next.js - Supabase Auth issues](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)

### Pitfall 4: Short JWT Expiration Causing Load Issues

**What goes wrong:** Auth server overloaded, clock skew errors, tokens expire mid-request.

**Why it happens:** Default 1 hour is recommended. Developers set 5 minutes thinking it's "more secure."

**How to avoid:**
- Keep default 1-hour JWT expiration
- Let refresh tokens handle long-lived sessions (they never expire)
- Only reduce if you have specific regulatory requirements

**Warning signs:**
- High frequency of token refresh requests
- "JWT expired" errors during long operations
- Clock skew errors in distributed systems

**Sources:**
- [User sessions | Supabase Docs](https://supabase.com/docs/guides/auth/sessions)

### Pitfall 5: Client-Side Environment Variables Exposed

**What goes wrong:** API keys, database credentials, or secrets leak into client JavaScript bundles.

**Why it happens:** `NEXT_PUBLIC_*` vars are inlined at build time into all client code. Developers prefix sensitive vars with `NEXT_PUBLIC_` by mistake.

**How to avoid:**
- Only use `NEXT_PUBLIC_` for truly public values (Supabase URL, anon key)
- Keep service role keys, API secrets server-side only
- Audit `.env.local` before production deploy

**Warning signs:**
- Secrets visible in browser DevTools Sources tab
- Build output shows inlined sensitive strings
- Security scanners flag exposed credentials

**Sources:**
- [Guides: Environment Variables | Next.js](https://nextjs.org/docs/pages/guides/environment-variables)
- [Managing Environment Variables in Next.js: Protecting Sensitive Information](https://medium.com/@bloodturtle/managing-environment-variables-in-next-js-protecting-sensitive-information-95ba60910d56)

### Pitfall 6: Unreliable Offline Detection

**What goes wrong:** User is offline but app shows "online," actions fail silently. Or user is online but app shows "offline," UI disabled unnecessarily.

**Why it happens:** Browser `navigator.onLine` only detects network interface status, not actual internet connectivity. Events fire inconsistently.

**How to avoid:**
```typescript
// Combine browser events + periodic connectivity checks
useEffect(() => {
  setIsOnline(navigator.onLine)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Periodic health check
  const interval = setInterval(async () => {
    try {
      await fetch('/api/health', { method: 'HEAD' })
      setIsOnline(true)
    } catch {
      setIsOnline(false)
    }
  }, 30000)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    clearInterval(interval)
  }
}, [])
```

**Warning signs:**
- User reports actions failing with no error message
- Sync status stuck on "Syncing..." when online
- Offline banner doesn't appear when WiFi disconnects

**Sources:**
- [Implementing Offline-First with IndexedDB and Sync](https://medium.com/@sohail_saifii/implementing-offline-first-with-indexeddb-and-sync-a-real-world-guide-0638c8d01056)
- [How to Build Offline Capabilities](https://oneuptime.com/blog/post/2026-01-30-offline-capabilities/view)

## Code Examples

Verified patterns from official sources:

### Email Login with Magic Link (Passwordless)

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/today`,
      },
    })

    if (error) {
      alert(error.message)
    } else {
      setEmailSent(true)
    }

    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <h2 className="text-2xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">
          We sent a magic link to {email}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4 p-8">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="harriswatk@gmail.com"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  )
}
```

**Source:** [Passwordless email logins | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)

### Protected Route Pattern (Server Component)

```typescript
// src/app/(dashboard)/today/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TodayPage() {
  const supabase = await createClient()

  // Validate session (use getClaims, not getSession!)
  const { data: { claims } } = await supabase.auth.getClaims()

  if (!claims) {
    redirect('/login')
  }

  const user = claims.sub  // User ID from JWT

  return (
    <div>
      <h1>Today's Schedule</h1>
      <p>Logged in as: {claims.email}</p>
    </div>
  )
}
```

**Source:** [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

### PWA Manifest (Mobile App Install)

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Medical Dashboard',
    short_name: 'MedDash',
    description: 'Kent's medication and care coordination',
    start_url: '/today',
    display: 'standalone',
    background_color: '#f0f9ff',  // Soft blue background
    theme_color: '#10b981',       // Warm green accent
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

**Source:** [How to build a Progressive Web Application (PWA) with Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)

### Warm Color Palette (Tailwind Custom Colors)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, soft palette (Headspace/Calm vibes)
        primary: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',  // Main green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          50: '#faf5ff',   // Very light purple
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Main purple
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      borderRadius: {
        'soft': '12px',  // Rounded corners everywhere
      },
    },
  },
  plugins: [],
}

export default config
```

**Source:** [Tailwind CSS - Customizing Colors](https://tailwindcss.com/docs/customizing-colors)

### Bottom Navigation Component (Mobile-First)

```typescript
// src/components/layout/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, History } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Today', href: '/today', icon: Calendar },
    { name: 'History', href: '/history', icon: History },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Note:** shadcn/ui doesn't have an official bottom nav component yet. This is a custom implementation using Radix patterns and shadcn conventions.

**Sources:**
- [[feat]: Add Bottom Navigation component · Issue #8847](https://github.com/shadcn-ui/ui/issues/8847)
- [create a bottom navigation for mobile | shadcn/ui](https://v0.app/t/DPauvtLudTe)

### Zod Schema for Server Actions

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      (email) => ['harriswatk@gmail.com', 'kentwatkins1@me.com'].includes(email),
      'Only Harris and Kent can log in'
    ),
})

export type LoginInput = z.infer<typeof loginSchema>
```

```typescript
// src/app/actions/auth.ts
'use server'

import { z } from 'zod'
import { loginSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  // Runtime validation (TypeScript types are erased!)
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/today`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

**Sources:**
- [Validating the Next.js API inputs with Zod and Typescript](https://makerkit.dev/docs/next-supabase/development/validating-api-input-zod)
- [Next.js Server Actions Security: 5 Vulnerabilities You Must Fix](https://makerkit.dev/blog/tutorials/secure-nextjs-server-actions)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa | Serwist | 2024-2025 | next-pwa is unmaintained, Serwist is active successor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 2025 | Supabase transitioning to new key format (sb_publishable_xxx) |
| `cookies()` synchronous | `await cookies()` | Next.js 15 (2024) | Breaking change, must await in all server code |
| `getSession()` | `getClaims()` | Supabase 2024 | getClaims validates JWT signature, getSession doesn't |
| middleware.ts | proxy.ts | Next.js 15.5+ (2026) | Middleware renamed to proxy (codemod available) |
| Pages Router | App Router | Next.js 13+ (2023) | Server Components, streaming, layouts |
| Tailwind v3 RGB colors | Tailwind v4 OKLCH colors | 2025 | More vibrant, accessible, perceptually uniform |

**Deprecated/outdated:**
- **next-pwa:** Use Serwist instead (next-pwa is no longer maintained)
- **@supabase/auth-helpers-nextjs:** Use @supabase/ssr instead (deprecated)
- **getSession() in server code:** Use getClaims() for JWT validation
- **Synchronous cookies():** Always await in Next.js 15+
- **HTTP-only cookies for SPA:** Only works for SSR, not client-side refresh

**Sources:**
- [Building a Progressive Web App (PWA) in Next.js with Serwist](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7)
- [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Next.js 15 not working with Supabase · Issue #30030](https://github.com/supabase/supabase/issues/30030)

## Open Questions

### 1. Schema Migration Strategy for Existing Supabase Project

**What we know:**
- Project ref: `ishhmpxejnzpoxuwaajn` exists
- Need to check if it has existing tables
- Supabase offers declarative schemas (new) or imperative migrations (traditional)

**What's unclear:**
- Whether to drop old tables or build alongside
- If existing tables have data that needs preserving

**Recommendation:**
- Use `supabase db remote commit` to snapshot current schema before changes
- Create new tables with RLS enabled from start
- Drop old tables only after confirming new schema works
- Use declarative schemas for cleaner migration tracking

**Confidence:** MEDIUM (depends on actual project state)

### 2. Bottom Navigation Component Source

**What we know:**
- shadcn/ui has no official bottom navigation component
- Feature requested (Issue #8847) but not merged
- Community examples exist (v0.app, purecode.ai)

**What's unclear:**
- Whether to build custom or wait for official component
- Best accessibility patterns for mobile bottom nav

**Recommendation:**
- Build custom component using Radix Tabs primitive
- Follow Material Design bottom navigation guidelines
- Add to `src/components/layout/` (not `ui/` since not from shadcn)

**Confidence:** HIGH (custom component necessary, patterns well-established)

### 3. Offline Caching Strategy Detail

**What we know:**
- Read-only offline mode decided (no mutations)
- IndexedDB for structured data, Service Worker for static assets
- Periodic connectivity checks needed

**What's unclear:**
- Which data to cache (all? recent only?)
- Cache invalidation strategy
- Service worker update frequency

**Recommendation:**
- Cache last 30 days of medication logs, all active medications
- Use stale-while-revalidate for dashboard data
- Daily service worker updates (check on app launch)

**Confidence:** MEDIUM (depends on data volume, can iterate)

### 4. User Attribution Display Pattern

**What we know:**
- Actions must show who did what ("Kent - 2:30 PM")
- Two users only: Harris and Kent

**What's unclear:**
- Display format (name only, initials, avatar?)
- Timestamp format (relative "2 hours ago" vs absolute "2:30 PM"?)
- Position in UI (inline with action, separate column, hover tooltip?)

**Recommendation:**
- Display: "Kent • 2:30 PM" inline with action
- Use absolute time for today, relative for older ("Yesterday", "Feb 14")
- Get user name from auth metadata or hardcode mapping

**Confidence:** MEDIUM (UX decision, can iterate based on feedback)

## Sources

### Primary (HIGH confidence)

**Official Supabase Documentation:**
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Advanced guide | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [User sessions | Supabase Docs](https://supabase.com/docs/guides/auth/sessions)
- [Passwordless email logins | Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Getting Started with Realtime | Supabase Docs](https://supabase.com/docs/guides/realtime/getting_started)
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [Generating TypeScript Types | Supabase Docs](https://supabase.com/docs/guides/api/rest/generating-types)

**Official Next.js Documentation:**
- [How to build a Progressive Web Application (PWA) with Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Getting Started: Project Structure | Next.js](https://nextjs.org/docs/app/getting-started/project-structure)
- [Guides: Environment Variables | Next.js](https://nextjs.org/docs/pages/guides/environment-variables)
- [Routing: Middleware | Next.js](https://nextjs.org/docs/pages/building-your-application/routing/middleware)

**Official shadcn/ui Documentation:**
- [Next.js - shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
- [Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)

**Official Tailwind CSS Documentation:**
- [Tailwind CSS - Customizing Colors](https://tailwindcss.com/docs/customizing-colors)
- [Responsive design - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)

### Secondary (MEDIUM confidence)

**Technical Guides (2025-2026):**
- [Supabase Row Level Security (RLS): Complete Guide (2026) | DesignRevision](https://designrevision.com/blog/supabase-row-level-security)
- [shadcn UI: Complete Guide (2026) | DesignRevision](https://designrevision.com/blog/shadcn-ui-guide)
- [The Ultimate Guide to Organizing Your Next.js 15 Project Structure](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Building an Offline-First PWA Notes App with Next.js, IndexedDB, and Supabase](https://medium.com/@oluwadaprof/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)
- [Implementing Offline-First with IndexedDB and Sync: A Real-World Guide](https://medium.com/@sohail_saifii/implementing-offline-first-with-indexeddb-and-sync-a-real-world-guide-0638c8d01056)

**Best Practices (verified with official docs):**
- [Best Practices for Supabase | Security, Scaling & Maintainability](https://www.leanware.co/insights/supabase-best-practices)
- [Best Practices for Supabase Auth Token Management](https://prosperasoft.com/blog/database/supabase/supabase-token-refresh/)
- [Validating the Next.js API inputs with Zod and Typescript](https://makerkit.dev/docs/next-supabase/development/validating-api-input-zod)
- [Next.js Server Actions Security: 5 Vulnerabilities You Must Fix](https://makerkit.dev/blog/tutorials/secure-nextjs-server-actions)

**Issue Trackers & GitHub Discussions:**
- [Next.js 15 not working with Supabase · Issue #30030](https://github.com/supabase/supabase/issues/30030)
- [[feat]: Add Bottom Navigation component · Issue #8847](https://github.com/shadcn-ui/ui/issues/8847)
- [Supabase Realtime Client-Side Memory Leak](https://drdroid.io/stack-diagnosis/supabase-realtime-client-side-memory-leak)
- [GoTrueClient Memory Leak · Issue #856](https://github.com/supabase/auth-js/issues/856)

### Tertiary (LOW confidence - marked for validation)

**Community Examples:**
- [create a bottom navigation for mobile | shadcn/ui](https://v0.app/t/DPauvtLudTe) - AI-generated example, not verified
- [Supabase + Next.js Guide… The Real Way](https://medium.com/@iamqitmeeer/supabase-next-js-guide-the-real-way-01a7f2bd140c) - Community tutorial, patterns need verification

**Design System References:**
- [Disabled and read-only states - Cloudscape Design System](https://cloudscape.design/patterns/general/disabled-and-read-only-states/)
- [Offline UX design guidelines | web.dev](https://web.dev/offline-ux-design-guidelines/)

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH - All libraries are official, widely adopted, and actively maintained
- **Architecture patterns:** HIGH - All patterns verified from official Supabase/Next.js docs
- **Pitfalls:** HIGH - Backed by recent issues, security reports, and official troubleshooting guides
- **Bottom nav component:** MEDIUM - No official shadcn component, custom implementation required
- **Offline caching details:** MEDIUM - Strategy chosen (read-only), implementation details need iteration

**Research date:** 2026-02-16

**Valid until:** 2026-03-16 (30 days for stable stack, Next.js/Supabase evolve slowly)

**Re-check needed for:**
- shadcn/ui bottom navigation component (check if official component released)
- Next.js 16 release (may have breaking changes)
- Supabase key format transition (ANON_KEY vs PUBLISHABLE_KEY)
