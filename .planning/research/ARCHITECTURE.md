# Architecture Research

**Domain:** Post-surgery care coordination (patient/caregiver)
**Researched:** 2026-02-16
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Apps (iOS/Android)                 │
│  ┌──────────────────┐          ┌──────────────────┐          │
│  │  Patient View    │          │  Caregiver View  │          │
│  │  - Med tracker   │          │  - Care dashboard│          │
│  │  - Feeling logs  │          │  - Med reminders │          │
│  │  - Messaging     │          │  - Activity view │          │
│  └────────┬─────────┘          └────────┬─────────┘          │
│           │                             │                    │
│           └──────────────┬──────────────┘                    │
├──────────────────────────┴───────────────────────────────────┤
│                   Real-Time Sync Layer                       │
│            (WebSocket / Supabase Realtime)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - Instant data propagation (patient → caregiver)   │    │
│  │  - Presence tracking (who's online)                 │    │
│  │  - Optimistic updates with conflict resolution     │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      Backend Layer                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                │
│  │  Auth API │  │  Data API │  │ Push      │                │
│  │           │  │           │  │ Notifs    │                │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                │
├────────┴──────────────┴──────────────┴──────────────────────┤
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (structured PHI)                         │   │
│  │  - Users (patients, caregivers, relationships)       │   │
│  │  - Medications (schedules, logs, adherence)          │   │
│  │  - Activities (care tasks, symptom logs)             │   │
│  │  - Messages (encrypted, HIPAA-compliant)             │   │
│  │  - Audit logs (immutable, 7-year retention)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Patient Mobile App** | Medicine logging, feeling check-ins, viewing schedules, messaging caregiver | React Native with local state + Supabase client |
| **Caregiver Mobile App** | Real-time care dashboard, medication oversight, activity tracking, messaging patient | React Native with shared codebase (role-based UI) |
| **Real-Time Sync Layer** | Sub-second data propagation, presence tracking, offline queue management | Supabase Realtime (WebSocket) or Firebase Realtime Database |
| **Auth Service** | User authentication, role-based access control, session management | Supabase Auth or Firebase Auth with MFA |
| **Data API** | CRUD operations, data validation, business logic, audit logging | Node.js/TypeScript API or serverless functions |
| **Push Notification Service** | Med reminders, care alerts, missed dose notifications | Firebase Cloud Messaging (FCM) or APNs via Expo |
| **PostgreSQL Database** | Structured PHI storage with encryption at rest, relationship management | Supabase (managed PostgreSQL) or AWS RDS with pgcrypto |

## Recommended Project Structure

```
mobile-app/
├── src/
│   ├── features/           # Feature-based organization
│   │   ├── auth/           # Authentication screens & logic
│   │   ├── medications/    # Med tracking, schedules, logs
│   │   ├── activities/     # Care tasks, symptom logs
│   │   ├── messages/       # Real-time messaging
│   │   ├── calendar/       # Schedule views
│   │   └── profile/        # User settings
│   ├── components/         # Shared UI components
│   │   ├── ui/             # Design system components
│   │   └── forms/          # Reusable form inputs
│   ├── hooks/              # Custom React hooks
│   │   ├── useRealtime.ts  # Real-time subscription hook
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── useOffline.ts   # Offline queue management
│   ├── lib/                # Core utilities
│   │   ├── supabase.ts     # Supabase client config
│   │   ├── storage.ts      # Local storage (AsyncStorage)
│   │   └── notifications.ts # Push notification setup
│   ├── types/              # TypeScript types
│   │   ├── database.ts     # Database schema types
│   │   └── api.ts          # API response types
│   ├── navigation/         # Navigation structure
│   │   ├── PatientNavigator.tsx
│   │   └── CaregiverNavigator.tsx
│   └── config/             # App configuration
│       ├── constants.ts    # App constants
│       └── theme.ts        # Design tokens

backend/ (if using custom API)
├── src/
│   ├── routes/             # API endpoints
│   │   ├── medications.ts
│   │   ├── activities.ts
│   │   └── messages.ts
│   ├── middleware/         # Auth, validation, logging
│   ├── services/           # Business logic
│   └── db/                 # Database migrations & seeds

database/
├── migrations/             # SQL migration files
│   ├── 001_initial_schema.sql
│   ├── 002_add_medications.sql
│   └── 003_add_realtime_subscriptions.sql
└── seeds/                  # Test data
```

### Structure Rationale

- **Feature-based organization:** Each domain (medications, activities, messages) is self-contained, making it easy to work on features independently
- **Shared component library:** UI components are extracted for consistency and reusability across patient/caregiver views
- **Custom hooks layer:** React hooks encapsulate real-time subscriptions, auth state, and offline logic, keeping components clean
- **Type safety:** Database schema types are generated from Supabase, ensuring type safety between frontend and backend
- **Role-based navigation:** Patient and caregiver have separate navigation trees, but share underlying components

## Architectural Patterns

### Pattern 1: Real-Time Event-Driven Architecture

**What:** Patient actions (log medication, post feeling check-in) publish events instantly to a message broker, which propagates changes to all subscribed caregivers in real-time

**When to use:** When caregivers need immediate visibility into patient activities (medication adherence, symptom changes)

**Trade-offs:**
- **Pros:** Sub-second latency, excellent UX, automatic synchronization
- **Cons:** More complex than polling, requires WebSocket management, connection failures need graceful handling

**Example:**
```typescript
// Patient logs medication
const logMedication = async (medicationId: string) => {
  // Optimistic update (instant UI feedback)
  setLocalState(prev => [...prev, newLog]);

  // Write to database (Supabase broadcasts via Realtime)
  const { data, error } = await supabase
    .from('medication_logs')
    .insert({ medication_id: medicationId, taken_at: new Date() });

  // Caregiver's subscription receives update automatically
  // No polling needed!
};

// Caregiver subscribes to changes
useEffect(() => {
  const subscription = supabase
    .channel('medication_updates')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'medication_logs' },
      (payload) => {
        // Update caregiver's dashboard instantly
        setMedicationLogs(prev => [...prev, payload.new]);
        showNotification('Patient took medication');
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### Pattern 2: Offline-First with Optimistic Updates

**What:** User actions are applied immediately to local state (optimistic UI), queued for sync, and reconciled when connection is restored

**When to use:** Mobile apps where connectivity is unreliable (post-surgery patients may not always have WiFi)

**Trade-offs:**
- **Pros:** Excellent perceived performance, works offline, no blocking on network
- **Cons:** Conflict resolution complexity, need retry logic, sync queue management

**Example:**
```typescript
// Custom hook for offline-first operations
const useOfflineFirst = () => {
  const [syncQueue, setSyncQueue] = useState<Operation[]>([]);
  const isOnline = useNetInfo();

  const queueOperation = async (operation: Operation) => {
    // 1. Apply optimistically to local state
    applyLocally(operation);

    // 2. Add to sync queue
    setSyncQueue(prev => [...prev, operation]);
    await AsyncStorage.setItem('syncQueue', JSON.stringify(syncQueue));

    // 3. Attempt immediate sync if online
    if (isOnline) {
      await syncOperation(operation);
    }
  };

  // Background sync when connection restored
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline]);

  return { queueOperation };
};
```

### Pattern 3: Role-Based Component Composition

**What:** Same base components render differently based on user role (patient vs. caregiver), with role-specific features composed on top

**When to use:** When patient and caregiver apps share 80% of logic but have different views/permissions

**Trade-offs:**
- **Pros:** Code reuse, single codebase, consistent behavior
- **Cons:** Need clear role abstractions, risk of role-specific logic leaking into shared components

**Example:**
```typescript
// Shared component with role-based rendering
const MedicationCard = ({ medication, userRole }) => {
  return (
    <Card>
      <MedicationInfo medication={medication} />

      {userRole === 'patient' && (
        <LogMedicationButton medication={medication} />
      )}

      {userRole === 'caregiver' && (
        <>
          <AdherenceChart medication={medication} />
          <SendReminderButton patientId={medication.patient_id} />
        </>
      )}
    </Card>
  );
};

