# ConfidenceBuilder

AI Speaker Confidence Coach monorepo scaffold.

## Apps
- `apps/web`: Next.js voice-first client
- `apps/api`: Fastify API + realtime runtime endpoints
- `apps/worker`: background job worker

## Packages
- `packages/types`: shared schemas/types
- `packages/ai`: provider interfaces and adapters
- `packages/scoring`: scoring engine primitives
- `packages/curriculum`: adaptive training logic
- `packages/analytics`: event contracts
- `packages/config`: shared environment helpers

## Quick start
1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - `cp .env.example .env.local` (or copy manually on Windows)
3. Fill in required values in `.env.local` (do not commit secrets).
4. Start dev services:
   - `npm run dev`

## Production build and run
From repo root:

- Build all workspaces: `npm run build`
- Type-check: `npm run typecheck`

Run production services:

- API: `npm run start -w @confidencebuilder/api`
- Web: `npm run start -w @confidencebuilder/web`

Do not run `next build` against the same `.next` directory while `next start` is serving traffic. Stop the web process, build, then start it again.

## Environment variables
The repository includes `.env.example` with placeholders for:
- OpenAI API key and model settings (`OPENAI_API_KEY`, `OPENAI_TRANSCRIPTION_MODEL`, `OPENAI_FEEDBACK_MODEL`, `OPENAI_REALTIME_MODEL`)
- Runtime settings (`NODE_ENV`, `API_PORT`, `PORT`, request/audio limits)
- Local JSON persistence (`DB_FILE_PATH`) and future database URL (`DATABASE_URL`)
- Default single-user ID (`NEXT_PUBLIC_DEFAULT_USER_ID`)
- Auth/admin secrets (`AUTH_SECRET`, `ADMIN_API_TOKEN`, `ADMIN_UI_TOKEN`)
- Storage provider credentials (`STORAGE_*`)
- App/API base URLs (`APP_BASE_URL`, `API_BASE_URL`)

OpenAI and other secrets are intended for **server-side runtime only**.

For full deployment setup (Vercel + API host, migration notes, and checklist), see `DEPLOYMENT.md`.

## Phase 6 transcription integration notes
- Recording still happens in the browser with `MediaRecorder`.
- Audio is sent to a **server-side** path (`apps/web/app/session/recordings/transcribe/route.ts`) and then forwarded to the API (`POST /v1/recordings/transcribe`).
- The API calls OpenAI transcription (`apps/api/src/services/transcription-service.ts`) using `OPENAI_API_KEY`, which is never exposed to browser code.
- Transcription results are stored in the API state store via `saveTranscriptForAttempt`; when `DB_FILE_PATH` is configured, runtime changes are persisted to a local JSON snapshot.

## Phase 7 AI feedback integration notes
- Prompt templates are centralized in `apps/api/src/lib/ai/prompts/feedback-prompts.ts`.
- Feedback generation runs on the API (`POST /v1/attempts/:attemptId/feedback/generate`) using transcript + exercise context + goal/progression/quest metadata.
- The API stores both:
  - `feedbackItems` (`whatWorked`, `whatWeakened`, `priorityFix`, `retryInstruction`)
  - `scores` (numeric values + rationale map for explainable scoring).
- The web recorder UI can trigger feedback generation and renders concise coaching output beside transcript/playback.

## Phase 8 articulation studio notes
- Articulation drill catalog is served by the API (`GET /v1/modules/articulation/drills`) and includes warmups, final consonants, plosives, s-blends, r/l contrast, th drills, consonant clusters, tongue twisters, and pace ladder drills.
- Each drill run in the UI includes instruction, example phrase, target focus, difficulty, recording, transcript, and AI feedback.
- Articulation scoring is explicitly labeled as a **coaching heuristic** (not precise phoneme analysis) and combines transcript completeness, repeated words, substitution estimates, pace estimate, and user self-rating.
- Articulation heuristic scoring awards articulation XP via `POST /v1/modules/articulation/score`.

## Phase 8A media training notes
- Media drill catalog is served by `GET /v1/modules/media/drills` and includes: Key Message Builder, Opening Statement Trainer, Soundbite Trainer, Bridging Trainer, Flagging Trainer, Hostile Journalist Simulation, Crisis Statement Trainer, and Podcast Guest Mode.
- Media simulation modes include friendly/neutral/skeptical/hostile journalist, podcast host, live TV host, and crisis press conference.
- The module supports prompt/scenario + recording + transcript + AI feedback + retry, and adds media-specific heuristic scoring for message control, brevity, calmness, bridge quality, soundbite strength, clarity for general audience, defensiveness risk, and speculation risk.
- Media key messages (3-4) are saved via `POST /v1/modules/media/key-messages`, and media XP is awarded through `POST /v1/modules/media/score`.

## Phase 8B soundbite + messaging notes
- The soundbite engine accepts transcript or typed answers and transforms long responses into:
  - core message
  - 10-second / 20-second / 45-second soundbites
  - plain-English / executive / media-safe versions
  - jargon, hedging, and defensive flags
  - a stronger landing line
- Practice mode lets users read the improved soundbite aloud, record, transcribe, and get delivery feedback.
- Soundbite practice scoring includes brevity, clarity, and memorability, and awards media XP for completion and improvement.

