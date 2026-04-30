import { createHash, timingSafeEqual } from "node:crypto";
import Fastify from "fastify";

import {
  getActiveQuestByUser,
  getDatabase,
  getAttemptHistoryByUser,
  getGameProgressByUser,
  getMediaKeyMessagesByUser,
  getModelPreferenceForTask,
  getModelPreferences,
  getOverview,
  getPersistenceStatus,
  getPersonalCoachProfileByUser,
  getQuestStatusForUser,
  getSessionMemoriesByUser,
  getTranscriptByAttemptId,
  getTrainingProfileByUser,
  getAttemptById,
  saveGameProgress,
  saveFeedbackForAttempt,
  saveMediaKeyMessages,
  saveModelPreferences,
  saveOnboardingPreferences,
  savePersonalCoachProfile,
  saveRecordingForAttempt,
  saveScoreForAttempt,
  saveSessionMemory,
  saveTranscriptForAttempt,
  saveUnlockedBadges,
  saveUserQuestProgress,
  startQuest
} from "./db/store";
import type { AiTaskType, CostMode, LlmProvider, ModelPreference, OnboardingPreferences, SkillBranch } from "./db/types";
import { findUnlockableBadges } from "./services/badge-unlock-service";
import { scoreArticulationHeuristic } from "./services/articulation-heuristic-service";
import { findArticulationDrill, listArticulationDrills } from "./services/articulation-drills-service";
import { adjustDifficulty } from "./services/difficulty-adjustment-service";
import { evaluateCrisisAnswer, startCrisisSimulation } from "./services/crisis-simulator-service";
import { buildDashboardInsights } from "./services/dashboard-insights-service";
import { evaluateExecutiveResponse, startExecutiveSimulation } from "./services/executive-simulations-service";
import { generateAiFeedback } from "./services/feedback-engine-service";
import { evaluateImpromptuAnswer, startImpromptuPrompt } from "./services/impromptu-speaking-lab-service";
import { applyXpToProgress, updateStreak } from "./services/level-progression-service";
import { generatePitchVariants } from "./services/sales-pitch-builder-service";
import { getCertificationTracks, getTeamTrainingOverview } from "./services/sales-team-training-service";
import { listSalesInfluenceLibrary, startSalesRoleplaySession, appendSalesRoleplayTurn, endSalesRoleplaySession, saveToPitchBank, listPitchBank } from "./services/sales-roleplay-service";
import { evaluateListeningResponse, startListeningDrill } from "./services/listening-response-lab-service";
import { evaluateReadAloudAttempt, findReadingPassage, listReadingPassages } from "./services/reading-aloud-lab-service";
import { appendRealtimeTurn, endRealtimeCoachSession, startRealtimeCoachSession } from "./services/realtime-voice-coach-service";
import { findMediaDrill, listMediaDrills } from "./services/media-drills-service";
import { scoreMediaHeuristic } from "./services/media-heuristic-service";
import { advanceQuestStep } from "./services/quest-progress-service";
import { scoreSoundbitePractice, transformToSoundbites } from "./services/soundbite-messaging-service";
import { transcribeAudio } from "./services/transcription-service";
import { generateAdaptiveDailyPlan } from "./services/training-plan-generator-service";
import { calculateXpRewards } from "./services/xp-calculation-service";
import { INTERVIEW_BADGES, INTERVIEW_CONFIDENCE_DRILLS, INTERVIEW_FRAMEWORKS, INTERVIEW_QUESTIONS } from "./services/interview-data-service";
import { INTERVIEW_PROMPTS } from "./services/interview-prompts-service";
import { startInterviewSession, appendInterviewTurn, endInterviewSession, listInterviewModes } from "./services/interview-mock-engine-service";
import { saveRoleSetup, getRoleSetup, generateRoleInsights, addStory, listStories, buildAnswerVariants, generatePositioning, generateInterviewPlan, submitPostInterviewReflection } from "./services/interview-prep-service";
import { EXECUTIVE_BADGES, EXECUTIVE_DRILLS, EXECUTIVE_FRAMEWORKS, EXECUTIVE_SCENARIOS, EXECUTIVE_SUBSECTIONS } from "./services/executive-presence-data-service";
import { startExecutivePresenceSession, appendExecutivePresenceTurn, endExecutivePresenceSession } from "./services/executive-presence-engine-service";
import { DIFFICULT_BADGES, DIFFICULT_FRAMEWORKS, DIFFICULT_SCENARIOS, DIFFICULT_SUBSECTIONS, PERSONA_STYLES, TONE_TARGETS } from "./services/difficult-conversations-data-service";
import { startDifficultConversationSession, appendDifficultConversationTurn, endDifficultConversationSession } from "./services/difficult-conversations-engine-service";
import { NETWORKING_BADGES, NETWORKING_FRAMEWORKS, NETWORKING_PERSONAS, NETWORKING_SCENARIOS, NETWORKING_SUBSECTIONS } from "./services/networking-data-service";
import { startNetworkingSession, appendNetworkingTurn, endNetworkingSession } from "./services/networking-engine-service";
import { buildAdaptiveCoachOverview } from "./services/adaptive-coach-service";
import { createScenarioDefinition, duplicateScenarioDefinition, listPublishedScenarioCards, listScenarioDefinitions, runScenarioAdminTest, setScenarioStatus, updateScenarioDefinition, validateScenario } from "./services/scenario-studio-service";





const DEFAULT_BODY_LIMIT_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = Number(process.env.MAX_AUDIO_BYTES ?? 8 * 1024 * 1024);
const VALID_LLM_PROVIDERS: LlmProvider[] = ["openai", "anthropic", "gemini", "deepseek", "mistral", "xai", "openrouter", "groq", "together", "fireworks", "local"];
const VALID_AI_TASKS: AiTaskType[] = ["realtimeCoach", "transcription", "tts", "feedback", "deepReview", "cheapScoring", "fallback"];
const VALID_COST_MODES: CostMode[] = ["lowest_cost", "balanced", "best_quality"];
const VALID_COACH_STRICTNESS = ["supportive", "balanced", "direct", "tough"] as const;

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((o) => o.trim());

// Simple in-memory rate limiter: max requests per window per IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 300);
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

const ALLOWED_MIME_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a"
]);

const app = Fastify({
  logger: true,
  bodyLimit: Number(process.env.MAX_JSON_BODY_BYTES ?? DEFAULT_BODY_LIMIT_BYTES)
});

// CORS
app.addHook("onRequest", async (request, reply) => {
  const origin = request.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    void reply.header("access-control-allow-origin", origin);
    void reply.header("access-control-allow-credentials", "true");
  }
  void reply.header("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  void reply.header("access-control-allow-headers", "content-type,x-admin-token");
  if (request.method === "OPTIONS") {
    return reply.status(204).send();
  }
});

// Rate limiting
app.addHook("onRequest", async (request, reply) => {
  const ip = request.ip ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return reply.status(429).send({ ok: false, error: "rate_limit_exceeded" });
    }
  }
});


function isValidOption<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function cleanText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanStringList(value: unknown, fallback: string[], limit: number) {
  const items = Array.isArray(value) ? value : fallback;
  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function timingSafeStringEqual(a: string, b: string): boolean {
  // Pad both to the same length using a hash so length itself isn't a timing oracle
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function isAdminRequest(request: { headers: Record<string, unknown> }) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) return false;
  const providedToken = String(request.headers["x-admin-token"] ?? "");
  if (!providedToken) return false;
  return timingSafeStringEqual(providedToken, configuredToken);
}

app.get("/health", async () => ({ status: "ok", service: "confidencebuilder-api", date: new Date().toISOString() }));

