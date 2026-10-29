import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count, source as pageSource, estilos } from "./render.mjs";

const source = pageSource();
const css = estilos();
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };
const tag = (d, id) => d.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))[0];
const PIX = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E";
// Simula que ningún modelo tiene foto (img/ ya trae las fotos reales del catálogo)
const NOFOTOS = `NEGOCIO.modelos.forEach(m => { m.foto = "img/no-existe.webp"; delete m.fotos; });`;

// changed: recommended is the canon store section, so it shows with the calm silhouette while no product photo exists
// changed: 4 cards (not 8) while no photo exists; the full 8 need a loaded photo
test("recommended grid shows with the silhouette fallback while no product photo exists", () => {
  const sin = strip(render({ inject: `${NOFOTOS} renderRecomendados();` }).html);
  assert.doesNotMatch(tag(sin, "reco"), /\bhidden\b/);
  assert.equal(count(section(sin, "reco"), '<article class="model"'), 4);
  assert.doesNotMatch(section(sin, "reco"), /<img src="img\//);
});

// changed: cards no longer wait for their photo; a photo that loads replaces the silhouette on that card only
test("recommended cards use the photo that loaded and keep the silhouette for the rest", () => {
  const html = strip(render({ inject: `${NOFOTOS} NEGOCIO.modelos.find(m => m.id === "kaill").foto = "${PIX}"; renderRecomendados();` }).html);
  const s = section(html, "reco");
  assert.equal(count(s, '<article class="model"'), 8);
  assert.match(s.split('<article class="model"')[1], /<img src="data:image/);
  assert.doesNotMatch(s.split('<article class="model"')[2], /<img src="/);
});

test("photo grid renders only tiles whose photo loaded and hides itself when none did", () => {
  const some = strip(render({ inject: `NEGOCIO.clientas = [{ foto: "${PIX}", texto: "Odontóloga" }, { foto: "img/no-existe.jpg", texto: "Médica" }]; renderClientas();` }).html);
  const s = section(some, "clientas");
  assert.equal(count(s, "<figure"), 1);
  assert.ok(s.includes("Odontóloga") && !s.includes("Médica"));
  assert.doesNotMatch(tag(some, "clientas"), /\bhidden\b/);
  const none = strip(render({ inject: `NEGOCIO.clientas = [{ foto: "img/no-existe.jpg", texto: "Médica" }]; renderClientas();` }).html);
  assert.match(tag(none, "clientas"), /class="[^"]*\bhidden\b/);
  assert.equal(count(section(none, "clientas"), "<figure"), 0);
});

test("testimonials stay hidden while every entry is an example and real ones show up on their own", () => {
  const ej = strip(render({ inject: 'NEGOCIO.testimonios = [{ nombre: "X", oficio: "Y", texto: "Texto de ejemplo", ejemplo: true }]; renderTestimonios();' }).html);
  assert.match(tag(ej, "testimonios"), /class="[^"]*\bhidden\b/);
  assert.doesNotMatch(ej.replace(/<script[\s\S]*?<\/script>/g, ""), /Texto de ejemplo<\/p>/);
  const html = strip(render({ inject: 'NEGOCIO.testimonios = [{ nombre: "Z", oficio: "Y", texto: "Texto de ejemplo", ejemplo: true }, { nombre: "Ana", oficio: "Odontóloga", texto: "Me quedó perfecto" }]; renderTestimonios();' }).html);
  assert.doesNotMatch(tag(html, "testimonios"), /\bhidden\b/);
  const s = section(html, "testimonios");
  assert.equal(count(s, 'class="quote-card"'), 1, "examples are never shown beside real ones");
  assert.ok(s.includes("Me quedó perfecto"));
});

test("stock photos with third-party logos, embroidered names or brands are gone", () => {
  for (const id of ["1594824476967-48c8b964273f", "1761234852472-85aeea9c3eac", "1770134223774-13b735e29201", "1736289189363-4af449f7e6fc", "1666887360921-85952a86894f"]) {
    assert.ok(!source.includes(id), `still uses ${id}`);
  }
});

test("a banner slide without a photo keeps a calm text-only layout", () => {
  // changed: slides are single-column now (image-only or text-only), so the text layout is the grey ground plus the copy block
  assert.match(css, /\.slide\s*\{[^}]*background:\s*var\(--bg-2\)/);
  assert.match(css, /\.slide-copy\s*\{[^}]*align-items:\s*flex-start/);
  const html = strip(render({ inject: 'document.querySelectorAll("#banner img").forEach(i => i.dispatchEvent(new Event("error")));' }).html);
  assert.match(section(html, "banner"), /class="slide is-active no-photo"|class="slide no-photo is-active"/);
});

// changed: section titles are now bold uppercase (reference store canon); the designer's field labels stay sentence case
test("designer labels are sentence case, not tracked capitals", () => {
  assert.doesNotMatch(css, /\.(field|lbl|opts)[^{]*\{[^}]*text-transform/);
  assert.doesNotMatch(css, /\.field[^{]*\{[^}]*letter-spacing/);
  const s = section(dom, "personaliza");
  assert.match(s, /class="lbl"[^>]*>Modelo</);
  assert.match(s, />Nombre bordado </);
});

// changed: product media is the canon 4:5 frame now (it was a short 5:4 crop while photos were missing); two columns on phones stay
test("catalog media is 4:5 and the grid has two columns on phones", () => {
  assert.match(css, /\.pic\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/);
  const probe = `const g = document.getElementById("models"); const p = g.querySelector(".pic"); document.body.setAttribute("data-cols", getComputedStyle(g).gridTemplateColumns.split(" ").length); document.body.setAttribute("data-pich", Math.round(p.getBoundingClientRect().height)); document.body.setAttribute("data-picw", Math.round(p.getBoundingClientRect().width));`;
  const h = render({ page: "catalogo.html", width: 500, height: 900, inject: probe }).html;
  assert.equal(h.match(/data-cols="(\d+)"/)[1], "2");
  const w = Number(h.match(/data-picw="(\d+)"/)[1]), ph = Number(h.match(/data-pich="(\d+)"/)[1]);
  assert.ok(Math.abs(ph - w * 1.25) <= 2, `media ${w}x${ph} is 4:5`);
});

test("how it works is a calm numbered sequence, not bordered cards", () => {
  assert.match(dom, /<ol class="steps-row" id="process">/);
  assert.equal(count(section(dom, "proceso"), "<li>"), 4);
  assert.doesNotMatch(css, /\.steps-row div/);
  assert.match(css, /\.steps-row li::after/);
});

test("Tuluá appears only where it informs: title, about, address, home-visit coverage", () => {
  const head = dom.slice(0, dom.indexOf("<body"));
  assert.ok(head.includes("Tuluá"));
  for (const id of ["banner"]) // changed: "Taller propio en Tuluá" is a trust fact the client asked for, so the trust block may name the city
   assert.ok(!section(dom, id).includes("Tuluá"), id);
  const foot = dom.slice(dom.indexOf("<footer"), dom.indexOf("</footer>"));
  assert.ok(!foot.replace(/Calle 24 T10-39[^<]*/g, "").includes("Tuluá"), "footer text and copyright");
  assert.ok(section(dom, "nosotros").includes("Tuluá"));
});

test("with a product photo the embroidered name and profession show on a patch over the photo", () => {
  const inject = `const n = document.getElementById("s-name"), r = document.getElementById("s-role");
    document.getElementById("s-model").value = "kaill"; design.color = "Rojo"; design.hilo = "Dorado";
    n.value = "Dra. Camila Ruiz"; n.dispatchEvent(new Event("input")); r.value = "Odontóloga"; r.dispatchEvent(new Event("input"));
    document.getElementById("pv-box").classList.add("has-photo"); // la foto cargó (headless no espera la descarga)
    const b = document.getElementById("pv-bord");
    document.body.setAttribute("data-bord", getComputedStyle(b).display + "|" + b.style.getPropertyValue("--tela") + "|" + b.style.getPropertyValue("--hilo"));`;
  const html = render({ inject }).html;
  assert.match(html, /id="pv-bn"[^>]*>Dra\. Camila Ruiz</);
  assert.match(html, /id="pv-br"[^>]*>Odontóloga</);
  assert.equal(html.match(/data-bord="([^"]*)"/)[1], "block|#d22b3a|#d4a64a", "patch visible in the fabric and thread colors");
  assert.match(html, /id="pv-photo"[^>]*alt="Kaill en color rojo, con el bordado Dra\. Camila Ruiz, Odontóloga"|alt="Kaill en color rojo, con el bordado Dra\. Camila Ruiz, Odontóloga"[^>]*id="pv-photo"/);
});

test("no-photo state runs without uncaught errors", () => {
  assert.doesNotMatch(render().stderr, /Uncaught/);
});