## Phase 8C crisis + difficult question simulator notes
- Scenario coverage includes: company underperformance, job gap/career challenge, unpaid invoices/commercial dispute, failed transaction, investor concern, employee issue, public mistake, market downturn, hostile journalist question, and board challenge.
- The simulator asks difficult but professional questions, supports voice response, and scores composure, message control, clarity, honesty, brevity, speculation avoidance, bridge quality, and executive presence.
- A correction drill is built in: if score quality is low, the system returns exactly one fix and asks for a retry on the same question.
- Retry handling compares first answer vs retry and awards media XP for improvement, not only perfection.

## Phase 9 reading aloud lab notes
- Reading Aloud Lab supports five modes: guided reading, cold reading, executive/business reading, story/narrative reading, and difficult text mode.
- Passage library includes metadata tags for difficulty, type, length, and skill focus.
- Users can toggle phrase chunking view, record reading, transcribe, and run transcript-vs-source comparison.
- Comparison marks skipped words, repeated words, and substitution estimates, then scores pacing, pauses, fluency, expression, and recovery.
- Reading fluency score is stored in score records and reading XP is awarded on evaluation.

## Phase 10 impromptu speaking lab notes
- Impromptu Speaking Lab supports random prompt generation with category filters and timers (30s, 60s, 90s, 2min).
- Categories include personal confidence, explain simply, business decision, board question, investor challenge, hostile question, storytelling, and media response.
- The recorder supports timed answers, transcript + evaluation, and a retry flow with targeted fix instructions.
- Feedback scores clarity, structure, confidence, brevity, filler words, and answer completeness.
- Impromptu XP is awarded for both baseline completion and retry improvement.

## Phase 11 listening and response lab notes
- Listening drills include: listen and summarise, listen and answer, paraphrase then answer, identify the real question, detect tone/intent, and answer the hidden concern.
- The system presents written prompts and supports optional browser text-to-speech playback where available.
- Users respond by voice, generate transcript, and evaluate alignment against prompt focus and intent.
- Scoring includes summary accuracy, relevance, answer alignment, concision, and tone recognition.
- Listening XP is awarded and scores are stored in the same scoring/progression system.

## Phase 12 executive simulations notes
- Simulation modes include CFO interview, recruiter screen, investor pitch Q&A, board update, difficult stakeholder conversation, presentation rehearsal, leadership update, and media-adjacent executive questioning.
- Interviewer style can be set to supportive, neutral, challenging, or aggressive but professional.
- The simulation asks opening and follow-up challenge questions, captures voice response + transcript, and stores role-specific scores.
- Feedback focuses on executive presence, commercial sharpness, clarity, brevity, confidence, and answer structure.
- The system returns structure coaching plus an improved answer suggestion and awards executive XP (including retry improvement).

## Phase 13 realtime voice coach notes
- Realtime Voice Coach supports live coaching modes: interview simulation, confidence check-in, quick speaking warmup, media practice, and impromptu speaking.
- Session APIs support start -> turn-by-turn conversation -> end with saved transcript and generated summary.
- Realtime availability is detected from environment configuration; non-realtime fallback remains available and active by default.
- Web UI supports spoken turns via browser speech recognition when available and spoken coach replies via browser speech synthesis.
- Existing recorder and non-realtime flows remain intact as fallback.

## Phase 14 scoring and progress dashboard notes
- Dashboard endpoint now computes score trends from real stored score/attempt/session data, including confidence, clarity, articulation, reading fluency, concision, executive presence, media score, listening score, and XP trend.
- Dashboard displays session streak, completed sessions, strongest/weakest area, next recommended drill, level progress, badge progress, and quest progress.
- Weekly review generation includes what improved, what still needs work, one focus for next week, next quest recommendation, and next boss challenge recommendation.
- Charts are intentionally simple (readable bar trend cards) for quick scan and low UI complexity.

## Personal coach + cost routing notes
- Settings now includes a Personal Coach Setup screen for goals, target situations, known weaknesses, desired speaking identity, coaching strictness, weekly practice time, and model routing.
- Model preferences are stored by task: realtime coach, transcription, TTS, feedback, deep review, cheap scoring, and fallback.
- Feedback generation includes the personal coach profile and recent coaching memory, then saves a new memory record with observed weakness, priority fix, next drill, score, and model used.
- Cost-first routing currently supports OpenAI-compatible chat-completion endpoints for OpenAI, OpenRouter, DeepSeek, Mistral, xAI, Groq, Together, Fireworks, local models, and compatibility endpoints for Anthropic/Gemini when configured.

## Phase 15 level and stage progression notes
- Progression now maps users across 10 named levels from Rookie Speaker through Elite Speaker.
- Level computation considers more than raw XP: average score quality, weak-area improvement trend, streak consistency, quest completion, boss/challenge completion, and skill-XP thresholds.
- Game progress now includes level title, next milestone, unlocked/locked feature lists, next skill focus, and per-skill level mapping.
- Dashboard surfaces next milestone, next skill focus, and unlocked/locked features alongside score trends and progress cards.

## Current status
This commit establishes project structure, core interface contracts, and architecture docs for Phase 0 implementation.
