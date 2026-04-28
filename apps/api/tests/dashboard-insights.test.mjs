import assert from "node:assert/strict";
import { getDatabase } from "../dist/db/store.js";
import { buildDashboardInsights } from "../dist/services/dashboard-insights-service.js";

const insights = buildDashboardInsights(getDatabase(), "user_001");

assert.equal(Array.isArray(insights.trends.clarity), true);
assert.equal(typeof insights.sessionStreak, "number");
assert.equal(typeof insights.completedSessions, "number");
assert.equal(typeof insights.weeklyReview.oneFocusForNextWeek, "string");
assert.equal(typeof insights.levelProgress.level, "number");

console.log("Dashboard insights tests passed.");
