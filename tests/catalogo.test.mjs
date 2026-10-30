// Catalog page and home recommendations: filters, URL state, drawer and cross-page actions.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
    { const r = g("pd-patch").getBoundingClientRect(), m = g("pd-main").getBoundingClientRect();
      out.patchX = (r.left + r.width / 2 - m.left) / m.width; out.patchY = (r.top + r.height / 2 - m.top) / m.height; out.patchW = r.width / m.width; }
    g("pd-plus").click(); out.q = g("pd-q").textContent; out.t2 = num(g("pd-total").textContent);
    g("pd-minus").click();
    teclear("pd-role", "Pediatra"); out.t3 = num(g("pd-total").textContent);
    const dor = [...g("pd-hilos").querySelectorAll("button")].find(b => b.dataset.hilo === "Dorado"); dor.click(); out.hiloPressed = dor.getAttribute("aria-pressed");
    out.wa1 = wa(); out.hilo = g("pd-patch").style.getPropertyValue("--hilo");
    teclear("pd-name", ""); teclear("pd-role", ""); out.t4 = num(g("pd-total").textContent); out.patch4 = g("pd-main").classList.contains("con-bordado"); out.wa4 = wa();
    const d = g("pd").querySelector("details#pd-guia");
    out.guia = !!d; out.guiaSteps = d ? d.querySelectorAll("ol li").length : 0; out.guiaImg = d ? d.querySelectorAll("img").length : -1;
    out.guiaLink = d ? [...d.querySelectorAll("a")].map(a => [a.getAttribute("href"), a.target, a.rel, a.textContent.trim()]) : [];
    out.guiaStrong = d ? [...d.querySelectorAll("ol li strong")].map(x => x.textContent) : [];
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

