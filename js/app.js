NEGOCIO.modelos.forEach(m => (m.colores ||= Object.keys(NEGOCIO.colores)));
// recolor: true = hay foto recoloreada por cada color en img/color/<id>-<color>.webp (menos blanco).
// Se generan desde una foto real del modelo; las reales siempre tienen prioridad.
const slugColor = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");
NEGOCIO.modelos.filter(m => m.recolor).forEach(m => {
  m.fotos ||= {};
  m.simulados = m.colores.filter(c => !m.fotos[c] && c !== "Blanco");
  m.simulados.forEach(c => (m.fotos[c] = `img/color/${m.id}-${slugColor(c)}.webp`));
});
// Los colores con foto van primero: así el color inicial de cada modelo coincide con su foto
NEGOCIO.modelos.forEach(m => { const f = Object.keys(m.fotos || {}); m.colores = [...f, ...m.colores.filter(c => !f.includes(c))]; });

// Iconos de línea (sin emojis)
const ICONO = {
  store: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.500 5.500 4h13L20 9.500M4 9.500h16M4 9.500V20h16V9.500M9 20v-5h6v5"/></svg>',
  home: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-7 9 7M5.500 9.500V20h13V9.500M10 20v-5h4v5"/></svg>',
  truck: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v11H2zM13 9.500h4l4 4V17h-8"/><circle cx="6.500" cy="18" r="1.800"/><circle cx="17" cy="18" r="1.800"/></svg>',
  scissors: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6.500" r="2.500"/><circle cx="6" cy="17.500" r="2.500"/><path d="m8 8 12 10M8 16 20 6"/></svg>',
  calendar: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4m-8 9 3 3 5-5"/></svg>',
  hanger: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V6.500a2 2 0 1 1 2 2M12 8 3 15a1.500 1.500 0 0 0 1 2.700h16A1.500 1.500 0 0 0 21 15l-9-7Z"/></svg>',
  cap: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15a8 8 0 0 1 16 0v2H4zM4 17c0 2 3 3 8 3s8-1 8-3"/></svg>',
  sock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h7v9l4 4a3 3 0 0 1-4 4l-6-5a4 4 0 0 1-1-3z"/></svg>',
  coat: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0zM12 7v14"/></svg>',
  card: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
  chevL: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chevR: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  ruler: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="8" width="20" height="8" rx="1.500"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
};
// Cada página usa solo parte de las secciones: si un id no existe en la página, devuelve un elemento suelto (un <select> fuera del documento, que acepta las mismas operaciones)
// para que dibujar o enlazar esa sección no haga nada y no lance errores.
const sueltos = new Map();
const $ = id => document.getElementById(id) || sueltos.get(id) || sueltos.set(id, document.createElement("select")).get(id);
const pesos = n => "$" + Math.round(n).toLocaleString("es-CO");
const waLink = t => `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(t)}`;
const openWa = t => window.open(waLink(t), "_blank", "noopener");
const C = n => NEGOCIO.colores[n];
const pad = n => String(n).padStart(2, "0");
const toMin = hhmm => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const toHHMM = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const hora12 = hhmm => { let [h, m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "p. m." : "a. m."; h = h % 12 || 12; return `${h}:${pad(m)} ${ap}`; };
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const largo = s => fromIso(s).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
const scrub = (color, sym = "scrub") => `<svg viewBox="0 0 200 300" aria-hidden="true"><use href="#${sym}" style="fill:${color};stroke:${color.toLowerCase() === "#ffffff" ? "#b4b4be" : "none"};stroke-width:2"/></svg>`;
const photoOr = (foto, color, alt = "", sym) => `${scrub(color, sym)}<img src="${foto}" alt="${alt}" loading="lazy" onerror="this.remove()">`;

// Botones de pausa (carrusel)
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const syncPP = (btn, paused, que) => {
  btn.classList.toggle("paused", paused);
  btn.setAttribute("aria-label", `${paused ? "Reanudar" : "Pausar"} ${que}`);
};

// ---------- Banner a todo el ancho ----------
// Con foto, la diapositiva es solo la imagen (enlaza a su destino). Si la imagen falla, se cambia por la versión de texto sobre gris.
const copiaTexto = p => `<div class="slide-copy"><p class="slide-title">${p.titulo}</p><p class="slide-text">${p.texto}</p><a class="btn btn-mag" href="${p.href}">${p.cta}</a></div>`;
function slideTexto(img) {
  const s = img.closest(".slide");
  s.classList.add("no-photo");
  s.innerHTML = copiaTexto(NEGOCIO.portada[[...s.parentElement.children].indexOf(s)]);
}
const dropImg = `onerror="slideTexto(this)"`;
let bannerCtl = null;
function renderPortada() {
  if (bannerCtl) bannerCtl.stop();
  const track = $("banner-track"), dots = $("hero-dots");
  track.innerHTML = NEGOCIO.portada.map((p, i) => `
    <div class="slide${i === 0 ? " is-active" : ""}${p.img ? "" : " no-photo"}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${NEGOCIO.portada.length}">
      ${p.img ? `<a class="slide-link" href="${p.href}"><picture>${p.imgMovil ? `<source media="(max-width: 760px)" srcset="${p.imgMovil}">` : ""}<img src="${p.img}" alt="${p.titulo}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} ${dropImg}></picture></a>` : copiaTexto(p)}
    </div>`).join("");
  dots.innerHTML = NEGOCIO.portada.map((p, i) => `<button type="button" class="dot" aria-label="Ir al banner ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`).join("");
  const slides = [...track.children], dotEls = [...dots.children], box = $("banner");
  const multi = slides.length > 1, pp = $("banner-pp");
  let userPaused = false;
  const sync = () => { pp.hidden = !multi || reduceMotion.matches; syncPP(pp, userPaused, "carrusel"); track.setAttribute("aria-live", userPaused ? "polite" : "off"); };
  $("banner-prev").hidden = $("banner-next").hidden = !multi;
  let now = 0, timer = null;
  const show = i => {
    now = (i + slides.length) % slides.length;
    slides.forEach((el, k) => { el.classList.toggle("is-active", k === now); el.setAttribute("aria-hidden", k !== now); el.inert = k !== now; });
    dotEls.forEach((el, k) => (k === now ? el.setAttribute("aria-current", "true") : el.removeAttribute("aria-current")));
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => { stop(); if (!reduceMotion.matches && multi && !userPaused) timer = setInterval(() => show(now + 1), 6000); };
  pp.onclick = () => { userPaused = !userPaused; sync(); play(); };
  dotEls.forEach((d, i) => (d.onclick = () => { show(i); play(); }));
  $("banner-prev").onclick = () => { show(now - 1); play(); };
  $("banner-next").onclick = () => { show(now + 1); play(); };
  box.onmouseenter = stop; box.onmouseleave = play; box.onfocusin = stop; box.onfocusout = play;
  let x0 = null;
  box.ontouchstart = e => { x0 = e.touches[0].clientX; stop(); };
  box.ontouchend = e => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(now + (dx < 0 ? 1 : -1)); } x0 = null; play(); };
  reduceMotion.addEventListener("change", () => { sync(); play(); });
  show(0); sync(); play();
  bannerCtl = { stop };
}
renderPortada();
$("menu-btn").onclick = () => { const o = $("nav").classList.toggle("open"); $("menu-btn").setAttribute("aria-expanded", o); };
$("nav-list").addEventListener("click", e => { if (e.target.closest("a")) { $("nav").classList.remove("open"); $("menu-btn").setAttribute("aria-expanded", false); } });

// ---------- Modelos ----------
let cat = "Todos";
// Una colección con varias categorías (Gorros y medias) filtra por el conjunto; su nombre aparece como filtro activo
const gruposCat = () => Object.fromEntries(NEGOCIO.colecciones.filter(c => c.cats.length > 1).map(c => [c.t, c.cats]));
const enCat = (m, c) => c === "Todos" || m.cat.includes(c) || (gruposCat()[c] || []).some(x => m.cat.includes(x));
// Estado de los demás filtros (la categoría vive en `cat`)
const filtros = { forma: "", talla: "", color: "", orden: "" };
const tipoDe = id => NEGOCIO.tipos.find(t => t.id === id);
const tieneFoto = (m, c) => !!(m.fotos && m.fotos[c]);
function renderProfs() {
  $("profs").innerHTML = (NEGOCIO.categorias.includes(cat) ? NEGOCIO.categorias : [...NEGOCIO.categorias, cat]).map(p =>
    `<label><input type="radio" name="cat" value="${p}"${p === cat ? " checked" : ""}>${p}<span class="cuenta">${NEGOCIO.modelos.filter(m => enCat(m, p)).length}</span></label>`).join("");
}
// Forma de compra, tallas y colores salen de los datos; se dibujan una sola vez
function renderFiltros() {
  $("f-forma").innerHTML = NEGOCIO.tipos.map(t => `<label><input type="radio" name="forma" value="${t.id}">${t.forma}<span class="cuenta">${t.dias}</span></label>`).join("");
  $("f-talla").innerHTML = NEGOCIO.tallas.orden.map(t => `<button type="button" data-talla="${t}" aria-pressed="false">${t}</button>`).join("");
  const orden = Object.keys(NEGOCIO.colores);
  const colores = [...new Set(NEGOCIO.modelos.flatMap(m => Object.keys(m.fotos || {})))].sort((x, y) => orden.indexOf(x) - orden.indexOf(y));
  $("f-colores").innerHTML = colores.map(c => `<button type="button" data-color="${c}" style="--c:${C(c)}" title="${c}" aria-label="${c}" aria-pressed="false"></button>`).join("");
}
function syncFiltros(n) {
  document.querySelectorAll('#filtros input[name="forma"]').forEach(r => (r.checked = r.value === filtros.forma));
  document.querySelectorAll("#f-talla button").forEach(b => b.setAttribute("aria-pressed", b.dataset.talla === filtros.talla));
  document.querySelectorAll("#f-colores button").forEach(b => b.setAttribute("aria-pressed", b.dataset.color === filtros.color));
  $("f-color-n").textContent = filtros.color ? `· ${filtros.color}` : "";
  const activos = [cat !== "Todos", filtros.forma, filtros.talla, filtros.color].filter(Boolean).length;
  $("abrir-filtros").textContent = activos ? `Filtros (${activos})` : "Filtros";
  $("ver-resultados").textContent = `Ver ${n} ${n === 1 ? "modelo" : "modelos"}`;
}
// Foto del modelo para un color: la del color si existe, si no la general, y si no el uniforme en SVG
const fotoDe = (m, color) => (m.fotos && m.fotos[color]) || m.foto;
const diseñable = m => m.precio != null;
const esUniforme = m => !m.cat.every(c => NEGOCIO.categoriasNoUniforme.includes(c));
const swap = m => (m.foto2 ? `<img class="swap" src="${m.foto2}" alt="" loading="lazy" onerror="this.remove()">` : "");
const altDe = (m, color) => `${esUniforme(m) ? "Uniforme " : ""}${m.nombre}, color ${color}`;
const fotoCard = (m, color) => (esUniforme(m) ? photoOr(fotoDe(m, color), C(color), altDe(m, color), m.sil)
  : `<div class="ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 16-5-5-8 8"/></svg>Foto próximamente</div><img src="${fotoDe(m, color)}" alt="${altDe(m, color)}" loading="lazy" onerror="this.remove()">`) + swap(m);
// Precio: uno solo si no cambia con la modalidad, y un rango (tienda a medida) si cambia
const precioTexto = (m, forma) => {
  if (!diseñable(m)) return "Consultar";
  if (forma) { const t = tipoDe(forma); return pesos(precio(m, t)) + (m.precioFijo ? "" : ` <small>${t.forma.toLowerCase()}</small>`); }
  const v = NEGOCIO.tipos.map(t => precio(m, t)), a = Math.min(...v), z = Math.max(...v);
  return a === z ? pesos(a) : `${pesos(a)} - ${pesos(z)}`;
};
const nombresColor = m => m.colores.slice(0, 3).join(", ") + (m.colores.length > 3 ? ` +${m.colores.length - 3}` : "");
// op: forma / color / talla elegidos en el menú de filtros (las tarjetas de Recomendados no los usan)
function modelCard(m, op = {}) {
  const el = document.createElement("article");
  el.className = "model";
  el.dataset.id = m.id;
  const lista = diseñable(m), tag = m.tag ? `<span class="tag">${m.tag}</span>` : "";
  const elegido = op.color && tieneFoto(m, op.color) ? op.color : null, inicial = elegido || m.colores[0];
  const cols = (elegido ? [elegido, ...m.colores.filter(c => c !== elegido)] : m.colores).slice(0, 6);
  el.innerHTML = `
    <div class="media"><div class="pic">${tag}${fotoCard(m, inicial)}</div><button type="button" class="qv" aria-label="Vista rápida de ${m.nombre}">Vista rápida</button></div>
    <div class="info"><b>${m.nombre}</b><strong class="price${lista ? "" : " ask"}">${precioTexto(m, op.forma)}</strong>
      <div class="swatches" role="group" aria-label="Colores de ${m.nombre}">${cols.map((c, i) => `<button type="button" class="${i === 0 ? "on" : ""}" data-color="${c}" style="--c:${C(c)}" title="${c}" aria-label="Color ${c}" aria-pressed="${i === 0}"></button>`).join("")}</div>
      <p class="cols">${nombresColor(m)}</p>
    </div>`;
  el.querySelectorAll(".swatches button").forEach(b => b.onclick = () => {
    el.querySelectorAll(".swatches button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    el.querySelector(".pic").innerHTML = tag + fotoCard(m, b.dataset.color);
  });
  const abrir = () => quickView(m, (el.querySelector(".swatches button.on") || {}).dataset?.color || m.colores[0], el.querySelector(".qv"), { tipo: op.forma, talla: op.talla });
  el.querySelector(".qv").onclick = abrir;
  el.querySelector(".pic").onclick = abrir;
  return el;
}

// ---------- Vista rápida (diálogo modal) ----------
const qv = { m: null, color: null, tipo: "tienda", talla: "", opener: null };
function qvResumen() {
  const { m, color } = qv, t = NEGOCIO.tipos.find(x => x.id === qv.tipo);
  const talla = qv.talla ? `, talla ${qv.talla}` : "";
  if (!diseñable(m)) return `Hola Multicostura 💗 quiero consultar el precio y la disponibilidad de: ${m.nombre}, color ${color.toLowerCase()}${talla}`;
  return `Hola Multicostura 💗 quiero pedir este modelo:\n• ${m.nombre} (${t.t.toLowerCase()}), color ${color.toLowerCase()}${qv.talla ? `\n• Talla: ${qv.talla}` : ""}\n• Precio: ${pesos(precio(m, t))}\n• Entrega: ${t.tiempo.toLowerCase()}`;
}
function qvSync() {
  const { m, color } = qv;
  $("qv-colname").textContent = color;
  $("qv-colors").querySelectorAll("button").forEach(b => { const on = b.dataset.color === color; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  $("qv-tipos")?.querySelectorAll("button").forEach(b => { const on = b.dataset.tipo === qv.tipo; b.setAttribute("aria-pressed", on); });
  $("qv-pic").innerHTML = fotoCard(m, color);
  $("qv-wa").href = waLink(qvResumen());
}
// pre: forma de compra y talla elegidas en el menú de filtros, para no pedírselas dos veces
function quickView(m, color, opener, pre = {}) {
  const lista = diseñable(m);
  Object.assign(qv, { m, color, tipo: lista && tipoDe(pre.tipo) ? pre.tipo : "tienda", talla: pre.talla || "", opener });
  $("qv-body").innerHTML = `
    <div class="pic" id="qv-pic"></div>
    <div class="qv-info">
      <h2 id="qv-title">${m.nombre}</h2>
      <p class="qv-price">${precioTexto(m)}</p>
      ${qv.talla ? `<p class="qv-talla">Talla elegida: <b>${qv.talla}</b></p>` : ""}
      <p class="qv-desc">${m.desc}</p>
      ${lista ? `<div><span class="lbl" id="qv-l-tipo">Cómo lo quieres</span><div class="qv-tipos" id="qv-tipos" role="group" aria-labelledby="qv-l-tipo">${NEGOCIO.tipos.map(t => `<button type="button" class="qv-tipo" data-tipo="${t.id}" aria-pressed="false"><span><b>${t.t}</b><small>${t.tiempo}</small></span><strong>${pesos(precio(m, t))}</strong></button>`).join("")}</div></div>` : ""}
      <div><span class="lbl" id="qv-l-color">Color: <b id="qv-colname"></b></span><div class="opts" id="qv-colors" role="group" aria-labelledby="qv-l-color">${m.colores.map(c => `<button type="button" data-color="${c}" aria-pressed="false"><i style="background:${C(c)}"></i>${c}</button>`).join("")}</div></div>
      <div class="qv-actions"><a class="btn btn-mag" id="qv-wa" target="_blank" rel="noopener">${lista ? "Pedir por WhatsApp" : "Preguntar por WhatsApp"}</a>${lista ? `<button type="button" class="btn btn-ghost" id="qv-pers">Personalizar</button>` : ""}</div>
    </div>`;
  $("qv-colors").querySelectorAll("button").forEach(b => (b.onclick = () => { qv.color = b.dataset.color; qvSync(); }));
  $("qv-tipos")?.querySelectorAll("button").forEach(b => (b.onclick = () => { qv.tipo = b.dataset.tipo; qvSync(); }));
  if (lista) $("qv-pers").onclick = () => {
    $("s-model").value = m.id; design.color = qv.color; design.tipo = qv.tipo; renderDesign(); renderAgenda();
    quickViewClose(false);
    if (document.getElementById("personaliza")) $("personaliza").scrollIntoView();
    else location.href = `index.html?modelo=${m.id}&color=${encodeURIComponent(qv.color)}#personaliza`;
  };
  qvSync();
  document.documentElement.classList.add("qv-open");
  if (!$("qv").open) $("qv").showModal();
  $("qv-close").focus();
}
function quickViewClose(volver = true) {
  if ($("qv").open) $("qv").close();
  document.documentElement.classList.remove("qv-open");
  if (volver && qv.opener) qv.opener.focus();
}
$("qv-close").onclick = () => quickViewClose();
$("qv").addEventListener("click", e => { if (e.target === $("qv")) quickViewClose(); });
$("qv").addEventListener("cancel", e => { e.preventDefault(); quickViewClose(); });
$("qv").addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const f = [...$("qv").querySelectorAll("button, a[href]")].filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("qv").open) quickViewClose(); });
// Estado en la URL (?cat=, ?talla=): "cat" acepta una categoría o el nombre de una colección
function leerUrl() {
  const q = new URLSearchParams(location.search), c = q.get("cat"), t = q.get("talla");
  const col = NEGOCIO.colecciones.find(x => x.t === c);
  if (c && NEGOCIO.categorias.includes(c)) cat = c;
  else if (col) cat = col.cats.length > 1 ? col.t : col.cats[0];
  if (t && NEGOCIO.tallas.orden.includes(t)) filtros.talla = t;
}
// Entrada del catálogo: tiempos de entrega de cada forma de compra, sacados de NEGOCIO.tipos
function catLead() {
  $("cat-lead").textContent = `Conjuntos, línea blancos, batas, gorros y medias en antifluido. Entrega: ${NEGOCIO.tipos.map(t => `${t.forma.toLowerCase()}, ${t.dias === "hoy" ? "hoy mismo" : t.dias}`).join("; ")}.`;
}
function renderModels() {
  const f = filtros, precioOrden = m => (diseñable(m) ? precio(m, tipoDe(f.forma || "tienda")) : null);
  let lista = NEGOCIO.modelos.filter(m => enCat(m, cat) && (!f.color || tieneFoto(m, f.color)));
  if (f.orden) {
    const dir = f.orden === "asc" ? 1 : -1; // sin precio siempre al final; el orden es estable
    lista = [...lista].sort((x, y) => { const a = precioOrden(x), b = precioOrden(y); return a == null ? (b == null ? 0 : 1) : b == null ? -1 : (a - b) * dir; });
  }
  $("models").innerHTML = lista.length ? "" : '<p class="lead empty">No hay modelos con esos filtros. Prueba quitar alguno.</p>';
  lista.forEach(m => $("models").appendChild(modelCard(m, { forma: f.forma, color: f.color, talla: f.talla })));
  $("res-cuenta").textContent = `${lista.length} ${lista.length === 1 ? "modelo" : "modelos"}`;
  syncFiltros(lista.length);
}
renderFiltros();
$("stock-ico").innerHTML = ICONO.store;
$("filtros").addEventListener("change", e => {
  if (e.target.name === "cat") cat = e.target.value;
  if (e.target.name === "forma") filtros.forma = e.target.value;
  renderModels();
});
$("filtros").addEventListener("click", e => {
  const t = e.target.closest("#f-talla button"), c = e.target.closest("#f-colores button");
  if (t) filtros.talla = filtros.talla === t.dataset.talla ? "" : t.dataset.talla;
  if (c) filtros.color = filtros.color === c.dataset.color ? "" : c.dataset.color;
  if (t || c) renderModels();
  if (e.target.closest(".enlace")) cerrarFiltros(false);
});
$("filtros").addEventListener("reset", e => {
  e.preventDefault();
  cat = "Todos"; Object.assign(filtros, { forma: "", talla: "", color: "", orden: "" });
  $("orden").value = "";
  renderProfs(); renderModels();
});
$("filtros").addEventListener("submit", e => e.preventDefault());
$("orden").addEventListener("change", e => { filtros.orden = e.target.value; renderModels(); });
// En celular el menú es un cajón con velo; Escape, la X, el velo y "Ver N modelos" lo cierran y el foco vuelve al botón
let velo = null;
function cerrarFiltros(volver = true) {
  if (!$("panel-filtros").classList.contains("abierto")) return;
  $("panel-filtros").classList.remove("abierto");
  $("abrir-filtros").setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("filtros-open");
  velo && velo.remove(); velo = null;
  if (volver) $("abrir-filtros").focus();
}
$("abrir-filtros").onclick = () => {
  $("panel-filtros").classList.add("abierto");
  $("abrir-filtros").setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("filtros-open");
  velo = document.createElement("div"); velo.className = "velo"; velo.onclick = () => cerrarFiltros();
  document.body.appendChild(velo);
  $("cerrar-filtros").focus();
};
$("cerrar-filtros").onclick = () => cerrarFiltros();
$("ver-resultados").onclick = () => cerrarFiltros();
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("panel-filtros").classList.contains("abierto") && !$("qv").open) cerrarFiltros(); });
$("panel-filtros").addEventListener("keydown", e => {
  if (e.key !== "Tab" || !$("panel-filtros").classList.contains("abierto")) return;
  const f = [...$("panel-filtros").querySelectorAll("button, a[href], input")].filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
matchMedia("(min-width: 960px)").addEventListener("change", e => { if (e.matches) cerrarFiltros(false); });
// true si la foto carga: las secciones que dependen de fotos solo muestran las que existen
const fotosCargadas = new Map();
const fotoCarga = src => {
  if (!src) return Promise.resolve(false);
  if (!fotosCargadas.has(src)) fotosCargadas.set(src, new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = src; }));
  return fotosCargadas.get(src);
};
// Recomendados: 4 tarjetas mientras no haya fotos (con silueta, para no repetir el catálogo de abajo);
// en cuanto carga la foto de algún modelo se completan hasta 8. Si no hay fotos la sección no se oculta.
let recoTurno = 0;
function renderRecomendados() {
  const turno = ++recoTurno;
  const lista = NEGOCIO.recomendados.map(id => NEGOCIO.modelos.find(m => m.id === id)).filter(Boolean).slice(0, 8);
  $("reco").classList.toggle("hidden", !lista.length);
  $("recomendados").innerHTML = "";
  const poner = ms => ms.forEach(m => { const c = modelCard(m); c.setAttribute("role", "listitem"); $("recomendados").appendChild(c); });
  poner(lista.slice(0, 4));
  if (lista.length > 4) Promise.all(lista.map(m => fotoCarga(m.foto))).then(r => { if (turno === recoTurno && r.some(Boolean)) poner(lista.slice(4)); });
}
const listaY = a => a.length > 1 ? a.slice(0, -1).join(", ") + " o " + a[a.length - 1] : a.join("");
// Tabla de tallas y calculadora (datos en NEGOCIO.tallas)
function renderTallas() {
  const T = NEGOCIO.tallas, o = T.orden;
  const fila = (nombre, prenda, k) => `<tr><th scope="row">${nombre}</th>${o.map(t => `<td data-t="${t}" data-p="${prenda}">${T[prenda][t][k]}</td>`).join("")}</tr>`;
  const tabla = (cap, rotulo, filas) => `<table class="tabla"><caption>${cap}</caption>
    <thead><tr><th scope="col">${rotulo}</th>${o.map(t => `<th scope="col" data-t="${t}">${t}</th>`).join("")}</tr></thead>
    <tbody>${filas.map(f => fila(...f)).join("")}</tbody></table>`;
  $("tabla-tallas").innerHTML =
    tabla("Medidas de blusa en centímetros", "Medida blusa", [["BUSTO", "blusa", "busto"], ["CINTURA", "blusa", "cintura"], ["CADERA", "blusa", "cadera"], ["L.BLUSA", "blusa", "largo"]]) +
    tabla("Medidas de pantalón en centímetros", "Medida pantalones", [["CINTURA", "pantalon", "cintura"], ["CADERA", "pantalon", "cadera"], ["L.PANTALÓN", "pantalon", "largo"], ["L.RODILLA", "pantalon", "largoRodilla"], ["C.RODILLA", "pantalon", "contornoRodilla"]]);
  $("calc").addEventListener("input", () => calcTalla());
  $("calc").addEventListener("submit", e => e.preventDefault());
  calcTalla();
}
// Primera talla (en orden) cuya tabla cubre todas las medidas dadas; null si pasa de la última
const tallaDe = (prenda, med) => NEGOCIO.tallas.orden.find(t => Object.entries(med).every(([k, v]) => v <= NEGOCIO.tallas[prenda][t][k])) || null;
// Sin argumentos lee el formulario y pinta el resultado; con medidas { busto, cintura, cadera } solo calcula.
function calcTalla(med) {
  const leer = id => parseFloat($(id).value) || 0;
  const m = med || { busto: leer("t-busto"), cintura: leer("t-cintura"), cadera: leer("t-cadera") };
  const completo = m.busto > 0 && m.cintura > 0 && m.cadera > 0;
  const b = completo ? tallaDe("blusa", m) : null, p = completo ? tallaDe("pantalon", { cintura: m.cintura, cadera: m.cadera }) : null;
  if (med) return { blusa: b, pantalon: p };
  let res, nota, cta = ["Ver modelos", "catalogo.html", "btn-dark"];
  if (!completo) { res = "Escribe tus medidas"; nota = "Con busto, cintura y cadera te decimos la talla de blusa y de pantalón."; }
  else if (!b || !p) { res = `Blusa ${b || "a medida"} · Pantalón ${p || "a medida"}`; nota = "Pasas la talla XL: te la hacemos a tu medida para que no te quede justo."; cta = ["Agendar mis medidas", "#agenda", "btn-mag"]; }
  else if (b !== p) { res = `Blusa ${b} · Pantalón ${p}`; nota = `Pide blusa ${b} y pantalón ${p} al hacer tu pedido.`; }
  else { res = `Blusa ${b} · Pantalón ${p}`; nota = `Te queda la talla ${b} en blusa y pantalón.`; cta[1] = `catalogo.html?talla=${b}`; }
  $("r-tallas").textContent = res; $("r-nota").textContent = nota;
  Object.assign($("r-cta"), { textContent: cta[0], href: cta[1], className: "btn " + cta[2] });
  document.querySelectorAll("#tabla-tallas [data-t]").forEach(c => c.classList.toggle("on", c.tagName === "TH" ? (c.dataset.t === b || c.dataset.t === p) : c.dataset.t === (c.dataset.p === "blusa" ? b : p)));
  return { blusa: b, pantalon: p };
}
function renderLook() {
  const L = NEGOCIO.look, m = NEGOCIO.modelos.find(x => x.id === L.modelo);
  $("look").classList.toggle("hidden", !m);
  if (!m) return;
  const poner = i => {
    const p = L.puntos[i];
    $("look-foto").querySelectorAll(".punto").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
    $("look-item").innerHTML = `<b>${p.t}</b><p>${typeof p.d === "function" ? p.d() : p.d}</p>`;
  };
  $("look-foto").innerHTML = `<img src="${L.foto}" alt="${L.alt}" loading="lazy">` +
    L.puntos.map(p => `<button type="button" class="punto" style="left:${p.x}%;top:${p.y}%" aria-pressed="false" aria-label="${p.t}"></button>`).join("");
  $("look-foto").querySelectorAll(".punto").forEach((b, i) => (b.onclick = () => poner(i)));
  poner(0);
  $("look-cta").onclick = () => {
    if (m.colores.includes(L.color)) quickView(m, L.color, $("look-cta"));
    else $("personaliza").scrollIntoView();
  };
}
// Flechas del carrusel de desplazamiento (testimonios)
const railNav = (rail, prev, next) => {
  const paso = dir => $(rail).scrollBy({ left: dir * $(rail).clientWidth * .85, behavior: reduceMotion.matches ? "auto" : "smooth" });
  $(prev).onclick = () => paso(-1);
  $(next).onclick = () => paso(1);
};
railNav("testi", "testi-prev", "testi-next");