app.get("/v1/config/status", async () => ({
  ok: true,
  persistence: getPersistenceStatus(),
  providers: {
    openai: Boolean(process.env.OPENAI_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    mistral: Boolean(process.env.MISTRAL_API_KEY),
    xai: Boolean(process.env.XAI_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    together: Boolean(process.env.TOGETHER_API_KEY),
    fireworks: Boolean(process.env.FIREWORKS_API_KEY),
    anthropicCompat: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_OPENAI_COMPAT_BASE_URL),
    geminiCompat: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_OPENAI_COMPAT_BASE_URL),
    local: Boolean(process.env.LOCAL_LLM_BASE_URL)
  },
  voice: {
    transcriptionConfigured: Boolean(process.env.OPENAI_API_KEY),
    realtimeConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_REALTIME_MODEL)
  }
}));

app.get("/v1/quests/:userId", async (request) => {
  const params = request.params as { userId: string };
  return { ok: true, quests: getQuestStatusForUser(params.userId) };
});

app.post("/v1/quests/:questId/start", async (request) => {
  const params = request.params as { questId: string };
  const body = request.body as { userId: string };

  const started = startQuest(body.userId, params.questId);

  if (!started) {
    return { ok: false, error: "quest_locked_or_not_found" };
  }

  return { ok: true, progress: started };
});

app.get("/v1/training/adaptive-plan/:userId", async (request) => {
  const params = request.params as { userId: string };
  const progress = getGameProgressByUser(params.userId);

  if (!progress) {
    return { ok: false, error: "progress_not_found" };
  }

  const { quest, progress: questProgress } = getActiveQuestByUser(params.userId);
  const activeQuestStep = quest && questProgress ? quest.steps[questProgress.currentStepIndex] : undefined;

  const adaptivePlan = generateAdaptiveDailyPlan({
    userId: params.userId,
    today: new Date().toISOString().slice(0, 10),
    progress,
    activeQuestStep,
    activeMissions: getDatabase().userDailyMissionProgress.filter((item) => item.userId === params.userId)
  });

  saveGameProgress({ ...progress, currentDifficulty: adaptivePlan.difficulty });

  return { ok: true, plan: adaptivePlan, activeQuestStep };
});

app.post("/v1/training/complete-step", async (request) => {
  const body = request.body as {
    userId: string;
    skill: SkillBranch;
    exerciseId: string;
    performanceScore: number;
    completedAtDate: string;
  };

  const progress = getGameProgressByUser(body.userId);
  if (!progress) {
    return { ok: false, error: "progress_not_found" };
  }

  const nextDifficulty = adjustDifficulty(progress.currentDifficulty, [...progress.recentPerformanceScores, body.performanceScore]);
  const xpReward = calculateXpRewards(nextDifficulty, body.performanceScore, body.skill);

  let updatedProgress = applyXpToProgress(progress, xpReward.overallXp, xpReward.skillXp);
  updatedProgress = {
    ...updatedProgress,
    currentDifficulty: nextDifficulty,
    streakDays: updateStreak(progress.lastActiveDate, body.completedAtDate, progress.streakDays),
    lastActiveDate: body.completedAtDate,
    recentPerformanceScores: [...progress.recentPerformanceScores.slice(-4), body.performanceScore]
  };

  const questState = getActiveQuestByUser(body.userId);
  let questCompleted = false;

  if (questState.quest && questState.progress) {
    const stepResult = advanceQuestStep(questState.progress, questState.quest, body.exerciseId);
    saveUserQuestProgress(stepResult.updated);
    questCompleted = stepResult.questCompleted;

    if (stepResult.questCompleted) {
      updatedProgress = applyXpToProgress(updatedProgress, questState.quest.completionXpReward, {
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
      });

      if (questState.quest.completionBadgeId) {
        const already = getDatabase().userBadges.some(
          (item) => item.userId === body.userId && item.badgeId === questState.quest?.completionBadgeId
        );

        if (!already) {
          saveUnlockedBadges([
            {
              id: `user_badge_${getDatabase().userBadges.length + 1}`,
              userId: body.userId,
              badgeId: questState.quest.completionBadgeId,
              unlockedAt: new Date().toISOString()
            }
          ]);
        }
      }
    }
  }

  saveGameProgress(updatedProgress);

  const db = getDatabase();
  const unlocked = findUnlockableBadges(
    updatedProgress,
    db.badges,
    db.userBadges.filter((item) => item.userId === body.userId),
    new Date().toISOString()
  );

  if (unlocked.length > 0) {
    saveUnlockedBadges(unlocked);
  }

  return {
    ok: true,
    reward: xpReward,
    progress: updatedProgress,
    questCompleted,
    unlockedBadges: unlocked
  };
});

app.get("/v1/training/overview", async () => ({ overview: getOverview() }));
app.get("/v1/admin/scenario-studio/scenarios", async (request, reply) => {
  if (!isAdminRequest(request as unknown as { headers: Record<string, unknown> })) {
    reply.code(401);
    return { ok: false, error: "access_denied" };
  }

  const query = ((request as unknown as { query?: Record<string, string | undefined> }).query ?? {}) as {
    module?: string;
    includeArchived?: string;
  };

  return {
    ok: true,
    scenarios: listScenarioDefinitions({
      module: query.module as any,
      includeArchived: query.includeArchived === "true"
    })
  };
});

app.post("/v1/admin/scenario-studio/scenarios", async (request, reply) => {
  if (!isAdminRequest(request as unknown as { headers: Record<string, unknown> })) {
    reply.code(401);
    return { ok: false, error: "access_denied" };
  }

  const body = request.body as any;
  const errors = validateScenario(body);
  if (errors.length > 0) return { ok: false, error: "validation_failed", fields: errors };

  return { ok: true, scenario: createScenarioDefinition(body) };
});

app.post("/v1/admin/scenario-studio/scenarios/:id/update", async (request, reply) => {
  if (!isAdminRequest(request as unknown as { headers: Record<string, unknown> })) {
    reply.code(401);
    return { ok: false, error: "access_denied" };
  }

  const params = request.params as { id: string };
  const body = request.body as Record<string, unknown>;
  const updated = updateScenarioDefinition(params.id, body as any);
  if (!updated) return { ok: false, error: "scenario_not_found" };
  return { ok: true, scenario: updated };
});

app.post("/v1/admin/scenario-studio/scenarios/:id/action", async (request, reply) => {
  if (!isAdminRequest(request as unknown as { headers: Record<string, unknown> })) {
    reply.code(401);
    return { ok: false, error: "access_denied" };
  }

  const params = request.params as { id: string };
  const body = request.body as { action: "duplicate" | "archive" | "publish" | "unpublish" | "activate" | "deactivate" | "test" | "preview" };

  if (body.action === "duplicate") return { ok: true, scenario: duplicateScenarioDefinition(params.id) };
  if (body.action === "test" || body.action === "preview") return { ok: true, result: runScenarioAdminTest(params.id) };

  const updated = setScenarioStatus(params.id, body.action);
  if (!updated) return { ok: false, error: "scenario_not_found" };
  return { ok: true, scenario: updated };
});

app.get("/v1/coach/:userId/overview", async (request) => {
  const params = request.params as { userId: string };
  const overview = buildAdaptiveCoachOverview(getDatabase(), params.userId);
  return {
    ok: true,
    coach: overview,
    personalProfile: getPersonalCoachProfileByUser(params.userId),
    modelPreferences: getModelPreferences(),
    recentMemory: getSessionMemoriesByUser(params.userId, 6)
  };
});

app.get("/v1/coach/:userId/personalization", async (request) => {
  const params = request.params as { userId: string };
  return {
    ok: true,
    personalProfile: getPersonalCoachProfileByUser(params.userId),
    modelPreferences: getModelPreferences(),
    recentMemory: getSessionMemoriesByUser(params.userId, 10)
  };
});

