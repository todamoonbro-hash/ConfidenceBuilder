import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure"
  },
  // Boot a real api+web pair before tests so smoke specs hit a working stack in CI.
  // Local devs running `npm run dev` already have services up; in that case set PLAYWRIGHT_SKIP_WEBSERVER=1.
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: "npm run -w @confidencebuilder/api start",
          port: 4000,
          reuseExistingServer: !isCI,
          timeout: 60_000,
          env: {
            CONFIDENCEBUILDER_DISABLE_PERSISTENCE: "true",
            BIND_HOST: "127.0.0.1",
            PORT: "4000"
          }
        },
        {
          command: "npm run -w @confidencebuilder/web start",
          port: 3000,
          reuseExistingServer: !isCI,
          timeout: 90_000,
          env: {
            API_BASE_URL: "http://127.0.0.1:4000",
            NEXT_PUBLIC_DEFAULT_USER_ID: "user_001"
          }
        }
      ],
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } }
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] }
    }
  ]
});
