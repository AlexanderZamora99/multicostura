import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const css = source.slice(source.indexOf("<style>"), source.indexOf("</style>"));
const dom = strip(render().html);

// ---- browser-side probe: contrast, labels, targets, headings ----
const probe = `
(() => {
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const rgb = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > .9) return c.c; } return [255, 255, 255]; };
  const out = {};
  const textRatio = sel => { let min = 99, n = 0; document.querySelectorAll(sel).forEach(el => { if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return; const c = rgb(getComputedStyle(el).color); if (!c) return; n++; min = Math.min(min, ratio(c.c, bgOf(el))); }); return n ? min : 99; };
  out.labels = textRatio(".field .lbl, .field > label, .agenda label, .box label");
  out.helper = textRatio(".mhint, .lead, .empty, .lock-msg, .model .info p, .cat-name, .demo-note");
  out.lockedMsg = textRatio("#st-day .lock-msg");
  const border = sel => { let min = 99; document.querySelectorAll(sel).forEach(el => { const cs = getComputedStyle(el); const c = rgb(cs.borderTopColor); if (c && parseFloat(cs.borderTopWidth) > 0) min = Math.min(min, ratio(c.c, bgOf(el.parentElement))); }); return min; };
  out.inputBorder = border(".panel input, .panel select, .agenda input, .agenda textarea, .box input[type=text], .chat-form input");
  out.chipBorder = border(".opts button, .profs button, .mode, .qty button, .amounts button");
  const ph = document.querySelector("#f-name"); out.placeholder = ratio(rgb(getComputedStyle(ph, "::placeholder").color).c, bgOf(ph));
  const unl = []; document.querySelectorAll("input,select,textarea").forEach(el => { if (el.type === "hidden") return; if (!(el.labels && el.labels.length) && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) unl.push(el.id || el.name || el.tagName); });
  out.unlabeled = unl.join(",");
  const small = []; document.querySelectorAll("button,a[href],input:not([type=hidden]),select,textarea").forEach(el => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return; if (el.closest("p, .about-text") && el.tagName === "A") return; if (Math.min(r.width, r.height) < 24) small.push((el.id || el.className || el.tagName) + ":" + Math.round(r.width) + "x" + Math.round(r.height)); });
  out.small = small.join("|");
  const hs = [...document.querySelectorAll("h1,h2,h3,h4")].map(h => +h.tagName[1]); out.h1 = hs.filter(x => x === 1).length;
  out.skip = hs.some((h, i) => i && h > hs[i - 1] + 1) ? "skip" : "ok";
  const d = document.body; Object.entries(out).forEach(([k, v]) => d.setAttribute("data-a-" + k, v));
})();
`;
const { html: probed } = render({ width: 1366, height: 900, inject: probe });
const a = k => probed.match(new RegExp(`data-a-${k.toLowerCase()}="([^"]*)"`))[1];

test("field labels and helper text have at least 4.5:1 contrast", () => {
  assert.ok(Number(a("labels")) >= 4.5, `labels ${a("labels")}`);
  assert.ok(Number(a("helper")) >= 4.5, `helper ${a("helper")}`);
  assert.ok(Number(a("placeholder")) >= 4.5, `placeholder ${a("placeholder")}`);
});

test("input and chip borders have at least 3:1 contrast", () => {
  assert.ok(Number(a("inputBorder")) >= 3, `inputs ${a("inputBorder")}`);
  assert.ok(Number(a("chipBorder")) >= 3, `chips ${a("chipBorder")}`);
});

test("every input, select and textarea has a programmatic label", () => {
  assert.equal(a("unlabeled"), "");
});

test("interactive targets are at least 24x24px", () => {
  assert.equal(a("small"), "");
});

test("one h1 and no skipped heading levels", () => {
  assert.equal(a("h1"), "1");
  assert.equal(a("skip"), "ok");
});

test("page has lang, a skip link, main landmark and a named navigation", () => {
  assert.match(dom, /<html lang="es"/);
  assert.match(dom, /<a class="skip" href="#contenido"/);
  assert.match(dom, /<main id="contenido"/);
  assert.match(dom, /<nav aria-label="Principal"/);
});

