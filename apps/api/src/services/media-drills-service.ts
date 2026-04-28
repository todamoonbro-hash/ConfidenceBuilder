export type MediaSimulationType =
  | "friendly_journalist"
  | "neutral_journalist"
  | "skeptical_journalist"
  | "hostile_journalist"
  | "podcast_host"
  | "live_tv_host"
  | "crisis_press_conference";

export type MediaDrill = {
  id: string;
  title: string;
  scenario: string;
  instruction: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging" | "Pressure";
  simulationType: MediaSimulationType;
};

const mediaDrills: MediaDrill[] = [
  {
    id: "media_key_message_builder",
    title: "Key Message Builder",
    scenario: "Define 3-4 clear key messages for an upcoming interview.",
    instruction: "State each key message in one plain-language sentence.",
    targetFocus: "use 3-4 key messages",
    difficultyLevel: "Easy",
    simulationType: "friendly_journalist"
  },
  {
    id: "media_opening_statement",
    title: "Opening Statement Trainer",
    scenario: "Deliver a 20-second opening statement before questions begin.",
    instruction: "Lead with headline message, avoid technical jargon, sound human.",
    targetFocus: "prepare opening statements",
    difficultyLevel: "Moderate",
    simulationType: "live_tv_host"
  },
  {
    id: "media_soundbite",
    title: "Soundbite Trainer",
    scenario: "Answer in a quote-ready line under 12 seconds.",
    instruction: "Stay brief, impactful, and memorable.",
    targetFocus: "short and impactful answers",
    difficultyLevel: "Moderate",
    simulationType: "neutral_journalist"
  },
  {
    id: "media_bridging",
    title: "Bridging Trainer",
    scenario: "Handle a difficult question and bridge back to your core message.",
    instruction: "Acknowledge question briefly, bridge, then deliver your message.",
    targetFocus: "bridge to key messages",
    difficultyLevel: "Challenging",
    simulationType: "skeptical_journalist"
  },
  {
    id: "media_flagging",
    title: "Flagging Trainer",
    scenario: "Highlight the single most important takeaway in your answer.",
    instruction: "Use flagging phrases like 'what matters most is...'.",
    targetFocus: "flag most important takeaway",
    difficultyLevel: "Moderate",
    simulationType: "neutral_journalist"
  },
  {
    id: "media_hostile_journalist",
    title: "Hostile Journalist Simulation",
    scenario: "Respond to an aggressive, leading question without becoming defensive.",
    instruction: "Stay calm, avoid speculation, and avoid answering outside expertise.",
    targetFocus: "calm under pressure + non-defensive",
    difficultyLevel: "Pressure",
    simulationType: "hostile_journalist"
  },
  {
    id: "media_crisis_statement",
    title: "Crisis Statement Trainer",
    scenario: "Deliver initial crisis statement at a press conference.",
    instruction: "State known facts only, show empathy, avoid speculation.",
    targetFocus: "crisis press conference clarity",
    difficultyLevel: "Pressure",
    simulationType: "crisis_press_conference"
  },
  {
    id: "media_podcast_guest",
    title: "Podcast Guest Mode",
    scenario: "Give a conversational answer to a long-form podcast question.",
    instruction: "Stay human and clear without rambling.",
    targetFocus: "human, clear, non-robotic delivery",
    difficultyLevel: "Moderate",
    simulationType: "podcast_host"
  }
];

export function listMediaDrills() {
  return mediaDrills;
}

export function findMediaDrill(drillId: string) {
  return mediaDrills.find((item) => item.id === drillId);
}
