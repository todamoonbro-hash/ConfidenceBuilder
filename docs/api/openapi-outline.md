# API Outline (v1)

## Health
- `GET /health`

## Training
- `GET /v1/training/daily-plan`
- `POST /v1/training/sessions`
- `GET /v1/training/sessions/:sessionId`

## Runtime (realtime)
- `WS /v1/runtime/sessions/:sessionId`

## Progress
- `GET /v1/progress/skills`
- `GET /v1/progress/weekly-review`
