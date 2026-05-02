"use client";

import { useMemo, useState } from "react";
import { DEFAULT_USER_ID } from "../../lib/user";
import { VoiceRecorder } from "../session/voice-recorder";

type ArticulationDrill = {
  id: string;
  name: string;
  instruction: string;
  examplePhrase: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging";
};

type ArticulationStudioProps = {
  drills: ArticulationDrill[];
};

export function ArticulationStudio({ drills }: ArticulationStudioProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Moderate" | "Challenging">("All");
  const [selectedDrillId, setSelectedDrillId] = useState<string>(drills[0]?.id ?? "");

  const filteredDrills = useMemo(() => {
    if (difficultyFilter === "All") {
      return drills;
    }

    return drills.filter((drill) => drill.difficultyLevel === difficultyFilter);
  }, [difficultyFilter, drills]);

  const selectedDrill = drills.find((drill) => drill.id === selectedDrillId) ?? filteredDrills[0];

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_1.45fr]">
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Articulation Studio</h2>
        <p className="mt-1 text-sm text-slate-600">Warmups, consonant drills, tongue twisters, and pace ladders.</p>

        <label className="mt-3 block text-sm font-medium text-slate-700">
          Difficulty
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={difficultyFilter}
            onChange={(event: { target: { value: string } }) =>
              setDifficultyFilter(event.target.value as "All" | "Easy" | "Moderate" | "Challenging")
            }
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Challenging">Challenging</option>
          </select>
        </label>

        <div className="mt-3 grid gap-2">
          {filteredDrills.map((drill) => (
            <button
              key={drill.id}
              type="button"
              onClick={() => setSelectedDrillId(drill.id)}
              className={`rounded-lg border p-3 text-left ${
                selectedDrill?.id === drill.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm font-medium">{drill.name}</p>
              <p className="text-xs text-slate-600">Focus: {drill.targetFocus}</p>
              <p className="text-xs text-slate-500">Difficulty: {drill.difficultyLevel}</p>
            </button>
          ))}
        </div>
      </article>

      {selectedDrill ? (
        <VoiceRecorder
          userId={DEFAULT_USER_ID}
          skillBranch="articulation"
          initialExerciseId={selectedDrill.id}
          drillId={selectedDrill.id}
          drillInstruction={selectedDrill.instruction}
          drillExamplePhrase={selectedDrill.examplePhrase}
          drillTargetFocus={selectedDrill.targetFocus}
          drillDifficultyLevel={selectedDrill.difficultyLevel}
        />
      ) : null}
    </section>
  );
}
