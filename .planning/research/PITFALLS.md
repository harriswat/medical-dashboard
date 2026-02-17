# Pitfalls Research

**Domain:** Post-Surgery Care Coordination (Patient/Caregiver Mobile App)
**Researched:** 2026-02-16
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Real-Time Sync Failures Leading to Data Loss

**What goes wrong:**
Changes made by one user (patient or caregiver) fail to sync or are overwritten when both users make updates simultaneously. A 2023 University of Michigan audit found 68% of health app users experienced sync issues at least weekly, with silent failures being the most dangerous—users believe data was saved when it wasn't.

**Why it happens:**
- Mobile apps rely on unstable network conditions (cellular, WiFi switching)
- Poor offline-first architecture treats local storage as temporary cache instead of source of truth
- Lack of conflict resolution strategy causes "last write wins" to silently overwrite critical updates
- Apps can only sync while in foreground on iOS, creating gaps when user switches apps
- Multi-user scenarios (patient + caregiver) multiply conflict probability

**Consequences:**
- **Medical risk**: Missed medication doses not recorded, dangerous for post-surgery compliance
- **Trust erosion**: Users lose confidence after discovering "saved" data disappeared
- **Data inconsistency**: Patient sees different medication log than caregiver
- **Unrecoverable loss**: Health data syncs via iCloud but has no backup/snapshot mechanism

