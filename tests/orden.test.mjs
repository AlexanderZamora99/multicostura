import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const at = id => dom.indexOf(`id="${id}"`);

test("how it works and the measuring guide come before the agenda form", () => {
  assert.ok(at("proceso") > -1 && at("medidas") > -1 && at("agenda") > -1);
  assert.ok(at("proceso") < at("medidas"), "process before guide");
  assert.ok(at("medidas") < at("agenda"), "guide before agenda");
});

test("nav anchors still point to existing sections", () => {
  const nav = dom.slice(dom.indexOf("<header"), dom.indexOf("</header>"));
  for (const [, id] of nav.matchAll(/href="#([a-z-]+)"/g)) assert.ok(at(id) > -1, `dangling #${id}`);
});

const casa = `document.querySelectorAll("#modes .mode")[2].click();`;

test("inline guide stays hidden until 'Me mido en casa' is selected", () => {
  const m = dom.match(/<[^>]*id="guia-inline"[^>]*>/);
  assert.ok(m, "inline guide missing");
  assert.match(m[0], /hidden/);
});

test("'Me mido en casa' shows the numbered diagram next to the measure fields, from NEGOCIO.medidas", () => {
  const d = strip(render({ inject: casa }).html);
  const box = d.slice(d.indexOf('id="self-measures"'), d.indexOf('id="f-notes"'));
  const guide = box.match(/<[^>]*id="guia-inline"[^>]*>/);
  assert.ok(guide, "guide not inside the measures block");
  assert.doesNotMatch(guide[0], /hidden/);
  assert.match(box, /id="mgrid"/);
  assert.equal((box.match(/<text /g) || []).length, 7, "diagram numbers every measure"); // was: reused the #medidas-diagrama symbol, now generated so its numbers can be measured
  assert.ok(box.includes("Cintura"));
});
