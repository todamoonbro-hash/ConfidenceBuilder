# QA Report — Phase 17 (Testing & Hardening)

Date: 2026-04-28  
Workspace: `c:\Users\mfio\ConfidenceBuilder`

## Scope Covered

- Onboarding flow and profile generation
- Daily adaptive plan generation
- XP / level progression + quest step completion
- Badge unlock path
- Recording + transcription + feedback error handling
- Dashboard aggregation path
- Frontend production build + type checks
- Backend build + automated tests
- Secret exposure checks in source code
- Mobile responsiveness spot-check (class-level responsive audit)

## Automated Test Results

### Backend tests (`apps/api/tests/*.test.mjs`)

All 20 API test files passed:

- articulation-heuristic
- coach-overview
- crisis-simulator
- dashboard-insights
- difficult-conversations
- engine
- executive-presence
- executive-simulations
- feedback-parser
- impromptu-speaking-lab
- interview-prep
- listening-response-lab
- media-heuristic
- networking
- reading-aloud-lab
- realtime-voice-coach
- sales-influence
- scenario-studio
- soundbite-messaging
- stage-progression

Result: ✅ PASS

### Frontend build (`apps/web`)

- Next.js production build succeeded after type fixes
- Route generation completed (`79/79` static pages generated)

Result: ✅ PASS

## Manual API Flow Validation

## 1) Onboarding → Profile → Adaptive Plan → Dashboard

Validated endpoints:

- `POST /v1/onboarding`
- `GET /v1/training/profile/:userId`
- `GET /v1/training/adaptive-plan/:userId`
- `GET /v1/dashboard/:userId`

Observed:

- onboarding returns `ok: true`
- profile generated with expected level band
- adaptive plan returns `ok: true`
- dashboard returns level progression data

Result: ✅ PASS

## 2) Quest progression + badge unlock

Validated endpoints:

- `GET /v1/quests/:userId`
- `POST /v1/quests/:questId/start`
- `POST /v1/training/complete-step`

Observed:

- quest start succeeded
- quest step completion succeeded
- unlockable badge logic triggered (`unlockedBadges_count=1` in QA run)

Result: ✅ PASS

## 3) Recording/transcription flow

Validated endpoints:

- `POST /v1/recordings/attempts`
- `POST /v1/recordings/transcribe`

Observed:

- recording metadata persisted successfully
- when API key is not configured, transcription fails gracefully with `transcription_not_configured`

Result: ✅ PASS (expected graceful fallback)

## Security & Secrets Review

- No hardcoded secrets/API keys found in application source files (web app/page/components and API source)
- API-key-dependent services access env vars server-side (`apps/api/src/services/*`), not client-side
- Web app source did not expose `process.env` secrets in app/component code

Result: ✅ PASS

## Issues Found During QA (and Resolution)

### Issue A — Next.js 15 page prop typing mismatch

- File: `apps/web/app/dashboard/page.tsx`
- Symptom: build error from generated `PageProps` check for `searchParams`
- Root cause: prop typed as object instead of `Promise<...>` for Next 15 app router type expectations
- Fix: updated `searchParams` type to `Promise<{ userId?: string }>` and awaited it
- Status: ✅ Fixed

### Issue B — Layout/App shell children typing blocked build

- Files:
  - `apps/web/app/layout.tsx`
  - `apps/web/components/ui/app-shell.tsx`
- Symptom: build type errors (`unknown` not assignable to `ReactNode`)
- Root cause: local React shim does not export full React types; strict `unknown` children props conflicted with JSX expectations
- Fix: relaxed children props to `any` in both files to satisfy current shim setup
- Status: ✅ Fixed

## Mobile Responsiveness QA Notes

A responsive utility audit confirmed use of breakpoint-aware classes across key surfaces:

- shell/header spacing (`px`, `py`, typography scales)
- dashboard/coach/module grid breakpoints (`md`, `lg`, `xl`)
- session recorder controls (`sm:grid-cols-2` button layout)

Result: ✅ PASS (class-level audit)

## Overall QA Verdict

Phase 17 acceptance criteria are met:

- [x] Critical flows verified (onboarding, plan generation, progression, quest/badge path, recording/transcription fallback, dashboard)
- [x] Backend test suite passes (20/20)
- [x] Frontend builds successfully
- [x] No TypeScript/build errors in current workspace state
- [x] No exposed API keys in source
- [x] QA report produced

## Recommendations (Next Pass)

1. Add an automated integration test for onboarding payload validation (bad schema vs good schema) to lock behavior.
2. Consider introducing shared request DTO types between web and API to prevent schema drift.
3. Replace permissive `children: any` typings with stronger shared JSX types once the custom React shim is expanded.
4. Add lightweight Playwright smoke tests for top user flows (onboarding, session, dashboard) for faster release confidence.
