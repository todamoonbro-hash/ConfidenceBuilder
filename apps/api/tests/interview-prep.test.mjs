import assert from "node:assert/strict";
import { saveRoleSetup, generateRoleInsights, addStory, listStories, buildAnswerVariants, generateInterviewPlan } from "../dist/services/interview-prep-service.js";
import { startInterviewSession, appendInterviewTurn, endInterviewSession } from "../dist/services/interview-mock-engine-service.js";

const setup = saveRoleSetup({
  userId: "user_001",
  targetRoleTitle: "CFO",
  company: "Acme Corp",
  industry: "SaaS",
  seniority: "executive",
  jobDescription: "Lead finance and strategy",
  resumeText: "20 years finance leadership",
  linkedInText: "Operator and board partner",
  interviewStage: "final",
  interviewFormat: "executive",
  interviewDate: "2026-06-15",
  knownInterviewers: ["CEO", "Chair"],
  keyConcerns: ["industry transition"],
  targetCompensation: "$350k",
  mustSayPoints: ["cash discipline", "M&A integration"],
  topicsToAvoid: ["confidential litigation"]
});

const insights = generateRoleInsights(setup);
assert.ok(insights.likelyQuestionList.length > 0);

addStory({
  userId: "user_001",
  title: "Turnaround",
  situation: "Declining margin",
  task: "Stabilize business",
  action: "Restructured pricing",
  result: "Improved margin",
  metrics: "+12% margin",
  leadershipLesson: "Communicate early",
  conflictElement: "Ops resisted",
  failureLearningElement: "Initial plan too broad",
  stakeholderElement: "CEO + Board",
  tags: ["finance"],
  relevantCompetencies: ["leadership"],
  polished60Second: "60s story",
  polished2Minute: "2m story",
  weaknessRiskNotes: "was too detailed"
});
assert.equal(listStories("user_001").length, 1);

const variants = buildAnswerVariants({ question: "Why this role?", rawAnswer: "I enjoy complex transformations." });
assert.ok(variants.conciseVersion.length > 0);

const sessionStart = startInterviewSession({ userId: "user_001", mode: "executive" });
const turn = appendInterviewTurn({ sessionId: sessionStart.session.id, answer: "I led a transformation that improved cash conversion by 14%." });
assert.equal(turn.ok, true);
const ended = endInterviewSession({ sessionId: sessionStart.session.id, userId: "user_001" });
assert.equal(ended.ok, true);
assert.ok(ended.report.overallReadinessScore > 0);

const plan = generateInterviewPlan({ interviewDate: "2026-06-15", storiesCount: 1, roleTitle: "CFO" });
assert.ok(plan.questionsToPractice.length > 0);

console.log("Interview prep tests passed.");