// Navigation structure
const getNavigator = (userRole: 'patient' | 'caregiver') => {
  const sharedScreens = {
    Medications: MedicationListScreen,
    Calendar: CalendarScreen,
    Messages: MessageScreen,
  };

  const roleSpecificScreens = userRole === 'caregiver'
    ? { Dashboard: CaregiverDashboard }
    : { FeelingLog: FeelingLogScreen };

  return { ...sharedScreens, ...roleSpecificScreens };
};
```

### Pattern 4: Patient-Controlled Data Sharing

**What:** Patient has explicit control over what data caregivers can see, with granular permissions

**When to use:** HIPAA compliance requires patient consent for data sharing; builds trust

**Trade-offs:**
- **Pros:** Privacy-compliant, patient autonomy, flexible access control
- **Cons:** More complex permission model, need consent UI flows

**Example:**
```typescript
// Database schema with relationship-based access
CREATE TABLE care_relationships (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  caregiver_id UUID REFERENCES users(id),
  permissions JSONB DEFAULT '{
    "view_medications": true,
    "view_activities": true,
    "view_messages": true,
    "send_reminders": true,
    "view_feeling_logs": false
  }',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

// Row-level security policy (Supabase)
CREATE POLICY "Caregivers see only permitted data"
ON medication_logs FOR SELECT
USING (
  patient_id IN (
    SELECT patient_id FROM care_relationships
    WHERE caregiver_id = auth.uid()
    AND permissions->>'view_medications' = 'true'
  )
);
```

## Data Flow

### Request Flow: Patient Logs Medication

```
[Patient taps "Take Medicine" button]
    ↓
