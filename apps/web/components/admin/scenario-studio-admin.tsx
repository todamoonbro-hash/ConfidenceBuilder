"use client";

import { useEffect, useMemo, useState } from "react";

const modules = [
  "networking",
  "difficult_conversations",
  "executive_presence",
  "sales_influence",
  "interview_prep",
  "public_speaking"
];

const defaultScenario = {
  title: "",
  module: "networking",
  category: "Introductions",
  difficulty: "moderate",
  scenarioBrief: "",
  userRole: "Founder",
  aiPersonaRole: "Investor",
  aiPersonaDescription: "Skeptical and time-constrained stakeholder",
  aiPersonaBehaviour: "Direct, practical, asks for specifics",
  openingAiLine: "You have 30 seconds. What is your ask?",
  likelyFollowUpQuestions: ["Why now?", "What proof do you have?"],
  resistanceLevel: "medium",
  successCriteria: ["Lead with answer", "Use one proof point"],
  scoringDimensions: [
    {
      name: "Clarity",
      description: "Lead with the point",
      anchors: {
        score0: "No clear point",
        score25: "Mostly unclear",
        score50: "Partially clear",
        score75: "Clear",
        score100: "Crisp and immediate"
      },
      critical: true
    }
  ],
  feedbackRules: ["Name one behaviour to repeat", "Name one behaviour to fix"],
  coachingFramework: "BLUF",
  estimatedDurationMinutes: 12,
  tags: ["admin"],
  unlockRequirements: ["level >= 2"],
  xpReward: 120,
  badgeEligibility: ["Direct Communicator"],
  passFailThreshold: 70,
  personaBuilder: {
    personaName: "Skeptical stakeholder",
    tone: "direct",
    mood: "neutral",
    expertiseLevel: "high",
    patienceLevel: "medium",
    pushbackLevel: "high",
    commonObjections: ["Too vague"],
    whatPersuadesPersona: ["Evidence"],
    whatAnnoysPersona: ["Long setup"],
    escalationBehaviour: "asks harder follow-up"
  },
  active: true,
  published: false,
  archived: false
};

export function ScenarioStudioAdmin({ role }: { role: string }) {
  const [selectedModule, setSelectedModule] = useState("networking");
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(defaultScenario);
  const [testResult, setTestResult] = useState<any>(null);

  async function load() {
    const response = await fetch(`/admin/scenario-studio/api/scenarios?role=${role}&module=${selectedModule}&includeArchived=true`);
    const payload = await response.json();
    setScenarios(payload.scenarios ?? []);
  }

  useEffect(() => {
    void load();
  }, [selectedModule]);

  const selected = useMemo(() => scenarios.find((item) => item.id === selectedId), [scenarios, selectedId]);

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Scenario controls</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <select className="rounded-md border border-slate-300 px-2 py-1" value={selectedModule} onChange={(event: { target: { value: string } }) => setSelectedModule(event.target.value)}>
            {modules.map((module) => <option key={module}>{module}</option>)}
          </select>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={() => { setSelectedId(null); setForm(defaultScenario); }}>Create scenario</button>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={load}>Refresh</button>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[1.1fr,1.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Existing scenarios</h3>
          <div className="mt-2 grid gap-2 text-sm">
            {scenarios.map((scenario) => (
              <button key={scenario.id} onClick={() => { setSelectedId(scenario.id); setForm(scenario); }} className="rounded-lg border border-slate-200 p-2 text-left">
                <p className="font-semibold">{scenario.title}</p>
                <p className="text-xs text-slate-600">{scenario.category} · {scenario.difficulty} · {scenario.published ? "published" : "draft"}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Scenario builder</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.title} onChange={(event: { target: { value: string } }) => setForm({ ...form, title: event.target.value })} placeholder="title" />
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.category} onChange={(event: { target: { value: string } }) => setForm({ ...form, category: event.target.value })} placeholder="category" />
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.userRole} onChange={(event: { target: { value: string } }) => setForm({ ...form, userRole: event.target.value })} placeholder="user role" />
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.aiPersonaRole} onChange={(event: { target: { value: string } }) => setForm({ ...form, aiPersonaRole: event.target.value })} placeholder="ai persona role" />
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.difficulty} onChange={(event: { target: { value: string } }) => setForm({ ...form, difficulty: event.target.value })} placeholder="difficulty" />
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.xpReward} onChange={(event: { target: { value: string } }) => setForm({ ...form, xpReward: Number(event.target.value) })} placeholder="xp reward" />
          </div>
          <textarea className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.scenarioBrief} onChange={(event: { target: { value: string } }) => setForm({ ...form, scenarioBrief: event.target.value })} placeholder="scenario brief" rows={3} />
          <textarea className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={form.openingAiLine} onChange={(event: { target: { value: string } }) => setForm({ ...form, openingAiLine: event.target.value })} placeholder="opening ai line" rows={2} />

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <button className="rounded-md bg-slate-900 px-3 py-1 text-white" onClick={async () => {
              const method = selectedId ? "PUT" : "POST";
              const payload = selectedId ? { ...form, id: selectedId } : form;
              await fetch("/admin/scenario-studio/api/scenarios", {
                method,
                headers: { "content-type": "application/json", "x-user-role": role },
                body: JSON.stringify(payload)
              });
              await load();
            }}>{selectedId ? "Save changes" : "Create"}</button>

            {selectedId ? <button className="rounded-md border border-slate-300 px-3 py-1" onClick={async () => {
              await fetch(`/admin/scenario-studio/api/scenarios/${selectedId}/action`, {
                method: "POST",
                headers: { "content-type": "application/json", "x-user-role": role },
                body: JSON.stringify({ action: "duplicate" })
              });
              await load();
            }}>Duplicate</button> : null}

            {selectedId ? <button className="rounded-md border border-slate-300 px-3 py-1" onClick={async () => {
              await fetch(`/admin/scenario-studio/api/scenarios/${selectedId}/action`, {
                method: "POST",
                headers: { "content-type": "application/json", "x-user-role": role },
                body: JSON.stringify({ action: selected?.published ? "unpublish" : "publish" })
              });
              await load();
            }}>{selected?.published ? "Unpublish" : "Publish"}</button> : null}

            {selectedId ? <button className="rounded-md border border-rose-300 px-3 py-1 text-rose-700" onClick={async () => {
              await fetch(`/admin/scenario-studio/api/scenarios/${selectedId}/action`, {
                method: "POST",
                headers: { "content-type": "application/json", "x-user-role": role },
                body: JSON.stringify({ action: "archive" })
              });
              await load();
            }}>Archive</button> : null}

            {selectedId ? <button className="rounded-md border border-emerald-300 px-3 py-1 text-emerald-700" onClick={async () => {
              const response = await fetch(`/admin/scenario-studio/api/scenarios/${selectedId}/action`, {
                method: "POST",
                headers: { "content-type": "application/json", "x-user-role": role },
                body: JSON.stringify({ action: "test" })
              });
              setTestResult(await response.json());
            }}>Test persona & rubric</button> : null}
          </div>

          {testResult ? <pre className="mt-3 overflow-x-auto rounded-md bg-slate-900 p-3 text-xs text-white">{JSON.stringify(testResult, null, 2)}</pre> : null}
        </article>
      </div>
    </section>
  );
}
