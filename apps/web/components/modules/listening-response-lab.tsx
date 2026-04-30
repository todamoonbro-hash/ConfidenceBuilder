"use client";

import { useState } from "react";
import { DEFAULT_USER_ID } from "../../lib/user";
import { VoiceRecorder } from "../session/voice-recorder";

type ListeningDrillType =
  | "listen_and_summarise"
  | "listen_and_answer"
  | "paraphrase_then_answer"
  | "identify_real_question"
  | "detect_tone_intent"
  | "answer_hidden_concern";

type ListeningDrill = {
  id: string;
  drillType: ListeningDrillType;
  promptText: string;
  expectedFocus: string[];
  expectedTone?: "neutral" | "concerned" | "skeptical" | "urgent";
};

export function ListeningResponseLab() {
  const [drillType, setDrillType] = useState<ListeningDrillType>("listen_and_summarise");
  const [drill, setDrill] = useState<ListeningDrill | undefined>();

  const startDrill = async () => {
    const response = await fetch("/session/listening/start", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ drillType })
    });
    const result = await response.json();
    setDrill(response.ok && result.ok ? result.drill : undefined);
  };

  const playPrompt = () => {
    if (!drill?.promptText || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(drill.promptText);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Listening and Response Lab</h2>
        <p className="mt-1 text-sm text-slate-600">Listen carefully, respond by voice, then evaluate alignment to the real question and intent.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Drill type
          <select
            value={drillType}
            onChange={(event: { target: { value: string } }) => setDrillType(event.target.value as ListeningDrillType)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="listen_and_summarise">Listen and summarise</option>
            <option value="listen_and_answer">Listen and answer</option>
            <option value="paraphrase_then_answer">Paraphrase then answer</option>
            <option value="identify_real_question">Identify the real question</option>
            <option value="detect_tone_intent">Detect tone/intent</option>
            <option value="answer_hidden_concern">Answer the hidden concern</option>
          </select>
        </label>

        <button type="button" onClick={startDrill} className="mt-3 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white">
          Start listening drill
        </button>

        {drill ? (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-medium">Prompt</p>
            <p className="mt-1">{drill.promptText}</p>
            <p className="mt-2 text-xs">Focus targets: {drill.expectedFocus.join(", ")}</p>
            {drill.expectedTone ? <p className="text-xs">Tone cue: {drill.expectedTone}</p> : null}
            <button type="button" onClick={playPrompt} className="mt-2 rounded-md border border-emerald-500 px-2 py-1 text-xs">
              Play prompt audio (TTS)
            </button>
          </div>
        ) : null}
      </article>

      {drill ? (
        <VoiceRecorder
          userId={DEFAULT_USER_ID}
          skillBranch="listening"
          initialSessionId="sess_001"
          initialExerciseId={drill.id}
          drillInstruction="Listen closely, answer directly, and reflect tone/intent."
          drillExamplePhrase={drill.promptText}
          drillTargetFocus={drill.expectedFocus.join(", ")}
          drillDifficultyLevel="Moderate"
          listeningMode
          listeningPrompt={drill}
        />
      ) : null}
    </section>
  );
}
