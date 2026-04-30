export type DrillType =
  | "articulation"
  | "read_aloud"
  | "impromptu"
  | "public_speaking"
  | "interview"
  | "executive_communication"
  | "listening_response";

export type SkillBranch =
  | "confidence"
  | "articulation"
  | "reading"
  | "impromptu"
  | "listening"
  | "executive"
  | "media"
  | "presentation"
  | "storytelling"
  | "persuasion";

export type DifficultyTier = "Easy" | "Moderate" | "Challenging" | "Pressure" | "Performance" | "Elite";
export type PlanStatus = "planned" | "in_progress" | "completed";
export type QuestStatus = "active" | "completed" | "paused" | "locked";

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  focusArea: DrillType | "confidence" | "executive_presence";
  targetLevel: number;
  createdAt: string;
}

export interface OnboardingPreferences {
  id: string;
  userId: string;
  mainGoal:
    | "confidence"
    | "public_speaking"
    | "articulation"
    | "reading_aloud"
    | "interviews"
    | "executive_presence"
    | "listening";
  confidenceLevel: number;
  currentSpeakingLevel: "beginner" | "intermediate" | "advanced";
  readingDifficulty: "easy" | "medium" | "hard";
  preferredSessionLength: 10 | 15 | 20 | 30;
  upcomingEvent?: string;
  preferredCoachStyle: "direct" | "supportive" | "balanced";
  createdAt: string;
  updatedAt: string;
}

export type SkillXpMap = Record<SkillBranch, number>;

export interface GameProgress {
  id: string;
  userId: string;
  overallXp: number;
  level: number;
  levelTitle?: string;
  streakDays: number;
  lastActiveDate?: string;
  currentDifficulty: DifficultyTier;
  skillXp: SkillXpMap;
  skillLevels?: Record<SkillBranch, number>;
  nextMilestone?: string;
  unlockedFeatures?: string[];
  lockedFeatures?: string[];
  nextSkillFocus?: SkillBranch;
  recentPerformanceScores: number[];
}

export interface TrainingProfile {
  id: string;
  userId: string;
  levelBand: "foundation" | "growth" | "performance";
  weeklyFocus: string;
  recommendedModules: DrillType[];
  dailyMinutes: number;
  generatedFromPreferenceId: string;
  updatedAt: string;
}

export interface TrainingLevel {
  id: string;
  name: string;
  order: number;
  description: string;
}

export interface Exercise {
  id: string;
  title: string;
  drillType: DrillType;
  prompt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  exerciseIds: string[];
  focus: string;
  status: PlanStatus;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: string;
  objective: string;
  dailyPlanIds: string[];
  status: PlanStatus;
}

export interface TrainingSession {
  id: string;
  userId: string;
  dailyPlanId: string;
  startedAt: string;
  completedAt?: string;
  status: PlanStatus;
}

export interface Attempt {
  id: string;
  sessionId: string;
  exerciseId: string;
  createdAt: string;
  durationSeconds: number;
}

export interface RecordingMetadata {
  id: string;
  attemptId: string;
  sessionId: string;
  exerciseId: string;
  mimeType: string;
  blobSizeBytes: number;
  durationSeconds: number;
  startedAt: string;
  stoppedAt: string;
  createdAt: string;
}

export interface Transcript {
  id: string;
  attemptId: string;
  content: string;
  wordCount: number;
}

export interface Score {
  id: string;
  attemptId: string;
  confidence: number;
  clarity: number;
  articulation: number;
  readingFluency: number;
  concision: number;
  executivePresence: number;
  mediaControl: number;
  listeningAccuracy: number;
  persuasion: number;
  storytelling: number;
  listening?: number;
  impromptu: number;
  presentation: number;
  total: number;
  rationale?: Record<string, string>;
}

export interface FeedbackItem {
  id: string;
  attemptId: string;
  whatWorked: string;
  whatWeakened: string;
  priorityFix: string;
  retryInstruction: string;
}

export type LlmProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "mistral"
  | "xai"
  | "openrouter"
  | "groq"
  | "together"
  | "fireworks"
  | "local";

