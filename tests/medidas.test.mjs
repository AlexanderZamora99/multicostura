import { test } from "node:test";
import assert from "node:assert/strict";
import { render, source as pageSource } from "./render.mjs";

const source = pageSource();
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const MEDIDAS = 7; // NEGOCIO.medidas.length

// Selects "Me mido en casa" and writes layout measurements into data attributes.
const probe = `
  document.querySelectorAll("#modes .mode")[2].click();
  const svg = document.querySelector("#guia-inline svg"), txt = [...document.querySelectorAll("#guia-inline svg text")];
  const fs = txt.map(t => parseFloat(getComputedStyle(t).fontSize) * t.getScreenCTM().a);
  const r = el => el.getBoundingClientRect();
  const grid = document.getElementById("mgrid");
  const b = document.body;
  b.setAttribute("data-minfs", Math.min(...fs));
  b.setAttribute("data-svgw", r(svg).width);
  b.setAttribute("data-svg-right", r(svg).right);
  b.setAttribute("data-grid-left", r(grid).left);
  b.setAttribute("data-svg-bottom", r(svg).bottom);
  b.setAttribute("data-grid-top", r(grid).top);
  b.setAttribute("data-grid-bottom", r(grid).bottom);
  b.setAttribute("data-svg-top", r(svg).top);
`;
const num = (html, k) => Number(html.match(new RegExp(`data-${k}="(-?[\\d.]+)"`))[1]);
const desk = render({ width: 1366, height: 900, inject: probe }).html;
const mob = render({ width: 500, height: 900, inject: probe }).html;
const deskDom = strip(desk);

test("self-measure diagram numbers are legible (>= 14px rendered) on desktop and phone", () => {
  assert.ok(num(desk, "minfs") >= 14, `desktop numbers are ${num(desk, "minfs")}px`);
  assert.ok(num(mob, "minfs") >= 14, `phone numbers are ${num(mob, "minfs")}px`);
});

test("diagram is large: at least 300px wide when stacked on a phone", () => {
  assert.ok(num(mob, "svgw") >= 300, `diagram is ${num(mob, "svgw")}px wide`);
});

test("diagram and fields sit side by side on desktop and stack with the diagram first on phones", () => {
  assert.ok(num(desk, "svg-right") <= num(desk, "grid-left") + 1, "desktop: diagram left of fields");
  assert.ok(num(mob, "svg-bottom") <= num(mob, "grid-top") + 1, "phone: diagram above fields");
});

test("diagram labels are the numbers 1 to 7, matching the fields", () => {
  const box = deskDom.slice(deskDom.indexOf('id="self-measures"'), deskDom.indexOf('id="f-notes"'));
  const diagram = [...box.match(/<svg[\s\S]*?<\/svg>/)[0].matchAll(/<text[^>]*>(\d)<\/text>/g)].map(m => m[1]);
  assert.deepEqual(diagram, ["1", "2", "3", "4", "5", "6", "7"]);
  const badges = [...box.matchAll(/class="mnum"[^>]*>(\d)</g)].map(m => m[1]);
  assert.deepEqual(badges, ["1", "2", "3", "4", "5", "6", "7"]);
});

test("each measure field has its label, a how-to hint, a cm suffix, decimal keyboard and limits", () => {
  const box = deskDom.slice(deskDom.indexOf('id="mgrid"'), deskDom.indexOf('id="f-notes"'));
  const fields = box.split('class="mfield"').slice(1);
  assert.equal(fields.length, MEDIDAS);
  for (const f of fields) {
    assert.match(f, /<label for="(m-\d)"/);
    const id = f.match(/<label for="(m-\d)"/)[1];
    assert.match(f, new RegExp(`<input[^>]*id="${id}"`));
    assert.match(f, /inputmode="decimal"/);
    assert.match(f, /min="\d+"/);
    assert.match(f, /max="\d+"/);
    assert.match(f, /class="munit"[\s\S]*>cm</);
    assert.match(f, /class="mhint"/);
  }
  assert.ok(fields[0].includes("Busto o pecho") && fields[0].includes("Por la parte más llena"), "hint reuses NEGOCIO.medidas");
});

test("the measure list is not duplicated next to the diagram and number spinners are hidden", () => {
  const box = deskDom.slice(deskDom.indexOf('id="self-measures"'), deskDom.indexOf('id="f-notes"'));
  assert.doesNotMatch(box, /id="measures-short"/);
  assert.doesNotMatch(box, /<ol/);
  assert.match(source, /::-webkit-inner-spin-button/);
  assert.match(source, /appearance:\s*textfield/);
});

test("measure fields are required only while 'Me mido en casa' is selected", () => {
  assert.equal((deskDom.slice(deskDom.indexOf('id="mgrid"')).match(/<input[^>]*data-m=[^>]*required/g) || []).length, MEDIDAS);
  const off = strip(render().html);
  assert.equal((off.slice(off.indexOf('id="mgrid"'), off.indexOf('id="f-notes"')).match(/<input[^>]*required/g) || []).length, 0);
});
