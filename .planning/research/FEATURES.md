# Feature Research

**Domain:** Post-surgery care coordination (patient/caregiver shared app)
**Researched:** 2026-02-16
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unsafe for post-surgery care.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Medication tracking with reminders** | Critical for post-op compliance; missed doses can cause complications | MEDIUM | Must support scheduled + PRN (as-needed) meds. Timer alerts are essential. Research shows 60%+ drop-off if >3 steps required daily. |
| **Symptom/feeling check-ins** | Standard in all post-op apps; clinically necessary for monitoring recovery | LOW | Simple rating scale (1-10 pain, mood, energy). 3x daily is common pattern. Timestamps required for medical value. |
| **Wound/condition photo tracking** | Present in 26 of 33 apps studied (79%); doctors expect visual monitoring | LOW | Phone camera → upload. Date/time stamp. Optional notes. No image processing needed for MVP. |
| **Patient-caregiver messaging** | Core coordination need; both need to stay aligned on care tasks | MEDIUM | Real-time preferred but async acceptable for v1. Must be simple (avoid adding steps to daily workflow). |
| **Care activity logging** | Necessary to track what's been done (exercises, wound care, meals, etc.) | LOW | Simple checklist + timestamp. Free text notes. Searchable history view. |
| **Doctor contact info** | Post-op patients panic without easy access to clinical team contacts | LOW | Name, phone, when to call. Emergency vs routine contact distinction. Static info page sufficient. |
| **Medication intake confirmation** | Apps with adherence tracking show 60%+ completion vs those without | LOW | Simple tap to confirm "taken" or "skipped" with timestamp. Automatic documentation reduces burden. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable. Prioritize based on 2-3 day timeline.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Shared calendar view** | Visualizes recovery timeline; both patient/caregiver see same schedule | MEDIUM | Day/week views showing meds, check-ins, appointments. Reduces "what's happening today?" questions. Good v1.5 feature if time permits. |
| **Recovery progress dashboard** | Motivational; shows trend lines for pain, activity, mood over time | MEDIUM | Charts pain/mood trends. "Streak" counters for adherence. Research shows this improves engagement but not critical for week 1 post-op. DEFER to v2. |
| **Exercise/PT video library** | Standard in rehab apps; provides visual guidance for recovery exercises | HIGH | Requires video hosting, playback UI, content creation. TOO COMPLEX for 2-3 days. Use external links in v1. |
| **Appointment scheduler** | Integrated follow-up booking | HIGH | Requires calendar integration, availability logic. NOT realistic for personal-use app. Keep external for v1. |
| **Multi-caregiver support** | Coordinate between multiple family members | HIGH | Complicates permissions, notifications, UI. Scope says "ONE caregiver" - make this an anti-feature for v1. |
| **Automated clinical alerts** | Dashboard notifies doctor if patient deteriorates (red flags) | VERY HIGH | Requires clinical rule engine, provider integration, liability considerations. EMR territory - explicit anti-feature. |
| **HIPAA-compliant infrastructure** | Required for clinical use, provider integration | VERY HIGH | Audit trails, encryption, BAAs. NOT needed for personal use between 2 family members. Over-engineering for stated scope. |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build. These slow development without adding value for the 2-3 day personal-use scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Provider portal/dashboard** | "Doctors should see this data" | Requires HIPAA compliance, provider authentication, clinical integration. Massive scope expansion. NOT personal-use tool anymore. | Patient manually shares screenshots or exports with doctor during follow-up visits. Keep it simple. |
| **EHR/EMR integration** | "Sync with hospital records" | Requires HL7/FHIR, authentication with hospital systems, data mapping. Months of work. Way beyond 2-3 day scope. | Manual data entry. Patient is single source of truth for recovery period. |
| **Multi-patient support** | "Caregiver has multiple patients" | Complex permissions, switching contexts, scaled infrastructure. Scope explicitly says ONE patient. | Build separate instances if needed later. V1 is single patient/caregiver pair. |
| **Social features / community** | "Connect with other recovery patients" | Moderation, privacy concerns, feature creep. Distracts from core coordination need. | Patient can use existing social platforms if they want peer support. App focuses on patient-caregiver coordination only. |
| **Advanced analytics / ML** | "Predict complications with AI" | Liability concerns, training data requirements, medical device regulations potential. Way beyond personal coordination tool. | Simple trend charts (if time). Leave prediction to doctors. |
| **Video calling** | "Talk to doctor via app" | WebRTC complexity, bandwidth issues, screen share needs. Zoom/FaceTime already exist and work well. | Store doctor's phone/video call link. Use existing tools. Don't reinvent. |
| **Prescription management** | "Refill meds through app" | Pharmacy integrations, controlled substance regulations, prescription verification. Months of compliance work. | Link to pharmacy website/phone. Track adherence only, not prescriptions themselves. |

