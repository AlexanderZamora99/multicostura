import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const { html } = render();
const dom = html.replace(/<script[\s\S]*?<\/script>/g, ""); // solo el DOM, sin el código fuente
const PORTADA = 3; // NEGOCIO.portada.length en el borrador

test("hero shows a carousel instead of static pictures", () => {
  assert.ok(html.includes('id="hero-carousel"'));
  assert.ok(!html.includes('id="hero-pics"'));
});

test("one slide per portada item and exactly one is active", () => {
  assert.equal(count(dom, '<figure class="slide'), PORTADA);
  assert.equal(count(dom, '<figure class="slide is-active'), 1);
});

test("one labelled dot per slide, exactly one current", () => {
  assert.equal(count(dom, 'class="dot"'), PORTADA);
  assert.equal(count(dom, 'aria-label="Ir a la imagen'), PORTADA);
  assert.equal((dom.match(/class="dot"[^>]*aria-current="true"/g) || []).length, 1);
});

test("carousel respects reduced motion and pauses on hover/focus", () => {
  assert.ok(html.includes("prefers-reduced-motion"));
  assert.ok(html.includes("mouseenter") && html.includes("focusin"));
});
