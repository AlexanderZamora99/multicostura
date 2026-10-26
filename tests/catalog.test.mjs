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

test("recommended row renders one card per NEGOCIO.recomendados id", () => {
  assert.ok(dom.includes('id="recomendados"'));
  const row = between('id="recomendados"', 'id="profs"');
  assert.equal(count(row, '<article class="model"'), 4);
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
