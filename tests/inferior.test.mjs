import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, count } from "./render.mjs";

const source = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };
const FAQS = (source.match(/claves:\s*\[/g) || []).length;

test("lower page order: testimonials, FAQ, photo grid, then footer", () => {
  const at = k => dom.indexOf(k);
  assert.ok(at('id="testimonios"') > at('id="empresas"'));
  assert.ok(at('id="testimonios"') < at('id="faq"'));
  assert.ok(at('id="faq"') < at('id="clientas"'));
  assert.ok(at('id="clientas"') < at('<footer'));
});

// changed: example entries are no longer shown or marked, the whole section stays hidden until a real one exists (see honesto.test.mjs)
test("testimonials: one card per real NEGOCIO.testimonios entry, arrows are labelled", () => {
  const s = section(dom, "testimonios");
  assert.equal(count(s, 'class="quote-card"'), 2); // changed: the two real Facebook reviews
  assert.match(s, /aria-label="Testimonios anteriores"/);
  assert.match(s, /aria-label="Testimonios siguientes"/);
  const html = strip(render({ inject: 'NEGOCIO.testimonios = [{ nombre: "Ana", oficio: "Odontóloga", texto: "Me quedó perfecto" }]; renderTestimonios();' }).html);
  const s2 = section(html, "testimonios");
  assert.equal(count(s2, 'class="quote-card"'), 1);
  assert.ok(s2.includes("Me quedó perfecto") && s2.includes("Ana"));
  assert.doesNotMatch(s2, /Texto de ejemplo/);
});

test("FAQ accordion has one item per NEGOCIO.faq with its answer", () => {
  const s = section(dom, "faq");
  assert.equal(count(s, 'class="faq-item"'), FAQS);
  assert.equal(count(s, 'class="faq-q"'), FAQS); // was <summary>: the accordion now uses buttons with aria-expanded
  assert.ok(s.includes("¿Cómo se paga?"));
  const html = strip(render({ inject: 'NEGOCIO.recargoDomicilio = 12345; NEGOCIO.faq = NEGOCIO.faq.slice(0, 5); renderFaq();' }).html);
  const s2 = section(html, "faq");
  assert.equal(count(s2, 'class="faq-item"'), 5);
  assert.ok(s2.includes("$12.345"), "answers stay driven by NEGOCIO");
});

// changed: tiles whose photo does not load are no longer rendered with a grey caption box
test("photo grid shows an entry per NEGOCIO.clientas photo that loads and links to Instagram", () => {
  const html = strip(render({ inject: 'NEGOCIO.clientas = [{ foto: "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E", texto: "Odontóloga" }, { foto: "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E", texto: "Enfermera jefe" }]; renderClientas();' }).html);
  const s = section(html, "clientas");
  assert.equal(count(s, "<figure"), 2);
  for (const t of ["Odontóloga", "Enfermera jefe"]) assert.ok(s.includes(t), t);
  assert.match(s, /href="https:\/\/www\.instagram\.com\/multicostura_uniformes\/"/);
});

test("rich footer has navigation, contact, hours, address and social links", () => {
  const f = dom.slice(dom.indexOf("<footer"), dom.indexOf("</footer>"));
  for (const id of ["modelos", "personaliza", "agenda", "empresas", "bono", "nosotros"]) assert.ok(f.includes(`href="#${id}"`), `nav #${id}`);
  assert.ok(f.includes("Calle 24 T10-39"));
  assert.match(f, /Lunes a viernes/);
  assert.match(f, /id="f-wa"[^>]*href="https:\/\/wa\.me\/573217830050/);
  assert.match(f, /id="f-ig"[^>]*href="https:\/\/www\.instagram\.com/);
  assert.match(f, /id="f-tt"[^>]*href="https:\/\/www\.tiktok\.com/);
  assert.match(f, new RegExp(`© ${new Date().getFullYear()} Multicostura`));
});

test("a WhatsApp band closes the page above the footer", () => {
  const i = dom.indexOf('id="contacto-band"');
  assert.ok(i > dom.indexOf('id="clientas"') && i < dom.indexOf("<footer"));
  assert.match(dom.slice(i, dom.indexOf("<footer")), /href="https:\/\/wa\.me\/573217830050/);
});

test("filler copy is gone and the about text is concrete", () => {
  for (const t of ["alta calidad y durabilidad", "soluciones confiables", "Empresa Multicostura", "increíble"]) assert.ok(!dom.includes(t), t);
  const s = section(dom, "nosotros");
  assert.ok(s.includes("Tuluá") && s.includes("taller") && s.includes("10 años"));
});

test("the FAQ hours answer and the footer share one NEGOCIO.horarioTexto", () => {
  const html = strip(render({ inject: 'NEGOCIO.horarioTexto = "Horario de prueba 123"; renderFooter(); renderFaq();' }).html);
  assert.ok(html.slice(html.indexOf("<footer")).includes("Horario de prueba 123"));
  assert.ok(section(html, "faq").includes("horario de prueba 123"), "the FAQ lower-cases the first letter to continue its sentence");
});

test("lower page runs without uncaught errors", () => {
  assert.doesNotMatch(render().stderr, /Uncaught/);
});
