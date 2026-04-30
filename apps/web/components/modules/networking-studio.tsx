"use client";

import { useMemo, useState } from "react";

export function NetworkingStudio({ library }: { library: any }) {
  const scenarios = library?.scenarios ?? [];
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0]?.id ?? "");
  const [framework, setFramework] = useState<string>(library?.frameworks?.[0] ?? "Warm opener: context, observation, question");
  const [persona, setPersona] = useState<string>(library?.personas?.[0] ?? "conference_attendee");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Array<{ role: "persona" | "user"; text: string }>>([]);
  const [result, setResult] = useState<any>();

  const scenario = useMemo(() => scenarios.find((item: any) => item.id === scenarioId), [scenarios, scenarioId]);

  return (
    <section className="grid gap-4">
      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Ethics</p>
        <p className="mt-1 text-sm text-slate-700">{library?.ethicsNotice}</p>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Scenario library</h2>
        <p className="text-sm text-slate-600">Sub-sections: {(library?.subSections ?? []).join("  -  ")}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((item: any) => (
            <button key={item.id} type="button" onClick={() => setScenarioId(item.id)} className={`rounded-lg border p-3 text-left ${scenarioId === item.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-slate-600">{item.subsection}</p>
            </button>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Roleplay</h2>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <label className="text-sm">Framework
            <select className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2" value={framework} onChange={(event: { target: { value: string } }) => setFramework(event.target.value)}>
              {(library?.frameworks ?? []).map((item: string) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm">Persona
            <select className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2" value={persona} onChange={(event: { target: { value: string } }) => setPersona(event.target.value)}>
              {(library?.personas ?? []).map((item: string) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={async () => {
            const response = await fetch("/networking/session/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", scenarioId, framework, persona }) });
            const payload = await response.json();
            if (payload.ok) {
              setSessionId(payload.session.id);
              setTurns(payload.session.turns);
              setResult(undefined);
            }
          }}>Start</button>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={async () => {
            if (!sessionId || !text.trim()) return;
            const response = await fetch("/networking/session/turn", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, text }) });
            const payload = await response.json();
            if (payload.ok) {
              setTurns(payload.session.turns);
              setText("");
            }
          }}>Send</button>
          <button type="button" className="rounded-md bg-emerald-700 px-3 py-2 text-sm text-white" onClick={async () => {
            if (!sessionId) return;
            const response = await fetch("/networking/session/end", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, userId: "user_001" }) });
            const payload = await response.json();
            if (payload.ok) {
              setResult(payload);
              setSessionId(undefined);
            }
          }}>End + feedback</button>
        </div>

        {scenario ? <p className="mt-2 text-sm text-slate-700"><strong>Scenario:</strong> {scenario.title}</p> : null}
        <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={text} onChange={(event: { target: { value: string } }) => setText(event.target.value)} placeholder="Practice your opener, follow-up, or ask." />

        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          {turns.map((turn, idx) => <p key={idx}><strong>{turn.role === "persona" ? "AI" : "You"}:</strong> {turn.text}</p>)}
        </div>
      </article>

      {result ? (
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="text-lg font-semibold">Reports</h2>
          <p>Warmth: {result.report.scores.warmth}  -  Clarity: {result.report.scores.clarity}  -  Confidence: {result.report.scores.confidence}</p>
          <p>Rapport score: {result.report.rapportScore}  -  Ask clarity score: {result.report.askClarityScore}</p>
          <p>Desperation detector triggered: {String(result.report.desperationDetector.triggered)}</p>
          <p>Detector coaching: {result.report.desperationDetector.coaching}</p>
          <p>Follow-up draft: {result.report.followUpDraft}</p>
          <p>Badges earned: {(result.earnedBadges ?? []).join(", ") || "None yet"}</p>
        </article>
      ) : null}
    </section>
  );
}
