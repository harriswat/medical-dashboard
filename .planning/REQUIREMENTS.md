# Requirements

**Project:** Post-Surgery Care Coordination Dashboard
**Timeline:** Ship by Wednesday morning (48-72 hours)
**Core Value:** Patient and caregiver stay coordinated on medications, symptoms, and care activities through real-time sync

---

## v1 Requirements (Ship by Wednesday)

These are the minimum viable features needed for post-surgery care. Based on research, these represent "table stakes" present in 79-100% of successful post-op apps.

### Role Selection & Persistence
**REQ-AUTH-01**: User can select role (Patient or Caregiver) on first visit
**REQ-AUTH-02**: Role selection persists across sessions via localStorage
**REQ-AUTH-03**: User can switch roles if needed (simple dropdown, no password)

**Rationale:** Research shows complex auth is a timeline killer. Two users, one household = localStorage is sufficient. Defer Supabase Auth to v2.

---

### Medication Tracking (CORE VALUE)
**REQ-MED-01**: Add medication with name, dosage, and schedule (e.g., "Every 4 hours: 8am, 12pm, 4pm, 8pm")
**REQ-MED-02**: Support PRN (as-needed) medications without fixed schedule
**REQ-MED-03**: Mark medication as "Taken" or "Skipped" with timestamp
**REQ-MED-04**: View today's medication schedule with large checkboxes (44x44pt minimum)
**REQ-MED-05**: Use plain language labels ("Take 2 white pain pills with food" not "Oxycodone 5mg PO BID")
**REQ-MED-06**: Real-time sync: patient logs med → caregiver sees update within 1 second
**REQ-MED-07**: View medication history (searchable log of all doses taken/skipped)

**Rationale:** Medication adherence is make-or-break. Research shows 30-50% non-adherence due to forgetfulness and poor UX. This is the feature that determines app success.

**Addresses Pitfall #3:** Medication tracking UX causing missed doses

---

### Feeling Check-ins
**REQ-FEEL-01**: Log feeling check-in 3x daily (morning/afternoon/evening)
**REQ-FEEL-02**: Rate pain, mood, and energy on 1-10 scale
**REQ-FEEL-03**: Add optional text notes to check-in
**REQ-FEEL-04**: View feeling history timeline
**REQ-FEEL-05**: Real-time sync: patient logs feeling → caregiver sees instantly

**Rationale:** Symptom tracking present in 79% of apps studied. Provides clinical value (monitoring recovery) and caregiver peace of mind.

---

### Care Activity Logging
**REQ-CARE-01**: Log care activity with timestamp (e.g., "Changed wound dressing")
**REQ-CARE-02**: Support optional categories (wound care, exercise, meal, other)
**REQ-CARE-03**: Add text notes to activity
**REQ-CARE-04**: View activity timeline (patient and caregiver see same timeline)
**REQ-CARE-05**: Real-time sync for activity updates

**Rationale:** Care coordination essential for multi-person recovery management. Simple logging sufficient for v1.

---

### Doctor Contact Info
**REQ-DOC-01**: Store doctor name, phone number, and when to call (emergency vs routine)
**REQ-DOC-02**: Display contact info prominently (one tap from home)
**REQ-DOC-03**: Support multiple contacts (surgeon, primary care, emergency)

**Rationale:** Post-op patients panic without easy access to clinical team. Static reference page = 30 minutes of work.

---

### Real-Time Sync & Offline Support
**REQ-SYNC-01**: All data changes sync between patient and caregiver within 1 second
**REQ-SYNC-02**: Offline-first: user actions apply immediately to local state, queue for sync
**REQ-SYNC-03**: Show explicit sync status indicator ("Syncing..." / "Synced" / "Offline")
**REQ-SYNC-04**: Handle conflicts when both users edit same record (last-write-wins for v1)
**REQ-SYNC-05**: Queue failed operations and retry on reconnection

**Rationale:** Research shows 68% of health apps experience weekly sync issues. Silent failures are most dangerous—user believes data was saved when it wasn't.

**Addresses Pitfall #1:** Real-time sync failures leading to data loss

---

### Mobile-First Design
**REQ-MOBILE-01**: Minimum tap target size: 44x44pt (iOS HIG compliance)
**REQ-MOBILE-02**: Font size 16px minimum for inputs (prevents iOS zoom)
**REQ-MOBILE-03**: Test on actual iPhone (not just browser DevTools)
**REQ-MOBILE-04**: Thumb-zone design: important actions in bottom 2/3 of screen
**REQ-MOBILE-05**: High contrast ratios (4.5:1 minimum for text)
**REQ-MOBILE-06**: Works offline (app shell cached via service worker)

**Rationale:** 80% of users abandon apps with poor mobile UX. Desktop testing doesn't catch mobile-specific issues.

**Addresses Pitfall #6:** Mobile-first design that isn't actually mobile-first

---

## v2 Requirements (Post-Launch)

These features add value but aren't critical for initial recovery period. Defer to after Wednesday if timeline is tight.

### Messaging
**REQ-MSG-01**: Real-time/async messaging between patient and caregiver
**REQ-MSG-02**: Shared chat thread with timestamps
**REQ-MSG-03**: Message history searchable

