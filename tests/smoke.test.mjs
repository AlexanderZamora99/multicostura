import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const { html, stderr } = render();

test("existing sections are still present", () => {
  for (const id of ["modelos", "nosotros", "personaliza", "agenda", "medidas", "empresas", "bono", "clientas"]) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});

test("catalog renders every model from NEGOCIO", () => {
  assert.ok(count(html, '<article class="model"') >= 17);
});

test("WhatsApp links point to the business number", () => {
  assert.match(html, /id="wa-float"[^>]*href="https:\/\/wa\.me\/573217830050/);
});

test("page runs without uncaught errors", () => {
  assert.doesNotMatch(stderr, /Uncaught/);
});
