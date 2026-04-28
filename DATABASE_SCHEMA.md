# DATABASE_SCHEMA.md

## Primary Data Store
PostgreSQL (normalized schema for MVP with room for analytics expansion).

## Core Tables

### users
- id (uuid, pk)
- email (text, unique, not null)
- password_hash (text, not null)
- created_at (timestamptz)
- updated_at (timestamptz)

### user_profiles
- user_id (uuid, pk, fk -> users.id)
- display_name (text)
- goal_primary (text)  -- e.g. interview, public-speaking
- level_current (int default 1)
- created_at, updated_at

### training_sessions
- id (uuid, pk)
- user_id (uuid, fk)
- session_date (date)
- status (text) -- planned|in_progress|completed
- total_score (numeric(5,2), nullable)
- created_at, updated_at

### drills
- id (uuid, pk)
- session_id (uuid, fk)
- drill_type (text) -- articulation|read_aloud|impromptu|listening
- order_index (int)
- prompt_text (text)
- target_seconds (int)
- created_at

### attempts
- id (uuid, pk)
- drill_id (uuid, fk)
- attempt_index (int)
- transcript_text (text)
- feedback_text (text)
- priority_fix (text)
- score_confidence (numeric(5,2))
- score_clarity (numeric(5,2))
- score_articulation (numeric(5,2))
- score_reading_fluency (numeric(5,2))
- score_concision (numeric(5,2))
- score_executive_presence (numeric(5,2))
- score_listening (numeric(5,2))
- score_impromptu (numeric(5,2))
- score_presentation (numeric(5,2))
- score_total (numeric(5,2))
- created_at

### audio_assets
- id (uuid, pk)
- attempt_id (uuid, fk)
- storage_key (text)
- duration_ms (int)
- mime_type (text)
- created_at

### weekly_reviews
- id (uuid, pk)
- user_id (uuid, fk)
- week_start (date)
- summary_text (text)
- top_strength (text)
- top_priority (text)
- created_at

## Indexes
- training_sessions (user_id, session_date desc)
- drills (session_id, order_index)
- attempts (drill_id, attempt_index)
- weekly_reviews (user_id, week_start desc)

## Notes
- Keep score fields explicit in MVP for easy dashboard queries.
- Consider moving scores to JSONB in v2 if rubric dimensions evolve rapidly.

## Implementation Note (Phase 2)
For this phase, persistence is implemented with a typed in-memory store seeded from `apps/api/src/db/seed-data.json`.
This avoids introducing heavy ORM/runtime dependencies before core product loops are validated, while keeping entity contracts explicit.
A production adapter (e.g., Prisma + Postgres) can be added behind the same store interface without changing API response contracts.
