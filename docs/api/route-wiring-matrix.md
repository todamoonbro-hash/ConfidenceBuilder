# API Route Wiring Matrix

Last updated: 2026-04-30

## Legend
- **Wired**: endpoint is actively called by the web app.
- **Partially wired**: some endpoint(s) in the feature are used, but coverage is incomplete.
- **Unwired**: endpoint exists in API but no current web caller.

## Core platform

| API endpoint | Web caller(s) | Status | Notes |
|---|---|---|---|
| `GET /health` | (none) | Unwired | Useful for uptime checks; not used by UI currently. |
| `GET /v1/config/status` | `apps/web/app/settings/page.tsx` | Wired | Settings uses this to show provider/config state. |
| `GET /v1/dashboard/:userId` | `apps/web/app/dashboard/page.tsx` | Wired | Main dashboard data source. |
| `GET /v1/history/:userId` | `apps/web/app/history/page.tsx` | Wired | History page now backed by live API data. |
| `POST /v1/onboarding` | `apps/web/app/onboarding/submit/route.ts` | Wired | Onboarding submit proxy calls API. |

## Coach & personalization

| API endpoint | Web caller(s) | Status | Notes |
|---|---|---|---|
| `GET /v1/coach/:userId/overview` | `apps/web/app/coach/page.tsx`, `apps/web/app/coach/overview/route.ts` | Wired | Coach hub data loaded. |
| `GET /v1/coach/:userId/personalization` | `apps/web/app/settings/page.tsx`, `apps/web/app/coach/personalization/route.ts` | Wired | Settings loads personalization. |
| `POST /v1/coach/:userId/personalization` | `apps/web/app/coach/personalization/route.ts` | Wired | Save flow wired. |

## Quests & training

| API endpoint | Web caller(s) | Status | Notes |
|---|---|---|---|
| `GET /v1/quests/:userId` | `apps/web/app/quests/page.tsx` | Wired | Quests page now uses live status/progress. |
| `POST /v1/quests/:questId/start` | `apps/web/app/quests/start/route.ts` | Wired | Start/continue quest wired. |
| `GET /v1/training/adaptive-plan/:userId` | (none) | Unwired | Candidate for quests/dashboard enhancements. |
| `POST /v1/training/complete-step` | (none) | Unwired | Currently progress updates happen via module endpoints. |
| `GET /v1/training/overview` | (none) | Unwired | Admin/ops visibility route, not surfaced in UI. |
| `GET /v1/training/profile/:userId` | (none) | Unwired | Could back profile/progression cards in dashboard/settings. |

## Session capture & feedback

| API endpoint | Web caller(s) | Status | Notes |
|---|---|---|---|
| `POST /v1/recordings/attempts` | `apps/web/app/session/recordings/save/route.ts` | Wired | Attempt + recording metadata persisted. |
| `POST /v1/recordings/transcribe` | `apps/web/app/session/recordings/transcribe/route.ts` | Wired | Transcription path active. |
| `POST /v1/attempts/:attemptId/feedback/generate` | `apps/web/app/session/feedback/generate/route.ts` | Wired | Feedback generation active. |

## Module/lab endpoints

| Feature family | API coverage | Web coverage | Status |
|---|---|---|---|
| Articulation | drills + score | module page + score route | Wired |
| Reading | passages + evaluate | module page + evaluate route | Wired |
| Media | drills, key-messages, soundbite transform/score, crisis start/evaluate | media studio + session routes | Wired |
| Impromptu | start + evaluate | lab + session routes | Wired |
| Listening | start + evaluate | lab + session routes | Wired |
| Executive (module) | start + evaluate | lab + session routes | Wired |

## Realtime coach

| API endpoint | Web caller(s) | Status |
|---|---|---|
| `POST /v1/realtime/session/start` | `apps/web/app/session/realtime/start/route.ts` | Wired |
| `POST /v1/realtime/session/turn` | `apps/web/app/session/realtime/turn/route.ts` | Wired |
| `POST /v1/realtime/session/end` | `apps/web/app/session/realtime/end/route.ts` | Wired |

## Vertical modules

| Feature | API endpoints | Web endpoints/pages | Status |
|---|---|---|---|
| Sales influence | library, roleplay start/turn/end, pitch builder, team, certifications, progress, pitch bank | sales pages/routes + studio | Wired |
| Interview prep | library, role setup, story bank, mock start/turn/end, answer-builder, positioning, plan, reflection, progress | interview pages/routes + studio | Wired |
| Executive presence | library, session start/turn/end, progress | executive pages/routes + studio | Wired |
| Difficult conversations | library, session start/turn/end, progress | difficult-conversations pages/routes + studio | Wired |
| Networking | library, session start/turn/end, progress | networking pages/routes + studio | Wired |

## Admin

| API endpoint | Web caller(s) | Status |
|---|---|---|
| `GET/POST /v1/admin/scenario-studio/scenarios` | `apps/web/app/admin/scenario-studio/api/scenarios/route.ts` | Wired |
| `POST /v1/admin/scenario-studio/scenarios/:id/update` | `apps/web/app/admin/scenario-studio/api/scenarios/route.ts` | Wired |
| `POST /v1/admin/scenario-studio/scenarios/:id/action` | `apps/web/app/admin/scenario-studio/api/scenarios/[id]/action/route.ts` | Wired |

## Summary

- **Fully wired for end-user core loops**: session capture/transcription/feedback and module flows.
- **Now fixed**: Quests page and history are backed by live API data.
- **Remaining known unwired API surface**: training profile/overview/adaptive-plan/complete-step and health endpoint are not currently consumed by UI.