// ---------- Tienda física ----------
const tiendaHref = () => NEGOCIO.tiendaOnline || waLink("Hola Multicostura 💗 quiero saber qué modelos hay disponibles en la tienda física");
// Rango del precio tienda, calculado del catálogo (lo usan las preguntas frecuentes)
const minTienda = Math.min(...NEGOCIO.modelos.filter(m => !m.precioFijo && diseñable(m)).map(m => m.precio));
const maxTienda = Math.max(...NEGOCIO.modelos.filter(m => !m.precioFijo && diseñable(m)).map(m => m.precio));

// ---------- Franja de confianza ----------
$("trust").innerHTML = NEGOCIO.confianza.map(c => `<div class="trust-item">${ICONO[c.ico]}<strong>${c.t}</strong><small>${c.d}</small></div>`).join("");

// ---------- Personalizador ----------
const design = { color: null, hilo: "Blanco", qty: 1, tipo: "medida" };
const model = () => NEGOCIO.modelos.find(m => m.id === $("s-model").value) || NEGOCIO.modelos.find(diseñable);
const tipo = () => NEGOCIO.tipos.find(t => t.id === design.tipo);
const precio = (m, t) => (t.precio && !m.precioFijo ? t.precio : m.precio);
NEGOCIO.modelos.filter(diseñable).forEach(m => $("s-model").add(new Option(`${m.nombre} — desde ${pesos(m.precio)}`, m.id)));
const tipoNombre = id => NEGOCIO.tipos.find(t => t.id === id).t;
$("pv-photo").onload = () => $("pv-box").classList.add("has-photo");
$("pv-photo").onerror = () => { $("pv-box").classList.remove("has-photo"); $("pv-photo").removeAttribute("src"); };
$("s-model").addEventListener("change", () => { design.color = model().colores[0];
{ // vienen de la vista rápida del catálogo (?modelo=&color=)
  const q = new URLSearchParams(location.search), m = NEGOCIO.modelos.find(x => x.id === q.get("modelo") && diseñable(x));
  if (m) { $("s-model").value = m.id; design.color = m.colores.includes(q.get("color")) ? q.get("color") : m.colores[0]; }
} renderDesign(); });