app.post("/v1/coach/:userId/personalization", async (request) => {
  const params = request.params as { userId: string };
  const body = request.body as {
    personalProfile?: Record<string, unknown>;
    modelPreferences?: ReturnType<typeof getModelPreferences>;
  };
  const existingProfile = getPersonalCoachProfileByUser(params.userId);

  const personalProfile = body.personalProfile
    ? savePersonalCoachProfile({
        userId: params.userId,
        primaryGoal: cleanText(body.personalProfile.primaryGoal, existingProfile?.primaryGoal ?? "Become clearer and more confident in high-stakes conversations."),
        targetSituations: cleanStringList(body.personalProfile.targetSituations, existingProfile?.targetSituations ?? [], 8),
        knownWeaknesses: cleanStringList(body.personalProfile.knownWeaknesses, existingProfile?.knownWeaknesses ?? [], 8),
        speakingIdentity: cleanText(body.personalProfile.speakingIdentity, existingProfile?.speakingIdentity ?? "Clear, calm, concise speaker"),
        coachStrictness: isValidOption(body.personalProfile.coachStrictness, VALID_COACH_STRICTNESS)
          ? body.personalProfile.coachStrictness
          : existingProfile?.coachStrictness ?? "direct",
        weeklyPracticeMinutes: Math.max(5, Math.min(600, Number(body.personalProfile.weeklyPracticeMinutes) || existingProfile?.weeklyPracticeMinutes || 100)),
        currentRealWorldEvent: cleanText(body.personalProfile.currentRealWorldEvent, existingProfile?.currentRealWorldEvent ?? ""),
        accentOrLanguageNotes: cleanText(body.personalProfile.accentOrLanguageNotes, existingProfile?.accentOrLanguageNotes ?? "")
      })
    : getPersonalCoachProfileByUser(params.userId);

  const existingPreferences = getModelPreferences();
  const incomingPreferences: ModelPreference[] = Array.isArray(body.modelPreferences)
    ? body.modelPreferences
        .reduce<ModelPreference[]>((preferences, preference) => {
          const existing = existingPreferences.find((item) => item.task === preference.task);
          if (!isValidOption(preference.task, VALID_AI_TASKS)) return preferences;
          const sanitized: ModelPreference = {
            task: preference.task,
            provider: isValidOption(preference.provider, VALID_LLM_PROVIDERS) ? preference.provider : existing?.provider ?? "openai",
            model: cleanText(preference.model, existing?.model ?? "gpt-4.1-mini"),
            costMode: isValidOption(preference.costMode, VALID_COST_MODES) ? preference.costMode : existing?.costMode ?? "lowest_cost",
            enabled: preference.enabled !== false
          };
          const fallbackProvider = isValidOption(preference.fallbackProvider, VALID_LLM_PROVIDERS) ? preference.fallbackProvider : existing?.fallbackProvider;
          const fallbackModel = typeof preference.fallbackModel === "string" && preference.fallbackModel.trim() ? preference.fallbackModel.trim() : existing?.fallbackModel;
          if (fallbackProvider) sanitized.fallbackProvider = fallbackProvider;
          if (fallbackModel) sanitized.fallbackModel = fallbackModel;
          return [...preferences, sanitized];
        }, [])
    : [];
  const modelPreferences = incomingPreferences.length > 0
    ? saveModelPreferences([
        ...existingPreferences.map((existing) => incomingPreferences.find((preference) => preference.task === existing.task) ?? existing),
        ...incomingPreferences.filter((preference) => !existingPreferences.some((existing) => existing.task === preference.task))
      ])
    : existingPreferences;

  return { ok: true, personalProfile, modelPreferences, recentMemory: getSessionMemoriesByUser(params.userId, 10) };
});

app.get("/v1/dashboard/:userId", async (request) => {
  const params = request.params as { userId: string };
  return { ok: true, dashboard: buildDashboardInsights(getDatabase(), params.userId) };
});

app.get("/v1/modules/articulation/drills", async () => ({ ok: true, drills: listArticulationDrills() }));
app.get("/v1/modules/media/drills", async () => ({ ok: true, drills: listMediaDrills() }));
app.get("/v1/modules/reading/passages", async (request) => {
  const query = ((request as unknown as { query?: Record<string, string | undefined> }).query ?? {}) as {
    mode?: "guided_reading" | "cold_reading" | "executive_business_reading" | "story_narrative_reading" | "difficult_text_mode";
    difficulty?: "easy" | "medium" | "hard";
    type?: "business" | "narrative" | "technical" | "news";
    length?: "short" | "medium" | "long";
    skillFocus?: string;
  };

  return { ok: true, passages: listReadingPassages(query) };
});

app.get("/v1/modules/media/key-messages/:userId", async (request) => {
  const params = request.params as { userId: string };
  return { ok: true, keyMessages: getMediaKeyMessagesByUser(params.userId) };
});

app.post("/v1/modules/media/key-messages", async (request) => {
  const body = request.body as { userId: string; messages: string[] };

  if (!body.userId || !Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, error: "invalid_key_messages_payload" };
  }

  return { ok: true, keyMessages: saveMediaKeyMessages({ userId: body.userId, messages: body.messages }) };
});

app.post("/v1/modules/media/soundbite/transform", async (request) => {
  const body = request.body as { answer?: string; transcript?: string };
  const answer = (body.answer ?? body.transcript ?? "").trim();
  if (!answer) {
    return { ok: false, error: "missing_answer_or_transcript" };
  }

  return { ok: true, transformed: transformToSoundbites({ answer }) };
});

app.post("/v1/modules/media/crisis/start", async (request) => {
  const body = request.body as { scenarioType?: Parameters<typeof startCrisisSimulation>[0] };
  if (!body.scenarioType) {
    return { ok: false, error: "missing_scenario_type" };
  }

  return { ok: true, simulation: startCrisisSimulation(body.scenarioType) };
});

app.post("/v1/modules/impromptu/start", async (request) => {
  const body = ((request.body ?? {}) as {
    category?:
      | "personal_confidence"
      | "explain_simply"
      | "business_decision"
      | "board_question"
      | "investor_challenge"
      | "hostile_question"
      | "storytelling"
      | "media_response";
    timerSeconds?: 30 | 60 | 90 | 120;
  }) ?? {};
  return { ok: true, generated: startImpromptuPrompt(body) };
});

app.post("/v1/modules/listening/start", async (request) => {
  const body = ((request.body ?? {}) as {
    drillType?:
      | "listen_and_summarise"
      | "listen_and_answer"
      | "paraphrase_then_answer"
      | "identify_real_question"
      | "detect_tone_intent"
      | "answer_hidden_concern";
  }) ?? {};
  return { ok: true, drill: startListeningDrill(body) };
});

app.post("/v1/modules/executive/start", async (request) => {
  const body = ((request.body ?? {}) as {
    mode?:
      | "cfo_interview"
      | "recruiter_screen"
      | "investor_pitch_qa"
      | "board_update"
      | "difficult_stakeholder_conversation"
      | "presentation_rehearsal"
      | "leadership_update"
      | "media_adjacent_executive_questioning";
    style?: "supportive" | "neutral" | "challenging" | "aggressive_but_professional";
  }) ?? {};
  return { ok: true, simulation: startExecutiveSimulation(body) };
});

app.post("/v1/realtime/session/start", async (request) => {
  const body = (request.body ?? {}) as {
    userId?: string;
    mode?: "interview_simulation" | "confidence_check_in" | "quick_speaking_warmup" | "media_practice" | "impromptu_speaking";
  };
  if (!body.userId) {
    return { ok: false, error: "missing_user_id" };
  }
  return { ok: true, session: startRealtimeCoachSession({ userId: body.userId, mode: body.mode ?? "confidence_check_in" }) };
});

