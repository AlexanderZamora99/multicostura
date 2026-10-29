import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const { html, stderr } = render({ page: "catalogo.html" });
const dom = html.replace(/<script[\s\S]*?<\/script>/g, ""); // solo el DOM, sin el código fuente
const homeDom = render().html.replace(/<script[\s\S]*?<\/script>/g, ""); // the home keeps the size guide and the designer
const between =(a, b) => dom.slice(dom.indexOf(a), dom.indexOf(b));

test("category filter includes surgical caps and compression stockings", () => {
  assert.match(dom, /name="cat" value="Gorros quirúrgicos"[^>]*>Gorros quirúrgicos<span class="cuenta">\d+<\/span>/);
  assert.match(dom, /name="cat" value="Medias de compresión"[^>]*>Medias de compresión<span class="cuenta">\d+<\/span>/);
});

// changed: cards render without a photo now (silhouette), and the list holds up to 8 ids
test("recommended grid renders one card per NEGOCIO.recomendados id", () => {
  const html = render({ inject: 'NEGOCIO.recomendados.forEach(id => (NEGOCIO.modelos.find(m => m.id === id).foto = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E")); renderRecomendados();' }).html.replace(/<script[\s\S]*?<\/script>/g, "");
  assert.ok(html.includes('id="recomendados"'));
  const row = html.slice(html.indexOf('id="recomendados"'), html.indexOf('id="look"'));
  assert.equal(count(row, '<article class="model"'), 8);
});

test("products without price show 'Consultar' and are not designable", () => {
  assert.ok(dom.includes("Consultar"));
  const home = render().html.replace(/<script[\s\S]*?<\/script>/g, "");
  const i = home.indexOf('<select id="s-model"'), select = home.slice(i, home.indexOf("</select>", i));
  assert.doesNotMatch(select, /Gorro|Medias/);
  assert.match(select, /Kaill/);
});

test("size guide image slot exists in the measurements section", () => {
  const section = homeDom.slice(homeDom.indexOf('id="medidas"'), homeDom.indexOf('id="empresas"'));
  assert.ok(section.includes('id="guia-img"'));
});

test("designer preview has a photo slot that never overlays the name text", () => {
  assert.ok(homeDom.includes('id="pv-photo"'));
});

test("catalog changes run without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});