test("product dialog: the embroidery patch sits on the chest, not over the trousers", () => {
  assert.ok(pd.patchY > 0.25 && pd.patchY < 0.5, `patch centre y = ${pd.patchY}`);
  assert.ok(pd.patchX > 0.5 && pd.patchX < 0.8, `patch centre x = ${pd.patchX}`);
  assert.ok(pd.patchW <= 0.4, `patch width = ${pd.patchW}`);
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

test("product dialog: measuring guide sits in the right column as an in-place <details> as text plus a link to the size chart, without the image", () => {
  assert.equal(pd.guia, true);
  assert.equal(pd.guiaParent, true);
  assert.equal(pd.guiaSteps, N.medidas.length, "one instruction per measurement");
  assert.deepEqual(pd.guiaStrong, N.medidas.map(([t]) => t));
  assert.equal(pd.guiaImg, 0, "no <img> inside #pd-guia");
  assert.deepEqual(pd.guiaLink, [["index.html#guia-tallas", "_blank", "noopener", "Ver tabla de medidas"]]);
});

test("home shares the same product dialog: in-place embroidery and measuring guide, no exit to the designer", () => {
  const { html } = render();
  const dlg = html.slice(html.indexOf('<dialog class="pd"'), html.indexOf("</dialog>"));
  assert.match(dlg, /id="pd-guia"/);
  assert.match(dlg, /id="pd-bord-box"/);
  assert.doesNotMatch(dlg, /id="pd-pers"/);
});

// ---- Product dialog (#pd): embroidery patch follows the chest of each photo ----
const pechoProbe = `
  const wait = ms => new Promise(r => setTimeout(r, ms)), g = id => document.getElementById(id);
  const teclear = (id, v) => { const el = g(id); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
  const estado = () => { const p = g("pd-patch"), cs = getComputedStyle(p); return { src: g("pd-img").getAttribute("src"), px: p.style.getPropertyValue("--px"), py: p.style.getPropertyValue("--py"), pw: p.style.getPropertyValue("--pw"), display: cs.display }; };
  (async () => {
    const out = {};
    await wait(200);
    document.querySelector('.model[data-id="kaill"] .pic').click(); await wait(100);
    teclear("pd-name", "Dra. Ana Paz");
    out.kaill0 = estado();
    g("pd-thumbs").querySelectorAll("button")[1].click(); await wait(50);
    out.kaill1 = estado();
    g("pd-thumbs").querySelectorAll("button")[0].click(); await wait(50);
    out.kaillBack = estado();
    [...g("pd-colors").querySelectorAll("button")].find(b => b.title === "Rosa").click(); await wait(50);
    out.kaillRosa = estado();
    g("pd-close").click(); await wait(50);
    document.querySelector('.model[data-id="pantalon"] .pic').click(); await wait(100);
    teclear("pd-name", "Dra. Ana Paz");
    out.pantalon = estado(); out.pantalonCon = g("pd-main").classList.contains("con-bordado");
    g("pd-thumbs").querySelectorAll("button")[1].click(); await wait(50);
    out.pantalon1 = estado();
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe4">' + JSON.stringify(out) + '</pre>');
  })();
`;
const pecho = JSON.parse((render({ page: "catalogo.html", inject: pechoProbe }).html.match(/<pre id="probe4">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("chest map: the patch position comes from NEGOCIO.pecho and follows thumbnails and colour changes", () => {
  const [x, y] = N.pecho["img/disena/kaill.webp"], [x1, y1] = N.pecho["img/kaill-lila.webp"];
  assert.equal(pecho.kaill0.px, `${x}%`); assert.equal(pecho.kaill0.py, `${y}%`);
  assert.equal(pecho.kaill1.src, "img/kaill-lila.webp");
  assert.equal(pecho.kaill1.px, `${x1}%`); assert.equal(pecho.kaill1.py, `${y1}%`);
  assert.notEqual(pecho.kaill1.py, pecho.kaill0.py, "moves with the photo");
  assert.equal(pecho.kaillBack.py, `${y}%`);
  assert.match(pecho.kaillRosa.src, /img\/disena\/kaill-rosa\.webp/);
  assert.equal(pecho.kaillRosa.py, `${y}%`, "a recoloured design photo keeps the base framing");
});

test("chest map: a photo without a chest (trousers) hides the patch but keeps the embroidery fields", () => {
  assert.equal(pecho.pantalonCon, true, "name is still captured");
  assert.equal(pecho.pantalon.display, "none");
  assert.equal(pecho.pantalon1.display, "none");
});

test("chest map: every embroiderable gallery photo has an explicit entry", () => {
  assert.ok(N.pecho && typeof N.pecho === "object");
  const faltan = [];
  for (const m of N.modelos.filter(x => !x.accesorio)) {
    const srcs = new Set();
    if (N.disena[m.id]) srcs.add(`img/disena/${m.id}.webp`);
    Object.entries(m.fotos || {}).forEach(([c, f]) => { if (!(m.simulados || []).includes(c) && c !== N.disena[m.id]) srcs.add(f); });
    if (!srcs.size) srcs.add(m.foto);
    srcs.forEach(s => { if (/\.webp$/.test(s) && !(s in N.pecho)) faltan.push(s); });
  }
  assert.deepEqual(faltan, []);
  for (const [s, v] of Object.entries(N.pecho)) {
    assert.ok(v === null || (Array.isArray(v) && v.length >= 2 && v.slice(0, 2).every(n => n > 0 && n < 100)), s);
    assert.ok(existsSync(join(ROOT, s)), `file ${s}`);
  }
});

// ---- Product cards: the click opens the dialog, so the hover must say so (no magnifier cursor) ----
const cardProbe = `
  setTimeout(() => {
    const pics = [...document.querySelectorAll('.model .pic[role="button"]')];
    const out = pics.map(p => ({ cursor: getComputedStyle(p).cursor, chip: getComputedStyle(p, "::after").content }));
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe11">' + JSON.stringify(out) + '</pre>');
  }, 300);
`;
const cardOut = JSON.parse((render({ page: "catalogo.html", inject: cardProbe }).html.match(/<pre id="probe11">(\[[\s\S]*?\])<\/pre>/) || [, "[]"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("product cards: pointer cursor and a 'Ver detalle' chip on every card, no magnifier", () => {
  assert.ok(cardOut.length >= 10, "cards rendered");
  assert.ok(cardOut.every(c => c.cursor === "pointer"), JSON.stringify(cardOut[0]));
  assert.ok(cardOut.every(c => c.chip.includes("Ver detalle")), JSON.stringify(cardOut[0]));
});

test("product cards: hover and focus scale the photo and respect reduced motion; the dialog photo keeps its zoom cursor", () => {
  const css = readFileSync(join(ROOT, "css/estilos.css"), "utf8");
  assert.doesNotMatch(css, /\.model[^{]*\.pic[^{]*\{[^}]*zoom-in/);
  assert.match(css, /\.model \.pic\[role="button"\]:(hover|focus-visible)[^{]*img[^{]*\{[^}]*transform: scale\(/);
  assert.match(css, /prefers-reduced-motion: reduce\)[^{]*\{[^}]*\.model \.pic[^}]*transition: none/);
  assert.match(css, /\.pd-main \{[^}]*cursor: zoom-in/);
});

// ---- Product dialog: "Me mido en casa" shows the seven measurement fields in step 3 ----
const casaProbe = `
  const wait = ms => new Promise(r => setTimeout(r, ms)), g = id => document.getElementById(id);
  const teclear = (el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
  const wa = () => decodeURIComponent(g("pd-wa").getAttribute("href"));
  const campos = () => [...document.querySelectorAll("#pd-casa input")];
  const visibles = () => { const c = g("pd-casa"); return !c.hidden && c.getBoundingClientRect().height > 0; };
  const guiaVisible = () => g("pd-guia").getBoundingClientRect().height > 0;
  const modo = id => [...g("pd-medidas").querySelectorAll("button")].find(b => b.dataset.v === id).click();
  (async () => {
    const out = {};
    await wait(200);
    document.querySelector('.model[data-id="kaill"] .pic').click(); await wait(100);
    document.getElementById("pd-pb-3").click();
    out.antes = visibles(); out.guiaAntes = guiaVisible();
    modo("taller"); out.taller = visibles(); out.guiaTaller = guiaVisible();
    modo("casa"); out.casa = visibles(); out.guiaCasa = guiaVisible();
    out.guiaArriba = !!(g("pd-guia").compareDocumentPosition(g("pd-casa")) & Node.DOCUMENT_POSITION_FOLLOWING);
    out.guiaLink = g("pd-guia").querySelector("a").getAttribute("href");
    out.wa50 = wa();
    const cs = campos();
    out.n = cs.length; out.ph = cs.map(c => c.placeholder); out.attrs = cs.map(c => [c.type, c.inputMode, c.min, c.max, c.step, c.dataset.m]);
    out.labels = cs.map(c => c.parentElement.querySelector("strong").textContent);
    out.res0 = g("pd-pb-3").textContent.replace(/\\s+/g, " ").trim();
    const nodo = cs[0]; nodo.focus(); teclear(nodo, "92"); teclear(cs[4], "101.5");
    out.mismoNodo = campos()[0] === nodo; out.foco = document.activeElement === nodo;
    out.res2 = g("pd-pb-3").textContent.replace(/\\s+/g, " ").trim();
    out.wa = wa();
    modo("domicilio"); out.dom = visibles(); out.guiaDom = guiaVisible(); out.waDom = wa();
    modo("casa"); out.valorConservado = campos()[0].value;
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe12">' + JSON.stringify(out) + '</pre>');
  })();
`;
const casa = JSON.parse((render({ page: "catalogo.html", inject: casaProbe }).html.match(/<pre id="probe12">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("product dialog casa: the seven measurement fields appear only when 'Me mido en casa' is chosen", () => {
  assert.equal(casa.antes, false); assert.equal(casa.taller, false); assert.equal(casa.dom, false);
  assert.equal(casa.casa, true);
  assert.equal(casa.n, N.medidas.length);
  assert.deepEqual(casa.labels, N.medidas.map(([t]) => `${t} (cm)`));
  assert.ok(casa.ph.every(p => p === "0 cm"));
  assert.ok(casa.attrs.every(a => a[0] === "number" && a[1] === "decimal" && a[2] === "20" && a[3] === "250" && a[4] === "0.5"));
  assert.deepEqual(casa.attrs.map(a => a[5]), N.medidas.map(([t]) => t));
});

test("product dialog casa: typed values go into the WhatsApp message, the summary counts them and typing keeps focus", () => {
  assert.match(casa.res0, /Me mido en casa · 0\/7 medidas · 1 uniforme/);
  assert.match(casa.res2, /Me mido en casa · 2\/7 medidas · 1 uniforme/);
  assert.equal(casa.mismoNodo, true, "inputs are not rebuilt");
  assert.equal(casa.foco, true);
  assert.match(casa.wa, /Mis medidas:/);
  assert.ok(casa.wa.includes(`${N.medidas[0][0]}: 92 cm`) && casa.wa.includes(`${N.medidas[4][0]}: 101.5 cm`), casa.wa);
  assert.ok(!casa.wa.includes(`${N.medidas[1][0]}:`), "only filled fields");
  assert.doesNotMatch(casa.waDom, /Mis medidas:/);
  assert.equal(casa.valorConservado, "92");
});

test("product dialog: the measuring guide shows only for 'Me mido en casa' and sits above the fields", () => {
  assert.equal(casa.guiaAntes, false); assert.equal(casa.guiaTaller, false); assert.equal(casa.guiaDom, false);
  assert.equal(casa.guiaCasa, true);
  assert.equal(casa.guiaArriba, true);
  assert.match(casa.guiaLink, /#guia-tallas$/);
});

test("product dialog: the WhatsApp order states the 50% deposit and that the final price is confirmed when measuring", () => {
  assert.match(casa.wa50, /abono/i);
  assert.match(casa.wa50, /50%/);
  assert.match(casa.wa50, /precio final/i);
});
