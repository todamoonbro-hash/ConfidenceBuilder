# QA Report — Phase 18 (Production Readiness Hardening)

Date: 2026-05-02
Workspace: `c:\Users\mfio\ConfidenceBuilder`

## Phase 18 status — gap-analysis remediation

Following the four-expert gap analysis (PM, Life Coach, Public Speaking Coach, QA, Developer), the
following remediations landed in this phase:

### Foundation / safety
- **Global Fastify error handler** added — sanitizes 4xx/5xx, attaches request IDs, never leaks stack traces
- **404 handler** added (returns structured JSON instead of Fastify default)
- **Bounded LRU rate limiter** with eviction (was unbounded `Map`); honors `RATE_LIMIT_MAX_ENTRIES` env
- **Request-ID propagation** via `x-request-id` header for log correlation
- **Security headers** (`x-content-type-options`, `referrer-policy`) added to every response
- **API binds 127.0.0.1 by default**; explicit `BIND_HOST=0.0.0.0` required to expose beyond local
- **Fail-fast on missing ADMIN_API_TOKEN in production** — silent admin-disabled previously
- **Graceful shutdown** on SIGTERM/SIGINT
- **Concurrency-safe persistence**: write queue + atomic temp-file rename; coalesces simultaneous commits
- **Custom Fastify type shim extended** to cover `setErrorHandler`, `log`, `close`, `genReqId`

### Auth / account hygiene
- **JWT cookie-session scaffold** at `apps/api/src/lib/auth.ts` (HMAC-SHA256, 14-day TTL); routes
  `/v1/auth/{login,logout,me,status}`. Activated only when `AUTH_ENABLED=true` (legacy single-user
  flows continue to work for development)
- **`requireAuthenticatedUser()` helper** — rejects with 401/403 when auth enabled
- **Account export endpoint** `GET /v1/users/:userId/export` (GDPR/CCPA-aligned dump of all data
  for a user)
- **Account delete endpoint** `DELETE /v1/users/:userId` (requires `confirmation === userId`)

### Coaching depth
- **Breathing/grounding service** (`breathing-service.ts`) with 6 evidence-backed protocols:
  physiological sigh, box breath, 4-7-8, rib expansion, coherent breathing, pre-speech calm.
  `recommendBreathingProtocol()` selects based on user state and time available. Wired at
  `/v1/modules/breathing/{protocols,recommend}`.
- **Real vocal warmups** added to `articulation-drills-service.ts`: lip trills, sirens on 'ng',
  humming, straw phonation, jaw release, yawn-sigh. New endpoint `/v1/modules/articulation/warmups`.
- **Identity-anchored feedback**: prompt now requires `identityReinforcement` and `priorityDimension`
  fields; feedback engine returns `notMeasured[]` so dimensions we can't honestly score (read-aloud
  without source, listening without prompt, media without key messages, body language without camera)
  are flagged as such — no more fabricated numbers.
- **STAR / CAR / PREP / SCQA / BLUF / PYRAMID interactive scaffolds** at `answer-scaffold-service.ts`.
  `evaluateScaffoldFill()` validates word counts per segment and assembles the spoken answer. Wired at
  `/v1/modules/scaffolds/{frameworks,evaluate}`.
- **Deliberate-practice planner**: replaced 11-line `packages/curriculum/src/index.ts` with plateau
  detection (last-5 within ±5), edge-of-competence rep band (7-12 reps), upcoming-event awareness,
  and breath/warmup-first session structure aligned with PRODUCT_SPEC.md:46-55.
- **Honest skill-vector**: `adaptive-coach-service.ts` no longer fabricates `vocal_energy`, `pace`, or
  `eye_contact_body_language` from text features; they return `NOT_MEASURED` and `userSkillTree`
  exposes `measured: false` with a `notMeasuredReason`.

### Prompt / model safety
- **Prompt injection guards**: user transcript and personalContext are now wrapped in `<transcript>`,
  `<profile>`, `<memory>` tags with control-character + tag-stripping sanitization; system prompt
  explicitly instructs the model to treat tagged content as data, not instructions.
- **Safe JSON parsing**: model output stripped of code fences and parsed with first-`{`/last-`}`
  fallback; raises `feedback_parse_failed:invalid_JSON` on bad output instead of throwing raw.
- **Sanitized upstream errors**: OpenAI-compatible upstream failures no longer embed raw response
  bodies into thrown error messages.

### Recording UX
- **Empty/silent blob detection** (< 1 KiB) — friendly client-side message instead of opaque server error
- **Hard 4-minute recording cap** with auto-stop; UI surfaces remaining time
- **Recording duration cap also applied to impromptu auto-stop**

### Operations
- **GitHub Actions CI** at `.github/workflows/ci.yml`: typecheck + tests + build on every PR;
  separate `smoke-e2e` job runs Playwright against booted api+web
- **Playwright `webServer` config**: tests now boot api on 4000 and web on 3000 automatically;
  honors `PLAYWRIGHT_SKIP_WEBSERVER=1` for local dev where services are already running
- **First-run UX**: `/` redirects to `/onboarding` until a training profile exists; "Skip for now"
  removed (it dumped users into a half-state)

### Coaching content
- **+8 reading-aloud passages** (5 → 13): VC update, all-hands, descriptive narrative, dialogue,
  technical runbook, news article, dense scientific summary, executive decision memo
- **+31 impromptu prompts** (16 → 47), spread across all 8 categories

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

All 26 API test files passed (24 prior + 2 new for Phase 18):

- answer-scaffold (NEW)
- articulation-heuristic
- boss-challenge
- breathing-service (NEW)
- coach-overview
- crisis-simulator
- dashboard-insights
- difficult-conversations
- engine
- executive-presence
- executive-simulations
- feedback-fallback
- feedback-parser
- history
- impromptu-speaking-lab
- interview-prep
- listening-response-lab
- media-heuristic
- networking
- personalization
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