app.post("/v1/realtime/session/turn", async (request) => {
  const body = (request.body ?? {}) as {
    sessionId?: string;
    userText?: string;
  };
  if (!body.sessionId || !body.userText) {
    return { ok: false, error: "missing_session_or_text" };
  }
  const result = appendRealtimeTurn({ sessionId: body.sessionId, userText: body.userText });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, coachReply: result.coachReply, turns: result.turns };
});

app.post("/v1/realtime/session/end", async (request) => {
  const body = (request.body ?? {}) as { sessionId?: string };
  if (!body.sessionId) {
    return { ok: false, error: "missing_session_id" };
  }
  const result = endRealtimeCoachSession({ sessionId: body.sessionId });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, sessionId: result.sessionId, mode: result.mode, transcript: result.transcript, summary: result.summary };
});

app.post("/v1/recordings/attempts", async (request) => {
  const body = request.body as {
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

  if (!body.sessionId || !body.exerciseId) {
    return { ok: false, error: "missing_session_or_exercise" };
  }

  if (!Number.isFinite(body.durationSeconds) || body.durationSeconds < 0) {
    return { ok: false, error: "invalid_duration" };
  }

  const saved = saveRecordingForAttempt(body);
  return { ok: true, ...saved };
});

app.get("/v1/history/:userId", async (request) => {
  const params = request.params as { userId: string };
  const query = request.query as { limit?: string };
  const limit = Number.isFinite(Number(query.limit)) ? Math.max(1, Math.min(50, Number(query.limit))) : 20;

  return {
    ok: true,
    history: getAttemptHistoryByUser(params.userId, limit)
  };
});

app.post("/v1/recordings/transcribe", async (request) => {
  const body = request.body as {
    attemptId: string;
    audioBase64: string;
    mimeType: string;
    fileName?: string;
  };

  if (!body.attemptId || !body.audioBase64) {
    return { ok: false, error: "missing_attempt_or_audio" };
  }

  try {
    const sanitizedBase64 = body.audioBase64.includes(",") ? body.audioBase64.split(",")[1] : body.audioBase64;
    const audioBuffer = Buffer.from(sanitizedBase64, "base64");

    if (audioBuffer.length === 0) {
      return { ok: false, error: "empty_audio_payload" };
    }

    if (audioBuffer.length > MAX_AUDIO_BYTES) {
      return { ok: false, error: "audio_payload_too_large", maxBytes: MAX_AUDIO_BYTES };
    }

    const resolvedMimeType = body.mimeType && ALLOWED_MIME_TYPES.has(body.mimeType) ? body.mimeType : "audio/webm";

    const result = await transcribeAudio({
      audioBuffer,
      mimeType: resolvedMimeType,
      fileName: body.fileName
    });

    const transcript = saveTranscriptForAttempt({
      attemptId: body.attemptId,
      content: result.text
    });

    return { ok: true, transcript };
  } catch (error) {
    if (error instanceof Error && error.message === "missing_openai_api_key") {
      return { ok: false, error: "transcription_not_configured" };
    }

    return { ok: false, error: "transcription_failed" };
  }
});

app.post("/v1/attempts/:attemptId/feedback/generate", async (request) => {
  const params = request.params as { attemptId: string };
  const body = request.body as { userId: string; skillBranch?: SkillBranch };

  const attempt = getAttemptById(params.attemptId);
  if (!attempt) {
    return { ok: false, error: "attempt_not_found" };
  }

  const transcript = getTranscriptByAttemptId(params.attemptId);
  if (!transcript || !transcript.content.trim()) {
    return { ok: false, error: "transcript_not_found" };
  }

  const db = getDatabase();
  const exercise = db.exercises.find((item) => item.id === attempt.exerciseId);

  const progress = getGameProgressByUser(body.userId);
  const profile = getTrainingProfileByUser(body.userId);
  const activeQuest = getActiveQuestByUser(body.userId);
  const previousFeedback = [...db.feedbackItems].reverse()[0];
  const personalContext = getPersonalCoachProfileByUser(body.userId);
  const recentMemory = getSessionMemoriesByUser(body.userId, 5);
  const modelPreference = getModelPreferenceForTask("feedback");

  const userGoals = db.goals.filter((goal) => goal.userId === body.userId).map((goal) => goal.focusArea);

  try {
    const feedback = await generateAiFeedback({
      transcript: transcript.content,
      exerciseType: exercise?.drillType ?? "articulation",
      userGoals: userGoals.length > 0 ? userGoals : [profile.preference?.mainGoal ?? "confidence"],
      sessionLevel: profile.profile?.levelBand ?? "foundation",
      previousWeakness: previousFeedback?.whatWeakened,
      activeQuest: activeQuest.quest?.title,
      skillBranch: body.skillBranch ?? activeQuest.quest?.targetSkill ?? "confidence",
      difficultyLevel: progress?.currentDifficulty ?? "Easy",
      personalContext,
      recentMemory,
      modelPreference
    });

    const feedbackItem = saveFeedbackForAttempt({
      attemptId: attempt.id,
      whatWorked: feedback.whatWorked,
      whatWeakened: feedback.whatWeakened,
      priorityFix: feedback.priorityFix,
      retryInstruction: feedback.retryInstruction
    });

    const total = Math.round(
      (feedback.scores.clarity.value +
        feedback.scores.confidence.value +
        feedback.scores.concision.value +
        feedback.scores.articulation.value +
        feedback.scores.readingFluency.value +
        feedback.scores.executivePresence.value +
        feedback.scores.mediaControl.value +
        feedback.scores.listeningAccuracy.value +
        feedback.scores.persuasion.value +
        feedback.scores.storytelling.value) /
        10
    );

    const score = saveScoreForAttempt({
      attemptId: attempt.id,
      clarity: feedback.scores.clarity.value,
      confidence: feedback.scores.confidence.value,
      concision: feedback.scores.concision.value,
      articulation: feedback.scores.articulation.value,
      readingFluency: feedback.scores.readingFluency.value,
      executivePresence: feedback.scores.executivePresence.value,
      mediaControl: feedback.scores.mediaControl.value,
      listeningAccuracy: feedback.scores.listeningAccuracy.value,
      persuasion: feedback.scores.persuasion.value,
      storytelling: feedback.scores.storytelling.value,
      impromptu: feedback.scores.confidence.value,
      presentation: feedback.scores.clarity.value,
      listening: feedback.scores.listeningAccuracy.value,
      total,
      rationale: {
        clarity: feedback.scores.clarity.reason,
        confidence: feedback.scores.confidence.reason,
        concision: feedback.scores.concision.reason,
        articulation: feedback.scores.articulation.reason,
        readingFluency: feedback.scores.readingFluency.reason,
        executivePresence: feedback.scores.executivePresence.reason,
        mediaControl: feedback.scores.mediaControl.reason,
        listeningAccuracy: feedback.scores.listeningAccuracy.reason,
        persuasion: feedback.scores.persuasion.reason,
        storytelling: feedback.scores.storytelling.reason
      }
    });

    const memory = saveSessionMemory({
      userId: body.userId,
      attemptId: attempt.id,
      skillBranch: body.skillBranch ?? activeQuest.quest?.targetSkill ?? "confidence",
      situation: exercise?.title ?? exercise?.drillType ?? "speaking practice",
      modelProvider: modelPreference?.provider,
      modelName: modelPreference?.model,
      transcriptSummary: transcript.content.split(/\s+/).slice(0, 24).join(" "),
      observedWeakness: feedback.whatWeakened,
      priorityFix: feedback.priorityFix,
      nextDrill: feedback.retryInstruction,
      scoreTotal: total
    });

    return { ok: true, feedback: feedbackItem, score, memory, modelPreference };
  } catch (error) {
    if (error instanceof Error && (error.message === "missing_openai_api_key" || error.message.startsWith("missing_provider_api_key"))) {
      return { ok: false, error: "feedback_not_configured" };
    }

    if (error instanceof Error && error.message.startsWith("provider_not_configured")) {
      return { ok: false, error: "feedback_provider_not_configured" };
    }

    if (error instanceof Error && error.message.includes("JSON")) {
      return { ok: false, error: "feedback_parse_failed" };
    }

    return { ok: false, error: "feedback_generation_failed" };
  }
});

app.post("/v1/modules/articulation/score", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    drillId: string;
    transcript: string;
    durationSeconds: number;
    selfRating: number;
  };

  const drill = findArticulationDrill(body.drillId);
  if (!drill) {
    return { ok: false, error: "drill_not_found" };
  }

  if (!body.attemptId || !body.transcript) {
    return { ok: false, error: "missing_attempt_or_transcript" };
  }

  const heuristic = scoreArticulationHeuristic({
    transcript: body.transcript,
    examplePhrase: drill.examplePhrase,
    durationSeconds: body.durationSeconds,
    selfRating: body.selfRating
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: heuristic.total,
    confidence: heuristic.total,
    concision: heuristic.factors.transcriptCompleteness,
    articulation: heuristic.total,
    readingFluency: heuristic.factors.paceScore,
    executivePresence: heuristic.factors.transcriptCompleteness,
    mediaControl: heuristic.factors.repeatedWordsScore,
    listeningAccuracy: heuristic.factors.substitutionEstimateScore,
    persuasion: heuristic.factors.transcriptCompleteness,
    storytelling: heuristic.factors.userSelfRatingScore,
    impromptu: heuristic.factors.paceScore,
    presentation: heuristic.factors.repeatedWordsScore,
    total: heuristic.total,
    rationale: {
      articulation: heuristic.label,
      transcriptCompleteness: String(heuristic.factors.transcriptCompleteness),
      repeatedWordRuns: String(heuristic.factors.repeatedWordRuns),
      substitutionEstimateCount: String(heuristic.factors.substitutionEstimateCount),
      paceWpm: String(heuristic.factors.wordsPerMinute),
      selfRating: String(body.selfRating)
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + heuristic.awardedXp,
      skillXp: {
        ...progress.skillXp,
        articulation: progress.skillXp.articulation + heuristic.awardedXp
      }
    });
  }

  return {
    ok: true,
    heuristic,
    score,
    awardedSkill: "articulation",
    awardedXp: heuristic.awardedXp
  };
});

