import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const section = (d, id) => { const i = d.indexOf(`id="${id}"`); return d.slice(i, d.indexOf("</section>", i)); };
const PIX = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E";
const attr = (h, k) => (h.match(new RegExp(`data-${k}="([^"]*)"`)) || [])[1];

// Finish pass: one probe per width, read back through data-* attributes on <body>.
const probe = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), r = el => el.getBoundingClientRect(), set = (k, v) => b.setAttribute("data-" + k, v);
  const cols = [...document.querySelectorAll("#cols .col-tile")];
  set("col-tops", cols.map(c => Math.round(r(c).top)).join(","));
  set("col-h", Math.round(Math.max(...cols.map(c => r(c).height))));
  set("col-ico", cols.every(c => c.querySelector("svg.col-ico")));
  const mid = r(document.documentElement).width / 2, span = els => { const rs = els.map(r); return (Math.min(...rs.map(x => x.left)) + Math.max(...rs.map(x => x.right))) / 2; };
  set("chips-off", Math.abs(span([...document.querySelectorAll("#profs button")]) - mid) < 3 ? "centered" : "off:" + span([...document.querySelectorAll("#profs button")]));
  set("stock-off", Math.abs(span([document.getElementById("stock-btn")]) - mid) < 3 ? "centered" : "off");
  const view = document.querySelector(".ann-view");
  set("ann-mask", view ? (cs(view).maskImage || cs(view).webkitMaskImage) : "none");
  set("ann-gap", view ? Math.round(document.getElementById("ann-pp").getBoundingClientRect().left - r(view).right) : "-1");
  set("hero-pos", cs(document.querySelector(".slide img")).objectPosition);
  set("demo-hidden", document.getElementById("demo-note").classList.contains("hidden"));
  set("gift", document.getElementById("g-names").textContent);
  document.getElementById("g-to").value = "Ana"; document.getElementById("g-to").dispatchEvent(new Event("input"));
  set("gift-half", document.getElementById("g-names").textContent);
  document.getElementById("g-from").value = "Mamá"; document.getElementById("g-from").dispatchEvent(new Event("input"));
  set("gift-full", document.getElementById("g-names").textContent);
  const box = el => { const s = cs(el); return [s.borderTopWidth, s.borderTopColor, s.borderTopLeftRadius, Math.round(r(el).height)].join("|"); };
  set("date-box", box(document.getElementById("b-date"))); set("text-box", box(document.getElementById("b-city")));
  set("check-accent", [...document.querySelectorAll('input[type="checkbox"]')].map(x => cs(x).accentColor).join(";"));
  // quick view: the card's selected color is carried in; FABs hide while it is open
  const card = document.querySelector("#models .model"), sw = card.querySelectorAll(".swatches button")[1];
  sw.click();
  set("fab-before", cs(document.getElementById("wa-float")).display + "/" + cs(document.getElementById("chat-btn")).display);
  card.querySelector(".qv").click();
  set("qv-color", document.getElementById("qv-colname").textContent + "=" + sw.dataset.color);
  set("fab-open", cs(document.getElementById("wa-float")).display + "/" + cs(document.getElementById("chat-btn")).display);
  set("qv-shadow", cs(document.querySelector(".qv-actions")).boxShadow);
  document.getElementById("qv-close").click();
  set("fab-after", cs(document.getElementById("wa-float")).display + "/" + cs(document.getElementById("chat-btn")).display);
})();
`;
const desk = render({ inject: probe }).html;
const phone = render({ width: 390, height: 900, inject: probe }).html;

test("recommended grid shows 4 cards without photos and the full 8 once a photo loads", () => {
  assert.equal(count(section(strip(render().html), "reco"), '<article class="model"'), 4);
  const withPhotos = `NEGOCIO.recomendados.forEach(id => (NEGOCIO.modelos.find(m => m.id === id).foto = "${PIX}")); renderRecomendados();`;
  assert.equal(count(section(strip(render({ inject: withPhotos }).html), "reco"), '<article class="model"'), 8);
  assert.match(section(strip(render().html), "reco"), /Ver todo el catálogo/);
});

test("collection tiles without a photo are compact icon tiles in one row, stacked on phones", () => {
  assert.equal(new Set(attr(desk, "col-tops").split(",")).size, 1, "one row on desktop");
  assert.ok(Number(attr(desk, "col-h")) <= 220, `no empty image area (${attr(desk, "col-h")}px)`);
  assert.equal(attr(desk, "col-ico"), "true");
  assert.equal(new Set(attr(phone, "col-tops").split(",")).size, 3, "stacked on phones");
  const withImg = strip(render({ inject: `NEGOCIO.colecciones[0].img = "${PIX}"; renderColecciones();` }).html);
  assert.match(section(withImg, "colecciones"), /class="col-tile has-photo"/);
});

test("demo note is hidden for customers and shown only with ?dev", () => {
  assert.equal(attr(desk, "demo-hidden"), "true");
  const dev = render({ inject: `history.replaceState(null, "", "?dev"); mostrarNotaDemo(); document.body.setAttribute("data-dev", !document.getElementById("demo-note").classList.contains("hidden"));` }).html;
  assert.equal(attr(dev, "dev"), "true");
});

test("gift preview asks for both names instead of showing dots", () => {
  assert.equal(attr(desk, "gift"), "Escribe para quién es y de parte de quién");
  assert.equal(attr(desk, "gift-half"), "Escribe para quién es y de parte de quién");
  assert.equal(attr(desk, "gift-full"), "Para Ana, de Mamá");
});

test("hero image keeps faces: object-position sits lower than the top", () => {
  assert.match(attr(desk, "hero-pos"), /^50% (2[5-9]|3\d|4\d)%$/);
});

test("marquee fades at both edges and stops before the pause button", () => {
  assert.match(attr(desk, "ann-mask"), /linear-gradient/);
  assert.ok(Number(attr(desk, "ann-gap")) >= 8, `gap to pause button ${attr(desk, "ann-gap")}`);
});

test("catalog chips and the store-stock button are centred under the title", () => {
  assert.equal(attr(desk, "chips-off"), "centered");
  assert.equal(attr(desk, "stock-off"), "centered");
  assert.equal(attr(phone, "stock-off"), "centered");
});

test("quick view opens on the card's selected color, hides the floating buttons and shows a scroll shadow", () => {
  const [shown, expected] = attr(desk, "qv-color").split("=");
  assert.equal(shown, expected);
  assert.equal(attr(desk, "fab-before"), "grid/grid");
  assert.equal(attr(desk, "fab-open"), "none/none");
  assert.equal(attr(desk, "fab-after"), "grid/grid");
  assert.notEqual(attr(desk, "qv-shadow"), "none");
});

test("browser surfaces: fuchsia checkboxes and a date input that matches the text inputs", () => {
  assert.ok(attr(desk, "check-accent").split(";").every(c => c === "rgb(214, 36, 127)"), attr(desk, "check-accent"));
  assert.equal(attr(desk, "date-box"), attr(desk, "text-box"));
});
