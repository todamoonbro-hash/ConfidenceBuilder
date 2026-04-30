"use client";

import { useState } from "react";

export function CoachHub({ initialData, userId }: { initialData: any; userId: string }) {
  const [data, setData] = useState<any>(initialData);

  const coach = data?.coach;
  const personalProfile = data?.personalProfile;
  const modelPreferences = data?.modelPreferences ?? [];
  const recentMemory = data?.recentMemory ?? [];

  return (
    <section className="grid gap-4">
      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Today's Training</h2>
            <p className="text-sm text-slate-600">Quick win, core drill, and stretch drill generated from recent performance.</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            onClick={async () => {
              const response = await fetch(`/coach/overview?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
              const payload = await response.json();
              setData(payload);
            }}
          >
            Refresh recommendations
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(coach?.recommendedDrills ?? []).map((drill: any) => (
            <div key={drill.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{drill.drillType.replace("_", " ")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{drill.title}</p>
              <p className="mt-1 text-xs text-slate-600">{drill.reason}</p>
              <p className="mt-2 text-xs text-slate-700">Benefit: {drill.expectedBenefit}</p>
              <p className="text-xs text-slate-700">Duration: {drill.estimatedDurationMinutes}m - XP: {drill.xpReward}</p>
              <a href={drill.startPath} className="mt-2 inline-block rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white">Start drill</a>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Personal Coach Context</h2>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
            <p><strong>Goal:</strong> {personalProfile?.primaryGoal ?? "Not configured"}</p>
            <p className="mt-1"><strong>Identity:</strong> {personalProfile?.speakingIdentity ?? "Not configured"}</p>
            <p className="mt-1"><strong>Weaknesses:</strong> {(personalProfile?.knownWeaknesses ?? []).join(", ") || "Not configured"}</p>
            <p className="mt-1"><strong>Event:</strong> {personalProfile?.currentRealWorldEvent || "None"}</p>
            <a href="/settings" className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white">Tune profile</a>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-semibold">Cost routing</p>
            {(modelPreferences as any[]).slice(0, 5).map((item) => (
              <p key={item.task} className="mt-1">{item.task}: {item.provider}/{item.model} ({String(item.costMode).replace("_", " ")})</p>
            ))}
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Weakness Map</h2>
        <p className="mt-1 text-sm text-slate-600">Lowest skills, trends, gaps, and module-practice imbalances.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p><strong>Lowest skills:</strong> {(coach?.weaknessMap?.lowestScoringSkills ?? []).join(", ") || "N/A"}</p>
            <p><strong>Declining:</strong> {(coach?.weaknessMap?.decliningSkills ?? []).join(", ") || "None"}</p>
            <p><strong>Improving:</strong> {(coach?.weaknessMap?.improvingSkills ?? []).join(", ") || "None"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
            <p>Confidence gap: {coach?.weaknessMap?.confidenceGap ?? 0}</p>
            <p>Pressure-mode gap: {coach?.weaknessMap?.pressureModeGap ?? 0}</p>
            <p>Delivery vs content gap: {coach?.weaknessMap?.deliveryVsContentGap ?? 0}</p>
            <p>Avoided modules: {(coach?.weaknessMap?.avoidedModules ?? []).join(", ") || "None"}</p>
            <p>Over-practised modules: {(coach?.weaknessMap?.overPractisedModules ?? []).join(", ") || "None"}</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Skill Tree</h2>
        <p className="text-sm text-slate-600">Foundation {"->"} Controlled Practice {"->"} Realistic Practice {"->"} Pressure Practice {"->"} Elite Performance</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {(coach?.userSkillTree ?? []).map((node: any) => (
            <div key={node.skill} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold capitalize">{String(node.skill).replaceAll("_", " ")}</p>
              <p className="text-slate-600">{node.currentLevel}</p>
              <p className="text-slate-600">Progress: {node.progressPercent}%</p>
              <p className="text-slate-600">Unlocked drills: {node.unlockedDrills}</p>
              <p className="text-slate-600">Next unlock: {node.nextUnlock}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Weekly Review</h2>
          <div className="mt-2 text-sm text-slate-700">
            <p>Practice time: {coach?.weeklyReviews?.totalPracticeMinutes ?? 0} minutes</p>
            <p>Sessions: {coach?.weeklyReviews?.sessionsCompleted ?? 0}</p>
            <p>XP earned: {coach?.weeklyReviews?.xpEarned ?? 0}</p>
            <p>Strongest module: {coach?.weeklyReviews?.strongestModule ?? "N/A"}</p>
            <p>Weakest module: {coach?.weeklyReviews?.weakestModule ?? "N/A"}</p>
            <p>Best performance: {coach?.weeklyReviews?.bestPerformance ?? 0}</p>
            <p>Worst performance: {coach?.weeklyReviews?.worstPerformance ?? 0}</p>
            <p>Next-week focus: {coach?.weeklyReviews?.recommendedFocus ?? "N/A"}</p>
            <p className="mt-2 italic">{coach?.weeklyReviews?.reflectionPrompt}</p>
          </div>
        </article>

        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="text-lg font-semibold">Coach</h2>
          <p className="mt-1">{coach?.coachingPlan?.dailyInstruction}</p>
          <p className="mt-1">{coach?.coachingPlan?.weeklyInstruction}</p>
          <p className="mt-2"><strong>Focus order:</strong> {(coach?.coachingPlan?.focusOrder ?? []).join(" -> ")}</p>
          <p className="mt-2 text-xs">Mode: direct, practical, motivating. No fluff.</p>
        </article>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-lg font-semibold">Progress</h2>
        <p>Level {coach?.progress?.level ?? 1} - XP {coach?.progress?.overallXp ?? 0} - Difficulty {coach?.progress?.currentDifficulty ?? "Easy"}</p>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-lg font-semibold">Recent Coaching Memory</h2>
        {recentMemory.length === 0 ? <p className="mt-1 text-slate-600">No saved coaching memory yet.</p> : null}
        <div className="mt-2 grid gap-2">
          {(recentMemory as any[]).map((memory) => (
            <div key={memory.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{memory.situation} {memory.scoreTotal ? `- ${memory.scoreTotal}` : ""}</p>
              <p>Weakness: {memory.observedWeakness}</p>
              <p>Fix: {memory.priorityFix}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
