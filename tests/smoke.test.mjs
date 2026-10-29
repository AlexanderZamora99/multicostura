// Smoke test: the home page is split into css/js files and still renders its main sections.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = readFileSync(join(ROOT, "index.html"), "utf8");
const datos = readFileSync(join(ROOT, "js/datos.js"), "utf8");
const { html, stderr } = render();

// Number of entries in NEGOCIO.modelos, evaluated from the data file itself.
const modelos = new Function(`${datos}; return NEGOCIO.modelos.length;`)();

test("index.html links the shared css and js files", () => {
  assert.match(raw, /<link rel="stylesheet" href="css\/estilos\.css">/);
  assert.match(raw, /<script src="js\/datos\.js"><\/script>/);
  assert.match(raw, /<script src="js\/app\.js"><\/script>/);
});

test("no inline script holds the business data", () => {
  const inline = [...raw.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(!inline.some(s => s.includes("const NEGOCIO")));
});

test("models render one card per NEGOCIO.modelos entry", () => {
  assert.ok(modelos > 0);
  const cards = (html.match(/<article class="model[ "]/g) || []).length;
  assert.equal(cards, modelos);
});

test("hero carousel, designer, agenda, faq and chatbot are present", () => {
  assert.match(html, /id="hero-show"/);
  assert.match(html, /id="personaliza"/);
  // Agenda: the mode buttons render at load; days only render after a mode is picked.
  assert.match(html, /id="modes"[^>]*>\s*<button/);
  assert.match(html, /<details id="faq-/);
  assert.match(html, /id="chat-btn"/);
});

test("no page errors in the console", () => {
  assert.ok(!/Uncaught|SyntaxError|ReferenceError|TypeError/.test(stderr), stderr);
});
