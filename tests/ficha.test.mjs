// Product dialog (#pd) layout: three accordion steps (one open at a time) and a sticky total + WhatsApp footer.
import test from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const probe = `
  const wait = ms => new Promise(r => setTimeout(r, ms)), g = id => document.getElementById(id);
  const teclear = (id, v) => { const el = g(id); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); };
  const btns = () => [...document.querySelectorAll("#pd .pd-paso:not([hidden]) .pd-paso-btn")];
  const abiertos = () => btns().map(b => b.getAttribute("aria-expanded") === "true");
  const txt = i => btns()[i].textContent.replace(/\\s+/g, " ").trim();
  const dentro = id => { const r = g(id).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 0; };
  (async () => {
    const out = {};
    await wait(200);
    document.querySelector('.model[data-id="kaill"] .pic').click(); await wait(150);
    out.n = btns().length; out.ini = abiertos(); out.res1 = txt(0);
    out.controls = btns().every(b => { const p = document.getElementById(b.getAttribute("aria-controls")); return p && p.hidden === (b.getAttribute("aria-expanded") !== "true"); });
    const foot = g("pd-wa").closest(".pd-foot");
    out.foot = !!foot; out.footPos = foot ? getComputedStyle(foot).position : ""; out.totalInFoot = !!(foot && foot.contains(g("pd-total")));
    out.waVisible = dentro("pd-wa"); out.totalVisible = dentro("pd-total");
    out.feats = !!g("pd-feats").closest(".pd-gal"); out.aviso = !!document.querySelector("#pd .pd-aviso[role=note]:not(#pd-bord-precio)")?.closest(".pd-gal");
    btns()[1].click(); out.tras2 = abiertos(); out.bodyOpen2 = !g("pd-name").closest(".pd-paso-body").hidden;
    teclear("pd-name", "Dra. Camila Ruiz"); teclear("pd-role", "Odontóloga");
    out.focoNombre = document.activeElement === g("pd") || document.activeElement === document.body ? "n/a" : document.activeElement.id;
    btns()[2].click(); out.tras3 = abiertos(); out.res2 = txt(1);
    g("pd-minus").click(); g("pd-plus").click(); g("pd-plus").click();
    [...g("pd-medidas").querySelectorAll("button")][0].click(); out.res3 = txt(2);
    teclear("pd-name", ""); teclear("pd-role", ""); out.res2vacio = txt(1);
    btns()[0].click(); out.tras1 = abiertos();
    g("pd-close").click(); await wait(50);
    document.querySelector('.model[data-id="gorro"] .pic').click(); await wait(150);
    out.gorroN = btns().length; out.gorroIni = abiertos(); out.gorroWa = dentro("pd-wa");
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe6">' + JSON.stringify(out) + '</pre>');
  })();
`;
const run = (width, height) => JSON.parse((render({ page: "catalogo.html", width, height, inject: probe }).html.match(/<pre id="probe6">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
const desk = run(1366, 900), mob = run(390, 844);

for (const [nombre, p] of [["desktop", desk], ["mobile", mob]]) {
  test(`product dialog accordion (${nombre}): three steps, only one expanded at a time`, () => {
    assert.equal(p.n, 3);
    assert.deepEqual(p.ini, [true, false, false]);
    assert.ok(p.controls, "aria-controls panels follow aria-expanded");
    assert.deepEqual(p.tras2, [false, true, false]);
    assert.equal(p.bodyOpen2, true);
    assert.deepEqual(p.tras3, [false, false, true]);
    assert.deepEqual(p.tras1, [true, false, false]);
  });

  test(`product dialog accordion (${nombre}): collapsed steps summarise the choice`, () => {
    assert.match(p.res1, /Azul rey/);
    assert.match(p.res1, /Diseño bajo pedido/);
    assert.match(p.res2, /Dra\. Camila Ruiz/);
    assert.match(p.res2, /Odontóloga/);
    assert.match(p.res2, /hilo blanco/i);
    assert.match(p.res2vacio, /Sin bordado/);
    assert.match(p.res3, /3 uniformes/);
  });

  test(`product dialog sticky footer (${nombre}): total and WhatsApp are always in view`, () => {
    assert.ok(p.foot, "#pd-wa inside .pd-foot");
    assert.ok(p.totalInFoot, "#pd-total inside .pd-foot");
    assert.match(p.footPos, /sticky|fixed/);
    assert.ok(p.waVisible, "#pd-wa in the viewport on open");
    assert.ok(p.totalVisible, "#pd-total in the viewport on open");
    assert.ok(p.gorroWa, "also for accessories");
  });

  test(`product dialog layout (${nombre}): features and colour notice live under the gallery, accessories skip embroidery`, () => {
    assert.ok(p.feats);
    assert.ok(p.aviso);
    assert.equal(p.gorroN, 2);
    assert.deepEqual(p.gorroIni, [true, false]);
  });
}