function optButtons(box, items, current, onPick, swatch, label = it => it) {
  box.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = it === current ? "on" : "";
    b.setAttribute("aria-pressed", it === current);
    b.innerHTML = (swatch ? `<i style="background:${swatch(it)}"></i>` : "") + label(it);
    b.onclick = () => { onPick(it); renderDesign(); };
    box.appendChild(b);
  });
}
const discount = q => NEGOCIO.descuentos.reduce((d, [min, pct]) => (q >= min ? pct : d), 0);

// Resumen del diseño (se usa en la cotización, la cita y los mensajes)
function designInfo() {
  const m = model(), t = tipo();
  const name = $("s-name").value.trim(), role = $("s-role").value.trim();
  const bord = (name ? NEGOCIO.bordado.nombre : 0) + (role ? NEGOCIO.bordado.profesion : 0);
  const base = precio(m, t);
  const unit = base + bord;
  const pct = discount(design.qty);
  const sub = unit * design.qty;
  const desc = Math.round(sub * pct);
  const bordTxt = name || role ? `${[name, role].filter(Boolean).join(" / ")} (hilo ${design.hilo.toLowerCase()})` : "sin bordado";
  return { m, t, base, name, role, bord, pct, sub, desc, total: sub - desc,
    texto: `${m.nombre} (${t.t.toLowerCase()}), ${design.color.toLowerCase()}, bordado: ${bordTxt}, x${design.qty}` };
}

