export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  apiPort: number;
  maxJsonBodyBytes: number;
  maxAudioBytes: number;
}

function readProcessEnv(): Record<string, string | undefined> {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;

  return maybeProcess?.env ?? {};
}

export function loadEnv(): AppEnv {
  const env = readProcessEnv();

  return {
    nodeEnv: (env.NODE_ENV as AppEnv["nodeEnv"]) ?? "development",
    apiPort: Number(env.PORT ?? env.API_PORT ?? "4000"),
    maxJsonBodyBytes: Number(env.MAX_JSON_BODY_BYTES ?? 10 * 1024 * 1024),
    maxAudioBytes: Number(env.MAX_AUDIO_BYTES ?? 8 * 1024 * 1024)
  };
}
