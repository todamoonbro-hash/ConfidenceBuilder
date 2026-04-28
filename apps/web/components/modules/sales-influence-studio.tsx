"use client";

import { useMemo, useState } from "react";

type Library = {
  scenarios: Array<any>;
  frameworks: Array<{ id: string; label: string }>;
  personas: Array<any>;
  ethicsNotice?: string;
};

export function SalesInfluenceStudio({ library }: { library: Library | null }) {
  const scenarios = library?.scenarios ?? [];
  const frameworks = library?.frameworks ?? [];
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id ?? "");
  const [frameworkId, setFrameworkId] = useState<string>(frameworks[0]?.id ?? "aida");
  const [mode, setMode] = useState<"guided" | "realistic" | "pressure" | "elite">("guided");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [turnInput, setTurnInput] = useState("");
  const [turns, setTurns] = useState<Array<{ role: "persona" | "user"; text: string }>>([]);
  const [report, setReport] = useState<any>();
  const [pitchResult, setPitchResult] = useState<any>();
  const [team, setTeam] = useState<any>();
  const [certs, setCerts] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>();

  const activeScenario = useMemo(() => scenarios.find((item) => item.id === activeScenarioId), [scenarios, activeScenarioId]);

  const startRoleplay = async () => {
    const response = await fetch("/sales-influence/roleplay/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "user_001", scenarioId: activeScenarioId, frameworkId, mode })
    });
    const result = await response.json();
    if (result.ok) {
      setSessionId(result.session.id);
      setTurns(result.session.turns ?? []);
      setReport(undefined);
    }
  };

  const sendTurn = async () => {
    if (!sessionId || !turnInput.trim()) return;
    const response = await fetch("/sales-influence/roleplay/turn", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, userText: turnInput })
    });
    const result = await response.json();
    if (result.ok) {
      setTurns(result.session.turns);
      setTurnInput("");
    }
  };

  const endRoleplay = async () => {
    if (!sessionId) return;
    const response = await fetch("/sales-influence/roleplay/end", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, userId: "user_001" })
    });
    const result = await response.json();
    if (result.ok) {
      setReport(result.report);
      setProgress(result.progress);
      setSessionId(undefined);
    }
  };

  const generatePitch = async () => {
    const response = await fetch("/sales-influence/pitch-builder/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        product: "ConfidenceBuilder Sales Copilot",
        audience: "VP Revenue",
        problem: "inconsistent pitch quality",
        whyNow: "pipeline conversion has declined",
        solution: "scenario-based roleplay with scoring and coaching",
        proof: "teams improve close rates after targeted reps",
        differentiation: "persona realism + framework compliance",
        commercialModel: "SaaS per seat",
        caseStudy: "Pilot improved objection handling by 22%",
        ask: "Approve a 30-day pilot",
        timeLimit: 120
      })
    });
    const result = await response.json();
    if (result.ok) setPitchResult(result.generated);
  };

  const loadTeam = async () => {
    const response = await fetch("/sales-influence/team/overview");
    const result = await response.json();
    if (result.ok) setTeam(result.team);
  };

  const loadCerts = async () => {
    const response = await fetch("/sales-influence/certifications");
    const result = await response.json();
    if (result.ok) setCerts(result.certifications ?? []);
  };

  const loadProgress = async () => {
    const response = await fetch("/sales-influence/progress?userId=user_001");
    const result = await response.json();
    if (result.ok) setProgress(result.progress);
  };

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Ethics</p>
        <p className="mt-1 text-sm text-slate-700">{library?.ethicsNotice ?? "Training and preparation only."}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Scenario library</h2>
        <p className="mt-1 text-sm text-slate-600">Sub-sections: Pitch Practice, Discovery Call, Objection Handling, Investor Pitch, Product Demo, Negotiation, Team Conversations, Certification, Progress.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <button key={scenario.id} type="button" onClick={() => setActiveScenarioId(scenario.id)} className={`rounded-xl border p-3 text-left ${activeScenarioId === scenario.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
              <p className="text-sm font-semibold text-slate-900">{scenario.title}</p>
              <p className="mt-1 text-xs text-slate-600">{scenario.category} · {scenario.difficultyLevel} · {scenario.estimatedDurationMinutes} min</p>
              <p className="mt-2 text-xs text-slate-500">{scenario.scenarioBrief}</p>
            </button>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Roleplay</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm">Framework
            <select value={frameworkId} onChange={(event: { target: { value: string } }) => setFrameworkId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {frameworks.map((framework) => <option key={framework.id} value={framework.id}>{framework.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Practice mode
            <select value={mode} onChange={(event: { target: { value: string } }) => setMode(event.target.value as any)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="guided">Guided</option>
              <option value="realistic">Realistic</option>
              <option value="pressure">Pressure Mode</option>
              <option value="elite">Elite Mode</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={startRoleplay} disabled={!activeScenarioId} className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">Start roleplay</button>
          </div>
        </div>

        {activeScenario ? <p className="mt-3 text-sm text-slate-700"><strong>Setup:</strong> {activeScenario.scenarioBrief}</p> : null}

        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          {turns.length === 0 ? <p className="text-slate-600">Start a roleplay to begin simulation.</p> : turns.map((turn, idx) => <p key={idx}><strong>{turn.role === "persona" ? "AI Persona" : "You"}:</strong> {turn.text}</p>)}
        </div>

        <div className="mt-3 flex gap-2">
          <input value={turnInput} onChange={(event: { target: { value: string } }) => setTurnInput(event.target.value)} placeholder="Type your response (or use recorder in Session page)." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button type="button" onClick={sendTurn} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Send</button>
          <button type="button" onClick={endRoleplay} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white">End + score</button>
        </div>
      </article>

      {report ? (
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="text-lg font-semibold">Feedback report</h2>
          <p className="mt-1">Overall score: {report.overallScore} · XP earned: {report.xpEarned} · Framework compliance: {report.frameworkComplianceScore}</p>
          <p className="mt-1">Top strengths: {(report.topStrengths ?? []).join(", ")}</p>
          <p className="mt-1">Top weaknesses: {(report.topWeaknesses ?? []).join(", ")}</p>
          <p className="mt-1">Best line: {report.bestLine}</p>
          <p className="mt-1">Weakest line: {report.weakestLine}</p>
          <p className="mt-1">Recommended next drill: {report.recommendedNextDrill}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={startRoleplay} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">Retry</button>
            <button
              type="button"
              onClick={async () => {
                await fetch("/sales-influence/pitch-bank/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: "user_001", scenarioId: activeScenarioId, bestLine: report.bestLine, strongerVersion: report.suggestedStrongerVersion }) });
              }}
              className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-900"
            >
              Save to story/pitch bank
            </button>
          </div>
        </article>
      ) : null}

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Pitch Builder</h2>
        <button type="button" onClick={generatePitch} className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">Generate pitch variants</button>
        {pitchResult ? <pre className="mt-3 overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(pitchResult, null, 2)}</pre> : null}
      </article>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Team Conversations</h3>
          <button type="button" onClick={loadTeam} className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm">Load team dashboard</button>
          {team ? <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs">{JSON.stringify(team.cards, null, 2)}</pre> : <p className="mt-2 text-sm text-slate-600">Manager/team schema placeholders are ready for future multi-user auth activation.</p>}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Certification</h3>
          <button type="button" onClick={loadCerts} className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm">Load tracks</button>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {certs.map((cert) => <li key={cert.id}>{cert.title} (min avg {cert.minimumAverageScore})</li>)}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Progress</h3>
          <button type="button" onClick={loadProgress} className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm">Refresh progress</button>
          {progress ? <p className="mt-2 text-sm text-slate-700">Level {progress.level} · XP {progress.overallXp}</p> : <p className="mt-2 text-sm text-slate-600">No progress yet.</p>}
        </article>
      </section>
    </section>
  );
}