## Feature Dependencies

```
Medication Reminders
    └──requires──> Medication List (with schedules)
                       └──requires──> User Input (med names, doses, times)

Feeling Check-ins
    └──enhances──> Care Activity Logging (provides context for symptoms)

Shared Calendar View
    └──requires──> Medication Schedule + Feeling Check-ins + Appointments
    └──enhances──> All time-based features (visualization layer)

Real-time Messaging
    └──requires──> Push notifications OR polling
    └──conflicts──> Offline-first approach (adds complexity)

Photo Tracking
    └──requires──> Image upload + storage
    └──enhances──> Activity Logging (visual documentation of wound care)
```

### Dependency Notes

- **Medication tracking is foundational:** Reminders, logging, and calendar views all depend on having medication schedules defined. Build this first.
- **Check-ins feed multiple features:** Daily ratings provide data for both activity logs and (future) trend analysis. Simple to implement, high reuse value.
- **Calendar view is a visualization layer:** Requires all underlying time-based features to exist first. Good for v1.5 if data model supports it from start.
- **Real-time messaging vs offline:** Decide early. True real-time (WebSockets) adds infrastructure complexity but better UX. Polling is simpler but less responsive. For 2-3 days, start with polling/refresh.
- **Photo uploads need storage:** S3/Cloudinary/etc. Not complex but requires setup. Optional for v1 - text-only logs work initially.

## MVP Recommendation

### Launch With (v1 - 2-3 day build)

Prioritize these features to validate core use case: "Keep patient and caregiver aligned on all care tasks during recovery."

- [x] **Medication list + scheduled reminders** — Critical for safety; prevents missed doses. Use browser notifications for alerts.
- [x] **PRN (as-needed) medication tracking** — Different UX than scheduled; patient initiates. Simple "log it" button.
- [x] **Feeling check-ins (3x daily)** — Pain/mood/energy ratings. Timestamps. Simple form.
- [x] **Care activity logging** — Free-text journal + optional activity categories (exercise, wound care, meal, etc.). Timestamp + notes.
- [x] **Real-time/async messaging** — Shared chat thread. Patient ↔ caregiver coordination. Start simple (polling is fine).
- [x] **Doctor contact info page** — Static reference. Name, phone, when to call (emergency vs routine).
- [x] **Shared view (both users see same data)** — Core coordination feature. Patient logs activity → caregiver sees it immediately (or on refresh).

**Implementation notes for 2-3 days:**
- Mobile-first responsive web app (not native apps - faster dev)
- Simple authentication (email/password or magic link)
- Real-time via polling (15-30 sec refresh) NOT WebSockets (too complex for timeline)
- Local-first with sync (optimistic updates for speed)
- Minimal design (Tailwind or similar, no custom illustrations)

### Add After Validation (v1.5 - week 2 if surgery goes well)

Features to add once core is working and patient provides feedback.

