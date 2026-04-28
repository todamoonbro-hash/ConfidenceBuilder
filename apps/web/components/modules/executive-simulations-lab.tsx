"use client";

import { useState } from "react";
import { VoiceRecorder } from "../session/voice-recorder";

type ExecutiveMode =
  | "cfo_interview"
  | "recruiter_screen"
  | "investor_pitch_qa"
  | "board_update"
  | "difficult_stakeholder_conversation"
  | "presentation_rehearsal"
  | "leadership_update"
  | "media_adjacent_executive_questioning";

type InterviewerStyle = "supportive" | "neutral" | "challenging" | "aggressive_but_professional";

export function ExecutiveSimulationsLab() {
  const [mode, setMode] = useState<ExecutiveMode>("board_update");
  const [style, setStyle] = useState<InterviewerStyle>("neutral");
  const [simulation, setSimulation] = useState<
    | {
        mode: ExecutiveMode;
        style: InterviewerStyle;
        openingQuestion: string;
        scenarioBrief: string;
      }
    | undefined
  >();

  const startSimulation = async () => {
    const response = await fetch("/session/executive/start", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ mode, style })
    });
    const result = await response.json();
    setSimulation(response.ok && result.ok ? result.simulation : undefined);
  };

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Executive Simulations</h2>
        <p className="mt-1 text-sm text-slate-600">Run high-stakes executive scenarios with follow-up challenge questions and structure coaching.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Simulation mode
          <select value={mode} onChange={(event: { target: { value: string } }) => setMode(event.target.value as ExecutiveMode)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="cfo_interview">CFO interview</option>
            <option value="recruiter_screen">Recruiter screen</option>
            <option value="investor_pitch_qa">Investor pitch Q&A</option>
            <option value="board_update">Board update</option>
            <option value="difficult_stakeholder_conversation">Difficult stakeholder conversation</option>
            <option value="presentation_rehearsal">Presentation rehearsal</option>
            <option value="leadership_update">Leadership update</option>
            <option value="media_adjacent_executive_questioning">Media-adjacent executive questioning</option>
          </select>
        </label>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Interviewer style
          <select value={style} onChange={(event: { target: { value: string } }) => setStyle(event.target.value as InterviewerStyle)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            <option value="supportive">Supportive</option>
            <option value="neutral">Neutral</option>
            <option value="challenging">Challenging</option>
            <option value="aggressive_but_professional">Aggressive but professional</option>
          </select>
        </label>

        <button type="button" onClick={startSimulation} className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Start executive simulation
        </button>

        {simulation ? (
          <div className="mt-3 rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900">
            <p className="font-medium">{simulation.scenarioBrief}</p>
            <p className="mt-2">{simulation.openingQuestion}</p>
          </div>
        ) : null}
      </article>

      {simulation ? (
        <VoiceRecorder
          userId="user_001"
          skillBranch="executive"
          initialSessionId="sess_001"
          initialExerciseId={`executive_${simulation.mode}`}
          drillInstruction="Answer with executive structure: headline, two facts, one commitment."
          drillExamplePhrase={simulation.openingQuestion}
          drillTargetFocus="executive presence, commercial sharpness, structure"
          drillDifficultyLevel="Pressure"
          executiveMode
          executiveSimulation={simulation}
        />
      ) : null}
    </section>
  );
}
