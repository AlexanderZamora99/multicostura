import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = source.slice(source.indexOf("<style>"), source.indexOf("</style>"));
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");

// ---- C1: reference type and tokens (worktastic.co "Minimalista": Open Sans, bold uppercase titles, near-black buttons) ----
const probe = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), set = (k, v) => b.setAttribute("data-" + k, v);
  set("body-font", cs(document.body).fontFamily);
  const h2 = document.querySelector("section h2");
  set("h2-font", cs(h2).fontFamily); set("h2-tt", cs(h2).textTransform); set("h2-fw", cs(h2).fontWeight); set("h2-ls", cs(h2).letterSpacing);
  const mk = cls => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = "x"; document.querySelector("main").appendChild(a); return cs(a); };
  const d = mk("btn-dark"), m = mk("btn-mag");
  set("dark-bg", d.backgroundColor); set("dark-r", d.borderRadius); set("mag-bg", m.backgroundColor); set("mag-r", m.borderRadius);
  set("input-r", cs(document.getElementById("f-name")).borderRadius);
})();
`;
const { html: probed } = render({ inject: probe });
const a = k => probed.match(new RegExp(`data-${k}="([^"]*)"`))[1];

test("Open Sans is the only family: loaded in 400/600/700 and used by body and headings", () => {
  assert.match(source, /fonts\.googleapis\.com\/css2\?family=Open\+Sans:wght@400;600;700/);
  assert.doesNotMatch(source, /Jost|Figtree/);
  assert.match(a("body-font"), /Open Sans/);
  assert.match(a("h2-font"), /Open Sans/);
});

test("section titles are bold uppercase with modest tracking", () => {
  assert.equal(a("h2-tt"), "uppercase");
  assert.ok(Number(a("h2-fw")) >= 700);
  const ls = parseFloat(a("h2-ls"));
  assert.ok(ls > 0 && ls <= 3, `letter-spacing ${a("h2-ls")}`);
});

test("every section head has one plain sentence under its title", () => {
  const heads = strip(render().html).match(/<div class="sec-head">[\s\S]*?<\/div>/g);
  assert.ok(heads.length >= 8);
  for (const h of heads) assert.match(h, /<p class="lead"/, h.slice(0, 80));
});

test("primary buttons are near-black, fuchsia stays for the main action, corners are 4px", () => {
  assert.equal(a("dark-bg"), "rgb(40, 40, 40)");
  assert.equal(a("mag-bg"), "rgb(214, 36, 127)");
  assert.equal(a("dark-r"), "4px");
  assert.equal(a("mag-r"), "4px");
  assert.equal(a("input-r"), "4px");
  assert.match(css, /\/\*[^*]*Fuchsia[^*]*main action[^*]*\*\//i, "the fuchsia rule is documented in a CSS comment");
});

test("decorative devices are gone: dashed borders and pink washes", () => {
  assert.doesNotMatch(css, /dashed/);
  assert.doesNotMatch(css, /#fdf2f7|#f3cfe0|#e7a9c7/);
});

// ---- C2: store header and first viewport ----
const count = (h, f) => h.split(f).length - 1;
const PIX = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E";
const barOf = h => h.slice(h.indexOf('id="ann"'), h.indexOf("</header>"));

const probe2 = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), r = el => el.getBoundingClientRect(), set = (k, v) => b.setAttribute("data-" + k, v);
  const track = document.querySelector("#ann .ann-track");
  set("m-anim", cs(track).animationName); set("m-state", cs(track).animationPlayState); set("m-bg", cs(document.getElementById("ann")).backgroundColor);
  document.getElementById("ann-pp").click();
  set("m-state-paused", cs(track).animationPlayState);
  const ul = document.getElementById("nav-list"), logo = document.querySelector("header .logo"), act = document.querySelector(".nav-actions");
  set("h-logo-l", r(logo).left); set("h-ul-c", (r(ul).left + r(ul).right) / 2); set("h-act-r", r(act).right); set("h-vw", innerWidth);
  set("h-bg", cs(document.querySelector("header")).backgroundColor); set("h-blur", cs(document.querySelector("header")).backdropFilter);
})();
`;
const p2 = render({ inject: probe2 }).html;
const b = k => p2.match(new RegExp(`data-${k}="([^"]*)"`))[1];

