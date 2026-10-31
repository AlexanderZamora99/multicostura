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
