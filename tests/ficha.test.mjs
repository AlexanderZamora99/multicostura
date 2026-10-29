// Product dialog: inline embroidery (no redirect to the designer) and the "Me mido en casa" helpers (steps + size calculator).
// Same behavior on index.html and catalogo.html. One headless render per page runs every scenario and prints JSON into #out.
import test from "node:test";
import assert from "node:assert/strict";
import { render } from "./render.mjs";

const SCRIPT = `(() => { const out = {}; try {
  const $ = id => document.getElementById(id), num = s => parseInt(String(s).replace(/\\D/g, ""), 10);
  const tipea = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
  const medidas = v => $("pd-medidas").querySelector('[data-v="' + v + '"]').click();
  const tallaDe = (prenda, med) => NEGOCIO.tallas.orden.find(t => Object.entries(med).every(([k, v]) => v <= NEGOCIO.tallas[prenda][t][k])) || null;
  const calcula = (b, c, k) => { tipea("pd-busto", b); tipea("pd-cintura", c); tipea("pd-cadera", k);
    return { texto: $("pd-talla-res").textContent, blusa: tallaDe("blusa", { busto: b, cintura: c, cadera: k }), pantalon: tallaDe("pantalon", { cintura: c, cadera: k }), wa: decodeURIComponent($("pd-wa").href) }; };
  const m = NEGOCIO.modelos.find(x => !x.precioFijo && !x.accesorio);
  abrirProducto(m, null, null);
  const dlg = $("pd"), pos = id => [...dlg.querySelectorAll("*")].indexOf($(id));
  out.orden = { color: pos("pd-colors"), bord: pos("pd-bord-box"), tipo: pos("pd-tipo-box"), med: pos("pd-medidas") };
  out.hrefs = [...dlg.querySelectorAll("[href]")].map(a => a.getAttribute("href"));
  out.textos = [...dlg.querySelectorAll("button,a")].map(b => b.textContent.trim());
  out.pers = !!$("pd-pers");
  out.bordHidden0 = $("pd-bord-f").hidden; out.expanded0 = $("pd-bord-t").getAttribute("aria-expanded");
  out.t0 = num($("pd-total").textContent);
  $("pd-bord-t").click();
  out.bordHidden1 = $("pd-bord-f").hidden; out.expanded1 = $("pd-bord-t").getAttribute("aria-expanded");
  tipea("pd-nombre", "Dra. Camila Ruiz"); out.t1 = num($("pd-total").textContent);
  tipea("pd-rol", "Odontóloga"); out.t2 = num($("pd-total").textContent);
  $("pd-hilos").querySelector('[data-h="Dorado"]').click();
  out.hilo = $("pd-hilos").querySelector('[aria-pressed="true"]').dataset.h;
  out.wa = decodeURIComponent($("pd-wa").href);
  out.parche = $("pd-main").textContent;
  out.casa0 = $("pd-casa").hidden;
  medidas("casa");
  out.casa1 = $("pd-casa").hidden; out.pasos = $("pd-casa").querySelectorAll("li").length;
  out.guiaAbierta = $("pd-casa").querySelector("details").open;
  out.live = $("pd-talla-res").getAttribute("aria-live"); out.inputmode = ["pd-busto", "pd-cintura", "pd-cadera"].map(i => $(i).getAttribute("inputmode"));
  out.labels = ["pd-busto", "pd-cintura", "pd-cadera"].map(i => !!document.querySelector('label[for="' + i + '"]'));
  out.vacio = $("pd-talla-res").textContent;
  out.c1 = calcula(96, 78, 104); out.c2 = calcula(101, 85, 109); out.c3 = calcula(108, 78, 104); out.c4 = calcula(130, 100, 130);
  medidas("taller"); out.casa2 = $("pd-casa").hidden;
  medidas("casa"); out.casa3 = $("pd-casa").hidden;
  medidas("domicilio"); out.casa4 = $("pd-casa").hidden;
  const g = NEGOCIO.modelos.find(x => x.accesorio);
  abrirProducto(g, null, null); out.accHidden = $("pd-bord-box").hidden;
  abrirProducto(m, null, null); out.reabre = { nombre: $("pd-nombre").value, bord: $("pd-bord-f").hidden, total: num($("pd-total").textContent) };
  out.nmedidas = NEGOCIO.medidas.length;
} catch (e) { out.error = String(e); }
const p = document.createElement("pre"); p.id = "out"; p.textContent = JSON.stringify(out); document.body.appendChild(p); })();`;

