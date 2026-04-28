import assert from "node:assert/strict";
import { listSalesInfluenceLibrary, startSalesRoleplaySession, appendSalesRoleplayTurn, endSalesRoleplaySession } from "../dist/services/sales-roleplay-service.js";
import { generatePitchVariants } from "../dist/services/sales-pitch-builder-service.js";

const library = listSalesInfluenceLibrary();
assert.ok(library.scenarios.length >= 12);
assert.ok(library.frameworks.length >= 10);
assert.ok(library.personas.length >= 15);

const started = startSalesRoleplaySession({ userId: "user_001", scenarioId: "si_001", mode: "guided", frameworkId: "aida" });
assert.equal(started.ok, true);

const turned = appendSalesRoleplayTurn({ sessionId: started.session.id, userText: "Our platform cuts onboarding time by 40% in 60 days." });
assert.equal(turned.ok, true);
assert.ok(turned.personaReply.length > 10);

const ended = endSalesRoleplaySession({ sessionId: started.session.id, userId: "user_001" });
assert.equal(ended.ok, true);
assert.ok(ended.report.overallScore > 0);
assert.ok(ended.report.dimensions.objectionHandling.score > 0);

const pitch = generatePitchVariants({
  product: "Revenue Coach",
  audience: "VP Sales",
  problem: "low conversion",
  whyNow: "forecast risk",
  solution: "targeted roleplay",
  proof: "22% improvement in pilots",
  differentiation: "persona realism",
  commercialModel: "seat license",
  caseStudy: "Team Alpha",
  ask: "start 30-day trial",
  timeLimit: 120
});
assert.ok(pitch.structured2m.includes("2-minute pitch"));

console.log("Sales & influence tests passed.");
