# API_DESIGN.md

## API Style
- REST JSON for MVP
- Versioned routes: `/api/v1/*`
- Auth: session cookie or bearer token

## Endpoints

### Auth & Profile
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/me`
- `PATCH /api/v1/me`

### Session Planning
- `POST /api/v1/sessions/daily-plan`
  - Returns drill sequence for today
- `POST /api/v1/sessions`
  - Create planned session
- `GET /api/v1/sessions/:sessionId`

### Drill Attempts
- `POST /api/v1/drills/:drillId/attempts/upload-url`
  - Returns presigned upload URL
- `POST /api/v1/drills/:drillId/attempts`
  - Finalize attempt with audio key
  - Triggers transcript + feedback pipeline
- `GET /api/v1/attempts/:attemptId`
  - Returns transcript, feedback, scores

### Progress
- `GET /api/v1/progress/summary`
- `GET /api/v1/progress/history`
- `GET /api/v1/reviews/weekly?weekStart=YYYY-MM-DD`

## Feedback Response Contract (MVP)
```json
{
  "whatWorked": "string",
  "whatWeakened": "string",
  "priorityFix": "string",
  "retryInstruction": "string",
  "scores": {
    "confidence": { "value": 0, "reason": "", "nextDrill": "" },
    "clarity": { "value": 0, "reason": "", "nextDrill": "" }
  }
}
```

## Error Handling
- Standard format:
```json
{ "error": { "code": "string", "message": "string" } }
```
- AI failures should return retryable status and keep user attempt record.
