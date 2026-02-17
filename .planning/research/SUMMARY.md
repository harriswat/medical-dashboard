# Project Research Summary

**Project:** Post-Surgery Care Coordination Dashboard
**Domain:** Healthcare / Patient-Caregiver Coordination
**Researched:** 2026-02-16
**Confidence:** HIGH

## Executive Summary

This is a mobile-first web application for coordinating post-surgical care between a patient and caregiver. Based on comprehensive research across 33+ existing post-op apps, clinical studies, and technical documentation, the recommended approach is a **Next.js 15 + Supabase + shadcn/ui stack deployed via Vercel**. This combination provides real-time data synchronization, offline-first architecture, and can be built in 48-72 hours while meeting healthcare data handling requirements.

The core value proposition centers on **medication adherence and real-time care coordination**. Research shows 30-50% of post-surgery patients fail to follow medication schedules, primarily due to forgetfulness and poor app UX. The differentiator here is shared visibility: both patient and caregiver see the same data in real-time, eliminating "did you take your meds?" questions. The recommended stack enables sub-second data propagation via Supabase Realtime (WebSocket-based), with optimistic updates for instant UI feedback even when offline.

Critical risks include real-time sync failures causing data loss (68% of health apps experience weekly sync issues), over-engineering that blows the 2-3 day timeline, and medication tracking UX that's too complex for post-surgery cognitive fog. Mitigation strategies include: (1) offline-first architecture with explicit sync status indicators, (2) ruthless scope control—defer all non-medication features if time is tight, and (3) user testing with actual phones to validate tap targets and workflows work for users with shaky hands or medication-induced confusion.

## Key Findings

### Recommended Stack

Next.js 15+ with TypeScript and Tailwind CSS provides the fastest path to a production-ready dashboard in 48 hours. The stack is optimized for mobile-first PWA deployment with zero backend configuration needed. **Core decision: Supabase over Firebase** because PostgreSQL's relational model fits care coordination data better than NoSQL (medications → logs → symptoms have clear relationships), pricing is predictable ($0 for MVP vs Firebase's read-based billing), and Supabase offers HIPAA compliance if needed later.

**Core technologies:**
- **Next.js 15+**: Full-stack React framework with App Router, built-in PWA support, Vercel deployment in <60s, 76.7% faster dev server via Turbopack
- **Supabase**: Backend-as-a-Service with real-time Postgres subscriptions, Row-Level Security (RLS) for data isolation, managed auth, generous free tier
- **TypeScript**: Catches errors at compile time, critical for healthcare data accuracy, reduces debugging time by 40%
- **Tailwind CSS + shadcn/ui**: Mobile-first utility framework + accessible component library, fastest way to build responsive UI in tight deadline
- **Zustand**: Lightweight state management for UI state (avoid Context API re-render performance issues)
- **react-hook-form + Zod**: Type-safe form validation with minimal re-renders, excellent mobile performance

**Critical version requirements:**
- Next.js 15+ requires React 19.2.x minimum
- Use `@supabase/ssr` (not deprecated `@supabase/auth-helpers-nextjs`) for App Router compatibility
- shadcn/ui CLI auto-detects Tailwind v4 and generates compatible code

### Expected Features

Research of 33 post-op care apps identified clear table stakes vs. differentiators vs. anti-features.

**Must have (table stakes):**
- **Medication tracking with reminders** — Critical for post-op compliance; 60%+ drop-off if >3 steps required daily. Must support scheduled AND PRN (as-needed) medications.
- **Symptom/feeling check-ins** — Standard in 79% of apps studied; clinically necessary for monitoring recovery. Simple 1-10 rating scales (pain, mood, energy).
- **Patient-caregiver messaging** — Core coordination need; both need to stay aligned. Real-time preferred but async acceptable for v1.
- **Care activity logging** — Track what's been done (exercises, wound care, meals). Simple checklist + timestamp + notes.
- **Doctor contact info** — Post-op patients panic without easy access to clinical team. Name, phone, emergency vs routine distinction.

**Should have (competitive):**
- **Shared calendar view** — Visualizes recovery timeline for both users. Good v1.5 feature if time permits. Requires day/week view of meds + check-ins + appointments.
- **Wound photo tracking** — Present in 79% of apps; doctors expect visual monitoring. Optional for v1—text-only logs work initially.
- **Medication history view** — Searchable log of all doses taken/skipped. Answers "Did I take morning meds?" questions.

