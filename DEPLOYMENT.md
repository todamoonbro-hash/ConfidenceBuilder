# Deployment Guide

This guide covers production deployment readiness for **ConfidenceBuilder**.

## 1) Production build commands

From repository root:

- Build all workspaces: `npm run build`
- Type-check all workspaces: `npm run typecheck`

App-specific builds:

- Web app build: `npm run build -w @confidencebuilder/web`
- API build: `npm run build -w @confidencebuilder/api`

Run production servers locally after build:

- API: `npm run start -w @confidencebuilder/api`
- Web: `npm run start -w @confidencebuilder/web`

---

## 2) Environment variables

Use `.env.example` as the source of truth and copy values into environment configuration for your host.

### Required/important variables

| Variable | Used by | Required | Purpose |
|---|---|---:|---|
| `OPENAI_API_KEY` | API | Yes (for AI features) | Auth for transcription/feedback/realtime checks |
| `OPENAI_TRANSCRIPTION_MODEL` | API | No | Transcription model name |
| `OPENAI_FEEDBACK_MODEL` | API | No | Feedback model name |
| `OPENAI_REALTIME_MODEL` | API | No | Enables realtime-availability branch |
| `OPENAI_TIMEOUT_MS` | API | Recommended | Timeout for OpenAI transcription/feedback requests |
| `DATABASE_URL` | Future DB adapter | No (current in-memory mode) | Planned Postgres connection string |
| `AUTH_SECRET` | Future auth hardening | Recommended | Secret for auth/session infrastructure |
| `ADMIN_API_TOKEN` | API + Web | Required for admin tools | Server-to-server token for Scenario Studio admin APIs |
| `ADMIN_UI_TOKEN` | Web | Required for admin tools | Token required to open Scenario Studio admin UI |
| `STORAGE_PROVIDER` | Future storage adapter | Optional | Storage backend selector |
| `STORAGE_BUCKET` | Future storage adapter | Optional | Bucket/container name |
| `STORAGE_REGION` | Future storage adapter | Optional | Storage region |
| `STORAGE_ACCESS_KEY_ID` | Future storage adapter | Optional | Storage credential |
| `STORAGE_SECRET_ACCESS_KEY` | Future storage adapter | Optional | Storage credential |
| `APP_BASE_URL` | Web/integration | Recommended | Public web base URL |
| `API_BASE_URL` | Web route handlers | Recommended | Public API base URL |
| `NODE_ENV` | API/Web runtime | Recommended | Runtime mode |
| `API_PORT` | API | Optional | API listen port (default `4000`) |
| `PORT` | API host | Optional | Platform-provided port; takes priority over `API_PORT` |
| `MAX_JSON_BODY_BYTES` | API | Optional | Fastify JSON body limit |
| `MAX_AUDIO_BYTES` | API | Optional | Decoded audio payload limit before transcription |

> Security: Do **not** expose server secrets to browser bundles. Keep secrets in server runtime only.

---

## 3) Platform notes (Vercel + API host)

Recommended setup:

- Deploy `apps/web` to **Vercel**.
- Deploy `apps/api` to a Node host (Render, Railway, Fly.io, Azure App Service, etc.).

### Vercel (web)

1. Import repository in Vercel.
2. Set root directory to `apps/web`.
3. Build command: `npm run build`
4. Output: default Next.js output.
5. Add env vars in Vercel Project Settings:
   - `API_BASE_URL` (must point to your deployed API origin)
   - `APP_BASE_URL` (public web URL)
   - `ADMIN_UI_TOKEN` and `ADMIN_API_TOKEN` only if deploying admin tools
6. Deploy.

### API host (Fastify)

1. Build command: `npm run build -w @confidencebuilder/api`
2. Start command: `npm run start -w @confidencebuilder/api`
3. Set runtime env vars (OpenAI + URLs + optional port).
4. Ensure inbound traffic allows configured port / platform port binding. The API uses `PORT` first, then `API_PORT`, then `4000`.

---

## 4) Database migration steps

Current implementation status:

- API persistence currently uses a **typed in-memory store** seeded from `apps/api/src/db/seed-data.json`.
- There are **no runtime SQL migrations** in the current phase.

Production migration path (when enabling Postgres adapter):

1. Provision Postgres and set `DATABASE_URL`.
2. Apply schema from `DATABASE_SCHEMA.md` using your migration tool of choice (e.g. Prisma, Drizzle, SQL migrations).
3. Run data seed verification:
   - `npm run seed:verify -w @confidencebuilder/api`
4. Run API tests and production build:
   - `npm run test:engine -w @confidencebuilder/api`
   - `npm run build`

---

## 5) OpenAI safety check (server-side only)

OpenAI usage is server-side in API services:

- `apps/api/src/services/transcription-service.ts`
- `apps/api/src/services/feedback-engine-service.ts`
- `apps/api/src/services/realtime-voice-coach-service.ts`

Web app code (`apps/web/**`) contains no direct OpenAI client usage.

---

## 6) Pre-deploy checklist

- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `.env.example` reviewed and host env configured
- [ ] `API_BASE_URL` points to deployed API
- [ ] Secrets are server-side only
- [ ] `ADMIN_API_TOKEN` and `ADMIN_UI_TOKEN` are long random values if admin tools are enabled
- [ ] Audio/body limits are configured for your hosting plan
- [ ] Health check returns OK: `GET /health`
