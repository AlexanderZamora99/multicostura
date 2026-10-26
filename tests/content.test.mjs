import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const { html, stderr } = render();
const dom = html.replace(/<script[\s\S]*?<\/script>/g, ""); // solo el DOM, sin el código fuente

test("Google Maps embed uses the encoded workshop address", () => {
  const m = dom.match(/<iframe[^>]*src="(https:\/\/www\.google\.com\/maps\?q=[^"]+)"[^>]*>/);
  assert.ok(m, "maps iframe missing");
  assert.match(m[1], /q=Calle%2024%20T10-39/);
  assert.match(m[1], /output=embed/);
  assert.match(m[0], /loading="lazy"/);
  assert.match(m[0], /title="[^"]+"/);
});

test("workshop address text is shown in the Nosotros section", () => {
  const section = dom.slice(dom.indexOf('id="nosotros"'), dom.indexOf('id="personaliza"'));
  assert.ok(section.includes("Calle 24 T10-39"));
});

test("store button falls back to a WhatsApp link when tiendaOnline is empty", () => {
  const m = dom.match(/<a[^>]*id="stock-btn"[^>]*>/);
  assert.ok(m, "stock button missing");
  assert.match(m[0], /href="https:\/\/wa\.me\/573217830050\?text=/);
  assert.ok(dom.includes("Ver disponibles en tienda física"));
});

test("videos section stays hidden while NEGOCIO.videos is empty", () => {
  assert.match(dom, /<section id="videos" class="hidden"/);
});

test("each price tier shows its delivery time", () => {
  const tipos = dom.slice(dom.indexOf('id="tipos"'), dom.indexOf('id="nosotros"'));
  for (const t of ["Entrega inmediata", "3 a 5 días hábiles", "5 a 8 días hábiles"]) {
    assert.ok(tipos.includes(t), `missing ${t}`);
  }
});

test("content additions run without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});
