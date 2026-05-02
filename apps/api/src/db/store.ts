import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

import type {
  Attempt,
  RecordingMetadata,
  DatabaseSnapshot,
  GameProgress,
  OnboardingPreferences,
  Quest,
  QuestStatus,
  Score,
  TrainingProfile,
  MediaKeyMessageSet,
  UserBadge,
  UserQuestProgress,
  BossChallengeAttempt,
  Transcript,
  FeedbackItem,
  ModelPreference,
  PersonalCoachProfile,
  SessionMemory,
  SkillBranch
} from "./types";

import { createSeedSnapshot } from "./seed-data";
import { computeStageProgression } from "../services/stage-progression-service";

const persistenceDisabled =
  process.env.CONFIDENCEBUILDER_DISABLE_PERSISTENCE === "true" ||
  process.env.npm_lifecycle_event === "test" ||
  process.argv.some((arg) => arg.endsWith(".test.mjs"));
const databaseFilePath = resolve(process.cwd(), process.env.DB_FILE_PATH ?? ".data/confidencebuilder-db.json");

function loadInitialSnapshot(): DatabaseSnapshot {
  if (persistenceDisabled || !existsSync(databaseFilePath)) {
    return createSeedSnapshot();
  }

  try {
    return JSON.parse(readFileSync(databaseFilePath, "utf-8")) as DatabaseSnapshot;
  } catch {
    return createSeedSnapshot();
  }
}

let snapshot: DatabaseSnapshot = loadInitialSnapshot();

// Single-process write serialization. Concurrent commit() calls would otherwise interleave their
// JSON.stringify of the in-memory snapshot with each other's mutations. We serialize through a Promise
// chain so each persist completes before the next starts, and we always serialize the LATEST snapshot
// at write time (not at enqueue time).
let writeQueue: Promise<void> = Promise.resolve();
let pendingDirty = false;

function flushSnapshot(): void {
  if (persistenceDisabled) return;
  mkdirSync(dirname(databaseFilePath), { recursive: true });
  const temporaryPath = `${databaseFilePath}.tmp.${process.pid}`;
  // Serialize at flush time so if N commits coalesce into one flush, the on-disk file reflects the
  // final post-mutation state — never an intermediate one.
  writeFileSync(temporaryPath, JSON.stringify(snapshot, null, 2));
  renameSync(temporaryPath, databaseFilePath);
}

function persistSnapshot(): void {
  if (persistenceDisabled) return;
  pendingDirty = true;
  writeQueue = writeQueue
    .then(() => {
      if (!pendingDirty) return;
      pendingDirty = false;
      flushSnapshot();
    })
    .catch(() => {
      // Reset queue on error so subsequent writes can still proceed.
      pendingDirty = true;
    });
}

function commit<T>(value: T): T {
  persistSnapshot();
  return value;
}

// Test / shutdown hook — wait for any in-flight persist to complete.
export async function flushPendingPersistence(): Promise<void> {
  await writeQueue;
}

function generateTrainingProfile(preference: OnboardingPreferences): TrainingProfile {
  const levelBand = preference.confidenceLevel <= 3 ? "foundation" : preference.confidenceLevel <= 7 ? "growth" : "performance";

  const recommendedModulesByGoal: Record<OnboardingPreferences["mainGoal"], TrainingProfile["recommendedModules"]> = {
    confidence: ["articulation", "impromptu", "public_speaking"],
    public_speaking: ["public_speaking", "impromptu", "executive_communication"],
    articulation: ["articulation", "read_aloud", "public_speaking"],
    reading_aloud: ["read_aloud", "articulation", "listening_response"],
    interviews: ["impromptu", "interview", "executive_communication"],
    executive_presence: ["executive_communication", "public_speaking", "impromptu"],
    listening: ["listening_response", "impromptu", "executive_communication"]
  };

  return {
    id: `profile_${preference.id}`,
    userId: preference.userId,
    levelBand,
    weeklyFocus: `Primary focus: ${preference.mainGoal.replace("_", " ")}.`,
    recommendedModules: recommendedModulesByGoal[preference.mainGoal],
    dailyMinutes: preference.preferredSessionLength,
    generatedFromPreferenceId: preference.id,
    updatedAt: new Date().toISOString()
  };
}

export function getDatabase(): DatabaseSnapshot {
  return snapshot;
}

export function getPersistenceStatus() {
  return {
    enabled: !persistenceDisabled,
    path: persistenceDisabled ? null : databaseFilePath
  };
}

