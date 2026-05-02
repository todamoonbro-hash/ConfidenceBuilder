export type TtsStyle = "natural" | "calm" | "energetic";

const STYLE_INSTRUCTIONS: Record<TtsStyle, string> = {
  natural: "Speak like a warm, practical human coach. Use natural pacing, varied intonation, and light emphasis. Do not sound robotic.",
  calm: "Speak calmly and reassuringly, slightly slower than normal, with gentle variation and clear pauses.",
  energetic: "Speak with confident, upbeat coaching energy. Keep it natural, not exaggerated, with expressive emphasis."
};

async function requestSpeech(payload: {
  apiKey: string;
  model: string;
  voice: string;
  text: string;
  style: TtsStyle;
  timeoutMs: number;
  includeInstructions: boolean;
}) {
  const requestBody: Record<string, string> = {
    model: payload.model,
    voice: payload.voice,
    input: payload.text,
    response_format: "mp3"
  };

  if (payload.includeInstructions) {
    requestBody.instructions = STYLE_INSTRUCTIONS[payload.style];
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(payload.timeoutMs)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`openai_tts_failed:${response.status}:${details}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeSpeech(payload: {
  text: string;
  style?: TtsStyle;
}): Promise<{ audioBase64: string; mimeType: string; model: string; voice: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const voice = process.env.OPENAI_TTS_VOICE || "coral";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? "30000");
  const style = payload.style ?? "natural";
  const text = payload.text.trim().slice(0, 4000);

  if (!apiKey) {
    throw new Error("missing_openai_api_key");
  }

  if (!text) {
    throw new Error("missing_tts_text");
  }

  let audioBuffer: Buffer;
  let usedModel = model;
  let usedVoice = voice;

  try {
    audioBuffer = await requestSpeech({
      apiKey,
      model,
      voice,
      text,
      style,
      timeoutMs,
      includeInstructions: true
    });
  } catch (error) {
    const fallbackModel = process.env.OPENAI_TTS_FALLBACK_MODEL || "tts-1";
    const fallbackVoice = process.env.OPENAI_TTS_FALLBACK_VOICE || "alloy";
    audioBuffer = await requestSpeech({
      apiKey,
      model: fallbackModel,
      voice: fallbackVoice,
      text,
      style,
      timeoutMs,
      includeInstructions: false
    });
    usedModel = fallbackModel;
    usedVoice = fallbackVoice;
  }

  return {
    audioBase64: audioBuffer.toString("base64"),
    mimeType: "audio/mpeg",
    model: usedModel,
    voice: usedVoice
  };
}
