// Measuring guide: the size chart image (img/tabla-medidas.jpg) is the only guide; no numbered list or garment diagram.
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

test("measuring section shows the size chart image directly, lazy and with a descriptive alt", () => {
  const img = (medidas.match(/<img[^>]*tabla-medidas[^>]*>/) || [""])[0];
  const src = (img.match(/src="([^"]+)"/) || [])[1];
  assert.ok(src && existsSync(join(ROOT, src)), `image file ${src}`);
  assert.match(img, /loading="lazy"/);
  assert.match(img, /alt="[^"]*tabla de medidas[^"]*"/i);
});

test("measuring section has no numbered steps list and no garment diagram", () => {
  assert.doesNotMatch(medidas, /<ol[\s>]/);
  assert.doesNotMatch(medidas, /<svg/);
  assert.doesNotMatch(medidas, /id="measures"/);
});

test("the old step list and pink diagram are gone from the whole home page and the catalog", () => {
  const cat = render({ page: "catalogo.html", inject: `document.querySelector('.model .pic').click();` }).html;
  for (const [nombre, h] of [["home", html], ["catalog", cat]]) {
    assert.doesNotMatch(h, /<li><b>Busto o pecho<\/b>/, nombre);
    assert.doesNotMatch(h, /id="pd-measures"|id="measures"/, nombre);
    assert.doesNotMatch(h, /stroke-dasharray="5 4"/, nombre);
    assert.doesNotMatch(h, /fill:#f4b6d2/, nombre);
  }
});

test("size chart values are available as text for screen readers", () => {
  const tables = medidas.match(/<table[\s\S]*?<\/table>/g) || [];
  assert.equal(tables.length, 2, "blusa and pantalón tables");
  for (const t of ["S", "M", "L", "XL"]) assert.ok(tables.every(x => x.includes(`>${t}<`)), `size ${t}`);
  assert.match(tables[0], /Busto[\s\S]*96[\s\S]*100[\s\S]*108[\s\S]*112/);
  assert.match(tables[1], /Ancho de bota[\s\S]*22[\s\S]*23[\s\S]*24[\s\S]*25/);
});