test("announcement bar is a black marquee: an icon per message, looped copy hidden from assistive tech", () => {
  const html = strip(render({ inject: 'NEGOCIO.anuncios = ["Uno", "Dos"]; renderAnuncios();' }).html);
  const bar = barOf(html);
  assert.match(bar, /class="ann-track"/);
  const runs = bar.match(/<div class="ann-run"[^>]*>[\s\S]*?<\/div>/g);
  assert.equal(runs.length, 2, "a real run and a looped copy");
  assert.doesNotMatch(runs[0].match(/^<div[^>]*>/)[0], /aria-hidden/);
  assert.match(runs[1].match(/^<div[^>]*>/)[0], /aria-hidden="true"/);
  assert.equal(count(runs[0], 'class="ann-item"'), 2);
  assert.equal(count(runs[0], "<svg"), 2, "one line icon per message");
  assert.ok(runs[0].includes("Uno") && runs[0].includes("Dos"));
  assert.equal(b("m-bg"), "rgb(0, 0, 0)");
});

test("the marquee scrolls, pauses with the pause button, and is static under reduced motion", () => {
  assert.notEqual(b("m-anim"), "none");
  assert.equal(b("m-state"), "running");
  assert.equal(b("m-state-paused"), "paused");
  assert.match(css, /\.ann:hover \.ann-track[^{]*\{[^}]*animation-play-state:\s*paused/);
  assert.match(css, /\.ann:focus-within[^{]*\.ann-track/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ann-track\s*\{[^}]*animation:\s*none/);
});

test("header: logo left, nav centered, WhatsApp and Agendar medidas right, solid white", () => {
  assert.ok(Number(b("h-logo-l")) < 200);
  assert.ok(Math.abs(Number(b("h-ul-c")) - Number(b("h-vw")) / 2) <= 60, `nav centre ${b("h-ul-c")}`);
  assert.ok(Number(b("h-act-r")) > Number(b("h-vw")) - 220);
  assert.equal(b("h-bg"), "rgb(255, 255, 255)");
  assert.equal(b("h-blur"), "none");
});

test("a slide with img is image-only: picture inside one link, alt from titulo, no headline or button", () => {
  const html = strip(render({ inject: `NEGOCIO.portada = [
    { img: "${PIX}", imgMovil: "https://example.invalid/m.jpg", titulo: "Campaña de octubre", texto: "no se muestra", cta: "Ver", href: "#modelos" },
    { titulo: "Solo texto", texto: "Una línea", cta: "Ir", href: "#agenda" }]; renderPortada();` }).html);
  const s = html.slice(html.indexOf('id="banner-track"'), html.indexOf("</section>", html.indexOf('id="banner-track"')));
  const slides = s.split(/<div class="slide(?: [\w-]+)*"/).slice(1);
  assert.equal(slides.length, 2);
  assert.match(slides[0], /<a class="slide-link" href="#modelos"[^>]*><picture>/);
  assert.match(slides[0], /<source media="\(max-width: 760px\)" srcset="https:\/\/example\.invalid\/m\.jpg"/);
  assert.match(slides[0], /<img[^>]*alt="Campaña de octubre"/);
  assert.doesNotMatch(slides[0], /slide-title|slide-text|btn/);
  assert.match(slides[1], /class="slide-title">Solo texto/);
  assert.match(slides[1], /<a class="btn btn-mag" href="#agenda">Ir<\/a>/);
});

// ---- C3: product cards, quick view and the recommended grid ----
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };
const dom = strip(render().html);
const cardOf = (d, nombre) => (d.split('<article class="model"').slice(1).find(c => c.includes(`<b>${nombre}</b>`)) || "");

const probe3 = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), r = el => el.getBoundingClientRect(), set = (k, v) => b.setAttribute("data-" + k, v);
  const card = [...document.querySelectorAll("#models .model")].find(c => c.textContent.includes("Kaill"));
  set("pic-ar", cs(card.querySelector(".pic")).aspectRatio);
  set("reco-cols", cs(document.getElementById("recomendados")).gridTemplateColumns.split(" ").length);
  set("reco-n", document.querySelectorAll("#recomendados .model").length);
  set("reco-h2-b", r(document.querySelector("#reco h2")).bottom);
  set("reco-card-t", r(document.querySelector("#recomendados .model")).top);
  const btn = card.querySelector(".qv"); btn.focus(); btn.click();
  const dlg = document.getElementById("qv");
  set("qv-open", dlg.open); set("qv-role", dlg.getAttribute("role")); set("qv-modal", dlg.getAttribute("aria-modal"));
  set("qv-wa", dlg.querySelector("#qv-wa").href);
  set("qv-text", dlg.textContent.replace(/\\s+/g, " "));
  set("qv-pers", !!dlg.querySelector("#qv-pers"));
  set("qv-modes", dlg.querySelectorAll(".qv-tipo").length);
  dlg.querySelectorAll(".qv-tipo")[1].click();
  dlg.querySelector("#qv-colors button:nth-child(2)").click();
  set("qv-wa2", decodeURIComponent(dlg.querySelector("#qv-wa").href));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  set("qv-open-esc", dlg.open); set("qv-focus", document.activeElement === btn);
  btn.click(); dlg.querySelectorAll(".qv-tipo")[1].click(); dlg.querySelector("#qv-colors button:nth-child(2)").click(); dlg.querySelector("#qv-pers").click();
  set("pers-model", document.getElementById("s-model").value);
  set("pers-tipo", document.querySelector("#s-tipo button.on").textContent);
  set("pers-color", document.getElementById("s-color-name").textContent);
  set("pers-closed", !dlg.open);
})();
`;
const p3 = render({ inject: probe3 }).html;
const c = k => p3.match(new RegExp(`data-${k}="([^"]*)"`))[1];