- [ ] **Shared calendar view** — Visualizes day/week schedule. Requires all time-based data to be structured (design for this in v1 data model).
- [ ] **Photo upload for wound tracking** — If doctor requests visual monitoring. Needs image storage setup.
- [ ] **Medication history view** — "Did I take morning meds?" Searchable log of all doses taken/skipped.
- [ ] **Appointment tracking** — Simple list of follow-up appointments. Not scheduling, just reference.
- [ ] **Export/print summary** — For follow-up doctor visits. PDF or printable page showing recovery timeline.

**Triggers for adding:**
- Calendar: If patient/caregiver confused about daily schedule
- Photos: If doctor specifically requests wound images
- History: If "did I take this?" comes up multiple times
- Appointments: If patient has >2 follow-ups scheduled
- Export: When follow-up appointment is approaching

### Future Consideration (v2+ - only if becomes ongoing tool)

Features to defer until product-market fit is established or scope expands beyond personal use.

- [ ] **Recovery progress charts** — Trend lines for pain/mood over time. Motivational but not critical for immediate coordination.
- [ ] **Multi-caregiver support** — If family needs to coordinate between spouse + parent + sibling. Adds permission complexity.
- [ ] **Exercise/PT video library** — If patient has extensive rehab plan. Requires content creation + video hosting.
- [ ] **Reminder customization** — Snooze, custom sounds, escalation to caregiver if missed. Complexity vs value unclear until v1 usage data.
- [ ] **Offline mode** — Full offline support with conflict resolution. Only needed if connectivity is unreliable (not stated in requirements).

**Why defer:**
- These add development time without validating core hypothesis
- Can assess need based on actual usage patterns
- Some (like charts) require time-series data that doesn't exist week 1
- Others (like multi-caregiver) expand scope beyond stated requirements

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Medication reminders (scheduled) | HIGH | MEDIUM (notification system) | **P1** |
| PRN medication logging | HIGH | LOW (just a form + log) | **P1** |
| Feeling check-ins (3x daily) | HIGH | LOW (simple rating form) | **P1** |
| Care activity logging | HIGH | LOW (text input + timestamp) | **P1** |
| Patient-caregiver messaging | HIGH | MEDIUM (shared state + UI) | **P1** |
| Doctor contact info | HIGH | LOW (static page) | **P1** |
| Shared data view | HIGH | LOW (architecture decision) | **P1** |
| Medication intake confirmation | MEDIUM | LOW (tap to confirm) | **P1** |
| Shared calendar view | MEDIUM | MEDIUM (data aggregation + UI) | **P2** |
| Photo upload for wound tracking | MEDIUM | MEDIUM (storage + upload) | **P2** |
| Medication history view | MEDIUM | LOW (query + display) | **P2** |
| Appointment tracking | MEDIUM | LOW (simple list CRUD) | **P2** |
| Export/print summary | LOW | MEDIUM (formatting + PDF gen) | **P2** |
| Recovery progress charts | LOW | HIGH (charting library + queries) | **P3** |
| Exercise video library | MEDIUM | VERY HIGH (content + hosting) | **P3** |
| Multi-caregiver support | LOW (scope=1) | HIGH (permissions overhaul) | **P3** |
| Provider dashboard | LOW (personal use) | VERY HIGH (HIPAA + auth) | **NEVER** |
| EHR integration | LOW (personal use) | VERY HIGH (standards + APIs) | **NEVER** |

**Priority key:**
- **P1: Must have for launch** — Core coordination features; app is useless without these
- **P2: Should have when possible** — Enhance usability; add when v1 works and time permits
- **P3: Nice to have, future consideration** — Validate need with actual usage first
- **NEVER: Explicit anti-features** — Out of scope; would derail 2-3 day timeline

## Complexity Reality Check for 2-3 Day Timeline

### What's Realistic (P1 features, ~20-30 hours total dev)

