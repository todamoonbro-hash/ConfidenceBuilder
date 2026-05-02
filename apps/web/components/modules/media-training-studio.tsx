"use client";

import { useMemo, useState } from "react";
import { DEFAULT_USER_ID } from "../../lib/user";
import { VoiceRecorder } from "../session/voice-recorder";

type MediaDrill = {
  id: string;
  title: string;
  scenario: string;
  instruction: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging" | "Pressure";
  simulationType: string;
};

type MediaTrainingStudioProps = {
  drills: MediaDrill[];
};

export function MediaTrainingStudio({ drills }: MediaTrainingStudioProps) {
  const [messages, setMessages] = useState<string[]>(["", "", ""]);
  const [savedMessage, setSavedMessage] = useState<string>("Add 3-4 key messages, then save.");
  const [selectedDrillId, setSelectedDrillId] = useState<string>(drills[0]?.id ?? "");
  const [simulationFilter, setSimulationFilter] = useState<string>("all");
  const [longAnswer, setLongAnswer] = useState("");
  const [soundbiteResult, setSoundbiteResult] = useState<
    | {
        coreMessage: string;
        soundbites: { tenSecond: string; twentySecond: string; fortyFiveSecond: string };
        versions: { plainEnglish: string; executive: string; mediaSafe: string };
        flags: { jargon: string[]; hedging: string[]; defensive: string[] };
        strongerLandingLine: string;
      }
    | undefined
  >();
  const [selectedPracticeLength, setSelectedPracticeLength] = useState<"tenSecond" | "twentySecond" | "fortyFiveSecond">("tenSecond");
  const [crisisScenarioType, setCrisisScenarioType] = useState<string>("hostile_journalist_question");
  const [crisisQuestion, setCrisisQuestion] = useState<string>("");

  const filteredDrills = useMemo(() => {
    if (simulationFilter === "all") {
      return drills;
    }

    return drills.filter((drill) => drill.simulationType === simulationFilter);
  }, [drills, simulationFilter]);

  const selectedDrill = drills.find((item) => item.id === selectedDrillId) ?? filteredDrills[0];

  const saveKeyMessages = async () => {
    const clean = messages.map((item) => item.trim()).filter(Boolean).slice(0, 4);
    if (clean.length < 3) {
      setSavedMessage("Please enter at least 3 key messages.");
      return;
    }

    const response = await fetch("/modules/media/key-messages", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ userId: DEFAULT_USER_ID, messages: clean })
    });

    const result = await response.json();
    setSavedMessage(response.ok && result.ok ? "Key messages saved." : "Unable to save key messages.");
  };

  const transformSoundbite = async () => {
    const response = await fetch("/session/media/soundbite/transform", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ answer: longAnswer })
    });

    const result = await response.json();
    setSoundbiteResult(response.ok && result.ok ? result.transformed : undefined);
  };

  const startCrisisSimulation = async () => {
    const response = await fetch("/session/media/crisis/start", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ scenarioType: crisisScenarioType })
    });

    const result = await response.json();
    setCrisisQuestion(response.ok && result.ok ? result.simulation.openingQuestion : "");
  };

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Media Training</h2>
        <p className="mt-1 text-sm text-slate-600">Build message discipline, then practice calm answers under pressure.</p>

        <div className="mt-3 rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium">Key message builder (3-4 messages)</p>
          {messages.map((message, index) => (
            <input
              key={`msg_${index}`}
              value={message}
              placeholder={`Key message ${index + 1}`}
              onChange={(event: { target: { value: string } }) => {
                const next = [...messages];
                next[index] = event.target.value;
                setMessages(next);
              }}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          ))}
          <button
            type="button"
            onClick={() => messages.length < 4 && setMessages([...messages, ""]) }
            className="mt-2 rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            Add message slot
          </button>
          <button type="button" onClick={saveKeyMessages} className="ml-2 mt-2 rounded-md bg-slate-900 px-3 py-1 text-xs text-white">
            Save key messages
          </button>
          <p className="mt-2 text-xs text-slate-600">{savedMessage}</p>
        </div>

        <div className="mt-3 rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium">Soundbite editor</p>
          <textarea
            value={longAnswer}
            onChange={(event: { target: { value: string } }) => setLongAnswer(event.target.value)}
            placeholder="Paste transcript or type a long answer here."
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="button" onClick={transformSoundbite} className="mt-2 rounded-md bg-brand-600 px-3 py-1 text-xs text-white">
            Generate concise versions
          </button>

          {soundbiteResult ? (
            <div className="mt-3 rounded-md bg-slate-50 p-2 text-xs">
              <p>
                <strong>Core message:</strong> {soundbiteResult.coreMessage}
              </p>
              <p className="mt-1">
                <strong>10s:</strong> {soundbiteResult.soundbites.tenSecond}
              </p>
              <p className="mt-1">
                <strong>20s:</strong> {soundbiteResult.soundbites.twentySecond}
              </p>
              <p className="mt-1">
                <strong>45s:</strong> {soundbiteResult.soundbites.fortyFiveSecond}
              </p>
              <p className="mt-1">
                <strong>Plain-English:</strong> {soundbiteResult.versions.plainEnglish}
              </p>
              <p className="mt-1">
                <strong>Executive:</strong> {soundbiteResult.versions.executive}
              </p>
              <p className="mt-1">
                <strong>Media-safe:</strong> {soundbiteResult.versions.mediaSafe}
              </p>
              <p className="mt-1">
                <strong>Flags:</strong> jargon [{soundbiteResult.flags.jargon.join(", ") || "none"}], hedging [
                {soundbiteResult.flags.hedging.join(", ") || "none"}], defensive [{soundbiteResult.flags.defensive.join(", ") || "none"}]
              </p>
              <p className="mt-1">
                <strong>Landing line:</strong> {soundbiteResult.strongerLandingLine}
              </p>
              <label className="mt-2 block">
                Practice length
                <select
                  value={selectedPracticeLength}
                  onChange={(event: { target: { value: string } }) =>
                    setSelectedPracticeLength(event.target.value as "tenSecond" | "twentySecond" | "fortyFiveSecond")
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1"
                >
                  <option value="tenSecond">10s</option>
                  <option value="twentySecond">20s</option>
                  <option value="fortyFiveSecond">45s</option>
                </select>
              </label>
            </div>
          ) : null}
        </div>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Media scenario filter
          <select
            value={simulationFilter}
            onChange={(event: { target: { value: string } }) => setSimulationFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="friendly_journalist">Friendly journalist</option>
            <option value="neutral_journalist">Neutral journalist</option>
            <option value="skeptical_journalist">Skeptical journalist</option>
            <option value="hostile_journalist">Hostile journalist</option>
            <option value="podcast_host">Podcast host</option>
            <option value="live_tv_host">Live TV host</option>
            <option value="crisis_press_conference">Crisis press conference</option>
          </select>
        </label>

        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-900">Crisis and difficult question simulator</p>
          <select
            value={crisisScenarioType}
            onChange={(event: { target: { value: string } }) => setCrisisScenarioType(event.target.value)}
            className="mt-2 w-full rounded-md border border-rose-300 px-3 py-2 text-sm"
          >
            <option value="company_underperformance">Company underperformance</option>
            <option value="job_gap_career_challenge">Job gap / career challenge</option>
            <option value="unpaid_invoices_commercial_dispute">Unpaid invoices / commercial dispute</option>
            <option value="failed_transaction">Failed transaction</option>
            <option value="investor_concern">Investor concern</option>
            <option value="employee_issue">Employee issue</option>
            <option value="public_mistake">Public mistake</option>
            <option value="market_downturn">Market downturn</option>
            <option value="hostile_journalist_question">Hostile journalist question</option>
            <option value="board_challenge">Board challenge</option>
          </select>
          <button type="button" onClick={startCrisisSimulation} className="mt-2 rounded-md bg-rose-700 px-3 py-1 text-xs text-white">
            Load first crisis question
          </button>
          {crisisQuestion ? <p className="mt-2 text-xs text-rose-900">{crisisQuestion}</p> : null}
        </div>

        <div className="mt-3 grid gap-2">
          {filteredDrills.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">No drills in this filter yet. Switch filter or continue with recorder practice.</p>
          ) : null}
          {filteredDrills.map((drill) => (
            <button
              key={drill.id}
              type="button"
              onClick={() => setSelectedDrillId(drill.id)}
              className={`rounded-lg border p-3 text-left ${
                selectedDrill?.id === drill.id ? "border-brand-500 bg-brand-50" : "border-slate-200"
              }`}
            >
              <p className="text-sm font-medium">{drill.title}</p>
              <p className="text-xs text-slate-600">{drill.simulationType.replace(/_/g, " ")}</p>
              <p className="text-xs text-slate-500">{drill.difficultyLevel}</p>
            </button>
          ))}
        </div>
      </article>

      {selectedDrill ? (
        <VoiceRecorder
          userId={DEFAULT_USER_ID}
          skillBranch="media"
          initialExerciseId={selectedDrill.id}
          drillId={selectedDrill.id}
          drillInstruction={selectedDrill.instruction}
          drillExamplePhrase={selectedDrill.scenario}
          drillTargetFocus={selectedDrill.targetFocus}
          drillDifficultyLevel={selectedDrill.difficultyLevel}
          mediaMode
          mediaKeyMessages={messages.map((item) => item.trim()).filter(Boolean)}
          soundbiteOriginalAnswer={longAnswer}
          soundbiteTargetText={soundbiteResult ? soundbiteResult.soundbites[selectedPracticeLength] : undefined}
          crisisMode={Boolean(crisisQuestion)}
          crisisQuestion={crisisQuestion}
        />
      ) : null}
    </section>
  );
}
