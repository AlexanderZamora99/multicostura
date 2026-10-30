    NEGOCIO.modelos.forEach(m => (m.colores ||= Object.keys(NEGOCIO.colores)));

    const $ = id => document.getElementById(id);
    const pesos = n => "$" + Math.round(n).toLocaleString("es-CO");
    const waLink = t => `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(t)}`;
    const openWa = t => window.open(waLink(t), "_blank", "noopener");
    const C = n => NEGOCIO.colores[n] || NEGOCIO.coloresExtra[n];
    const pad = n => String(n).padStart(2, "0");
    const toMin = hhmm => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
    const toHHMM = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    const hora12 = hhmm => { let [h, m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "p. m." : "a. m."; h = h % 12 || 12; return `${h}:${pad(m)} ${ap}`; };
    const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const fromIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
    const largo = s => fromIso(s).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
    const scrub = color => `<svg viewBox="0 0 200 300" aria-hidden="true"><use href="#scrub" style="fill:${color}"/></svg>`;
    const photoOr = (foto, color) => `${scrub(color)}<img src="${foto}" alt="" loading="lazy" onerror="this.remove()">`;
    // El mismo script corre en el inicio (diseñador, agenda...) y en el catálogo (filtros): cada bloque se activa solo donde están sus elementos
    const HOME = !!$("personaliza"), CATALOGO = !!$("panel-filtros");
    // Enlace a una sección del inicio, válido desde cualquiera de las dos páginas
    const aSeccion = id => (HOME ? "#" : "index.html#") + id;
    const irA = id => { if (HOME) location.hash = id; else location.href = aSeccion(id); };

    // ---------- Portada ----------
    // Pasarela: un recuadro grande con las fotos de NEGOCIO.pasarela (en alta resolución, img/pasarela/), una a la vez.
    // Fundido entre dos capas de imagen; flechas, puntos y deslizar con el dedo. Se pausa con el botón, con el cursor
    // encima o con el foco, y queda quieta si la persona pidió reducir el movimiento.
    (function pasarela() {
      const fotos = NEGOCIO.pasarela, box = $("hero-show");
      if (!box || !fotos || !fotos.length) return;
      const capas = [$("hs-a"), $("hs-b")], cap = $("hs-cap"), dots = $("hs-dots"), pp = $("hero-pp");
      let k = 0, visible = 0, pausa = false, timer = null;
      dots.innerHTML = fotos.map((f, i) => `<button type="button" aria-label="Ver ${f.nombre}"></button>`).join("");
      const mostrar = i => {
        k = (i + fotos.length) % fotos.length;
        const f = fotos[k], sig = capas[1 - visible];
        const listo = () => { sig.classList.add("on"); capas[visible].classList.remove("on"); visible = 1 - visible; };
        sig.alt = `Uniforme ${f.nombre}`;
        if (sig.getAttribute("src") === f.foto && sig.complete) listo(); else { sig.onload = listo; sig.src = f.foto; }
        cap.textContent = f.nombre;
        [...dots.children].forEach((d, j) => (j === k ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
        new Image().src = fotos[(k + 1) % fotos.length].foto; // precarga la siguiente
      };
      capas[0].src = fotos[0].foto; capas[0].alt = `Uniforme ${fotos[0].nombre}`;
      cap.textContent = fotos[0].nombre; dots.children[0].setAttribute("aria-current", "true");
      new Image().src = fotos[1 % fotos.length].foto;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      const play = () => { clearInterval(timer); if (!pausa && !reduce.matches) timer = setInterval(() => mostrar(k + 1), 4500); };
      const sync = () => { pp.hidden = reduce.matches; pp.classList.toggle("paused", pausa); pp.setAttribute("aria-label", pausa ? "Reanudar pasarela de uniformes" : "Pausar pasarela de uniformes"); };
      $("hs-prev").onclick = () => { mostrar(k - 1); play(); };
      $("hs-next").onclick = () => { mostrar(k + 1); play(); };
      [...dots.children].forEach((d, i) => (d.onclick = () => { mostrar(i); play(); }));
      pp.onclick = () => { pausa = !pausa; sync(); play(); };
      box.onmouseenter = box.onfocusin = () => clearInterval(timer);
      box.onmouseleave = box.onfocusout = play;
      let x0 = null; // deslizar con el dedo
      box.addEventListener("touchstart", e => (x0 = e.touches[0].clientX), { passive: true });
      box.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { mostrar(k + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
      reduce.addEventListener("change", () => { sync(); play(); });
      sync(); play();
    })();

    // ---------- Modelos ----------
    // Accesorios con estampados: enlace a WhatsApp para pedir un diseño que no está en el catálogo
    const waOtroDiseno = m => waLink(`Hola Multicostura 💗 me interesa${m.articulo === "unas" ? "n" : ""} ${m.articulo || "un"} ${m.nombre.toLowerCase()} con otro diseño. ¿Qué estampados tienen disponibles?`);
    // precio: null = producto sin precio publicado ("Precio a consultar")
    const sinPrecio = m => m.precio == null;
    // Modelos con foto por color (m.fotos): los colores de la tarjeta son botones que cambian la foto
    const swatchButtons = (m, extra) => `
            <div class="swatches" role="group" aria-label="Colores de ${m.nombre}">${m.colores.map((c, i) =>
              `<button type="button" class="sw${i >= 8 ? " extra" : ""}" data-color="${c}" style="--c:${C(c)}" title="${c}" aria-label="Ver ${m.nombre} en color ${c}" aria-pressed="false"></button>`).join("")}${extra > 0 ? `<button type="button" class="sw-more" aria-label="Ver ${extra} colores más">+${extra}</button>` : ""}</div>
            <small class="sw-name" aria-live="polite"></small>`;
    function colorSwitch(el, m) {
      const pic = el.querySelector(".pic"), nombre = el.querySelector(".sw-name");
      el.querySelectorAll(".sw").forEach(b => (b.onclick = () => {
        const c = b.dataset.color;
        el.dataset.color = c;
        el.querySelectorAll(".sw").forEach(x => x.setAttribute("aria-pressed", x === b));
        pic.innerHTML = photoOr(m.fotos[c] || m.foto, C(c));
        pic.querySelector("img").alt = `${m.nombre} en color ${c}`;
        nombre.textContent = (m.simulados || []).includes(c) ? `${c} · color de referencia` : c;
      }));
      const mas = el.querySelector(".sw-more");
      // Con teclado (detail = 0) el foco pasa al primer color nuevo; con el mouse no, para no parecer otra selección
      if (mas) mas.onclick = e => { el.querySelector(".swatches").classList.add("all"); mas.remove(); if (!e.detail) el.querySelector(".sw.extra").focus(); };
    }
    // En el inicio lleva al diseñador con el modelo elegido; desde el catálogo vuelve al inicio con el modelo ya preseleccionado
    // ext (solo en el inicio): { name, role, hilo } con el bordado que la persona ya escribió, para no pedírselo otra vez
    function disenar(m, color, ext) {
      if (!HOME) { location.href = `index.html?modelo=${m.id}&color=${encodeURIComponent(color)}#personaliza`; return; }
      $("s-model").value = m.id; design.color = color;
      if (ext) { $("s-name").value = ext.name; $("s-role").value = ext.role; if (NEGOCIO.hilos[ext.hilo]) design.hilo = ext.hilo; }
      renderDesign(); $("personaliza").scrollIntoView();
    }
    // Pinta las tarjetas de `lista` en `box`; op.forma (id de NEGOCIO.tipos) muestra el precio de esa modalidad
    function renderModels(box, lista, op = {}) {
      box.innerHTML = "";
      const forma = NEGOCIO.tipos.find(t => t.id === op.forma);
      lista.forEach(m => {
        const el = document.createElement("article");
        el.className = "model";
        el.dataset.id = m.id;
        const extra = m.colores.length - 8;
        el.innerHTML = `
          <div class="pic" role="button" tabindex="0" aria-label="Ver detalles de ${m.nombre}">${m.tag ? `<span class="tag">${m.tag}</span>` : ""}${photoOr(m.foto, C(m.colores[0]))}</div>
          <div class="info"><b><button type="button" class="pd-open">${m.nombre}</button></b><p>${m.desc}</p>
            ${m.fotos ? swatchButtons(m, extra) : `<div class="swatches">${m.colores.slice(0, 8).map(c => `<i style="background:${C(c)}" title="${c}"></i>`).join("")}${extra > 0 ? `<small>+${extra}</small>` : ""}</div>`}
            <div class="row">${sinPrecio(m) ? `<strong class="consultar">Consultar precio</strong>` : `<strong>${pesos(forma ? precio(m, forma) : m.precio)}</strong>`}<button type="button" class="design-btn">Diseñar</button></div>
          </div>`;
        el.querySelector(".design-btn").onclick = () => disenar(m, el.dataset.color || m.colores[0]);
        if (m.fotos) colorSwitch(el, m);
        // Ficha ampliada del producto: al tocar la foto o el nombre (con el color que la clienta tenga elegido)
        const abrir = () => abrirProducto(m, el.dataset.color, el.querySelector(".pd-open"));
        // accesorios (gorros) no se diseñan: el botón de la tarjeta abre la ficha para encargar
        if (m.accesorio) {
          el.querySelector(".design-btn").textContent = "Encargar"; el.querySelector(".design-btn").onclick = abrir;
          // nota: otros diseños se piden por WhatsApp
          el.querySelector(".sw-name").insertAdjacentHTML("afterend", `<p class="nota-diseno">¿Quieres otro diseño? <a href="${waOtroDiseno(m)}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a></p>`);
        }
        el.querySelector(".pd-open").onclick = abrir;
        el.querySelector(".pic").onclick = abrir;
        el.querySelector(".pic").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } };
        box.appendChild(el);
      });
    }

    // ---------- Catálogo: filtros ----------
    // Estado de los filtros; vive en la URL (?cat=gorros&forma=pedido&color=rosa&orden=asc) para poder compartir y volver atrás
    const filtros = { cat: "Todos", forma: "", color: "", orden: "" };
    const ORDENES = { "": "Recomendados", asc: "Precio: menor a mayor", desc: "Precio: mayor a menor", nombre: "Nombre (A–Z)" };
    // "Gorros quirúrgicos" -> "gorros": la primera palabra identifica la categoría en la URL
    const slugCat = c => slugColor(c).split("-")[0];
    // Un modelo de precio fijo se vende solo en tienda; el resto también bajo pedido y por medida
    const admiteForma = (m, f) => !f || f === "tienda" || !m.precioFijo;
    const coloresCatalogo = () => {
      const orden = [...Object.keys(NEGOCIO.colores), ...Object.keys(NEGOCIO.coloresExtra)];
      return [...new Set(NEGOCIO.modelos.flatMap(m => m.colores))].sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
    };
    function leerUrl() {
      const q = new URLSearchParams(location.search), c = q.get("cat"), k = q.get("color");
      filtros.cat = (c && NEGOCIO.categorias.find(x => x !== "Todos" && slugCat(x) === slugCat(c))) || "Todos";
      filtros.forma = (NEGOCIO.tipos.find(t => t.id === q.get("forma")) || {}).id || "";
      filtros.color = (k && coloresCatalogo().find(x => slugColor(x) === slugColor(k))) || "";
      filtros.orden = q.get("orden") in ORDENES ? q.get("orden") : "";
    }
    function escribirUrl() {
      const q = new URLSearchParams();
      if (filtros.cat !== "Todos") q.set("cat", slugCat(filtros.cat));
      if (filtros.forma) q.set("forma", filtros.forma);
      if (filtros.color) q.set("color", slugColor(filtros.color));
      if (filtros.orden) q.set("orden", filtros.orden);
      try { history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "")); } catch {}
    }
    function listaFiltrada() {
      const f = filtros, recomendado = m => { const i = NEGOCIO.recomendados.indexOf(m.id); return i < 0 ? 99 : i; };
      const lista = NEGOCIO.modelos.filter(m => (f.cat === "Todos" || m.cat.includes(f.cat)) && admiteForma(m, f.forma) && (!f.color || m.colores.includes(f.color)));
      if (f.orden === "nombre") return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      if (f.orden) {
        // Sin precio publicado siempre al final; el orden es estable
        const forma = NEGOCIO.tipos.find(t => t.id === (f.forma || "tienda")), dir = f.orden === "asc" ? 1 : -1;
        const p = m => (sinPrecio(m) ? null : precio(m, forma));
        return lista.sort((x, y) => (p(x) == null ? (p(y) == null ? 0 : 1) : p(y) == null ? -1 : (p(x) - p(y)) * dir));
      }
      return lista.sort((a, b) => recomendado(a) - recomendado(b));
    }
    // Opciones de categoría y modalidad (con su cantidad) y muestras de color: se dibujan una sola vez
    function renderFiltros() {
      const opcion = (name, value, texto, extra) => `<label class="opt"><input type="radio" name="${name}" value="${value}"><span>${texto}${extra ? `<em>${extra}</em>` : ""}</span></label>`;
      $("profs").innerHTML = NEGOCIO.categorias.map(c => opcion("cat", c, c, NEGOCIO.modelos.filter(m => c === "Todos" || m.cat.includes(c)).length)).join("");
      $("f-forma").innerHTML = opcion("forma", "", "Todas") + NEGOCIO.tipos.map(t => opcion("forma", t.id, t.t)).join("");
      $("f-colores").innerHTML = coloresCatalogo().map(c => `<button type="button" data-color="${c}" style="--c:${C(c)}" title="${c}" aria-label="${c}" aria-pressed="false"></button>`).join("");
      $("orden").innerHTML = Object.entries(ORDENES).map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
    }
    function renderCatalogo() {
      const lista = listaFiltrada(), n = lista.length, f = filtros;
      renderModels($("models"), lista, { forma: f.forma });
      if (!n) $("models").innerHTML = `<div class="vacio"><b>No hay modelos con esos filtros.</b><p>Prueba quitar alguno o empieza de nuevo.</p><button type="button" class="btn btn-mag" id="f-vaciar">Limpiar filtros</button></div>`;
      $("res-cuenta").textContent = `${n} ${n === 1 ? "modelo" : "modelos"}`;
      document.querySelectorAll('#filtros input[name="cat"]').forEach(r => (r.checked = r.value === f.cat));
      document.querySelectorAll('#filtros input[name="forma"]').forEach(r => (r.checked = r.value === f.forma));
      document.querySelectorAll("#f-colores button").forEach(b => b.setAttribute("aria-pressed", b.dataset.color === f.color));
      $("f-color-n").textContent = f.color ? `· ${f.color}` : "";
      $("orden").value = f.orden;
      const activos = [f.cat !== "Todos", f.forma, f.color].filter(Boolean).length;
      $("abrir-filtros").textContent = activos ? `Filtros (${activos})` : "Filtros";
      $("ver-resultados").textContent = `Ver ${n} ${n === 1 ? "modelo" : "modelos"}`;
      escribirUrl();
    }
    const limpiarFiltros = () => { Object.assign(filtros, { cat: "Todos", forma: "", color: "", orden: "" }); renderCatalogo(); };
    // En celular el menú es un cajón con velo; Escape, la X, el velo y "Ver N modelos" lo cierran y el foco vuelve al botón
    let velo = null;
    const cajon = () => $("panel-filtros").classList.contains("abierto");
    function abrirFiltros() {
      $("panel-filtros").classList.add("abierto");
      $("abrir-filtros").setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("filtros-open");
      velo = document.createElement("div"); velo.className = "velo"; velo.onclick = () => cerrarFiltros();
      document.body.appendChild(velo);
      $("cerrar-filtros").focus();
    }
    function cerrarFiltros(volver = true) {
      if (!cajon()) return;
      $("panel-filtros").classList.remove("abierto");
      $("abrir-filtros").setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("filtros-open");
      velo && velo.remove(); velo = null;
      if (volver) $("abrir-filtros").focus();
    }
    function iniciarCatalogo() {
      renderFiltros(); leerUrl();
      $("filtros").addEventListener("change", e => {
        if (e.target.name === "cat" || e.target.name === "forma") { filtros[e.target.name] = e.target.value; renderCatalogo(); }
      });
      $("f-colores").addEventListener("click", e => {
        const b = e.target.closest("button");
        if (b) { filtros.color = filtros.color === b.dataset.color ? "" : b.dataset.color; renderCatalogo(); }
      });
      $("filtros").addEventListener("reset", e => { e.preventDefault(); limpiarFiltros(); });
      $("models").addEventListener("click", e => { if (e.target.closest("#f-vaciar")) limpiarFiltros(); });
      $("orden").addEventListener("change", e => { filtros.orden = e.target.value; renderCatalogo(); });
      $("abrir-filtros").onclick = abrirFiltros;
      $("cerrar-filtros").onclick = () => cerrarFiltros();
      $("ver-resultados").onclick = () => cerrarFiltros();
      document.addEventListener("keydown", e => { if (e.key === "Escape" && cajon() && !$("pd").open) cerrarFiltros(); });
      // El foco se queda dentro del cajón mientras está abierto
      $("panel-filtros").addEventListener("keydown", e => {
        if (e.key !== "Tab" || !cajon()) return;
        const f = [...$("panel-filtros").querySelectorAll("button, input")].filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      matchMedia("(min-width: 901px)").addEventListener("change", e => { if (e.matches) cerrarFiltros(false); });
      renderCatalogo();
    }

    // ---------- Modalidades y precios ----------
    const minTienda = Math.min(...NEGOCIO.modelos.filter(m => !m.precioFijo).map(m => m.precio));
    const maxTienda = Math.max(...NEGOCIO.modelos.filter(m => !m.precioFijo).map(m => m.precio));
    if (HOME) $("tipos").innerHTML = NEGOCIO.tipos.map(t => `<div><b>${t.t}</b><strong>${t.precio ? pesos(t.precio) : `${pesos(minTienda)} – ${pesos(maxTienda)}`}</strong><p>${t.d}</p></div>`).join("");

    // ---------- Franja de confianza ----------
    // Íconos de línea (24x24) de NEGOCIO.confianza
    const ICONO = {
      truck: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h11v10H2zM13 10h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>`,
      scissors: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8 7.6 20 17M8 16.4 20 7"/></svg>`,
      ruler: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 17 14-14 4 4L7 21zM8 12l2 2M11 9l2 2M14 6l2 2"/></svg>`,
      card: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></svg>`,
    };
    if (HOME) $("trust").innerHTML = NEGOCIO.confianza.map(c => `<div class="trust-item">${ICONO[c.ico]}<strong>${c.t}</strong><small>${c.d}</small></div>`).join("");

    // ---------- Descubre el look completo ----------
    // Puntos sobre la foto: cada uno es un botón que abre su panel (todos los paneles ocupan el mismo espacio, así la tarjeta no salta).
    // "colores" cambia la foto con un fundido; "productos" muestra miniaturas que llevan al catálogo; "bordado" dibuja el parche en vivo.
    // El botón lleva al diseñador con el modelo, el color y el bordado escritos. Un recorrido automático muestra los puntos hasta que la persona toca algo.
    (function renderLook() {
      const L = NEGOCIO.look, m = NEGOCIO.modelos.find(x => x.id === L.modelo);
      if (!HOME || !m) return;
      const S = { i: 0, color: m.colores.includes(L.color) ? L.color : m.colores[0], hilo: "Blanco", name: "", role: "" };
      const prod = id => NEGOCIO.modelos.find(x => x.id === id);
      const fotoColor = (x, c) => (x.fotos || {})[c] || x.foto;
      const href = x => `catalogo.html?cat=${encodeURIComponent(x.cat[0])}`;
      const miniatura = (x, foto, alt, nombre) => `<a class="look-th" href="${href(x)}"><img src="${foto}" alt="${alt}" loading="lazy"><span>${nombre}</span></a>`;
      const bordado = () => (S.name ? NEGOCIO.bordado.nombre : 0) + (S.role ? NEGOCIO.bordado.profesion : 0);
      const panel = p => {
        const texto = typeof p.d === "function" ? p.d(NEGOCIO) : p.d;
        let extra = "";
        if (p.tipo === "colores") {
          extra = `<div class="look-sw" role="group" aria-label="Colores del ${m.nombre}">` + p.colores.map(c =>
            `<button type="button" data-color="${c}" aria-pressed="${c === S.color}" aria-label="${c}"><img src="${fotoColor(m, c)}" alt="" loading="lazy"><span>${c}</span></button>`).join("") + `</div>
            <small class="look-nota">Los colores pueden variar un poco de la foto.</small>`;
        } else if (p.tipo === "productos") {
          const x = prod(p.producto);
          extra = `<div class="look-ths">` + x.colores.map(c => miniatura(x, fotoColor(x, c), `${x.nombre} en ${c.toLowerCase()}`, c)).join("") + `</div>
            <p class="look-sub">Completa tu look</p>
            <div class="look-ths">` + p.completa.map(([id, rotulo]) => { const a = prod(id); return miniatura(a, a.foto, a.nombre, rotulo); }).join("") + `</div>`;
        } else if (p.tipo === "bordado") {
          extra = `<div class="look-bord two">
              <label class="field"><span>Nombre</span><input id="look-name" maxlength="22" autocomplete="off" placeholder="Ej: Dra. Camila Ruiz"></label>
              <label class="field"><span>Profesión</span><input id="look-role" maxlength="26" autocomplete="off" placeholder="Ej: Odontóloga"></label>
            </div>
            <div class="look-hilos" role="group" aria-label="Color del hilo">` + Object.entries(NEGOCIO.hilos).map(([h, hex]) =>
              `<button type="button" data-hilo="${h}" aria-pressed="${h === S.hilo}" aria-label="Hilo ${h.toLowerCase()}" title="${h}" style="--c:${hex}"></button>`).join("") + `</div>
            <p class="look-precio" id="look-precio"></p>
            <p class="look-logo">¿Eres clínica o empresa? Bordamos el logo de todo tu equipo. <a href="#empresas">Pide la propuesta para tu empresa</a></p>`;
        }
        return `<div class="look-pane"><b>${p.t}</b><p>${texto}</p>${extra}</div>`;
      };
      $("look-foto").innerHTML = `<img class="look-img on" src="${L.foto}" alt="${L.alt}" loading="lazy"><img class="look-img" alt="">
        <div class="bordado look-patch" id="look-patch" aria-hidden="true"><small>Tu bordado</small><span class="b-n"></span><span class="b-r"></span></div>` +
        L.puntos.map(p => `<button type="button" class="punto" style="left:${p.x}%;top:${p.y}%" aria-pressed="false" aria-label="${p.t}"></button>`).join("");
      $("look-item").innerHTML = `<span class="sr-only" id="look-live"></span><div class="look-panes">${L.puntos.map(panel).join("")}</div>`;
      const dots = [...$("look-foto").querySelectorAll(".punto")], panes = [...$("look-item").querySelectorAll(".look-pane")];
      const capas = [...$("look-foto").querySelectorAll(".look-img")];
      let vis = 0;

      // Foto del color elegido: se carga en la capa de atrás y se funde con la de adelante
      const verFoto = c => {
        const src = fotoColor(m, c), act = capas[vis], sig = capas[1 - vis];
        if (act.getAttribute("src") === src) return;
        const listo = () => { sig.classList.add("on"); act.classList.remove("on"); vis = 1 - vis; };
        sig.alt = `Uniforme ${m.nombre} en ${c.toLowerCase()}, puesto`;
        if (sig.getAttribute("src") === src && sig.complete) listo(); else { sig.onload = listo; sig.src = src; }
      };
      const parche = () => {
        const el = $("look-patch"), fill = C(S.color), tela = fill.startsWith("linear") ? "#1f1d22" : fill;
        let hilo = NEGOCIO.hilos[S.hilo];
        if (hilo.toLowerCase() === tela.toLowerCase()) hilo = S.hilo === "Blanco" ? "#1f1d22" : "#ffffff";
        el.style.setProperty("--tela", tela);
        el.style.setProperty("--hilo", hilo);
        const n = S.name || "Tu nombre";
        const bn = el.querySelector(".b-n"), br = el.querySelector(".b-r");
        bn.textContent = n; bn.style.opacity = S.name ? 1 : .5; bn.style.setProperty("--len", Math.max(10, n.length));
        br.textContent = S.role; br.style.setProperty("--len", Math.max(12, Math.ceil(S.role.length * 1.25)));
        $("look-foto").classList.toggle("con-parche", L.puntos[S.i].tipo === "bordado" || !!(S.name || S.role));
        const pr = $("look-precio");
        if (pr) pr.textContent = bordado() ? `Tu bordado: ${pesos(bordado())}` : "Escribe tu nombre o tu profesión para ver el precio.";
      };
      const cta = () => {
        $("look-cta").textContent = `Diseñar el ${m.nombre} en ${S.color.toLowerCase()}` + (S.name || S.role ? " con tu bordado" : "");
      };
      const poner = i => {
        S.i = i;
        const p = L.puntos[i];
        dots.forEach((b, j) => b.setAttribute("aria-pressed", j === i));
        panes.forEach((el, j) => el.classList.toggle("on", j === i));
        $("look-live").textContent = `${p.t}. ${typeof p.d === "function" ? p.d(NEGOCIO) : p.d}`;
        parche();
      };
      dots.forEach((b, i) => (b.onclick = () => poner(i)));
      $("look-item").querySelectorAll("[data-color]").forEach(b => (b.onclick = () => {
        S.color = b.dataset.color;
        $("look-item").querySelectorAll("[data-color]").forEach(x => x.setAttribute("aria-pressed", x === b));
        verFoto(S.color); parche(); cta();
      }));
      $("look-item").querySelectorAll("[data-hilo]").forEach(b => (b.onclick = () => {
        S.hilo = b.dataset.hilo;
        $("look-item").querySelectorAll("[data-hilo]").forEach(x => x.setAttribute("aria-pressed", x === b));
        parche();
      }));
      [["look-name", "name"], ["look-role", "role"]].forEach(([id, k]) => $(id).addEventListener("input", () => { S[k] = $(id).value.trim(); parche(); cta(); }));
      $("look-cta").onclick = () => disenar(m, S.color, S.name || S.role ? { name: S.name, role: S.role, hilo: S.hilo } : null);
      poner(0); cta();

      // Recorrido automático: pasa por los puntos mientras la sección se ve; se detiene para siempre al primer toque, tecla o foco
      const reduce = matchMedia("(prefers-reduced-motion: reduce)"), raiz = $("look");
      let timer = null, parado = false, enVista = false, encima = false;
      const play = () => {
        clearInterval(timer);
        if (!parado && enVista && !encima && !reduce.matches) timer = setInterval(() => poner((S.i + 1) % dots.length), 4500);
      };
      ["pointerdown", "focusin", "keydown"].forEach(ev => raiz.addEventListener(ev, () => { parado = true; play(); }));
      raiz.addEventListener("mouseenter", () => { encima = true; play(); });
      raiz.addEventListener("mouseleave", () => { encima = false; play(); });
      reduce.addEventListener("change", play);
      if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { enVista = e.isIntersecting; play(); }, { threshold: .4 }).observe(raiz);
    })();

    // ---------- Personalizador ----------
    const design = { color: null, hilo: "Blanco", qty: 1, tipo: "medida" };
    const model = () => NEGOCIO.modelos.find(m => m.id === $("s-model").value);
    const tipo = () => NEGOCIO.tipos.find(t => t.id === design.tipo);
    const precio = (m, t) => (t.precio && !m.precioFijo ? t.precio : m.precio);
    if (HOME) NEGOCIO.modelos.filter(m => !m.accesorio).forEach(m => $("s-model").add(new Option(`${m.nombre} — desde ${pesos(m.precio)}`, m.id))); // accesorios (gorros) no se diseñan
    const tipoNombre = id => NEGOCIO.tipos.find(t => t.id === id).t;
    if (HOME) $("s-model").addEventListener("change", () => { design.color = model().colores[0]; renderDesign(); });

    function optButtons(box, items, current, onPick, swatch, label = it => it) {
      box.innerHTML = "";
      items.forEach(it => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = it === current ? "on" : "";
        b.innerHTML = (swatch ? `<i style="background:${swatch(it)}"></i>` : "") + label(it);
        b.onclick = () => { onPick(it); renderDesign(); };
        box.appendChild(b);
      });
    }
    const discount = q => NEGOCIO.descuentos.reduce((d, [min, pct]) => (q >= min ? pct : d), 0);
    // Foto del diseñador: modelos de NEGOCIO.disena usan una sola foto base (img/disena/<id>.webp) recoloreada en cada
    // color; el blanco usa la foto blanca real. Los demás (Glam, bata, pantalón, línea blanca) usan su foto real por color.
    const slugColor = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");
    function fotoDisena(m, color) {
      const base = NEGOCIO.disena[m.id];
      if (base && color === base) return `img/disena/${m.id}.webp`;
      if (base && color !== "Blanco") return `img/disena/${m.id}-${slugColor(color)}.webp`;
      const f = (m.fotos || {})[color] || m.foto;
      return /\.webp$/.test(f) ? f : null; // sin foto real: queda el dibujo
    }
    if (HOME) {
      $("pv-photo").onload = () => $("pv-box").classList.add("has-photo");
      $("pv-photo").onerror = () => { $("pv-box").classList.remove("has-photo"); $("pv-photo").removeAttribute("src"); };
    }

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

      const fill = C(design.color);
      const use = $("pv").querySelector("use");
      use.style.fill = fill;
      use.style.stroke = design.color === "Blanco" ? "#e5d6dd" : "none";
      const d = designInfo();
      let thread = NEGOCIO.hilos[design.hilo];
      if (thread.toLowerCase() === fill.toLowerCase()) thread = design.hilo === "Blanco" ? "#1f1d22" : "#ffffff";
      ["pv-name", "pv-role"].forEach(id => $(id).setAttribute("fill", thread));
      $("pv-name").textContent = d.name || "Tu nombre";
      $("pv-name").style.opacity = d.name ? 1 : .45;
      $("pv-role").textContent = d.role.toUpperCase();
      // Foto: la del modelo en el color elegido; el bordado va en el parche encima
      const foto = fotoDisena(m, design.color), box = $("pv-box"), img = $("pv-photo");
      if (!foto) { box.classList.remove("has-photo"); img.removeAttribute("src"); }
      else if (img.getAttribute("src") !== foto) img.src = foto;
      img.alt = `${m.nombre} en color ${design.color.toLowerCase()}` + (d.name || d.role ? `, con el bordado ${[d.name, d.role].filter(Boolean).join(", ")}` : "");
      const bord = $("pv-bord"), nombreB = d.name || "Tu nombre";
      bord.style.setProperty("--tela", fill.startsWith("linear") ? "#1f1d22" : fill);
      bord.style.setProperty("--hilo", thread);
      $("pv-bn").textContent = nombreB;
      $("pv-bn").style.opacity = d.name ? 1 : .5;
      $("pv-bn").style.setProperty("--len", Math.max(10, nombreB.length));
      $("pv-br").textContent = d.role;
      $("pv-br").style.setProperty("--len", Math.max(12, Math.ceil(d.role.length * 1.25)));
      const ref = NEGOCIO.disena[m.id] && design.color !== NEGOCIO.disena[m.id] && design.color !== "Blanco";
      $("pv-cap").textContent = `${m.nombre} · ${design.color} · ${d.t.t.toLowerCase()}` + (ref ? ". Color de referencia: el tono real de la tela puede variar." : "");

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
    if (HOME) {
      ["s-name", "s-role"].forEach(id => $(id).addEventListener("input", renderDesign));
      $("q-minus").onclick = () => { design.qty = Math.max(1, design.qty - 1); renderDesign(); renderAgenda(); };
      $("q-plus").onclick = () => { design.qty = Math.min(30, design.qty + 1); renderDesign(); renderAgenda(); };
      $("s-ask").onclick = () => {
        const d = designInfo();
        openWa(`Hola Multicostura 💗 tengo una pregunta sobre este diseño:\n• ${d.texto}\n• Total estimado: ${pesos(d.total)}`);
      };
    }

    // ---------- Agenda: datos (Google Sheets o modo demo) ----------
    const DEMO_KEY = "multicostura-demo-citas";
    const demo = !NEGOCIO.apiUrl;
    if (HOME && demo) $("demo-note").classList.remove("hidden");
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
    // "Hoy" sale del reloj; window.HOY_TEST ("AAAA-MM-DD" o "AAAA-MM-DDTHH:MM") lo fija solo en las pruebas.
    const ahora = () => {
      if (!window.HOY_TEST) return new Date();
      const [f, h = "00:00"] = window.HOY_TEST.split("T"), d = fromIso(f);
      d.setHours(...h.split(":").map(Number));
      return d;
    };
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
        b.className = "mode" + (ag.modo === mo.id ? " on" : "");
        const extra = mo.id === "domicilio" ? ` <b style="color:var(--mag-2)">+${pesos(NEGOCIO.recargoDomicilio)}</b>` : "";
        b.innerHTML = `<span class="ico">${mo.ico}</span><b>${mo.t}${extra}</b><small>${mo.d}</small>`;
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
    const CHEV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const mesPermitido = m => m >= mesDe(hoyIso()) && m <= mesDe(ultimoDia());
    const mesDelta = d => { const [y, m] = ag.mes.split("-").map(Number); return mesDe(isoDate(new Date(y, m - 1 + d, 1))); };

    function cambiarMes(nuevo, foco) {
      if (!mesPermitido(nuevo)) return;
      ag.mes = nuevo;
      if (foco) ag.activo = foco;
      renderDays();
      if (foco) { const b = $("days").querySelector(`[data-fecha="${foco}"]`); if (b) b.focus(); }
    }

    function renderDays() {
      const box = $("days");
      const [y, m] = ag.mes.split("-").map(Number);
      const n = new Date(y, m, 0).getDate();
      const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // lunes primero
      const hoy = hoyIso();
      const fechas = Array.from({ length: n }, (_, i) => `${ag.mes}-${pad(i + 1)}`);
      const act = [ag.activo, ag.fecha].find(f => f && mesDe(f) === ag.mes);
      const foco = act || fechas.find(f => estadoDia(f) === "disponible") || fechas[0]; // un solo día entra con Tab
      let filas = "", celdas = "<td></td>".repeat(offset);
      fechas.forEach((f, i) => {
        const est = estadoDia(f), sel = ag.fecha === f;
        celdas += `<td><button type="button" class="cal-day ${est}${sel ? " on" : ""}" data-fecha="${f}" tabindex="${f === foco ? 0 : -1}"${f === foco ? ` data-activo="${f}"` : ""}` +
          `${est === "disponible" ? "" : ' aria-disabled="true"'} aria-pressed="${sel}"${f === hoy ? ' aria-current="date"' : ""}` +
          ` aria-label="${nombreDia(f)}, ${ETIQ[est]}"><span>${i + 1}</span>${est === "lleno" ? "<small>Lleno</small>" : ""}</button></td>`;
        if ((offset + i + 1) % 7 === 0 || i === n - 1) { filas += `<tr>${celdas}</tr>`; celdas = ""; }
      });
      const titulo = `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`;
      const cab = DIAS.slice(1).concat(DIAS[0]).map(d => `<th scope="col"><abbr title="${d}">${d === "miércoles" ? "X" : d[0].toUpperCase()}</abbr></th>`).join("");
      box.innerHTML = `<div class="cal-head">
          <button type="button" class="cal-prev" aria-label="Mes anterior"${mesPermitido(mesDelta(-1)) ? "" : " disabled"}>${CHEV("M15 5l-7 7 7 7")}</button>
          <strong class="cal-title" aria-live="polite">${titulo}</strong>
          <button type="button" class="cal-next" aria-label="Mes siguiente"${mesPermitido(mesDelta(1)) ? "" : " disabled"}>${CHEV("M9 5l7 7-7 7")}</button>
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
      const rows = [`<span>${mo.ico} <strong>${mo.t}</strong>${ag.modo === "domicilio" ? ` · recargo ${pesos(NEGOCIO.recargoDomicilio)}` : ""}</span>`];
      if (presencial() && ag.hora) rows.push(`<span>📅 <strong>${largo(ag.fecha)}</strong> a las <strong>${hora12(ag.hora)}</strong> · ${citaMin()} min</span>`);
      rows.push(`<span>💗 Tu diseño: ${d.texto}</span>`);
      rows.push(`<span>💰 Estimado: <strong>${pesos(d.total)}</strong></span>`);
      $("summary").innerHTML = rows.join("");
    }

    function renderAgenda() {
      renderModes();
      const p = presencial();
      $("cal-row").classList.toggle("hidden", ag.modo === "casa");
      $("st-day").classList.toggle("hidden", ag.modo === "casa");
      $("st-hour").classList.toggle("hidden", ag.modo === "casa");
      $("st-day").classList.toggle("off", !p);
      $("st-hour").classList.toggle("off", !ag.fecha);
      $("st-data").classList.toggle("off", !(ag.modo === "casa" || ag.hora));
      $("data-num").textContent = ag.modo === "casa" ? "2" : "4";
      if (p) { renderDays(); renderSlots(); }
      // Campos según modalidad
      $("f-addr-wrap").classList.toggle("hidden", ag.modo !== "domicilio");
      $("f-addr").required = ag.modo === "domicilio";
      $("f-city-wrap").classList.toggle("hidden", ag.modo !== "casa");
      $("f-city").required = ag.modo === "casa";
      $("self-measures").classList.toggle("hidden", ag.modo !== "casa");
      $("mgrid").querySelectorAll("input").forEach(i => (i.required = ag.modo === "casa"));
      $("f-submit").textContent = ag.modo === "casa" ? "Enviar mis medidas por WhatsApp" : "Agendar mi cita";
      renderSummary();
    }

    // Campos de medidas para "Me mido en casa"
    if (HOME) NEGOCIO.medidas.forEach(([t], i) => $("mgrid").insertAdjacentHTML("beforeend",
      `<label>${t} (cm)<input type="number" inputmode="decimal" min="20" max="250" step="0.5" data-m="${t}"></label>`));

    async function loadBusy() {
      try { ag.busy = await fetchBusy(hoyIso(), ultimoDia()); }
      catch { $("slots").innerHTML = `<p class="err">No pude cargar la agenda. Escríbenos por WhatsApp.</p>`; }
    }

    if (HOME) {
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
            err.textContent = res.error === "ocupado" ? "Ese horario se acaba de ocupar 😕 Elige otro, por favor." : "No se pudo agendar. Intenta de nuevo o escríbenos por WhatsApp.";
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
      $("done-again").onclick = () => {
        ag.fecha = ag.hora = null;
        $("form").reset();
        $("done").classList.add("hidden");
        $("flow").classList.remove("hidden");
        renderAgenda();
      };
    }

    if (HOME) {
      // ---------- Proceso y guía de medidas ----------
      $("process").innerHTML = NEGOCIO.proceso.map(([t, d]) => `<div><b>${t}</b><p>${d}</p></div>`).join("");
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
          b.type = "button"; b.textContent = pesos(v); b.className = v === bono ? "on" : "";
          b.onclick = () => { bono = v; renderBono(); };
          $("amounts").appendChild(b);
        });
        $("g-amount").textContent = pesos(bono);
        $("g-names").textContent = `Para: ${$("g-to").value.trim() || "—"} · De: ${$("g-from").value.trim() || "—"}`;
      }
      ["g-to", "g-from"].forEach(id => $(id).addEventListener("input", renderBono));
      $("bono").addEventListener("submit", e => {
        e.preventDefault();
        openWa(`Hola Multicostura 💗 quiero comprar un bono de regalo:\n• Valor: ${pesos(bono)}\n• Para: ${$("g-to").value.trim()}\n• De: ${$("g-from").value.trim()}`);
      });

      // ---------- Clientas e info ----------
      NEGOCIO.clientas.forEach(c => $("clients").insertAdjacentHTML("beforeend", c.video
        ? `<figure class="cli-video"><video muted loop playsinline preload="none" poster="${c.video}-poster.webp" aria-label="Video de una clienta de ${c.texto} con su uniforme Multicostura"><source src="${c.video}.webm" type="video/webm"><source src="${c.video}.mp4" type="video/mp4"></video><button type="button" class="nos-pp cli-pp" aria-label="Pausar video"><svg class="i-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg><svg class="i-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg></button><figcaption>${c.texto}</figcaption></figure>`
        : `<figure>🩷<img src="${c.foto}" alt="${c.texto}" loading="lazy" onerror="this.remove()"><figcaption>${c.texto}</figcaption></figure>`));
      // Videos de clientas: como el de Quiénes somos, se cargan y reproducen solo en pantalla, con pausa y movimiento reducido
      document.querySelectorAll(".cli-video").forEach(fig => {
        const v = fig.querySelector("video"), pp = fig.querySelector(".cli-pp"), reduce = matchMedia("(prefers-reduced-motion: reduce)");
        let pausado = reduce.matches, visible = false;
        const sync = () => { pp.classList.toggle("paused", pausado); pp.setAttribute("aria-label", pausado ? "Reproducir video" : "Pausar video"); };
        const actualizar = () => { if (visible && !pausado) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); };
        pp.onclick = () => { pausado = !pausado; sync(); actualizar(); };
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; actualizar(); }, { threshold: 0.25 }).observe(v);
        sync();
      });
      renderBono();
    }

    $("f-address").textContent = NEGOCIO.direccionTaller;
    $("f-map").src = `https://www.google.com/maps?q=${encodeURIComponent(NEGOCIO.mapa)}&z=17&output=embed`;
    $("f-map-link").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(NEGOCIO.mapa)}`;
    // Invitación a la tienda (Quiénes somos)
    if (HOME) {
      $("v-mapa").href = $("f-map-link").href;
      $("v-dir").textContent = NEGOCIO.direccionTaller;
      $("v-hor").textContent = NEGOCIO.horarioTexto;
      $("v-wa").href = waLink("Hola Multicostura 💗 ¿qué uniformes tienen disponibles hoy en la tienda? Me gustaría pasar a verlos.");
    }
    $("f-ig").href = NEGOCIO.instagram;
    $("f-tt").href = NEGOCIO.tiktok;
    $("f-fb").href = NEGOCIO.facebook;
    $("f-wa").href = $("f-wa-ico").href = $("wa-float").href = waLink("Hola Multicostura 💗 quiero información");
    $("f-ayuda").href = waLink("Hola Multicostura 💗 tengo una pregunta");
    $("f-mail").href = `mailto:${NEGOCIO.correo}`;
    $("f-mail").textContent = NEGOCIO.correo;
    $("f-horario").textContent = NEGOCIO.horarioTexto;
    $("f-copy").textContent = `© ${new Date().getFullYear()} Multicostura Uniformes. Todos los derechos reservados.`;
    // Número visible: 573217830050 -> 321 783 0050 (WhatsApp) y enlace para llamar
    const numeroLocal = NEGOCIO.whatsapp.replace(/^57/, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    $("f-wa").textContent = `WhatsApp ${numeroLocal}`;
    $("f-tel").href = `tel:+${NEGOCIO.whatsapp}`;
    $("f-tel").textContent = `Llamar ${numeroLocal}`;

    if (HOME) {
      // ?modelo=<id>&color=<color>: llegada desde el catálogo con el modelo ya elegido
      const q = new URLSearchParams(location.search), pre = NEGOCIO.modelos.find(m => m.id === q.get("modelo") && !m.accesorio);
      if (pre) $("s-model").value = pre.id;
      design.color = pre && model().colores.includes(q.get("color")) ? q.get("color") : model().colores[0];
      renderModels($("models"), NEGOCIO.recomendados.map(id => NEGOCIO.modelos.find(m => m.id === id)).filter(Boolean));
      renderDesign();
      loadBusy().then(renderAgenda);
      if (pre) $("personaliza").scrollIntoView();
    }
    if (CATALOGO) iniciarCatalogo();

    // ---------- Video de Quiénes somos ----------
    // Se descarga y reproduce solo cuando la sección está en pantalla (ahorra datos); se pausa al salir.
    // Con "reducir movimiento" queda la portada quieta hasta que la persona lo active con el botón.
    (function videoNosotros() {
      const v = $("nos-video"), pp = $("nos-pp"), reduce = matchMedia("(prefers-reduced-motion: reduce)");
      if (!v) return;
      let pausado = reduce.matches, visible = false;
      const sync = () => { pp.classList.toggle("paused", pausado); pp.setAttribute("aria-label", pausado ? "Reproducir video" : "Pausar video"); };
      const actualizar = () => { if (visible && !pausado) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause(); };
      pp.onclick = () => { pausado = !pausado; sync(); actualizar(); };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; actualizar(); }, { threshold: 0.25 }).observe(v);
      sync();
    })();

    // ---------- Ficha ampliada del producto ----------
    // Galería: la foto base en alta resolución (si el modelo tiene) y las fotos reales de cada color.
    // La foto grande muestra el color elegido: la real si existe; si no, la de referencia.
    const pd = {};
    function galeria(m) {
      const lista = [], vistos = new Set(), add = (src, color) => { if (src && /\.webp$/.test(src) && !vistos.has(src)) { vistos.add(src); lista.push({ src, color }); } };
      if (NEGOCIO.disena[m.id]) add(`img/disena/${m.id}.webp`, NEGOCIO.disena[m.id]);
      // fotos reales de los otros colores (la del color de la base ya está, en mejor resolución)
      Object.entries(m.fotos || {}).filter(([c]) => !(m.simulados || []).includes(c) && c !== NEGOCIO.disena[m.id]).forEach(([c, f]) => add(f, c));
      if (!lista.length) add(m.foto, m.colores[0]);
      return lista;
    }
    const fotoProducto = (m, c) => { const real = (m.fotos || {})[c]; return real && !(m.simulados || []).includes(c) && c !== NEGOCIO.disena[m.id] ? real : fotoDisena(m, c) || m.foto; };
    function abrirProducto(m, color, opener) {
      Object.assign(pd, { m, opener, color: color || (NEGOCIO.disena[m.id]) || m.colores[0], tipo: m.precioFijo ? "tienda" : "pedido", medidas: null, qty: 1 });
      if (!m.colores.includes(pd.color)) pd.color = m.colores[0];
      $("pd-title").textContent = m.nombre;
      $("pd-cat").textContent = m.cat.join(" · ");
      const precios = NEGOCIO.tipos.map(t => precio(m, t));
      $("pd-price").innerHTML = sinPrecio(m) ? `Precio a consultar<small>Escríbenos y te contamos el valor y los diseños disponibles.</small>` : m.precioFijo ? pesos(m.precio)
        : `${pesos(Math.min(...precios))} – ${pesos(Math.max(...precios))}<small>${NEGOCIO.tipos.map(t => `${t.t}: ${pesos(precio(m, t))}`).join(" · ")}</small>`;
      $("pd-desc").textContent = m.desc;
      // características propias del producto (accesorios) o las de los uniformes
      $("pd-feats").innerHTML = (m.caracteristicas
        || ["Tela antifluido de alta calidad", `Confeccionado en nuestro taller de ${NEGOCIO.ciudad}`, "Bordado de nombre y profesión disponible", "Envíos a toda Colombia"]).map(x => `<li>${x}</li>`).join("");
      $("pd-thumbs").innerHTML = galeria(m).map(g => `<button type="button" data-src="${g.src}" data-color="${g.color}" aria-label="Ver foto en ${g.color.toLowerCase()}"><img src="${g.src}" alt="" loading="lazy"></button>`).join("");
      $("pd-thumbs").querySelectorAll("button").forEach(b => (b.onclick = () => { pd.color = b.dataset.color; pintarProducto(b.dataset.src); }));
      $("pd-tipo-box").hidden = !!m.precioFijo;
      // accesorios (gorros): sin medidas, sin diseñador y sin descuento por cantidad de uniformes
      $("pd-medidas").parentElement.hidden = $("pd-pers").hidden = !!m.accesorio;
      $("pd-otro").hidden = !m.accesorio;
      if (m.accesorio) $("pd-otro-wa").href = waOtroDiseno(m);
      pintarProducto();
      document.documentElement.classList.add("pd-abierta");
      $("pd").showModal();
      $("pd").scrollTop = 0;
    }
    function pintarProducto(srcElegida) {
      const m = pd.m, c = pd.color, src = srcElegida || fotoProducto(m, c);
      const img = $("pd-img"), conFoto = /\.webp$/.test(src);
      $("pd-main").classList.remove("zoom");
      $("pd-main").classList.toggle("sin-foto", !conFoto);
      $("pd-sil").querySelector("use").style.fill = C(c);
      if (!conFoto) img.removeAttribute("src");
      else if (img.getAttribute("src") !== src) img.src = src;
      const ref = !srcElegida && src.includes("/disena/") && c !== NEGOCIO.disena[m.id];
      img.alt = `${m.nombre} en color ${c.toLowerCase()}`;
      $("pd-main").setAttribute("aria-label", `${img.alt}. Toca para ampliar`);
      $("pd-thumbs").querySelectorAll("button").forEach(b => b.setAttribute("aria-current", b.dataset.src === src));
      $("pd-color-name").textContent = c + (ref || (m.simulados || []).includes(c) && !srcElegida ? " · color de referencia" : "");
      $("pd-colors").innerHTML = m.colores.map(x => `<button type="button" data-color="${x}" style="--c:${C(x)}" title="${x}" aria-label="Color ${x}" aria-pressed="${x === c}"></button>`).join("");
      $("pd-colors").querySelectorAll("button").forEach(b => (b.onclick = () => { pd.color = b.dataset.color; pintarProducto(); }));
      // modalidad, cómo tomar las medidas (no se trabaja por tallas) y cantidad
      $("pd-tipos").innerHTML = NEGOCIO.tipos.map(t => `<button type="button" data-t="${t.id}" aria-pressed="${t.id === pd.tipo}">${t.t} · ${pesos(precio(m, t))}<small>${NEGOCIO.tiempos[t.id]}</small></button>`).join("");
      $("pd-tipos").querySelectorAll("button").forEach(b => (b.onclick = () => { pd.tipo = b.dataset.t; pintarProducto(srcElegida); }));
      $("pd-medidas").innerHTML = NEGOCIO.modalidades.map(x => `<button type="button" data-v="${x.id}" aria-pressed="${x.id === pd.medidas}">${x.t}<small>${x.id === "domicilio" ? `+${pesos(NEGOCIO.recargoDomicilio)}` : x.d}</small></button>`).join("");
      $("pd-medidas").querySelectorAll("button").forEach(b => (b.onclick = () => { pd.medidas = b.dataset.v; pintarProducto(srcElegida); }));
      $("pd-q").textContent = pd.qty;
      const t = NEGOCIO.tipos.find(x => x.id === pd.tipo), unit = precio(m, t), pct = m.accesorio ? 0 : discount(pd.qty);
      const recargo = pd.medidas === "domicilio" ? NEGOCIO.recargoDomicilio : 0;
      const total = Math.round(unit * pd.qty * (1 - pct)) + recargo;
      $("pd-desc-qty").textContent = m.accesorio ? "" : pct ? `Descuento por cantidad: −${pct * 100}%` : `Desde ${NEGOCIO.descuentos.find(([, p]) => p)[0]} uniformes hay descuento`;
      $("pd-total").textContent = pesos(total);
      $("pd-total").parentElement.hidden = sinPrecio(m);
      const eleccion = `Medidas: ${(NEGOCIO.modalidades.find(x => x.id === pd.medidas) || {}).t || "por definir"}`;
      $("pd-wa").href = waLink(m.accesorio ? `Hola Multicostura 💗 quiero encargar:\n• ${m.nombre}\n• Estampado: ${c}\n• Cantidad: ${pd.qty}\n${sinPrecio(m) ? "¿Qué precio tienen y están disponibles?" : `• Total estimado: ${pesos(total)}\n¿Está disponible?`}`
        : `Hola Multicostura 💗 quiero encargar este uniforme:\n• Modelo: ${m.nombre}\n• Color: ${c}\n• Modalidad: ${t.t} (${NEGOCIO.tiempos[t.id]})\n• ${eleccion}\n• Cantidad: ${pd.qty}\n• Total estimado: ${pesos(total)}${pct ? ` (con ${pct * 100}% de descuento)` : ""}\nMe gustaría confirmar el color en la tienda.`);
      $("pd-agenda").hidden = m.accesorio || !pd.medidas || pd.medidas === "casa";
    }
    $("pd-minus").onclick = () => { pd.qty = Math.max(1, pd.qty - 1); pintarProducto(); };
    $("pd-plus").onclick = () => { pd.qty = Math.min(99, pd.qty + 1); pintarProducto(); };
    // Zoom: con el mouse se amplía al pasar por encima y sigue el cursor; con el dedo o el teclado, tocar alterna
    const pdMain = $("pd-main"), finoPuntero = matchMedia("(hover: hover) and (pointer: fine)");
    const mover = (x, y) => { const r = pdMain.getBoundingClientRect(); $("pd-img").style.transformOrigin = `${((x - r.left) / r.width) * 100}% ${((y - r.top) / r.height) * 100}%`; };
    pdMain.addEventListener("mouseenter", () => { if (finoPuntero.matches && !pdMain.classList.contains("sin-foto")) pdMain.classList.add("zoom"); });
    pdMain.addEventListener("mouseleave", () => { if (finoPuntero.matches) pdMain.classList.remove("zoom"); });
    pdMain.addEventListener("mousemove", e => mover(e.clientX, e.clientY));
    pdMain.addEventListener("click", e => { if (!finoPuntero.matches) { pdMain.classList.toggle("zoom"); mover(e.clientX, e.clientY); } });
    pdMain.addEventListener("touchmove", e => { if (pdMain.classList.contains("zoom")) { e.preventDefault(); mover(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
    pdMain.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pdMain.classList.toggle("zoom"); } });
    // Cerrar: botón, Escape (nativo del diálogo) o tocar fuera; el foco vuelve a la tarjeta
    $("pd-close").onclick = () => $("pd").close();
    $("pd").addEventListener("click", e => { if (e.target === $("pd")) $("pd").close(); });
    $("pd").addEventListener("close", () => { document.documentElement.classList.remove("pd-abierta"); pd.opener?.focus(); });
    $("pd-pers").onclick = () => {
      if (!HOME) { disenar(pd.m, pd.color); return; }
      $("s-model").value = pd.m.id; design.color = pd.color; design.tipo = pd.tipo; design.qty = pd.qty;
      renderDesign(); $("pd").close(); $("personaliza").scrollIntoView();
    };
    $("pd-agenda").onclick = () => $("pd").close();

    // ---------- Preguntas frecuentes ----------
    const respuesta = f => (typeof f.a === "function" ? f.a(NEGOCIO) : f.a);
    const FAQ_VISIBLES = 4; // preguntas a la vista con la sección recogida
    if (HOME) $("faq-list").innerHTML = NEGOCIO.faq.map((f, i) => `<details id="faq-${f.id}"${i >= FAQ_VISIBLES ? ' class="extra"' : ""}><summary>${f.q}</summary><p>${respuesta(f)}</p></details>`).join("");
    const faqMas = $("faq-more"), ocultas = NEGOCIO.faq.length - FAQ_VISIBLES;
    function desplegarFaq(abrir) {
      $("faq-list").classList.toggle("todas", abrir);
      faqMas.setAttribute("aria-expanded", abrir);
      faqMas.textContent = abrir ? "Ver menos preguntas" : `Ver las ${ocultas} preguntas más`;
      if (!abrir) $("faq-list").querySelectorAll("details.extra[open]").forEach(d => (d.open = false));
    }
    if (faqMas) {
      faqMas.hidden = ocultas <= 0;
      faqMas.onclick = () => {
        const abrir = faqMas.getAttribute("aria-expanded") !== "true";
        desplegarFaq(abrir);
        if (abrir) $("faq-list").querySelector("details.extra summary").focus(); // el foco va a la primera pregunta nueva
      };
      desplegarFaq(false);
      if (location.hash.startsWith("#faq-")) abrirFaq(location.hash.slice(5)); // llegada desde el asistente en otra página
    }
    // Abre una pregunta del acordeón (desplegando la sección si estaba oculta), la muestra y la resalta un momento
    function abrirFaq(id) {
      const d = $("faq-" + id);
      if (!d) { if (!HOME) location.href = aSeccion("faq-" + id); return; } // en el catálogo no hay preguntas: se abren en el inicio
      if (d.classList.contains("extra")) desplegarFaq(true);
      d.open = true;
      if (matchMedia("(max-width: 520px)").matches) cerrarChat(false); // en celular el chat tapa la página
      d.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      d.classList.add("destacada");
      setTimeout(() => d.classList.remove("destacada"), 2600);
      d.querySelector("summary").focus({ preventScroll: true });
    }

    // ---------- Asistente de compra ----------
    // Guía a la clienta paso a paso hasta dejar el pedido completo (lo que la dueña necesita para cerrarlo)
    // y lo envía por WhatsApp. Las dudas se responden con NEGOCIO.faq y llevan a la pregunta en #faq.
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const log = $("chat-log"), chipsBox = $("chat-chips"), input = $("chat-in");
    let P = {}, espera = null, ultimo = null, iniciado = false;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    function bot(html) { log.insertAdjacentHTML("beforeend", `<div class="msg bot">${html}</div>`); log.scrollTop = log.scrollHeight; }
    function yo(texto) { log.insertAdjacentHTML("beforeend", `<div class="msg yo">${esc(texto)}</div>`); log.scrollTop = log.scrollHeight; }
    // chips: [{ t, fn, href, cls, dot }]; al tocar uno se escribe como respuesta de la clienta
    function chips(lista) {
      chipsBox.innerHTML = "";
      lista.forEach(c => {
        const el = document.createElement(c.href ? "a" : "button");
        if (c.href) { el.href = c.href; el.target = /^https?:/.test(c.href) ? "_blank" : ""; el.rel = "noopener"; } else el.type = "button";
        if (c.cls) el.className = c.cls;
        el.innerHTML = (c.dot ? `<i class="sw-dot" style="background:${c.dot}"></i>` : "") + esc(c.t);
        el.onclick = e => { if (!c.href) { yo(c.t); chipsBox.innerHTML = ""; } if (c.fn) { if (c.href && !/^https?:/.test(c.href)) e.preventDefault(); c.fn(); } };
        chipsBox.appendChild(el);
      });
    }
    // paso: muestra la pregunta y guarda cómo repetirla si la clienta pregunta algo en medio del pedido
    const paso = fn => { ultimo = fn; espera = null; fn(); };
    const pedirTexto = (pregunta, alResponder, lista = []) => { bot(pregunta); chips(lista); espera = alResponder; input.focus(); };

    function inicio() {
      P = {};
      bot("¡Hola! 💗 Soy la asistente de Multicostura. Te ayudo a elegir tu uniforme y a dejar tu pedido listo para confirmarlo por WhatsApp.\n¿Qué quieres hacer?");
      chips([
        { t: "🛍️ Hacer un pedido", fn: () => paso(pedirModelo) },
        { t: "👩‍⚕️ Uniformes para mi equipo", fn: chatEquipo },
        { t: "🎁 Bono de regalo", fn: chatBono },
        { t: "❓ Tengo una pregunta", fn: pregunta },
        { t: "📸 Ver más fotos y videos", fn: redes },
      ]);
    }
    function pedirModelo() {
      bot("¡Me encanta! ¿Qué modelo te gusta? Puedes tocarlo o escribir su nombre.");
      chips([{ t: "🤔 Aún no sé cuál elegir", fn: redes }, ...NEGOCIO.modelos.filter(m => m.fotos || m.colores.length).map(m => ({ t: m.nombre, fn: () => elegirModelo(m) }))]);
    }
    // Clienta indecisa: la invita a ver más fotos y videos en las redes y luego a volver al pedido
    function redes() {
      espera = null;
      bot("¡Te entiendo! 💗 Elegir tu uniforme es importante. En nuestras redes tenemos muchas más fotos y videos de cada modelo, colores reales y clientas usándolos en su día a día. Échales un vistazo y cuando te decidas, aquí te ayudo con tu pedido.");
      chips([
        { t: "📷 Instagram", href: NEGOCIO.instagram },
        { t: "🎵 TikTok", href: NEGOCIO.tiktok },
        { t: "👍 Facebook", href: NEGOCIO.facebook },
        ultimo && P.m ? { t: "👉 Sigamos con mi pedido", fn: () => paso(ultimo) } : { t: "🛍️ Ya me decidí, hacer mi pedido", fn: () => paso(pedirModelo) },
        { t: "💬 Que me asesoren por WhatsApp", href: waLink("Hola Multicostura 💗 no sé qué uniforme elegir, ¿me ayudan a escoger?") },
      ]);
    }
    const INDECISA = /\b(no se|nose|indecisa|indeciso|no estoy segura|no me decido|ayudame a elegir|mas fotos|mas videos|ver fotos|ver videos|fotos|videos|redes|instagram|tiktok|facebook)\b/;
    function elegirModelo(m) {
      P = { m };
      bot(`<b>${m.nombre}</b> · ${sinPrecio(m) ? "precio a consultar" : `desde ${pesos(m.precio)}`}\n${m.desc}<img src="${m.foto}" alt="${m.nombre}">`);
      paso(pedirColor);
    }
    function pedirColor() {
      if (P.m.colores.length === 1) { elegirColor(P.m.colores[0], true); return; }
      bot(P.m.accesorio ? "¿Qué estampado te gusta? Si quieres otro diseño, te mostramos más por WhatsApp." : "¿En qué color lo quieres?");
      chips([...P.m.colores.map(c => ({ t: c, dot: C(c), fn: () => elegirColor(c) })),
        ...(P.m.accesorio ? [{ t: "🎨 Quiero otro diseño", href: waOtroDiseno(P.m), cls: "principal" }] : [])]);
    }
    function elegirColor(c, unico) {
      P.color = c;
      const foto = (P.m.fotos || {})[c] || P.m.foto, ref = (P.m.simulados || []).includes(c);
      bot(`${unico ? `Viene en ${c.toLowerCase()}.` : `Así se ve el ${P.m.nombre} en ${c.toLowerCase()}${ref ? " (color de referencia, el tono real puede variar)" : ""}.`}<img src="${foto}" alt="${P.m.nombre} en color ${c}">`);
      paso(P.m.accesorio ? pedirCantidad : pedirModalidad); // accesorios (gorros): sin modalidad ni medidas
    }
    function pedirModalidad() {
      if (P.m.precioFijo) { P.t = NEGOCIO.tipos[0]; paso(pedirMedidas); return; }
      bot("¿Cómo lo quieres?");
      chips(NEGOCIO.tipos.map(t => ({ t: `${t.t} · ${pesos(precio(P.m, t))} · ${NEGOCIO.tiempos[t.id]}`, fn: () => { P.t = t; paso(pedirMedidas); } })));
    }
    function pedirMedidas() {
      bot("Todos nuestros uniformes se hacen con tus medidas 📏 ¿Cómo te las tomamos?");
      chips(NEGOCIO.modalidades.map(x => ({ t: `${x.t}${x.id === "domicilio" ? ` (+${pesos(NEGOCIO.recargoDomicilio)})` : ""}`, fn: () => { P.medidas = x; paso(pedirCantidad); } })));
    }
    function pedirCantidad() {
      const tramos = NEGOCIO.descuentos.filter(([, p]) => p).map(([n, p]) => `${n}+ = −${p * 100}%`).join(", ");
      if (P.m.accesorio) P.t = NEGOCIO.tipos[0];
      pedirTexto(P.m.accesorio ? `¿Cuántas unidades quieres?` : `¿Cuántos uniformes necesitas? Hay descuento por cantidad: ${tramos}.`, txt => {
        const n = parseInt(txt, 10);
        if (!(n > 0 && n < 500)) { bot("Escríbeme un número, por ejemplo 2 🙂"); return; }
        P.qty = n; espera = null; paso(P.m.accesorio ? pedirEntrega : pedirBordado);
      }, [1, 2, 3, 6, 12].map(n => ({ t: String(n), fn: () => { P.qty = n; espera = null; paso(P.m.accesorio ? pedirEntrega : pedirBordado); } })));
    }
    function pedirBordado() {
      bot(`¿Le bordamos tu nombre y profesión? Nombre +${pesos(NEGOCIO.bordado.nombre)}, profesión +${pesos(NEGOCIO.bordado.profesion)}.`);
      chips([
        { t: "✨ Sí, con bordado", fn: () => pedirTexto("¿Qué nombre bordamos? (ej: Dra. Camila Ruiz)", txt => {
          P.bordNombre = txt.slice(0, 22);
          pedirTexto("¿Y la profesión? (ej: Odontóloga)", txt2 => { P.bordRol = txt2.slice(0, 26); pedirHilo(); },
            [{ t: "Sin profesión", fn: () => { P.bordRol = ""; pedirHilo(); } }]);
        }) },
        { t: "Sin bordado", fn: () => paso(pedirEntrega) },
      ]);
    }
    function pedirHilo() {
      espera = null;
      bot("¿De qué color quieres el hilo del bordado?");
      chips(Object.entries(NEGOCIO.hilos).map(([h, hex]) => ({ t: h, dot: hex, fn: () => { P.hilo = h; paso(pedirEntrega); } })));
    }
    function pedirEntrega() {
      bot("¿Cómo lo quieres recibir?");
      chips([
        { t: "🏪 Lo recojo en el taller", fn: () => { P.entrega = `Recoge en el taller (${NEGOCIO.direccionTaller})`; paso(pedirNombre); } },
        { t: `🛵 Domicilio en ${NEGOCIO.ciudad}`, fn: () => pedirTexto("¿Cuál es tu dirección y barrio?", txt => { P.entrega = `Domicilio en ${NEGOCIO.ciudad}: ${txt}`; paso(pedirNombre); }) },
        { t: "🚚 Envío a otra ciudad", fn: () => pedirTexto("¿A qué ciudad y dirección lo enviamos?", txt => { P.entrega = `Envío a: ${txt}`; P.envio = true; paso(pedirNombre); }) },
      ]);
    }
    function pedirNombre() { pedirTexto("¡Ya casi! ¿Cuál es tu nombre completo?", txt => { P.nombre = txt; pedirCelular(); }); }
    function pedirCelular() {
      pedirTexto("¿A qué número de WhatsApp te confirmamos el pedido?", txt => {
        const cel = txt.replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "");
        if (!/^3\d{9}$/.test(cel)) { bot("Ese número no parece un celular de Colombia 🙈 Escríbelo con 10 dígitos, por ejemplo 3001234567."); return; }
        P.cel = cel; espera = null; resumen();
      });
    }
    function cuenta() {
      const base = precio(P.m, P.t), bord = (P.bordNombre ? NEGOCIO.bordado.nombre : 0) + (P.bordRol ? NEGOCIO.bordado.profesion : 0);
      const sub = (base + bord) * P.qty, pct = P.m.accesorio ? 0 : discount(P.qty), desc = Math.round(sub * pct);
      const recargo = P.medidas && P.medidas.id === "domicilio" ? NEGOCIO.recargoDomicilio : 0;
      const total = sub - desc + recargo;
      return { base, bord, sub, pct, desc, recargo, total, abono: Math.round(total / 2) };
    }
    function resumen() {
      ultimo = resumen;
      const k = cuenta(), t = P.t;
      const lineas = [
        ...(P.m.accesorio ? [["Producto", P.m.nombre], ["Estampado", P.color], ["Cantidad", P.qty]] : [
          ["Modelo", P.m.nombre], ["Color", P.color], ["Modalidad", `${t.t} (${NEGOCIO.tiempos[t.id]})`],
          ["Medidas", P.medidas ? P.medidas.t : "—"],
          ["Cantidad", P.qty],
          ["Bordado", P.bordNombre ? `${[P.bordNombre, P.bordRol].filter(Boolean).join(" / ")} (hilo ${P.hilo.toLowerCase()})` : "Sin bordado"]]),
        ["Entrega", P.entrega], ["Nombre", P.nombre], ["Celular", P.cel],
      ];
      const precioTxt = [`${pesos(k.base + k.bord)} c/u × ${P.qty}`, k.desc ? `descuento ${k.pct * 100}%: −${pesos(k.desc)}` : "", k.recargo ? `domicilio de medidas: +${pesos(k.recargo)}` : ""].filter(Boolean).join(" · ");
      const totales = sinPrecio(P.m) ? `<span>Precio: <b>te lo confirmamos por WhatsApp</b></span>` : `<span>${precioTxt}</span><span>Total estimado: <b>${pesos(k.total)}</b></span><span>Abono para empezar (50%): <b>${pesos(k.abono)}</b></span>`;
      bot(`¡Listo! Este es tu pedido 💗<div class="resumen">${lineas.map(([a, b]) => `<span>${a}: <b>${esc(b)}</b></span>`).join("")}${totales}</div>\n${P.m.accesorio ? "Te confirmamos la disponibilidad del estampado" : "El precio final se confirma al tomar tus medidas"}${P.envio ? `. ${NEGOCIO.envio}` : ""}.`);
      const msg = `Hola Multicostura 💗 quiero hacer este pedido:\n${lineas.map(([a, b]) => `• ${a}: ${b}`).join("\n")}\n` + (sinPrecio(P.m) ? "¿Qué precio tienen y están disponibles?" : `• ${precioTxt}\n• Total estimado: ${pesos(k.total)} (abono 50%: ${pesos(k.abono)})`);
      const opciones = [{ t: "✅ Enviar mi pedido por WhatsApp", href: waLink(msg), cls: "principal", fn: () => setTimeout(() => bot("¡Gracias! 💗 Te respondemos por WhatsApp para confirmar tu pedido y el abono."), 400) }];
      if (P.medidas && P.medidas.id !== "casa") opciones.push({ t: "📅 Agendar mis medidas", href: aSeccion("agenda"), fn: () => { if (matchMedia("(max-width: 520px)").matches) cerrarChat(false); irA("agenda"); } });
      if (P.medidas && P.medidas.id === "casa") opciones.push({ t: "📏 Cómo medirme en casa", href: aSeccion("medidas"), fn: () => { if (matchMedia("(max-width: 520px)").matches) cerrarChat(false); irA("medidas"); } });
      opciones.push({ t: "✏️ Empezar de nuevo", fn: () => paso(pedirModelo) });
      chips(opciones);
    }
    // Uniformes para un equipo: lo mínimo para cotizar y agendar la visita
    function chatEquipo() {
      P = {};
      pedirTexto("¡Claro! Somos fabricantes directos 💪 ¿Cómo se llama tu empresa o consultorio?", a => { P.empresa = a;
        pedirTexto("¿Cuántas personas son?", b => { P.personas = b;
          pedirTexto("¿En qué ciudad están?", c => { P.ciudad = c;
            pedirTexto("¿Con quién hablamos? (nombre y celular)", d => { espera = null;
              const msg = `Hola Multicostura 💗 quiero cotizar uniformes para mi equipo:\n• Empresa: ${P.empresa}\n• Personas: ${P.personas}\n• Ciudad: ${P.ciudad}\n• Contacto: ${d}`;
              bot(`Perfecto. Te llevamos la propuesta con precio por cantidad y logo bordado.<div class="resumen"><span>Empresa: <b>${esc(P.empresa)}</b></span><span>Personas: <b>${esc(P.personas)}</b></span><span>Ciudad: <b>${esc(P.ciudad)}</b></span><span>Contacto: <b>${esc(d)}</b></span></div>`);
              chips([{ t: "✅ Enviar por WhatsApp", href: waLink(msg), cls: "principal" }, { t: "🏠 Volver al inicio", fn: inicio }]);
            }); }); }); });
    }
    // Bono de regalo
    function chatBono() {
      P = {};
      bot("¡Qué lindo detalle! 🎁 ¿De qué valor quieres el bono?");
      chips(NEGOCIO.bonos.map(v => ({ t: pesos(v), fn: () => { P.valor = v;
        pedirTexto("¿Para quién es?", a => { P.para = a;
          pedirTexto("¿De parte de quién?", b => { espera = null;
            const msg = `Hola Multicostura 💗 quiero comprar un bono de regalo:\n• Valor: ${pesos(P.valor)}\n• Para: ${P.para}\n• De parte de: ${b}`;
            bot(`Bono de <b>${pesos(P.valor)}</b> para <b>${esc(P.para)}</b>, de parte de <b>${esc(b)}</b>. Te confirmamos el pago por WhatsApp.`);
            chips([{ t: "✅ Comprar por WhatsApp", href: waLink(msg), cls: "principal" }, { t: "🏠 Volver al inicio", fn: inicio }]);
          }); }); } })));
    }
    function pregunta() {
      espera = null;
      bot("Cuéntame tu duda o toca una de estas 🙂");
      chips(NEGOCIO.faq.slice(0, 6).map(f => ({ t: f.q, fn: () => contestar(f) })));
    }
    // Responde con la pregunta frecuente y ofrece verla en la sección; luego invita a seguir con la compra
    function contestar(f) {
      bot(`${respuesta(f)}<a class="faq-link" href="${aSeccion("faq-" + f.id)}" data-faq="${f.id}">Ver en preguntas frecuentes</a>`);
      if (ultimo && P.m) chips([{ t: "👉 Sigamos con mi pedido", fn: () => paso(ultimo) }, { t: "Otra pregunta", fn: pregunta }]);
      else chips([{ t: "🛍️ Hacer mi pedido", fn: () => paso(pedirModelo) }, { t: "Otra pregunta", fn: pregunta }, { t: "💬 Hablar con la dueña", href: waLink("Hola Multicostura 💗 tengo una pregunta") }]);
    }
    function buscarFaq(texto) {
      const palabras = norm(texto).split(/[^a-z0-9ñ]+/);
      let mejor = null, puntos = 0;
      for (const f of NEGOCIO.faq) {
        const p = f.claves.filter(c => palabras.some(w => w === c || (w.length > 4 && w.startsWith(c)))).length;
        if (p > puntos) { mejor = f; puntos = p; }
      }
      return mejor;
    }
    log.addEventListener("click", e => { const a = e.target.closest("[data-faq]"); if (a) { e.preventDefault(); abrirFaq(a.dataset.faq); } });
    $("chat-form").onsubmit = e => {
      e.preventDefault();
      const txt = input.value.trim();
      if (!txt) return;
      input.value = "";
      yo(txt);
      // una pregunta en medio de un paso de texto se responde (y luego se retoma el pedido) en vez de tomarla como respuesta
      const duda = /\?\s*$/.test(txt) || /^(como|cuanto|cuando|donde|que|tienen|hacen|puedo)\b/.test(norm(txt)) ? buscarFaq(txt) : null;
      if (espera && duda) { contestar(duda); return; }
      if (espera) { espera(txt); return; }
      const modelo = NEGOCIO.modelos.find(m => norm(txt).includes(norm(m.nombre)));
      if (modelo && !P.m) { elegirModelo(modelo); return; }
      if (INDECISA.test(norm(txt))) { redes(); return; }
      const f = buscarFaq(txt);
      if (f) { contestar(f); return; }
      bot("Esa no me la sé 🙈 pero la dueña te responde por WhatsApp en un momento.");
      chips([{ t: "💬 Preguntarle por WhatsApp", href: waLink(`Hola Multicostura 💗 tengo una pregunta: ${txt}`), cls: "principal" },
        { t: "Ver preguntas frecuentes", href: aSeccion("faq"), fn: () => { if (matchMedia("(max-width: 520px)").matches) cerrarChat(false); irA("faq"); } },
        ...(ultimo && P.m ? [{ t: "👉 Sigamos con mi pedido", fn: () => paso(ultimo) }] : [{ t: "🛍️ Hacer un pedido", fn: () => paso(pedirModelo) }])]);
    };
    function abrirChat() {
      $("chat-panel").hidden = false;
      $("chat-btn").setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("chat-open");
      if (!iniciado) { iniciado = true; inicio(); }
      input.focus();
    }
    function cerrarChat(volver = true) {
      $("chat-panel").hidden = true;
      $("chat-btn").setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("chat-open");
      if (volver) $("chat-btn").focus();
    }
    $("chat-btn").onclick = () => ($("chat-panel").hidden ? abrirChat() : cerrarChat());
    $("chat-close").onclick = () => cerrarChat();
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("chat-panel").hidden) cerrarChat(); });