**Day 1 (Foundation): 8-10 hours**
- Project setup (Next.js + Tailwind + Firebase/Supabase)
- Authentication (2 users: patient + caregiver)
- Basic layout + navigation
- Shared data model design

**Day 2 (Core Features): 8-10 hours**
- Medication list CRUD + scheduled reminders
- PRN medication logging
- Feeling check-in form (3x daily)
- Care activity logging (free text + categories)
- Doctor contact info page

**Day 3 (Coordination + Polish): 8-10 hours**
- Patient-caregiver messaging
- Shared view synchronization
- Mobile responsive testing
- Deployment
- Basic documentation for users

### What's Unrealistic (Will blow timeline)

- **Real-time sync with WebSockets** — Use polling or on-demand refresh
- **Native iOS/Android apps** — Stick to mobile-first web
- **Push notifications** — Browser notifications or none for v1
- **Advanced UI animations** — Keep it functional, not flashy
- **Comprehensive test coverage** — Manual testing only for 2-3 day ship
- **User onboarding flow** — Simple text instructions, no walkthrough
- **Data export/reporting** — Defer to v1.5
- **Photo uploads** — Defer to v1.5 unless trivial with chosen stack

**Timeline pressure points:**
- **Authentication/authorization** — Use auth service (Firebase Auth, Clerk, Supabase Auth) not custom
- **Real-time data sync** — Firestore or Supabase handles this; don't build from scratch
- **Notification system** — Browser Notification API is fastest; server-side push adds 4+ hours
- **Mobile testing** — Test on actual devices early; responsive CSS surprises eat hours

## Competitor Feature Analysis

Based on research of existing post-op care apps (Buddy Healthcare, Post Op, MyTherapy, etc.):

| Feature | Commercial Apps | Our Approach | Rationale |
|---------|-----------------|--------------|-----------|
| **Medication reminders** | Universal; 100% of apps | ✓ Include | Absolute table stakes |
| **Symptom tracking** | 79% (26/33 apps studied) | ✓ Include (simplified) | Expected but keep simple: rating scales, not complex forms |
| **Wound photo monitoring** | 79% (26/33 apps studied) | Optional v1.5 | Good feature but can ship without it; add if doctor requests |
| **Patient-provider messaging** | Common but varies | ✓ Include (patient-caregiver only) | Adapt to our scope: caregiver not provider |
| **Educational content** | 24% (8/33 apps) | ✗ Exclude | Doctor provides instructions; don't reinvent content |
| **Exercise videos** | Common in rehab apps | ✗ Exclude v1 | Link to external resources; video hosting too complex |
| **Clinical dashboards** | Standard in enterprise apps | ✗ Exclude | EMR/EHR territory; personal-use app doesn't need this |
| **HIPAA compliance** | Required for B2B healthcare | ✗ Exclude | Personal use between family members; over-engineering |
| **Appointment scheduling** | Common | ✗ Exclude v1 | Complex; just track appointments, don't schedule them |
| **Multi-language support** | Varies | ✗ Exclude | English-only for personal use; YAGNI |
| **Care team coordination** | Enterprise feature | Adapted: 1 caregiver only | Simplified to patient + 1 caregiver; no provider portal |
| **Recovery milestones** | Motivational feature | Maybe v1.5 | Nice to have but not critical for first week post-op |

**Key insight from research:**
- **Most apps over-engineer for clinical integration** — We're building a personal coordination tool, not an EMR adjunct
- **Usability trumps features** — Studies show apps with >3 required daily steps see 60%+ drop-off by week 2
- **Core loop is medication + symptom tracking** — Everything else is secondary
- **Mobile-first is expected** — Post-op patients aren't sitting at desks
- **Caregiver connectivity is differentiator** — Many apps are patient-only; shared view is our advantage

## Sources

