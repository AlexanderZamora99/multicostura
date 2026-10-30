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

test("no size filter or calculator on either page", () => {
  for (const page of ["index.html", "catalogo.html"]) {
    const { html } = render({ page });
    assert.ok(!/id="f-talla"/.test(html), `${page}: size filter`);
    assert.ok(!/<legend[^>]*>\s*Talla/i.test(html), `${page}: size legend`);
    assert.ok(!/calculadora/i.test(html), `${page}: size calculator`);
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

// ---- Product dialog (#pd): in-place embroidery and measuring guide ----
const dialogo = `
  const wait = ms => new Promise(r => setTimeout(r, ms)), g = id => document.getElementById(id);
  const num = s => Number(String(s).replace(/\\D/g, "")), wa = () => decodeURIComponent(g("pd-wa").getAttribute("href"));
  const teclear = (id, v) => { const el = g(id); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
  (async () => {
    const out = {};
    await wait(200);
    document.querySelector('.model[data-id="kaill"] .pic').click(); await wait(100);
    out.open = g("pd").open; out.pers = !!g("pd-pers");
    out.t0 = num(g("pd-total").textContent); out.wa0 = wa(); out.patch0 = g("pd-main").classList.contains("con-bordado");
    teclear("pd-name", "Dra. Ana Paz");
    out.t1 = num(g("pd-total").textContent); out.patch1 = g("pd-main").classList.contains("con-bordado"); out.patchTxt = g("pd-patch").textContent;
    g("pd-plus").click(); out.q = g("pd-q").textContent; out.t2 = num(g("pd-total").textContent);
    g("pd-minus").click();
    teclear("pd-role", "Pediatra"); out.t3 = num(g("pd-total").textContent);
    const dor = [...g("pd-hilos").querySelectorAll("button")].find(b => b.dataset.hilo === "Dorado"); dor.click(); out.hiloPressed = dor.getAttribute("aria-pressed");
    out.wa1 = wa(); out.hilo = g("pd-patch").style.getPropertyValue("--hilo");
    teclear("pd-name", ""); teclear("pd-role", ""); out.t4 = num(g("pd-total").textContent); out.patch4 = g("pd-main").classList.contains("con-bordado"); out.wa4 = wa();
    const d = g("pd").querySelector("details#pd-guia");
    out.guia = !!d; out.guiaSteps = d ? d.querySelectorAll("ol li").length : 0; out.guiaImg = d ? (d.querySelector("img") || {}).getAttribute && d.querySelector("img").getAttribute("src") : "";
    out.guiaParent = d ? !!d.closest(".pd-info") : false;
    g("pd-close").click(); await wait(50);
    document.querySelector('.model[data-id="gorro"] .pic').click(); await wait(100);
    out.gorroBord = g("pd-bord-box").hidden;
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe3">' + JSON.stringify(out) + '</pre>');
  })();
`;
const pd = JSON.parse((render({ page: "catalogo.html", inject: dialogo }).html.match(/<pre id="probe3">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("product dialog: typing an embroidery name shows the patch on the photo and adds its price", () => {
  assert.equal(pd.open, true);
  assert.equal(pd.patch0, false);
  assert.equal(pd.patch1, true);
  assert.ok(pd.patchTxt.includes("Dra. Ana Paz"));
  assert.equal(pd.t1 - pd.t0, N.bordado.nombre);
  assert.equal(pd.q, "2");
  assert.equal(pd.t2, 2 * pd.t1, "embroidery is charged per unit");
  assert.equal(pd.t3 - pd.t0, N.bordado.nombre + N.bordado.profesion);
  assert.equal(pd.t4, pd.t0);
  assert.equal(pd.patch4, false);
});

test("product dialog: the WhatsApp order includes the embroidery and thread, and not when empty", () => {
  assert.ok(pd.wa1.includes("Dra. Ana Paz") && pd.wa1.includes("Pediatra"), pd.wa1);
  assert.match(pd.wa1, /dorado/i);
  assert.equal(pd.hiloPressed, "true");
  assert.equal(pd.hilo.trim(), N.hilos.Dorado);
  assert.doesNotMatch(pd.wa0, /bordado/i);
  assert.doesNotMatch(pd.wa4, /bordado/i);
});

test("product dialog: embroidery is hidden for accessories and the old 'Personalizar y bordar' exit is gone", () => {
  assert.equal(pd.gorroBord, true);
  assert.equal(pd.pers, false);
});

test("product dialog: measuring guide sits in the right column as an in-place <details> with the steps and size chart", () => {
  assert.equal(pd.guia, true);
  assert.equal(pd.guiaParent, true);
  assert.equal(pd.guiaSteps, N.medidas.length);
  assert.match(pd.guiaImg, /tabla-medidas\.jpg$/);
});

test("home shares the same product dialog: in-place embroidery and measuring guide, no exit to the designer", () => {
  const { html } = render();
  const dlg = html.slice(html.indexOf('<dialog class="pd"'), html.indexOf("</dialog>"));
  assert.match(dlg, /id="pd-guia"/);
  assert.match(dlg, /id="pd-bord-box"/);
  assert.doesNotMatch(dlg, /id="pd-pers"/);
});
