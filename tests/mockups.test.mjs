import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const between = (h, a, b) => { const i = h.indexOf(a); return h.slice(i, h.indexOf(b, i)); };
const attr = (html, k) => { const m = html.match(new RegExp(`data-${k}="([^"]*)"`)); return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"') : null; };

// ---------- T1: Descubre el look completo ----------
const lookProbe = `
  const b = document.body, card = () => document.getElementById("look-item").textContent;
  const dots = [...document.querySelectorAll("#look .punto")];
  b.setAttribute("data-l-first", card());
  b.setAttribute("data-l-pressed0", dots[0].getAttribute("aria-pressed"));
  dots[1].click();
  b.setAttribute("data-l-two", card());
  b.setAttribute("data-l-pressed1", dots[1].getAttribute("aria-pressed"));
  b.setAttribute("data-l-pressed0b", dots[0].getAttribute("aria-pressed"));
  dots[2].click();
  b.setAttribute("data-l-three", card());
  b.setAttribute("data-l-min", Math.min(...dots.map(d => Math.min(d.getBoundingClientRect().width, d.getBoundingClientRect().height))));
  document.getElementById("look-cta").click();
  b.setAttribute("data-l-qv", document.getElementById("qv").open ? document.getElementById("qv-title").textContent + "|" + document.getElementById("qv-colname").textContent : "closed");
`;
const look = render({ width: 1366, height: 900, inject: lookProbe }).html;
const lookDom = strip(look);

test("look section follows the recommended section", () => {
  assert.ok(lookDom.indexOf('id="look"') > lookDom.indexOf('id="reco"'));
  assert.ok(lookDom.indexOf('id="look"') < lookDom.indexOf('id="colecciones"'));
});

test("look has 3 accessible hotspot buttons, first pressed", () => {
  const sec = between(lookDom, 'id="look"', 'id="colecciones"');
  const dots = sec.match(/<button[^>]*class="punto"[^>]*>/g) || [];
  assert.equal(dots.length, 3);
  dots.forEach(d => assert.match(d, /aria-label="[^"]+"/));
  assert.equal(attr(look, "l-pressed0"), "true");
  assert.ok(Number(attr(look, "l-min")) >= 44, "touch target " + attr(look, "l-min"));
});

test("clicking a hotspot updates the live card", () => {
  assert.match(attr(look, "l-first"), /Blusa Kaill/);
  assert.match(attr(look, "l-two"), /Pantalón Kaill/);
  assert.equal(attr(look, "l-pressed1"), "true");
  assert.equal(attr(look, "l-pressed0b"), "false");
  assert.ok(lookDom.match(/id="look-item"[^>]*aria-live/) || lookDom.match(/aria-live[^>]*id="look-item"/));
});

test("embroidery hotspot builds prices from NEGOCIO.bordado", () => {
  const t = attr(look, "l-three");
  assert.match(t, /Bordado opcional/);
  assert.match(t, /\$12\.000/);
  assert.match(t, /\$6\.000/);
  assert.match(t, /dorado/);
});

test("look CTA opens the Kaill quick view in Azul rey", () => {
  assert.match(lookDom, /id="look-cta"[^>]*btn-mag|btn-mag[^>]*id="look-cta"/);
  assert.equal(attr(look, "l-qv"), "Kaill|Azul rey");
});

// ---------- T2: tabla + calculadora de tallas en #medidas ----------
const tallaProbe = `
  const b = document.body, g = id => document.getElementById(id);
  const poner = (bu, ci, ca) => { [["t-busto", bu], ["t-cintura", ci], ["t-cadera", ca]].forEach(([id, v]) => { g(id).value = v; g(id).dispatchEvent(new Event("input", { bubbles: true })); }); };
  const leer = k => { b.setAttribute("data-c-" + k, [g("r-tallas").textContent, g("r-nota").textContent, g("r-cta").getAttribute("href"), g("r-cta").className, g("r-cta").textContent].join("||")); };
  leer("vacio");
  poner("98", "80", "110"); leer("igual");
  b.setAttribute("data-c-on", [...document.querySelectorAll("#tabla-tallas .on")].map(c => c.tagName + c.dataset.t + (c.dataset.p || "")).join(","));
  poner("110", "80", "105"); leer("distinta");
  poner("90", "70", "125"); leer("xl");
  b.setAttribute("data-c-fn", typeof calcTalla === "function" ? JSON.stringify(calcTalla({ busto: 96, cintura: 78, cadera: 104 })) : "none");
`;
const tl = render({ width: 1366, height: 900, inject: tallaProbe }).html;
const tlDom = strip(tl);
const medidasSec = between(tlDom, 'id="medidas"', 'id="agenda"');
const partes = k => attr(tl, "c-" + k).split("||");

test("size guide renders two tables (blusa, pantalon) with captions, S M L XL and rows from NEGOCIO.tallas", () => {
  const wrap = between(medidasSec, 'id="tabla-tallas"', 'id="calc"');
  const tablas = wrap.match(/<table[\s\S]*?<\/table>/g) || [];
  assert.equal(tablas.length, 2);
  assert.match(tablas[0], /<caption>[^<]*blusa[^<]*cent[^<]*<\/caption>/i);
  assert.match(tablas[1], /<caption>[^<]*pantal[^<]*cent[^<]*<\/caption>/i);
  for (const tb of tablas) for (const t of ["S", "M", "L", "XL"]) assert.match(tb, new RegExp(`<th[^>]*scope="col"[^>]*>${t}</th>`));
  for (const row of ["BUSTO", "L.BLUSA"]) assert.ok(tablas[0].toUpperCase().includes(row), row);
  for (const row of ["L.PANTALÓN", "L.RODILLA", "C.RODILLA"]) assert.ok(tablas[1].toUpperCase().includes(row), row);
  assert.ok(tablas[1].includes(">61.5<") && tablas[1].includes(">64.5<") && tablas[1].includes(">25<"));
});

test("poster has heading and model image with alt, width, height and lazy loading inside #medidas", () => {
  assert.match(medidasSec, /<h3[^>]*>\s*Tabla de medidas\s*<\/h3>/i);
  const img = (medidasSec.match(/<img[^>]*guia-modelo\.webp[^>]*>/) || [])[0] || "";
  assert.ok(img, "model img");
  assert.match(img, /alt="[^"]{20,}"/);
  assert.match(img, /width="\d+"/); assert.match(img, /height="\d+"/); assert.match(img, /loading="lazy"/);
});

const posterProbe = `const r = s => { const b = document.querySelector(s).getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom].join(","); };
  document.body.setAttribute("data-p", r("#tabla-tallas") + "|" + r("#guia-modelo"));`;
const posterAt = w => { const h = render({ width: w, height: 900, inject: posterProbe }).html; return attr(h, "p").split("|").map(x => x.split(",").map(Number)); };

test("poster: model sits right of the tables on desktop, above them on mobile", () => {
  const [t, m] = posterAt(1366);
  assert.ok(m[0] >= t[2] - 1, `desktop model left ${m[0]} vs tables right ${t[2]}`);
  const [t5, m5] = posterAt(500);
  assert.ok(m5[3] <= t5[1] + 1, `mobile model bottom ${m5[3]} vs tables top ${t5[1]}`);
  assert.ok(t5[2] <= 500 + 1, "tables fit at 500");
});

test("medidas keeps guide photo ids and order before empresas", () => {
  for (const id of ["guia", "guia-img", "guia-tallas", "measures", "diagrama-guia", "calc", "t-busto", "t-cintura", "t-cadera", "r-tallas", "r-nota", "r-cta"]) assert.ok(medidasSec.includes(`id="${id}"`), id);
  assert.ok(tlDom.indexOf('id="medidas"') < tlDom.indexOf('id="empresas"'));
  assert.ok(/aria-live[^>]*>/.test(between(medidasSec, 'id="calc"', "</form>")));
});

test("calculator starts with a prompt, no size picked", () => {
  assert.match(partes("vacio")[0], /medidas/i);
  assert.doesNotMatch(partes("vacio")[0], /Blusa [SMLX]/);
});

test("busto 98 cintura 80 cadera 110 gives L in both garments", () => {
  const [res, nota, href, cls] = partes("igual");
  assert.match(res, /Blusa L/); assert.match(res, /Pantalón L/);
  assert.match(nota, /Te queda la talla L/);
  assert.equal(href, "#modelos"); assert.match(cls, /btn-dark/);
  const on = attr(tl, "c-on").split(",");
  assert.ok(on.includes("THL") && on.includes("TDLblusa") && on.includes("TDLpantalon"));
  assert.ok(!on.some(x => /^T[HD](S|M|XL)/.test(x)));
});

test("different sizes are explained", () => {
  const [res, nota] = partes("distinta");
  assert.match(res, /Blusa XL/); assert.match(res, /Pantalón M/);
  assert.match(nota, /Pide blusa XL y pantalón M/);
});

test("over XL sends to the agenda to be made to measure", () => {
  const [, nota, href, cls] = partes("xl");
  assert.match(nota, /pasas la talla XL: te la hacemos a tu medida/i);
  assert.equal(href, "#agenda"); assert.match(cls, /btn-mag/);
});

test("calcTalla is global and returns sizes", () => {
  assert.deepEqual(JSON.parse(attr(tl, "c-fn")), { blusa: "S", pantalon: "S" });
});