function renderDesign() {
  const m = model();
  if (!m.colores.includes(design.color)) design.color = m.colores[0];
  optButtons($("s-tipo"), NEGOCIO.tipos.map(t => t.id), design.tipo, id => (design.tipo = id), null, tipoNombre);
  $("made-t").textContent = tipo().t + ":";
  $("made-d").textContent = tipo().d;
  optButtons($("s-colors"), m.colores, design.color, c => (design.color = c), C);
  optButtons($("s-thread"), Object.keys(NEGOCIO.hilos), design.hilo, h => (design.hilo = h), h => NEGOCIO.hilos[h]);
  $("s-color-name").textContent = design.color;
  $("q").textContent = design.qty;

  // Foto del color elegido (si hay): el bordado se muestra en el parche #pv-bord encima
  const foto = (m.fotos || {})[design.color], box = $("pv-box"), img = $("pv-photo");
  if (!foto) { box.classList.remove("has-photo"); img.removeAttribute("src"); }
  else if (img.getAttribute("src") !== foto) { box.classList.remove("has-photo"); img.src = foto; }
  const fill = C(design.color);
  const use = $("pv").querySelector("use");
  if (use) {
    use.style.fill = fill;
    use.style.stroke = design.color === "Blanco" ? "#e5d6dd" : "none";
  }
  const d = designInfo();
  let thread = NEGOCIO.hilos[design.hilo];
  if (thread.toLowerCase() === fill.toLowerCase()) thread = design.hilo === "Blanco" ? "#1f1d22" : "#ffffff";
  ["pv-name", "pv-role"].forEach(id => $(id).setAttribute("fill", thread));
  $("pv-name").textContent = d.name || "Tu nombre";
  $("pv-name").style.opacity = d.name ? 1 : .45;
  $("pv-role").textContent = d.role.toUpperCase();
  // Sobre la foto el bordado va en un parche con la tela y el hilo elegidos
  const bord = $("pv-bord"), nombreB = d.name || "Tu nombre";
  bord.style.setProperty("--tela", fill);
  bord.style.setProperty("--hilo", thread);
  $("pv-bn").textContent = nombreB;
  $("pv-bn").style.opacity = d.name ? 1 : .5;
  $("pv-bn").style.setProperty("--len", Math.max(10, nombreB.length));
  $("pv-br").textContent = d.role;
  $("pv-br").style.setProperty("--len", Math.max(12, Math.ceil(d.role.length * 1.25)));
  img.alt = `${m.nombre} en color ${design.color.toLowerCase()}` + (d.name || d.role ? `, con el bordado ${[d.name, d.role].filter(Boolean).join(", ")}` : "");
  $("pv-cap").textContent = `${m.nombre}, ${design.color.toLowerCase()}, ${d.t.t.toLowerCase()}` +
    ((m.simulados || []).includes(design.color) ? ". Color de referencia: el tono real de la tela puede variar." : "");

  $("quote").innerHTML = `
    <div><span>${m.nombre} (${d.t.t.toLowerCase()})</span><span>${pesos(d.base)}</span></div>
    ${d.bord ? `<div><span>Bordado</span><span>${pesos(d.bord)}</span></div>` : ""}
    <div><span>Cantidad</span><span>× ${design.qty}</span></div>
    ${d.desc ? `<div style="color:#9be3b3"><span>Descuento por cantidad (${d.pct * 100}%)</span><span>−${pesos(d.desc)}</span></div>` : ""}
    <div class="total"><span>Total estimado</span><span>${pesos(d.total)}</span></div>
    <small>El precio final se confirma al tomar tus medidas. ${NEGOCIO.envio}</small>`;
  $("tiers").innerHTML = NEGOCIO.descuentos.filter(([, p]) => p).map(([min, p]) =>
    `<span class="${d.pct === p ? "on" : ""}">${min}+ uniformes: −${p * 100}%</span>`).join("");
  renderSummary();
}
["s-name", "s-role"].forEach(id => $(id).addEventListener("input", renderDesign));
$("q-minus").onclick = () => { design.qty = Math.max(1, design.qty - 1); renderDesign(); renderAgenda(); };
$("q-plus").onclick = () => { design.qty = Math.min(30, design.qty + 1); renderDesign(); renderAgenda(); };
$("s-ask").onclick = () => {
  const d = designInfo();
  openWa(`Hola Multicostura 💗 tengo una pregunta sobre este diseño:\n• ${d.texto}\n• Total estimado: ${pesos(d.total)}`);
};

