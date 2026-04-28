"use client";

import { useMemo, useState } from "react";
import { VoiceRecorder } from "../session/voice-recorder";

type ReadingPassage = {
  id: string;
  title: string;
  mode: "guided_reading" | "cold_reading" | "executive_business_reading" | "story_narrative_reading" | "difficult_text_mode";
  type: "business" | "narrative" | "technical" | "news";
  difficulty: "easy" | "medium" | "hard";
  length: "short" | "medium" | "long";
  skillFocus: string[];
  text: string;
  chunkedPhrases: string[];
};

type ReadingAloudLabProps = {
  passages: ReadingPassage[];
};

export function ReadingAloudLab({ passages }: ReadingAloudLabProps) {
  const [mode, setMode] = useState<ReadingPassage["mode"] | "all">("all");
  const [showChunks, setShowChunks] = useState(true);
  const [selectedPassageId, setSelectedPassageId] = useState(passages[0]?.id ?? "");

  const filtered = useMemo(() => {
    if (mode === "all") {
      return passages;
    }
    return passages.filter((item) => item.mode === mode);
  }, [mode, passages]);

  const selectedPassage = filtered.find((item) => item.id === selectedPassageId) ?? filtered[0];

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Reading Aloud Lab</h2>
        <p className="mt-1 text-sm text-slate-600">Pick a passage, read aloud, compare transcript, and improve fluency.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Mode
          <select
            value={mode}
            onChange={(event: { target: { value: string } }) => setMode(event.target.value as ReadingPassage["mode"] | "all")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="all">All modes</option>
            <option value="guided_reading">Guided reading</option>
            <option value="cold_reading">Cold reading</option>
            <option value="executive_business_reading">Executive/business reading</option>
            <option value="story_narrative_reading">Story/narrative reading</option>
            <option value="difficult_text_mode">Difficult text mode</option>
          </select>
        </label>

        <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={showChunks} onChange={(event: { target: { checked: boolean } }) => setShowChunks(event.target.checked)} />
          Phrase chunking view
        </label>

        <div className="mt-3 grid gap-2">
          {filtered.map((passage) => (
            <button
              key={passage.id}
              type="button"
              onClick={() => setSelectedPassageId(passage.id)}
              className={`rounded-lg border p-3 text-left ${selectedPassage?.id === passage.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}
            >
              <p className="text-sm font-medium">{passage.title}</p>
              <p className="text-xs text-slate-600">
                {passage.mode.replace(/_/g, " ")} · {passage.difficulty} · {passage.length}
              </p>
              <p className="text-xs text-slate-500">Focus: {passage.skillFocus.join(", ")}</p>
            </button>
          ))}
        </div>
      </article>

      {selectedPassage ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="text-base font-semibold text-indigo-900">{selectedPassage.title}</h3>
          <p className="mt-1 text-xs text-indigo-900">
            Type: {selectedPassage.type} · Difficulty: {selectedPassage.difficulty} · Length: {selectedPassage.length}
          </p>
          <div className="mt-3 rounded-md border border-indigo-200 bg-white p-3 text-sm leading-6 text-slate-800">
            {showChunks ? (
              <div className="space-y-2">
                {selectedPassage.chunkedPhrases.map((phrase, index) => (
                  <p key={`${selectedPassage.id}_chunk_${index}`}>{phrase}</p>
                ))}
              </div>
            ) : (
              <p>{selectedPassage.text}</p>
            )}
          </div>
          <VoiceRecorder
            userId="user_001"
            skillBranch="reading"
            initialSessionId="sess_001"
            initialExerciseId={selectedPassage.id}
            drillId={selectedPassage.id}
            drillInstruction="Read the selected passage aloud once, then evaluate."
            drillExamplePhrase={selectedPassage.text}
            drillTargetFocus={selectedPassage.skillFocus.join(", ")}
            drillDifficultyLevel={selectedPassage.difficulty}
            readingMode
            readingPassageId={selectedPassage.id}
            readingSourceText={selectedPassage.text}
          />
        </div>
      ) : null}
    </section>
  );
}
