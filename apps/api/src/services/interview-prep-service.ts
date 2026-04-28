import { INTERVIEW_QUESTIONS, INTERVIEW_CONFIDENCE_DRILLS } from "./interview-data-service";

export type RoleSetup = {
  userId: string;
  targetRoleTitle: string;
  company: string;
  industry: string;
  seniority: string;
  jobDescription: string;
  resumeText: string;
  linkedInText: string;
  interviewStage: string;
  interviewFormat: "phone" | "video" | "panel" | "case" | "executive" | "recruiter" | "final_round";
  interviewDate?: string;
  knownInterviewers: string[];
  keyConcerns: string[];
  targetCompensation?: string;
  mustSayPoints: string[];
  topicsToAvoid: string[];
};

export type Story = {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string;
  leadershipLesson: string;
  conflictElement: string;
  failureLearningElement: string;
  stakeholderElement: string;
  tags: string[];
  relevantCompetencies: string[];
  polished60Second: string;
  polished2Minute: string;
  weaknessRiskNotes: string;
};

const roleSetups: RoleSetup[] = [];
const storyBank: Story[] = [];
const reflections: any[] = [];

export function saveRoleSetup(setup: RoleSetup) {
  const next = [...roleSetups.filter((item) => item.userId !== setup.userId), setup];
  roleSetups.length = 0;
  roleSetups.push(...next);
  return setup;
}

export function getRoleSetup(userId: string) {
  return roleSetups.find((item) => item.userId === userId);
}

export function generateRoleInsights(setup: RoleSetup) {
  return {
    likelyQuestionList: [...INTERVIEW_QUESTIONS.general.slice(0, 5), ...INTERVIEW_QUESTIONS.behavioural.slice(0, 4)],
    requiredCompetencies: ["communication", "stakeholder management", "execution", "strategic thinking"],
    companySpecificThemes: ["growth efficiency", "leadership maturity", "cross-functional trust"],
    roleSpecificTechnicalAreas: [setup.industry || "industry fundamentals", "kpi discipline", "risk management"],
    personalPositioningSummary: `You are positioned as a ${setup.seniority} operator for ${setup.targetRoleTitle} who combines strategic clarity with execution rigor.`,
    likelyObjectionsConcerns: ["industry depth", "scope of leadership", "transition risk"],
    recommendedPreparationPlan: setup.interviewDate
      ? ["Run daily roleplay", "Refine 6 core stories", "Practice pressure responses", "Mock final round 48h before interview"]
      : ["Run 7-day baseline plan", "Build story bank", "Practice weekly stress interview"]
  };
}

export function addStory(input: Omit<Story, "id">) {
  const story = { ...input, id: `story_${String(storyBank.length + 1).padStart(3, "0")}` };
  storyBank.push(story);
  return story;
}

export function listStories(userId: string) {
  return storyBank.filter((item) => item.userId === userId);
}

export function buildAnswerVariants(input: { question: string; rawAnswer: string; userVoiceNotes?: string }) {
  return {
    rawAnswer: input.rawAnswer,
    structuredVersion: `STAR structure: Situation... Task... Action... Result... ${input.rawAnswer}`,
    conciseVersion: `${input.rawAnswer.split(".").slice(0, 2).join(".")}.`,
    executiveVersion: `Headline: outcome delivered. Context: challenge. Action: what I changed. Result: measurable impact. Strategic relevance: why it matters now.`,
    strongerMetricsVersion: `${input.rawAnswer} Added metrics: "improved cycle time by 22%, reduced errors by 18%".`,
    warmerHumanVersion: `${input.rawAnswer} I learned to balance pace with empathy and stakeholder confidence.`,
    pressureResistantVersion: `Direct answer first, then proof, then next-step framing. ${input.rawAnswer}`
  };
}

export function generatePositioning(setup: RoleSetup) {
  return {
    tellMe30: `I help ${setup.company || "growth-stage teams"} solve high-stakes execution problems with disciplined communication and measurable outcomes.`,
    background90: `Over the past years I progressed through increasingly complex roles, building teams, improving performance, and leading cross-functional transformation.`,
    executive2m: `I combine strategic clarity with hands-on execution. I build trust quickly, set operating cadence, and deliver outcomes under pressure.`,
    whyMe: "I bring a repeatable operating system: diagnose quickly, align stakeholders, execute decisively.",
    whyCompany: `This company aligns with my motivation to build impact in ${setup.industry || "this"} space.`,
    whyNow: "This is the right timing because the role requires both transformation and operating rigor now.",
    whatIBring: "Executive communication, KPI discipline, stakeholder trust, and calm pressure handling.",
    howICreateValue: "I convert ambiguity into decisions and decisions into measurable outcomes.",
    first90Days: "Listen deeply, align priorities, stabilize core metrics, and deliver one visible win.",
    weaknessPositioning: "I used to over-explain under pressure; now I lead with a concise headline and evidence.",
    compensationPositioning: "I look for a fair package tied to scope, performance, and long-term value creation."
  };
}

export function generateInterviewPlan(input: { interviewDate?: string; storiesCount: number; roleTitle: string }) {
  const defaultPlan7 = ["Day 1: role setup + core positioning", "Day 2: behavioural stories", "Day 3: mock recruiter", "Day 4: technical/role interview", "Day 5: pressure mode", "Day 6: executive mock", "Day 7: final review"];
  const defaultPlan14 = [...defaultPlan7, ...defaultPlan7.map((step, idx) => `Week 2 ${idx + 1}: refine ${step.toLowerCase()}`)];
  return {
    dailyPlan: input.interviewDate ? ["T-7 to T-1 targeted plan generated"] : defaultPlan7,
    questionsToPractice: [...INTERVIEW_QUESTIONS.general.slice(0, 4), ...INTERVIEW_QUESTIONS.pressure.slice(0, 3)],
    storyBankGaps: input.storiesCount < 6 ? ["Need conflict story", "Need failure/recovery story", "Need influence-without-authority story"] : ["Maintain consistency"],
    companyResearchChecklist: ["Recent earnings/capital events", "Leadership priorities", "Strategic risks"],
    deliveryDrills: INTERVIEW_CONFIDENCE_DRILLS,
    mockInterviewSchedule: input.interviewDate ? ["Recruiter", "Hiring manager", "Pressure", "Final round"] : ["Weekly recruiter + pressure mock"],
    finalDayRoutine: ["Breathing reset", "Positioning rehearsal", "3 story refresh", "Pause-and-answer drill"],
    default7DayPlan: defaultPlan7,
    default14DayPlan: defaultPlan14,
    ongoingWeeklyMaintenance: ["1 mock session", "2 story refinements", "1 pressure drill"]
  };
}

export function submitPostInterviewReflection(payload: {
  userId: string;
  questionsAsked: string[];
  answersWentWell: string[];
  answersFailed: string[];
  objectionsConcerns: string[];
  followUpRequired: string;
  improvementsNextTime: string;
  requestFollowUpEmail?: boolean;
}) {
  reflections.push({ ...payload, createdAt: new Date().toISOString() });
  const followUpEmailDraft = payload.requestFollowUpEmail
    ? `Subject: Thank you for the interview\n\nThank you for the conversation today. I enjoyed discussing ${payload.questionsAsked[0] ?? "the role"}. I remain highly interested and would be glad to provide additional detail on ${payload.followUpRequired || "next steps"}.`
    : undefined;
  return { saved: true, followUpEmailDraft };
}
