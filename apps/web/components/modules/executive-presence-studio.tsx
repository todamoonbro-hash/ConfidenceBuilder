"use client";

import { useMemo, useState } from "react";

export function ExecutivePresenceStudio({ library }: { library: any }) {
  const scenarios = library?.scenarios ?? [];
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0]?.id ?? "");
  const [framework, setFramework] = useState<string>(library?.frameworks?.[0] ?? "BLUF");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<15 | 30 | 60 | 120>(30);
  const [pressureMode, setPressureMode] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [answer, setAnswer] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(20);
  const [turns, setTurns] = useState<Array<{ role: "persona" | "user"; text: string }>>([]);
  const [report, setReport] = useState<any>();
  const [progress, setProgress] = useState<any>();

  const scenario = useMemo(() => scenarios.find((item: any) => item.id === scenarioId), [scenarios, scenarioId]);

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Ethics</p>
        <p className="mt-1 text-sm text-slate-700">{library?.ethicsNotice}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Scenario selection</h2>
        <p className="text-sm text-slate-600">Sub-sections: {(library?.subSections ?? []).join(" · ")}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((item: any) => (
            <button key={item.id} type="button" onClick={() => setScenarioId(item.id)} className={`rounded-lg border p-3 text-left ${scenarioId === item.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-slate-600">{item.subsection} · {item.pressureLevel}</p>
            </button>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Practice</h2>
        <div className="mt-2 grid gap-3 md:grid-cols-4">
          <label className="text-sm">Framework
            <select className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2" value={framework} onChange={(event: { target: { value: string } }) => setFramework(event.target.value)}>
              {(library?.frameworks ?? []).map((item: string) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm">Time limit
            <select className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2" value={timeLimitSeconds} onChange={(event: { target: { value: string } }) => setTimeLimitSeconds(Number(event.target.value) as 15 | 30 | 60 | 120)}>
              <option value={15}>15 sec</option>
              <option value={30}>30 sec</option>
              <option value={60}>60 sec</option>
              <option value={120}>2 min</option>
            </select>
          </label>
          <label className="text-sm">Elapsed seconds
            <input className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2" type="number" min={1} max={200} value={elapsedSeconds} onChange={(event: { target: { value: string } }) => setElapsedSeconds(Number(event.target.value))} />
          </label>
          <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={pressureMode} onChange={(event: { target: { checked: boolean } }) => setPressureMode(event.target.checked)} /> Pressure mode</label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
            const response = await fetch("/executive-presence/session/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", scenarioId, framework, pressureMode, timeLimitSeconds }) });
            const result = await response.json();
            if (result.ok) {
              setSessionId(result.session.id);
              setTurns(result.session.turns);
              setReport(undefined);
            }
          }}>Start scenario</button>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            if (!sessionId || !answer.trim()) return;
            const response = await fetch("/executive-presence/session/turn", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, answer, elapsedSeconds }) });
            const result = await response.json();
            if (result.ok) {
              setTurns(result.session.turns);
              setAnswer("");
            }
          }}>Submit answer</button>
          <button type="button" className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white" onClick={async () => {
            if (!sessionId) return;
            const response = await fetch("/executive-presence/session/end", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, userId: "user_001" }) });
            const result = await response.json();
            if (result.ok) {
              setReport(result.report);
              setProgress(result.progress);
              setSessionId(undefined);
            }
          }}>End + report</button>
        </div>

        {scenario ? <p className="mt-2 text-sm text-slate-700"><strong>Scenario brief:</strong> {scenario.brief}</p> : null}
        <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={answer} onChange={(event: { target: { value: string } }) => setAnswer(event.target.value)} placeholder="Answer with point, evidence, implication, and recommendation." />
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          {turns.map((turn, idx) => <p key={idx}><strong>{turn.role === "persona" ? "AI" : "You"}:</strong> {turn.text}</p>)}
        </div>
      </article>

      {report ? (
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p>Executive Presence score: {report.executivePresenceScore}</p>
          <p>Answered actual question: {String(report.checks.answeredActualQuestion)}</p>
          <p>Too long: {String(report.checks.tooLong)}</p>
          <p>Led with point: {String(report.checks.ledWithPoint)}</p>
          <p>Sounded defensive: {String(report.checks.soundedDefensive)}</p>
          <p>Used evidence: {String(report.checks.usedEvidence)}</p>
          <p>Clear recommendation: {String(report.checks.clearRecommendation)}</p>
          <p>Created confidence: {String(report.checks.createdConfidence)}</p>
          <p className="mt-2">Top fix: {report.topFix}</p>
        </article>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Presence Drills</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {(library?.drills ?? []).map((drill: string) => <li key={drill}>{drill}</li>)}
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Gamification</h3>
          <p className="mt-2 text-sm text-slate-700">Badges: {(library?.badges ?? []).join(", ")}</p>
          {progress ? <p className="mt-2 text-sm text-slate-700">Level {progress.level} · XP {progress.overallXp}</p> : null}
        </article>
      </section>
    </section>
  );
}
