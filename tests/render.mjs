// Renders index.html in headless Chrome and returns the final DOM plus console output.
// Zero dependencies: needs Node 18+ and Google Chrome / Chromium on PATH (or CHROME_BIN).
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let copias = 0;

function chromeBin() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const candidates = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Chrome not found: set CHROME_BIN");
  return found;
}

const cache = new Map();

// Texto fuente de la página + sus archivos compartidos (css/js), para las pruebas que revisan el código con regex.
export function source(page = "index.html") {
  return [page, "css/estilos.css", "js/datos.js", "js/app.js"].map(f => readFileSync(join(ROOT, f), "utf8")).join("\n");
}

// Solo el CSS compartido.
export const estilos = () => readFileSync(join(ROOT, "css/estilos.css"), "utf8");

// `page`: archivo HTML de la raíz del repo (por defecto index.html).
// `inject`: script opcional que se ejecuta al final del <body> (para simular clics y escritura en los tests).
// `transform`: función opcional que recibe el HTML de la página y devuelve el que se renderiza.
// Las copias modificadas se escriben JUNTO al original (raíz del repo, ignoradas por git) para que css/ js/ img/ sigan resolviendo, y se borran al terminar.
export function render({ width = 1366, height = 900, inject = "", page = "index.html", transform = null } = {}) {
  const key = `${page}|${width}x${height}|${inject}|${transform ? transform.toString() : ""}`;
  if (cache.has(key)) return cache.get(key);
  let url = pathToFileURL(join(ROOT, page)).href;
  let copia = null;
  if (inject || transform) {
    let html = readFileSync(join(ROOT, page), "utf8");
    if (transform) html = transform(html);
    if (inject) html = html.replace("</body>", `<script>${inject}</script></body>`);
    copia = join(ROOT, `_render-${process.pid}-${++copias}.html`);
    writeFileSync(copia, html);
    url = pathToFileURL(copia).href;
  }
  const run = spawnSync(chromeBin(), [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
    "--enable-logging=stderr", "--v=0",
    // Los videos incrustados (TikTok, Instagram) no se cargan en las pruebas: hacen lentas y frágiles las corridas en paralelo
    "--host-resolver-rules=MAP tiktok.com ~NOTFOUND, MAP *.tiktok.com ~NOTFOUND, MAP *.tiktokcdn.com ~NOTFOUND, MAP instagram.com ~NOTFOUND, MAP *.instagram.com ~NOTFOUND, MAP *.cdninstagram.com ~NOTFOUND",
    "--virtual-time-budget=5000", `--window-size=${width},${height}`,
    "--dump-dom", url,
  ], { encoding: "utf8", timeout: 60000 });
  if (copia) rmSync(copia, { force: true });
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
