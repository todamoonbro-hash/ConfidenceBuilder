# ROADMAP.md

## Planning Principle
Build the smallest useful coaching loop first, then expand depth and realism.

## Phase 0 (Current): Planning + contracts
- Finalize architecture/docs/API contracts
- Define scoring and prompt format
- Lock MVP scope and acceptance criteria

## Phase 1: Foundations (Week 1)
- Basic auth + user profile/goal selection
- DB migrations and baseline schema
- Session, drill, and attempt API skeletons
- Environment/config validation and local setup docs

## Phase 2: Core Training Loop (Weeks 2–3)
- Daily session generator (rule-based)
- Read-aloud + articulation + impromptu modules (MVP drill set)
- Audio upload/playback + transcript retrieval
- Feedback card UI with one-priority-fix format

## Phase 3: AI Feedback + Scoring (Weeks 4–5)
- STT integration for transcript generation
- LLM feedback pipeline using AI contract
- Heuristic scoring with explainable reasons + next drill suggestion
- Session history view

## Phase 4: Progress + Weekly Review (Week 6)
- Dashboard with score trends by coaching area
- Weekly review summary endpoint + UI
- Level progression v1 (10-level model)

## Phase 5: Hardening + Beta (Week 7)
- Error handling and retry policies
- Prompt/version tracking
- QA pass and launch checklist

## Out of MVP (Post-Phase 5)
- Realtime voice coach and TTS responses
- Slide rehearsal, live Q&A simulation
- Camera/body-language analysis