export function resetDatabaseFromSeed(): DatabaseSnapshot {
  snapshot = createSeedSnapshot();
  return commit(snapshot);
}

export function saveOnboardingPreferences(
  payload: Omit<OnboardingPreferences, "id" | "createdAt" | "updatedAt">
): { preference: OnboardingPreferences; profile: TrainingProfile } {
  const timestamp = new Date().toISOString();
  const existing = snapshot.onboardingPreferences.find((item) => item.userId === payload.userId);

  const preference: OnboardingPreferences = existing
    ? { ...existing, ...payload, updatedAt: timestamp }
    : { id: `pref_${snapshot.onboardingPreferences.length + 1}`, ...payload, createdAt: timestamp, updatedAt: timestamp };

  snapshot.onboardingPreferences = [...snapshot.onboardingPreferences.filter((item) => item.userId !== payload.userId), preference];

  const profile = generateTrainingProfile(preference);
  snapshot.trainingProfiles = [...snapshot.trainingProfiles.filter((item) => item.userId !== payload.userId), profile];

  if (!snapshot.gameProgressions.find((item) => item.userId === payload.userId)) {
    snapshot.gameProgressions.push({
      id: `gp_${snapshot.gameProgressions.length + 1}`,
      userId: payload.userId,
      overallXp: 0,
      level: 1,
      streakDays: 0,
      currentDifficulty: "Easy",
      skillXp: {
        confidence: 0,
        articulation: 0,
        reading: 0,
        impromptu: 0,
        listening: 0,
        executive: 0,
        media: 0,
        presentation: 0,
        storytelling: 0,
        persuasion: 0
      },
      recentPerformanceScores: []
    });
  }

  return commit({ preference, profile });
}

export function getTrainingProfileByUser(userId: string) {
  return {
    preference: snapshot.onboardingPreferences.find((item) => item.userId === userId),
    profile: snapshot.trainingProfiles.find((item) => item.userId === userId)
  };
}

export function getGameProgressByUser(userId: string): GameProgress | undefined {
  return snapshot.gameProgressions.find((item) => item.userId === userId);
}

export function saveGameProgress(progress: GameProgress): GameProgress {
  const staged = computeStageProgression(snapshot, progress);
  snapshot.gameProgressions = [...snapshot.gameProgressions.filter((item) => item.userId !== progress.userId), staged];
  return commit(staged);
}

export function getQuestStatusForUser(userId: string): Array<{ quest: Quest; status: QuestStatus; progress?: UserQuestProgress }> {
  const userProgress = snapshot.userQuestProgress.filter((item) => item.userId === userId);
  const level = getGameProgressByUser(userId)?.level ?? 1;

  return snapshot.quests.map((quest) => {
    const progress = userProgress.find((item) => item.questId === quest.id);

    if (progress) {
      return { quest, status: progress.status, progress };
    }

    return {
      quest,
      status: level >= quest.minLevel ? "paused" : "locked"
    };
  });
}

export function startQuest(userId: string, questId: string): UserQuestProgress | undefined {
  const quest = snapshot.quests.find((item) => item.id === questId);
  const level = getGameProgressByUser(userId)?.level ?? 1;

  if (!quest || level < quest.minLevel) {
    return undefined;
  }

  snapshot.userQuestProgress = snapshot.userQuestProgress.map((item) =>
    item.userId === userId && item.status === "active" ? { ...item, status: "paused" } : item
  );

  const existing = snapshot.userQuestProgress.find((item) => item.userId === userId && item.questId === questId);

  const progress: UserQuestProgress = existing
    ? { ...existing, status: "active" }
    : {
        id: `uqp_${snapshot.userQuestProgress.length + 1}`,
        userId,
        questId,
        status: "active",
        currentStepIndex: 0,
        completedStepIds: [],
        startedAt: new Date().toISOString()
      };

  snapshot.userQuestProgress = [...snapshot.userQuestProgress.filter((item) => item.id !== progress.id), progress];

  return commit(progress);
}

export function getActiveQuestByUser(userId: string): { quest?: Quest; progress?: UserQuestProgress } {
  const progress = snapshot.userQuestProgress.find((item) => item.userId === userId && item.status === "active");
  const quest = progress ? snapshot.quests.find((item) => item.id === progress.questId) : undefined;
  return { quest, progress };
}

