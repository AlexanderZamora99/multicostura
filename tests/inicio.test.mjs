// Home extras: trust strip after the hero and the "complete the look" section with hotspots.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const N = new Function(`${readFileSync(join(ROOT, "js/datos.js"), "utf8")}; return NEGOCIO;`)();
const { html, stderr } = render();
const pos = s => html.indexOf(s);
const section = id => html.slice(pos(`id="${id}"`), html.indexOf("</section>", pos(`id="${id}"`)));
const strip = s => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// Probe run in the page: reads the look state, then presses the second hotspot with the keyboard path (click on a real button).
const probe = `
  const out = {}, card = () => (document.getElementById("look-item") || {}).textContent || "";
  const dots = [...document.querySelectorAll("#look .punto")];
  out.first = card(); out.pressed0 = dots[0] && dots[0].getAttribute("aria-pressed");
  if (dots[1]) { dots[1].focus(); dots[1].click(); out.second = card(); out.pressed1 = dots[1].getAttribute("aria-pressed"); out.pressed0b = dots[0].getAttribute("aria-pressed"); }
  const cta = document.getElementById("look-cta"); if (cta) cta.click();
  out.model = document.getElementById("s-model").value; out.ok = 1;
  document.body.insertAdjacentHTML("beforeend", '<pre id="probe">' + JSON.stringify(out) + '</pre>');
`;
const probed = render({ inject: probe }).html;
const out = JSON.parse((probed.match(/<pre id="probe">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("trust strip sits right after the hero, one item per data entry", () => {
  assert.ok(pos('id="confianza"') > pos('class="hero"'));
  assert.ok(pos('id="confianza"') < pos('id="modelos"'));
  assert.equal(N.confianza.length, 4);
  const items = section("confianza").split('class="trust-item"').length - 1;
  assert.equal(items, N.confianza.length);
  N.confianza.forEach(c => assert.ok(strip(section("confianza")).includes(c.t)));
});

test("trust strip is a light strip using the redesign palette, not a dark band", () => {
  const css = readFileSync(join(ROOT, "css/estilos.css"), "utf8");
  const rule = (css.match(/\.trust\s*\{[^}]*\}/) || [""])[0];
  assert.ok(rule, ".trust rule exists");
  assert.doesNotMatch(rule, /var\(--ink\)|#000|#111/);
  assert.match(rule, /var\(--(bg|card)/);
});

test("look section follows the recommended section, before the next one", () => {
  assert.ok(pos('id="look"') > pos('id="modelos"'));
  assert.ok(pos('id="look"') < pos('id="nosotros"'));
});

test("look renders one named hotspot button per data entry, first part shown by default", () => {
  const dots = section("look").match(/<button[^>]*class="punto"[^>]*>/g) || [];
  assert.equal(dots.length, N.look.puntos.length);
  dots.forEach(d => assert.match(d, /aria-label="[^"]+"/));
  assert.match(dots[0], /aria-pressed="true"/);
  assert.ok(out.first.includes(N.look.puntos[0].t));
});

test("pressing a hotspot shows that part and moves the pressed state", () => {
  assert.ok(out.second.includes(N.look.puntos[1].t));
  assert.equal(out.pressed1, "true");
  assert.equal(out.pressed0b, "false");
});

test("look CTA sends the model to the designer", () => {
  assert.match(section("look"), /id="look-cta"/);
  assert.equal(out.model, N.look.modelo);
});

test("hotspots have a visible keyboard focus style", () => {
  assert.match(readFileSync(join(ROOT, "css/estilos.css"), "utf8"), /\.punto:focus-visible/);
});

test("no console errors on home or catalog", () => {
  assert.doesNotMatch(stderr, /ERROR|Uncaught/);
  assert.doesNotMatch(render({ page: "catalogo.html" }).stderr, /ERROR|Uncaught/);
});

test("catalog does not render the home extras", () => {
  const cat = render({ page: "catalogo.html" }).html;
  assert.doesNotMatch(cat, /id="look"|id="confianza"/);
});