// ---------- Agenda: datos (Google Sheets o modo demo) ----------
const DEMO_KEY = "multicostura-demo-citas";
const demo = !NEGOCIO.apiUrl;
// La nota de modo demostración es para quien desarrolla: se ve solo con ?dev en la dirección
const mostrarNotaDemo = () => $("demo-note").classList.toggle("hidden", !(demo && /[?&]dev\b/.test(location.search)));
mostrarNotaDemo();
const demoRead = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || []; } catch { return []; } };
const demoWrite = l => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(l)); } catch {} };

// [{fecha, hora, dur}] ya incluye el margen de traslado de cada cita
async function fetchBusy(from, to) {
  if (demo) return demoRead().filter(c => c.fecha >= from && c.fecha <= to);
  const r = await fetch(`${NEGOCIO.apiUrl}?action=busy&from=${from}&to=${to}`);
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "error");
  return j.busy;
}
async function saveBooking(cita) {
  if (demo) {
    const l = demoRead();
    if (overlaps(cita.fecha, toMin(cita.hora), cita.dur + cita.margen, l)) return { ok: false, error: "ocupado" };
    l.push({ fecha: cita.fecha, hora: cita.hora, dur: cita.dur + cita.margen });
    demoWrite(l);
    return { ok: true };
  }
  // text/plain evita el "preflight" CORS que Apps Script no responde
  const r = await fetch(NEGOCIO.apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(cita) });
  return r.json();
}
const overlaps = (fecha, start, len, busy) =>
  busy.some(b => b.fecha === fecha && start < toMin(b.hora) + b.dur && toMin(b.hora) < start + len);

// ---------- Agenda: flujo ----------
const ag = { modo: null, fecha: null, hora: null, busy: [], mes: null, activo: null };
// "Hoy" sale del reloj; window.HOY_TEST ("AAAA-MM-DD") lo fija solo en las pruebas.
const ahora = () => (window.HOY_TEST ? fromIso(window.HOY_TEST) : new Date());
const hoyIso = () => isoDate(ahora());
const addDias = (f, n) => { const d = fromIso(f); return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)); };
// Última fecha reservable: hoy + diasVisibles - 1 (la ventana incluye hoy)
const ultimoDia = () => addDias(hoyIso(), NEGOCIO.diasVisibles - 1);
const mesDe = f => f.slice(0, 7);
ag.mes = mesDe(hoyIso());

const citaMin = () => NEGOCIO.minutosBase + NEGOCIO.minutosPorPersona * design.qty;
const margen = () => NEGOCIO.margen[ag.modo] || 0;
const presencial = () => ag.modo && ag.modo !== "casa";

// Turnos del día dentro del horario: [{h, libre}]. Los que ya pasaron hoy no se incluyen.
function slotsDelDia(fecha) {
  const rangos = NEGOCIO.horario[fromIso(fecha).getDay()];
  if (!rangos) return [];
  const dur = citaMin(), len = dur + margen();
  const now = ahora();
  const minStart = fecha === isoDate(now) ? now.getHours() * 60 + now.getMinutes() + NEGOCIO.anticipacion : -1;
  const out = [];
  rangos.forEach(([a, b]) => {
    for (let m = toMin(a); m + dur <= toMin(b); m += NEGOCIO.paso) {
      if (m >= minStart) out.push({ h: toHHMM(m), libre: !overlaps(fecha, m, len, ag.busy) });
    }
  });
  return out;
}
const freeSlots = fecha => (presencial() ? slotsDelDia(fecha).filter(s => s.libre).map(s => s.h) : []);

// "disponible" | "lleno" | "cerrado" | "pasado" | "fuera"
function estadoDia(f) {
  if (f < hoyIso()) return "pasado";
  if (f > ultimoDia()) return "fuera";
  if (!NEGOCIO.horario[fromIso(f).getDay()]) return "cerrado";
  const s = slotsDelDia(f);
  if (!s.length) return "pasado";
  return s.some(x => x.libre) ? "disponible" : "lleno";
}

