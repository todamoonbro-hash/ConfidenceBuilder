import { existsSync } from "node:fs";
import { resolve } from "node:path";

const candidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];

for (const filePath of candidates) {
  if (existsSync(filePath)) {
    process.loadEnvFile(filePath);
    break;
  }
}
