# System Overview

ConfidenceBuilder is a voice-first AI coaching platform for speaker confidence and communication performance.

## Core architecture
- `apps/web` renders the user experience and captures microphone audio.
- `apps/api` orchestrates session runtime, AI provider calls, and persistence APIs.
- `apps/worker` executes asynchronous scoring, weekly review generation, and analytics aggregation.

## Product capabilities mapped to modules
- Daily adaptive training sessions -> curriculum package + training APIs.
- Confidence exposure drills -> curriculum templates + scoring package.
- Articulation/read-aloud/impromptu/public speaking drills -> drill templates and runtime state machine.
- Interview + executive communication simulations -> simulation drill type with persona prompts.
- Listening-response drills -> prompt-response loop with response quality scoring.
- AI voice interaction/STT/TTS/LLM feedback -> AI provider interfaces.
- Audio recording/playback -> web client + media storage layer.
- Scoring/progression/levels/stages -> scoring package + progress persistence.
- Weekly review dashboard -> analytics package + worker-generated summaries.
