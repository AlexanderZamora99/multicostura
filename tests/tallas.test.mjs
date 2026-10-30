// Size chart rebuilt as web content: real tables, tips, a cropped model photo and a WhatsApp button; no numbered garment diagram.
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

const N = new Function(`${readFileSync(join(ROOT, "js/datos.js"), "utf8")}; return NEGOCIO;`)();
const cuerpoTablas = h => h.match(/<table[\s\S]*?<\/table>/g) || [];
const filas = t => (t.match(/<tr>[\s\S]*?<\/tr>/g) || []).map(r => [...r.matchAll(/<t[hd][^>]*>([^<]*)<\/t[hd]>/g)].map(m => m[1]));

test("measuring section shows the size chart as real tables, tips, the model photo and a WhatsApp button", () => {
  const tablas = cuerpoTablas(medidas);
  assert.equal(tablas.length, 2, "blusa and pantalón");
  assert.match(tablas[0], /<caption[^>]*>Blusa/); assert.match(tablas[1], /<caption[^>]*>Pantal/);
  assert.deepEqual(filas(tablas[0]).slice(0, 2), [["Medida", "S", "M", "L", "XL"], ["Busto", "96", "100", "108", "112"]]);
  assert.deepEqual(filas(tablas[0]).slice(2), [["Cintura", "78", "84", "90", "96"], ["Cadera", "104", "108", "114", "120"], ["Largo de blusa", "68", "69", "70", "72"]]);
  assert.deepEqual(filas(tablas[1]).slice(1), [["Cintura", "78", "84", "90", "96"], ["Cadera", "104", "108", "114", "120"], ["Largo de pantalón", "102", "104", "106", "106"], ["Largo entrepierna", "80", "81.5", "83", "84.5"], ["Ancho de bota", "22", "23", "24", "25"]]);
  for (const t of ["cinta métrica flexible", "postura natural", "ropa interior o piel", "entre tallas"]) assert.match(medidas, new RegExp(t, "i"));
  assert.match(medidas, /¿Cómo saber tu talla\?/);
  assert.match(medidas, /a tu medida/i, "made-to-measure note next to the sizes");
  const img = (medidas.match(/<img[^>]*tabla-medidas-modelo[^>]*>/) || [""])[0];
  assert.ok(img && existsSync(join(ROOT, "img/tabla-medidas-modelo.webp")), "model photo");
  assert.match(img, /loading="lazy"/); assert.match(img, /alt="[^"]{20,}"/);
  const wa = (medidas.match(/<a[^>]*class="btn btn-wa tm-wa"[^>]*>[^<]*<\/a>/) || [""])[0];
  assert.match(wa, new RegExp(`href="https://wa\\.me/${N.whatsapp}\\?text=[^"]+"`));
  assert.match(wa, />Escríbenos por WhatsApp</);
  assert.match(medidas, /¿Dudas con tus medidas o necesitas una talla especial\?/);
});

test("no guide shows the old chart image or its overlay any more, and the dialog link goes to the web chart", () => {
  const cat = render({ page: "catalogo.html" }).html;
  for (const [n, h] of [["home", html], ["catalog", cat]]) {
    assert.doesNotMatch(h, /<img[^>]*src="img\/tabla-medidas\.jpg"/, n);
    assert.doesNotMatch(h, /tabla-wa|tabla-wrap|Medidas adicionales/, n);
  }
  assert.match(html.match(/<details[^>]*id="pd-guia"[\s\S]*?<\/details>/)[0], /<a href="#guia-tallas"[^>]*>Ver tabla de medidas<\/a>/);
  assert.match(cat.match(/<details[^>]*id="pd-guia"[\s\S]*?<\/details>/)[0], /<a href="index\.html#guia-tallas"[^>]*>Ver tabla de medidas<\/a>/);
});

test("the agenda at-home guide reuses the same web chart", () => {
  const casa = html.match(/<details[^>]*id="guia-casa"[\s\S]*?<\/details>\s*<p/)[0];
  assert.equal(cuerpoTablas(casa).length, 2);
  assert.match(casa, /tabla-medidas-modelo\.webp/);
  assert.match(casa, /class="btn btn-wa tm-wa"/);
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
    // the per-measurement list is allowed only inside the agenda's #guia-casa and the dialog's #pd-guia
    const fuera = h.replace(/<details[^>]*id="guia-casa"[\s\S]*?<\/details>/, "").replace(/<details[^>]*id="pd-guia"[\s\S]*?<\/details>/, "");
    assert.doesNotMatch(fuera, /<ol[\s>][\s\S]*?Busto o pecho/, nombre);
    assert.doesNotMatch(h, /id="pd-measures"|id="measures"/, nombre);
    assert.doesNotMatch(h, /stroke-dasharray="5 4"/, nombre);
    assert.doesNotMatch(h, /fill:#f4b6d2/, nombre);
  }
});

test("sizes copy: made-to-measure first, standard sizes S-XL exist for ready-made store uniforms", () => {
  const src = ["js/datos.js", "js/app.js", "index.html", "catalogo.html"].map(f => readFileSync(join(ROOT, f), "utf8")).join("\n");
  assert.doesNotMatch(src, /no trabajamos por tallas|no se trabaja por tallas|No hace falta saber tu talla porque no hay/i);
  const f = N.faq.find(x => x.id === "tallas"), a = typeof f.a === "function" ? f.a(N) : f.a;
  assert.doesNotMatch(a, /^No\. No trabajamos/);
  assert.match(a, /a tu medida|tus medidas/i);
  assert.match(a, /S a XL/);
  assert.match(a, /tienda/i);
});