test("every image has an alt attribute and product photos describe the garment", () => {
  const imgs = [...dom.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  assert.ok(imgs.length > 3);
  for (const i of imgs) assert.match(i, /\balt="/, i);
  const withPhoto = strip(render({ inject: 'const k = NEGOCIO.modelos.find(m => m.id === "kaill"); delete k.fotos; k.foto = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E"; renderModels();' }).html);
  assert.match(withPhoto, /<img src="data:image[^>]*alt="Uniforme Kaill, color Azul rey"/);
});

test("banner has a visible pause button that toggles autoplay", () => {
  assert.match(dom, /id="banner-pp"[^>]*aria-label="Pausar carrusel"/);
  const html = strip(render({ inject: 'document.getElementById("banner-pp").click();' }).html);
  assert.match(html, /id="banner-pp"[^>]*aria-label="Reanudar carrusel"/);
});

test("carousels expose region, roledescription and labelled slides", () => {
  assert.match(dom, /id="banner"[^>]*aria-roledescription="carrusel"/);
  assert.match(dom, /id="recomendados"[^>]*role="list"[^>]*aria-label=/); // changed: recommended is a labelled list now, not a carousel
  // changed: when every testimonial fits there is no carousel, so the rail drops the roledescription and its arrows
  assert.match(dom, /class="rail fits"[^>]*id="testi"[^>]*role="region"[^>]*aria-label=/);
  assert.doesNotMatch(dom.match(/<div class="rail[^>]*id="testi"[^>]*>/)[0], /aria-roledescription/);
  assert.match(dom, /id="testi-next"[^>]*hidden/);
  const muchos = render({ inject: 'NEGOCIO.testimonios = Array.from({ length: 6 }, (_, i) => ({ nombre: "N" + i, oficio: "O", texto: "Texto " + i })); renderTestimonios();' }).html;
  assert.match(muchos, /class="rail"[^>]*id="testi"[^>]*aria-roledescription="carrusel"/);
});

test("FAQ accordion uses buttons with aria-expanded and aria-controls", () => {
  const faq = dom.slice(dom.indexOf('id="faq-list"'), dom.indexOf("</section>", dom.indexOf('id="faq-list"')));
  const btns = faq.match(/<button[^>]*class="faq-q"[^>]*>/g);
  assert.ok(btns.length >= 5);
  for (const b of btns) { assert.match(b, /aria-expanded="false"/); assert.match(b, /aria-controls="faq-a\d+"/); }
  const html = strip(render({ inject: 'document.querySelector(".faq-q").click();' }).html);
  assert.match(html, /<button[^>]*class="faq-q"[^>]*aria-expanded="true"/);
  assert.match(html, /<div class="faq-a" id="faq-a0"[^>]*>/);
  assert.doesNotMatch(html.match(/<div class="faq-a" id="faq-a0"[^>]*>/)[0], /hidden/);
});

test("locked agenda steps explain what to do first and are not washed out", () => {
  assert.doesNotMatch(css, /\.step\.off\s*\{[^}]*opacity/);
  for (const id of ["st-day", "st-hour", "st-data"]) {
    const s = dom.slice(dom.indexOf(`id="${id}"`), dom.indexOf(`id="${id}"`) + 600);
    assert.match(s, /class="lock-msg"[^>]*>[^<]{15,}</, id);
  }
  assert.ok(Number(a("lockedMsg")) >= 4.5, `locked message ${a("lockedMsg")}`);
});

test("form errors are announced and required fields are marked in text", () => {
  assert.match(dom, /id="f-error"[^>]*role="alert"/);
  for (const id of ["f-name", "f-phone", "b-company", "g-to"]) {
    const re = new RegExp(`<label[^>]*>[^<]*<span class="req">\\(obligatorio\\)</span>(?:(?!</label>)[\\s\\S])*id="${id}"`);
    assert.match(dom, re, id);
  }
});

test("focus is visible on every interactive element and never removed", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px/);
  assert.doesNotMatch(css, /outline:\s*(none|0)\b/);
});

test("option buttons expose their selected state", () => {
  const html = strip(render().html);
  assert.match(html.slice(html.indexOf('id="s-colors"')), /<button[^>]*aria-pressed="(true|false)"/);
  assert.match(html.slice(html.indexOf('id="modes"')), /<button[^>]*aria-pressed="(true|false)"/);
});
