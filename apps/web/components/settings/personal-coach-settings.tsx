"use client";

import { useState } from "react";

type ModelPreference = {
  task: string;
  provider: string;
  model: string;
  costMode: "lowest_cost" | "balanced" | "best_quality";
  enabled: boolean;
  fallbackProvider?: string;
  fallbackModel?: string;
};

type PersonalProfile = {
  primaryGoal: string;
  targetSituations: string[];
  knownWeaknesses: string[];
  speakingIdentity: string;
  coachStrictness: "supportive" | "balanced" | "direct" | "tough";
  weeklyPracticeMinutes: number;
  currentRealWorldEvent?: string;
  accentOrLanguageNotes?: string;
};

type PersonalCoachSettingsProps = {
  userId: string;
  initialData: {
    personalProfile?: PersonalProfile;
    modelPreferences?: ModelPreference[];
    recentMemory?: Array<{
      id: string;
      createdAt: string;
      situation: string;
      observedWeakness: string;
      priorityFix: string;
      nextDrill: string;
      scoreTotal?: number;
      modelProvider?: string;
      modelName?: string;
    }>;
  } | null;
};

const defaultProfile: PersonalProfile = {
  primaryGoal: "Become clearer, calmer, and more concise in high-stakes professional conversations.",
  targetSituations: ["executive updates", "interviews", "difficult conversations"],
  knownWeaknesses: ["rambling", "not landing the main point early", "filler words under pressure"],
  speakingIdentity: "Calm, concise, commercially sharp leader",
  coachStrictness: "direct",
  weeklyPracticeMinutes: 100,
  currentRealWorldEvent: "",
  accentOrLanguageNotes: ""
};

const defaultPreferences: ModelPreference[] = [
  { task: "feedback", provider: "openai", model: "gpt-4.1-mini", costMode: "lowest_cost", enabled: true, fallbackProvider: "openai", fallbackModel: "gpt-4.1-mini" },
  { task: "transcription", provider: "openai", model: "gpt-4o-mini-transcribe", costMode: "balanced", enabled: true },
  { task: "deepReview", provider: "anthropic", model: "claude-sonnet", costMode: "balanced", enabled: true, fallbackProvider: "openai", fallbackModel: "gpt-4.1-mini" },
  { task: "cheapScoring", provider: "deepseek", model: "deepseek-chat", costMode: "lowest_cost", enabled: true, fallbackProvider: "openai", fallbackModel: "gpt-4.1-mini" },
  { task: "realtimeCoach", provider: "openai", model: "gpt-4o-realtime-preview", costMode: "balanced", enabled: true }
];

const providerOptions = ["openai", "openrouter", "anthropic", "gemini", "deepseek", "mistral", "xai", "groq", "together", "fireworks", "local"];

function listToText(items: string[] | undefined) {
  return (items ?? []).join("\n");
}

function textToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PersonalCoachSettings({ initialData, userId }: PersonalCoachSettingsProps) {
  const [profile, setProfile] = useState<PersonalProfile>(initialData?.personalProfile ?? defaultProfile);
  const [targetSituationsText, setTargetSituationsText] = useState(listToText(initialData?.personalProfile?.targetSituations ?? defaultProfile.targetSituations));
  const [weaknessesText, setWeaknessesText] = useState(listToText(initialData?.personalProfile?.knownWeaknesses ?? defaultProfile.knownWeaknesses));
  const [preferences, setPreferences] = useState<ModelPreference[]>(initialData?.modelPreferences ?? defaultPreferences);
  const [recentMemory, setRecentMemory] = useState(initialData?.recentMemory ?? []);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async () => {
    setSaveState("saving");
    try {
      const response = await fetch(`/coach/personalization?userId=${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personalProfile: {
            ...profile,
            targetSituations: textToList(targetSituationsText),
            knownWeaknesses: textToList(weaknessesText)
          },
          modelPreferences: preferences
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? "Save failed");
      setRecentMemory(payload.recentMemory ?? []);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <section className="grid gap-4">
      <article className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Personal coach profile</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm">
            Primary goal
            <textarea className="rounded-md border border-slate-300 px-3 py-2" rows={2} value={profile.primaryGoal} onChange={(event) => setProfile({ ...profile, primaryGoal: event.target.value })} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Target situations
              <textarea className="rounded-md border border-slate-300 px-3 py-2" rows={5} value={targetSituationsText} onChange={(event) => setTargetSituationsText(event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              Known weaknesses
              <textarea className="rounded-md border border-slate-300 px-3 py-2" rows={5} value={weaknessesText} onChange={(event) => setWeaknessesText(event.target.value)} />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Speaking identity
              <input className="rounded-md border border-slate-300 px-3 py-2" value={profile.speakingIdentity} onChange={(event) => setProfile({ ...profile, speakingIdentity: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">
              Coach strictness
              <select className="rounded-md border border-slate-300 px-3 py-2" value={profile.coachStrictness} onChange={(event) => setProfile({ ...profile, coachStrictness: event.target.value as PersonalProfile["coachStrictness"] })}>
                <option value="direct">Direct</option>
                <option value="tough">Tough</option>
                <option value="balanced">Balanced</option>
                <option value="supportive">Supportive</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Weekly practice minutes
              <input type="number" min={5} max={600} className="rounded-md border border-slate-300 px-3 py-2" value={profile.weeklyPracticeMinutes} onChange={(event) => setProfile({ ...profile, weeklyPracticeMinutes: Number(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-sm">
              Current real-world event
              <input className="rounded-md border border-slate-300 px-3 py-2" value={profile.currentRealWorldEvent ?? ""} onChange={(event) => setProfile({ ...profile, currentRealWorldEvent: event.target.value })} />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Accent or language notes
            <input className="rounded-md border border-slate-300 px-3 py-2" value={profile.accentOrLanguageNotes ?? ""} onChange={(event) => setProfile({ ...profile, accentOrLanguageNotes: event.target.value })} />
          </label>
        </div>
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Cost-first model routing</h2>
        <div className="mt-4 grid gap-3">
          {preferences.map((preference, index) => (
            <div key={preference.task} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr,1fr,1.4fr,1fr,auto]">
              <p className="text-sm font-semibold text-slate-900">{preference.task}</p>
              <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={preference.provider} onChange={(event) => setPreferences(preferences.map((item, itemIndex) => itemIndex === index ? { ...item, provider: event.target.value } : item))}>
                {providerOptions.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
              </select>
              <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={preference.model} onChange={(event) => setPreferences(preferences.map((item, itemIndex) => itemIndex === index ? { ...item, model: event.target.value } : item))} />
              <select className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={preference.costMode} onChange={(event) => setPreferences(preferences.map((item, itemIndex) => itemIndex === index ? { ...item, costMode: event.target.value as ModelPreference["costMode"] } : item))}>
                <option value="lowest_cost">Lowest cost</option>
                <option value="balanced">Balanced</option>
                <option value="best_quality">Best quality</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={preference.enabled} onChange={(event) => setPreferences(preferences.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: event.target.checked } : item))} />
                Enabled
              </label>
            </div>
          ))}
        </div>
        <button type="button" onClick={save} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {saveState === "saving" ? "Saving..." : "Save coach setup"}
        </button>
        {saveState === "saved" ? <p className="mt-2 text-sm text-emerald-700">Saved.</p> : null}
        {saveState === "error" ? <p className="mt-2 text-sm text-red-700">Could not save. Check the API is running.</p> : null}
      </article>

      <article className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Recent coaching memory</h2>
        <div className="mt-3 grid gap-2">
          {recentMemory.length === 0 ? <p className="text-sm text-slate-600">No saved coaching memory yet. Generate feedback after a recording to create one.</p> : null}
          {recentMemory.map((memory) => (
            <div key={memory.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-900">{memory.situation} {memory.scoreTotal ? `- ${memory.scoreTotal}` : ""}</p>
              <p className="text-slate-700">Weakness: {memory.observedWeakness}</p>
              <p className="text-slate-700">Fix: {memory.priorityFix}</p>
              <p className="text-slate-600">Next: {memory.nextDrill}</p>
              <p className="mt-1 text-xs text-slate-500">{memory.modelProvider ?? "model"} / {memory.modelName ?? "not recorded"}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