export function saveUserQuestProgress(updatedProgress: UserQuestProgress): UserQuestProgress {
  snapshot.userQuestProgress = [...snapshot.userQuestProgress.filter((item) => item.id !== updatedProgress.id), updatedProgress];
  return commit(updatedProgress);
}

export function saveUnlockedBadges(newBadges: UserBadge[]): UserBadge[] {
  snapshot.userBadges = [...snapshot.userBadges, ...newBadges];
  return commit(newBadges);
}

type SaveRecordingPayload = {
  userId?: string;
  attemptId?: string;
  sessionId: string;
  exerciseId: string;
  durationSeconds: number;
  mimeType: string;
  blobSizeBytes: number;
  startedAt: string;
  stoppedAt: string;
};

export function saveRecordingForAttempt(payload: SaveRecordingPayload): { attempt: Attempt; recording: RecordingMetadata } {
  if (payload.userId && !snapshot.trainingSessions.some((item) => item.id === payload.sessionId)) {
    snapshot.trainingSessions.push({
      id: payload.sessionId,
      userId: payload.userId,
      dailyPlanId: `ad_hoc_${payload.userId}`,
      startedAt: payload.startedAt,
      completedAt: payload.stoppedAt,
      status: "completed"
    });
  }

  const existingAttempt = payload.attemptId ? snapshot.attempts.find((item) => item.id === payload.attemptId) : undefined;

  const attempt: Attempt = existingAttempt ?? {
    id: `att_${String(snapshot.attempts.length + 1).padStart(3, "0")}`,
    sessionId: payload.sessionId,
    exerciseId: payload.exerciseId,
    createdAt: payload.stoppedAt,
    durationSeconds: payload.durationSeconds
  };

  if (existingAttempt) {
    snapshot.attempts = snapshot.attempts.map((item) =>
      item.id === existingAttempt.id ? { ...item, durationSeconds: payload.durationSeconds } : item
    );
  } else {
    snapshot.attempts.push(attempt);
  }

  const recording: RecordingMetadata = {
    id: `rec_${String(snapshot.recordings.length + 1).padStart(3, "0")}`,
    attemptId: attempt.id,
    sessionId: payload.sessionId,
    exerciseId: payload.exerciseId,
    mimeType: payload.mimeType,
    blobSizeBytes: payload.blobSizeBytes,
    durationSeconds: payload.durationSeconds,
    startedAt: payload.startedAt,
    stoppedAt: payload.stoppedAt,
    createdAt: new Date().toISOString()
  };

  snapshot.recordings.push(recording);

  return commit({ attempt, recording });
}

