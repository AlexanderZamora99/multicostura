// Measuring guide: the size chart image (img/tabla-medidas.jpg) is the only guide; no numbered list or garment diagram.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
    // the per-measurement list is allowed only inside the agenda's #guia-casa
    const fuera = h.replace(/<details[^>]*id="guia-casa"[\s\S]*?<\/details>/, "");
    assert.doesNotMatch(fuera, /<ol[\s>][\s\S]*?Busto o pecho/, nombre);
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

// The "Escríbenos por WhatsApp" button drawn in the chart image is a real link overlay everywhere the image appears.
const N = new Function(`${readFileSync(join(ROOT, "js/datos.js"), "utf8")}; return NEGOCIO;`)();
const grupos = h => h.match(/<div class="tabla-wrap">[\s\S]*?<\/div>/g) || [];
test("size chart WhatsApp overlay: present in #guia-tallas, #guia-casa and #pd-guia on both pages", () => {
  const cat = render({ page: "catalogo.html" }).html;
  const cuenta = (h, n) => (h.match(/<img[^>]*tabla-medidas/g) || []).length === n;
  assert.ok(cuenta(html, 3) && cuenta(cat, 1), "image appears in 3 places on home and 1 on the catalog");
  for (const [nombre, h, n] of [["home", html, 3], ["catalog", cat, 1]]) {
    const g = grupos(h);
    assert.equal(g.length, n, `${nombre}: one wrapper per image`);
    for (const w of g) {
      const a = (w.match(/<a[^>]*class="tabla-wa"[^>]*>/) || [""])[0];
      assert.ok(a, `${nombre}: overlay link`);
      assert.match(a, new RegExp(`href="https://wa\\.me/${N.whatsapp}\\?text=[^"]+"`));
      assert.match(decodeURIComponent(a.match(/text=([^"]+)"/)[1]), /medidas/i);
      assert.match(a, /aria-label="Escríbenos por WhatsApp sobre tus medidas"/);
      assert.match(a, /target="_blank"/);
      assert.doesNotMatch(w.replace(a, "").replace(/<a[^>]*tabla-medidas[\s\S]*?<\/a>/, ""), /<a /, "no nested anchors");
    }
  }
});

test("size chart WhatsApp overlay sits on the drawn button (percentages of the image box) with focus and hover styles", () => {
  const css = readFileSync(join(ROOT, "css/estilos.css"), "utf8");
  const r = (css.match(/\.tabla-wa \{[^}]*\}/) || [""])[0];
  assert.match(r, /position: absolute/);
  assert.match(r, /left: 16%/); assert.match(r, /top: 90\.3%/); assert.match(r, /width: 22\.5%/); assert.match(r, /height: 5\.4%/);
  assert.match(css, /\.tabla-wa:hover/);
  assert.match(css, /\.tabla-wa:focus-visible/);
  assert.match(css, /\.tabla-wrap \{[^}]*position: relative/);
});
