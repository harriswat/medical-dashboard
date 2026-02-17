# Roadmap: Medical Dashboard for Post-Surgery Care

## Overview

4 phases over 48-72 hours. Delivers a daily schedule dashboard (6AM-10PM) for Harris (patient) and Kent (caregiver) with pre-loaded medications, task assignment, feeling check-ins, and email notifications. Auth via Supabase (login once, persist forever). Real-time sync between both devices.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions if needed (marked with INSERTED)

- [ ] **Phase 1: Foundation & Auth** - Next.js project, Supabase schema, email auth (persistent session), mobile-first app shell, real-time sync infrastructure
- [ ] **Phase 2: Daily Schedule & Medications** - 6AM-10PM daily dashboard, pre-loaded medications with drug info/warnings, mark taken/skipped, PRN logging, real-time sync
- [ ] **Phase 3: Tasks, Check-ins & Contacts** - Task assignment with email notifications, feeling check-ins (3x daily), care activity logging, doctor contacts
- [ ] **Phase 4: Mobile Validation & Deploy** - iPhone testing, accessibility validation, production deployment

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Harris and Kent can log in with email (once, never again), see a mobile-first app shell, and have real-time sync working between their devices
**Depends on**: Nothing (first phase)
**Requirements**: REQ-AUTH-01, REQ-SYNC-01 through 05, REQ-MOBILE-06
**Success Criteria** (what must be TRUE):
  1. Harris can log in with harriswatk@gmail.com and Kent can log in with kentwatkins1@me.com
  2. After first login, session persists -- neither user has to log in again
  3. App shell is mobile-first with bottom navigation (thumb-friendly)
  4. Supabase database schema is set up with RLS policies isolating data correctly
  5. Real-time sync works: a change on one device appears on the other within 1 second
  6. Sync status indicator visible ("Synced" / "Syncing..." / "Offline")
  7. When offline, user can view content but actions are disabled (read-only per user decision)
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Next.js 15 scaffolding, Supabase SSR clients, middleware, credential setup
- [ ] 01-02-PLAN.md -- Magic link auth flow, protected dashboard routes, database schema with RLS
- [ ] 01-03-PLAN.md -- Mobile-first app shell (warm design), bottom nav, real-time subscriptions, sync status, offline detection

### Phase 2: Daily Schedule & Medications
**Goal**: Harris opens the app and sees today's 6AM-10PM schedule with all medications. Can mark meds as taken/skipped. Kent sees updates instantly. Drug info and warnings are visible inline.
**Depends on**: Phase 1
**Requirements**: REQ-MED-01 through 07, REQ-DASH-01
**Success Criteria** (what must be TRUE):
  1. Daily dashboard shows a 6AM-10PM timeline with all scheduled medications in their time slots
  2. Three medications are pre-loaded: Hydrocodone/Acetaminophen, Cefdinir, Zofran (ondansetron)
  3. Each medication shows plain-language dosing notes (e.g., "Take with food", "No grapefruit")
  4. Drug interaction warning for Hydrocodone + Zofran is visible
  5. Harris can mark any medication as "Taken" or "Skipped" with one tap (large checkboxes)
  6. Zofran shows as PRN (as-needed) -- can be logged anytime without a fixed schedule
  7. Medication history view shows all past doses taken/skipped
  8. When Harris logs a medication, Kent sees it within 1 second
**Plans**: TBD

Plans:
- [ ] 02-01: Daily 6AM-10PM schedule dashboard, pre-loaded medications with drug info and warnings
- [ ] 02-02: Medication logging (taken/skipped), PRN support, history view, real-time sync

### Phase 3: Tasks, Check-ins & Contacts
**Goal**: Harris and Kent can assign each other tasks (with email notification), Harris can log feeling check-ins, both can log care activities, and doctor contacts are one tap away
**Depends on**: Phase 2
**Requirements**: REQ-FEEL-01 through 05, REQ-CARE-01 through 05, REQ-DOC-01 through 03, REQ-TASK-01 through 03, REQ-EMAIL-01
**Success Criteria** (what must be TRUE):
  1. Either user can create a task and assign it to the other (e.g., "Do breathing exercises")
  2. When a task is assigned, the assignee gets an email notification
  3. Tasks show on the daily dashboard and can be marked complete
  4. Harris can log feeling check-in (pain/mood/energy 1-10) for morning, afternoon, or evening
  5. Both users can view feeling history timeline
  6. Either user can log a care activity with timestamp, category, and notes
  7. Both users see the same activity timeline in real-time
  8. Doctor contact info is accessible within one tap from home (name, phone, emergency vs routine)
**Plans**: TBD

Plans:
- [ ] 03-01: Task assignment system with email notifications (Supabase Edge Functions or Resend)
- [ ] 03-02: Feeling check-ins, care activity logging, doctor contacts page

### Phase 4: Mobile Validation & Deploy
**Goal**: The dashboard works perfectly on real iPhones and is deployed to production
**Depends on**: Phase 3
**Requirements**: REQ-MOBILE-01 through 05
**Success Criteria** (what must be TRUE):
  1. All tap targets measure at least 44x44pt on an actual iPhone
  2. All inputs use 16px minimum font size (no iOS auto-zoom)
  3. Important actions are in bottom 2/3 of screen (thumb zone)
  4. Text contrast meets 4.5:1 minimum
  5. Deployed to production URL, Harris and Kent can both use it simultaneously
**Plans**: TBD

Plans:
- [ ] 04-01: Real-device iPhone testing, accessibility fixes, production deployment

## Coverage

**v1 Requirements mapped:**

| Requirement | Phase |
|-------------|-------|
| REQ-AUTH-01 (email login) | Phase 1 |
| REQ-AUTH-02 (persistent session) | Phase 1 |
| REQ-SYNC-01 through 05 | Phase 1 |
| REQ-MOBILE-06 (offline shell) | Phase 1 |
| REQ-DASH-01 (6AM-10PM schedule) | Phase 2 |
| REQ-MED-01 through 07 | Phase 2 |
| REQ-TASK-01 (task creation) | Phase 3 |
| REQ-TASK-02 (task assignment) | Phase 3 |
| REQ-TASK-03 (task on dashboard) | Phase 3 |
| REQ-EMAIL-01 (task email notification) | Phase 3 |
| REQ-FEEL-01 through 05 | Phase 3 |
| REQ-CARE-01 through 05 | Phase 3 |
| REQ-DOC-01 through 03 | Phase 3 |
| REQ-MOBILE-01 through 05 | Phase 4 |

**v2 (deferred):** Calendar view, photo uploads, PWA installation, push notifications, messaging thread

## Progress

**Execution Order:** Phase 1 > Phase 2 > Phase 3 > Phase 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation & Auth | 0/3 | Not started | - |
| 2. Daily Schedule & Medications | 0/2 | Not started | - |
| 3. Tasks, Check-ins & Contacts | 0/2 | Not started | - |
| 4. Mobile Validation & Deploy | 0/1 | Not started | - |

---
*Created: 2026-02-16*
*Updated: 2026-02-16 (refined with specific users, medications, task system, email notifications)*
*Phases: 4 | Plans: 8 | Timeline: 48-72 hours*
