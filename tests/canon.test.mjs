import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = source.slice(source.indexOf("<style>"), source.indexOf("</style>"));
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");

// ---- C1: reference type and tokens (worktastic.co "Minimalista": Open Sans, bold uppercase titles, near-black buttons) ----
const probe = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), set = (k, v) => b.setAttribute("data-" + k, v);
  set("body-font", cs(document.body).fontFamily);
  const h2 = document.querySelector("section h2");
  set("h2-font", cs(h2).fontFamily); set("h2-tt", cs(h2).textTransform); set("h2-fw", cs(h2).fontWeight); set("h2-ls", cs(h2).letterSpacing);
  const mk = cls => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = "x"; document.querySelector("main").appendChild(a); return cs(a); };
  const d = mk("btn-dark"), m = mk("btn-mag");
  set("dark-bg", d.backgroundColor); set("dark-r", d.borderRadius); set("mag-bg", m.backgroundColor); set("mag-r", m.borderRadius);
  set("input-r", cs(document.getElementById("f-name")).borderRadius);
})();
`;
const { html: probed } = render({ inject: probe });
const a = k => probed.match(new RegExp(`data-${k}="([^"]*)"`))[1];

test("Open Sans is the only family: loaded in 400/600/700 and used by body and headings", () => {
  assert.match(source, /fonts\.googleapis\.com\/css2\?family=Open\+Sans:wght@400;600;700/);
  assert.doesNotMatch(source, /Jost|Figtree/);
  assert.match(a("body-font"), /Open Sans/);
  assert.match(a("h2-font"), /Open Sans/);
});

test("section titles are bold uppercase with modest tracking", () => {
  assert.equal(a("h2-tt"), "uppercase");
  assert.ok(Number(a("h2-fw")) >= 700);
  const ls = parseFloat(a("h2-ls"));
  assert.ok(ls > 0 && ls <= 3, `letter-spacing ${a("h2-ls")}`);
});

test("every section head has one plain sentence under its title", () => {
  const heads = strip(render().html).match(/<div class="sec-head">[\s\S]*?<\/div>/g);
  assert.ok(heads.length >= 8);
  for (const h of heads) assert.match(h, /<p class="lead"/, h.slice(0, 80));
});

test("primary buttons are near-black, fuchsia stays for the main action, corners are 4px", () => {
  assert.equal(a("dark-bg"), "rgb(40, 40, 40)");
  assert.equal(a("mag-bg"), "rgb(214, 36, 127)");
  assert.equal(a("dark-r"), "4px");
  assert.equal(a("mag-r"), "4px");
  assert.equal(a("input-r"), "4px");
  assert.match(css, /\/\*[^*]*Fuchsia[^*]*main action[^*]*\*\//i, "the fuchsia rule is documented in a CSS comment");
});

test("decorative devices are gone: dashed borders and pink washes", () => {
  assert.doesNotMatch(css, /dashed/);
  assert.doesNotMatch(css, /#fdf2f7|#f3cfe0|#e7a9c7/);
});