[MedicationLogForm] → optimistic update to local state
    ↓
[useOfflineFirst hook] → add to sync queue
    ↓
[Supabase client] → INSERT medication_logs (if online)
    ↓
[PostgreSQL] → row inserted, triggers pg_notify
    ↓
[Supabase Realtime Server] → broadcasts to subscribed clients
    ↓
[Caregiver's WebSocket] → receives INSERT event
    ↓
[useRealtime hook] → updates caregiver's dashboard
    ↓
[Push notification service] → sends notification to caregiver
```

### State Management Flow

```
[Global State (Zustand/Context)]
    ↓ (subscribe)
[UI Components] ←→ [Actions] → [Supabase API] → [PostgreSQL]
    ↑                              ↓
    └──────[Real-time updates]─────┘
```

### Key Data Flows

1. **Medication adherence:** Patient logs → Real-time broadcast → Caregiver sees update → Adherence chart updates
2. **Care reminders:** Caregiver sends reminder → Push notification → Patient receives → Opens app → Logs action
3. **Feeling check-ins:** Patient submits feeling → Real-time broadcast → Caregiver dashboard → Alert if concerning
4. **Messaging:** Bidirectional real-time chat with read receipts and typing indicators

## Build Order & Dependencies

### Phase 1: Foundation (Day 1, AM)
**Build:** Database schema, auth, basic UI shell

**Why first:** Everything depends on data model and authentication

**Components:**
- PostgreSQL schema (users, care_relationships)
- Supabase auth setup
- React Native project with navigation
- Basic patient/caregiver login screens

**Success criteria:** User can sign up, log in, see empty home screen

### Phase 2: Medication Tracking (Day 1, PM)
**Build:** Medicine schedules, logging, basic list views

**Why second:** Core value proposition, foundational data for other features

**Components:**
- Medication database tables
- Patient: add medication, log taken
- Caregiver: view patient's medications
- Basic adherence indicators

**Success criteria:** Patient can log medication, caregiver sees it (without real-time yet)

### Phase 3: Real-Time Sync (Day 2, AM)
**Build:** WebSocket subscriptions, live updates, presence

**Why third:** Depends on having data to sync; transforms app from "good" to "great"

**Components:**
- Supabase Realtime subscriptions
- useRealtime custom hook
- Optimistic updates
- Connection status indicators

**Success criteria:** Patient logs medication, caregiver sees update within 1 second

### Phase 4: Activity Logging (Day 2, PM)
**Build:** Care activities, symptom logs, feeling check-ins

**Why fourth:** Builds on medication tracking pattern, adds care coordination value

**Components:**
- Activities database tables
- Patient: log symptoms, feelings, care tasks
- Caregiver: view activity timeline
- Real-time activity updates

**Success criteria:** Patient posts feeling, caregiver sees timeline update instantly

### Phase 5: Messaging & Calendar (Day 3)
**Build:** Real-time chat, calendar views, notifications

**Why last:** Nice-to-have features that leverage existing real-time infrastructure

**Components:**
- Messages table with encryption
- Real-time chat interface
- Calendar views (day/week)
- Push notifications for reminders

**Success criteria:** Patient and caregiver can message in real-time, see upcoming medications in calendar

### Dependency Graph

```
Foundation (Auth, DB, UI)
    ↓
Medication Tracking
    ↓
Real-Time Sync ──────┐
    ↓                ↓
Activity Logging   Messaging
    ↓                ↓
Calendar & Notifications
```

## Real-Time Sync Architecture

### Recommended Approach: Supabase Realtime

**Why Supabase over Firebase:**
- PostgreSQL (relational) better for structured care coordination data
- Row-level security policies built-in (HIPAA-friendly)
- No vendor lock-in (can self-host)
- SQL-first (easier to reason about complex queries)
- Real-time via PostgreSQL logical replication (battle-tested)

### Architecture Components

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile Clients                         │
│  ┌──────────┐                          ┌──────────┐     │
│  │ Patient  │                          │Caregiver │     │
│  │  App     │                          │   App    │     │
│  └────┬─────┘                          └────┬─────┘     │
│       │ WebSocket                           │           │
├───────┴─────────────────────────────────────┴───────────┤
│              Supabase Realtime Server                    │
│         (Elixir cluster, Phoenix Framework)              │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Channel Multiplexer                           │     │
│  │  - Routes messages to subscribed clients       │     │
│  │  - Manages presence (who's online)             │     │
│  │  - Handles broadcast messages                  │     │
│  └─────────────────┬──────────────────────────────┘     │
│                    │                                     │
├────────────────────┴─────────────────────────────────────┤
│                 PostgreSQL                               │
│  ┌────────────────────────────────────────────────┐     │
│  │  Write-Ahead Log (WAL)                         │     │
│  │  - Captures all database changes               │     │
│  │  - Replicated to Realtime Server               │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Technical Implementation

**Client-side subscription:**
```typescript
// Subscribe to patient's medication logs
const subscription = supabase
  .channel(`patient:${patientId}`)
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'medication_logs',
      filter: `patient_id=eq.${patientId}`
    },
    (payload) => {
      console.log('New medication log:', payload.new);
      updateDashboard(payload.new);
    }
  )
  .subscribe();
