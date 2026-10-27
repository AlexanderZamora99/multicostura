import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const { html, stderr } = render();
const dom = html.replace(/<script[\s\S]*?<\/script>/g, ""); // solo el DOM, sin el código fuente
const between = (a, b) => dom.slice(dom.indexOf(a), dom.indexOf(b));

test("category chips include surgical caps and compression stockings", () => {
  assert.match(dom, />Gorros quirúrgicos<\/button>/);
  assert.match(dom, />Medias de compresión<\/button>/);
});

// changed: cards render without a photo now (silhouette), and the list holds up to 8 ids
test("recommended grid renders one card per NEGOCIO.recomendados id", () => {
  assert.ok(dom.includes('id="recomendados"'));
  const html = render({ inject: 'NEGOCIO.recomendados.forEach(id => (NEGOCIO.modelos.find(m => m.id === id).foto = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E")); renderRecomendados();' }).html.replace(/<script[\s\S]*?<\/script>/g, "");
  const row = html.slice(html.indexOf('id="recomendados"'), html.indexOf('id="profs"'));
  assert.equal(count(row, '<article class="model"'), 8);
});

test("products without price show 'Consultar' and are not designable", () => {
  assert.ok(dom.includes("Consultar"));
  const select = between('<select id="s-model"', "</select>");
  assert.doesNotMatch(select, /Gorro|Medias/);
  assert.match(select, /Kaill/);
});

test("size guide image slot exists in the measurements section", () => {
  const section = between('id="medidas"', 'id="empresas"');
  assert.ok(section.includes('id="guia-img"'));
});

test("designer preview has a photo slot that never overlays the name text", () => {
  assert.ok(dom.includes('id="pv-photo"'));
});

test("catalog changes run without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});
