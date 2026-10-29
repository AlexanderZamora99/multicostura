import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

// Mide el diseno a lo ancho de la pantalla: contenedor fluido, tarjetas por fila y sin desborde en celular.
// Espera a que carguen las tarjetas recomendadas 5 a 8 (llegan tras precargar las fotos).
const probe = `
setTimeout(() => {
  const d = document.body, set = (k, v) => d.setAttribute("data-p-" + k, v);
  const w = document.querySelector("#reco .wrap");
  if (w) {
    const r = w.getBoundingClientRect(); set("reco-w", Math.round(r.width)); set("reco-x", Math.round(r.left));
    const cards = [...document.querySelectorAll("#recomendados .model")];
    set("reco-n", cards.length);
    set("reco-fila", cards.filter(c => c.offsetTop === cards[0].offsetTop).length);
  }
  const nav = document.querySelector("header .wrap");
  if (nav) set("nav-x", Math.round(nav.getBoundingClientRect().left));
  const m = [...document.querySelectorAll("#models .model")];
  if (m.length) set("cat-fila", m.filter(c => c.offsetTop === m[0].offsetTop).length);
  set("scroll-w", document.documentElement.scrollWidth);
}, 2500);
`;
const get = (html, k) => Number(html.match(new RegExp(`data-p-${k}="([^"]*)"`))[1]);

test("1366: el contenedor usa el ancho y la cabecera se alinea", () => {
  const h = render({ width: 1366, inject: probe }).html;
  assert.ok(get(h, "reco-w") >= 1200, `ancho ${get(h, "reco-w")}`);
  assert.ok(Math.abs(get(h, "nav-x") - get(h, "reco-x")) <= 2);
  assert.equal(get(h, "reco-fila"), 4);
});

test("1920: contenedor 1500-1640 y 5 recomendados por fila", () => {
  const h = render({ width: 1920, height: 1000, inject: probe }).html;
  const w = get(h, "reco-w");
  assert.ok(w >= 1500 && w <= 1640, `ancho ${w}`);
  assert.ok(get(h, "reco-n") >= 5);
  assert.equal(get(h, "reco-fila"), 5);
});

test("catalogo 1366: al menos 3 tarjetas por fila junto al menu lateral", () => {
  const h = render({ page: "catalogo.html", width: 1366, inject: probe }).html;
  assert.ok(get(h, "cat-fila") >= 3, `fila ${get(h, "cat-fila")}`);
});

test("500: sin desborde horizontal", () => {
  for (const page of ["index.html", "catalogo.html"]) {
    const h = render({ page, width: 500, inject: probe }).html;
    assert.ok(get(h, "scroll-w") <= 500, `${page} ${get(h, "scroll-w")}`);
  }
});
