# ARCHITECTURE.md

## Goal
Ship a practical MVP for the AI Speaker Confidence Coach quickly, with clear boundaries so we can scale features after validation.

## Assumptions
- First version is a **Next.js + TypeScript** web app.
- Voice interaction can be asynchronous in MVP (record → transcribe → feedback), then upgraded to realtime later.
- Monorepo structure already exists (`apps/*`, `packages/*`).

## High-Level Architecture

### Runtime components
1. **Web App (`apps/web`)**
   - Next.js App Router UI
   - Client-side mic capture, recording playback, session flow
   - Calls API endpoints for sessions, transcription jobs, and feedback

2. **API App (`apps/api`)**
   - REST endpoints for auth/profile/session/feedback/progress
   - Orchestration for AI providers (STT + LLM)
   - Persists data to Postgres

3. **Worker (`apps/worker`)**
   - Async tasks: transcript post-processing, score aggregation, weekly summary generation

4. **Database + Storage**
   - PostgreSQL for relational data
   - Object storage (S3-compatible) for audio files

## Module Boundaries
- `packages/types`: shared contracts and DTOs
- `packages/ai`: AI provider interfaces + prompt runner abstractions
- `packages/scoring`: explainable heuristic scoring logic
- `packages/curriculum`: daily session planner and module sequencing
- `packages/analytics`: event schema
- `packages/config`: env parsing and validation

## MVP Request Flow
1. User starts daily session in web app.
2. Web app requests session plan from API.
3. User records drill audio and uploads to storage via presigned URL.
4. API triggers STT + feedback generation.
5. API stores transcript, feedback, and scores.
6. Web app renders concise coaching response and one priority fix.
7. Worker updates progression and weekly aggregates.

## Non-Functional MVP Targets
- p95 API response under 800ms for non-AI routes
- AI feedback turn under 8s for asynchronous workflow
- Basic observability: structured logs + request IDs + error tracking

## Future Expansion Path
- Realtime voice coach (WebSocket/WebRTC)
- Rich interview simulations
- Team dashboards and multiplayer speaking club
