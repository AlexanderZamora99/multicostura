// Home extras: trust strip after the hero and the "complete the look" section with hotspots.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "./render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const N = new Function(`${readFileSync(join(ROOT, "js/datos.js"), "utf8")}; return NEGOCIO;`)();
const { html, stderr } = render();
const pos = s => html.indexOf(s);
const section = id => html.slice(pos(`id="${id}"`), html.indexOf("</section>", pos(`id="${id}"`)));
const strip = s => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// Probe run in the page: reads the look state, then presses the second hotspot with the keyboard path (click on a real button).
const probe = `
  const out = {}, card = () => (document.getElementById("look-item") || {}).textContent || "";
  const dots = [...document.querySelectorAll("#look .punto")];
  out.first = card(); out.pressed0 = dots[0] && dots[0].getAttribute("aria-pressed");
  if (dots[1]) { dots[1].focus(); dots[1].click(); out.second = card(); out.pressed1 = dots[1].getAttribute("aria-pressed"); out.pressed0b = dots[0].getAttribute("aria-pressed"); }
  const cta = document.getElementById("look-cta"); if (cta) cta.click();
  out.model = document.getElementById("s-model").value; out.ok = 1;
  document.body.insertAdjacentHTML("beforeend", '<pre id="probe">' + JSON.stringify(out) + '</pre>');
`;
const probed = render({ inject: probe }).html;
const out = JSON.parse((probed.match(/<pre id="probe">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));

test("trust strip sits right after the hero, one item per data entry", () => {
  assert.ok(pos('id="confianza"') > pos('class="hero"'));
  assert.ok(pos('id="confianza"') < pos('id="modelos"'));
  assert.equal(N.confianza.length, 4);
  const items = section("confianza").split('class="trust-item"').length - 1;
  assert.equal(items, N.confianza.length);
  N.confianza.forEach(c => assert.ok(strip(section("confianza")).includes(c.t)));
});

test("trust strip is a light strip using the redesign palette, not a dark band", () => {
  const css = readFileSync(join(ROOT, "css/estilos.css"), "utf8");
  const rule = (css.match(/\.trust\s*\{[^}]*\}/) || [""])[0];
  assert.ok(rule, ".trust rule exists");
  assert.doesNotMatch(rule, /var\(--ink\)|#000|#111/);
  assert.match(rule, /var\(--(bg|card)/);
});

test("how-it-works steps sit right after the trust strip, before the models", () => {
  assert.ok(pos('id="proceso"') > pos('id="confianza"'));
  assert.ok(pos('id="proceso"') < pos('id="modelos"'));
  assert.ok(pos('id="proceso"') > 0 && html.indexOf("De la idea a tus manos") < pos('id="modelos"'));
  assert.equal(section("proceso").split('id="process"').length - 1, 1);
  assert.ok(pos('id="look"') > pos('id="modelos"') && pos('id="look"') < pos('id="nosotros"'));
  assert.ok(strip(section("proceso")).includes(N.proceso[0][0]), "steps are rendered from NEGOCIO.proceso");
});

test("look section follows the recommended section, before the next one", () => {
  assert.ok(pos('id="look"') > pos('id="modelos"'));
  assert.ok(pos('id="look"') < pos('id="nosotros"'));
});

test("look renders one named hotspot button per data entry, first part shown by default", () => {
  const dots = section("look").match(/<button[^>]*class="punto"[^>]*>/g) || [];
  assert.equal(dots.length, N.look.puntos.length);
  dots.forEach(d => assert.match(d, /aria-label="[^"]+"/));
  assert.match(dots[0], /aria-pressed="true"/);
  assert.ok(out.first.includes(N.look.puntos[0].t));
});

test("pressing a hotspot shows that part and moves the pressed state", () => {
  assert.ok(out.second.includes(N.look.puntos[1].t));
  assert.equal(out.pressed1, "true");
  assert.equal(out.pressed0b, "false");
});

test("look CTA sends the model to the designer", () => {
  assert.match(section("look"), /id="look-cta"/);
  assert.equal(out.model, N.look.modelo);
});

test("hotspots have a visible keyboard focus style", () => {
  assert.match(readFileSync(join(ROOT, "css/estilos.css"), "utf8"), /\.punto:focus-visible/);
});

test("no console errors on home or catalog", () => {
  assert.doesNotMatch(stderr, /ERROR|Uncaught/);
  assert.doesNotMatch(render({ page: "catalogo.html" }).stderr, /ERROR|Uncaught/);
});

test("catalog does not render the home extras", () => {
  const cat = render({ page: "catalogo.html" }).html;
  assert.doesNotMatch(cat, /id="look"|id="confianza"/);
});

// ---- Interactive look: media, swatches, live embroidery ----
// Async probe: clicks every hotspot, picks a colour swatch, types an embroidery name and presses the CTA.
const visual = `
  const wait = ms => new Promise(r => setTimeout(r, ms)), g = id => document.getElementById(id);
  (async () => {
    const out = { panes: [] }, dots = [...document.querySelectorAll("#look .punto")];
    const pane = () => document.querySelector("#look-item .look-pane.on");
    const main = () => { const i = document.querySelector("#look-foto img.on"); return i ? i.getAttribute("src") : ""; };
    for (const d of dots) { d.click(); const p = pane();
      out.panes.push({ imgs: p.querySelectorAll("img").length, sw: p.querySelectorAll("button[data-color]").length, links: [...p.querySelectorAll("a")].map(a => a.getAttribute("href")), txt: p.textContent, pressed: dots.filter(x => x.getAttribute("aria-pressed") === "true").length }); }
    dots[0].click(); out.photo0 = main();
    const sws = [...pane().querySelectorAll("button[data-color]")], other = sws.find(b => b.getAttribute("aria-pressed") !== "true");
    out.swColor = other.dataset.color; other.click(); await wait(800);
    out.photo1 = main(); out.swPressed = other.getAttribute("aria-pressed"); out.cta = g("look-cta").textContent;
    dots[2].click(); out.patchBefore = g("look-patch").textContent;
    const name = g("look-name"); name.value = "Dra. Ana Paz"; name.dispatchEvent(new Event("input", { bubbles: true }));
    const role = g("look-role"); role.value = "Pediatra"; role.dispatchEvent(new Event("input", { bubbles: true }));
    out.patch = g("look-patch").textContent; out.price = g("look-precio").textContent;
    const hilo = [...pane().querySelectorAll("button[data-hilo]")].find(b => b.dataset.hilo === "Dorado"); hilo.click(); out.hiloPressed = hilo.getAttribute("aria-pressed");
    out.patchHilo = g("look-patch").style.getPropertyValue("--hilo");
    g("look-cta").click(); out.dName = g("s-name").value; out.dRole = g("s-role").value; out.dColor = g("s-color-name").textContent; out.dHilo = document.querySelector("#s-thread .on").textContent.trim();
    document.body.insertAdjacentHTML("beforeend", '<pre id="probe2">' + JSON.stringify(out) + '</pre>');
  })();
`;
const v = JSON.parse((render({ inject: visual }).html.match(/<pre id="probe2">(\{[\s\S]*?\})<\/pre>/) || [, "{}"])[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));

test("every look hotspot renders its own pane with media or controls, one dot pressed at a time", () => {
  assert.equal(v.panes.length, N.look.puntos.length);
  v.panes.forEach((p, i) => { assert.ok(p.txt.includes(N.look.puntos[i].t), `pane ${i} has its title`); assert.equal(p.pressed, 1); });
  assert.ok(v.panes[0].sw >= 3 && v.panes[0].imgs >= 3, "blouse pane shows colour swatches with photos");
  assert.ok(v.panes[1].imgs >= 3 && v.panes[1].links.some(h => /catalogo\.html/.test(h)), "trousers pane shows product thumbnails linking to the catalog");
  assert.ok(v.panes[2].links.includes("#empresas"), "embroidery pane links the logo note to #empresas");
});

test("choosing a colour swatch swaps the main look photo and updates the CTA", () => {
  assert.ok(v.photo0 && v.photo1 && v.photo0 !== v.photo1, `${v.photo0} -> ${v.photo1}`);
  assert.equal(v.swPressed, "true");
  assert.ok(v.cta.toLowerCase().includes(v.swColor.toLowerCase()), v.cta);
  assert.equal(v.dColor, v.swColor);
});

test("typing in the embroidery pane updates the patch and shows the running price without inventing logo prices", () => {
  assert.match(v.patchBefore, /Tu nombre/);
  assert.ok(v.patch.includes("Dra. Ana Paz") && v.patch.includes("Pediatra"));
  assert.ok(v.price.includes((N.bordado.nombre + N.bordado.profesion).toLocaleString("es-CO")), v.price);
  assert.equal(v.hiloPressed, "true");
  assert.equal(v.patchHilo.trim(), N.hilos.Dorado);
  assert.doesNotMatch(v.panes[2].txt, /logo[^.]*\$\d/i);
});

test("look CTA hands the typed embroidery and thread to the designer", () => {
  assert.equal(v.dName, "Dra. Ana Paz");
  assert.equal(v.dRole, "Pediatra");
  assert.equal(v.dHilo, "Dorado");
});

test("look dots pulse, the active one grows, and motion is disabled for reduced-motion users", () => {
  const css = readFileSync(join(ROOT, "css/estilos.css"), "utf8");
  assert.match(css, /@keyframes\s+pulso/);
  assert.match(css, /\.punto\[aria-pressed="true"\][^{]*\{[^}]*scale/);
  assert.match(css, /prefers-reduced-motion: reduce\)[^}]*\{[^}]*\.punto/);
});
