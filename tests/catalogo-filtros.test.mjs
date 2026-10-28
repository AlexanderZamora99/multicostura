// Catálogo con menú lateral de filtros: categoría, forma de compra, talla, color, orden y cajón en celular.
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const attr = (html, k) => { const m = html.match(new RegExp(`data-${k}="([^"]*)"`)); return m ? m[1] : undefined; };

const probe = `
(() => {
  const b = document.body, set = (k, v) => b.setAttribute("data-" + k, v), $ = id => document.getElementById(id);
  const step = (k, f) => { try { set(k, f()); } catch (e) { set(k, "ERR:" + e.message); } };
  const fire = (el, ev = "change") => el.dispatchEvent(new Event(ev, { bubbles: true }));
  const radio = (name, value) => { const r = document.querySelector('#filtros input[name="' + name + '"][value="' + value + '"]'); r.checked = true; fire(r); };
  const ids = () => [...document.querySelectorAll("#models .model")].map(c => c.dataset.id);
  const nmod = () => parseInt($("res-cuenta").textContent, 10);
  const tot = NEGOCIO.modelos.length;
  const pr = (m, tipo) => { if (m.precio == null) return null; const t = NEGOCIO.tipos.find(x => x.id === tipo); return t.precio && !m.precioFijo ? t.precio : m.precio; };

  step("fieldsets", () => document.querySelectorAll("#filtros fieldset").length);
  step("legends", () => [...document.querySelectorAll("#filtros legend")].map(l => l.firstChild.textContent.trim()).join("|"));
  step("counts-ok", () => {
    const rs = [...document.querySelectorAll('#profs input[type="radio"]')];
    if (rs.length < NEGOCIO.categorias.length) return "few:" + rs.length;
    return rs.every(r => {
      const exp = r.value === "Todos" ? tot : NEGOCIO.modelos.filter(m => m.cat.includes(r.value)).length;
      return r.closest("label").querySelector(".cuenta").textContent.trim() === String(exp);
    });
  });
  step("layout", () => { const s = $("panel-filtros").getBoundingClientRect(), g = $("models").getBoundingClientRect(); return s.left < g.left && s.right <= g.left && s.width > 200; });
  step("total", () => nmod() === tot && ids().length === tot);

  // forma de compra: el precio de la tarjeta cambia
  radio("forma", "medida");
  step("medida-price", () => { const p = document.querySelector('#models .model[data-id="kaill"] .price').textContent; return p.includes("185.000") && /a tu medida/i.test(p); });
  step("fijo-price", () => !/a tu medida/i.test(document.querySelector('#models .model[data-id="pantalon"] .price').textContent));
  radio("forma", "tienda");
  step("tienda-label", () => /listo en tienda/i.test(document.querySelector('#models .model[data-id="kaill"] .price').textContent));
  radio("forma", "pedido");

  // vista rápida hereda forma y talla
  document.querySelector('#f-talla button[data-talla="M"]').click();
  step("talla-pressed", () => document.querySelector('#f-talla button[data-talla="M"]').getAttribute("aria-pressed"));
  document.querySelector('#models .model[data-id="kaill"] .qv').click();
  step("qv-tipo", () => document.querySelector('#qv-tipos [aria-pressed="true"]').dataset.tipo);
  step("qv-talla", () => decodeURIComponent($("qv-wa").href).includes("Talla: M"));
  $("qv-close").click();

  // orden por precio de la forma elegida, sin precio al final
  $("orden").value = "asc"; fire($("orden"));
  step("sort-asc", () => { const v = ids().map(id => pr(NEGOCIO.modelos.find(m => m.id === id), "pedido")); const k = v.findIndex(x => x == null); const con = k < 0 ? v : v.slice(0, k); return con.every((x, i) => i === 0 || con[i - 1] <= x) && (k < 0 || v.slice(k).every(x => x == null)) && k > 0; });
  step("sort-first", () => pr(NEGOCIO.modelos.find(m => m.id === ids()[0]), "pedido") === Math.min(...NEGOCIO.modelos.map(m => pr(m, "pedido")).filter(x => x != null)));
  $("orden").value = "desc"; fire($("orden"));
  step("sort-desc", () => { const v = ids().map(id => pr(NEGOCIO.modelos.find(m => m.id === id), "pedido")).filter(x => x != null); return v.every((x, i) => i === 0 || v[i - 1] >= x); });
  $("orden").value = ""; fire($("orden"));
  step("sort-default", () => ids().join() === NEGOCIO.modelos.map(m => m.id).join());

  // categoría
  radio("cat", "Línea blancos");
  step("cat-n", () => nmod() === NEGOCIO.modelos.filter(m => m.cat.includes("Línea blancos")).length && nmod() < tot && ids().length === nmod());
  radio("cat", "Todos");

  // color: solo modelos con foto en ese color, y esa foto se muestra
  const col = Object.keys(NEGOCIO.colores).find(c => { const n = NEGOCIO.modelos.filter(m => m.fotos && m.fotos[c]).length; return n > 0 && n < tot; });
  set("color", col);
  document.querySelector('#f-colores button[data-color="' + col + '"]').click();
  step("color-set", () => { const exp = NEGOCIO.modelos.filter(m => m.fotos && m.fotos[col]).map(m => m.id).join(); return ids().join() === exp && nmod() === ids().length; });
  step("color-photo", () => [...document.querySelectorAll("#models .model")].every(c => { const m = NEGOCIO.modelos.find(x => x.id === c.dataset.id); return c.querySelector(".pic img").getAttribute("src") === m.fotos[col] && c.querySelector('.swatches button.on').dataset.color === col; }));
  step("color-name", () => $("f-color-n").textContent.includes(col));
  step("badge", () => $("abrir-filtros").textContent.trim());

  // quitar filtros
  radio("forma", "medida");
  document.querySelector('#filtros button[type="reset"]').click();
  setTimeout(() => {
    set("reset", nmod() === tot && ids().length === tot && document.querySelector('#filtros input[name="cat"]:checked').value === "Todos" && !document.querySelector('#filtros input[name="forma"]:checked') && !document.querySelector('#f-colores [aria-pressed="true"]'));
  }, 0);
})();
`;

