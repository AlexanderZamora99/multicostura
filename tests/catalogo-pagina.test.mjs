import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, count } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const cat = render({ page: "catalogo.html" });
const catDom = strip(cat.html);
const home = strip(render().html);
const total = Number(render({ page: "catalogo.html", inject: 'document.body.setAttribute("data-total", NEGOCIO.modelos.length)' }).html.match(/data-total="(\d+)"/)[1]);
const nModelos = h => count(strip(h), '<article class="model"');

test("catalogo.html has one H1, a catalog title and its own meta tags", () => {
  assert.equal(count(catDom, "<h1"), 1);
  assert.match(catDom, /<h1[^>]*>Catálogo de uniformes médicos<\/h1>/);
  assert.match(catDom, /<title>Catálogo[^<]*Multicostura[^<]*<\/title>/);
  assert.match(catDom, /<meta name="description" content="[^"]{40,}">/);
  assert.match(catDom, /<meta property="og:title" content="Catálogo/);
  assert.match(catDom, /<meta property="og:description" content="[^"]+">/);
});

test("catalogo.html renders the sidebar, the stock banner and every model", () => {
  assert.ok(catDom.includes('id="modelos"') && catDom.includes('id="filtros"') && catDom.includes('id="stock-btn"'));
  assert.equal(nModelos(cat.html), total);
  assert.doesNotMatch(cat.stderr, /Uncaught/);
});

test("catalogo.html lead lists the delivery times from NEGOCIO.tipos", () => {
  const dias = render({ page: "catalogo.html", inject: 'document.body.setAttribute("data-dias", NEGOCIO.tipos.map(t => t.dias).join("|"))' }).html.match(/data-dias="([^"]+)"/)[1].split("|");
  const lead = catDom.slice(catDom.indexOf("<h1"), catDom.indexOf('id="stock"'));
  for (const d of dias) assert.ok(lead.includes(d), `lead should mention ${d}`);
});

test("?cat=<collection> preselects its category and reduces the count", () => {
  const r = render({ page: "catalogo.html", query: "?cat=Uniformes" });
  const n = nModelos(r.html);
  assert.ok(n > 0 && n < total, `${n} of ${total}`);
  assert.match(strip(r.html), /<input type="radio" name="cat" value="Conjuntos" checked(="")?>/);
  const g = strip(render({ page: "catalogo.html", query: "?cat=Gorros%20y%20medias" }).html);
  assert.equal(count(g, '<article class="model"'), 2);
  assert.match(g, /name="cat" value="Gorros y medias" checked/);
});

test("?cat=<category> works and an unknown value falls back to all", () => {
  assert.match(strip(render({ page: "catalogo.html", query: "?cat=L%C3%ADnea%20blancos" }).html), /name="cat" value="Línea blancos" checked/);
  assert.equal(nModelos(render({ page: "catalogo.html", query: "?cat=xyz" }).html), total);
});

test("?talla=M preselects the size chip", () => {
  assert.match(strip(render({ page: "catalogo.html", query: "?talla=M" }).html), /data-talla="M" aria-pressed="true"/);
});

test("quick view opens from a card on the catalog page", () => {
  const h = strip(render({ page: "catalogo.html", inject: 'document.querySelector("#models .model .qv").click();' }).html);
  assert.match(h, /<dialog id="qv"[^>]*open/);
  assert.ok(h.includes('id="qv-wa"'));
});

test("there is no Profesión filter: the profile tiles were purchase modes, already the Forma de compra filter", () => {
  assert.doesNotMatch(catDom, /<legend>Profesión/);
  assert.ok(catDom.includes("<legend>Forma de compra</legend>"));
});

test("catalogo.html shares header and footer links with the home and links back to it", () => {
  for (const id of ["personaliza", "medidas", "agenda", "empresas", "regalo"]) assert.ok(catDom.includes(`href="index.html#${id}"`), id);
  assert.ok(catDom.includes('href="catalogo.html"'));
  assert.match(catDom, /<footer class="site">/);
});

test("home no longer has the catalog, collections or profile sections", () => {
  for (const id of ["modelos", "colecciones", "perfiles", "models", "filtros"]) assert.ok(!home.includes(`id="${id}"`), `home still has #${id}`);
  assert.ok(home.includes('id="reco"') && home.includes('id="qv"'));
});

test("home links to catalogo.html from the recommended section and nothing points to #modelos", () => {
  const reco = home.slice(home.indexOf('id="reco"'), home.indexOf('id="look"'));
  assert.match(reco, /<a class="btn btn-dark" id="reco-all" href="catalogo.html">Ver todo el catálogo<\/a>/);
  assert.equal(count(reco, '<article class="model"'), 8);
  for (const f of ["index.html", "js/app.js", "js/datos.js"]) assert.ok(!readFileSync(f, "utf8").includes("#modelos"), `${f} still has #modelos`);
});

test("size calculator CTA goes to the catalog", () => {
  assert.match(home, /id="r-cta"[^>]*href="catalogo.html"/);
});