```

**Scaling characteristics:**
- **Connections:** 10K+ concurrent connections per node
- **Latency:** <100ms for 95th percentile
- **Throughput:** 1M+ messages/hour per node
- **Cost:** $2.50 per 1M messages, $10 per 1K peak connections

**For 2-patient prototype:** Free tier is more than sufficient (500MB database, 2GB bandwidth, 5GB file storage)

## Mobile Considerations

### iOS Primary, Responsive Design

**Platform priorities:**
1. **iOS (primary):** Native look-and-feel using React Native's iOS-specific components
2. **Android (secondary):** Material Design via React Native Paper
3. **Responsive:** Adapts to iPhone SE → iPhone 16 Pro Max

**Implementation approach:**
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    // iOS uses SF Pro, Android uses Roboto
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    // iOS has more padding
    padding: Platform.OS === 'ios' ? 16 : 12,
  },
});
```

### Offline Support

**Critical for post-surgery patients who may:**
- Be in hospital with poor WiFi
- Be recovering at home with spotty connectivity
- Be taking medications regardless of network availability

**Strategy:**
1. **Local-first data:** AsyncStorage caches all data
2. **Sync queue:** Operations queue locally, sync when online
3. **Optimistic UI:** Instant feedback, reconcile later
4. **Connection indicator:** User knows when offline

**Implementation:**
```typescript
// Detect connectivity
import NetInfo from '@react-native-community/netinfo';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return unsubscribe;
  }, []);

  return isOnline;
};
```

### Push Notifications

**Critical for:**
- Medication reminders (patient)
- Missed dose alerts (caregiver)
- Concerning symptom notifications (caregiver)

**Implementation via Expo:**
```typescript
import * as Notifications from 'expo-notifications';

// Schedule medication reminder
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Time for medication',
    body: 'Take 1 tablet of Ibuprofen',
    data: { medicationId: 'abc-123' },
  },
  trigger: {
    hour: 9,
    minute: 0,
    repeats: true,
  },
});
```

### Performance Optimizations

**Fast to build = minimal custom code**

1. **Use Expo:** Managed workflow = no native code setup
2. **Supabase SDK:** Handles real-time, auth, storage out-of-box
3. **React Native Paper:** Pre-built UI components
4. **FlatList virtualization:** Efficient rendering of medication/activity lists
5. **Image optimization:** Use Expo's optimized image component

**Target metrics:**
- App launch: <2 seconds
- Screen transitions: <100ms
- Real-time updates: <1 second end-to-end latency

## Security & Compliance

### HIPAA Considerations

**Protected Health Information (PHI):**
- Medication names and schedules
- Symptom logs and feeling check-ins
- Messages between patient and caregiver

