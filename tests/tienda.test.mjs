import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, count } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);

test("no eyebrow labels remain in markup or styles", () => {
  assert.doesNotMatch(dom, /class="eyebrow"/);
  assert.doesNotMatch(source, /\.eyebrow\s*\{/);
});

test("no emoji are used as icons in the page", () => {
  const visible = dom.replace(/<style[\s\S]*?<\/style>/g, "");
  assert.doesNotMatch(visible, /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(source, /content:\s*"[^"]*\p{Extended_Pictographic}/u);
});

test("fonts are two sans families, no script or italic display", () => {
  assert.match(source, /fonts\.googleapis\.com\/css2\?family=Jost/);
  assert.doesNotMatch(source, /Poppins|Cormorant|cursive|font-style:\s*italic/);
});

test("announcement bar renders one message per NEGOCIO.anuncios", () => {
  const html = strip(render({ inject: 'NEGOCIO.anuncios = ["Uno", "Dos"]; renderAnuncios();' }).html);
  const bar = html.slice(html.indexOf('id="ann"'), html.indexOf("</header>"));
  assert.equal(count(bar, 'class="ann-item'), 2);
  assert.ok(bar.includes("Uno") && bar.includes("Dos"));
  assert.equal(count(bar, 'class="ann-item is-active'), 1);
});

test("header keeps Catálogo, Diseña, Agenda medidas, Empresas, Bonos regalo and has a WhatsApp icon", () => {
  const head = dom.slice(dom.indexOf("<header"), dom.indexOf("</header>"));
  for (const t of ["Catálogo", "Diseña", "Agenda medidas", "Empresas", "Bonos regalo"]) assert.ok(head.includes(`>${t}</a>`), t);
  assert.match(head, /id="hdr-wa"[^>]*href="https:\/\/wa\.me\/573217830050/);
  assert.match(head, /id="hdr-wa"[^>]*aria-label="[^"]+"/);
});

const PIX = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E";
const portada = `NEGOCIO.portada = [
  { img: "${PIX}", imgMovil: "https://example.invalid/a-m.jpg", titulo: "Titulo A", texto: "Texto A", cta: "Ver A", href: "#modelos" },
  { img: "${PIX}", imgMovil: "https://example.invalid/b-m.jpg", titulo: "Titulo B", texto: "Texto B", cta: "Ver B", href: "#agenda" }];
renderPortada();`;

test("banner is built from NEGOCIO.portada with <picture>, copy, CTA, arrows and dots", () => {
  const html = strip(render({ inject: portada }).html);
  const b = html.slice(html.indexOf('id="banner"'), html.indexOf("</section>", html.indexOf('id="banner"')));
  assert.equal(count(b, "<picture"), 2);
  assert.match(b, /<source[^>]*media="\(max-width: 760px\)"[^>]*srcset="https:\/\/example\.invalid\/a-m\.jpg"/);
  assert.match(b, /<img[^>]*src="data:image\/svg\+xml,/);
  assert.ok(b.includes("Titulo B") && b.includes("Texto B"));
  assert.match(b, /<a[^>]*href="#agenda"[^>]*>Ver B<\/a>/);
  assert.equal(count(b, "class=\"dot\""), 2);
  assert.match(b, /aria-label="Banner anterior"/);
  assert.match(b, /aria-label="Banner siguiente"/);
  assert.equal(count(b, "is-active"), 1, "exactly one active slide");
});

test("banner keeps its copy when every image fails to load", () => {
  const html = strip(render({ inject: 'document.querySelectorAll("#banner img").forEach(i => i.dispatchEvent(new Event("error")));' }).html);
  const b = html.slice(html.indexOf('id="banner"'), html.indexOf("</section>", html.indexOf('id="banner"')));
  assert.doesNotMatch(b, /<img/);
  assert.match(b, /class="slide-copy"/);
});

test("banner supports reduced motion, hover/focus pause and swipe", () => {
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /touchstart/);
  assert.match(source, /touchend/);
  assert.match(source, /mouseenter/);
  assert.match(source, /focusin/);
});

test("buttons give tactile press feedback", () => {
  assert.match(source, /\.btn:active\s*\{[^}]*scale\(/);
});

test("no horizontal scroll at phone width", () => {
  const html = render({ width: 390, height: 900, inject: 'document.body.setAttribute("data-ov", document.documentElement.scrollWidth - document.documentElement.clientWidth);' }).html;
  const m = html.match(/data-ov="(-?\d+)"/);
  assert.ok(m, "probe missing");
  assert.ok(Number(m[1]) <= 0, `page overflows by ${m[1]}px`);
});

test("tienda runs without uncaught errors", () => {
  assert.doesNotMatch(render().stderr, /Uncaught/);
});
