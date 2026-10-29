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
  const mid = r(document.documentElement).width / 2, span = els => { const rs = els.map(r); return (Math.min(...rs.map(x => x.left)) + Math.max(...rs.map(x => x.right))) / 2; };
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
})();
`;
const probeCat = `
(() => {
  const b = document.body, cs = el => getComputedStyle(el), r = el => el.getBoundingClientRect(), set = (k, v) => b.setAttribute("data-" + k, v);
  const side = r(document.getElementById("panel-filtros")), grid = r(document.getElementById("models")), banner = r(document.getElementById("stock")), wrap = r(document.querySelector("#modelos .wrap"));
  set("side-left", side.right <= grid.left && side.left < grid.left && side.width >= 240 && side.width <= 260);
  set("banner-full", Math.abs(banner.width - wrap.width) < 2);
  set("banner-above", banner.bottom <= grid.top);
  set("drawer", cs(document.getElementById("panel-filtros")).visibility + "/" + (side.right <= 0 ? "off" : "on"));
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
const deskCat = render({ page: "catalogo.html", inject: probeCat }).html;
const phoneCat = render({ page: "catalogo.html", width: 390, height: 900, inject: probeCat }).html;

test("recommended grid shows 4 cards without photos and the full 8 once a photo loads", () => {
  const sinFotos = `NEGOCIO.modelos.forEach(m => { m.foto = "img/no-existe.webp"; delete m.fotos; }); renderRecomendados();`;
  assert.equal(count(section(strip(render({ inject: sinFotos }).html), "reco"), '<article class="model"'), 4);
  const withPhotos = `NEGOCIO.recomendados.forEach(id => (NEGOCIO.modelos.find(m => m.id === id).foto = "${PIX}")); renderRecomendados();`;
  assert.equal(count(section(strip(render({ inject: withPhotos }).html), "reco"), '<article class="model"'), 8);
  assert.match(section(strip(render().html), "reco"), /Ver todo el catálogo/);
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

test("catalog: filter sidebar sits left of the grid under a full-width store banner; on phones it is an off-canvas drawer", () => {
  assert.equal(attr(deskCat, "side-left"), "true");
  assert.equal(attr(deskCat, "banner-full"), "true");
  assert.equal(attr(deskCat, "banner-above"), "true");
  assert.equal(attr(phoneCat, "banner-full"), "true");
  assert.equal(attr(phoneCat, "drawer"), "hidden/off");
});

test("quick view opens on the card's selected color, hides the floating buttons and shows a scroll shadow", () => {
  const [shown, expected] = attr(deskCat, "qv-color").split("=");
  assert.equal(shown, expected);
  assert.equal(attr(deskCat, "fab-before"), "grid/grid");
  assert.equal(attr(deskCat, "fab-open"), "none/none");
  assert.equal(attr(deskCat, "fab-after"), "grid/grid");
  assert.notEqual(attr(deskCat, "qv-shadow"), "none");
});

test("browser surfaces: fuchsia checkboxes and a date input that matches the text inputs", () => {
  assert.ok(attr(desk, "check-accent").split(";").every(c => c === "rgb(214, 36, 127)"), attr(desk, "check-accent"));
  assert.equal(attr(desk, "date-box"), attr(desk, "text-box"));
});
