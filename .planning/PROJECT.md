# Medical Dashboard for Post-Surgery Care

## What This Is

A mobile-first web application for coordinating post-surgery care between a patient (Dad) and caregiver (Harris). Enables real-time tracking of medications, symptoms, care activities, and communication to ensure smooth recovery after surgery.

## Core Value

Patient and caregiver can stay coordinated on all aspects of post-surgery care—medications, symptoms, activities, and communication—from any device, ensuring nothing critical is missed during recovery.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Patient and caregiver can select their role and have it persist across sessions
- [ ] Track scheduled medications with specific days/times and as-needed (PRN) medications
- [ ] Log when medications are taken with timestamps
- [ ] View daily medication schedule showing what's pending vs taken
- [ ] Record feeling check-ins 3x daily (morning/afternoon/night) with 1-10 rating scale
- [ ] Log care activities (wound care, gauze changes, exercises, etc.) with timestamps
- [ ] View weekly calendar showing all scheduled medications and activities
- [ ] Send messages/notes between patient and caregiver
- [ ] Store doctor contact information and emergency numbers
- [ ] Real-time sync between patient and caregiver devices
- [ ] Mobile-optimized interface (touch-friendly, proper input sizing)
- [ ] Email notifications for important events (optional, low priority)

### Out of Scope

- Multi-tenant support (multiple patients/caregivers) — single patient/caregiver only
- Complex authentication system — using localStorage profile selection instead
- Desktop-first design — mobile is primary, desktop is bonus
- Photo sharing — text-based communication sufficient for v1
- Video calls — out of scope, use phone/FaceTime separately
- Integration with pharmacy systems — manual entry sufficient

## Context

**Surgery Timeline:**
- Surgery date: Wednesday (this week)
- Need dashboard operational before surgery
- Critical features: medication tracking, feeling check-ins, care notes

**Previous Attempt:**
- Had 40% complete implementation with medicine wizard and basic UI
- Restarting from scratch for cleaner architecture
- Supabase database previously set up (project ref: ishhmpxejnzpoxuwaajn)
- Can reuse database or create fresh schema

**Technical Environment:**
- Modern web stack (Next.js, TypeScript, Tailwind preferred)
- Supabase for backend (database, real-time subscriptions)
- Mobile-first responsive design
- iOS primary target (iPhone)

**Use Case:**
- Patient logs how they're feeling, when meds were taken
- Caregiver tracks care activities, monitors patient status
- Both can see real-time updates and communicate via notes
- Reduces "did you take your medicine?" questions
- Ensures critical care tasks aren't forgotten

## Constraints

- **Timeline**: Must be functional before Wednesday surgery (2-3 days maximum)
- **Tech Stack**: Next.js + TypeScript + Supabase (proven stack, fast development)
- **Mobile-First**: iPhone is primary device (16px input font-size to prevent iOS zoom)
- **Deployment**: Simple deployment to Vercel or Digital Ocean (DO CLI available)
- **Users**: Single patient + single caregiver (no multi-tenant complexity)
- **Performance**: Real-time sync critical (Supabase subscriptions required)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase over custom backend | Real-time subscriptions built-in, faster development | — Pending |
| No authentication, localStorage profiles | Single-tenant app, simpler UX, faster to ship | — Pending |
| Mobile-first design | Primary usage will be on phones during recovery | — Pending |
| Next.js 14+ with App Router | Modern React, fast, good mobile performance | — Pending |

---
*Last updated: 2026-02-16 after project initialization*
