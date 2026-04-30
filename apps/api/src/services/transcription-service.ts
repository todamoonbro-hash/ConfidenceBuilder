export async function transcribeAudio(payload: {
  audioBuffer: Buffer;
  mimeType: string;
  fileName?: string;
}): Promise<{ text: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? "30000");

  if (!apiKey) {
    throw new Error("missing_openai_api_key");
  }

  const formData = new FormData();
  const fileName = payload.fileName ?? `attempt-audio.${payload.mimeType.includes("webm") ? "webm" : "wav"}`;

  formData.append("file", new Blob([payload.audioBuffer], { type: payload.mimeType }), fileName);
  formData.append("model", model);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: formData,
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`openai_transcription_failed:${response.status}:${details}`);
  }

  const result = (await response.json()) as { text?: string };
  return { text: result.text ?? "" };
}
