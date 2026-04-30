import assert from "node:assert/strict";

import { getAttemptHistoryByUser, saveRecordingForAttempt } from "../dist/db/store.js";

const userId = "history_user";
const sessionId = "history_session_001";
const exerciseId = "ex_art_001";
const stoppedAt = new Date().toISOString();
const startedAt = new Date(Date.now() - 30_000).toISOString();

const saved = saveRecordingForAttempt({
  userId,
  sessionId,
  exerciseId,
  durationSeconds: 30,
  mimeType: "audio/webm",
  blobSizeBytes: 2048,
  startedAt,
  stoppedAt
});

const history = getAttemptHistoryByUser(userId, 10);

assert.equal(history.length, 1);
assert.equal(history[0].attempt.id, saved.attempt.id);
assert.equal(history[0].attempt.sessionId, sessionId);
assert.equal(history[0].exercise?.id, exerciseId);

console.log("history persistence wiring ok");