app.post("/v1/modules/media/score", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    drillId: string;
    transcript: string;
    durationSeconds: number;
    selfCalmnessRating: number;
    keyMessages: string[];
  };

  const drill = findMediaDrill(body.drillId);
  if (!drill) {
    return { ok: false, error: "drill_not_found" };
  }

  const heuristic = scoreMediaHeuristic({
    transcript: body.transcript,
    keyMessages: body.keyMessages,
    durationSeconds: body.durationSeconds,
    selfCalmnessRating: body.selfCalmnessRating
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: heuristic.scores.clarityForGeneralAudience,
    confidence: heuristic.scores.calmness,
    concision: heuristic.scores.brevity,
    articulation: heuristic.scores.clarityForGeneralAudience,
    readingFluency: heuristic.scores.brevity,
    executivePresence: heuristic.scores.messageControl,
    mediaControl: heuristic.scores.messageControl,
    listeningAccuracy: heuristic.scores.bridgeQuality,
    persuasion: heuristic.scores.soundbiteStrength,
    storytelling: heuristic.scores.soundbiteStrength,
    impromptu: heuristic.scores.bridgeQuality,
    presentation: heuristic.scores.messageControl,
    total: heuristic.total,
    rationale: {
      label: heuristic.label,
      messageControl: String(heuristic.scores.messageControl),
      brevity: String(heuristic.scores.brevity),
      calmness: String(heuristic.scores.calmness),
      bridgeQuality: String(heuristic.scores.bridgeQuality),
      soundbiteStrength: String(heuristic.scores.soundbiteStrength),
      clarityForGeneralAudience: String(heuristic.scores.clarityForGeneralAudience),
      defensivenessRisk: String(heuristic.scores.defensivenessRisk),
      speculationRisk: String(heuristic.scores.speculationRisk)
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + heuristic.awardedXp,
      skillXp: {
        ...progress.skillXp,
        media: progress.skillXp.media + heuristic.awardedXp
      }
    });
  }

  return { ok: true, heuristic, score, awardedSkill: "media", awardedXp: heuristic.awardedXp, drill };
});

app.post("/v1/modules/media/soundbite/score", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    originalAnswer: string;
    practiceTranscript: string;
    targetSoundbite: string;
    selfRating: number;
  };

  const scored = scoreSoundbitePractice({
    originalAnswer: body.originalAnswer,
    practiceTranscript: body.practiceTranscript,
    targetSoundbite: body.targetSoundbite,
    selfRating: body.selfRating
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: scored.scores.clarity,
    confidence: scored.scores.memorability,
    concision: scored.scores.brevity,
    articulation: scored.scores.clarity,
    readingFluency: scored.scores.brevity,
    executivePresence: scored.scores.clarity,
    mediaControl: scored.scores.brevity,
    listeningAccuracy: scored.scores.clarity,
    persuasion: scored.scores.memorability,
    storytelling: scored.scores.memorability,
    impromptu: scored.scores.clarity,
    presentation: scored.scores.brevity,
    total: scored.total,
    rationale: {
      note: scored.note,
      brevity: String(scored.scores.brevity),
      clarity: String(scored.scores.clarity),
      memorability: String(scored.scores.memorability)
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + scored.xpAward.totalXp,
      skillXp: {
        ...progress.skillXp,
        media: progress.skillXp.media + scored.xpAward.totalXp
      }
    });
  }

  return { ok: true, score, soundbite: scored, awardedSkill: "media", awardedXp: scored.xpAward.totalXp };
});

app.post("/v1/modules/media/crisis/evaluate", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    question: string;
    transcript: string;
    previousTranscript?: string;
  };

  const evaluated = evaluateCrisisAnswer({
    question: body.question,
    transcript: body.transcript,
    previousTranscript: body.previousTranscript
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: evaluated.scores.clarity,
    confidence: evaluated.scores.composure,
    concision: evaluated.scores.brevity,
    articulation: evaluated.scores.clarity,
    readingFluency: evaluated.scores.brevity,
    executivePresence: evaluated.scores.executivePresence,
    mediaControl: evaluated.scores.messageControl,
    listeningAccuracy: evaluated.scores.bridgeQuality,
    persuasion: evaluated.scores.honesty,
    storytelling: evaluated.scores.executivePresence,
    impromptu: evaluated.scores.composure,
    presentation: evaluated.scores.messageControl,
    total: evaluated.total,
    rationale: {
      oneFix: evaluated.oneFix,
      speculationAvoidance: String(evaluated.scores.speculationAvoidance),
      honesty: String(evaluated.scores.honesty)
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + evaluated.xpAward,
      skillXp: {
        ...progress.skillXp,
        media: progress.skillXp.media + evaluated.xpAward
      }
    });
  }

  return { ok: true, evaluation: evaluated, score, awardedSkill: "media", awardedXp: evaluated.xpAward };
});

