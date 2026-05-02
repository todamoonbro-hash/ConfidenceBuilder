export type BreathingProtocolId =
  | "physiological_sigh"
  | "box_breath"
  | "four_seven_eight"
  | "rib_expansion"
  | "coherent_breathing"
  | "pre_speech_calm";

export type BreathingProtocolIntensity = "reset" | "calm" | "energize";

export type BreathingStep = {
  label: string;
  seconds: number;
  cue?: string;
};

export type BreathingProtocol = {
  id: BreathingProtocolId;
  title: string;
  source: string;
  durationSeconds: number;
  intensity: BreathingProtocolIntensity;
  whenToUse: string;
  steps: BreathingStep[];
  evidenceNote: string;
};

export type BreathingState =
  | "anxious"
  | "flat"
  | "rushed"
  | "foggy"
  | "neutral";

export type BreathingRecommendInput = {
  minutesAvailable?: number;
  state?: BreathingState;
  upcomingHighStakes?: boolean;
};

const BREATHING_PROTOCOLS: BreathingProtocol[] = [
  {
    id: "physiological_sigh",
    title: "Physiological Sigh",
    source: "Huberman Lab",
    durationSeconds: 90,
    intensity: "reset",
    whenToUse:
      "Use the moment anxiety, dread, or pre-speech jitters spike — fastest known way to drop autonomic arousal in real time.",
    steps: [
      {
        label: "Inhale through nose",
        seconds: 2,
        cue: "fill the lower belly first"
      },
      {
        label: "Second short inhale through nose",
        seconds: 1,
        cue: "top up the lungs — you should feel a small extra crackle of air"
      },
      {
        label: "Long, slow exhale through mouth",
        seconds: 6,
        cue: "exhale until the lungs feel fully empty, soften the jaw"
      },
      {
        label: "Repeat the double-inhale + long exhale cycle",
        seconds: 81,
        cue: "9 cycles of ~9 seconds each — eyes soft, shoulders down"
      }
    ],
    evidenceNote:
      "Huberman & Balban 2023 (Cell Reports Medicine) showed cyclic sighing produced faster mood improvement and lower respiratory rate than mindfulness meditation across 5 minutes/day."
  },
  {
    id: "box_breath",
    title: "Box Breath (4-4-4-4)",
    source: "Navy SEALs / Mark Divine",
    durationSeconds: 60,
    intensity: "calm",
    whenToUse:
      "Use when you are rushed or scattered and need to land in the body before a meeting, call, or rep.",
    steps: [
      { label: "Inhale through nose", seconds: 4, cue: "smooth and quiet" },
      {
        label: "Hold breath in",
        seconds: 4,
        cue: "soft hold — no clamping the throat"
      },
      {
        label: "Exhale through nose or mouth",
        seconds: 4,
        cue: "release shoulders on the way down"
      },
      {
        label: "Hold breath out",
        seconds: 4,
        cue: "stay relaxed — feel the floor under you"
      },
      {
        label: "Repeat for 3 more cycles",
        seconds: 44,
        cue: "4 total rounds = ~60 seconds"
      }
    ],
    evidenceNote:
      "Used in U.S. Navy SEAL stress-inoculation training; equal-ratio breathing at ~6 breaths/min nudges the system toward parasympathetic dominance."
  },
  {
    id: "four_seven_eight",
    title: "4-7-8 Breath",
    source: "Andrew Weil, MD",
    durationSeconds: 60,
    intensity: "calm",
    whenToUse:
      "Use when adrenaline is high, sleep is poor, or you need to actively dampen sympathetic drive before high-stakes speaking.",
    steps: [
      {
        label: "Place tongue tip behind upper front teeth",
        seconds: 0,
        cue: "tongue stays there for the whole exercise"
      },
      {
        label: "Exhale fully through mouth around tongue (whoosh)",
        seconds: 0,
        cue: "empty completely before starting"
      },
      {
        label: "Close mouth, inhale through nose",
        seconds: 4,
        cue: "silent and slow"
      },
      { label: "Hold breath", seconds: 7, cue: "relaxed, no strain" },
      {
        label: "Exhale through mouth with audible whoosh",
        seconds: 8,
        cue: "long, controlled release"
      },
      {
        label: "Repeat the 4-7-8 cycle 3 more times",
        seconds: 41,
        cue: "4 cycles total — Weil's canonical dose"
      }
    ],
    evidenceNote:
      "Dr. Andrew Weil's canonical pranayama-derived protocol; the long exhale ratio (8s out vs 4s in) is the active ingredient for vagal activation."
  },
  {
    id: "rib_expansion",
    title: "Rib Expansion Breathing",
    source: "Diaphragmatic / somatic voice training",
    durationSeconds: 120,
    intensity: "reset",
    whenToUse:
      "Use to recover full breath capacity before reading, recording, or any rep where shallow chest-breathing will choke your voice.",
    steps: [
      {
        label: "Place both hands on lower ribs, thumbs toward back",
        seconds: 0,
        cue: "feel ribs in 360 degrees, not just the front"
      },
      {
        label: "Slow inhale through nose",
        seconds: 6,
        cue: "ribs push your hands outward — sides and back, not just belly"
      },
      {
        label: "Pause at top of inhale",
        seconds: 2,
        cue: "ribs stay wide, shoulders stay down"
      },
      {
        label: "Slow exhale through pursed lips",
        seconds: 8,
        cue: "let ribs come back in slowly under your hands"
      },
      {
        label: "Brief reset",
        seconds: 2,
        cue: "neutral — let the next breath come naturally"
      },
      {
        label: "Repeat for 4 more cycles",
        seconds: 102,
        cue: "5 cycles total — each ~18s — focused on lateral rib motion"
      }
    ],
    evidenceNote:
      "Lateral costal (rib) breathing is the standard in vocal pedagogy (Linklater, Lessac) for restoring breath support after stress-induced chest breathing."
  },
  {
    id: "coherent_breathing",
    title: "Coherent Breathing (5.5 in / 5.5 out)",
    source: "Stephen Elliott / HRV research",
    durationSeconds: 150,
    intensity: "calm",
    whenToUse:
      "Use when foggy, mentally scattered, or transitioning between tasks — sustained 5.5/5.5 cadence produces peak heart-rate variability.",
    steps: [
      {
        label: "Inhale through nose",
        seconds: 6,
        cue: "smooth, even — no rush at the top"
      },
      {
        label: "Exhale through nose",
        seconds: 6,
        cue: "same speed as the inhale, no pause"
      },
      {
        label: "Continue at this cadence",
        seconds: 138,
        cue: "approximately 5.5s in / 5.5s out — about 5.5 breaths per minute for 2.5 minutes"
      }
    ],
    evidenceNote:
      "Lehrer & colleagues' resonance-frequency breathing research shows ~5.5 breaths/min maximizes heart-rate variability and parasympathetic tone."
  },
  {
    id: "pre_speech_calm",
    title: "Pre-Speech Calm Stack",
    source: "Huberman + Cuddy + identity priming",
    durationSeconds: 90,
    intensity: "energize",
    whenToUse:
      "Use in the 90 seconds before a real high-stakes rep, talk, interview, or pitch — settles the nervous system and primes confident self-talk.",
    steps: [
      {
        label: "Physiological sigh",
        seconds: 30,
        cue: "double-inhale through nose, long exhale through mouth — 3 cycles"
      },
      {
        label: "Power-pose hold",
        seconds: 30,
        cue: "feet planted shoulder-width, chest open, hands on hips or overhead V — breathe slowly"
      },
      {
        label: "Identity affirmation, said aloud or internally",
        seconds: 20,
        cue: "'I am the kind of person who shows up clearly under pressure.' Repeat 3 times."
      },
      {
        label: "One final slow exhale and step in",
        seconds: 10,
        cue: "soft jaw, eyes up, walk in already in character"
      }
    ],
    evidenceNote:
      "Combines Huberman's physiological sigh (autonomic), Cuddy 2010 power-posing (perceived presence) and identity-based priming (Oyserman) for fastest pre-performance state shift."
  }
];