for (const page of ["index.html", "catalogo.html"]) {
  const { html, stderr } = render({ page, inject: SCRIPT });
  const raw = (html.match(/<pre id="out">([\s\S]*?)<\/pre>/) || [])[1] || "{}";
  const o = JSON.parse(raw.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));

  test(`${page}: scenario ran without script errors`, () => {
    assert.equal(o.error, undefined, o.error);
    assert.ok(!/Uncaught|SyntaxError|ReferenceError|TypeError/.test(stderr), stderr);
  });

  test(`${page}: embroidery sits right after color, before Modalidad`, () => {
    assert.ok(o.orden.bord > o.orden.color && o.orden.bord < o.orden.tipo && o.orden.tipo < o.orden.med, JSON.stringify(o.orden));
  });

  test(`${page}: embroidery toggle starts collapsed and exposes its state`, () => {
    assert.equal(o.bordHidden0, true);
    assert.equal(o.expanded0, "false");
    assert.equal(o.bordHidden1, false);
    assert.equal(o.expanded1, "true");
  });

  test(`${page}: name and profession add their price to the total`, () => {
    // Data comes from NEGOCIO.bordado: nombre 12000, profesion 6000.
    assert.equal(o.t1 - o.t0, 12000);
    assert.equal(o.t2 - o.t1, 6000);
  });

  test(`${page}: WhatsApp message carries the embroidery details and the new total`, () => {
    assert.match(o.wa, /Dra\. Camila Ruiz/);
    assert.match(o.wa, /Odontóloga/);
    assert.match(o.wa, /Dorado/i);
    assert.ok(o.wa.includes(o.t2.toLocaleString("es-CO")), "total with embroidery");
  });

  test(`${page}: embroidery text is previewed over the dialog photo`, () => {
    assert.match(o.parche, /Dra\. Camila Ruiz/);
  });

  test(`${page}: nothing in the dialog sends embroidery to the designer`, () => {
    assert.equal(o.pers, false, "#pd-pers removed");
    assert.ok(!o.hrefs.some(h => /personaliza|modelo=/.test(h)), o.hrefs.join());
    assert.ok(!o.textos.some(t => /Personalizar/i.test(t)), o.textos.join());
  });

  test(`${page}: accessories offer no embroidery`, () => {
    assert.equal(o.accHidden, true);
  });

  test(`${page}: "Me mido en casa" reveals the guide and calculator, other options hide them`, () => {
    assert.equal(o.casa0, true);
    assert.equal(o.casa1, false);
    assert.equal(o.pasos, o.nmedidas, "steps rendered from NEGOCIO.medidas");
    assert.equal(o.guiaAbierta, false, "guide collapsed by default");
    assert.equal(o.casa2, true);
    assert.equal(o.casa3, false);
    assert.equal(o.casa4, true);
  });

  test(`${page}: calculator inputs are labelled and the result is a live region`, () => {
    assert.equal(o.live, "polite");
    assert.deepEqual(o.inputmode, ["decimal", "decimal", "decimal"]);
    assert.deepEqual(o.labels, [true, true, true]);
    assert.match(o.vacio, /busto, cintura y cadera/i);
  });

  test(`${page}: calculator picks the smallest size that covers every measure`, () => {
    for (const c of [o.c1, o.c2, o.c3]) {
      assert.ok(c.blusa && c.pantalon);
      assert.ok(c.texto.includes(`Blusa ${c.blusa}`) && c.texto.includes(`Pantalón ${c.pantalon}`), c.texto);
    }
    assert.ok(o.c1.texto.includes("Blusa S") && o.c1.texto.includes("Pantalón S"));
    assert.ok(o.c2.texto.includes("Blusa L") && o.c2.texto.includes("Pantalón L"), "between sizes -> the bigger one");
    assert.ok(o.c3.texto.includes("Blusa L") && o.c3.texto.includes("Pantalón S"), "bust drives only the blouse");
    assert.match(o.c1.texto, /entre tallas/i);
    assert.ok(o.c1.wa.includes("Blusa S"), "suggested size in the WhatsApp message");
  });

  test(`${page}: measures above XL say we make it to measure`, () => {
    assert.equal(o.c4.blusa, null);
    assert.match(o.c4.texto, /a tu medida/i);
    assert.ok(!/Blusa XL/.test(o.c4.texto));
  });

  test(`${page}: reopening the dialog starts clean`, () => {
    assert.deepEqual(o.reabre, { nombre: "", bord: true, total: o.t0 });
  });
}

