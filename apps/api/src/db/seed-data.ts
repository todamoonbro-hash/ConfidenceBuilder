import type { DatabaseSnapshot } from "./types";

import seedData from "./seed-data.json";

export function createSeedSnapshot(): DatabaseSnapshot {
  return seedData as DatabaseSnapshot;
}