export function getAttemptHistoryByUser(userId: string, limit = 20) {
  const sessionIds = new Set(snapshot.trainingSessions.filter((session) => session.userId === userId).map((session) => session.id));

  return snapshot.attempts
    .filter((attempt) => sessionIds.has(attempt.sessionId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map((attempt) => {
      const exercise = snapshot.exercises.find((item) => item.id === attempt.exerciseId);
      const transcript = snapshot.transcripts.find((item) => item.attemptId === attempt.id);
      const score = snapshot.scores.find((item) => item.attemptId === attempt.id);
      const feedback = snapshot.feedbackItems.find((item) => item.attemptId === attempt.id);
      const recording = snapshot.recordings.find((item) => item.attemptId === attempt.id);

      return {
        attempt,
        exercise,
        transcript,
        score,
        feedback,
        recording
      };
    });
}

export function saveTranscriptForAttempt(payload: { attemptId: string; content: string }): Transcript {
  const existing = snapshot.transcripts.find((item) => item.attemptId === payload.attemptId);
  const wordCount = payload.content.trim().length === 0 ? 0 : payload.content.trim().split(/\s+/).length;

  const transcript: Transcript = existing
    ? {
        ...existing,
        content: payload.content,
        wordCount
      }
    : {
        id: `tr_${String(snapshot.transcripts.length + 1).padStart(3, "0")}`,
        attemptId: payload.attemptId,
        content: payload.content,
        wordCount
      };

  snapshot.transcripts = [...snapshot.transcripts.filter((item) => item.attemptId !== payload.attemptId), transcript];
  return commit(transcript);
}

export function getAttemptById(attemptId: string): Attempt | undefined {
  return snapshot.attempts.find((item) => item.id === attemptId);
}

export function getTranscriptByAttemptId(attemptId: string): Transcript | undefined {
  return snapshot.transcripts.find((item) => item.attemptId === attemptId);
}

export function saveFeedbackForAttempt(payload: Omit<FeedbackItem, "id">): FeedbackItem {
  const existing = snapshot.feedbackItems.find((item) => item.attemptId === payload.attemptId);
  const feedback: FeedbackItem = existing
    ? { ...existing, ...payload }
    : { id: `fb_${String(snapshot.feedbackItems.length + 1).padStart(3, "0")}`, ...payload };

  snapshot.feedbackItems = [...snapshot.feedbackItems.filter((item) => item.attemptId !== payload.attemptId), feedback];
  return commit(feedback);
}

export function saveScoreForAttempt(payload: Omit<Score, "id">): Score {
  const existing = snapshot.scores.find((item) => item.attemptId === payload.attemptId);
  const score: Score = existing
    ? { ...existing, ...payload }
    : { id: `score_${String(snapshot.scores.length + 1).padStart(3, "0")}`, ...payload };

  snapshot.scores = [...snapshot.scores.filter((item) => item.attemptId !== payload.attemptId), score];
  return commit(score);
}

export function getPersonalCoachProfileByUser(userId: string): PersonalCoachProfile | undefined {
  return snapshot.personalCoachProfiles.find((item) => item.userId === userId);
}

export function savePersonalCoachProfile(payload: Omit<PersonalCoachProfile, "id" | "updatedAt">): PersonalCoachProfile {
  const existing = getPersonalCoachProfileByUser(payload.userId);
  const profile: PersonalCoachProfile = {
    id: existing?.id ?? `pcp_${String(snapshot.personalCoachProfiles.length + 1).padStart(3, "0")}`,
    ...payload,
    updatedAt: new Date().toISOString()
  };

  snapshot.personalCoachProfiles = [...snapshot.personalCoachProfiles.filter((item) => item.userId !== payload.userId), profile];
  return commit(profile);
}

export function getModelPreferences(): ModelPreference[] {
  return snapshot.modelPreferences;
}

export function getModelPreferenceForTask(task: ModelPreference["task"]): ModelPreference | undefined {
  return snapshot.modelPreferences.find((item) => item.task === task && item.enabled);
}

export function saveModelPreferences(preferences: ModelPreference[]): ModelPreference[] {
  snapshot.modelPreferences = preferences;
  return commit(snapshot.modelPreferences);
}

export function getSessionMemoriesByUser(userId: string, limit = 8): SessionMemory[] {
  return snapshot.sessionMemories
    .filter((item) => item.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export function saveSessionMemory(payload: {
  userId: string;
  attemptId?: string;
  skillBranch: SkillBranch;
  situation: string;
  modelProvider?: SessionMemory["modelProvider"];
  modelName?: string;
  transcriptSummary: string;
  observedWeakness: string;
  priorityFix: string;
  nextDrill: string;
  scoreTotal?: number;
}): SessionMemory {
  const memory: SessionMemory = {
    id: `mem_${String(snapshot.sessionMemories.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    ...payload
  };

  snapshot.sessionMemories = [memory, ...snapshot.sessionMemories].slice(0, 100);
  return commit(memory);
}

export function getMediaKeyMessagesByUser(userId: string): MediaKeyMessageSet | undefined {
  return snapshot.mediaKeyMessageSets.find((item) => item.userId === userId);
}

export function saveMediaKeyMessages(payload: { userId: string; messages: string[] }): MediaKeyMessageSet {
  const existing = getMediaKeyMessagesByUser(payload.userId);
  const messageSet: MediaKeyMessageSet = existing
    ? {
        ...existing,
        messages: payload.messages.slice(0, 4),
        updatedAt: new Date().toISOString()
      }
    : {
        id: `media_msgs_${String(snapshot.mediaKeyMessageSets.length + 1).padStart(3, "0")}`,
        userId: payload.userId,
        messages: payload.messages.slice(0, 4),
        updatedAt: new Date().toISOString()
      };

  snapshot.mediaKeyMessageSets = [...snapshot.mediaKeyMessageSets.filter((item) => item.userId !== payload.userId), messageSet];
  return commit(messageSet);
}



export function getBossChallengesForUser(userId: string) {
  const level = getGameProgressByUser(userId)?.level ?? 1;

  return snapshot.weeklyBossChallenges.map((challenge) => {
    const latestAttempt = snapshot.bossChallengeAttempts
      .filter((attempt) => attempt.userId === userId && attempt.challengeId === challenge.id)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];

    return {
      challenge,
      locked: level < challenge.requiredLevel,
      latestAttempt
    };
  });
}

export function startBossChallenge(userId: string, challengeId: string): BossChallengeAttempt | undefined {
  const challenge = snapshot.weeklyBossChallenges.find((item) => item.id === challengeId);
  const level = getGameProgressByUser(userId)?.level ?? 1;

  if (!challenge || level < challenge.requiredLevel) {
    return undefined;
  }

  const attempt: BossChallengeAttempt = {
    id: `boss_attempt_${snapshot.bossChallengeAttempts.length + 1}`,
    challengeId,
    userId,
    sessionId: `boss_session_${snapshot.bossChallengeAttempts.length + 1}`,
    attemptId: `boss_audio_${snapshot.bossChallengeAttempts.length + 1}`,
    startedAt: new Date().toISOString(),
    transcript: "",
    scoringNote: "Boss challenge scoring uses the submitted performance score until transcript-based scoring is available.",
    outcome: "in_progress",
    xpGranted: 0
  };

  snapshot.bossChallengeAttempts.push(attempt);
  return commit(attempt);
}

export function completeBossChallenge(attemptId: string, performanceScore: number): BossChallengeAttempt | undefined {
  const attempt = snapshot.bossChallengeAttempts.find((item) => item.id === attemptId);
  if (!attempt) {
    return undefined;
  }

  const challenge = snapshot.weeklyBossChallenges.find((item) => item.id === attempt.challengeId);
  if (!challenge) {
    return undefined;
  }

  const outcome = performanceScore >= 75 ? "pass" : performanceScore >= 60 ? "complete" : "improve";
  const xpGranted = outcome === "pass" ? challenge.rewardXp : Math.round(challenge.rewardXp * 0.6);

  const updated: BossChallengeAttempt = {
    ...attempt,
    completedAt: new Date().toISOString(),
    outcome,
    xpGranted
  };

  snapshot.bossChallengeAttempts = snapshot.bossChallengeAttempts.map((item) => (item.id === attemptId ? updated : item));

  const progress = getGameProgressByUser(attempt.userId);
  if (progress) {
    saveGameProgress({ ...progress, overallXp: progress.overallXp + xpGranted });
  }

  return commit(updated);
}

export function getOverview() {
  const db = getDatabase();
  return {
    users: db.users.length,
    goals: db.goals.length,
    onboardingPreferences: db.onboardingPreferences.length,
    gameProgressions: db.gameProgressions.length,
    trainingProfiles: db.trainingProfiles.length,
    trainingLevels: db.trainingLevels.length,
    trainingSessions: db.trainingSessions.length,
    exercises: db.exercises.length,
    attempts: db.attempts.length,
    recordings: db.recordings.length,
    transcripts: db.transcripts.length,
    scores: db.scores.length,
    dailyPlans: db.dailyPlans.length,
    weeklyPlans: db.weeklyPlans.length,
    feedbackItems: db.feedbackItems.length,
    badges: db.badges.length,
    quests: db.quests.length,
    dailyMissions: db.dailyMissions.length,
    weeklyBossChallenges: db.weeklyBossChallenges.length,
    bossChallengeAttempts: db.bossChallengeAttempts.length
  };
}

// Account hygiene — GDPR/CCPA basics. Export gathers everything we have on a user; delete purges it.
export function exportUserData(userId: string): {
  exportedAt: string;
  userId: string;
  data: Record<string, unknown[]>;
} {
  const db = snapshot;
  const sessionIds = new Set(db.trainingSessions.filter((item) => item.userId === userId).map((item) => item.id));
  const userAttempts = db.attempts.filter((item) => sessionIds.has(item.sessionId));
  const userAttemptIds = new Set(userAttempts.map((item) => item.id));

  return {
    exportedAt: new Date().toISOString(),
    userId,
    data: {
      onboardingPreferences: db.onboardingPreferences.filter((item) => item.userId === userId),
      trainingProfiles: db.trainingProfiles.filter((item) => item.userId === userId),
      gameProgressions: db.gameProgressions.filter((item) => item.userId === userId),
      personalCoachProfiles: db.personalCoachProfiles.filter((item) => item.userId === userId),
      sessionMemories: db.sessionMemories.filter((item) => item.userId === userId),
      mediaKeyMessageSets: db.mediaKeyMessageSets.filter((item) => item.userId === userId),
      userBadges: db.userBadges.filter((item) => item.userId === userId),
      userQuestProgress: db.userQuestProgress.filter((item) => item.userId === userId),
      userDailyMissionProgress: db.userDailyMissionProgress.filter((item) => item.userId === userId),
      bossChallengeAttempts: db.bossChallengeAttempts.filter((item) => item.userId === userId),
      goals: db.goals.filter((item) => item.userId === userId),
      trainingSessions: db.trainingSessions.filter((item) => item.userId === userId),
      attempts: userAttempts,
      transcripts: db.transcripts.filter((item) => userAttemptIds.has(item.attemptId)),
      feedbackItems: db.feedbackItems.filter((item) => userAttemptIds.has(item.attemptId)),
      scores: db.scores.filter((item) => userAttemptIds.has(item.attemptId)),
      recordings: db.recordings.filter((item) => userAttemptIds.has(item.attemptId))
    }
  };
}

export function deleteUserData(userId: string): { deletedAt: string; userId: string; counts: Record<string, number> } {
  const db = snapshot;
  const sessionIds = new Set(db.trainingSessions.filter((item) => item.userId === userId).map((item) => item.id));
  const attemptIds = new Set(db.attempts.filter((item) => sessionIds.has(item.sessionId)).map((item) => item.id));

  const counts = {
    onboardingPreferences: db.onboardingPreferences.filter((item) => item.userId === userId).length,
    trainingProfiles: db.trainingProfiles.filter((item) => item.userId === userId).length,
    gameProgressions: db.gameProgressions.filter((item) => item.userId === userId).length,
    personalCoachProfiles: db.personalCoachProfiles.filter((item) => item.userId === userId).length,
    sessionMemories: db.sessionMemories.filter((item) => item.userId === userId).length,
    mediaKeyMessageSets: db.mediaKeyMessageSets.filter((item) => item.userId === userId).length,
    userBadges: db.userBadges.filter((item) => item.userId === userId).length,
    userQuestProgress: db.userQuestProgress.filter((item) => item.userId === userId).length,
    userDailyMissionProgress: db.userDailyMissionProgress.filter((item) => item.userId === userId).length,
    bossChallengeAttempts: db.bossChallengeAttempts.filter((item) => item.userId === userId).length,
    goals: db.goals.filter((item) => item.userId === userId).length,
    trainingSessions: sessionIds.size,
    attempts: attemptIds.size,
    transcripts: db.transcripts.filter((item) => attemptIds.has(item.attemptId)).length,
    feedbackItems: db.feedbackItems.filter((item) => attemptIds.has(item.attemptId)).length,
    scores: db.scores.filter((item) => attemptIds.has(item.attemptId)).length,
    recordings: db.recordings.filter((item) => attemptIds.has(item.attemptId)).length
  };

  snapshot.onboardingPreferences = db.onboardingPreferences.filter((item) => item.userId !== userId);
  snapshot.trainingProfiles = db.trainingProfiles.filter((item) => item.userId !== userId);
  snapshot.gameProgressions = db.gameProgressions.filter((item) => item.userId !== userId);
  snapshot.personalCoachProfiles = db.personalCoachProfiles.filter((item) => item.userId !== userId);
  snapshot.sessionMemories = db.sessionMemories.filter((item) => item.userId !== userId);
  snapshot.mediaKeyMessageSets = db.mediaKeyMessageSets.filter((item) => item.userId !== userId);
  snapshot.userBadges = db.userBadges.filter((item) => item.userId !== userId);
  snapshot.userQuestProgress = db.userQuestProgress.filter((item) => item.userId !== userId);
  snapshot.userDailyMissionProgress = db.userDailyMissionProgress.filter((item) => item.userId !== userId);
  snapshot.bossChallengeAttempts = db.bossChallengeAttempts.filter((item) => item.userId !== userId);
  snapshot.goals = db.goals.filter((item) => item.userId !== userId);
  snapshot.trainingSessions = db.trainingSessions.filter((item) => item.userId !== userId);
  snapshot.attempts = db.attempts.filter((item) => !attemptIds.has(item.id));
  snapshot.transcripts = db.transcripts.filter((item) => !attemptIds.has(item.attemptId));
  snapshot.feedbackItems = db.feedbackItems.filter((item) => !attemptIds.has(item.attemptId));
  snapshot.scores = db.scores.filter((item) => !attemptIds.has(item.attemptId));
  snapshot.recordings = db.recordings.filter((item) => !attemptIds.has(item.attemptId));

  persistSnapshot();
  return { deletedAt: new Date().toISOString(), userId, counts };
}
