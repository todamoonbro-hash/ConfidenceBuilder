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

let snapshot: DatabaseSnapshot = createSeedSnapshot();

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

export function resetDatabaseFromSeed(): DatabaseSnapshot {
  snapshot = createSeedSnapshot();
  return snapshot;
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

  return { preference, profile };
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
  return staged;
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

  return progress;
}

export function getActiveQuestByUser(userId: string): { quest?: Quest; progress?: UserQuestProgress } {
  const progress = snapshot.userQuestProgress.find((item) => item.userId === userId && item.status === "active");
  const quest = progress ? snapshot.quests.find((item) => item.id === progress.questId) : undefined;
  return { quest, progress };
}

export function saveUserQuestProgress(updatedProgress: UserQuestProgress): UserQuestProgress {
  snapshot.userQuestProgress = [...snapshot.userQuestProgress.filter((item) => item.id !== updatedProgress.id), updatedProgress];
  return updatedProgress;
}

export function saveUnlockedBadges(newBadges: UserBadge[]): UserBadge[] {
  snapshot.userBadges = [...snapshot.userBadges, ...newBadges];
  return newBadges;
}

type SaveRecordingPayload = {
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

  return { attempt, recording };
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
  return transcript;
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
  return feedback;
}

export function saveScoreForAttempt(payload: Omit<Score, "id">): Score {
  const existing = snapshot.scores.find((item) => item.attemptId === payload.attemptId);
  const score: Score = existing
    ? { ...existing, ...payload }
    : { id: `score_${String(snapshot.scores.length + 1).padStart(3, "0")}`, ...payload };

  snapshot.scores = [...snapshot.scores.filter((item) => item.attemptId !== payload.attemptId), score];
  return score;
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
  return profile;
}

export function getModelPreferences(): ModelPreference[] {
  return snapshot.modelPreferences;
}

export function getModelPreferenceForTask(task: ModelPreference["task"]): ModelPreference | undefined {
  return snapshot.modelPreferences.find((item) => item.task === task && item.enabled);
}

export function saveModelPreferences(preferences: ModelPreference[]): ModelPreference[] {
  snapshot.modelPreferences = preferences;
  return snapshot.modelPreferences;
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
  return memory;
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
  return messageSet;
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
    transcriptPlaceholder: "Transcript placeholder: transcription pipeline not wired for boss mode yet.",
    scoringPlaceholder: "Scoring placeholder: feedback engine hook pending.",
    outcome: "in_progress",
    xpGranted: 0
  };

  snapshot.bossChallengeAttempts.push(attempt);
  return attempt;
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

  return updated;
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
