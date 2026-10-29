import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const { html, stderr } = render();

test("existing sections are still present", () => {
  for (const id of ["reco", "look", "nosotros", "personaliza", "agenda", "medidas", "empresas", "bono", "regalo", "clientas"]) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});

// changed: the catalog moved to catalogo.html; the home keeps only the recommended cards
test("home renders the recommended cards", () => {
  assert.ok(count(html, '<article class="model"') >= 4);
});

test("catalogo.html renders every model from NEGOCIO", () => {
  const cat = render({ page: "catalogo.html" });
  assert.ok(cat.html.includes('id="modelos"'));
  assert.ok(count(cat.html, '<article class="model"') >= 17);
  assert.doesNotMatch(cat.stderr, /Uncaught/);
});

test("WhatsApp links point to the business number", () => {
  assert.match(html, /id="wa-float"[^>]*href="https:\/\/wa\.me\/573217830050/);
});

test("page runs without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});
