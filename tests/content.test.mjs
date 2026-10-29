import { test } from "node:test";
import assert from "node:assert/strict";
import { render, estilos } from "./render.mjs";

const { html, stderr } = render();
const dom = html.replace(/<script[\s\S]*?<\/script>/g, ""); // solo el DOM, sin el código fuente

test("Google Maps embed uses the workshop coordinates", () => {
  const m = dom.match(/<iframe[^>]*src="(https:\/\/www\.google\.com\/maps\?q=[^"]+)"[^>]*>/);
  assert.ok(m, "maps iframe missing");
  assert.match(m[1], /q=4\.092361%2C-76\.206250/);
  assert.match(m[1], /output=embed/);
  assert.match(m[0], /loading="lazy"/);
  assert.match(m[0], /title="[^"]+"/);
});

test("workshop address text is shown in the Nosotros section", () => {
  const section = dom.slice(dom.indexOf('id="nosotros"'), dom.indexOf('id="personaliza"'));
  assert.ok(section.includes("Calle 24 T10-39"));
});

test("store button falls back to a WhatsApp link when tiendaOnline is empty", () => {
  const dom = render({ page: "catalogo.html" }).html.replace(/<script[\s\S]*?<\/script>/g, "");
  const m = dom.match(/<a[^>]*id="stock-btn"[^>]*>/);
  assert.ok(m, "stock button missing");
  assert.match(m[0], /href="https:\/\/wa\.me\/573217830050\?text=/);
  assert.ok(dom.includes("Ver disponibles en tienda física"));
});

test("videos section stays hidden while NEGOCIO.videos is empty", () => {
  const { html } = render({ inject: 'NEGOCIO.videos = []; document.getElementById("videos").classList.add("hidden");' });
  assert.match(html, /<section id="videos" class="hidden"/);
});

test("TikTok and Instagram videos are embedded vertically, without hosting the files", () => {
  const s = dom.slice(dom.indexOf('id="videos"'), dom.indexOf("</section>", dom.indexOf('id="videos"')));
  assert.doesNotMatch(dom.match(/<section id="videos"[^>]*>/)[0], /hidden/);
  assert.match(s, /<iframe class="vert"[^>]*src="https:\/\/www\.tiktok\.com\/player\/v1\/\d+/);
  assert.match(s, /<iframe class="vert ig"[^>]*src="https:\/\/www\.instagram\.com\/reel\/[\w-]+\/embed\/"/);
  assert.match(s, /class="vids vert-grid"/);
  assert.ok((s.match(/<iframe[^>]*loading="lazy"/g) || []).length === 4);
});

// changed: the profile tiles moved into the catalog; each purchase form shows its delivery time in the sidebar
test("each purchase form shows its delivery time in the catalog filters", () => {
  const cat = render({ page: "catalogo.html" }).html.replace(/<script[\s\S]*?<\/script>/g, "");
  const forma = cat.slice(cat.indexOf('id="f-forma"'), cat.indexOf("</fieldset>", cat.indexOf('id="f-forma"')));
  for (const t of ["hoy", "3 a 5 días", "5 a 8 días"]) assert.ok(forma.includes(t), `missing ${t}`);
});

test("content additions run without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});

test("map sits full width below the Nosotros text and is tall", () => {
  const section = dom.slice(dom.indexOf('id="nosotros"'), dom.indexOf('id="personaliza"'));
  assert.ok(section.indexOf('id="n-address"') < section.indexOf('id="map"'), "map must come after the text");
  assert.doesNotMatch(section, /class="wrap about"/, "text and map must not share a two-column grid");
  const css = estilos().match(/\.map iframe \{[^}]*height: (\d+)px/);
  assert.ok(css && Number(css[1]) >= 440, "map iframe must be at least 440px tall on desktop");
});

test("map pin comes from NEGOCIO.mapa when set", () => {
  const { html } = render({ inject: 'NEGOCIO.mapa = "4.0847,-76.1954"; renderMapa();' });
  assert.match(html, /maps\?q=4\.0847%2C-76\.1954&amp;output=embed|maps\?q=4\.0847%2C-76\.1954&output=embed/);
});
