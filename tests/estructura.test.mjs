import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render } from "./render.mjs";

const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("index.html enlaza los estilos y carga datos.js antes que app.js", () => {
  assert.match(index, /<link[^>]+rel="stylesheet"[^>]+href="css\/estilos\.css"|<link[^>]+href="css\/estilos\.css"[^>]+rel="stylesheet"/);
  const datos = index.indexOf('src="js/datos.js"');
  const app = index.indexOf('src="js/app.js"');
  assert.ok(datos > 0 && app > datos, "datos.js debe cargarse antes que app.js");
  assert.doesNotMatch(index, /const NEGOCIO\b/);
  assert.doesNotMatch(index, /<style[\s>]/);
});

test("el mismo app.js corre sin lanzar errores en una página sin secciones", () => {
  const vacia = () => '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><main id="solo"></main><script src="js/datos.js"></script><script src="js/app.js"></script></body></html>';
  const { html, stderr } = render({ transform: vacia, inject: "document.body.dataset.ok = typeof NEGOCIO + typeof renderModels + typeof quickView" });
  assert.match(html, /data-ok="objectfunctionfunction"/);
  assert.doesNotMatch(stderr, /Uncaught/);
});
