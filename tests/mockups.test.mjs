import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const between = (h, a, b) => { const i = h.indexOf(a); return h.slice(i, h.indexOf(b, i)); };
const attr = (html, k) => { const m = html.match(new RegExp(`data-${k}="([^"]*)"`)); return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"') : null; };

// ---------- T1: Descubre el look completo ----------
const lookProbe = `
  const b = document.body, card = () => document.getElementById("look-item").textContent;
  const dots = [...document.querySelectorAll("#look .punto")];
  b.setAttribute("data-l-first", card());
  b.setAttribute("data-l-pressed0", dots[0].getAttribute("aria-pressed"));
  dots[1].click();
  b.setAttribute("data-l-two", card());
  b.setAttribute("data-l-pressed1", dots[1].getAttribute("aria-pressed"));
  b.setAttribute("data-l-pressed0b", dots[0].getAttribute("aria-pressed"));
  dots[2].click();
  b.setAttribute("data-l-three", card());
  b.setAttribute("data-l-min", Math.min(...dots.map(d => Math.min(d.getBoundingClientRect().width, d.getBoundingClientRect().height))));
  document.getElementById("look-cta").click();
  b.setAttribute("data-l-qv", document.getElementById("qv").open ? document.getElementById("qv-title").textContent + "|" + document.getElementById("qv-colname").textContent : "closed");
`;
const look = render({ width: 1366, height: 900, inject: lookProbe }).html;
const lookDom = strip(look);

test("look section follows the recommended section", () => {
  assert.ok(lookDom.indexOf('id="look"') > lookDom.indexOf('id="reco"'));
  assert.ok(lookDom.indexOf('id="look"') < lookDom.indexOf('id="colecciones"'));
});

test("look has 3 accessible hotspot buttons, first pressed", () => {
  const sec = between(lookDom, 'id="look"', 'id="colecciones"');
  const dots = sec.match(/<button[^>]*class="punto"[^>]*>/g) || [];
  assert.equal(dots.length, 3);
  dots.forEach(d => assert.match(d, /aria-label="[^"]+"/));
  assert.equal(attr(look, "l-pressed0"), "true");
  assert.ok(Number(attr(look, "l-min")) >= 44, "touch target " + attr(look, "l-min"));
});

test("clicking a hotspot updates the live card", () => {
  assert.match(attr(look, "l-first"), /Blusa Kaill/);
  assert.match(attr(look, "l-two"), /Pantalón Kaill/);
  assert.equal(attr(look, "l-pressed1"), "true");
  assert.equal(attr(look, "l-pressed0b"), "false");
  assert.ok(lookDom.match(/id="look-item"[^>]*aria-live/) || lookDom.match(/aria-live[^>]*id="look-item"/));
});

test("embroidery hotspot builds prices from NEGOCIO.bordado", () => {
  const t = attr(look, "l-three");
  assert.match(t, /Bordado opcional/);
  assert.match(t, /\$12\.000/);
  assert.match(t, /\$6\.000/);
  assert.match(t, /dorado/);
});

test("look CTA opens the Kaill quick view in Azul rey", () => {
  assert.match(lookDom, /id="look-cta"[^>]*btn-mag|btn-mag[^>]*id="look-cta"/);
  assert.equal(attr(look, "l-qv"), "Kaill|Azul rey");
});