test("product card: 4:5 media, name, price range, color names and a Vista rápida button", () => {
  assert.equal(c("pic-ar"), "4 / 5");
  const kaill = cardOf(dom, "Kaill");
  assert.match(kaill, /class="price">\$159\.000 - \$185\.000</);
  assert.match(kaill, /<p class="cols">Rosa, Lila, Azul cielo \+10<\/p>/);
  assert.match(kaill, /<button[^>]*class="qv"[^>]*>Vista rápida<\/button>/);
  assert.match(cardOf(dom, "Alondra blanco"), /<p class="cols">Blanco<\/p>/);
  assert.match(cardOf(dom, "Pantalón"), /class="price">\$90\.000</, "fixed-price items show one price");
  assert.match(cardOf(dom, "Gorro quirúrgico"), /class="price ask">Consultar</);
  const articles = dom.split('<article class="model"').length - 1;
  assert.equal(count(dom, 'class="qv"'), articles, "every card has its quick view");
  assert.ok(count(kaill, 'data-color="') >= 3, "swatch dots stay beside the color names");
});

test("a second photo swaps in on hover when the model has foto2", () => {
  const html = strip(render({ inject: `NEGOCIO.modelos.find(m => m.id === "kaill").foto2 = "${PIX}"; renderModels(); renderRecomendados();` }).html);
  assert.match(cardOf(html, "Kaill"), /<img class="swap" src="data:image/);
  assert.match(css, /\.pic:hover \.swap/);
});

test("quick view is a modal dialog with the buying modes, colors, WhatsApp and Personalizar", () => {
  assert.equal(c("qv-open"), "true");
  assert.equal(c("qv-role"), "dialog");
  assert.equal(c("qv-modal"), "true");
  assert.equal(c("qv-modes"), "3");
  const t = c("qv-text");
  for (const x of ["Kaill", "Precio tienda", "$159.000", "Entrega inmediata", "$175.000", "3 a 5 días hábiles", "$185.000", "5 a 8 días hábiles", "Pedir por WhatsApp", "Personalizar"]) assert.ok(t.includes(x), x);
  assert.match(c("qv-wa"), /^https:\/\/wa\.me\/573217830050\?text=.*Kaill/);
  assert.equal(c("qv-pers"), "true");
});

test("quick view WhatsApp message follows the chosen mode and color; Escape closes it and returns focus", () => {
  const msg = c("qv-wa2");
  assert.match(msg, /Kaill \(diseño bajo pedido\), color lila/);
  assert.ok(msg.includes("$175.000") && msg.includes("3 a 5 días hábiles"));
  assert.equal(c("qv-open-esc"), "false");
  assert.equal(c("qv-focus"), "true");
});

test("Personalizar jumps to the designer with the model, mode and color preselected", () => {
  assert.equal(c("pers-model"), "kaill");
  assert.equal(c("pers-tipo"), "Diseño bajo pedido");
  assert.equal(c("pers-color"), "Lila");
  assert.equal(c("pers-closed"), "true");
});

test("NUESTROS RECOMENDADOS is a grid of 8 cards that shows even with no photos, then Ver todo el catálogo", () => {
  assert.doesNotMatch(dom.match(/<section[^>]*id="reco"[^>]*>/)[0], /hidden/);
  assert.equal(c("reco-n"), "8");
  assert.equal(c("reco-cols"), "4");
  const reco = section(dom, "reco");
  assert.ok(reco.includes('href="#scrub"'), "calm silhouette fallback while photos are missing");
  assert.match(reco, /<a class="btn btn-dark" id="reco-all" href="#modelos">Ver todo el catálogo<\/a>/);
  const phone = render({ width: 390, height: 900, inject: 'document.body.setAttribute("data-rc", getComputedStyle(document.getElementById("recomendados")).gridTemplateColumns.split(" ").length);' }).html;
  assert.equal(phone.match(/data-rc="(\d+)"/)[1], "2");
});

test("first viewport on desktop reaches the top of NUESTROS RECOMENDADOS", () => {
  assert.ok(Number(c("reco-h2-b")) < 900, `title bottom at ${c("reco-h2-b")}`);
  assert.ok(Number(c("reco-card-t")) < 900, `first card top at ${c("reco-card-t")}`);
});
