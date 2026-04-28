"use client";

import { useState } from "react";

export function InterviewPrepStudio({ library }: { library: any }) {
  const [setupSaved, setSetupSaved] = useState<any>();
  const [stories, setStories] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<Array<{ role: "interviewer" | "candidate"; text: string }>>([]);
  const [report, setReport] = useState<any>();
  const [variants, setVariants] = useState<any>();
  const [positioning, setPositioning] = useState<any>();
  const [plan, setPlan] = useState<any>();
  const [progress, setProgress] = useState<any>();

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Ethics</p>
        <p className="mt-1 text-sm text-slate-700">{library?.ethicsNotice}</p>
        <p className="mt-1 text-xs text-slate-600">No hidden live interview assistance or stealth mode is provided.</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Role Setup</h2>
        <p className="text-sm text-slate-600">Sub-sections: Role Setup, Story Bank, Mock Interview, Behavioural, Technical/Role, Executive, Pressure, Feedback Reports, Interview Plan.</p>
        <button
          type="button"
          className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          onClick={async () => {
            const payload = {
              userId: "user_001",
              targetRoleTitle: "VP Finance",
              company: "Northstar Tech",
              industry: "SaaS",
              seniority: "senior",
              jobDescription: "Lead planning and FP&A",
              resumeText: "Finance leader with transformation background",
              linkedInText: "Operator and strategist",
              interviewStage: "hiring_manager",
              interviewFormat: "video",
              interviewDate: "2026-06-20",
              knownInterviewers: ["Hiring Manager"],
              keyConcerns: ["industry depth"],
              targetCompensation: "$240k",
              mustSayPoints: ["led turnaround", "improved forecasting"],
              topicsToAvoid: ["confidential details"]
            };
            const response = await fetch("/interview-prep/role-setup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.ok) setSetupSaved(result);
          }}
        >
          Save sample role setup
        </button>
        {setupSaved ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(setupSaved.generated, null, 2)}</pre> : null}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Story Bank</h2>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            onClick={async () => {
              await fetch("/interview-prep/story-bank", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  userId: "user_001",
                  title: "Led change under pressure",
                  situation: "revenue decline",
                  task: "stabilize operations",
                  action: "restructured rhythm and ownership",
                  result: "restored growth",
                  metrics: "+11% run-rate",
                  leadershipLesson: "clarity first",
                  conflictElement: "cross-functional tension",
                  failureLearningElement: "first plan too broad",
                  stakeholderElement: "CEO + product + sales",
                  tags: ["leadership"],
                  relevantCompetencies: ["influence", "execution"],
                  polished60Second: "60 sec version",
                  polished2Minute: "2 minute version",
                  weaknessRiskNotes: "avoid too much context"
                })
              });
              const listRes = await fetch("/interview-prep/story-bank?userId=user_001");
              const list = await listRes.json();
              if (list.ok) setStories(list.stories);
            }}
          >
            Add sample story
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-700">Stories saved: {stories.length}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Mock Interview</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
            const response = await fetch("/interview-prep/mock/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", mode: "recruiter_screen" }) });
            const result = await response.json();
            if (result.ok) {
              setSessionId(result.session.id);
              setTurns(result.session.turns);
            }
          }}>Start recruiter mock</button>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            if (!sessionId || !answer.trim()) return;
            const response = await fetch("/interview-prep/mock/turn", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, answer }) });
            const result = await response.json();
            if (result.ok) {
              setTurns(result.session.turns);
              setAnswer("");
            }
          }}>Send answer</button>
          <button type="button" className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white" onClick={async () => {
            if (!sessionId) return;
            const response = await fetch("/interview-prep/mock/end", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, userId: "user_001" }) });
            const result = await response.json();
            if (result.ok) {
              setReport(result.report);
              setProgress(result.progress);
              setSessionId(undefined);
            }
          }}>End + score</button>
        </div>
        <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={answer} onChange={(event: { target: { value: string } }) => setAnswer(event.target.value)} placeholder="Type answer or practice out loud in Session recorder first." />
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm">
          {turns.map((turn, idx) => <p key={idx}><strong>{turn.role === "interviewer" ? "Interviewer" : "You"}:</strong> {turn.text}</p>)}
        </div>
      </article>

      {report ? <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <h2 className="text-lg font-semibold">Feedback Reports</h2>
        <p>Readiness: {report.overallReadinessScore} · Hireability: {report.hireabilitySignal}</p>
        <p>Top strengths: {(report.topStrengths ?? []).join(", ")}</p>
        <p>Top risks: {(report.topRisks ?? []).join(", ")}</p>
        <p>Best answer: {report.bestAnswer}</p>
        <p>Weakest answer: {report.weakestAnswer}</p>
      </article> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Answer Builder</h3>
          <button type="button" className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            const response = await fetch("/interview-prep/answer-builder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "Why this role?", rawAnswer: "I enjoy leading high-impact transformation work." }) });
            const result = await response.json();
            if (result.ok) setVariants(result.variants);
          }}>Generate variants</button>
          {variants ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(variants, null, 2)}</pre> : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Personal Positioning</h3>
          <button type="button" className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            const response = await fetch("/interview-prep/positioning", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(setupSaved?.setup ?? {
              userId: "user_001", targetRoleTitle: "VP Finance", company: "Northstar Tech", industry: "SaaS", seniority: "senior", jobDescription: "", resumeText: "", linkedInText: "", interviewStage: "", interviewFormat: "video", knownInterviewers: [], keyConcerns: [], mustSayPoints: [], topicsToAvoid: []
            }) });
            const result = await response.json();
            if (result.ok) setPositioning(result.positioning);
          }}>Generate positioning pack</button>
          {positioning ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(positioning, null, 2)}</pre> : null}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Interview Plan</h3>
          <button type="button" className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            const response = await fetch("/interview-prep/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", interviewDate: "2026-06-20", roleTitle: "VP Finance" }) });
            const result = await response.json();
            if (result.ok) setPlan(result.plan);
          }}>Generate prep plan</button>
          {plan ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(plan, null, 2)}</pre> : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Post-Interview Reflection</h3>
          <button type="button" className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            await fetch("/interview-prep/reflection", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", questionsAsked: ["Why this role?"], answersWentWell: ["positioning"], answersFailed: ["weakness answer"], objectionsConcerns: ["industry depth"], followUpRequired: "share KPI example", improvementsNextTime: "more concise", requestFollowUpEmail: true }) });
            const pRes = await fetch("/interview-prep/progress?userId=user_001");
            const p = await pRes.json();
            if (p.ok) setProgress(p);
          }}>Save reflection + refresh progress</button>
          {progress ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(progress, null, 2)}</pre> : null}
        </article>
      </section>
    </section>
  );
}
