# TEST_PLAN.md

## MVP Test Strategy
Focus on fast, high-signal tests that protect the core coaching loop.

## 1) Unit Tests
- `packages/scoring`: score calculation and weighting edge cases
- `packages/curriculum`: daily plan generation rules
- `packages/config`: env parsing and defaults

## 2) API Integration Tests
- Auth flow: signup/login/me
- Session flow: create daily plan → create session → create attempt
- Progress flow: summary and weekly review endpoints
- Error cases: missing audio key, invalid session id, AI provider timeout

## 3) AI Contract Tests
- Validate feedback output shape and required sections
- Ensure only one priority fix is produced
- Check transcript-specific observation presence
- Verify safety escalation branch for distress signals

## 4) End-to-End (Web)
- User onboarding and goal selection
- Complete one daily session with at least 3 drills
- View feedback, retry once, and confirm history entry

## 5) Manual Verification Checklist (Phase 0/1)
- Can run web/api/worker locally
- Can create session and post attempt
- Can persist transcript + feedback + scores
- Weekly review can be generated and displayed

## 6) Manual Verification Checklist (Phase 5: Voice Recording)

### Desktop (Chrome/Safari/Edge)
- Open `/session` on the web app and confirm Start/Stop controls are visible and usable with mouse/keyboard.
- Click **Start recording** and grant microphone permission when prompted.
- Speak for ~5 seconds, click **Stop recording**, and verify:
  - playback control renders and can replay captured audio
  - duration updates from `00:00` to a non-zero value
  - saved attempt message appears with an attempt id
- Refresh `/session`, record again, and ensure a new recording still saves successfully.
- Deny microphone permission and verify a clean error message is shown with recovery guidance.

### Mobile (iOS Safari + Android Chrome)
- Open `/session` on device (or responsive simulator), verify controls are large enough for touch.
- Start recording, allow microphone access, stop after a short clip, then replay audio via native control.
- Confirm duration is shown and attempt save confirmation appears.
- Repeat with microphone permission denied and verify permission error is clear and non-blocking.

## Exit Criteria for MVP Beta
- Core session loop works end-to-end
- Feedback format follows AI contract consistently
- Dashboard displays meaningful trend data for at least 7 days
- No critical security/privacy issues in basic review
