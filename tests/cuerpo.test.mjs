import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count, source as pageSource } from "./render.mjs";

const source = pageSource();
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };

// changed: the "uniforme para ti" tiles were purchase modes; they are now the "Forma de compra" filter of catalogo.html (see catalogo-filtros.test.mjs)
test("the store button on the catalog links to Mecodes when tiendaOnline is set", () => {
  const html = strip(render({ page: "catalogo.html", inject: 'NEGOCIO.tiendaOnline = "https://tienda.example/mecodes"; $("stock-btn").href = tiendaHref();' }).html);
  assert.match(html, /id="stock-btn"[^>]*href="https:\/\/tienda\.example\/mecodes"/);
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

// changed: the trust block is four line-icon items on a dark band (no dividers); "Más de 10 años" now lives in the marquee and the about text
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