app.post("/v1/modules/reading/evaluate", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    passageId: string;
    transcript: string;
    durationSeconds: number;
  };

  const passage = findReadingPassage(body.passageId);
  if (!passage) {
    return { ok: false, error: "passage_not_found" };
  }

  const evaluation = evaluateReadAloudAttempt({
    passage,
    transcript: body.transcript,
    durationSeconds: body.durationSeconds
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: evaluation.metrics.fluencyScore,
    confidence: evaluation.metrics.recoveryScore,
    concision: evaluation.metrics.pacingScore,
    articulation: evaluation.metrics.pauseControlScore,
    readingFluency: evaluation.metrics.fluencyScore,
    executivePresence: evaluation.metrics.expressionScore,
    mediaControl: evaluation.metrics.pauseControlScore,
    listeningAccuracy: evaluation.comparison.accuracyScore,
    persuasion: evaluation.metrics.expressionScore,
    storytelling: evaluation.metrics.expressionScore,
    impromptu: evaluation.metrics.recoveryScore,
    presentation: evaluation.metrics.pacingScore,
    total: evaluation.total,
    rationale: {
      skippedWords: evaluation.comparison.skippedWords.join(", "),
      repeatedWords: evaluation.comparison.repeatedWords.join(", "),
      substitutions: String(evaluation.comparison.substitutions.length),
      wordsPerMinute: String(evaluation.metrics.wordsPerMinute),
      pacing: evaluation.feedback.pacing,
      pauses: evaluation.feedback.pauses,
      fluency: evaluation.feedback.fluency,
      expression: evaluation.feedback.expression,
      recovery: evaluation.feedback.recovery
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + evaluation.awardedXp,
      skillXp: {
        ...progress.skillXp,
        reading: progress.skillXp.reading + evaluation.awardedXp
      }
    });
  }

  return { ok: true, evaluation, score, awardedSkill: "reading", awardedXp: evaluation.awardedXp, passage };
});

app.post("/v1/modules/impromptu/evaluate", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    prompt: string;
    transcript: string;
    durationSeconds: number;
    targetSeconds: 30 | 60 | 90 | 120;
    previousTranscript?: string;
  };

  const evaluation = evaluateImpromptuAnswer({
    prompt: body.prompt,
    transcript: body.transcript,
    durationSeconds: body.durationSeconds,
    targetSeconds: body.targetSeconds,
    previousTranscript: body.previousTranscript
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: evaluation.scores.clarity,
    confidence: evaluation.scores.confidence,
    concision: evaluation.scores.brevity,
    articulation: evaluation.scores.clarity,
    readingFluency: evaluation.scores.brevity,
    executivePresence: evaluation.scores.structure,
    mediaControl: evaluation.scores.structure,
    listeningAccuracy: evaluation.scores.answerCompleteness,
    persuasion: evaluation.scores.confidence,
    storytelling: evaluation.scores.structure,
    impromptu: evaluation.total,
    presentation: evaluation.scores.clarity,
    total: evaluation.total,
    rationale: {
      retryInstruction: evaluation.retryInstruction,
      fillerWordCount: String(evaluation.diagnostics.fillerWordCount),
      transcriptWordCount: String(evaluation.diagnostics.transcriptWordCount),
      targetSeconds: String(evaluation.diagnostics.targetSeconds)
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + evaluation.xpAward,
      skillXp: {
        ...progress.skillXp,
        impromptu: progress.skillXp.impromptu + evaluation.xpAward
      }
    });
  }

  return { ok: true, evaluation, score, awardedSkill: "impromptu", awardedXp: evaluation.xpAward };
});

app.post("/v1/modules/listening/evaluate", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    prompt: Parameters<typeof evaluateListeningResponse>[0]["prompt"];
    transcript: string;
    durationSeconds: number;
  };

  const evaluation = evaluateListeningResponse({
    prompt: body.prompt,
    transcript: body.transcript,
    durationSeconds: body.durationSeconds
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: evaluation.scores.summaryAccuracy,
    confidence: evaluation.scores.toneRecognition,
    concision: evaluation.scores.concision,
    articulation: evaluation.scores.relevance,
    readingFluency: evaluation.scores.concision,
    executivePresence: evaluation.scores.answerAlignment,
    mediaControl: evaluation.scores.answerAlignment,
    listeningAccuracy: evaluation.scores.answerAlignment,
    persuasion: evaluation.scores.relevance,
    storytelling: evaluation.scores.summaryAccuracy,
    impromptu: evaluation.scores.relevance,
    presentation: evaluation.scores.summaryAccuracy,
    listening: evaluation.total,
    total: evaluation.total,
    rationale: {
      summaryAccuracy: evaluation.feedback.summaryAccuracy,
      relevance: evaluation.feedback.relevance,
      answerAlignment: evaluation.feedback.answerAlignment,
      concision: evaluation.feedback.concision,
      toneRecognition: evaluation.feedback.toneRecognition
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + evaluation.awardedXp,
      skillXp: {
        ...progress.skillXp,
        listening: progress.skillXp.listening + evaluation.awardedXp
      }
    });
  }

  return { ok: true, evaluation, score, awardedSkill: "listening", awardedXp: evaluation.awardedXp };
});

app.post("/v1/modules/executive/evaluate", async (request) => {
  const body = request.body as {
    userId: string;
    attemptId: string;
    mode:
      | "cfo_interview"
      | "recruiter_screen"
      | "investor_pitch_qa"
      | "board_update"
      | "difficult_stakeholder_conversation"
      | "presentation_rehearsal"
      | "leadership_update"
      | "media_adjacent_executive_questioning";
    style: "supportive" | "neutral" | "challenging" | "aggressive_but_professional";
    question: string;
    transcript: string;
    previousTranscript?: string;
  };

  const evaluation = evaluateExecutiveResponse({
    mode: body.mode,
    style: body.style,
    question: body.question,
    transcript: body.transcript,
    previousTranscript: body.previousTranscript
  });

  const score = saveScoreForAttempt({
    attemptId: body.attemptId,
    clarity: evaluation.scores.clarity,
    confidence: evaluation.scores.confidence,
    concision: evaluation.scores.brevity,
    articulation: evaluation.scores.clarity,
    readingFluency: evaluation.scores.brevity,
    executivePresence: evaluation.scores.executivePresence,
    mediaControl: evaluation.scores.answerStructure,
    listeningAccuracy: evaluation.scores.answerStructure,
    persuasion: evaluation.scores.commercialSharpness,
    storytelling: evaluation.scores.answerStructure,
    impromptu: evaluation.scores.confidence,
    presentation: evaluation.scores.executivePresence,
    total: evaluation.total,
    rationale: {
      followUpQuestion: evaluation.followUpQuestion,
      structureCoaching: evaluation.structureCoaching,
      improvedAnswerSuggestion: evaluation.improvedAnswerSuggestion
    }
  });

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    saveGameProgress({
      ...progress,
      overallXp: progress.overallXp + evaluation.xpAward,
      skillXp: {
        ...progress.skillXp,
        executive: progress.skillXp.executive + evaluation.xpAward
      }
    });
  }

  return { ok: true, evaluation, score, awardedSkill: "executive", awardedXp: evaluation.xpAward };
});


app.get("/v1/sales-influence/library", async () => {
  return {
    ok: true,
    ...listSalesInfluenceLibrary(),
    authoredScenarios: listPublishedScenarioCards("sales_influence"),
    ethicsNotice: "Training simulation only. No covert live-call assistance or impersonation."
  };
});

app.post("/v1/sales-influence/roleplay/start", async (request) => {
  const body = request.body as { userId: string; scenarioId: string; frameworkId?: string; mode: "guided" | "realistic" | "pressure" | "elite" };
  return startSalesRoleplaySession({ userId: body.userId, scenarioId: body.scenarioId, frameworkId: body.frameworkId, mode: body.mode });
});