function renderModes() {
  $("modes").innerHTML = "";
  NEGOCIO.modalidades.forEach(mo => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mode" + (ag.modo === mo.id ? " on" : ""); b.setAttribute("aria-pressed", ag.modo === mo.id);
    const extra = mo.id === "domicilio" ? ` <b>+${pesos(NEGOCIO.recargoDomicilio)}</b>` : "";
    b.innerHTML = `${ICONO[mo.ico]}<b>${mo.t}${extra}</b><small>${mo.d}</small>`;
    b.onclick = () => {
      ag.modo = mo.id; ag.hora = null;
      if (ag.fecha && !freeSlots(ag.fecha).length) ag.fecha = null;
      renderAgenda();
      (presencial() ? $("st-day") : $("st-data")).scrollIntoView({ block: "nearest" });
    };
    $("modes").appendChild(b);
  });
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const nombreDia = f => { const d = fromIso(f); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
const ETIQ = { disponible: "disponible", lleno: "lleno", cerrado: "cerrado", pasado: "no disponible", fuera: "fuera del plazo de reserva" };
const mesPermitido = m => m >= mesDe(hoyIso()) && m <= mesDe(ultimoDia());

async function cambiarMes(nuevo, foco) {
  if (!mesPermitido(nuevo)) return;
  ag.mes = nuevo;
  if (foco) ag.activo = foco;
  await loadBusy();
  renderDays();
  if (foco) { const b = $("days").querySelector(`[data-fecha="${foco}"]`); if (b) b.focus(); }
}
const mesDelta = d => { const [y, m] = ag.mes.split("-").map(Number); return mesDe(isoDate(new Date(y, m - 1 + d, 1))); };

function renderDays() {
  const box = $("days");
  const [y, m] = ag.mes.split("-").map(Number);
  const n = new Date(y, m, 0).getDate();
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // lunes primero
  const hoy = hoyIso();
  const fechas = Array.from({ length: n }, (_, i) => `${ag.mes}-${pad(i + 1)}`);
  const act = [ag.activo, ag.fecha].find(f => f && mesDe(f) === ag.mes);
  const foco = act || fechas.find(f => estadoDia(f) === "disponible") || fechas[0];
  let filas = "", celdas = "<td></td>".repeat(offset);
  fechas.forEach((f, i) => {
    const est = estadoDia(f), sel = ag.fecha === f;
    celdas += `<td><button type="button" class="cal-day ${est}${sel ? " on" : ""}" data-fecha="${f}" tabindex="${f === foco ? 0 : -1}"${f === foco ? ` data-activo="${f}"` : ""}` +
      `${est === "disponible" ? "" : ' aria-disabled="true"'} aria-pressed="${sel}"${f === hoy ? ' aria-current="date"' : ""}` +
      ` aria-label="${nombreDia(f)}, ${ETIQ[est]}"><span>${i + 1}</span>${est === "lleno" ? "<small>Lleno</small>" : ""}</button></td>`;
    if ((offset + i + 1) % 7 === 0 || i === n - 1) { filas += `<tr>${celdas}</tr>`; celdas = ""; }
  });
  const titulo = `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`;
  const cab = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    .map(d => `<th scope="col"><abbr title="${d}">${d === "miércoles" ? "X" : d[0].toUpperCase()}</abbr></th>`).join("");
  box.innerHTML = `<div class="cal-head">
      <button type="button" class="cal-prev" aria-label="Mes anterior"${mesPermitido(mesDelta(-1)) ? "" : " disabled"}>${ICONO.chevL}</button>
      <strong class="cal-title" aria-live="polite">${titulo}</strong>
      <button type="button" class="cal-next" aria-label="Mes siguiente"${mesPermitido(mesDelta(1)) ? "" : " disabled"}>${ICONO.chevR}</button>
    </div>
    <table class="cal-grid" role="grid" aria-label="${titulo}"><thead><tr>${cab}</tr></thead><tbody>${filas}</tbody></table>
    <p class="cal-leyenda"><span class="lg lg-ok"></span>Disponible <span class="lg lg-full"></span>Lleno</p>`;
  box.querySelector(".cal-prev").onclick = () => cambiarMes(mesDelta(-1));
  box.querySelector(".cal-next").onclick = () => cambiarMes(mesDelta(1));
  box.querySelectorAll(".cal-day").forEach(b => {
    const f = b.dataset.fecha;
    b.onclick = () => {
      if (b.getAttribute("aria-disabled") === "true") return;
      ag.fecha = f; ag.activo = f; ag.hora = null; renderAgenda();
    };
    b.onkeydown = e => {
      const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (paso === undefined) return;
      e.preventDefault();
      const dest = addDias(f, paso);
      if (!mesPermitido(mesDe(dest))) return;
      if (mesDe(dest) !== ag.mes) { cambiarMes(mesDe(dest), dest); return; }
      ag.activo = dest;
      box.querySelectorAll(".cal-day").forEach(x => { x.tabIndex = -1; x.removeAttribute("data-activo"); });
      const t = box.querySelector(`[data-fecha="${dest}"]`);
      t.tabIndex = 0; t.dataset.activo = dest; t.focus();
    };
  });
}

function renderSlots() {
  const box = $("slots"), dur = $("dur");
  dur.classList.toggle("hidden", !ag.fecha);
  if (!ag.fecha) { box.innerHTML = `<p class="empty">Elige un día primero.</p>`; return; }
  dur.textContent = `Duración: ${citaMin()} minutos${ag.modo === "domicilio" ? " más el traslado" : ""}`;
  const s = slotsDelDia(ag.fecha);
  box.innerHTML = s.length ? "" : `<p class="empty">No quedan horarios este día. Prueba otro.</p>`;
  s.forEach(({ h, libre }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (ag.hora === h ? " on" : ""); b.setAttribute("aria-pressed", ag.hora === h);
    b.textContent = hora12(h);
    if (!libre) { b.disabled = true; b.setAttribute("aria-label", `${hora12(h)}, ocupado`); }
    else b.onclick = () => { ag.hora = h; renderAgenda(); $("st-data").scrollIntoView({ block: "nearest" }); };
    box.appendChild(b);
  });
}

function renderSummary() {
  if (!ag.modo) return;
  const d = designInfo();
  const mo = NEGOCIO.modalidades.find(x => x.id === ag.modo);
  const rows = [`<span><strong>${mo.t}</strong>${ag.modo === "domicilio" ? `, recargo ${pesos(NEGOCIO.recargoDomicilio)}` : ""}</span>`];
  if (presencial() && ag.hora) rows.push(`<span>Fecha: <strong>${largo(ag.fecha)}</strong> a las <strong>${hora12(ag.hora)}</strong> (${citaMin()} min)</span>`);
  rows.push(`<span>Tu diseño: ${d.texto}</span>`);
  rows.push(`<span>Estimado: <strong>${pesos(d.total)}</strong></span>`);
  $("summary").innerHTML = rows.join("");
}

function renderAgenda() {
  renderModes();
  const p = presencial();
  $("cal-row").classList.toggle("hidden", ag.modo === "casa");
  $("st-day").classList.toggle("off", !p);
  $("st-hour").classList.toggle("off", !ag.fecha);
  $("st-data").classList.toggle("off", !(ag.modo === "casa" || ag.hora));
  $("data-num").textContent = ag.modo === "casa" ? "2" : "4";
  $("lock-data").textContent = !ag.modo ? "Primero elige cómo tomamos tus medidas." : !ag.fecha ? "Primero elige un día y una hora." : "Primero elige una hora.";
  if (p) { renderDays(); renderSlots(); }
  // Campos según modalidad
  $("f-addr-wrap").classList.toggle("hidden", ag.modo !== "domicilio");
  $("f-addr").required = ag.modo === "domicilio";
  $("f-city-wrap").classList.toggle("hidden", ag.modo !== "casa");
  $("f-city").required = ag.modo === "casa";
  $("self-measures").classList.toggle("hidden", ag.modo !== "casa");
  $("guia-inline").hidden = ag.modo !== "casa";
  $("mgrid").querySelectorAll("input").forEach(i => (i.required = ag.modo === "casa"));
  $("f-submit").textContent = ag.modo === "casa" ? "Enviar mis medidas por WhatsApp" : "Agendar mi cita";
  renderSummary();
}

// Diagrama de medidas: una marca por cada elemento de NEGOCIO.medidas, en el mismo orden (busto, cintura, cadera, manga, pantalón, hombros, estatura).
const MARCAS = [
  { d: "M52 80H148", x: 174, y: 80 },
  { d: "M50 120H150", x: 174, y: 120 },
  { d: "M48 176H152", x: 174, y: 176 },
  { d: "M24 44L10 98", x: -8, y: 71 },
  { d: "M150 156L156 292", x: 178, y: 226 },
  { d: "M62 20H138", x: 100, y: -3 },
  { d: "M212 14V292M205 23l7-9 7 9M205 283l7 9 7-9", x: 212, y: 153, solid: true },
];
const diagrama = () => `<svg viewBox="0 0 262 322" role="img" aria-label="Dibujo de un uniforme con las ${MARCAS.length} medidas numeradas">
  <g transform="translate(24 18)"><use href="#scrub" width="200" height="300" style="fill:#f4b6d2"/>
    ${MARCAS.map(m => `<path d="${m.d}" fill="none" stroke="#ad1765" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"${m.solid ? "" : ' stroke-dasharray="6 5"'}/>`).join("")}
    ${MARCAS.map((m, i) => `<circle cx="${m.x}" cy="${m.y}" r="12.500" fill="#ad1765"/><text x="${m.x}" y="${m.y}" dy=".35em" text-anchor="middle" font-family="Open Sans, sans-serif" font-size="15" font-weight="700" fill="#fff">${i + 1}</text>`).join("")}
  </g></svg>`;
$("diagrama-inline").innerHTML = $("diagrama-guia").innerHTML = diagrama();

// Campos de medidas para "Me mido en casa": [nombre, cómo medir, mínimo, máximo] de NEGOCIO.medidas
NEGOCIO.medidas.forEach(([t, d, min, max], i) => $("mgrid").insertAdjacentHTML("beforeend",
  `<div class="mfield"><span class="mnum" aria-hidden="true">${i + 1}</span>
    <div class="mtxt"><label for="m-${i + 1}">${t}</label><span class="mhint" id="m-${i + 1}-h">${d}</span></div>
    <div class="munit"><input id="m-${i + 1}" type="number" inputmode="decimal" min="${min}" max="${max}" step="0.5" data-m="${t}" aria-describedby="m-${i + 1}-h m-${i + 1}-u"><span class="u" id="m-${i + 1}-u">cm</span></div></div>`));

// Trae las citas del mes que se ve (acotado a la ventana de reserva) y reemplaza las de ese rango.
async function loadBusy() {
  const from = [`${ag.mes}-01`, hoyIso()].sort().pop();
  const to = [isoDate(new Date(+ag.mes.slice(0, 4), +ag.mes.slice(5), 0)), ultimoDia()].sort()[0];
  try { ag.busy = ag.busy.filter(b => b.fecha < from || b.fecha > to).concat(await fetchBusy(from, to)); }
  catch { $("slots").innerHTML = `<p class="err">No pude cargar la agenda. Escríbenos por WhatsApp.</p>`; }
}

$("form").addEventListener("submit", async e => {
  e.preventDefault();
  const d = designInfo();
  const nombre = $("f-name").value.trim(), tel = $("f-phone").value.replace(/\D/g, ""), notas = $("f-notes").value.trim();

  // Otra ciudad: no hay cita, se mandan las medidas por WhatsApp
  if (ag.modo === "casa") {
    const ms = [...$("mgrid").querySelectorAll("input")].map(i => `• ${i.dataset.m}: ${i.value} cm`);
    openWa([`Hola Multicostura 💗 soy ${nombre} y estoy en ${$("f-city").value.trim()}. Quiero este uniforme:`,
      `• ${d.texto}`, `• Total estimado: ${pesos(d.total)}`, ``, `Mis medidas:`, ...ms,
      notas ? `\nNotas: ${notas}` : null].filter(x => x !== null).join("\n"));
    return;
  }

  const cita = {
    fecha: ag.fecha, hora: ag.hora, dur: citaMin(), margen: margen(),
    modalidad: ag.modo === "domicilio" ? "Domicilio" : "Taller",
    nombre, telefono: tel, direccion: ag.modo === "domicilio" ? $("f-addr").value.trim() : "",
    diseno: d.texto, cantidad: design.qty, total: d.total, notas,
  };
  const btn = $("f-submit"), err = $("f-error");
  btn.disabled = true; btn.textContent = "Agendando…"; err.classList.add("hidden");
  try {
    const res = await saveBooking(cita);
    if (!res.ok) {
      await loadBusy(); ag.hora = null; renderAgenda();
      err.textContent = res.error === "ocupado" ? "Ese horario se acaba de ocupar. Elige otro, por favor." : "No se pudo agendar. Intenta de nuevo o escríbenos por WhatsApp.";
      err.classList.remove("hidden");
      return;
    }
    ag.busy.push({ fecha: cita.fecha, hora: cita.hora, dur: cita.dur + cita.margen });
    const lugar = ag.modo === "domicilio" ? cita.direccion : `en el taller (${NEGOCIO.direccionTaller})`;
    $("done-text").innerHTML = `Toma de medidas ${ag.modo === "domicilio" ? "a domicilio" : "en el taller"}<br><b>${largo(cita.fecha)} a las ${hora12(cita.hora)}</b><br>${lugar}`;
    $("done-wa").href = waLink(
      `Hola Multicostura 💗 agendé mi toma de medidas en la página:\n` +
      `• ${cita.modalidad}: ${largo(cita.fecha)} a las ${hora12(cita.hora)}\n` +
      (cita.direccion ? `• Dirección: ${cita.direccion}\n` : "") +
      `• Diseño: ${d.texto}\n• Total estimado: ${pesos(d.total)}` +
      (notas ? `\n• Notas: ${notas}` : "") + `\nSoy ${nombre}.`);
    $("flow").classList.add("hidden");
    $("done").classList.remove("hidden");
    $("agenda").scrollIntoView();
  } catch {
    err.textContent = "Sin conexión. Intenta de nuevo o escríbenos por WhatsApp.";
    err.classList.remove("hidden");
  } finally {
    btn.disabled = false; renderAgenda();
  }
});
// Errores de validación: el navegador marca el campo y aquí se anuncia con texto (no solo con color)
const nombreCampo = el => ((el.labels && el.labels[0]) ? el.labels[0].childNodes[0].textContent : el.id).trim().replace(/\s+$/, "");
$("form").addEventListener("invalid", e => {
  e.target.setAttribute("aria-invalid", "true");
  const err = $("f-error");
  err.textContent = `Revisa este campo: ${nombreCampo(e.target)}. ${e.target.validationMessage}`;
  err.classList.remove("hidden");
}, true);
$("form").addEventListener("input", e => e.target.removeAttribute("aria-invalid"));
$("done-again").onclick = () => {
  ag.fecha = ag.hora = null;
  $("form").reset();
  $("done").classList.add("hidden");
  $("flow").classList.remove("hidden");
  renderAgenda();
};

// ---------- Proceso y guía de medidas ----------
$("process").innerHTML = NEGOCIO.proceso.map(([t, d]) => `<li><b>${t}</b><p>${d}</p></li>`).join("");
$("measures").innerHTML = NEGOCIO.medidas.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("");

// ---------- Empresas ----------
const in3w = new Date(Date.now() + 21 * 86400000);
$("b-date").value = isoDate(in3w);
$("biz").addEventListener("submit", e => {
  e.preventDefault();
  const fecha = fromIso($("b-date").value).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  openWa(`Hola Multicostura 💗 quiero cotizar uniformes para mi equipo y agendar visita para tomar medidas:\n` +
    `• Empresa: ${$("b-company").value.trim()}\n• Personas: ${$("b-qty").value}\n` +
    `• Ciudad: ${$("b-city").value.trim()}\n• Para el: ${fecha}\n• Logo bordado: ${$("b-logo").checked ? "sí" : "no"}`);
});

// ---------- Bono ----------
let bono = NEGOCIO.bonos[1];
function renderBono() {
  $("amounts").innerHTML = "";
  NEGOCIO.bonos.forEach(v => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = pesos(v); b.className = v === bono ? "on" : ""; b.setAttribute("aria-pressed", v === bono);
    b.onclick = () => { bono = v; renderBono(); };
    $("amounts").appendChild(b);
  });
  $("g-amount").textContent = pesos(bono);
  const para = $("g-to").value.trim(), de = $("g-from").value.trim();
  $("g-names").textContent = para && de ? `Para ${para}, de ${de}` : "Escribe para quién es y de parte de quién";
}
["g-to", "g-from"].forEach(id => $(id).addEventListener("input", renderBono));
$("bono").addEventListener("submit", e => {
  e.preventDefault();
  openWa(`Hola Multicostura 💗 quiero comprar un bono de regalo:\n• Valor: ${pesos(bono)}\n• Para: ${$("g-to").value.trim()}\n• De: ${$("g-from").value.trim()}`);
});

// ---------- Clientas e info ----------
let clientasRonda = 0;
async function renderClientas() {
  const ronda = ++clientasRonda;
  $("clientas").classList.add("hidden");
  $("clients").innerHTML = "";
  const reales = NEGOCIO.clientas.filter(c => !c.ejemplo);
  const ok = await Promise.all(reales.map(c => fotoCarga(c.foto)));
  if (ronda !== clientasRonda) return;
  const lista = reales.filter((c, i) => ok[i]);
  $("clients").innerHTML = lista.map(c => `<figure><img src="${c.foto}" alt="Clienta con su uniforme Multicostura" loading="lazy"><figcaption>${c.texto}</figcaption></figure>`).join("");
  $("clientas").classList.toggle("hidden", !lista.length);
}
renderClientas();
// Los testimonios de ejemplo (ejemplo: true) nunca se muestran: la sección aparece cuando hay uno real
function renderTestimonios() {
  const reales = NEGOCIO.testimonios.filter(t => !t.ejemplo);
  $("testimonios").classList.toggle("hidden", !reales.length);
  $("testi").innerHTML = reales.map(t => `<figure class="quote-card" role="group" aria-roledescription="diapositiva"><blockquote>${t.texto}</blockquote><figcaption><b>${t.nombre}</b><span>${t.oficio}</span></figcaption></figure>`).join("");
  requestAnimationFrame(ajustarRail);
}
// Si todas las opiniones caben, no hay carrusel: se centran y las flechas se ocultan
function ajustarRail() {
  const r = $("testi"), cabe = r.scrollWidth <= r.clientWidth + 1;
  r.classList.toggle("fits", cabe);
  $("testi-prev").hidden = $("testi-next").hidden = cabe;
  if (cabe) r.removeAttribute("aria-roledescription"); else r.setAttribute("aria-roledescription", "carrusel");
}
addEventListener("resize", ajustarRail);
renderTestimonios();
function renderFooter() {
  $("f-address").textContent = $("n-address").textContent = NEGOCIO.direccionTaller;
  const n = NEGOCIO.whatsapp;
  $("f-tel").href = `tel:+${n}`;
  $("f-tel").textContent = `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
  $("f-mail").href = `mailto:${NEGOCIO.correo}`;
  $("f-mail").textContent = NEGOCIO.correo;
  $("f-horario").textContent = NEGOCIO.horarioTexto;
  $("f-copy").textContent = `© ${new Date().getFullYear()} Multicostura. Todos los derechos reservados.`;
}
renderFooter();
function renderMapa() {
  const q = NEGOCIO.mapa || NEGOCIO.direccionTaller;
  $("map").innerHTML = `<iframe title="Mapa del taller Multicostura" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed"></iframe>`;
}
renderMapa();
$("stock-btn").href = tiendaHref();
if (NEGOCIO.videos.length) {
  $("videos").classList.remove("hidden");
  // Incrustados (TikTok, Instagram, YouTube): se reproducen desde la red social, sin peso para el hosting
  const embed = (src, v, cls = "") => `<iframe${cls ? ` class="${cls}"` : ""} title="${v.titulo || "Video"}" loading="lazy" allowfullscreen allow="encrypted-media; picture-in-picture; fullscreen" src="${src}"></iframe>`;
  $("vids").innerHTML = NEGOCIO.videos.map(v => `<figure>${
    v.tiktok ? embed(`https://www.tiktok.com/player/v1/${encodeURIComponent(v.tiktok)}?description=0&music_info=0&rel=0`, v, "vert")
    : v.instagram ? embed(`https://www.instagram.com/reel/${encodeURIComponent(v.instagram)}/embed/`, v, "vert ig")
    : v.youtube ? embed(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}`, v)
    : `<video controls preload="metadata" playsinline src="${v.src}"></video>`}${v.titulo ? `<figcaption>${v.titulo}</figcaption>` : ""}</figure>`).join("");
  $("vids").classList.toggle("vert-grid", NEGOCIO.videos.every(v => v.tiktok || v.instagram));
}
$("f-ig").href = $("ig-btn").href = NEGOCIO.instagram;
$("f-tt").href = NEGOCIO.tiktok;
$("f-wa").href = $("f-wa-txt").href = $("wa-float").href = $("hdr-wa").href = waLink("Hola Multicostura 💗 quiero información");

