export type ArticulationDrill = {
  id: string;
  name: string;
  instruction: string;
  examplePhrase: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging";
};

const articulationDrills: ArticulationDrill[] = [
  {
    id: "art_warmup_lips",
    name: "Articulation Warmup: Lip + Jaw Reset",
    instruction: "Read slowly, exaggerating mouth movement and crisp endings.",
    examplePhrase: "Big blue bubbles bounce beyond the bay.",
    targetFocus: "warmups",
    difficultyLevel: "Easy"
  },
  {
    id: "art_final_consonants",
    name: "Final Consonant Lock",
    instruction: "Hit final /t/, /d/, /k/, /p/ without dropping endings.",
    examplePhrase: "Keep the point tight and the pitch sharp.",
    targetFocus: "final consonants",
    difficultyLevel: "Moderate"
  },
  {
    id: "art_plosives",
    name: "Plosive Precision",
    instruction: "Control breath bursts on /p/, /b/, /t/, /d/, /k/, /g/.",
    examplePhrase: "Peter packed bold talking points for the board.",
    targetFocus: "plosive drills",
    difficultyLevel: "Moderate"
  },
  {
    id: "art_s_blends",
    name: "S-Blend Stability",
    instruction: "Keep airflow steady through /sp/, /st/, /sk/, /sl/ blends.",
    examplePhrase: "Strong statements start steady and stay specific.",
    targetFocus: "s-blend drills",
    difficultyLevel: "Moderate"
  },
  {
    id: "art_rl_contrast",
    name: "R/L Contrast",
    instruction: "Alternate /r/ and /l/ words with clear tongue placement.",
    examplePhrase: "Real leaders relay clear, reliable results.",
    targetFocus: "r/l contrast drills",
    difficultyLevel: "Challenging"
  },
  {
    id: "art_th_focus",
    name: "TH Clarity",
    instruction: "Differentiate voiced/unvoiced th with visible tongue placement.",
    examplePhrase: "Think through three thoughtful themes this Thursday.",
    targetFocus: "th drills",
    difficultyLevel: "Challenging"
  },
  {
    id: "art_clusters",
    name: "Consonant Cluster Control",
    instruction: "Maintain clarity on multi-consonant openings and endings.",
    examplePhrase: "Strict scripts strengthen strategic speech skills.",
    targetFocus: "consonant cluster drills",
    difficultyLevel: "Challenging"
  },
  {
    id: "art_twister_easy",
    name: "Tongue Twister (Easy)",
    instruction: "Stay accurate first, then increase pace slightly.",
    examplePhrase: "Fresh fried fish for Friday.",
    targetFocus: "tongue twisters",
    difficultyLevel: "Easy"
  },
  {
    id: "art_twister_hard",
    name: "Tongue Twister (Hard)",
    instruction: "Keep diction clean under speed pressure.",
    examplePhrase: "She sells seashells by the seashore swiftly.",
    targetFocus: "tongue twisters",
    difficultyLevel: "Challenging"
  },
  {
    id: "art_pace_ladder",
    name: "Pace Ladder",
    instruction: "Repeat phrase at slow, medium, then fast pace while preserving clarity.",
    examplePhrase: "Clarity first, then speed, then control.",
    targetFocus: "pace ladder drills",
    difficultyLevel: "Moderate"
  }
];

export function listArticulationDrills() {
  return articulationDrills;
}

export function findArticulationDrill(drillId: string) {
  return articulationDrills.find((item) => item.id === drillId);
}
