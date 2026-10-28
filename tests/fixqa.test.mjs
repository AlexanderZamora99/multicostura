import { test } from "node:test";
import assert from "node:assert/strict";
import { render, count } from "./render.mjs";

const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, "");
const dom = strip(render().html);
const tag = (d, id) => d.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))[0];
const PIX = "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271%27%20height=%271%27/%3E";
const attr = (h, k) => Number(h.match(new RegExp(`data-${k}="(-?[\\d.]+)"`))[1]);

const bannerProbe = `
  NEGOCIO.portada = [{ titulo: "Titulo", texto: "Texto", cta: "Ver", href: "#modelos" }, { titulo: "Dos", texto: "Texto", cta: "Ver", href: "#agenda" }]; renderPortada(); // changed: slides with a photo are image-only, so the alignment is measured on the text slides
  const r = e => e.getBoundingClientRect();
  const b = document.body, ban = document.getElementById("banner");
  const act = document.querySelector(".slide.is-active");
  b.setAttribute("data-bl", r(ban).left); b.setAttribute("data-br", r(ban).right);
  b.setAttribute("data-al", r(act).left); b.setAttribute("data-ar", r(act).right);
  b.setAttribute("data-tl", r(act.querySelector(".slide-title")).left);
  b.setAttribute("data-logo", r(document.querySelector(".logo")).left);
  b.setAttribute("data-copyr", r(act.querySelector(".slide-copy")).right);
  b.setAttribute("data-prevr", r(document.getElementById("banner-prev")).right);
  b.setAttribute("data-others", [...document.querySelectorAll(".slide:not(.is-active)")].map(s => getComputedStyle(s).opacity).join(","));
`;

test("desktop banner: active slide fills the banner and its text lines up with the header logo", () => {
  const h = render({ width: 1366, height: 900, inject: bannerProbe }).html;
  assert.equal(attr(h, "al"), attr(h, "bl"), "active slide left edge = banner left edge");
  assert.equal(attr(h, "ar"), attr(h, "br"), "active slide right edge = banner right edge");
  assert.ok(Math.abs(attr(h, "tl") - attr(h, "logo")) <= 2, `title at ${attr(h, "tl")}, logo at ${attr(h, "logo")}`);
  assert.ok(attr(h, "tl") >= attr(h, "prevr"), "text starts after the prev arrow");
  assert.ok(attr(h, "copyr") <= attr(h, "br"));
  assert.ok(h.match(/data-others="([^"]*)"/)[1].split(",").every(o => o === "0"), "inactive slides are invisible, not peeking in");
});

test("photo grid hides stock-photo examples until real client photos are configured", () => {
  assert.match(tag(dom, "clientas"), /class="[^"]*\bhidden\b/);
  const html = strip(render({ inject: `NEGOCIO.clientas.push({ foto: "${PIX}", texto: "Esteticista" }); renderClientas();` }).html);
  const s = html.slice(html.indexOf('id="clientas"'), html.indexOf("</section>", html.indexOf('id="clientas"')));
  assert.equal(count(s, "<figure"), 1, "examples are never shown beside real photos");
  assert.ok(s.includes("Esteticista"));
});

// changed: collection tiles replaced the circles; they stay photo-free (calm grey) until a photo is configured, covered in canon.test.mjs

const fab = `document.querySelectorAll("#modes .mode")[2].click(); document.getElementById("form").scrollIntoView({ behavior: "instant" });`;
test("floating buttons step aside on phones while a form is on screen", () => {
  const phone = render({ width: 500, height: 900, inject: fab }).html;
  assert.match(phone.match(/<body[^>]*>/)[0], /fab-off/);
  const desk = render({ width: 1366, height: 900, inject: fab }).html;
  assert.doesNotMatch(desk.match(/<body[^>]*>/)[0], /fab-off/);
  assert.doesNotMatch(render({ width: 500, height: 900 }).html.match(/<body[^>]*>/)[0], /fab-off/);
});