**Required safeguards:**
1. **Encryption at rest:** PostgreSQL with pgcrypto extension
2. **Encryption in transit:** TLS 1.3 for all connections
3. **Access controls:** Row-level security (RLS) policies
4. **Audit logging:** Immutable logs of all PHI access
5. **Secure authentication:** MFA recommended for caregivers
6. **Data retention:** 7-year retention of audit logs

**Supabase HIPAA compliance:**
- Supabase offers HIPAA-compliant hosting on Pro tier ($25/month)
- Requires signed Business Associate Agreement (BAA)
- For MVP/prototype: Use Supabase free tier with understanding it's not production-ready

### Row-Level Security Example

```sql
-- Patients see only their own data
CREATE POLICY "Users see own data"
ON medication_logs FOR ALL
USING (auth.uid() = patient_id);

-- Caregivers see only assigned patients' data
CREATE POLICY "Caregivers see assigned patients"
ON medication_logs FOR SELECT
USING (
  patient_id IN (
    SELECT patient_id FROM care_relationships
    WHERE caregiver_id = auth.uid()
  )
);
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **2-10 care relationships** | Supabase free tier, single region, no CDN, Expo development build |
| **10-100 care relationships** | Supabase Pro ($25/mo), enable connection pooling, add Sentry monitoring, production build |
| **100-1K care relationships** | Scale database to larger instance, enable read replicas, add Redis caching, implement rate limiting |
| **1K+ care relationships** | Multi-region deployment, CDN for static assets, split read/write operations, background job queue (BullMQ) |

### Scaling Priorities

1. **First bottleneck: Database connections**
   - **When:** ~50 concurrent active users (each holds 2-3 connections)
   - **Solution:** Enable Supabase connection pooling (PgBouncer), use Supabase's connection pooler string in app

2. **Second bottleneck: Real-time message throughput**
   - **When:** ~500 concurrent users (10K messages/minute)
   - **Solution:** Upgrade to Supabase Pro with additional Realtime capacity, implement message batching for high-frequency updates

3. **Third bottleneck: Database query performance**
   - **When:** ~1K patients with 6 months of logs
   - **Solution:** Add indexes on frequently queried columns (patient_id, taken_at), partition large tables by month

## Anti-Patterns

### Anti-Pattern 1: Building Custom Real-Time Infrastructure

**What people do:** Attempt to build WebSocket server from scratch using Socket.io

**Why it's wrong:**
- Weeks of work for connection management, reconnection logic, presence tracking
- Need to handle scaling, message persistence, delivery guarantees
- Security vulnerabilities if not implemented correctly
- Reinventing what Supabase/Firebase already solved

**Do this instead:** Use Supabase Realtime or Firebase Realtime Database; focus on business logic, not infrastructure

### Anti-Pattern 2: Denormalizing Everything for "Speed"

**What people do:** Store all patient data in one giant JSON blob per user

**Why it's wrong:**
- Difficult to query (need medication adherence for last week? Parse entire JSON)
- Breaks relational integrity (caregiver removed but still in patient's JSON)
- Concurrent updates cause conflicts (patient logs med while caregiver updates schedule)
- Audit logging becomes impossible

**Do this instead:** Use normalized relational schema; PostgreSQL is fast enough for this scale; use indexes and RLS

### Anti-Pattern 3: Building Native Apps Separately

**What people do:** Hire iOS developer and Android developer, build two separate apps

**Why it's wrong:**
- 2-3 days becomes 4-6 days (or 2-3 weeks)
- Feature parity nightmare (iOS has feature X, Android doesn't yet)
- Bugs need to be fixed twice
- Completely unnecessary for care coordination app

**Do this instead:** Use React Native with Expo; 95% code reuse; platform-specific code only where truly needed (push notifications, biometrics)

### Anti-Pattern 4: Implementing Custom Authentication

**What people do:** Roll own JWT-based auth with password hashing and session management

**Why it's wrong:**
- Security vulnerabilities (session fixation, token leakage, weak hashing)
- Missing features (MFA, password reset, email verification, OAuth)
- Weeks of development for non-differentiating feature
- Audit and compliance burden

**Do this instead:** Use Supabase Auth or Firebase Auth; battle-tested, secure, full-featured

### Anti-Pattern 5: Premature Optimization

**What people do:** Implement Redis caching, CDN, read replicas on Day 1

**Why it's wrong:**
- Adds complexity before knowing if it's needed
- Slows down development (2-3 day timeline becomes 1 week)
- Optimizing before measuring = guessing

**Do this instead:** Start with simplest architecture (Supabase + Expo + React Native); monitor performance; optimize when metrics show bottlenecks

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase** | SDK + WebSocket | Auth, database, real-time, storage all-in-one |
| **Expo** | Managed workflow | Push notifications, app building, OTA updates |
| **Sentry** | SDK integration | Error tracking, performance monitoring (add in Phase 2) |
| **Twilio (optional)** | REST API | SMS reminders for non-app-using caregivers |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Mobile App ↔ Supabase** | REST + WebSocket | All data operations go through Supabase client SDK |
| **Patient features ↔ Caregiver features** | Shared database tables with RLS | Same data, different permissions |
| **Auth ↔ Data layer** | Row-level security policies | Database enforces access control, not application code |

## Tech Stack Recommendation

**For 2-3 day timeline:**

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React Native + Expo (managed workflow) | Cross-platform, fast iteration, large ecosystem |
| **Backend** | Supabase (managed PostgreSQL + Realtime) | Batteries-included, real-time out-of-box, PostgreSQL (HIPAA-ready) |
| **Authentication** | Supabase Auth | Secure, full-featured, no custom code needed |
| **Database** | PostgreSQL (via Supabase) | Relational data, RLS for security, ACID guarantees |
| **Real-Time** | Supabase Realtime (WebSocket) | Built-in, no custom server, sub-second latency |
| **UI Library** | React Native Paper | Material Design components, accessible, well-documented |
| **State Management** | Zustand (lightweight) or React Context | Simple, minimal boilerplate, sufficient for app size |
| **Notifications** | Expo Notifications + FCM | Cross-platform push notifications via Expo |
| **Dev Tools** | TypeScript, ESLint, Prettier | Type safety, code quality, consistency |

**Alternative for even faster prototyping:**
- **Glide** or **FlutterFlow:** No-code/low-code platforms that can build basic care coordination in hours
- **Trade-off:** Less flexibility, harder to customize, vendor lock-in
- **Verdict:** For 2-3 day timeline with customization needs, stick with React Native + Supabase

## Sources

### Real-Time & Care Coordination Architecture
- [Architecting the Synchronized Digital Health System: Top Trends for 2026](https://www.pubnub.com/blog/architecting-the-synchronized-digital-health-system-2026-trends/)
- [Mobile Health Apps, Family Caregivers, and Care Planning: Scoping Review - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11157180/)
- [Interface Design for Patient-Caregiver Integrated Network - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC1839270/)
- [Mobile Care Coordination App Development - Case Study](https://www.scnsoft.com/case-studies/mobile-care-coordination)

### Technology Stack & Best Practices
- [Healthcare Mobile App Development in 2026: Costs, Trends | Orangesoft](https://orangesoft.co/blog/healthcare-mobile-app-development-guide)
- [Medication Management App Development: Comprehensive Guide](https://orangesoft.co/blog/guide-to-medication-management-app-development)
- [How to Develop a Medication Management App in 2025 - 2026](https://pacexgrowth.com/develop-medication-management-app-cost-and-guide/)

### Real-Time Technical Implementation
- [Supabase Realtime Architecture | Supabase Docs](https://supabase.com/docs/guides/realtime/architecture)
- [Supabase in 2026: The Open-Source Standard for Relational AI](https://textify.ai/supabase-relational-ai-2026-guide/)
- [WebSocket Architecture Fundamentals For Real-Time Scheduling Tools](https://www.myshyft.com/blog/websocket-implementation/)
- [Real-Time Web Apps in 2025: WebSockets, Server-Sent Events, and Beyond](https://www.debutinfotech.com/blog/real-time-web-apps)

### React Native + Firebase/Supabase
- [Realtime Database | React Native Firebase](https://rnfirebase.io/database/usage)
- [Structure Your Database | Firebase Realtime Database](https://firebase.google.com/docs/database/web/structure-data)
- [Building Real-Time Apps with Supabase: A Step-by-Step Guide](https://www.supadex.app/blog/building-real-time-apps-with-supabase-a-step-by-step-guide)

### Care Coordination Data Models
- [Care Coordination Measurement Framework | AHRQ](https://www.ahrq.gov/ncepcr/care/coordination/atlas/chapter3.html)
- [Getting the right message to the right caregiver saves health system millions | Healthcare IT News](https://www.healthcareitnews.com/news/getting-right-message-right-caregiver-saves-health-system-millions)

---
*Architecture research for: Post-surgery care coordination (patient/caregiver)*
*Researched: 2026-02-16*