**Prevention:**
1. **Offline-first architecture**: Local database is canonical source of truth, not server
2. **Timestamp everything**: Track client-side creation time AND server receipt time
3. **Idempotent operations**: Backend must handle duplicate submissions from retries
4. **Conflict UI**: When conflicts occur, show both versions and let user resolve (don't auto-overwrite)
5. **Sync status indicator**: Always visible—"Last synced 2 mins ago" or "Syncing now" or "Offline—will sync when online"
6. **Queue monitoring**: Display pending changes count, warn if queue grows too large

**Detection:**
- Monitor sync queue depth—alert if >50 pending operations
- Track sync failure rate—>5% indicates infrastructure problems
- Watch for "version mismatch" errors in logs
- User reports of "my data disappeared" or "changes not showing up"

**Phase to address:**
Phase 01 (Data Architecture) - Non-negotiable foundation. Cannot be retrofitted after launch.

---

### Pitfall 2: Over-Engineering and Missing Tight Deadline

**What goes wrong:**
42% of healthcare startups fail because they build overly complex solutions instead of validating basic assumptions first. Teams add "nice-to-have" features, perfect authentication systems, or implement elaborate data models, burning through their 2-3 day timeline without shipping anything usable.

**Why it happens:**
- Healthcare context creates pressure to "get everything right"
- Developers imagine edge cases that won't occur in first week of use
- Desire for "production-ready" systems instead of "surgery-ready" MVP
- Confusion between "medical context requires care" and "requires every possible feature"
- Underestimating how long regulatory compliance (even basic HIPAA) adds

**Consequences:**
- **Mission failure**: Surgery is Wednesday—miss deadline = patient has no coordination tool
- **Wasted effort**: Sophisticated features built that aren't used during recovery period
- **Quality suffers**: Rushed last-minute integration creates bugs in core workflows
- **Technical debt anyway**: Hurried compromises at 11th hour worse than planned simplicity

**Prevention:**
1. **Ruthless scope cut**: Only medication tracking, care task lists, and basic notes for MVP
2. **Defer authentication**: If just 2 users for 1 week, shared PIN code is sufficient (add OAuth later)
3. **Skip fancy UI**: Functional mobile forms beat polished design when deadline is 48 hours
4. **No integrations**: Don't connect to EHR, pharmacy APIs, or external services in v1
5. **Manual > Automated**: Let users manually mark tasks complete vs. building smart detection
6. **Time-box decisions**: If design discussion exceeds 15 mins, pick simpler option and move on

**Warning signs:**
- Discussing "what if we have 1000 users?" when you have 2
- More than 10 database tables in initial schema
- Any sentence containing "we should probably also..."
- Building user roles/permissions system for 2 known users
- Spending >4 hours on visual design before core workflows work

**Phase to address:**
Phase 00 (Planning) - Define explicit out-of-scope items. Review every 12 hours: "Are we shipping on time?"

---

### Pitfall 3: Medication Tracking UX That Causes Missed Doses

**What goes wrong:**
WHO reports 30-50% of patients fail to follow prescribed medication schedules, primarily due to forgetfulness. Even with reminder apps, users miss doses because reminders are easy to dismiss without action, interfaces are too complex (especially for post-surgery cognitive fog), and tracking compliance is buried in menus. Static reminders without interaction = ignored reminders.

**Why it happens:**
- Dismissing notification ≠ taking medication, but apps treat it the same
- Too many taps required: unlock phone → open app → find medication → mark taken
- Medical jargon ("Take BID" instead of "Take twice daily: 8am, 8pm")
- No visual differentiation between "taken" and "missed" doses in history
- Reminders lack context: "Take Medication" vs. "Take 2 Norco tablets with food"
- Elderly users overwhelmed by complex interfaces

**Consequences:**
- **Medical risk**: Post-surgery pain medication schedule disrupted → poor recovery outcomes
- **Caregiver anxiety**: No confidence whether patient actually took meds or just dismissed alert
- **Data useless**: Medication log doesn't reflect reality, can't share with doctor
- **App abandonment**: 80% of users abandon healthcare apps with poor UX

**Prevention:**
1. **Confirm-or-snooze only**: Notification cannot be dismissed—only "Taken" or "Remind me in 10 min"
2. **Home screen widget**: See today's medication schedule without opening app
3. **Action from notification**: Mark taken directly from notification (iOS interactive notifications)
4. **Visual clarity**: Today's meds shown as large checkboxes/buttons, not buried in calendar
5. **Plain language**: "Take 2 white pain pills with food" not "Oxycodone 5mg PO BID with meals"
6. **Caregiver visibility**: Both users see same timeline—caregiver knows if patient missed dose
7. **Smart defaults**: Auto-populate common post-surgery med schedules (every 4 hours, with meals, etc.)

**Warning signs:**
- More than 2 taps to mark medication taken
- No way to mark medication taken from lock screen/notification
- Medication list requires scrolling on mobile screen
- Using medical abbreviations (QID, PRN, PO) without translation
- History view shows flat list instead of visual timeline

**Phase to address:**
Phase 02 (Medication Tracking) - This IS the core feature. If this fails, app has no value.

---

### Pitfall 4: Notification Overload Causing Alert Fatigue

**What goes wrong:**
Healthcare research shows patients and caregivers can be exposed to 700+ notifications per day, with 72-99% being false alarms or non-actionable. Users become desensitized, miss critical alerts, or disable all notifications. Notification fatigue leads to delayed responses, increased stress, and exactly the opposite of the app's purpose—worse coordination, not better.

**Why it happens:**
- Every feature sends notifications: new tasks, medication reminders, care notes, sync updates
- No priority system—"Wound dressing changed" has same urgency as "MISSED PAIN MEDICATION"
- Notifications sent to both patient and caregiver for every action
- Repetitive reminders without escalation strategy
- App doesn't respect user's sleep schedule or quiet hours

**Consequences:**
- **Critical misses**: User ignores "TAKE MEDICATION NOW" because they're numb to constant alerts
- **Relationship strain**: Caregiver frustrated by phone buzzing every 15 minutes
- **Disabled notifications**: Users turn off all notifications, defeating the app's purpose
- **Cognitive overload**: Post-surgery patient already dealing with pain/medication fog, can't process alert storm

**Prevention:**
1. **Three-tier priority**:
   - **CRITICAL** (sound + banner): Missed medication by >1 hour, abnormal vitals
   - **IMPORTANT** (banner only): Upcoming medication in 15 min, new task assigned
   - **INFO** (badge only): Task completed, note added, non-urgent updates
2. **Smart grouping**: "3 new care notes" instead of 3 separate notifications
3. **Quiet hours**: Auto-detect sleep schedule, hold non-critical alerts until morning
4. **User choice**: Each notification type has toggle—let users customize what they receive
5. **Escalation path**: Missed med reminder: silent → gentle → louder → call caregiver
6. **Targeted delivery**: Medication reminders only to patient, completion confirmations only to caregiver

**Warning signs:**
- More than 5 notifications per hour during normal (non-medication) periods
- No way to disable notification types individually
- Same alert sound/style for all notification priorities
- Notifications sent during midnight-6am period
- Both users get identical notifications for same event

**Phase to address:**
Phase 03 (Notifications) - Build notification system after core features, not during. Easy to add, hard to remove.

---

### Pitfall 5: HIPAA Non-Compliance Due to "Just 2 Users" Assumption

**What goes wrong:**
Teams assume "since it's just a personal app for 2 family members, HIPAA doesn't apply" and skip data protection. They collect unnecessary PHI (social security numbers, insurance info), transmit data unencrypted, store passwords in plain text, or use consumer cloud services without BAAs. Small healthcare practices received 55% of HIPAA fines in recent years, and 725 major breaches occurred in 2024 affecting 275M+ records.

**Why it happens:**
- Misunderstanding HIPAA scope: "We're not a hospital so we're exempt"
- Retrofit mentality: "We'll add encryption after MVP works"
- Data collection creep: Asking for info "in case we need it later"
- Using consumer tools (Firebase, standard Supabase) without healthcare configurations
- Assuming "it's just 2 users" means privacy doesn't matter

**Consequences:**
- **Legal liability**: HIPAA violations carry $100-$50,000 per violation fines
- **Breach exposure**: Unencrypted data leaked if phone stolen or iCloud compromised
- **Expansion blocked**: Can't add features (doctor sharing, caregiver network) later without complete rebuild
- **Reputation damage**: News of breach destroys trust, prevents adoption by other patients

**Prevention:**
1. **Collect minimum PHI**: Name + medication names only, NO SSN, DOB, insurance, address
2. **Encrypt at rest**: Use device-level encryption (iOS Keychain, Android KeyStore) for local data
3. **Encrypt in transit**: HTTPS/TLS 1.3 for all API calls, no exceptions
4. **BAA with vendors**: If using Supabase/backend, require Business Associate Agreement
5. **Auth tokens, not passwords**: If adding login, use secure token storage, never save passwords
6. **Access logging**: Record who accessed what data and when (audit trail requirement)
7. **Auto-logout**: Session expires after 15 minutes of inactivity

**Warning signs:**
- Asking users to enter insurance ID, SSN, or full medical history
- Backend database columns for "future features" not needed now
- HTTP (not HTTPS) anywhere in the stack
- Console.log() statements printing medication names or user data
- Sharing data with analytics services (Mixpanel, Amplitude) without anonymization
- Backend hosted in non-compliant cloud region

**Phase to address:**
Phase 01 (Data Architecture) - Must be foundational. Retrofitting encryption is expensive and often incomplete.

---

### Pitfall 6: Mobile-First Design That Isn't Actually Mobile-First

**What goes wrong:**
Apps are designed on desktop/laptop screens then "made responsive." Result: tiny tap targets, excessive scrolling, forms requiring keyboard open/closed cycles, and workflows requiring precision taps that fail when user has trembling hands post-surgery or is medicated. 80% of healthcare app users abandon apps with poor UX, and elderly users are especially vulnerable to complex interfaces.

**Why it happens:**
- Developers build in desktop browser, test on laptop, then "make it responsive"
- Designing for "all screen sizes" instead of "phone first, phone only if needed"
- Desktop patterns ported to mobile (hover states, right-click menus, keyboard shortcuts)
- Underestimating physical constraints: shaky hands, pain medication fog, older users

**Consequences:**
- **Critical actions fail**: User trying to mark medication taken hits wrong button, marks wrong med
- **Frustration abandonment**: Post-surgery patient in pain can't figure out confusing navigation
- **Accessibility barriers**: Elderly caregiver can't see small text, can't tap small buttons
- **Actual safety risk**: User gives up on app, coordination breaks down, medications missed

**Prevention:**
1. **Test on actual phones**: Oldest iPhone you support, not simulator or Chrome responsive mode
2. **Thumb-zone design**: Most important actions in bottom 2/3 of screen (reachable one-handed)
3. **Large tap targets**: Minimum 44x44pt (iOS) / 48x48dp (Android), more for critical actions
4. **Reduce cognitive load**: One primary action per screen, clear visual hierarchy
5. **Minimize typing**: Pre-populated lists, checkboxes, toggles instead of free-form text entry
6. **High contrast**: Black text on white, 4.5:1 ratio minimum (WCAG AA), test in sunlight
7. **Works offline-first**: No "loading" spinners that never resolve, no "connection required" errors

**Warning signs:**
- Tap targets smaller than 40x40px
- Important buttons at top of screen (requires reaching)
- Navigation requires swiping or multiple taps to reach common features
- Forms with >3 input fields on one screen
- Using system font size <16px for body text
- Dropdown selects with >15 options (use searchable list instead)
- Any horizontal scrolling required

**Phase to address:**
Phase 02 & 03 (Core Features) - Validate on real devices during development, not after "it works."

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Shared account (no individual login) | Ship in 1 day instead of 3 | Can't add 3rd user, can't track who did what, blocks scaling | **Acceptable for 2-3 day MVP** targeting 1 patient + 1 caregiver for 1 week recovery |
| Hard-coded medication schedules | No complex scheduling engine | Can't handle "every other day" or "take as needed" | **Never** - medication schedules are core complexity |
| Local-only storage (no backend) | No server costs, no sync complexity | Single-device only, data lost if phone breaks | **Never** - patient and caregiver need separate devices |
| Static reminder times (no snooze) | Simple notification system | Users miss meds because can't delay 10 mins | **Never** - inflexibility = missed doses |
| Storing PHI in UserDefaults/SharedPreferences | Easy key-value storage | Unencrypted data visible to other apps | **Never** - HIPAA violation risk |
| Embedding med instructions in code | Fast to implement common post-surgery meds | Hard to modify, requires app update to fix | **Acceptable for MVP** if limited to 5-10 common meds |
| Manual testing only | Ship faster | Regressions break critical flows | **Acceptable for 2-3 day deadline** but add automated tests for Phase 2 |
| No error logging/monitoring | Simpler architecture | Can't debug user-reported issues | **Never** - at minimum, use Sentry/Crashlytics free tier |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Real-time database (Firebase, Supabase) | Assuming updates are instant—they can lag 2-30 seconds on poor connections | Show optimistic updates locally, display "syncing..." indicator, handle conflict resolution |
| Push notifications (FCM, APNS) | Not handling token expiration or permission revocation | Check notification permission on app open, refresh tokens, provide fallback (in-app polling) |
| iCloud/Cloud backup | Assuming sync is automatic and reliable | iCloud health data has NO backup mechanism—warn users, provide export feature |
| Analytics (Mixpanel, Amplitude) | Sending PHI to analytics services | Strip all PHI before sending events, use anonymous user IDs, get BAA from vendor |
| Backend APIs | Not handling timeouts, retries cause duplicate actions | Set 10-second timeout, implement idempotency keys, use exponential backoff with jitter |
| Third-party auth (OAuth) | Complex implementation for MVP timeline | Acceptable to use shared PIN for 2-user MVP, add OAuth in Phase 2 after validating product |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading full medication history on app launch | App freezes for 3-5 seconds on cold start | Paginate history, show current day immediately, lazy-load past records | >30 days of medication records (~100+ entries) |
| Syncing all changes in single transaction | Sync fails if any single record has conflict | Batch sync with per-record success/failure, retry failed records separately | >50 pending changes in offline queue |
| Polling for updates every second | Battery drain, increased server costs | Use real-time subscriptions (Supabase realtime) or increase polling to 30-second intervals | Continuous usage >30 minutes |
| Storing photos in database | Database bloat, slow queries | Store photos in file system/object storage, reference by URL in database | >10 photos (wound progress pics, medication bottles) |
| Unoptimized queries fetching all user data | Slow queries as data grows | Add indexes on user_id, created_at columns, use LIMIT clauses | >1000 total records across all users |
| No pagination in task/note lists | UI becomes sluggish with long lists | Implement virtual scrolling or pagination after 50 items | >100 tasks or notes |

**NOTE:** For 2-3 day MVP serving 2 users for 1 week, performance traps are **low priority**. Focus on shipping. Optimize in Phase 2 if expanding beyond MVP scope.

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Displaying medication names in push notifications | PHI visible on lock screen if phone left unattended | Use generic notification text: "Medication reminder" not "Take Oxycodone" |
| Logging user data to console/crash reports | PHI leaked to third-party services or logs | Redact all PHI before logging, never log medication names, only log IDs |
| No session timeout | Caregiver leaves app open, patient modifies their tasks | Auto-lock after 15 minutes inactivity, require PIN/biometric to unlock |
| Shared device mode without user switching | Patient sees caregiver's private notes, or vice versa | Clear separation: patient view vs. caregiver view, toggle at top level |
| Unencrypted local database | Phone theft = all medical data exposed | Use encrypted local storage (iOS Keychain, Android EncryptedSharedPreferences) |
| Storing API keys in app code | Keys extracted via reverse engineering, API abuse | Use environment variables, backend proxy for sensitive operations |
| No rate limiting on backend | Attacker spam creates fake medication records | Implement rate limiting: max 10 API calls per minute per user |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account creation before seeing app | Friction prevents trial, user gives up | Show demo/preview mode, allow exploration, ask for account only when saving data |
| Using medical jargon without translation | "Take BID PO PRN" confuses patient/caregiver | Plain language: "Take twice daily by mouth as needed" with jargon in small text |
| No undo/edit functionality | Accidental tap marks wrong medication taken, panic | Allow editing for 5 minutes after action, with audit trail showing original + edited |
| Hidden navigation | User can't find medication list because it's in hamburger menu 3 levels deep | Bottom tab bar with 3-4 top-level sections: Medications, Tasks, Notes |
| Progress invisible | User doesn't know if their action saved | Immediate visual feedback: checkmark animation, "Saved" toast message |
| No empty states | First-time user sees blank screen with no guidance | Show helpful onboarding: "Add your first medication" with example/template |
| Confirmation dialogs for every action | "Are you sure?" fatigue, user blindly taps Yes | Only confirm destructive actions (delete), make other actions easily undoable |
| Form validation errors at submit | User fills 10 fields, submits, sees "Name required" | Validate inline as user types, show error immediately when field loses focus |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Medication tracking:** Often missing snooze functionality — verify user can delay reminder by 10/30/60 minutes
- [ ] **Real-time sync:** Often missing conflict resolution — verify what happens when both users edit same record simultaneously
- [ ] **Offline mode:** Often missing queue size limits — verify app doesn't crash with 500 pending changes
- [ ] **Notifications:** Often missing quiet hours — verify no alerts between 10pm-6am unless critical
- [ ] **Medication history:** Often missing timezone handling — verify timestamps show correctly if user travels across timezones
- [ ] **Task completion:** Often missing who/when metadata — verify caregiver can see "Marked done by Patient at 2:30pm"
- [ ] **Error states:** Often missing retry/recovery options — verify "Sync failed" shows actionable solution, not just error message
- [ ] **Data export:** Often missing entirely — verify user can export medication log to PDF/CSV for doctor visit
- [ ] **Biometric auth:** Often missing fallback — verify PIN entry works if Face ID fails
- [ ] **Push permission denied:** Often missing fallback — verify in-app polling works if user denies notification permission
- [ ] **Loading states:** Often missing timeout handling — verify spinner doesn't run forever if network hangs
- [ ] **Large text mode:** Often breaks layout — verify accessibility text sizing doesn't cause text truncation

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sync conflict data loss | MEDIUM | Add version history, show "Data conflict detected" UI with both versions, let user pick or merge. Requires backend schema changes. |
| Over-engineered past deadline | HIGH | Cut entire features, not partial features. Delete code ruthlessly. If authentication half-built, remove entirely and use shared PIN. |
| Medication UX causes missed doses | LOW | Add home screen widget, enable notification actions. Can ship as v1.1 update within days. |
| Notification fatigue | LOW | Add priority system and quiet hours. Backend change to tag notification levels, client update to filter. |
| HIPAA non-compliance | HIGH | May require complete rebuild if data stored unencrypted or in wrong region. Audit all data flows, add encryption, migrate data, get legal review. |
| Non-mobile-first design | MEDIUM | Redesign screens one at a time, prioritize most-used flows first (medication tracking, then tasks, then notes). |
| No offline support | HIGH | Requires architecture change from server-first to local-first. Weeks of work, high regression risk. |
| Alert fatigue from constant buzzing | LOW | Ship notification preferences screen, let users disable notification types. 1-day fix. |
| Confusing medication instructions | LOW | Add plain language translations, use templates for common post-surgery schedules. 2-day fix with testing. |
| Crash on 500+ pending changes | MEDIUM | Add queue size limit (100 max), force sync before accepting new changes. Requires careful testing. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Real-time sync failures | Phase 01 (Data Architecture) | Simulate offline mode, verify changes persist. Test simultaneous edits, verify conflict UI appears. |
| Over-engineering | Phase 00 (Planning) | Scope doc has explicit "Out of Scope" section. Review hourly: "Are we shipping on time?" |
| Medication tracking UX | Phase 02 (Medication Features) | User test with elderly person. Measure: Can they mark medication taken in <5 seconds? |
| Notification overload | Phase 03 (Notifications) | Track notification count per day. Verify <10 notifications during 8-hour period (non-medication time). |
| HIPAA non-compliance | Phase 01 (Data Architecture) | Legal/compliance review of data handling. Verify encryption at rest and in transit. |
| Non-mobile-first design | Phase 02-03 (All feature phases) | Test on real iPhone SE and Android with 5-inch screen. Verify tap targets >44pt. |
| No offline support | Phase 01 (Data Architecture) | Enable airplane mode, verify app fully functional. Add record, verify it appears in pending queue. |
| Poor error handling | Phase 04 (Polish) | Disconnect network mid-action. Verify user sees helpful message, not crash or infinite spinner. |
| Missing medication snooze | Phase 02 (Medication Features) | Verify user can delay reminder. Track: How many reminders are snoozed vs. dismissed? |
| Complex onboarding | Phase 04 (Polish) - If time allows | Defer completely for MVP. Ship with zero onboarding, just functional app. Add wizard in Phase 2 if user feedback indicates confusion. |

## Sources

**Care Coordination & App Failures:**
- [Common Mistakes in Care Coordination and How to Avoid Them](https://carecoordinations.com/blog/common-mistakes-in-care-coordination-and-how-to-avoid-them)
- [Care coordination is failing without provider engagement](https://www.modernhealthcare.com/sponsored/mh-care-coordination-provider-engagement-failure/)
- [List of Top 10 Care Coordination Challenges in Healthcare Today](https://carecoordinations.com/blog/list-of-top-10-care-coordination-challenges-in-healthcare-today)
- [4 Common Challenges with Care Coordination Software](https://www.thoroughcare.net/blog/challenges-care-management-software)

**Post-Surgery Care Mistakes:**
- [Post-surgery care: Mistakes to avoid as a caregiver](https://www.homage.sg/resources/post-surgery-caregiving-mistakes/)
- [Patient and caregiver perspectives on care coordination during transitions of surgical care](https://pubmed.ncbi.nlm.nih.gov/29800402/)
- [Usability of Mobile Health Apps for Postoperative Care: Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7709840/)

**Healthcare App UX & Medication Tracking:**
- [Top 10 UX Mistakes in Healthcare apps and How to fix them](https://medium.com/@ShapesandStrategies/top-10-ux-mistakes-in-healthcare-apps-and-how-to-fix-them-601cd1f1f1ee)
- [Healthcare UI Design 2026: Best Practices + Examples](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- [Smartphone medication adherence apps: Potential benefits to patients and providers](https://pmc.ncbi.nlm.nih.gov/articles/PMC3919626/)
- [Apple Health App Medications Reminders Issues](https://discussions.apple.com/thread/255955677)

**Real-Time Sync & Data Loss:**
- [Offline-First Done Right: Sync Patterns for Real-World Mobile Networks](https://developersvoice.com/blog/mobile/offline-first-sync-patterns/)
- [Build an offline-first app | App architecture | Android Developers](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [Offline-first apps are appropriate for many clinical environments](https://www.simple.org/blog/offline-first-apps/)
- [Mobile Health Apps & Real-Time Data Integration: Readiness Checklist](https://www.thryve.health/blog/real-time-data-app)

**Notification Fatigue:**
- [Alarm fatigue in healthcare: a scoping review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12181921/)
- [5 Strategies for Reducing Alarm Fatigue in Hospitals](https://tigerconnect.com/resources/blog-articles/top-5-strategies-for-reducing-alarm-fatigue-in-hospitals/)
- [Alert Fatigue: Impact on Users & Solutions](https://www.magicbell.com/blog/alert-fatigue)

**HIPAA Compliance:**
- [The Ultimate Guide to Building a HIPAA Compliant App in 2026](https://mindsea.com/blog/hipaa-compliant/)
- [HIPAA-Compliant App Development in 2026 | A Complete Guide](https://trigma.com/healthtech/hipaa-compliant-app-development/)
- [Top 5 HIPAA Challenges for Small Health Practices](https://www.healthcarecompliancepros.com/blog/top-5-hipaa-challenges-for-small-health-practices)

**MVP Development & Over-Engineering:**
- [MVP Software in Healthcare and 9 Common Pitfalls to Avoid](https://kms-healthcare.com/blog/9-common-healthcare-mvp-software-pitfalls-to-avoid/)
- [Healthcare MVP Guide | Steps, Tips, and Mistakes to Avoid](https://www.lowcode.agency/blog/healthcare-mvp-guide)
- [How to Build an MVP for Healthcare: a Complete Guide](https://tateeda.com/blog/how-to-build-an-mvp-for-a-healthcare-product)

---
*Pitfalls research for: Post-Surgery Care Coordination Mobile App*
*Researched: 2026-02-16*
*Confidence: HIGH - Based on peer-reviewed research, industry post-mortems, and documented healthcare app failures*
