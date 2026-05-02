export type ArticulationDrill = {
  id: string;
  name: string;
  instruction: string;
  examplePhrase: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging" | "Warmup";
  category?: "warmup" | "articulation";
  durationSeconds?: number;
};

const vocalWarmupDrills: ArticulationDrill[] = [
  {
    id: "vw_lip_trill",
    name: "Lip Trills (brrrr)",
    instruction: "Loose lips, blow gently, let them flutter. Glide low to high pitch.",
    examplePhrase: "brrrrrr (low) → brrrrrr (mid) → brrrrrr (high)",
    targetFocus: "vocal-fold engagement, breath economy",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 60
  },
  {
    id: "vw_siren",
    name: "Sirens on 'ng'",
    instruction: "Hum 'nnng' and slide pitch from your lowest to your highest, then back down. No effort, no force.",
    examplePhrase: "nnnnnnnng (low→high→low) ×3",
    targetFocus: "pitch range, resonance",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 60
  },
  {
    id: "vw_humming",
    name: "Humming on 'mmm'",
    instruction: "Lips closed, jaw relaxed, hum a comfortable pitch. Feel buzzing on your lips and the bridge of your nose.",
    examplePhrase: "mmmmm × 5 long breaths",
    targetFocus: "forward resonance",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 60
  },
  {
    id: "vw_straw_phonation",
    name: "Straw Phonation",
    instruction: "Phonate gently through a straw on a comfortable pitch, then slide up and down. (No straw? Pucker lips into a small 'ooo'.)",
    examplePhrase: "ooooo (slow glide low→high)",
    targetFocus: "vocal economy, reduces strain",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 90
  },
  {
    id: "vw_jaw_release",
    name: "Jaw Release",
    instruction: "Massage masseter muscles. Drop jaw, sigh out 'aaah'. Repeat 5x.",
    examplePhrase: "aaaaah ×5",
    targetFocus: "jaw tension release",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 30
  },
  {
    id: "vw_yawn_sigh",
    name: "Yawn-Sigh",
    instruction: "Initiate a yawn, let it become a soft sigh on 'aaah'. 4 cycles.",
    examplePhrase: "(yawn) → aaaaah ×4",
    targetFocus: "open throat, soft palate lift",
    difficultyLevel: "Warmup",
    category: "warmup",
    durationSeconds: 30
  }
];

const articulationDrills: ArticulationDrill[] = [
  {
    id: "art_warmup_lips",
    name: "Articulation Warmup: Lip + Jaw Reset",
    instruction: "Read slowly, exaggerating mouth movement and crisp endings.",
    examplePhrase: "Big blue bubbles bounce beyond the bay.",
    targetFocus: "warmups",
    difficultyLevel: "Easy",
    category: "articulation"
  },
  {
    id: "art_final_consonants",
    name: "Final Consonant Lock",
    instruction: "Hit final /t/, /d/, /k/, /p/ without dropping endings.",
    examplePhrase: "Keep the point tight and the pitch sharp.",
    targetFocus: "final consonants",
    difficultyLevel: "Moderate",
    category: "articulation"
  },
  {
    id: "art_plosives",
    name: "Plosive Precision",
    instruction: "Control breath bursts on /p/, /b/, /t/, /d/, /k/, /g/.",
    examplePhrase: "Peter packed bold talking points for the board.",
    targetFocus: "plosive drills",
    difficultyLevel: "Moderate",
    category: "articulation"
  },
  {
    id: "art_s_blends",
    name: "S-Blend Stability",
    instruction: "Keep airflow steady through /sp/, /st/, /sk/, /sl/ blends.",
    examplePhrase: "Strong statements start steady and stay specific.",
    targetFocus: "s-blend drills",
    difficultyLevel: "Moderate",
    category: "articulation"
  },
  {
    id: "art_rl_contrast",
    name: "R/L Contrast",
    instruction: "Alternate /r/ and /l/ words with clear tongue placement.",
    examplePhrase: "Real leaders relay clear, reliable results.",
    targetFocus: "r/l contrast drills",
    difficultyLevel: "Challenging",
    category: "articulation"
  },
  {
    id: "art_th_focus",
    name: "TH Clarity",
    instruction: "Differentiate voiced/unvoiced th with visible tongue placement.",
    examplePhrase: "Think through three thoughtful themes this Thursday.",
    targetFocus: "th drills",
    difficultyLevel: "Challenging",
    category: "articulation"
  },
  {
    id: "art_clusters",
    name: "Consonant Cluster Control",
    instruction: "Maintain clarity on multi-consonant openings and endings.",
    examplePhrase: "Strict scripts strengthen strategic speech skills.",
    targetFocus: "consonant cluster drills",
    difficultyLevel: "Challenging",
    category: "articulation"
  },
  {
    id: "art_twister_easy",
    name: "Tongue Twister (Easy)",
    instruction: "Stay accurate first, then increase pace slightly.",
    examplePhrase: "Fresh fried fish for Friday.",
    targetFocus: "tongue twisters",
    difficultyLevel: "Easy",
    category: "articulation"
  },
  {
    id: "art_twister_hard",
    name: "Tongue Twister (Hard)",
    instruction: "Keep diction clean under speed pressure.",
    examplePhrase: "She sells seashells by the seashore swiftly.",
    targetFocus: "tongue twisters",
    difficultyLevel: "Challenging",
    category: "articulation"
  },
  {
    id: "art_pace_ladder",
    name: "Pace Ladder",
    instruction: "Repeat phrase at slow, medium, then fast pace while preserving clarity.",
    examplePhrase: "Clarity first, then speed, then control.",
    targetFocus: "pace ladder drills",
    difficultyLevel: "Moderate",
    category: "articulation"
  }
];

export function listArticulationDrills() {
  return [...vocalWarmupDrills, ...articulationDrills];
}

export function findArticulationDrill(drillId: string) {
  return (
    vocalWarmupDrills.find((item) => item.id === drillId) ??
    articulationDrills.find((item) => item.id === drillId)
  );
}

export function listVocalWarmups() {
  return vocalWarmupDrills;
}

export function findVocalWarmup(drillId: string) {
  return vocalWarmupDrills.find((item) => item.id === drillId);
}
