const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../../..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4000";
const webUrl = process.env.APP_BASE_URL || "http://127.0.0.1:3000";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isReachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
    return response.status < 500;
  } catch {
    return false;
  }
}

function spawnService(name, args) {
  const child = spawn(npmCommand, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      API_BASE_URL: apiUrl,
      APP_BASE_URL: webUrl,
      NODE_ENV: process.env.NODE_ENV || "production"
    },
    windowsHide: true,
    stdio: "pipe"
  });

  child.stdout.on("data", (chunk) => console.log(`[${name}] ${chunk.toString().trim()}`));
  child.stderr.on("data", (chunk) => console.error(`[${name}] ${chunk.toString().trim()}`));
  children.push(child);
  return child;
}

async function waitFor(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isReachable(url)) return true;
    await delay(750);
  }
  return false;
}

async function ensureServices() {
  if (!(await isReachable(`${apiUrl}/health`))) {
    const apiBuilt = existsSync(path.join(repoRoot, "apps/api/dist/main.js"));
    spawnService("api", ["run", apiBuilt ? "start" : "dev", "-w", "@confidencebuilder/api"]);
  }

  if (!(await waitFor(`${apiUrl}/health`, 45_000))) {
    throw new Error("API did not start on http://127.0.0.1:4000 within 45s.");
  }

  if (!(await isReachable(webUrl))) {
    const webBuilt = existsSync(path.join(repoRoot, "apps/web/.next/BUILD_ID"));
    spawnService("web", ["run", webBuilt ? "start" : "dev", "-w", "@confidencebuilder/web", "--", "--port", "3000", "--hostname", "127.0.0.1"]);
  }

  if (!(await waitFor(webUrl, 120_000))) {
    throw new Error("Web app did not start on http://127.0.0.1:3000 within 2 minutes.\n\nOn first run, Next.js needs to compile. Please try again.");
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: "ConfidenceBuilder",
    backgroundColor: "#f8fafc",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <html>
      <body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;height:100vh">
        <div style="text-align:center">
          <h1 style="font-size:22px;margin:0 0 8px">Starting ConfidenceBuilder</h1>
          <p style="font-size:14px;color:#475569;margin:0">Compiling on first run - this takes up to 2 minutes...</p>
        </div>
      </body>
    </html>
  `)}`)

  return win;
}

async function boot() {
  const win = createWindow();
  try {
    await ensureServices();
    await win.loadURL(webUrl);
  } catch (error) {
    await dialog.showMessageBox(win, {
      type: "error",
      title: "ConfidenceBuilder failed to start",
      message: error instanceof Error ? error.message : "The desktop app could not start.",
      detail: "Run npm run build once, then try opening the desktop app again."
    });
    app.quit();
  }
}

app.whenReady().then(boot);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
});
