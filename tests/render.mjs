// Renders index.html in headless Chrome and returns the final DOM plus console output.
// Zero dependencies: needs Node 18+ and Google Chrome / Chromium on PATH (or CHROME_BIN).
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = pathToFileURL(join(ROOT, "index.html")).href;

function chromeBin() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const candidates = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Chrome not found: set CHROME_BIN");
  return found;
}

const cache = new Map();

// `inject`: script opcional que se ejecuta al final del <body> (para simular clics y escritura en los tests).
export function render({ width = 1366, height = 900, inject = "" } = {}) {
  const key = `${width}x${height}|${inject}`;
  if (cache.has(key)) return cache.get(key);
  let page = PAGE;
  if (inject) {
    const dir = mkdtempSync(join(tmpdir(), "multicostura-"));
    const file = join(dir, "index.html");
    writeFileSync(file, readFileSync(join(ROOT, "index.html"), "utf8").replace("</body>", `<script>${inject}</script></body>`));
    page = pathToFileURL(file).href;
  }
  const run = spawnSync(chromeBin(), [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
    "--enable-logging=stderr", "--v=0",
    "--virtual-time-budget=5000", `--window-size=${width},${height}`,
    "--dump-dom", page,
  ], { encoding: "utf8", timeout: 60000 });
  if (run.status !== 0) throw new Error(`Chrome failed: ${run.stderr || run.error}`);
  const html = run.stdout;
  // Keep only page console messages, not Chrome's own diagnostics.
  const stderr = run.stderr.split("\n").filter(l => l.includes("CONSOLE")).join("\n");
  const result = { html, stderr };
  cache.set(key, result);
  return result;
}

// Counts elements whose opening tag matches the given attribute fragment, e.g. 'class="model"'.
export function count(html, fragment) {
  return html.split(fragment).length - 1;
}