// ---------- Chatbot de preguntas frecuentes (sin IA ni red: coincidencia por palabras clave) ----------
const normaliza = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
const faqDe = texto => {
  const palabras = new Set(normaliza(texto).split(/\s+/).filter(Boolean));
  let mejor = null, max = 0;
  NEGOCIO.faq.forEach(f => {
    const puntos = f.claves.filter(c => palabras.has(normaliza(c).trim())).length;
    if (puntos > max) { max = puntos; mejor = f; }
  });
  return mejor;
};
const respuesta = f => (typeof f.a === "function" ? f.a(NEGOCIO) : f.a);
const chat = { preguntas: [] };
const burbuja = (texto, yo) => {
  const b = document.createElement("div");
  b.className = "bubble" + (yo ? " me" : "");
  b.textContent = texto;
  $("chat-log").appendChild(b);
  $("chat-log").scrollTop = $("chat-log").scrollHeight;
  return b;
};
function preguntar(texto) {
  burbuja(texto, true);
  chat.preguntas.push(texto);
  const f = faqDe(texto);
  if (f) return burbuja(respuesta(f));
  const b = burbuja("No encontré eso. ¿Te comunico por WhatsApp?");
  const a = document.createElement("a");
  a.className = "btn btn-wa"; a.target = "_blank"; a.rel = "noopener";
  a.textContent = "Hablar por WhatsApp";
  a.href = waLink(`Hola Multicostura 💗 tengo una pregunta que no encontré en el asistente:\n${chat.preguntas.slice(-3).map(q => "• " + q).join("\n")}`);
  b.appendChild(document.createElement("br")); b.appendChild(a);
}
function abrirChat(abrir) {
  $("chat-panel").hidden = !abrir;
  $("chat-btn").setAttribute("aria-expanded", abrir);
  if (abrir) {
    if (!$("chat-log").children.length) burbuja("Hola, soy el asistente de Multicostura. Elige una pregunta o escribe la tuya.");
    $("chat-input").focus();
  } else $("chat-btn").focus();
}
NEGOCIO.faq.forEach(f => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "faq-chip"; b.textContent = f.q;
  b.onclick = () => { burbuja(f.q, true); chat.preguntas.push(f.q); burbuja(respuesta(f)); };
  $("chat-chips").appendChild(b);
});
$("chat-btn").onclick = () => abrirChat($("chat-panel").hidden);
$("chat-close").onclick = () => abrirChat(false);
$("chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const t = $("chat-input").value.trim();
  if (t) { $("chat-input").value = ""; preguntar(t); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("chat-panel").hidden) abrirChat(false); });