app.post("/v1/sales-influence/roleplay/turn", async (request) => {
  const body = request.body as { sessionId: string; userText: string };
  return appendSalesRoleplayTurn({ sessionId: body.sessionId, userText: body.userText });
});

app.post("/v1/sales-influence/roleplay/end", async (request) => {
  const body = request.body as { sessionId: string; userId: string };
  const ended = endSalesRoleplaySession({ sessionId: body.sessionId, userId: body.userId });
  if (!ended.ok) {
    return ended;
  }

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    const next = applyXpToProgress(progress, ended.report.xpEarned, {
      confidence: 0,
      articulation: 0,
      reading: 0,
      impromptu: 0,
      listening: 0,
      executive: 0,
      media: 0,
      presentation: Math.round(ended.report.xpEarned * 0.4),
      storytelling: Math.round(ended.report.xpEarned * 0.25),
      persuasion: Math.round(ended.report.xpEarned * 0.35)
    });
    saveGameProgress(next);
  }

  return { ...ended, progress: getGameProgressByUser(body.userId) };
});

app.post("/v1/sales-influence/pitch-builder/generate", async (request) => {
  const body = request.body as {
    product: string;
    audience: string;
    problem: string;
    whyNow: string;
    solution: string;
    proof: string;
    differentiation: string;
    commercialModel: string;
    caseStudy: string;
    ask: string;
    timeLimit: 30 | 60 | 120 | 300 | 600;
  };
  return { ok: true, generated: generatePitchVariants(body) };
});

app.get("/v1/sales-influence/team/overview", async () => ({ ok: true, team: getTeamTrainingOverview() }));
app.get("/v1/sales-influence/certifications", async () => ({ ok: true, certifications: getCertificationTracks() }));
app.get("/v1/sales-influence/progress/:userId", async (request) => {
  const params = request.params as { userId: string };
  return {
    ok: true,
    progress: getGameProgressByUser(params.userId),
    pitchBank: listPitchBank(params.userId)
  };
});

app.post("/v1/sales-influence/pitch-bank/save", async (request) => {
  const body = request.body as { userId: string; scenarioId: string; bestLine: string; strongerVersion: string };
  return { ok: true, entry: saveToPitchBank(body) };
});


app.get("/v1/interview/library", async () => ({
  ok: true,
  ethicsNotice: "Interview Prep is for mock practice, rehearsal, answer improvement, and post-interview reflection only.",
  subSections: ["Role Setup", "Story Bank", "Mock Interview", "Behavioural Questions", "Technical / Role Questions", "Executive Interview", "Pressure Mode", "Feedback Reports", "Interview Plan"],
  modes: listInterviewModes(),
  frameworks: INTERVIEW_FRAMEWORKS,
  questionBank: INTERVIEW_QUESTIONS,
  authoredScenarios: listPublishedScenarioCards("interview_prep"),
  confidenceDrills: INTERVIEW_CONFIDENCE_DRILLS,
  badges: INTERVIEW_BADGES,
  prompts: INTERVIEW_PROMPTS
}));

app.post("/v1/interview/role-setup", async (request) => {
  const body = request.body as Parameters<typeof saveRoleSetup>[0];
  const setup = saveRoleSetup(body);
  return { ok: true, setup, generated: generateRoleInsights(setup) };
});

app.get("/v1/interview/role-setup/:userId", async (request) => {
  const params = request.params as { userId: string };
  const setup = getRoleSetup(params.userId);
  return { ok: true, setup, generated: setup ? generateRoleInsights(setup) : undefined };
});

app.post("/v1/interview/story-bank", async (request) => {
  const body = request.body as Omit<Parameters<typeof addStory>[0], "id">;
  return { ok: true, story: addStory(body) };
});

app.get("/v1/interview/story-bank/:userId", async (request) => {
  const params = request.params as { userId: string };
  return { ok: true, stories: listStories(params.userId) };
});

app.post("/v1/interview/mock/start", async (request) => {
  const body = request.body as { userId: string; mode: Parameters<typeof startInterviewSession>[0]["mode"] };
  return { ok: true, ...startInterviewSession(body) };
});

app.post("/v1/interview/mock/turn", async (request) => {
  const body = request.body as { sessionId: string; answer: string };
  return appendInterviewTurn(body);
});

app.post("/v1/interview/mock/end", async (request) => {
  const body = request.body as { sessionId: string; userId: string };
  const ended = endInterviewSession(body);
  if (!ended.ok) return ended;

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    const next = applyXpToProgress(progress, ended.xpEarned, {
      confidence: Math.round(ended.xpEarned * 0.2),
      articulation: 0,
      reading: 0,
      impromptu: Math.round(ended.xpEarned * 0.15),
      listening: Math.round(ended.xpEarned * 0.2),
      executive: Math.round(ended.xpEarned * 0.2),
      media: 0,
      presentation: Math.round(ended.xpEarned * 0.1),
      storytelling: Math.round(ended.xpEarned * 0.1),
      persuasion: Math.round(ended.xpEarned * 0.05)
    });
    saveGameProgress(next);
  }

  return { ...ended, progress: getGameProgressByUser(body.userId) };
});

app.post("/v1/interview/answer-builder", async (request) => {
  const body = request.body as { question: string; rawAnswer: string; userVoiceNotes?: string };
  return { ok: true, variants: buildAnswerVariants(body) };
});

app.post("/v1/interview/positioning", async (request) => {
  const body = request.body as Parameters<typeof generatePositioning>[0];
  return { ok: true, positioning: generatePositioning(body) };
});

app.post("/v1/interview/plan", async (request) => {
  const body = request.body as { userId: string; interviewDate?: string; roleTitle: string };
  const storiesCount = listStories(body.userId).length;
  return { ok: true, plan: generateInterviewPlan({ interviewDate: body.interviewDate, storiesCount, roleTitle: body.roleTitle }) };
});

app.post("/v1/interview/reflection", async (request) => {
  const body = request.body as Parameters<typeof submitPostInterviewReflection>[0];
  return { ok: true, ...submitPostInterviewReflection(body) };
});

app.get("/v1/interview/progress/:userId", async (request) => {
  const params = request.params as { userId: string };
  const setup = getRoleSetup(params.userId);
  const stories = listStories(params.userId);
  return {
    ok: true,
    progress: getGameProgressByUser(params.userId),
    roleReadiness: setup ? 68 + Math.min(20, stories.length * 2) : 40,
    mockInterviewStreak: Math.min(7, Math.max(1, stories.length)),
    questionMastery: Math.min(100, stories.length * 10),
    pressureModeUnlocked: (getGameProgressByUser(params.userId)?.level ?? 1) >= 4,
    storiesCount: stories.length
  };
});


app.get("/v1/executive-presence/library", async () => ({
  ok: true,
  ethicsNotice: "Executive Presence is a rehearsal simulator for preparation only, not covert live assistance.",
  subSections: EXECUTIVE_SUBSECTIONS,
  scenarios: [
    ...EXECUTIVE_SCENARIOS,
    ...listPublishedScenarioCards("executive_presence").map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      subsection: scenario.category,
      brief: scenario.scenarioBrief,
      persona: "board_member",
      pressureLevel: "moderate",
      xpReward: scenario.xpReward
    }))
  ],
  frameworks: EXECUTIVE_FRAMEWORKS,
  drills: EXECUTIVE_DRILLS,
  badges: EXECUTIVE_BADGES,
  timeLimitsSeconds: [15, 30, 60, 120]
}));

app.post("/v1/executive-presence/session/start", async (request) => {
  const body = request.body as {
    userId: string;
    scenarioId: string;
    framework: string;
    pressureMode: boolean;
    timeLimitSeconds: 15 | 30 | 60 | 120;
  };
  return startExecutivePresenceSession(body);
});

