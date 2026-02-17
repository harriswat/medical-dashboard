# Medical Dashboard for Post-Surgery Care

## What This Is

A mobile-first web application for coordinating post-surgery care between Harris (patient) and Kent (caregiver). A singular daily dashboard showing the 6AM-10PM schedule with medications, tasks, and check-ins. Insanely easy and user-friendly -- no unnecessary bells and whistles.

## Core Value

Harris and Kent can see the same daily schedule, track medications, assign each other tasks, and get email notifications -- ensuring nothing critical is missed during recovery.

## Users

| User | Role | Email |
|------|------|-------|
| Harris | Patient | harriswatk@gmail.com |
| Kent | Caregiver | kentwatkins1@me.com |

**Auth**: Simple login (email-based). Once logged in, never have to login again (persistent session).

## Medications (Pre-loaded)

| Medication | Purpose | Schedule | Take With Food? | Key Notes |
|---|---|---|---|---|
| Hydrocodone/Acetaminophen | Pain management | As prescribed (likely every 4-6 hrs) | Yes, recommended | NO grapefruit. NO alcohol. Causes drowsiness/dizziness. |
| Cefdinir | Antibiotic (infection prevention) | As prescribed (likely 2x daily) | Optional, helps stomach | Take probiotics 2hrs apart. NO antacids or iron supplements at same time (2hr gap). |
| Zofran (ondansetron) | Anti-nausea | As needed (PRN) | Either way | Moderate interaction with hydrocodone (serotonin syndrome risk). Space doses apart when possible. |

**Drug Interaction Warning**: Hydrocodone + Zofran together can increase risk of serotonin syndrome. Symptoms to watch: confusion, rapid heart rate, fever, muscle stiffness. Doctor should be aware of this combination.

**Probiotic Recommendation**: Take probiotics daily to counteract Cefdinir's effect on gut bacteria. Take probiotics at least 2 hours before or after Cefdinir dose.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] Simple email login for Harris and Kent, persistent session (never re-login)
- [ ] Daily dashboard showing 6AM-10PM schedule with all medications and tasks
- [ ] Pre-loaded medications (Hydrocodone/Acetaminophen, Cefdinir, Zofran) with dosing notes and warnings
- [ ] Mark medication as taken/skipped with timestamp
- [ ] PRN (as-needed) medication logging (Zofran)
- [ ] Record feeling check-ins 3x daily (morning/afternoon/night) with 1-10 rating scale
- [ ] Log care activities (wound care, gauze changes, exercises, etc.) with timestamps
- [ ] Task assignment between Harris and Kent with email notification on assignment
- [ ] Store doctor contact information and emergency numbers
- [ ] Real-time sync between both devices
- [ ] Mobile-optimized interface (touch-friendly, large tap targets, proper input sizing)
- [ ] Email notifications for task assignments (kentwatkins1@me.com / harriswatk@gmail.com)

### Out of Scope

- Multi-tenant support (multiple patients/caregivers) -- Harris + Kent only
- Desktop-first design -- mobile is primary, desktop is bonus
- Photo sharing -- text-based communication sufficient for v1
- Video calls -- out of scope, use phone/FaceTime separately
- Integration with pharmacy systems -- manual entry sufficient
- Complex notification system -- email for tasks only, no push notifications v1

## Context

**Surgery Timeline:**
- Surgery date: Wednesday (this week)
- Need dashboard operational before surgery
- Critical features: medication tracking, daily schedule, task assignment

**Previous Attempt:**
- Had 40% complete implementation with medicine wizard and basic UI
- Restarting from scratch for cleaner architecture
- Supabase database previously set up (project ref: ishhmpxejnzpoxuwaajn)
- Can reuse database or create fresh schema

**Technical Environment:**
- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Supabase for backend (database, auth, real-time subscriptions)
- Mobile-first responsive design
- iOS primary target (iPhone)

**Use Case:**
- Harris opens app, sees today's 6AM-10PM schedule with all meds and tasks
- Taps checkbox to mark medication taken
- Kent sees the update instantly on his phone
- Kent assigns Harris a task ("Do breathing exercises") -- Harris gets email
- Harris logs feeling check-in -- Kent sees it on the dashboard
- Both can see drug interaction warnings and dosing notes inline

## Constraints

- **Timeline**: Must be functional before Wednesday surgery (48-72 hours)
- **Tech Stack**: Next.js 15 + TypeScript + Supabase (proven stack, fast development)
- **Mobile-First**: iPhone is primary device (16px input font-size to prevent iOS zoom)
- **Deployment**: Vercel or Digital Ocean (DO CLI available)
- **Users**: Harris (patient) + Kent (caregiver) only
- **Performance**: Real-time sync critical (Supabase subscriptions)
- **Simplicity**: Insanely easy UX. No unnecessary complexity.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase Auth (email login, persistent session) | Simple login, never re-login, built-in to Supabase | Decided |
| Pre-loaded medications with drug info | 3 known meds, no need for complex medication wizard | Decided |
| Daily 6AM-10PM schedule as primary UI | Single dashboard view is simplest and most useful | Decided |
| Task assignment with email notifications | Lightweight coordination, email via Supabase or Resend | Decided |
| Mobile-first design | Primary usage on phones during recovery | Decided |
| Next.js 15 with App Router | Modern React, fast, good mobile performance | Decided |

---
*Last updated: 2026-02-16 after user refinement (Harris=patient, Kent=caregiver, specific meds, task system)*