const BY_ID: Record<BreathingProtocolId, BreathingProtocol> =
  BREATHING_PROTOCOLS.reduce(
    (acc, protocol) => {
      acc[protocol.id] = protocol;
      return acc;
    },
    {} as Record<BreathingProtocolId, BreathingProtocol>
  );

export function listBreathingProtocols(): BreathingProtocol[] {
  return BREATHING_PROTOCOLS.map((protocol) => ({
    ...protocol,
    steps: protocol.steps.map((step) => ({ ...step }))
  }));
}

export function findBreathingProtocol(
  id: BreathingProtocolId
): BreathingProtocol | undefined {
  const protocol = BY_ID[id];
  if (!protocol) return undefined;
  return {
    ...protocol,
    steps: protocol.steps.map((step) => ({ ...step }))
  };
}

export function recommendBreathingProtocol(
  input: BreathingRecommendInput = {}
): BreathingProtocol {
  const minutesAvailable =
    typeof input.minutesAvailable === "number" && input.minutesAvailable > 0
      ? input.minutesAvailable
      : 3;
  const state: BreathingState = input.state ?? "neutral";
  const highStakes = Boolean(input.upcomingHighStakes);

  let chosenId: BreathingProtocolId;

  switch (state) {
    case "anxious":
      chosenId = "physiological_sigh";
      break;
    case "flat":
      chosenId = "pre_speech_calm";
      break;
    case "rushed":
      chosenId = "box_breath";
      break;
    case "foggy":
      chosenId = "coherent_breathing";
      break;
    case "neutral":
    default:
      chosenId = highStakes ? "pre_speech_calm" : "rib_expansion";
      break;
  }

  let chosen = BY_ID[chosenId];

  // If the user has less time than the chosen protocol needs, fall back to
  // the longest protocol that still fits — keeping the recommendation honest.
  const availableSeconds = Math.round(minutesAvailable * 60);
  if (chosen.durationSeconds > availableSeconds) {
    const fits = BREATHING_PROTOCOLS.filter(
      (protocol) => protocol.durationSeconds <= availableSeconds
    ).sort((a, b) => b.durationSeconds - a.durationSeconds);
    if (fits.length > 0) {
      chosen = fits[0];
    }
  }

  return {
    ...chosen,
    steps: chosen.steps.map((step) => ({ ...step }))
  };
}