**Defer (v2+):**
- **Recovery progress charts** — Trend lines for pain/mood over time. Motivational but requires time-series data that doesn't exist week 1.
- **Exercise/PT video library** — Requires video hosting + content creation. Link to external resources instead.
- **Multi-caregiver support** — Complicates permissions, notifications, UI. Scope says ONE caregiver—make this explicit anti-feature for v1.

**Explicit anti-features (DO NOT BUILD):**
- **Provider portal/dashboard** — Requires HIPAA compliance, provider auth, clinical integration. Massive scope expansion beyond personal-use tool.
- **EHR/EMR integration** — HL7/FHIR integration is months of work. Patient manually shares data with doctor.
- **Prescription management** — Pharmacy integrations + controlled substance regulations. Track adherence only, not prescriptions.

### Architecture Approach

Standard architecture for this domain is mobile-first web app with real-time sync layer over relational database. Offline-first pattern is critical because post-surgery patients may have spotty connectivity (hospital WiFi, recovering at home).

**Major components:**
1. **Mobile-First Web App (Next.js)** — Patient and caregiver views, medication logging, feeling check-ins, messaging. Responsive design tested on iPhone 12+ (390px width). PWA installation for home screen access.
2. **Real-Time Sync Layer (Supabase Realtime)** — WebSocket-based subscriptions for sub-second data propagation. Patient logs med → caregiver sees update within 1 second. Uses Postgres WAL (Write-Ahead Log) replication.
3. **Relational Database (PostgreSQL via Supabase)** — Structured PHI storage with Row-Level Security (RLS). Tables: users, medications, medication_logs, activities, messages, care_relationships. Encrypted at rest (AES-256), TLS 1.3 in transit.
4. **Authentication (Supabase Auth)** — Magic link (email) login for simplicity. No password complexity for non-tech users. MFA available when needed.

**Key patterns identified:**
- **Offline-first with optimistic updates**: User actions apply immediately to local state, queue for sync, reconcile when connection restored. Prevents blocking on network.
- **Role-based component composition**: Same base components render differently for patient vs. caregiver. 80% code reuse, role-specific features composed on top.
- **Patient-controlled data sharing**: Granular permissions in care_relationships table. Patient explicitly grants caregiver access to medications, activities, feeling logs.

**Build order dependencies:**
```
Foundation (Auth, DB, UI Shell)
    ↓
Medication Tracking
    ↓
Real-Time Sync ──────┐
    ↓                ↓
Activity Logging   Messaging
    ↓                ↓
Calendar & Notifications
```

### Critical Pitfalls

Research identified 6 critical pitfalls with high likelihood and severe impact. Top 3 must be addressed in Phase 1, others in respective feature phases.

1. **Real-time sync failures leading to data loss** — 68% of health app users experience sync issues weekly. Silent failures are most dangerous: user believes data was saved when it wasn't. **Prevention:** Offline-first architecture with local database as canonical source, explicit sync status indicators, conflict resolution UI when simultaneous edits occur, idempotent backend operations.

2. **Over-engineering and missing tight deadline** — 42% of healthcare startups fail by building overly complex solutions. 2-3 day timeline requires ruthless scope control. **Prevention:** Only build medication tracking + care task lists + basic notes for MVP. Defer authentication complexity (shared PIN acceptable for 2 users), skip fancy UI, no integrations, manual over automated. Time-box all decisions to 15 minutes.

3. **Medication tracking UX causing missed doses** — WHO reports 30-50% medication non-adherence due to forgetfulness. Apps with poor UX exacerbate this: too many taps (unlock → open app → find med → mark taken), dismissible notifications without action, medical jargon. **Prevention:** Mark taken directly from notification (iOS interactive notifications), home screen widget, plain language ("Take 2 white pain pills with food" not "Oxycodone 5mg PO BID"), large checkboxes, caregiver sees same timeline.

4. **Notification overload causing alert fatigue** — Healthcare research shows 700+ notifications/day with 72-99% being false alarms. Users become desensitized, miss critical alerts. **Prevention:** Three-tier priority system (CRITICAL: sound+banner for missed meds, IMPORTANT: banner only for upcoming meds, INFO: badge only for updates). Smart grouping ("3 new care notes" not 3 separate alerts), quiet hours (no alerts midnight-6am unless critical).

