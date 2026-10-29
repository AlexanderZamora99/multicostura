// Catalog page and home recommendations: filters, URL state, drawer and cross-page actions.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const N = new Function(`${readFileSync(join(ROOT, "js/datos.js"), "utf8")}; return NEGOCIO;`)();
const coloresDe = m => m.colores || Object.keys(N.colores);

// Card ids in DOM order, from the data-id each card carries.
const ids = html => [...html.matchAll(/<article class="model"[^>]*data-id="([^"]+)"/g)].map(m => m[1]);
// Text of the results counter ("12 modelos").
const cuenta = html => (html.match(/id="res-cuenta"[^>]*>([^<]*)</) || [])[1];
const etiqueta = n => `${n} ${n === 1 ? "modelo" : "modelos"}`;
const modelosDe = fn => N.modelos.filter(fn).map(m => m.id);

test("home shows the recommended models in order, plus a link to the catalog", () => {
  const { html } = render();
  assert.equal(N.recomendados.length, 8);
  assert.ok(N.recomendados.every(id => N.modelos.some(m => m.id === id)));
  assert.deepEqual(ids(html), N.recomendados);
  assert.match(html, /<a [^>]*href="catalogo\.html"[^>]*>\s*Ver todo el catálogo/);
  assert.ok(!/id="profs"/.test(html), "home no longer has category chips");
});

test("nav and footer 'Catálogo' links point to catalogo.html", () => {
  const { html } = render();
  assert.match(html, /<li><a href="catalogo\.html">Catálogo<\/a><\/li>/);
});

test("catalogo.html renders every model with no filters", () => {
  const { html } = render({ page: "catalogo.html" });
  assert.deepEqual(new Set(ids(html)), new Set(N.modelos.map(m => m.id)));
  assert.equal(ids(html).length, N.modelos.length);
  assert.equal(cuenta(html), etiqueta(N.modelos.length));
  // header links go back to the home sections
  assert.match(html, /href="index\.html#personaliza"/);
  assert.match(html, /<a href="catalogo\.html"[^>]*>Catálogo<\/a>/);
});

test("?cat= narrows to one category by short name and the count matches", () => {
  const { html } = render({ page: "catalogo.html", query: "?cat=gorros" });
  const esperado = modelosDe(m => m.cat.includes("Gorros quirúrgicos"));
  assert.ok(esperado.length > 0 && esperado.length < N.modelos.length);
  assert.deepEqual(ids(html).sort(), esperado.sort());
  assert.equal(cuenta(html), etiqueta(esperado.length));
});

test("?color= keeps only models offered in that color", () => {
  const { html } = render({ page: "catalogo.html", query: "?color=fucsia" });
  const esperado = modelosDe(m => coloresDe(m).includes("Fucsia"));
  assert.ok(esperado.length > 0 && esperado.length < N.modelos.length);
  assert.deepEqual(ids(html).sort(), esperado.sort());
  assert.equal(cuenta(html), etiqueta(esperado.length));
});

test("?forma= keeps only models that can be bought that way", () => {
  const { html } = render({ page: "catalogo.html", query: "?forma=pedido" });
  const esperado = modelosDe(m => !m.precioFijo);
  assert.ok(esperado.length > 0 && esperado.length < N.modelos.length);
  assert.deepEqual(ids(html).sort(), esperado.sort());
  // the tienda mode keeps everything: fixed-price models are sold in store
  const tienda = render({ page: "catalogo.html", query: "?forma=tienda" }).html;
  assert.equal(ids(tienda).length, N.modelos.length);
});

test("filters combine", () => {
  const { html } = render({ page: "catalogo.html", query: "?cat=conjuntos&forma=medida&color=rosa" });
  const esperado = modelosDe(m => m.cat.includes("Conjuntos") && !m.precioFijo && coloresDe(m).includes("Rosa"));
  assert.ok(esperado.length > 0);
  assert.deepEqual(ids(html).sort(), esperado.sort());
  assert.equal(cuenta(html), etiqueta(esperado.length));
});

test("?orden=asc sorts by price, cheapest first, unpriced last", () => {
  const { html } = render({ page: "catalogo.html", query: "?orden=asc" });
  const lista = ids(html).map(id => N.modelos.find(m => m.id === id).precio);
  const conPrecio = lista.filter(p => p != null);
  assert.deepEqual(conPrecio, [...conPrecio].sort((a, b) => a - b));
  assert.equal(conPrecio[0], Math.min(...N.modelos.map(m => m.precio).filter(p => p != null)));
  assert.equal(lista.slice(conPrecio.length).every(p => p == null), true);
  const desc = ids(render({ page: "catalogo.html", query: "?orden=desc" }).html).map(id => N.modelos.find(m => m.id === id).precio).filter(p => p != null);
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
});

