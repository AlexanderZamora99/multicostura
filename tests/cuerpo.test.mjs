import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count, source as pageSource } from "./render.mjs";

const source = pageSource();
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };

// changed: the five category circles became three large collection tiles (Uniformes, Línea blancos, Gorros y medias); the new shape is covered in canon.test.mjs
test("three 'uniforme para ti' tiles map to the price tiers with their price and delivery time", () => {
  const s = section(dom, "perfiles");
  assert.ok(s.includes("¿Cuál es el uniforme para ti?"));
  assert.equal(count(s, '<a class="tile'), 3);
  for (const t of ["Precio tienda", "Diseño bajo pedido", "Diseño por medida", "Entrega inmediata", "3 a 5 días hábiles", "5 a 8 días hábiles", "$175.000", "$185.000"]) {
    assert.ok(s.includes(t), `missing ${t}`);
  }
  assert.match(s, /<a[^>]*class="tile[^"]*"[^>]*href="https:\/\/wa\.me\/573217830050\?text=[^"]*"/); // tienda, fallback while tiendaOnline is empty
  assert.match(s, /<a[^>]*class="tile[^"]*"[^>]*href="#personaliza"/);
  assert.match(s, /<a[^>]*class="tile[^"]*"[^>]*href="#agenda"/);
});

test("the store tile links to Mecodes when tiendaOnline is set", () => {
  const html = strip(render({ inject: 'NEGOCIO.tiendaOnline = "https://tienda.example/mecodes"; renderPerfiles();' }).html);
  assert.match(section(html, "perfiles"), /href="https:\/\/tienda\.example\/mecodes"/);
});

const ALL_PHOTOS = `NEGOCIO.recomendados.forEach(id => (NEGOCIO.modelos.find(m => m.id === id).foto = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E")); renderRecomendados();`;
// changed: cards render only with a loaded photo, so the test supplies photos
// changed: recommended is now a grid of up to 8 cards (canon store section), no carousel arrows; the scroll rail stays for testimonials
test("recommended grid has one card per id (up to 8) and no carousel arrows", () => {
  const s = section(strip(render({ inject: ALL_PHOTOS }).html), "reco");
  assert.ok(s.includes("Nuestros recomendados"));
  assert.doesNotMatch(s, /Recomendados (anteriores|siguientes)/);
  assert.equal(count(s, '<article class="model"'), 8);
  assert.match(source, /\.rail\s*\{[^}]*scroll-snap-type/);
});

test("a product with a second photo swaps it in on hover", () => {
  const html = strip(render({ inject: 'NEGOCIO.modelos.find(m => m.id === "kaill").foto = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E"; NEGOCIO.modelos.find(m => m.id === "kaill").foto2 = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E"; renderRecomendados();' }).html);
  assert.match(section(html, "reco"), /class="swap"/);
  assert.match(source, /\.pic:hover \.swap/);
  assert.doesNotMatch(section(dom, "reco"), /class="swap"/);
});

// changed: the trust block is four centred line-icon items on light grey (no dividers); "Más de 10 años" now lives in the marquee and the about text
test("trust block replaces the stats band: four items with inline line icons", () => {
  const s = section(dom, "confianza");
  assert.equal(count(s, 'class="trust-item"'), 4);
  assert.equal(count(s, "<svg"), 4);
  assert.ok(s.includes("toda Colombia"));
  assert.doesNotMatch(dom, /stats-band/);
  assert.doesNotMatch(source, /\.trust strong\s*\{[^}]*var\(--mag\)/);
});

test("trust block fits two columns on phones", () => {
  assert.match(source, /@media \(max-width: 900px\)\s*\{\s*\.trust-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/); // changed: .trust .wrap became .trust-grid
});

test("price tiers live in the tiles, not in a duplicated table", () => {
  assert.doesNotMatch(dom, /id="tipos"/);
});

test("storefront body runs without uncaught errors", () => {
  assert.doesNotMatch(render().stderr, /Uncaught/);
});
