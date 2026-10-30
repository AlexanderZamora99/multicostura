// Monthly calendar agenda: month grid, day states, slots, duration and busy hours.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";
const N = new Function(`${readFileSync(new URL("../js/datos.js", import.meta.url), "utf8")}; return NEGOCIO;`)();

// Fixed "today" through window.HOY_TEST: Wednesday 2026-11-25 at 09:00. The booking window is 14 days, up to Tuesday 2026-12-08.
// Demo bookings seeded in localStorage: 26 Nov 09:00 (60 min) and 27 Nov fully booked (08:00-12:00 and 14:00-18:00).
const SEED = JSON.stringify([
  { fecha: "2026-11-26", hora: "09:00", dur: 60 },
  { fecha: "2026-11-27", hora: "08:00", dur: 240 },
  { fecha: "2026-11-27", hora: "14:00", dur: 240 },
]);
const transform = h => h.replace('<script src="js/datos.js">',
  `<script>window.HOY_TEST="2026-11-25T09:00";localStorage.setItem("multicostura-demo-citas",${JSON.stringify(SEED)});</script><script src="js/datos.js">`);
const R = (inject = "") => render({ transform, inject }).html;

const TALLER = `document.querySelectorAll("#modes .mode")[0].click();`;
const DOMICILIO = `document.querySelectorAll("#modes .mode")[1].click();`;
const DIA = f => `document.querySelector('[data-fecha="${f}"]').click();`;
const dia = (html, f) => (html.match(new RegExp(`<button[^>]*data-fecha="${f}"[^>]*>`)) || [""])[0];
const region = (html, id) => { const i = html.indexOf(`id="${id}"`); return html.slice(i, i + 12000); };
const slotBtns = html => region(html, "slots").match(/<button[^>]*class="chip[^>]*>[^<]*<\/button>/g) || [];
const libres = html => slotBtns(html).filter(b => !/disabled/.test(b)).map(b => b.replace(/<[^>]*>/g, ""));

test("month grid shows the month in Spanish with Monday-first headers and one button per day", () => {
  const cal = region(R(TALLER), "days");
  assert.match(cal, /Noviembre 2026/);
  assert.match(cal, /<table[^>]*role="grid"/);
  const heads = [...cal.matchAll(/<th[^>]*>(?:<abbr[^>]*>)?([A-Z])(?:<\/abbr>)?<\/th>/g)].map(m => m[1]);
  assert.deepEqual(heads, ["L", "M", "X", "J", "V", "S", "D"]);
  assert.equal((cal.match(/<button[^>]*data-fecha="/g) || []).length, 30, "November has 30 days");
});

test("available, full, closed and past days are told apart with accessible names", () => {
  const h = R(TALLER);
  const ok = dia(h, "2026-11-26");
  assert.doesNotMatch(ok, /aria-disabled="true"/);
  assert.match(ok, /aria-label="jueves 26 de noviembre, disponible"/);
  assert.match(dia(h, "2026-11-27"), /aria-label="viernes 27 de noviembre, lleno"/);
  assert.match(dia(h, "2026-11-27"), /aria-disabled="true"/);
  assert.match(dia(h, "2026-11-29"), /aria-label="domingo 29 de noviembre, cerrado"/, "Sunday is closed in horario");
  assert.match(dia(h, "2026-11-29"), /aria-disabled="true"/);
  assert.match(dia(h, "2026-11-24"), /aria-disabled="true"/, "past day");
  assert.match(dia(h, "2026-11-25"), /aria-current="date"/, "today is marked");
});

test("previous month cannot go before the current month and next stops at the booking window", () => {
  const h = R(TALLER);
  assert.match(region(h, "days").match(/<button[^>]*class="cal-prev"[^>]*>/)[0], /disabled/);
  const h2 = R(`${TALLER} document.querySelector("#days .cal-next").click();`);
  const cal = region(h2, "days");
  assert.match(cal, /Diciembre 2026/);
  assert.doesNotMatch(cal.match(/<button[^>]*class="cal-prev"[^>]*>/)[0], /disabled/);
  assert.match(cal.match(/<button[^>]*class="cal-next"[^>]*>/)[0], /disabled/);
  assert.doesNotMatch(dia(h2, "2026-12-08"), /aria-disabled="true"/, "last bookable day");
  assert.match(dia(h2, "2026-12-09"), /aria-disabled="true"/, "beyond the window");
});

test("the month title is announced politely when navigating", () => {
  assert.match(region(R(TALLER), "days"), /<strong[^>]*class="cal-title"[^>]*aria-live="polite"/);
});

test("choosing a day marks it pressed and lists start times inside horario, busy ones disabled", () => {
  const h = R(`${TALLER} ${DIA("2026-11-26")}`);
  assert.match(dia(h, "2026-11-26"), /aria-pressed="true"/);
  const busy = slotBtns(h).filter(b => /aria-label="[^"]*ocupado"/.test(b));
  assert.equal(busy.length, 2, "9:00 and 9:30 overlap the 60-minute booking");
  busy.forEach(b => assert.match(b, /disabled/));
  const free = libres(h);
  assert.ok(free.includes("8:00 a. m.") && free.includes("10:00 a. m.") && free.includes("5:30 p. m."));
  assert.ok(!free.includes("9:00 a. m.") && !free.includes("12:00 p. m."), "no overlap, nothing past the lunch break");
});

test("duration grows with the number of people", () => {
  const dur = h => h.match(/id="dur"[^>]*>([^<]*)/)[1];
  assert.match(dur(R(`${TALLER} ${DIA("2026-11-26")}`)), /Duración: 30 minutos/);
  const plus = `document.getElementById("q-plus").click();`;
  assert.match(dur(R(`${plus}${plus}${TALLER} ${DIA("2026-11-26")}`)), /Duración: 70 minutos/);
});

test("longer appointments remove the start times that would overlap a busy hour", () => {
  const h = R(`document.getElementById("q-plus").click(); ${TALLER} ${DIA("2026-11-26")}`); // 50 min
  const free = libres(h);
  assert.ok(free.includes("8:00 a. m."), "8:00-8:50 ends before the 9:00 booking");
  assert.ok(!free.includes("8:30 a. m."), "8:30-9:20 overlaps it");
  assert.ok(free.includes("10:00 a. m."));
});

test("the home travel margin is respected: a start that touches the busy hour with the buffer is not offered", () => {
  const h = R(`document.getElementById("q-plus").click(); ${DOMICILIO} ${DIA("2026-11-26")}`); // 50 min + 30 min buffer
  const free = libres(h);
  assert.ok(!free.includes("8:00 a. m."), "8:00 + 50 + 30 runs past 9:00 (without the buffer it would fit)");
  assert.ok(free.includes("10:00 a. m."));
  assert.match(h.match(/id="dur"[^>]*>([^<]*)/)[1], /más el traslado/);
});

test("times already past today are not offered (now 09:00 plus the minimum notice)", () => {
  const h = R(`${TALLER} ${DIA("2026-11-25")}`);
  const todos = slotBtns(h).map(b => b.replace(/<[^>]*>/g, ""));
  assert.ok(!todos.includes("8:00 a. m.") && !todos.includes("10:30 a. m."), "before 11:00 is gone");
  assert.ok(todos.includes("11:00 a. m."));
});

test("arrow keys move the focus by day and week", () => {
  const h = R(`${TALLER} const b = document.querySelector('[data-fecha="2026-11-26"]'); b.focus();
    b.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));`);
  assert.match(h, /data-activo="2026-12-03"/);
});

test("the booking flow still completes in demo mode and the booked hour becomes busy", () => {
  const h = R(`${TALLER} ${DIA("2026-11-26")}
    document.querySelector("#slots .chip:not([disabled])").click();
    document.getElementById("f-name").value = "Camila Ruiz"; document.getElementById("f-phone").value = "3001234567";
    document.getElementById("form").requestSubmit();`);
  assert.doesNotMatch(h.match(/<div[^>]*id="done"[^>]*>/)[0], /hidden/);
  assert.match(h, /multicostura-demo-citas/);
});

test("casa mode hides the calendar and the catalog page does not throw", () => {
  const h = R(`document.querySelectorAll("#modes .mode")[2].click();`);
  assert.match(h.match(/<div[^>]*id="st-day"[^>]*>/)[0], /hidden/);
  const cat = render({ page: "catalogo.html" });
  assert.doesNotMatch(cat.stderr, /Uncaught|TypeError|ReferenceError/);
});

test("casa mode has its own collapsible measuring guide with the size chart, above the measurement fields", () => {
  const h = R(`document.querySelectorAll("#modes .mode")[2].click();`);
  const box = h.slice(h.indexOf('id="self-measures"'), h.indexOf('id="f-notes"'));
  const det = (box.match(/<details[\s\S]*?<\/details>/) || [""])[0];
  assert.ok(det, "details inside #self-measures");
  assert.doesNotMatch(det.match(/<details[^>]*>/)[0], /\sopen/, "collapsed by default");
  assert.match(det, /<summary[^>]*>\s*¿Cómo medirme en casa\?\s*<\/summary>/);
  assert.match(det, /<img[^>]*src="img\/tabla-medidas\.jpg"[^>]*loading="lazy"/);
  const items = (det.match(/<li>[\s\S]*?<\/li>/g) || []).map(x => x.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|"));
  assert.equal(items.length, N.medidas.length, "one instruction per measurement field");
  N.medidas.forEach(([t, d], i) => {
    assert.ok((det.match(/<li>[\s\S]*?<\/li>/g) || [])[i].includes(`<strong>${t}</strong>`), t);
    assert.ok(items[i].includes(d), d);
  });
  assert.match(det, /<ol[\s>]/);
  assert.doesNotMatch(det, /<svg|stroke-dasharray/);
  assert.ok(box.indexOf("<details") < box.indexOf('id="mgrid"'), "guide comes before the inputs");
  assert.doesNotMatch(box, /guía más abajo/);
  assert.match(box, /Todo en centímetros/);
});

test("casa mode keeps every measurement field", () => {
  const h = R(`document.querySelectorAll("#modes .mode")[2].click();`);
  const inputs = h.slice(h.indexOf('id="mgrid"'), h.indexOf('id="f-notes"')).match(/<input[^>]*data-m="[^"]+"/g) || [];
  assert.equal(inputs.length, 7);
});

test("casa mode: the seven measurement labels are bold and a visible link leads to the size chart", () => {
  const h = R(`document.querySelectorAll("#modes .mode")[2].click();`);
  const grid = h.slice(h.indexOf('id="mgrid"'), h.indexOf('id="f-notes"'));
  const labels = grid.match(/<label>[\s\S]*?<\/label>/g) || [];
  assert.equal(labels.length, 7);
  N.medidas.forEach(([t], i) => assert.match(labels[i], new RegExp(`<label><strong>${t} \\(cm\\)</strong><input`)));
  const box = h.slice(h.indexOf('id="self-measures"'), h.indexOf('id="f-notes"'));
  assert.match(box, /<a[^>]*href="#guia-tallas"[^>]*>[^<]*¿No sabes cómo medirte\? Ver tabla de medidas/);
  assert.match(h, /id="guia-tallas"/, "the target exists");
});
