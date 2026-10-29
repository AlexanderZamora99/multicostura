import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const home = strip(render().html);
const cat = strip(render({ page: "catalogo.html" }).html);
const at = (d, id) => d.indexOf(`id="${id}"`);
const body = d => d.slice(d.indexOf("<main"), d.indexOf("</main>"));

const probe = `
(() => {
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const rgb = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > .9) return c.c; } return [255, 255, 255]; };
  const d = document.body, set = (k, v) => d.setAttribute("data-p-" + k, v);
  const f = document.getElementById("confianza");
  if (f) {
  const bg = bgOf(f); set("franja-bg", bg.join(","));
  let min = 99; f.querySelectorAll("strong, small, h2, p").forEach(el => { const c = rgb(getComputedStyle(el).color); if (c) min = Math.min(min, ratio(c.c, bg)); });
  set("franja-min", min.toFixed(2));
  set("franja-icon", f.querySelectorAll("svg").length);
  }
  const n = document.getElementById("nosotros");
  if (n) {
  set("nos-words", n.innerText.trim().split(/\s+/).length);
  set("nos-more", /conoce m[aá]s/i.test(n.innerText) ? 1 : 0);
  set("nos-img", n.querySelectorAll("img").length);
  }
  const fo = document.querySelector("footer.site");
  set("foot-map", fo.querySelectorAll(".map iframe").length);
  set("foot-text", fo.innerText.replace(/\\s+/g, " "));
})();
`;
const p = render({ inject: probe }).html;
const q = k => p.match(new RegExp(`data-p-${k}="([^"]*)"`))[1];
const pc = render({ page: "catalogo.html", inject: probe }).html;
const qc = k => pc.match(new RegExp(`data-p-${k}="([^"]*)"`))[1];

test("home section order follows the approved structure", () => {
  const ids = ["banner", "confianza", "reco", "nosotros", "look", "personaliza", "proceso", "medidas", "agenda", "empresas", "regalo", "comunidad", "faq"];
  const pos = ids.map(id => at(home, id));
  assert.ok(pos.every(i => i > 0), `missing: ${ids.filter((_, i) => pos[i] < 0)}`);
  assert.deepEqual([...pos].sort((x, y) => x - y), pos, ids.join(" < "));
});

test("Empresas and Regala are separate sections; clientas block groups testimonios, clientas and videos", () => {
  assert.match(home, /<section[^>]*id="empresas"[\s\S]*?<\/section>\s*<section[^>]*id="regalo"/);
  assert.ok(at(home, "bono") > at(home, "regalo"));
  const blk = home.slice(at(home, "comunidad"), at(home, "faq"));
  for (const id of ["testimonios", "clientas", "videos"]) assert.ok(blk.includes(`id="${id}"`), id);
});

test("franja de confianza: dark full-width band, line icons, AA contrast", () => {
  assert.notEqual(q("franja-bg"), "255,255,255");
  assert.ok(Number(q("franja-min")) >= 4.5, `contrast ${q("franja-min")}`);
  assert.ok(Number(q("franja-icon")) >= 3);
});

test("Quiénes somos starts short with a Conoce más control and a photo", () => {
  assert.ok(Number(q("nos-words")) <= 60, `${q("nos-words")} words`);
  assert.equal(q("nos-more"), "1");
  assert.ok(Number(q("nos-img")) >= 1);
  assert.match(home, /<details[^>]*>[\s\S]*Conoce más[\s\S]*<\/details>/);
  assert.ok(home.includes("Puedes llevarte en la tienda un modelo ya hecho"), "owner text kept");
});

test("no contacto-band; contact, map and schedule live in the footer of both pages", () => {
  for (const [d, k] of [[home, q], [cat, qc]]) {
    assert.ok(!d.includes("contacto-band"));
    assert.ok(!body(d).includes('class="map"'));
    const f = d.slice(d.indexOf("<footer"), d.indexOf("</footer>"));
    assert.match(f, /href="https:\/\/wa\.me\/573217830050/);
    assert.equal(k("foot-map"), "1");
    assert.ok(k("foot-text").includes("Calle 24 T10-39"));
    assert.ok(k("foot-text").includes("Lunes a viernes"));
  }
});

test("nav has the six links with page-correct hrefs", () => {
  const nav = d => [...d.match(/<ul id="nav-list">[\s\S]*?<\/ul>/)[0].matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(m => [m[2], m[1]]);
  assert.deepEqual(nav(home), [["Inicio", "index.html"], ["Catálogo", "catalogo.html"], ["Diseña", "#personaliza"], ["Tallas", "#medidas"], ["Agenda", "#agenda"], ["Empresas", "#empresas"]]);
  assert.deepEqual(nav(cat), [["Inicio", "index.html"], ["Catálogo", "catalogo.html"], ["Diseña", "index.html#personaliza"], ["Tallas", "index.html#medidas"], ["Agenda", "index.html#agenda"], ["Empresas", "index.html#empresas"]]);
});