test("an impossible combination shows the empty state with a clear button", () => {
  const { html } = render({ page: "catalogo.html", query: "?cat=gorros&forma=medida" });
  assert.equal(modelosDe(m => m.cat.includes("Gorros quirúrgicos") && !m.precioFijo).length, 0);
  assert.equal(ids(html).length, 0);
  assert.equal(cuenta(html), "0 modelos");
  assert.match(html, /class="[^"]*vacio[^"]*"/);
  assert.match(html, /id="f-vaciar"[^>]*>\s*Limpiar filtros/);
});

test("filter controls reflect the URL state and clearing resets the list", () => {
  const { html } = render({
    page: "catalogo.html", query: "?cat=gorros&color=fucsia",
    inject: `const sel = () => document.querySelector('input[name="cat"]:checked').value;
      const antes = { cat: sel(), color: document.querySelector('#f-colores [aria-pressed="true"]')?.title };
      document.getElementById("f-limpiar").click();
      document.body.dataset.t = JSON.stringify({ antes, cat: sel(), n: document.querySelectorAll(".model").length, url: location.search, vacio: !!document.querySelector(".vacio") });`,
  });
  const t = JSON.parse(html.match(/data-t='([^']*)'|data-t="([^"]*)"/).slice(1).find(Boolean).replace(/&quot;/g, '"'));
  assert.deepEqual(t.antes, { cat: "Gorros quirúrgicos", color: "Fucsia" });
  assert.equal(t.cat, "Todos");
  assert.equal(t.n, N.modelos.length);
  assert.equal(t.url, "");
  assert.equal(t.vacio, false);
});

test("no size UI on either page", () => {
  for (const page of ["index.html", "catalogo.html"]) {
    const { html } = render({ page });
    assert.ok(!/id="f-talla"/.test(html), `${page}: size filter`);
    assert.ok(!/<legend[^>]*>\s*Talla/i.test(html), `${page}: size legend`);
    assert.ok(!/calculadora|guía de tallas|tabla de tallas/i.test(html), `${page}: size tools`);
  }
});

test("no console errors on either page", () => {
  for (const [page, query] of [["index.html", ""], ["catalogo.html", ""], ["catalogo.html", "?cat=gorros&color=fucsia"]]) {
    const { stderr } = render({ page, query });
    assert.ok(!/Uncaught|SyntaxError|ReferenceError|TypeError/.test(stderr), `${page}${query}: ${stderr}`);
  }
});

test("filters sit in a drawer with an accessible toggle", () => {
  const raw = readFileSync(join(ROOT, "catalogo.html"), "utf8");
  assert.match(raw, /<button[^>]*id="abrir-filtros"[^>]*aria-expanded="false"[^>]*aria-controls="panel-filtros"|<button[^>]*id="abrir-filtros"[^>]*aria-controls="panel-filtros"[^>]*aria-expanded="false"/);
  assert.match(raw, /id="panel-filtros"/);
  assert.match(raw, /id="cerrar-filtros"/);
});

test("the drawer opens with the button and closes with Escape", () => {
  const { html } = render({
    page: "catalogo.html", width: 700,
    inject: `const b = document.getElementById("abrir-filtros"), p = document.getElementById("panel-filtros");
      b.click();
      const abierto = { cls: p.classList.contains("abierto"), exp: b.getAttribute("aria-expanded"), velo: !!document.querySelector(".velo"), foco: document.activeElement.id };
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      const cerrado = { cls: p.classList.contains("abierto"), exp: b.getAttribute("aria-expanded"), velo: !!document.querySelector(".velo"), foco: document.activeElement.id };
      document.body.dataset.t = JSON.stringify({ abierto, cerrado });`,
  });
  const t = JSON.parse(html.match(/data-t='([^']*)'|data-t="([^"]*)"/).slice(1).find(Boolean).replace(/&quot;/g, '"'));
  assert.deepEqual(t.abierto, { cls: true, exp: "true", velo: true, foco: "cerrar-filtros" });
  assert.deepEqual(t.cerrado, { cls: false, exp: "false", velo: false, foco: "abrir-filtros" });
});

test("home preselects the model from ?modelo= (link from the catalog)", () => {
  const { html } = render({ query: "?modelo=luna#personaliza" });
  assert.match(html, /id="pv-cap">Luna · /);
});

test("'Diseñar' on the catalog goes to the home designer with that model", () => {
  const { html } = render({
    page: "catalogo.html", query: "?cat=conjuntos&orden=nombre",
    inject: `document.querySelector(".model .design-btn").click();`,
  });
  const primero = N.modelos.filter(m => m.cat.includes("Conjuntos")).map(m => m.nombre).sort((a, b) => a.localeCompare(b, "es"))[0];
  assert.match(html, new RegExp(`id="pv-cap">${primero} · `));
});