app.post("/v1/executive-presence/session/turn", async (request) => {
  const body = request.body as { sessionId: string; answer: string; elapsedSeconds?: number };
  return appendExecutivePresenceTurn(body);
});

app.post("/v1/executive-presence/session/end", async (request) => {
  const body = request.body as { sessionId: string; userId: string };
  const ended = endExecutivePresenceSession(body);
  if (!ended.ok) return ended;

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    const next = applyXpToProgress(progress, ended.xpEarned, {
      confidence: Math.round(ended.xpEarned * 0.25),
      articulation: 0,
      reading: 0,
      impromptu: Math.round(ended.xpEarned * 0.1),
      listening: Math.round(ended.xpEarned * 0.2),
      executive: Math.round(ended.xpEarned * 0.3),
      media: Math.round(ended.xpEarned * 0.1),
      presentation: Math.round(ended.xpEarned * 0.05),
      storytelling: 0,
      persuasion: 0
    });
    saveGameProgress(next);
  }

  return { ...ended, progress: getGameProgressByUser(body.userId) };
});

app.get("/v1/executive-presence/progress/:userId", async (request) => {
  const params = request.params as { userId: string };
  const progress = getGameProgressByUser(params.userId);
  return {
    ok: true,
    progress,
    executivePresenceScore: Math.min(100, 50 + Math.floor((progress?.skillXp.executive ?? 0) / 12)),
    pressureUnlocked: (progress?.level ?? 1) >= 3
  };
});


app.get("/v1/difficult-conversations/library", async () => ({
  ok: true,
  ethicsNotice: "Difficult Conversations is for practice and rehearsal. No covert real-world assistive behavior.",
  subSections: DIFFICULT_SUBSECTIONS,
  frameworks: DIFFICULT_FRAMEWORKS,
  scenarios: [
    ...DIFFICULT_SCENARIOS,
    ...listPublishedScenarioCards("difficult_conversations").map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      subsection: scenario.category,
      pressure: "moderate",
      xpReward: scenario.xpReward
    }))
  ],
  personaStyles: PERSONA_STYLES,
  toneTargets: TONE_TARGETS,
  badges: DIFFICULT_BADGES
}));

app.post("/v1/difficult-conversations/session/start", async (request) => {
  const body = request.body as Parameters<typeof startDifficultConversationSession>[0];
  return startDifficultConversationSession(body);
});

app.post("/v1/difficult-conversations/session/turn", async (request) => {
  const body = request.body as Parameters<typeof appendDifficultConversationTurn>[0];
  return appendDifficultConversationTurn(body);
});

app.post("/v1/difficult-conversations/session/end", async (request) => {
  const body = request.body as Parameters<typeof endDifficultConversationSession>[0];
  const ended = endDifficultConversationSession(body);
  if (!ended.ok) return ended;

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    const next = applyXpToProgress(progress, ended.xpEarned, {
      confidence: Math.round(ended.xpEarned * 0.25),
      articulation: 0,
      reading: 0,
      impromptu: Math.round(ended.xpEarned * 0.1),
      listening: Math.round(ended.xpEarned * 0.2),
      executive: Math.round(ended.xpEarned * 0.1),
      media: Math.round(ended.xpEarned * 0.05),
      presentation: 0,
      storytelling: Math.round(ended.xpEarned * 0.1),
      persuasion: Math.round(ended.xpEarned * 0.2)
    });
    saveGameProgress(next);
  }

  return { ...ended, progress: getGameProgressByUser(body.userId) };
});

app.get("/v1/difficult-conversations/progress/:userId", async (request) => {
  const params = request.params as { userId: string };
  const progress = getGameProgressByUser(params.userId);
  return {
    ok: true,
    progress,
    difficultConversationsScore: Math.min(100, 45 + Math.floor((progress?.skillXp.persuasion ?? 0) / 10)),
    boundaryStrength: Math.min(100, 40 + Math.floor((progress?.skillXp.confidence ?? 0) / 12))
  };
});


app.get("/v1/networking/library", async () => ({
  ok: true,
  ethicsNotice: "Networking module is for practice and rehearsal; not covert live assistance.",
  subSections: NETWORKING_SUBSECTIONS,
  frameworks: NETWORKING_FRAMEWORKS,
  scenarios: [
    ...NETWORKING_SCENARIOS,
    ...listPublishedScenarioCards("networking").map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      subsection: scenario.category,
      xpReward: scenario.xpReward
    }))
  ],
  personas: NETWORKING_PERSONAS,
  badges: NETWORKING_BADGES
}));

app.post("/v1/networking/session/start", async (request) => {
  const body = request.body as Parameters<typeof startNetworkingSession>[0];
  return startNetworkingSession(body);
});

app.post("/v1/networking/session/turn", async (request) => {
  const body = request.body as Parameters<typeof appendNetworkingTurn>[0];
  return appendNetworkingTurn(body);
});

app.post("/v1/networking/session/end", async (request) => {
  const body = request.body as Parameters<typeof endNetworkingSession>[0];
  const ended = endNetworkingSession(body);
  if (!ended.ok) return ended;

  const progress = getGameProgressByUser(body.userId);
  if (progress) {
    const next = applyXpToProgress(progress, ended.xpEarned, {
      confidence: Math.round(ended.xpEarned * 0.2),
      articulation: 0,
      reading: 0,
      impromptu: Math.round(ended.xpEarned * 0.15),
      listening: Math.round(ended.xpEarned * 0.25),
      executive: 0,
      media: 0,
      presentation: Math.round(ended.xpEarned * 0.1),
      storytelling: Math.round(ended.xpEarned * 0.15),
      persuasion: Math.round(ended.xpEarned * 0.15)
    });
    saveGameProgress(next);
  }

  return { ...ended, progress: getGameProgressByUser(body.userId) };
});

app.get("/v1/networking/progress/:userId", async (request) => {
  const params = request.params as { userId: string };
  const progress = getGameProgressByUser(params.userId);
  return {
    ok: true,
    progress,
    rapportScore: Math.min(100, 45 + Math.floor((progress?.skillXp.listening ?? 0) / 11)),
    askClarityScore: Math.min(100, 45 + Math.floor((progress?.skillXp.persuasion ?? 0) / 12))
  };
});

app.post("/v1/onboarding", async (request) => {
  const body = request.body as Omit<OnboardingPreferences, "id" | "createdAt" | "updatedAt">;
  return { ok: true, ...saveOnboardingPreferences(body) };
});

app.get("/v1/training/profile/:userId", async (request) => {
  const params = request.params as { userId: string };
  const db = getDatabase();
  const result = getTrainingProfileByUser(params.userId);
  const progression = getGameProgressByUser(params.userId);
  const activeQuest = getActiveQuestByUser(params.userId);
  const userBadges = db.userBadges.filter((item) => item.userId === params.userId);
  const unlockedBadgeIds = new Set(userBadges.map((item) => item.badgeId));

  return {
    ok: true,
    ...result,
    progression,
    activeQuest,
    quests: getQuestStatusForUser(params.userId),
    badges: userBadges,
    badgeCatalog: db.badges,
    nextUnlock: db.badges.find((badge) => !unlockedBadgeIds.has(badge.id)),
    dailyMissions: db.dailyMissions.map((mission) => ({
      ...mission,
      completed: Boolean(
        db.userDailyMissionProgress.find((progress) => progress.userId === params.userId && progress.missionId === mission.id)?.completed
      )
    })),
    weeklyBossChallengePreview: db.weeklyBossChallenges[0]
  };
});

const start = async () => {
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? "4000");
  await app.listen({ host: "0.0.0.0", port });
};

void start();
