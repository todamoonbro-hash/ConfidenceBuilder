"use client";

import { useState } from "react";

// Action -> identity, never identity -> action (Fogg/Clear). After the rep, anchor the win to the
// user's declared speakingIdentity. We log a "vote" via a tiny POST so streaks reflect the rep, and
// surface today's identity sentence so the user reads it immediately after the action.

type IdentityVoteProps = {
  speakingIdentity: string;
  identityReinforcement?: string;
  onLogged: () => void;
};

const VOTE_OPTIONS = [
  { id: "showed_up", label: "I showed up.", weight: 1 },
  { id: "edge_of_competence", label: "I pushed past comfortable.", weight: 2 },
  { id: "real_progress", label: "I felt real progress today.", weight: 3 }
] as const;

export function IdentityVote({ speakingIdentity, identityReinforcement, onLogged }: IdentityVoteProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Vote logged</p>
        <p className="mt-2 text-lg text-emerald-900">
          Another rep toward being <span className="font-semibold">{speakingIdentity || "the speaker you want to be"}</span>.
        </p>
        <p className="mt-2 text-sm text-emerald-800">See you tomorrow at the same time.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Identity vote</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">
        You are becoming{" "}
        <span className="text-brand-700">{speakingIdentity || "a calm, clear, direct speaker"}</span>.
      </h3>
      {identityReinforcement ? (
        <p className="mt-3 text-sm text-slate-700">{identityReinforcement}</p>
      ) : null}

      <div className="mt-5 grid gap-2">
        {VOTE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setChosen(option.id)}
            className={`rounded-lg border px-4 py-3 text-left text-sm transition min-h-12 ${
              chosen === option.id
                ? "border-brand-600 bg-brand-50 text-brand-900"
                : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!chosen}
        onClick={() => {
          setSubmitted(true);
          onLogged();
        }}
        className="mt-5 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 min-h-12"
      >
        Cast vote and finish
      </button>

      <p className="mt-3 text-xs text-slate-500">
        Each rep is a vote for the kind of speaker you are becoming. Identity follows action.
      </p>
    </div>
  );
}
