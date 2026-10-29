// Size chart: a collapsible reference image inside "Cómo tomar tus medidas en casa", with an accessible text version.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { html } = render();
const start = html.indexOf('id="medidas"');
const medidas = html.slice(start, html.indexOf("</section>", start));
const guia = (medidas.match(/<details[^>]*id="guia-tallas"[\s\S]*?<\/details>/) || [""])[0];

test("measuring section has a collapsed size chart toggle", () => {
  assert.ok(guia, "details#guia-tallas inside #medidas");
  assert.ok(!/<details[^>]*\sopen/.test(guia), "closed by default");
  assert.match(guia, /<summary[^>]*>[\s\S]*tabla de medidas[\s\S]*<\/summary>/i);
});

test("size chart image exists, is lazy and has a descriptive alt", () => {
  const img = (guia.match(/<img[^>]*>/) || [""])[0];
  const src = (img.match(/src="([^"]+)"/) || [])[1];
  assert.ok(src && existsSync(join(ROOT, src)), `image file ${src}`);
  assert.match(img, /loading="lazy"/);
  assert.match(img, /alt="[^"]*tabla de medidas[^"]*"/i);
});

test("size chart values are available as text for screen readers", () => {
  const tables = guia.match(/<table[\s\S]*?<\/table>/g) || [];
  assert.equal(tables.length, 2, "blusa and pantalón tables");
  for (const t of ["S", "M", "L", "XL"]) assert.ok(tables.every(x => x.includes(`>${t}<`)), `size ${t}`);
  assert.match(tables[0], /Busto[\s\S]*96[\s\S]*100[\s\S]*108[\s\S]*112/);
  assert.match(tables[1], /Ancho de bota[\s\S]*22[\s\S]*23[\s\S]*24[\s\S]*25/);
});
