import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, count } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };

test("category circles: one per NEGOCIO.categoriasCirculos, in order", () => {
  const s = section(dom, "colecciones");
  assert.equal(count(s, 'class="cat"'), 5);
  const labels = [...s.matchAll(/<span class="cat-name">([^<]+)</g)].map(m => m[1]);
  assert.deepEqual(labels, ["Uniformes", "Línea blancos", "Gorros quirúrgicos", "Medias de compresión", "Batas y pantalones"]);
});

test("clicking a category circle filters the catalog", () => {
  const html = strip(render({ inject: 'document.querySelectorAll("#cats .cat")[1].click();' }).html);
  const grid = section(html, "models");
  assert.equal(count(grid, '<article class="model"'), 5); // París, Alondra/Clásico/Durango blanco, Bata
  assert.match(html, /<button type="button" class="on" aria-pressed="true">Línea blancos<\/button>/);
});

test("a category circle without photo keeps its label and a neutral icon", () => {
  const html = strip(render({ inject: 'document.querySelectorAll("#cats img").forEach(i => i.dispatchEvent(new Event("error")));' }).html);
  const s = section(html, "colecciones");
  assert.doesNotMatch(s, /<img/);
  assert.equal(count(s, "<svg"), 5);
});

test("three 'uniforme para ti' tiles map to the price tiers with their price and delivery time", () => {
  const s = section(dom, "perfiles");
  assert.ok(s.includes("¿Cuál es el uniforme para ti?"));
  assert.equal(count(s, 'class="tile"'), 3);
  for (const t of ["Precio tienda", "Diseño bajo pedido", "Diseño por medida", "Entrega inmediata", "3 a 5 días hábiles", "5 a 8 días hábiles", "$175.000", "$185.000"]) {
    assert.ok(s.includes(t), `missing ${t}`);
  }
  assert.match(s, /<a[^>]*class="tile"[^>]*href="https:\/\/wa\.me\/573217830050\?text=[^"]*"/); // tienda, fallback while tiendaOnline is empty
  assert.match(s, /<a[^>]*class="tile"[^>]*href="#personaliza"/);
  assert.match(s, /<a[^>]*class="tile"[^>]*href="#agenda"/);
});

test("the store tile links to Mecodes when tiendaOnline is set", () => {
  const html = strip(render({ inject: 'NEGOCIO.tiendaOnline = "https://tienda.example/mecodes"; renderPerfiles();' }).html);
  assert.match(section(html, "perfiles"), /href="https:\/\/tienda\.example\/mecodes"/);
});

test("recommended carousel has labelled arrows, one card per id and scroll-snap", () => {
  const s = section(dom, "reco");
  assert.ok(s.includes("Nuestros recomendados"));
  assert.match(s, /aria-label="Recomendados anteriores"/);
  assert.match(s, /aria-label="Recomendados siguientes"/);
  assert.equal(count(s, '<article class="model"'), 4);
  assert.match(source, /\.rail\s*\{[^}]*scroll-snap-type/);
});

test("a product with a second photo swaps it in on hover", () => {
  const html = strip(render({ inject: 'NEGOCIO.modelos.find(m => m.id === "kaill").foto2 = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E"; document.getElementById("recomendados").innerHTML = ""; renderRecomendados();' }).html);
  assert.match(section(html, "reco"), /class="swap"/);
  assert.match(source, /\.pic:hover \.swap/);
  assert.doesNotMatch(section(dom, "reco"), /class="swap"/);
});

test("trust strip replaces the stats band: four items with inline line icons and dividers", () => {
  const s = section(dom, "confianza");
  assert.equal(count(s, 'class="trust-item"'), 4);
  assert.equal(count(s, "<svg"), 4);
  assert.ok(s.includes("10 años") && s.includes("toda Colombia"));
  assert.doesNotMatch(dom, /stats-band/);
  assert.match(source, /\.trust-item \+ \.trust-item\s*\{[^}]*border-left/);
  assert.doesNotMatch(source, /\.trust strong\s*\{[^}]*var\(--mag\)/);
});

test("trust strip fits two columns on phones", () => {
  assert.match(source, /@media \(max-width: 900px\)\s*\{\s*\.trust \.wrap\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
});

test("price tiers live in the tiles, not in a duplicated table", () => {
  assert.doesNotMatch(dom, /id="tipos"/);
});

test("storefront body runs without uncaught errors", () => {
  assert.doesNotMatch(render().stderr, /Uncaught/);
});