const mobile = `
(() => {
  const b = document.body, set = (k, v) => b.setAttribute("data-" + k, v), $ = id => document.getElementById(id), p = $("panel-filtros");
  const vis = () => getComputedStyle(p).visibility, r = () => p.getBoundingClientRect();
  set("closed-vis", vis()); set("closed-right", Math.round(r().right));
  set("btn-visible", getComputedStyle($("abrir-filtros")).display !== "none");
  $("abrir-filtros").focus(); $("abrir-filtros").click();
  set("open-class", p.classList.contains("abierto")); set("expanded", $("abrir-filtros").getAttribute("aria-expanded"));
  set("overlay", !!document.querySelector(".velo")); set("focus-in", p.contains(document.activeElement));
  set("footer", $("ver-resultados").textContent.trim());
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  set("esc-closed", !p.classList.contains("abierto")); set("overlay-gone", !document.querySelector(".velo"));
  set("focus-back", document.activeElement === $("abrir-filtros"));
  $("abrir-filtros").click(); $("cerrar-filtros").click();
  set("x-closed", !p.classList.contains("abierto"));
  set("cols", getComputedStyle($("models")).gridTemplateColumns.split(" ").length);
})();
`;

const desk = render({ inject: probe }).html;
const phone = render({ width: 500, height: 900, inject: mobile }).html;

test("sidebar has category, purchase form, size and color fieldsets and sits left of the grid", () => {
  assert.equal(attr(desk, "fieldsets"), "4");
  assert.equal(attr(desk, "legends"), "Categoría|Forma de compra|Talla|Color");
  assert.equal(attr(desk, "layout"), "true");
});

test("category counts are computed from the data and the total matches the grid", () => {
  assert.equal(attr(desk, "counts-ok"), "true");
  assert.equal(attr(desk, "total"), "true");
});

test("choosing a purchase form changes the card price and labels it", () => {
  assert.equal(attr(desk, "medida-price"), "true");
  assert.equal(attr(desk, "fijo-price"), "true");
  assert.equal(attr(desk, "tienda-label"), "true");
});

test("size and purchase form carry into the quick view", () => {
  assert.equal(attr(desk, "talla-pressed"), "true");
  assert.equal(attr(desk, "qv-tipo"), "pedido");
  assert.equal(attr(desk, "qv-talla"), "true");
});

test("sorting by price uses the selected form, puts missing prices last and can be undone", () => {
  assert.equal(attr(desk, "sort-asc"), "true");
  assert.equal(attr(desk, "sort-first"), "true");
  assert.equal(attr(desk, "sort-desc"), "true");
  assert.equal(attr(desk, "sort-default"), "true");
});

test("choosing a category reduces the result count", () => {
  assert.equal(attr(desk, "cat-n"), "true");
});

test("choosing a color keeps only models with a photo in that color and shows it", () => {
  assert.equal(attr(desk, "color-set"), "true");
  assert.equal(attr(desk, "color-photo"), "true");
  assert.equal(attr(desk, "color-name"), "true");
  assert.match(attr(desk, "badge"), /^Filtros \(\d\)$/);
});

test("Quitar filtros restores the full catalog", () => {
  assert.equal(attr(desk, "reset"), "true");
});

test("on phones the filters are an off-canvas drawer opened from a Filtros button", () => {
  assert.equal(attr(phone, "closed-vis"), "hidden");
  assert.ok(Number(attr(phone, "closed-right")) <= 0);
  assert.equal(attr(phone, "btn-visible"), "true");
  assert.equal(attr(phone, "open-class"), "true");
  assert.equal(attr(phone, "expanded"), "true");
  assert.equal(attr(phone, "overlay"), "true");
  assert.equal(attr(phone, "focus-in"), "true");
  assert.match(attr(phone, "footer"), /^Ver \d+ modelos$/);
  assert.equal(attr(phone, "esc-closed"), "true");
  assert.equal(attr(phone, "overlay-gone"), "true");
  assert.equal(attr(phone, "focus-back"), "true");
  assert.equal(attr(phone, "x-closed"), "true");
  assert.equal(attr(phone, "cols"), "2");
});