// Preguntas frecuentes en acordeón (mismos datos y respuestas que el chatbot)
function renderFaq() {
  $("faq-list").innerHTML = NEGOCIO.faq.map((f, i) => `<div class="faq-item"><h3><button type="button" class="faq-q" id="faq-q${i}" aria-expanded="false" aria-controls="faq-a${i}">${f.q}</button></h3><div class="faq-a" id="faq-a${i}" role="region" aria-labelledby="faq-q${i}" hidden><p>${respuesta(f)}</p></div></div>`).join("");
  $("faq-list").querySelectorAll(".faq-q").forEach(b => (b.onclick = () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    $(b.getAttribute("aria-controls")).hidden = !open;
  }));
}
renderFaq();

design.color = model().colores[0];
{ // vienen de la vista rápida del catálogo (?modelo=&color=)
  const q = new URLSearchParams(location.search), m = NEGOCIO.modelos.find(x => x.id === q.get("modelo") && diseñable(x));
  if (m) { $("s-model").value = m.id; design.color = m.colores.includes(q.get("color")) ? q.get("color") : m.colores[0]; }
}
if (NEGOCIO.guiaTallas) {
  const g = $("guia-img");
  g.onerror = () => ($("guia").closest("details") || {}).hidden = true; // si no carga, la guía original queda oculta
  g.src = NEGOCIO.guiaTallas;
}
// En el celular, los botones flotantes se apartan mientras hay un formulario en pantalla (no tapan campos ni el botón de envío)
{
  const visibles = new Set(), movil = matchMedia("(max-width: 640px)");
  const sync = () => document.body.classList.toggle("fab-off", movil.matches && visibles.size > 0);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target))); sync(); });
    ["form", "biz", "bono"].forEach(id => io.observe($(id)));
    movil.addEventListener("change", sync);
  }
}
if (document.getElementById("models")) { leerUrl(); renderProfs(); renderModels(); catLead(); }
renderRecomendados(); renderLook(); renderTallas(); renderDesign(); renderBono();
loadBusy().then(renderAgenda);