// Layout of the dialog: info on the left under the gallery, choices on the right, total + actions in a sticky bar.
const LAYOUT = `(() => { const out = {}; try {
  const $ = id => document.getElementById(id), num = s => parseInt(String(s).replace(/\\D/g, ""), 10);
  const tipea = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
  const m = NEGOCIO.modelos.find(x => !x.precioFijo && !x.accesorio);
  abrirProducto(m, null, null);
  const gal = document.querySelector(".pd-gal"), info = document.querySelector(".pd-info"), dlg = $("pd");
  const barra = $("pd-total").closest(".pd-barra");
  const dentro = (el, caja) => !!caja && caja.contains(el);
  const aviso = dlg.querySelector(".pd-aviso");
  out.izq = ["pd-desc", "pd-feats"].map(i => dentro($(i), gal));
  out.aviso = dentro(aviso, gal);
  out.noDer = ["pd-desc", "pd-feats"].map(i => dentro($(i), info)).concat(dentro(aviso, info));
  out.primeros = [...info.children].map(e => e.id);
  out.color = !!info.children[3] && !!info.children[3].querySelector("#pd-colors");
  out.barra = !!barra; out.waEnBarra = dentro($("pd-wa"), barra); out.agendaEnBarra = dentro($("pd-agenda"), barra);
  out.pos = barra ? getComputedStyle(barra).position : "";
  out.t0 = num($("pd-total").textContent);
  out.hint0 = getComputedStyle(dlg.querySelector(".pd-hint")).display;
  $("pd-bord-t").click(); tipea("pd-nombre", "Dra. Camila Ruiz");
  out.t1 = num($("pd-total").textContent);
  out.conBordado = $("pd-main").classList.contains("con-bordado");
  out.hint1 = getComputedStyle(dlg.querySelector(".pd-hint")).display;
  out.pie = /se confirma/.test(barra ? barra.textContent : "");
} catch (e) { out.error = String(e); }
const p = document.createElement("pre"); p.id = "out"; p.textContent = JSON.stringify(out); document.body.appendChild(p); })();`;

for (const page of ["index.html", "catalogo.html"]) {
  const { html } = render({ page, inject: LAYOUT });
  const raw = (html.match(/<pre id="out">([\s\S]*?)<\/pre>/) || [])[1] || "{}";
  const o = JSON.parse(raw.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));

  test(`${page}: description, features and color note sit in the left column`, () => {
    assert.equal(o.error, undefined, o.error);
    assert.deepEqual(o.izq, [true, true]);
    assert.equal(o.aviso, true);
    assert.deepEqual(o.noDer, [false, false, false]);
  });

  test(`${page}: right column goes category, title, price, then Color`, () => {
    assert.deepEqual(o.primeros.slice(0, 3), ["pd-cat", "pd-title", "pd-price"]);
    assert.equal(o.color, true);
  });

  test(`${page}: total and main actions live in a sticky bar that keeps updating`, () => {
    assert.equal(o.barra, true);
    assert.equal(o.waEnBarra, true);
    assert.equal(o.agendaEnBarra, true);
    assert.equal(o.pos, "sticky");
    assert.equal(o.t1 - o.t0, 12000);
    assert.equal(o.pie, true, "fine print still visible");
  });

  test(`${page}: the zoom hint hides while an embroidery text is shown`, () => {
    assert.notEqual(o.hint0, "none", "visible without embroidery text");
    assert.equal(o.conBordado, true, "embroidery patch shown over the photo");
    assert.equal(o.hint1, "none");
  });
}