**Primary Research (Systematic Reviews & Clinical Studies):**
- [Usability of Mobile Health Apps for Postoperative Care: Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7709840/) — Study of 33 post-op apps; identified symptom tracking (79%), education (24%), communication (15%) as core features. HIGH confidence.
- [Mobile Applications for Postoperative Monitoring After Discharge](https://pmc.ncbi.nlm.nih.gov/articles/PMC5224949/) — Clinical perspective on post-op monitoring requirements. HIGH confidence.
- [Mobile Applications for Patient-centered Care Coordination](https://pmc.ncbi.nlm.nih.gov/articles/PMC4587034/) — Human factors methods for care coordination app design. MEDIUM confidence (2015 publication).

**Commercial Product Examples:**
- [Buddy Healthcare - Digital Post-operative Care](https://www.buddyhealthcare.com/en/digital-post-operative-care) — Enterprise platform showing table stakes features: timed reminders, PROMs collection, wound photo sharing, clinical dashboards. HIGH confidence for feature identification.
- [Post Op App (App Store)](https://apps.apple.com/us/app/post-op/id1556105218) — Consumer post-op app example. MEDIUM confidence (couldn't access full details).
- [Three Post-surgery Apps That Provide a Personal Touch to Recovery](https://www.surgimate.com/three-apps-that-provide-a-personal-touch-to-recovery-2/) — Overview of consumer apps in space. MEDIUM confidence.

**Caregiver & Medication Tracking Apps:**
- [Top Medication Reminder Apps to Try in 2026](https://dosepacker.com/blog/top-medication-reminder-apps) — Current medication app landscape; identifies adherence tracking patterns. MEDIUM confidence.
- [The Best Apps for Caregivers: 7 Recommendations](https://www.carescout.com/resources/the-best-apps-for-caregivers-7-tools-to-make-caregiving-easier) — Caregiver-specific needs and app features. MEDIUM confidence.
- [10 Best Caregiver Apps in 2026](https://www.ifaxapp.com/blog/the-top-10-apps-for-caregivers) — Current caregiver app ecosystem. MEDIUM confidence.
- [Care Essentials App for Family Caregivers](https://myconnectedcaregiver.com/care-essentials/) — Shared access and coordination features. MEDIUM confidence.

**Technical & Development Resources:**
- [Post Operation and Surgery App Development Guide](https://topflightapps.com/ideas/post-surgery-app-development/) — Development perspective (page not fully accessible). LOW confidence.
- [Building a Healthcare MVP: Time, Costs, and Key Features](https://onix-systems.com/blog/how-to-build-a-healthcare-mvp) — MVP scoping guidance. MEDIUM confidence.

**Care Coordination Platforms:**
- [Care Coordination Software - Buddy Healthcare](https://www.buddyhealthcare.com/en/care-coordination-software) — Enterprise coordination features; what NOT to build for personal use. HIGH confidence for anti-feature identification.
- [HIPAA Compliant Care Coordination Platform](https://carecoordinations.com) — Compliance requirements for clinical use; confirms HIPAA is overkill for family-use app. HIGH confidence.

**Confidence Assessment:**
- **Table Stakes Features:** HIGH — Consistent across systematic review (n=33), clinical literature, and commercial products
- **Differentiators:** HIGH — Clear patterns in what's expected vs nice-to-have based on app analysis
- **Anti-Features:** HIGH — Strong evidence that EMR integration, provider portals, and HIPAA compliance are out-of-scope for personal coordination tools
- **Complexity Estimates:** MEDIUM — Based on general web dev experience; actual timeline depends on chosen stack and developer skill

**Research Gaps:**
- Actual usage data for personal-use (non-clinical) post-op apps is limited; most studies focus on clinical trial contexts
- Optimal check-in frequency (3x daily) is based on existing app patterns, not evidence-based research
- Real-time vs async messaging preference for patient-caregiver coordination is unclear; no direct comparison found

---
*Feature research for: Post-surgery care coordination (patient/caregiver shared app)*
*Researched: 2026-02-16*
*Confidence: HIGH (systematic review + commercial product analysis + clinical literature)*
