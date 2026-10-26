import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const cards = dom.split('<article class="model"').slice(1);
const cardOf = nombre => cards.find(c => c.includes(`<b>${nombre}</b>`)) || "";
const media = query => // todas las líneas @media con esa condición
  source.split("\n").filter(l => l.trim().startsWith(`@media (${query})`)).join("\n");

test("non-uniform products show a neutral placeholder, not the scrub mock-up", () => {
  for (const n of ["Gorro quirúrgico", "Medias de compresión"]) {
    const c = cardOf(n);
    assert.ok(c.includes("Foto próximamente"), `${n}: no placeholder`);
    assert.ok(!c.includes('href="#scrub"'), `${n}: still shows scrub`);
  }
  assert.ok(cardOf("Kaill").includes('href="#scrub"'), "uniforms keep the SVG fallback");
  assert.ok(!cardOf("Kaill").includes("Foto próximamente"));
});

test("hero stats stay on one row on phones", () => {
  assert.match(media("max-width: 480px"), /\.stats[^}]*flex-wrap:\s*nowrap/);
});

test("recommended row is a horizontal scroll-snap row on phones", () => {
  const m = media("max-width: 640px");
  assert.match(m, /#recomendados[^}]*scroll-snap-type/);
  assert.match(m, /#recomendados[^}]*overflow-x:\s*auto/);
});

test("color swatches keep a 14px dot but have a 24px touch target", () => {
  assert.match(source, /\.swatches button::after\s*\{[^}]*inset:\s*-5px/);
  assert.match(source, /\.swatches button\s*\{[^}]*position:\s*relative/);
});

test("FAQ answers with business figures are built from NEGOCIO", () => {
  const flow = `(() => {
    NEGOCIO.recargoDomicilio = 12345;
    NEGOCIO.tipos[1].tiempo = "9 dias de prueba";
    NEGOCIO.bonos = [777000];
    NEGOCIO.tipos[2].precio = 999000;
    NEGOCIO.bordado.nombre = 4321;
    const ask = t => { document.getElementById("chat-input").value = t; document.getElementById("chat-form").requestSubmit(); };
    ["domicilio", "tiempo", "bono", "precio"].forEach(ask);
  })();`;
  const log = strip(render({ inject: flow }).html);
  const bubbles = log.slice(log.indexOf('id="chat-log"'), log.indexOf('id="chat-chips"'));
  for (const t of ["$12.345", "9 dias de prueba", "$777.000", "$999.000", "$4.321"]) {
    assert.ok(bubbles.includes(t), `answer not driven by NEGOCIO: ${t}`);
  }
});
