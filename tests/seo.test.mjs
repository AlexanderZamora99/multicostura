// SEO tests: static metadata must stay in sync with NEGOCIO (js/datos.js) and the domain-independent rules of the audit.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = f => readFileSync(join(ROOT, f), "utf8");
const N = new Function(`${read("js/datos.js")}; return NEGOCIO;`)();
const index = read("index.html");

const jsonld = html => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, "JSON-LD script is present");
  return JSON.parse(m[1]);
};

// ---- T1: LocalBusiness JSON-LD ----
test("T1 JSON-LD is a valid schema.org ClothingStore", () => {
  const d = jsonld(index);
  assert.equal(d["@context"], "https://schema.org");
  assert.equal(d["@type"], "ClothingStore");
  assert.equal(d.name, "Multicostura Uniformes");
  assert.match(d.description, /uniformes médicos/i);
  assert.match(d.description, /Tuluá/);
});

test("T1 JSON-LD contact data equals NEGOCIO", () => {
  const d = jsonld(index);
  assert.equal(d.telephone.replace(/\D/g, ""), N.whatsapp);
  assert.equal(d.telephone, "+57 321 783 0050");
  assert.equal(d.email, N.correo);
  assert.equal(d.address["@type"], "PostalAddress");
  assert.equal(d.address.streetAddress, N.direccionTaller.split(",").slice(0, 2).join(",").trim());
  assert.equal(d.address.addressLocality, N.ciudad);
  assert.equal(d.address.addressRegion, "Valle del Cauca");
  assert.equal(d.address.addressCountry, "CO");
  assert.deepEqual([...d.sameAs].sort(), [N.instagram, N.tiktok, N.facebook].sort());
});

test("T1 JSON-LD opening hours equal NEGOCIO.horario day by day", () => {
  const d = jsonld(index);
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const got = {};
  for (const s of d.openingHoursSpecification) {
    assert.equal(s["@type"], "OpeningHoursSpecification");
    for (const day of [].concat(s.dayOfWeek)) (got[names.indexOf(day)] ||= []).push([s.opens, s.closes]);
  }
  for (let i = 0; i < 7; i++) {
    const want = N.horario[i];
    if (!want) assert.equal(got[i], undefined, `${names[i]} must be closed`);
    else assert.deepEqual(got[i], want, names[i]);
  }
});

test("T1 JSON-LD has price range, service area and geo from NEGOCIO.mapa; no domain-dependent fields", () => {
  const d = jsonld(index);
  assert.equal(d.priceRange, "$$");
  const areas = [].concat(d.areaServed).map(a => a.name);
  assert.ok(areas.includes("Tuluá") && areas.includes("Colombia"));
  const [lat, lon] = N.mapa.split(",").map(Number);
  assert.equal(d.geo["@type"], "GeoCoordinates");
  assert.equal(d.geo.latitude, lat);
  assert.equal(d.geo.longitude, lon);
  for (const k of ["url", "@id", "image", "logo"]) assert.equal(d[k], undefined, `${k} is deferred until the domain exists`);
});

// ---- T2: Open Graph / Twitter ----
const catalogo = read("catalogo.html");
const meta = (html, attr, name) => (html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`)) || [])[1];

for (const [page, html] of [["index.html", index], ["catalogo.html", catalogo]]) {
  test(`T2 ${page} has locale, site name and twitter card`, () => {
    assert.equal(meta(html, "property", "og:locale"), "es_CO");
    assert.equal(meta(html, "property", "og:site_name"), "Multicostura");
    assert.equal(meta(html, "name", "twitter:card"), "summary_large_image");
    assert.equal(meta(html, "name", "twitter:title"), meta(html, "property", "og:title"));
    assert.equal(meta(html, "name", "twitter:description"), meta(html, "property", "og:description"));
    assert.equal(meta(html, "property", "og:image"), "img/og-image.jpg", "og:image stays relative until the domain exists");
    assert.ok(!/og:url|rel="canonical"/.test(html), "og:url/canonical are deferred");
  });
}

test("T2 catalogo.html has its own og title and description", () => {
  assert.notEqual(meta(catalogo, "property", "og:title"), meta(index, "property", "og:title"));
  assert.notEqual(meta(catalogo, "property", "og:description"), meta(index, "property", "og:description"));
  assert.match(meta(catalogo, "property", "og:title"), /cat[aá]logo/i);
  assert.match(meta(catalogo, "property", "og:description"), /uniformes médicos/i);
});

// ---- T3: branded 404 ----
import { existsSync } from "node:fs";
test("T3 404.html exists, is noindex and links home, catalog and WhatsApp", () => {
  assert.ok(existsSync(join(ROOT, "404.html")), "404.html exists");
  const h = read("404.html");
  assert.match(h, /<html lang="es">/);
  assert.match(h, /<meta name="robots" content="noindex">/);
  assert.match(h, /<title>[^<]+<\/title>/);
  assert.match(h, /<link rel="stylesheet" href="\/css\/estilos\.css">/, "root-absolute asset paths so it renders at any missing URL");
  assert.match(h, /rel="icon"/);
  assert.match(h, /href="\/index\.html"/);
  assert.match(h, /href="\/catalogo\.html"/);
  assert.ok(h.includes(`href="https://wa.me/${N.whatsapp}`), "WhatsApp link uses NEGOCIO.whatsapp");
});

test("T3 wrangler serves 404.html and .assetsignore does not exclude it", () => {
  const cfg = JSON.parse(read("wrangler.jsonc").replace(/^\s*\/\/.*$/gm, ""));
  assert.equal(cfg.assets.not_found_handling, "404-page");
  assert.equal(cfg.assets.directory, ".");
  const ignored = read(".assetsignore").split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  assert.ok(!ignored.some(p => p === "404.html" || p === "*.html"));
});
