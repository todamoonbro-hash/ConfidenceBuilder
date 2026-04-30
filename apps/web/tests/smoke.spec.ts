import { expect, test } from "@playwright/test";

const corePages = [
  { path: "/", heading: "Train like a leader people trust" },
  { path: "/dashboard", heading: "Dashboard" },
  { path: "/modules", heading: "All training modules" },
  { path: "/session", heading: "Focused speaking rep" },
  { path: "/history", heading: "History" },
  { path: "/coach", heading: "Adaptive Coach" },
  { path: "/settings", heading: "Personal Coach Setup" },
  { path: "/quests", heading: "Professional challenges" },
  { path: "/interview-prep", heading: "Mock interview rehearsal, answer coaching, and readiness training" },
  { path: "/sales-influence", heading: "Roleplay simulator for high-stakes commercial and team conversations" },
  { path: "/networking", heading: "Practise introductions, rapport, and follow-up conversations" },
  { path: "/executive-presence", heading: "Boardroom and pressure communication simulator" },
  { path: "/difficult-conversations", heading: "Practise uncomfortable conversations with clarity, empathy, and boundaries" }
];

test.describe("core pages", () => {
  for (const pageInfo of corePages) {
    test(`${pageInfo.path} renders without client crash`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(pageInfo.path, { waitUntil: "networkidle" });
      expect(response?.status(), pageInfo.path).toBeLessThan(500);
      await expect(page.getByRole("heading", { name: pageInfo.heading })).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
      await expect(page.locator("body")).not.toContainText("Application error");
      expect(pageErrors, `${pageInfo.path} page errors`).toEqual([]);
      expect(consoleErrors, `${pageInfo.path} console errors`).toEqual([]);
    });
  }
});

test("settings save flow accepts partial model preferences", async ({ page }) => {
  await page.goto("/settings", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Primary goal" }).fill("QA goal: stay concise under pressure.");
  await page.getByRole("button", { name: "Save coach setup" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
});
