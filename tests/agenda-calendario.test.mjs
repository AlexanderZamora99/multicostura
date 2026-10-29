import { test } from "node:test";
import assert from "node:assert/strict";
import { render, source } from "./render.mjs";

// "Hoy" fijo con window.HOY_TEST (miércoles 25 nov 2026); ventana de 14 días: hasta el martes 8 dic.
// Citas sembradas en el modo demostración: el 26 nov 9:00 (60 min) y el 27 nov lleno todo el día.
const SEMILLA = JSON.stringify([
  { fecha: "2026-11-26", hora: "09:00", dur: 60 },
  { fecha: "2026-11-27", hora: "08:00", dur: 240 },
  { fecha: "2026-11-27", hora: "14:00", dur: 240 },
]);
const transform = h => h.replace('<script src="js/datos.js">',
  `<script>window.HOY_TEST="2026-11-25";localStorage.setItem("multicostura-demo-citas",${JSON.stringify(SEMILLA)});</script><script src="js/datos.js">`);
const R = (inject = "", width = 1366) => render({ transform, inject, width }).html;

const CLICK_TALLER = `document.querySelectorAll("#modes .mode")[0].click();`;
const dia = (html, f) => (html.match(new RegExp(`<button[^>]*data-fecha="${f}"[^>]*>`)) || [""])[0];
const seccion = (html, id) => { const i = html.indexOf(`id="${id}"`); return html.slice(i, i + 9000); };

test("calendar shows the month title in Spanish and Monday-first weekday headers", () => {
  const cal = seccion(R(CLICK_TALLER), "days");
  assert.match(cal, /Noviembre 2026/);
  assert.match(cal, /<table[^>]*role="grid"/);
  const heads = [...cal.matchAll(/<th[^>]*>(?:<abbr[^>]*>)?([A-Z])(?:<\/abbr>)?<\/th>/g)].map(m => m[1]);
  assert.deepEqual(heads, ["L", "M", "X", "J", "V", "S", "D"]);
});

test("bookable, closed, past and beyond-window days are told apart", () => {
  const h = R(CLICK_TALLER);
  const ok = dia(h, "2026-11-26");
  assert.doesNotMatch(ok, /aria-disabled="true"/);
  assert.match(ok, /aria-label="jueves 26 de noviembre, disponible"/);
  assert.match(dia(h, "2026-11-29"), /aria-disabled="true"/, "domingo cerrado");
  assert.match(dia(h, "2026-11-24"), /aria-disabled="true"/, "pasado");
  assert.match(dia(h, "2026-11-25"), /aria-current="date"/, "hoy marcado");
});

test("beyond the booking window is disabled and next month stops at the last bookable day", () => {
  const h = R(`${CLICK_TALLER} document.querySelector("#days .cal-next").click();`);
  const cal = seccion(h, "days");
  assert.match(cal, /Diciembre 2026/);
  assert.doesNotMatch(dia(h, "2026-12-08"), /aria-disabled="true"/);
  assert.match(dia(h, "2026-12-09"), /aria-disabled="true"/);
  assert.match(cal.match(/<button[^>]*class="cal-next"[^>]*>/)[0], /disabled/);
});

test("prev is disabled on the current month and enabled after going forward", () => {
  const h = R(CLICK_TALLER);
  assert.match(seccion(h, "days").match(/<button[^>]*class="cal-prev"[^>]*>/)[0], /disabled/);
  const h2 = R(`${CLICK_TALLER} document.querySelector("#days .cal-next").click();`);
  assert.doesNotMatch(seccion(h2, "days").match(/<button[^>]*class="cal-prev"[^>]*>/)[0], /disabled/);
});

test("a fully booked day is disabled and labelled Lleno", () => {
  const h = R(CLICK_TALLER);
  const d = dia(h, "2026-11-27");
  assert.match(d, /aria-disabled="true"/);
  assert.match(d, /aria-label="viernes 27 de noviembre, lleno"/);
  assert.match(seccion(h, "days"), /data-fecha="2026-11-27"[^>]*>[\s\S]{0,120}Lleno/);
});

test("choosing a day fills the hours, busy ones disabled with ocupado, plus the duration line", () => {
  const h = R(`${CLICK_TALLER} document.querySelector('[data-fecha="2026-11-26"]').click();`);
  const slots = seccion(h, "slots");
  assert.match(dia(h, "2026-11-26"), /aria-pressed="true"/);
  const busy = slots.match(/<button[^>]*aria-label="[^"]*ocupado"[^>]*>/g) || [];
  assert.equal(busy.length, 2, "9:00 y 9:30 ocupadas");
  busy.forEach(b => assert.match(b, /disabled/));
  assert.match(slots, /<button[^>]*aria-label="9:00 a\. m\., ocupado"/);
  assert.match(slots, /<button(?![^>]*disabled)[^>]*>10:00 a\. m\.<\/button>/);
  assert.match(h, /Duración: 30 minutos/);
  assert.doesNotMatch(h.match(/id="dur"[^>]*>[^<]*/)[0], /traslado/);
});

test("domicilio adds the travel note to the duration", () => {
  const h = R(`document.querySelectorAll("#modes .mode")[1].click(); document.querySelector('[data-fecha="2026-11-26"]').click();`);
  assert.match(h.match(/id="dur"[^>]*>[^<]*/)[0], /Duración: 30 minutos más el traslado/);
});

test("arrow keys move the focus by day and week", () => {
  const h = R(`${CLICK_TALLER} const b = document.querySelector('[data-fecha="2026-11-26"]'); b.focus();
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));`);
  assert.match(h, /data-activo="2026-12-03"/);
});

test("the booking flow still completes in demo mode", () => {
  const h = R(`${CLICK_TALLER} document.querySelector('[data-fecha="2026-11-26"]').click();
    document.querySelector("#slots button:not([disabled])").click();
    document.getElementById("f-name").value = "Camila Ruiz"; document.getElementById("f-phone").value = "3001234567";
    document.getElementById("form").requestSubmit();`);
  assert.doesNotMatch(h.match(/<div[^>]*id="done"[^>]*>/)[0], /hidden/);
});

test("markup keeps the ids other tests and styles rely on", () => {
  const h = R();
  for (const id of ["flow", "modes", "st-day", "st-hour", "st-data", "days", "slots", "dur", "form", "f-submit", "mgrid"]) assert.ok(h.includes(`id="${id}"`), id);
  assert.match(source(), /HOY_TEST/);
});