export type AiTaskType = "realtimeCoach" | "transcription" | "tts" | "feedback" | "deepReview" | "cheapScoring" | "fallback";
export type CostMode = "lowest_cost" | "balanced" | "best_quality";
export type CoachStrictness = "supportive" | "balanced" | "direct" | "tough";

export interface ModelPreference {
  task: AiTaskType;
  provider: LlmProvider;
  model: string;
  costMode: CostMode;
  enabled: boolean;
  fallbackProvider?: LlmProvider;
  fallbackModel?: string;
}

export interface PersonalCoachProfile {
  id: string;
  userId: string;
  primaryGoal: string;
  targetSituations: string[];
  knownWeaknesses: string[];
  speakingIdentity: string;
  coachStrictness: CoachStrictness;
  weeklyPracticeMinutes: number;
  currentRealWorldEvent?: string;
  accentOrLanguageNotes?: string;
  updatedAt: string;
}

export interface SessionMemory {
  id: string;
  userId: string;
  attemptId?: string;
  createdAt: string;
  skillBranch: SkillBranch;
  situation: string;
  modelProvider?: LlmProvider;
  modelName?: string;
  transcriptSummary: string;
  observedWeakness: string;
  priorityFix: string;
  nextDrill: string;
  scoreTotal?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  requirement: "first_session" | "xp_threshold" | "streak_threshold" | "quest_completion";
  threshold?: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  exerciseId: string;
  targetSkill: SkillBranch;
  xpReward: number;
  isBoss: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetSkill: SkillBranch;
  minLevel: number;
  completionXpReward: number;
  completionBadgeId?: string;
  steps: QuestStep[];
}

export interface UserQuestProgress {
  id: string;
  userId: string;
  questId: string;
  status: QuestStatus;
  currentStepIndex: number;
  completedStepIds: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetSkill: SkillBranch;
  xpReward: number;
  skillXpReward: number;
}

export interface UserDailyMissionProgress {
  id: string;
  userId: string;
  missionId: string;
  completed: boolean;
}

export interface MediaKeyMessageSet {
  id: string;
  userId: string;
  messages: string[];
  updatedAt: string;
}

export interface WeeklyBossChallenge {
  id: string;
  title: string;
  description: string;
  scenarioSetup: string;
  difficulty: DifficultyTier;
  requiredLevel: number;
  timerSeconds: number;
  rewardXp: number;
}

export interface BossChallengeAttempt {
  id: string;
  challengeId: string;
  userId: string;
  sessionId: string;
  attemptId: string;
  startedAt: string;
  completedAt?: string;
  transcriptPlaceholder: string;
  scoringPlaceholder: string;
  outcome: "in_progress" | "pass" | "fail" | "complete" | "improve";
  xpGranted: number;
}

export interface DatabaseSnapshot {
  users: User[];
  goals: Goal[];
  onboardingPreferences: OnboardingPreferences[];
  gameProgressions: GameProgress[];
  trainingProfiles: TrainingProfile[];
  trainingLevels: TrainingLevel[];
  trainingSessions: TrainingSession[];
  exercises: Exercise[];
  attempts: Attempt[];
  recordings: RecordingMetadata[];
  transcripts: Transcript[];
  scores: Score[];
  dailyPlans: DailyPlan[];
  weeklyPlans: WeeklyPlan[];
  feedbackItems: FeedbackItem[];
  personalCoachProfiles: PersonalCoachProfile[];
  modelPreferences: ModelPreference[];
  sessionMemories: SessionMemory[];
  badges: Badge[];
  userBadges: UserBadge[];
  quests: Quest[];
  userQuestProgress: UserQuestProgress[];
  dailyMissions: DailyMission[];
  userDailyMissionProgress: UserDailyMissionProgress[];
  mediaKeyMessageSets: MediaKeyMessageSet[];
  weeklyBossChallenges: WeeklyBossChallenge[];
  bossChallengeAttempts: BossChallengeAttempt[];
}
