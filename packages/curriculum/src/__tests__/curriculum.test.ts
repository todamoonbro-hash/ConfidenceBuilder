import assert from "node:assert/strict";
import { detectPlateau, generateDailyPlan } from "../index.js";

// ---- detectPlateau ----------------------------------------------------------

assert.equal(detectPlateau([70, 72, 69, 71, 70]), true);
assert.equal(detectPlateau([60, 65, 70, 75, 80]), false);
assert.equal(detectPlateau([70, 72, 69, 71]), false); // <5 samples => no plateau
assert.equal(detectPlateau([]), false);

// ---- generateDailyPlan: 20-min plan w/ weakestDimension ---------------------

const plan = generateDailyPlan({
  focusAreas: ["confidence"],
  durationMinutes: 20,
  weakestDimension: "confidence"
});

assert.equal(plan.steps.length >= 4, true, "expected at least 4 steps");
assert.equal(plan.steps.length <= 8, true, "expected no more than 8 steps");

const total = plan.steps.reduce((acc, step) => acc + step.durationMinutes, 0);
assert.equal(total <= 20, true, `expected total <= 20, got ${total}`);

assert.equal(plan.steps[0].skill, "breathing", "first step must be breathing");
assert.equal(plan.steps[1].skill, "vocal_warmup", "second step must be vocal_warmup");

const edgeStep = plan.steps.find((step) => step.edgeOfCompetence);
assert.ok(edgeStep, "expected an edge-of-competence step");
// 'confidence' dimension maps to the impromptu skill in the curriculum config.
assert.equal(edgeStep!.skill, "impromptu", "edge focus 'confidence' should map to impromptu");
assert.equal(edgeStep!.reps >= 7 && edgeStep!.reps <= 12, true, "edge reps must be in 7-12 band");

assert.match(plan.rationale, /confidence/i, "rationale should mention edge focus");
assert.equal(plan.edgeFocus, "confidence");

// ---- generateDailyPlan: upcoming real event within 7 days -------------------

const eventPlan = generateDailyPlan({
  focusAreas: ["clarity"],
  durationMinutes: 25,
  weakestDimension: "clarity",
  upcomingRealEvent: { kind: "board update", daysUntil: 3 }
});

const skills = eventPlan.steps.map((step) => step.skill);
assert.equal(skills.includes("exposure_drill"), true, "event-soon plan must include exposure_drill");
assert.equal(skills.includes("reflection"), true, "event-soon plan must include reflection");

const reflectionStep = eventPlan.steps.find((step) => step.skill === "reflection");
assert.ok(reflectionStep);
assert.match(reflectionStep!.reason, /board update/i, "reflection should reference the event kind");

// ---- generateDailyPlan: plateau + streak triggers difficulty bump rationale --

const plateauPlan = generateDailyPlan({
  focusAreas: ["confidence"],
  durationMinutes: 30,
  weakestDimension: "confidence",
  recentScoresByDimension: { confidence: [70, 72, 69, 71, 70] },
  streakDays: 10
});

assert.match(
  plateauPlan.rationale,
  /plateau/i,
  "plateau + streak >= 7 should mention plateau in rationale"
);
assert.match(plateauPlan.rationale, /harder prompts/i, "should mention difficulty bump");

// ---- generateDailyPlan: never empty, default focus --------------------------

const minimal = generateDailyPlan({ focusAreas: [], durationMinutes: 12 });
assert.equal(minimal.steps.length >= 4, true);
assert.equal(minimal.edgeFocus.length > 0, true);

console.log("Curriculum tests passed.");