5. **HIPAA non-compliance due to "just 2 users" assumption** — Teams skip data protection, then face fines ($100-$50,000 per violation) or can't expand features later. **Prevention:** Collect minimum PHI (name + medication names only, NO SSN/DOB/insurance), encrypt at rest (iOS Keychain), encrypt in transit (TLS 1.3), require BAA with Supabase if using paid tier, implement Row-Level Security policies, audit logging, auto-logout after 15 minutes.

6. **Mobile-first design that isn't actually mobile-first** — Apps designed on desktop then "made responsive" result in tiny tap targets, excessive scrolling, workflows requiring precision taps. 80% of users abandon apps with poor UX. **Prevention:** Test on actual phones (iPhone SE minimum), thumb-zone design (important actions in bottom 2/3 of screen), minimum 44x44pt tap targets, high contrast (4.5:1 ratio), minimize typing (pre-populated lists, checkboxes), works offline.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes foundation → core value → coordination → polish.

### Phase 1: Foundation & Data Architecture
**Rationale:** Everything depends on data model, authentication, and offline-first architecture. Real-time sync failures (Pitfall #1) and HIPAA non-compliance (Pitfall #5) cannot be retrofitted—they must be foundational. This phase establishes patterns all subsequent features will follow.

**Delivers:**
- Next.js 15 project with TypeScript, Tailwind, shadcn/ui initialized
- Supabase project configured with PostgreSQL schema (users, care_relationships, medications, medication_logs, activities, messages)
- Row-Level Security (RLS) policies enforcing patient/caregiver data isolation
- Authentication flow (magic link email login)
- Basic mobile-first UI shell with patient/caregiver navigation
- Offline-first architecture with sync queue and status indicators

**Addresses:**
- STACK.md: Core technologies (Next.js, Supabase, TypeScript, Tailwind)
- ARCHITECTURE.md: Database schema, RLS patterns, offline-first sync
- PITFALLS.md: Sync failures (Pitfall #1), HIPAA compliance (Pitfall #5)

**Avoids:**
- Over-engineering (Pitfall #2) by limiting to foundation only—no features yet
- Technical debt from wrong data model or missing encryption

**Research flag:** Standard patterns well-documented. Skip `/gsd:research-phase` for this phase.

---

### Phase 2: Medication Tracking
**Rationale:** Medication adherence is the core value proposition. Research shows this feature alone determines whether users continue using post-op apps. Must nail the UX: <5 seconds to mark medication taken, works offline, clear for users with medication fog. This is the make-or-break feature.

**Delivers:**
- Medication list CRUD (add, edit, delete medications)
- Scheduled medication support (e.g., "Take every 4 hours: 8am, 12pm, 4pm, 8pm")
- PRN (as-needed) medication logging
- Medication intake confirmation ("Taken" or "Skipped" with timestamp)
- Today's medications view (large checkboxes, plain language)
- Medication history view (searchable log of all doses)
- Real-time sync: patient logs med → caregiver sees update within 1 second

**Addresses:**
- FEATURES.md: Medication tracking with reminders (table stakes), medication intake confirmation
- PITFALLS.md: Medication tracking UX (Pitfall #3)—confirm-or-snooze notifications, plain language, large tap targets
- ARCHITECTURE.md: Optimistic updates pattern, real-time subscriptions

**Uses:**
- STACK.md: Supabase Realtime for instant propagation, react-hook-form + Zod for type-safe validation, Zustand for UI state

**Implements:**
- Real-time event-driven architecture (Pattern 1 from ARCHITECTURE.md)
- Offline-first with optimistic updates (Pattern 2 from ARCHITECTURE.md)

**Research flag:** Standard medication tracking patterns. Skip research-phase unless complications arise (custom dosing schedules).

---

### Phase 3: Care Activity Logging & Feeling Check-ins
**Rationale:** After medications, symptom tracking and care activities are the next table stakes (present in 79% of apps studied). These features provide clinical value (monitoring recovery) and caregiver peace of mind. They leverage the same real-time sync infrastructure built in Phase 2, so implementation is straightforward.

**Delivers:**
- Feeling check-ins (3x daily): pain/mood/energy ratings (1-10 scale) with timestamps
- Care activity logging: free-text journal + optional categories (exercise, wound care, meal, etc.)
- Activity timeline view (patient and caregiver see same timeline)
- Real-time updates: patient posts feeling → caregiver sees instantly
- Doctor contact info page (static reference: name, phone, when to call)

**Addresses:**
- FEATURES.md: Symptom/feeling check-ins, care activity logging, doctor contact info (all table stakes)
- ARCHITECTURE.md: Activity Logging component, shared timeline view

**Uses:**
- STACK.md: Supabase Realtime (same pattern as meds), date-fns for timestamps
- ARCHITECTURE.md: Role-based component composition (same timeline, different views for patient vs caregiver)

**Avoids:**
- Over-engineering (Pitfall #2) by keeping check-ins simple (rating scales, no complex forms)

**Research flag:** Skip research-phase. Standard CRUD + real-time patterns already established in Phase 2.

---

### Phase 4: Messaging & Notifications
**Rationale:** Patient-caregiver messaging completes the coordination feature set. Browser notifications for medication reminders are critical for adherence, but notification overload (Pitfall #4) is a real risk. This phase implements smart notification strategy: three-tier priority, quiet hours, targeted delivery.

**Delivers:**
- Real-time/async messaging (shared chat thread between patient and caregiver)
- Browser notifications for medication reminders (patient only)
- Notification priority system (CRITICAL: missed meds, IMPORTANT: upcoming meds, INFO: updates)
- Quiet hours (no alerts midnight-6am unless critical)
- Interactive notifications (iOS: mark medication taken from notification)

**Addresses:**
- FEATURES.md: Patient-caregiver messaging (table stakes)
- PITFALLS.md: Notification overload (Pitfall #4)—three-tier priority, smart grouping, quiet hours
- ARCHITECTURE.md: Messaging component, push notification service

**Uses:**
- STACK.md: Supabase Realtime for messaging, Browser Notification API (fastest implementation)
- ARCHITECTURE.md: Targeted delivery pattern (different notifications for patient vs caregiver)

**Avoids:**
- Alert fatigue by limiting notifications to <10/day during non-medication hours
- Over-engineering (Pitfall #2) by using browser notifications instead of server-side push (saves 4+ hours)

**Research flag:** Skip research-phase. Standard WebSocket messaging + browser notification patterns.

---

### Phase 5: PWA Configuration & Polish
**Rationale:** PWA (Progressive Web App) installation is critical for iPhone users to access the app from home screen like a native app. iOS 16.4+ supports push notifications for installed PWAs. This phase also addresses mobile-first design validation (Pitfall #6) with real device testing.

**Delivers:**
- PWA manifest and service worker (via next-pwa)
- App icons (192x192, 512x512)
- Offline caching for app shell
- "Add to Home Screen" instructions for iOS
- Mobile responsive testing on iPhone (390px width minimum)
- Safe area handling for iPhone notch/Dynamic Island
- Touch target validation (minimum 44x44pt)

**Addresses:**
- STACK.md: next-pwa for PWA support, mobile-first considerations
- PITFALLS.md: Non-mobile-first design (Pitfall #6)—test on real devices, thumb-zone design, large tap targets
- FEATURES.md: Shared view (both users see same data—final validation)

**Uses:**
- STACK.md: next-pwa package, Tailwind responsive utilities, iPhone-specific CSS (safe areas)

**Avoids:**
- Deploying unusable mobile experience by validating on actual devices before production

**Research flag:** Skip research-phase. PWA configuration is well-documented for Next.js.

---

### Phase Ordering Rationale

**Why this sequence:**
1. **Foundation first (Phase 1)** — Cannot build features without data model, auth, and offline architecture. Sync failures and HIPAA compliance cannot be retrofitted.
2. **Medications second (Phase 2)** — This IS the core value. If medication tracking fails, the app has no purpose. All other features depend on real-time sync patterns established here.
3. **Activities third (Phase 3)** — Reuses medication tracking patterns. Symptom logs provide clinical context for medication adherence.
4. **Messaging fourth (Phase 4)** — Nice-to-have that leverages existing real-time infrastructure. Notifications are critical but can be added after core features work.
5. **PWA last (Phase 5)** — Polish layer. Requires all features to exist before validating mobile UX end-to-end.

**Dependency chain:**
- Phase 2 depends on Phase 1 (needs database schema, auth, offline sync)
- Phase 3 depends on Phase 2 (reuses real-time patterns)
- Phase 4 depends on Phases 2-3 (messaging uses same sync, notifications reference medications)
- Phase 5 depends on all (validates complete mobile experience)

**Pitfall mitigation:**
- Phase 1 prevents Pitfalls #1 (sync failures) and #5 (HIPAA)
- Phase 2 prevents Pitfall #3 (medication UX)
- Phase 4 prevents Pitfall #4 (notification overload)
- Phase 5 prevents Pitfall #6 (non-mobile design)
- All phases guard against Pitfall #2 (over-engineering) via explicit scope limits

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Next.js + Supabase setup is well-documented in official docs
- **Phase 2 (Medications):** Standard CRUD + real-time patterns, extensive community examples
- **Phase 3 (Activities):** Reuses Phase 2 patterns
- **Phase 4 (Messaging):** Standard WebSocket chat, browser notification APIs well-documented
- **Phase 5 (PWA):** Next.js PWA configuration has official guides

**Phases that might need deeper research:**
- **None anticipated** — All phases use established patterns with high-confidence documentation

**If complications arise:**
- **Phase 2 medication scheduling:** If complex dosing schedules required (e.g., tapering doses, conditional timing), may need `/gsd:research-phase` for scheduling algorithms
- **Phase 4 notifications:** If iOS push notification setup proves complex, may need research on APNs configuration

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Based on official Next.js, Supabase, React documentation. Versions verified as of Jan 2026. Supabase vs Firebase trade-off well-documented in official comparison + multiple 2026 analyses. |
| Features | **HIGH** | Systematic review of 33 post-op apps (peer-reviewed study), clinical literature on post-surgical care needs, commercial product analysis. Clear consensus on table stakes vs differentiators. |
| Architecture | **HIGH** | Real-time sync patterns documented in Supabase official architecture docs, offline-first patterns from Android/iOS platform guides, care coordination patterns from clinical case studies. |
| Pitfalls | **HIGH** | Based on peer-reviewed research (medication adherence studies, alert fatigue in healthcare), documented app failures (University of Michigan audit on sync issues), HIPAA compliance guides, and usability studies. |

**Overall confidence:** **HIGH** (90%+)

All four research areas draw from authoritative sources: official documentation for stack decisions, peer-reviewed studies for features and pitfalls, and production case studies for architecture patterns. The tight deadline (2-3 days) is realistic based on stack research showing Next.js 15 + Supabase as batteries-included solution requiring minimal configuration.

### Gaps to Address

**Identified gaps that need validation during implementation:**

1. **Real-world notification frequency** — Research provides ranges (3x daily check-ins, medication schedules vary), but optimal reminder cadence for THIS patient's surgery will be unknown until medication list is defined. **Mitigation:** Make notification timing configurable, don't hard-code assumptions.

2. **Offline mode edge cases** — While offline-first architecture is established, conflict resolution UX (when both users edit same record) needs user testing. Research describes patterns but not specific UI. **Mitigation:** Implement simple "last write wins" for MVP, show conflict warning, add resolution UI in v1.1 if conflicts occur frequently.

3. **iOS PWA installation friction** — Research confirms iOS requires manual "Add to Home Screen" (no auto-prompt), but user instructions need to be extremely clear for non-tech users. **Mitigation:** Create visual step-by-step guide, test with actual elderly caregiver if possible.

4. **Medication schedule complexity** — Research covers scheduled (e.g., "every 4 hours") and PRN (as-needed), but doesn't address tapering doses (e.g., "take 3 pills days 1-3, then 2 pills days 4-7") or conditional timing (e.g., "take with food" or "take 30 mins before exercise"). **Mitigation:** Start with simple scheduled + PRN, add complexity only if doctor prescribes it for this patient.

5. **Caregiver permission granularity** — Architecture research shows patient-controlled data sharing pattern with granular permissions (view_medications, view_activities, etc.), but it's unclear if THIS patient needs to hide anything from caregiver. **Mitigation:** Start with full visibility (simpler), add permission toggles in v2 if patient requests privacy controls.

## Sources

### Primary Sources (HIGH confidence)

**Stack Research:**
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15) — Official performance improvements documentation
- [Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture) — Official technical documentation
- [Supabase Next.js Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs) — Official SSR setup guide (updated Jan 2026)
- [shadcn/ui Tailwind v4 Docs](https://ui.shadcn.com/docs/tailwind-v4) — Official component library documentation
- [React 19 Official Docs](https://react.dev/versions) — Version compatibility verification

**Feature Research:**
- [Usability of Mobile Health Apps for Postoperative Care: Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7709840/) — Study of 33 post-op apps, identified core features (symptom tracking 79%, medication reminders 100%)
- [Mobile Applications for Postoperative Monitoring After Discharge](https://pmc.ncbi.nlm.nih.gov/articles/PMC5224949/) — Clinical perspective on post-op monitoring requirements

**Architecture Research:**
- [Supabase Realtime Architecture | Supabase Docs](https://supabase.com/docs/guides/realtime/architecture) — WebSocket implementation details
- [Building Real-Time Apps with Supabase: Step-by-Step Guide](https://www.supadex.app/blog/building-real-time-apps-with-supabase-a-step-by-step-guide) — Practical patterns
- [Care Coordination Measurement Framework | AHRQ](https://www.ahrq.gov/ncepcr/care/coordination/atlas/chapter3.html) — Clinical care coordination data models

**Pitfall Research:**
- [Alarm fatigue in healthcare: a scoping review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12181921/) — Healthcare notification overload (700+ alerts/day, 72-99% false alarms)
- [Smartphone medication adherence apps: Potential benefits to patients and providers](https://pmc.ncbi.nlm.nih.gov/articles/PMC3919626/) — 30-50% medication non-adherence rates
- [Offline-First Done Right: Sync Patterns for Real-World Mobile Networks](https://developersvoice.com/blog/mobile/offline-first-sync-patterns/) — Sync failure patterns and solutions

### Secondary Sources (MEDIUM confidence)

**Stack Comparisons:**
- [Supabase vs Firebase Official Comparison](https://supabase.com/alternatives/supabase-vs-firebase) — Vendor comparison (take with grain of salt, but technical details accurate)
- [Redux vs Zustand vs Context API in 2026](https://medium.com/@sparklewebhelp/redux-vs-zustand-vs-context-api-in-2026-7f90a2dc3439) — State management trade-offs

**Feature Landscape:**
- [Buddy Healthcare - Digital Post-operative Care](https://www.buddyhealthcare.com/en/digital-post-operative-care) — Commercial platform showing enterprise features
- [The Best Apps for Caregivers: 7 Recommendations](https://www.carescout.com/resources/the-best-apps-for-caregivers-7-tools-to-make-caregiving-easier) — Caregiver-specific needs

**Architecture Patterns:**
- [Healthcare Mobile App Development in 2026: Costs, Trends | Orangesoft](https://orangesoft.co/blog/healthcare-mobile-app-development-guide) — Industry overview
- [Medication Management App Development: Comprehensive Guide](https://orangesoft.co/blog/guide-to-medication-management-app-development) — Common patterns

**Pitfall Documentation:**
- [Common Mistakes in Care Coordination and How to Avoid Them](https://carecoordinations.com/blog/common-mistakes-in-care-coordination-and-how-to-avoid-them) — Industry blog with real-world examples
- [Top 10 UX Mistakes in Healthcare apps and How to fix them](https://medium.com/@ShapesandStrategies/top-10-ux-mistakes-in-healthcare-apps-and-how-to-fix-them-601cd1f1f1ee) — UX practitioner insights

### Tertiary Sources (LOW confidence, needs validation)

- [Post Operation and Surgery App Development Guide](https://topflightapps.com/ideas/post-surgery-app-development/) — Development agency blog (page not fully accessible)
- [How to Build a Healthcare MVP: Time, Costs, and Key Features](https://onix-systems.com/blog/how-to-build-a-healthcare-mvp) — MVP scoping guidance (agency perspective)

---

**Research completed:** 2026-02-16
**Ready for roadmap:** Yes
**Suggested roadmap structure:** 5 phases (Foundation → Medications → Activities → Messaging → PWA)
**Timeline realistic:** Yes (48-72 hours for experienced Next.js developer based on stack research)
**Critical path:** Phase 1 (Foundation) → Phase 2 (Medications) are non-negotiable. Phases 3-5 can be adjusted based on time remaining.
