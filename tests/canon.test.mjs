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
