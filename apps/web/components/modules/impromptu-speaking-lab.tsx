"use client";

import { useState } from "react";
import { DEFAULT_USER_ID } from "../../lib/user";
import { VoiceRecorder } from "../session/voice-recorder";

type ImpromptuCategory =
  | "personal_confidence"
  | "explain_simply"
  | "business_decision"
  | "board_question"
  | "investor_challenge"
  | "hostile_question"
  | "storytelling"
  | "media_response";

export function ImpromptuSpeakingLab() {
  const [category, setCategory] = useState<ImpromptuCategory>("explain_simply");
  const [timerSeconds, setTimerSeconds] = useState<30 | 60 | 90 | 120>(60);
  const [prompt, setPrompt] = useState<string>("");

  const generatePrompt = async () => {
    const response = await fetch("/session/impromptu/start", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ category, timerSeconds })
    });
    const result = await response.json();
    setPrompt(response.ok && result.ok ? result.generated.prompt : "");
  };

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Impromptu Speaking Lab</h2>
        <p className="mt-1 text-sm text-slate-600">Generate a random prompt, answer under time pressure, get feedback, and retry better.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Category
          <select
            value={category}
            onChange={(event: { target: { value: string } }) => setCategory(event.target.value as ImpromptuCategory)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="personal_confidence">Personal confidence</option>
            <option value="explain_simply">Explain simply</option>
            <option value="business_decision">Business decision</option>
            <option value="board_question">Board question</option>
            <option value="investor_challenge">Investor challenge</option>
            <option value="hostile_question">Hostile question</option>
            <option value="storytelling">Storytelling</option>
            <option value="media_response">Media response</option>
          </select>
        </label>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Timer
          <select
            value={String(timerSeconds)}
            onChange={(event: { target: { value: string } }) => setTimerSeconds(Number(event.target.value) as 30 | 60 | 90 | 120)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="30">30s</option>
            <option value="60">60s</option>
            <option value="90">90s</option>
            <option value="120">2 min</option>
          </select>
        </label>

        <button type="button" onClick={generatePrompt} className="mt-3 rounded-md bg-violet-700 px-3 py-2 text-sm font-medium text-white">
          Generate random prompt
        </button>

        {prompt ? (
          <div className="mt-3 rounded-md border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
            <p className="font-medium">Prompt</p>
            <p className="mt-1">{prompt}</p>
          </div>
        ) : null}
      </article>

      {prompt ? (
        <VoiceRecorder
          userId={DEFAULT_USER_ID}
          skillBranch="impromptu"
          initialSessionId="sess_001"
          initialExerciseId={`impromptu_${category}`}
          drillInstruction="Answer the prompt directly. Use answer -> reason -> example."
          drillExamplePhrase={prompt}
          drillTargetFocus="clarity, structure, confidence"
          drillDifficultyLevel="Pressure"
          impromptuMode
          impromptuPrompt={prompt}
          impromptuTargetSeconds={timerSeconds}
        />
      ) : null}
    </section>
  );
}
