export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  apiPort: number;
}

function readProcessEnv(): Record<string, string | undefined> {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;

  return maybeProcess?.env ?? {};
}

export function loadEnv(): AppEnv {
  const env = readProcessEnv();

  return {
    nodeEnv: (env.NODE_ENV as AppEnv["nodeEnv"]) ?? "development",
    apiPort: Number(env.API_PORT ?? "4000")
  };
}