**Rationale:** Nice-to-have coordination tool, but patient/caregiver can use text/iMessage instead for v1.

---

### Notifications
**REQ-NOTIF-01**: Browser notifications for medication reminders (patient only)
**REQ-NOTIF-02**: Three-tier priority: CRITICAL (missed meds), IMPORTANT (upcoming), INFO (updates)
**REQ-NOTIF-03**: Quiet hours (no alerts midnight-6am unless critical)
**REQ-NOTIF-04**: Smart grouping ("3 new care notes" not 3 separate alerts)

**Rationale:** Helpful for adherence but requires notification permission setup. Can use phone alarms for v1.

**Addresses Pitfall #4:** Notification overload causing alert fatigue

---

### Calendar View
**REQ-CAL-01**: Weekly calendar view showing medications + check-ins + activities
**REQ-CAL-02**: Day/week toggle
**REQ-CAL-03**: Color-coded by type (meds = blue, check-ins = green, activities = yellow)

**Rationale:** Visualizes recovery timeline. Competitive feature but not essential for function.

---

### Photo Uploads
**REQ-PHOTO-01**: Upload wound photos to activity log
**REQ-PHOTO-02**: Image compression for mobile upload
**REQ-PHOTO-03**: Thumbnail view in timeline

**Rationale:** Present in 79% of apps, doctors expect visual monitoring. Optional for v1—text logs work initially.

---

### PWA Installation
**REQ-PWA-01**: PWA manifest and service worker (via next-pwa)
**REQ-PWA-02**: App icons (192x192, 512x512)
**REQ-PWA-03**: "Add to Home Screen" instructions for iOS
**REQ-PWA-04**: Safe area handling for iPhone notch/Dynamic Island

**Rationale:** Home screen access improves engagement but web app works without installation.

---

## Out of Scope (Explicitly NOT Building)

These features would violate timeline or complexity constraints. Document to prevent scope creep.

### Authentication & Multi-Tenant
**ANTI-REQ-01**: ❌ Email/password authentication
**ANTI-REQ-02**: ❌ Multi-patient support
**ANTI-REQ-03**: ❌ Multi-caregiver support (>1 caregiver per patient)
**ANTI-REQ-04**: ❌ Account recovery flows

**Rationale:** Single patient + single caregiver = localStorage sufficient. Complex auth adds 4-8 hours.

---

### Clinical Integration
**ANTI-REQ-05**: ❌ EMR/EHR integration (HL7/FHIR)
**ANTI-REQ-06**: ❌ Provider portal/dashboard
**ANTI-REQ-07**: ❌ Pharmacy integration
**ANTI-REQ-08**: ❌ Prescription management (controlled substances)

**Rationale:** Requires HIPAA compliance infrastructure, months of work. Patient manually shares data with doctor.

**Addresses Pitfall #5:** HIPAA non-compliance due to "just 2 users" assumption (we're accepting personal-use only)

---

### Advanced Features
**ANTI-REQ-09**: ❌ Recovery progress charts (trend lines over time)
**ANTI-REQ-10**: ❌ Exercise/PT video library
**ANTI-REQ-11**: ❌ Export to PDF/CSV
**ANTI-REQ-12**: ❌ Video calling
**ANTI-REQ-13**: ❌ Appointment scheduling
**ANTI-REQ-14**: ❌ Insurance claim tracking

**Rationale:** All require significant development time (2+ hours each). Focus on core value: medication adherence + care coordination.

**Addresses Pitfall #2:** Over-engineering and missing tight deadline

---

## Requirement Prioritization

**If timeline is tight, build in this order:**
1. **Phase 1 (Foundation)**: REQ-SYNC-01 to REQ-SYNC-05, REQ-MOBILE-01 to REQ-MOBILE-06 → Establishes architecture patterns
2. **Phase 2 (Medications)**: REQ-MED-01 to REQ-MED-07 → Core value, non-negotiable
3. **Phase 3 (Activities)**: REQ-FEEL-01 to REQ-FEEL-05, REQ-CARE-01 to REQ-CARE-05, REQ-DOC-01 to REQ-DOC-03 → Clinical monitoring
4. **Phase 4 (Messaging)**: REQ-MSG-01 to REQ-MSG-03, REQ-NOTIF-01 to REQ-NOTIF-04 → Nice-to-have coordination
5. **Phase 5 (PWA)**: REQ-PWA-01 to REQ-PWA-04 → Polish layer

**Critical path:** Phases 1-2 are non-negotiable. Phase 3 is highly desirable. Phases 4-5 can be adjusted based on time remaining.

---

## Success Criteria

**Minimum viable dashboard (ready for Wednesday):**
- ✅ Patient can log medications and mark as taken
- ✅ Caregiver sees medication updates in real-time
- ✅ Patient can log feeling check-ins 3x daily
- ✅ Both can log care activities
- ✅ Doctor contact info accessible
- ✅ Works on iPhone (mobile-optimized)
- ✅ Offline-first (queues changes, syncs when connected)

**Definition of done:**
- Deployed to production URL (Vercel)
- Tested on actual iPhone
- Supabase database configured with RLS policies
- Both patient and caregiver can use app simultaneously

---

*Last updated: 2026-02-16*
*Source: Research findings from SUMMARY.md, active requirements from PROJECT.md*
