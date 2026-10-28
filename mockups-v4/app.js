// Multicostura v4: interactividad. Todo el contenido ya está en el HTML; esto solo lo enriquece.
(function () {
  "use strict";
  const MC = window.MC;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pesos = n => "$" + Math.round(n).toLocaleString("es-CO");
  const wa = texto => `https://wa.me/${MC.wa}?text=${encodeURIComponent(texto)}`;
  const descuento = n => [...MC.descuentos].reverse().find(([d]) => n >= d)[1];
  const modelo = id => MC.modelos.find(m => m.id === id);
  function safe(fn, nombre) { try { fn(); } catch (e) { console.warn("[" + nombre + "]", e); } }
  function marcar(grupo, boton, attr = "aria-pressed") { $$("button", grupo).forEach(b => b.setAttribute(attr, b === boton)); }
  function contador(caja, onCambio, min = 1) {
    const out = $("output", caja);
    caja.addEventListener("click", e => { const b = e.target.closest("button[data-d]"); if (!b) return; out.textContent = Math.max(min, +out.textContent + +b.dataset.d); onCambio(+out.textContent); });
  }
  function escala(caja, n) { $$("span", caja).forEach(s => s.classList.toggle("on", +s.dataset.n === [...MC.descuentos].reverse().find(([d]) => n >= d)[0])); }

  // Cabecera: se vuelve sólida al bajar
  safe(() => { const c = $(".cabecera"); const on = () => c.classList.toggle("solida", scrollY > 40); on(); addEventListener("scroll", on, { passive: true }); }, "cabecera");

  // Tarjetas: el color cambia la foto
  document.addEventListener("click", e => {
    const b = e.target.closest(".tarjeta .muestra"); if (!b) return;
    const t = b.closest(".tarjeta"), img = $(".foto img", t);
    marcar(b.closest("ul"), b); img.src = b.dataset.foto; img.alt = `${$("h3", t).textContent} en ${b.getAttribute("aria-label").toLowerCase()}`;
    const nota = $(".nota", t); nota.textContent = `${b.getAttribute("aria-label")} y ${nota.dataset.otros} colores más bajo pedido`;
  });

  // Banner: carrusel; cada campaña tiñe el fondo con su color (firma)
  safe(() => {
    const banner = $(".banner"); if (!banner) return;
    const diapos = $$(".diapo", banner), puntos = $$("#b-puntos button");
    let i = 0, pausado = reducido, reloj;
    function ir(n) {
      i = (n + diapos.length) % diapos.length;
      diapos.forEach((d, k) => d.classList.toggle("activa", k === i));
      puntos.forEach((p, k) => k === i ? p.setAttribute("aria-current", "true") : p.removeAttribute("aria-current"));
      banner.style.setProperty("--c", diapos[i].dataset.c);
    }
    function pausar(si) { pausado = si; clearInterval(reloj); if (!si) reloj = setInterval(() => ir(i + 1), 6500); $("#b-pausa").setAttribute("aria-label", si ? "Reanudar el carrusel" : "Pausar el carrusel"); }
    puntos.forEach((p, k) => p.addEventListener("click", () => ir(k)));
    $("#b-pausa").addEventListener("click", () => pausar(!pausado));
    banner.addEventListener("focusin", () => pausar(true));
    ir(0); pausar(pausado);
  }, "banner");

  // Calculadora de talla con la tabla real
  safe(() => {
    const f = $("#calc"); if (!f) return;
    const talla = (prenda, med) => Object.keys(MC.tabla[prenda]).find(t => Object.entries(med).every(([k, v]) => !v || v <= MC.tabla[prenda][t][k])) || null;
    function calc() {
      const v = id => parseFloat($(id).value) || 0;
      const b = talla("blusa", { busto: v("#t-busto"), cintura: v("#t-cintura"), cadera: v("#t-cadera") }), p = talla("pantalon", { cintura: v("#t-cintura"), cadera: v("#t-cadera") });
      let nota, cta;
      if (!b || !p) { nota = "Alguna medida pasa la talla XL. Te lo hacemos a tu medida para que no te quede justo."; cta = ["Agendar mis medidas", "agenda.html"]; }
      else if (b !== p) { nota = `Blusa y pantalón son de tallas distintas: pide blusa ${b} y pantalón ${p} al hacer el pedido.`; cta = [`Pedir blusa ${b} y pantalón ${p}`, "catalogo.html"]; }
      else { nota = `Te queda la talla ${b} en blusa y pantalón.`; cta = [`Ver modelos en talla ${b}`, "catalogo.html"]; }
      $("#r-tallas").textContent = `Blusa ${b || "a medida"} · Pantalón ${p || "a medida"}`; $("#r-nota").textContent = nota;
      $("#r-cta").textContent = cta[0]; $("#r-cta").href = cta[1];
      $$("#tabla-tallas [data-t]").forEach(c => c.classList.toggle("on", c.tagName === "TH" ? (c.dataset.t === b || c.dataset.t === p) : c.dataset.t === (c.dataset.p === "blusa" ? b : p)));
    }
    f.addEventListener("input", calc); f.addEventListener("submit", e => e.preventDefault()); calc();
  }, "talla");

  // Look completo
  safe(() => {
    const foto = $("#look-foto"); if (!foto) return;
    foto.addEventListener("click", e => { const b = e.target.closest(".punto"); if (!b) return; $$(".punto", foto).forEach(x => x.setAttribute("aria-pressed", x === b)); $("#look-item").innerHTML = `<b>${b.dataset.t}</b><p class="lead">${b.dataset.d}</p>`; });
  }, "look");

  // Ficha de producto
  safe(() => {
    const ficha = $("#ficha"); if (!ficha) return;
    const m = modelo(ficha.dataset.id);
    const st = { color: Object.keys(m.fotos)[0], modo: "pedido", talla: "M", cant: 1 };
    function pintar() {
      const foto = m.fotos[st.color];
      if (foto && $("#f-foto")) { $("#f-foto").src = foto; $("#f-foto").alt = `${m.nombre} en ${st.color.toLowerCase()}`; }
      ficha.style.setProperty("--c", MC.colores[st.color] || "#d6247f");
      if ($("#f-color")) $("#f-color").textContent = st.color;
      if ($("#f-color2")) $("#f-color2").textContent = st.color + (foto ? "" : ", sin foto todavía");
      $$(".muestra[data-color]", ficha).forEach(b => b.setAttribute("aria-pressed", b.dataset.color === st.color));
      let texto;
      if (!m.precio) { texto = `Hola, quiero preguntar por ${m.nombre.toLowerCase()}: precio, tallas y disponibilidad.`; }
      else {
        const base = m.fijo ? m.precio : st.modo === "tienda" ? m.precio : MC.tipos.find(t => t.id === st.modo).precio;
        const pct = m.fijo ? 0 : descuento(st.cant), bruto = base * st.cant, neto = bruto * (1 - pct);
        $("#f-total").textContent = pesos(neto);
        if ($("#f-antes")) $("#f-antes").textContent = pct ? `antes ${pesos(bruto)}, ahorras ${pesos(bruto - neto)}` : "";
        if ($("#f-escala")) escala($("#f-escala"), st.cant);
        if ($("#f-b-talla")) $("#f-b-talla").hidden = st.modo === "medida";
        const tipo = MC.tipos.find(t => t.id === st.modo);
        texto = `Hola, quiero pedir:\n${st.cant} × ${m.nombre}, ${st.color.toLowerCase()}${st.modo === "medida" ? ", a mi medida" : `, talla ${st.talla}`}${m.fijo ? "" : `\n${tipo.t} (${tipo.tiempo.toLowerCase()})`}\nTotal estimado: ${pesos(neto)}`;
      }
      $("#f-resumen").textContent = texto; $("#f-pedir").href = wa(texto);
    }
    ficha.addEventListener("click", e => {
      const c = e.target.closest(".muestra[data-color]"); if (c) { st.color = c.dataset.color; pintar(); }
      const t = e.target.closest("#f-tallas button"); if (t) { st.talla = t.textContent; marcar($("#f-tallas"), t); pintar(); }
    });
    if ($("#f-modos")) $("#f-modos").addEventListener("change", e => { st.modo = e.target.value; pintar(); });
    const cant = $("#f-cant"); if (cant) contador(cant.parentElement, n => { st.cant = n; pintar(); });
    pintar();
  }, "ficha");

  // Diseña tu uniforme
  safe(() => {
    const d = $("#dise"); if (!d) return;
    const usables = MC.modelos.filter(m => (m.cat === "Uniformes" || m.cat === "Línea blancos") && Object.keys(m.fotos).length);
    const pedido = new URLSearchParams(location.search).get("m");
    let m = usables.find(x => x.id === pedido) || usables[0];
    const st = { color: Object.keys(m.fotos)[0], modo: "pedido", cant: 1, hilo: "Blanco", vista: "foto" };
    function colores() {
      const conFoto = Object.keys(m.fotos), todos = [...conFoto, ...Object.keys(MC.colores).filter(c => !conFoto.includes(c))];
      $("#d-colores").innerHTML = todos.map(c => `<li><button type="button" class="muestra${conFoto.includes(c) ? "" : " sin-foto"}" style="--m:${MC.colores[c]}" aria-label="${c}${conFoto.includes(c) ? "" : ", sin foto"}" data-color="${c}"><i></i></button></li>`).join("");
      $$("#d-modos em").forEach(e => e.textContent = pesos(e.dataset.p === "tienda" ? m.precio : MC.tipos.find(t => t.id === e.dataset.p).precio));
    }
    function pintar() {
      const foto = m.fotos[st.color], hex = MC.colores[st.color];
      d.style.setProperty("--c", hex);
      // Sin foto en ese color, se muestra la ilustración (ahí sí va el nombre bordado)
      const ilus = st.vista === "ilus" || !foto;
      $("#d-foto").hidden = ilus; $("#d-ilus").hidden = !ilus;
      if (foto) { $("#d-foto").src = foto; $("#d-foto").alt = `${m.nombre} en ${st.color.toLowerCase()}`; }
      $("#v-foto").disabled = !foto; marcar($(".vistas", d), ilus ? $("#v-ilus") : $("#v-foto"));
      $("#d-top").setAttribute("fill", hex); $("#d-pants").setAttribute("fill", hex);
      const claro = ["#ffffff", "#f2a7c6", "#8dc3e8", "#a8dcc8", "#d2b48c", "#a9adb3", "#b39ad6", "#d9a5a0"].includes(hex);
      const hiloHex = MC.hilos[st.hilo] === "#ffffff" && claro ? "#26242b" : MC.hilos[st.hilo];
      $("#d-nombre").textContent = $("#d-b-nombre").value; $("#d-nombre").setAttribute("fill", hiloHex);
      $("#d-prof").textContent = $("#d-b-prof").value.toUpperCase(); $("#d-prof").setAttribute("fill", hiloHex);
      $("#d-color-n").textContent = st.color + (foto ? "" : ", se ve en la ilustración");
      $$("#d-colores .muestra").forEach(b => b.setAttribute("aria-pressed", b.dataset.color === st.color));
      $$("#d-modelos button").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === m.id));
      $("#d-hilo-n").textContent = st.hilo;
      const base = st.modo === "tienda" ? m.precio : MC.tipos.find(t => t.id === st.modo).precio;
      const bord = ($("#d-b-nombre").value ? MC.bordado.nombre : 0) + ($("#d-b-prof").value ? MC.bordado.profesion : 0);
      const pct = descuento(st.cant), bruto = (base + bord) * st.cant, neto = bruto * (1 - pct);
      $("#d-total").textContent = pesos(neto); $("#d-ahorro").textContent = pct ? `antes ${pesos(bruto)}, ahorras ${pesos(bruto - neto)}` : "";
      escala($("#d-escala"), st.cant);
      const tipo = MC.tipos.find(t => t.id === st.modo);
      const texto = `Hola, diseñé mi uniforme:\n${st.cant} × ${m.nombre}, ${st.color.toLowerCase()}\n${tipo.t} (${tipo.tiempo.toLowerCase()})${bord ? `\nBordado en hilo ${st.hilo.toLowerCase()}: ${[$("#d-b-nombre").value, $("#d-b-prof").value].filter(Boolean).join(", ")}` : ""}\nTotal estimado: ${pesos(neto)}`;
      $("#d-resumen").textContent = texto; $("#d-pedir").href = wa(texto);
    }
    $("#d-modelos").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; m = modelo(b.dataset.m); if (!m.fotos[st.color]) st.color = Object.keys(m.fotos)[0]; colores(); pintar(); });
    $("#d-colores").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { st.color = b.dataset.color; pintar(); } });
    $("#d-hilos").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { st.hilo = b.dataset.hilo; marcar($("#d-hilos"), b); st.vista = "ilus"; pintar(); } });
    $("#d-modos").addEventListener("change", e => { st.modo = e.target.value; pintar(); });
    ["#d-b-nombre", "#d-b-prof"].forEach(id => $(id).addEventListener("input", () => { st.vista = "ilus"; pintar(); }));
    $("#v-foto").addEventListener("click", () => { st.vista = "foto"; pintar(); });
    $("#v-ilus").addEventListener("click", () => { st.vista = "ilus"; pintar(); });
    contador($("#d-cant").parentElement, n => { st.cant = n; pintar(); });
    $("#d-form").addEventListener("submit", e => e.preventDefault());
    colores(); pintar();
  }, "disena");

  // Agenda: modalidad, día y hora según el horario del taller, datos y WhatsApp
  safe(() => {
    const f = $("#a-form"); if (!f) return;
    const st = { modo: "taller", personas: 1, dia: null, hora: null };
    const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    const min = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
    const hhmm = n => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
    const ocupado = (fecha, n) => ((fecha.getDate() * 7 + n) % 5) === 0; // ejemplo; la agenda real lee Google Sheets
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dias = Array.from({ length: 14 }, (_, k) => { const x = new Date(hoy); x.setDate(hoy.getDate() + k + 1); return x; });
    $("#a-dias").innerHTML = dias.map((x, k) => `<button type="button" data-k="${k}" ${MC.horario[x.getDay()] ? "" : "disabled"} aria-pressed="false"><small>${DIAS[x.getDay()]}</small><b>${x.getDate()}</b><small>${x.toLocaleDateString("es-CO", { month: "short" })}</small></button>`).join("");
    function horas() {
      const dur = 10 + 20 * st.personas + (st.modo === "domicilio" ? 30 : 0);
      $("#a-dur").textContent = `Duración: ${10 + 20 * st.personas} minutos${st.modo === "domicilio" ? " más el traslado" : ""}. Las horas tachadas ya están ocupadas (ejemplo).`;
      if (st.dia == null) { $("#a-horas").innerHTML = '<p class="lead">Elige un día para ver las horas libres.</p>'; return; }
      const x = dias[st.dia], slots = [];
      MC.horario[x.getDay()].forEach(([a, b]) => { for (let t = min(a); t + dur <= min(b); t += 30) slots.push(t); });
      $("#a-horas").innerHTML = slots.map((t, n) => `<button type="button" data-h="${hhmm(t)}" ${ocupado(x, n) ? "disabled" : ""} aria-pressed="${st.hora === hhmm(t)}">${hhmm(t)}</button>`).join("");
    }
    function resumen() {
      const modo = { taller: "en el taller", domicilio: "a domicilio", casa: "midiéndome en casa" }[st.modo];
      const nombre = $("#a-nombre").value.trim(), cel = $("#a-cel").value.trim(), dis = $("#a-diseno").value;
      let texto = `Hola, soy ${nombre || "(nombre)"}. Quiero tomarme las medidas ${modo}.`;
      if (st.modo !== "casa") texto += `\nDía: ${st.dia != null ? dias[st.dia].toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }) : "(elige un día)"} a las ${st.hora || "(elige la hora)"}\nPersonas: ${st.personas}`;
      if (st.modo === "domicilio") texto += `\nDirección: ${$("#a-dir").value || "(dirección)"}`;
      if (st.modo === "casa") texto += "\nMis medidas (cm): " + $$("[id^=a-m-]").map(i => `${i.closest(".campo").querySelector("label").textContent} ${i.value || "?"}`).join(", ");
      if (dis) texto += `\nDiseño: ${dis}`;
      texto += `\nCelular: ${cel || "(celular)"}`;
      const falta = [!nombre && "tu nombre", !cel && "tu celular", st.modo !== "casa" && st.dia == null && "el día", st.modo !== "casa" && !st.hora && "la hora"].filter(Boolean);
      $("#a-resumen").textContent = texto;
      $("#a-falta").textContent = falta.length ? `Falta: ${falta.join(", ")}.` : "Todo listo. Te confirmamos la cita por WhatsApp.";
      $("#a-enviar").href = wa(texto); $("#a-enviar").setAttribute("aria-disabled", falta.length > 0);
    }
    f.addEventListener("change", e => {
      if (e.target.name === "a-modo") {
        st.modo = e.target.value;
        $("#a-paso-fecha").hidden = st.modo === "casa"; $("#a-paso-medidas").hidden = st.modo !== "casa"; $("#a-c-dir").hidden = st.modo !== "domicilio";
        st.hora = null; horas();
      }
      resumen();
    });
    f.addEventListener("input", resumen);
    $("#a-dias").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; st.dia = +b.dataset.k; st.hora = null; marcar($("#a-dias"), b); horas(); resumen(); });
    $("#a-horas").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; st.hora = b.dataset.h; marcar($("#a-horas"), b); resumen(); });
    contador($("#a-personas").parentElement, n => { st.personas = n; st.hora = null; horas(); resumen(); });
    $("#a-enviar").addEventListener("click", e => { if ($("#a-enviar").getAttribute("aria-disabled") === "true") { e.preventDefault(); $("#a-falta").focus?.(); } });
    f.addEventListener("submit", e => e.preventDefault());
    horas(); resumen();
  }, "agenda");

  // Bono y empresas
  safe(() => {
    const b = $("#bono"); if (!b) return;
    let monto = 200000;
    function bono() {
      const texto = `Hola, quiero comprar un bono de regalo de ${pesos(monto)}.\nPara: ${$("#b-para").value || "(nombre)"}\nDe parte de: ${$("#b-de").value || "(tu nombre)"}${$("#b-msg").value ? `\nMensaje: ${$("#b-msg").value}` : ""}`;
      $("#b-resumen").textContent = texto; $("#b-enviar").href = wa(texto);
    }
    $("#b-montos").addEventListener("click", e => { const x = e.target.closest("button"); if (x) { monto = +x.dataset.v; marcar($("#b-montos"), x); bono(); } });
    b.addEventListener("input", bono); b.addEventListener("submit", e => e.preventDefault()); bono();
    const emp = $("#empresas");
    function cot() { $("#e-enviar").href = wa(`Hola, quiero cotizar uniformes para mi equipo.\nEmpresa: ${$("#e-emp").value || "(empresa)"}\nContacto: ${$("#e-nom").value || "(nombre)"}\nPersonas: ${$("#e-cant").value}\nCiudad: ${$("#e-ciudad").value}${$("#e-logo").checked ? "\nCon logo bordado" : ""}`); }
    emp.addEventListener("input", cot); emp.addEventListener("change", cot); emp.addEventListener("submit", e => e.preventDefault()); cot();
  }, "regalo");

  // Comparador
  safe(() => {
    const t = $("#cmp"); if (!t) return;
    const ini = ["kaill", "durango", "mariee"];
    function col(i, id) {
      const m = modelo(id), foto = Object.values(m.fotos)[0];
      $(`.cmp-foto[data-col="${i}"]`).innerHTML = foto ? `<img src="${foto}" alt="${m.nombre}">` : "";
      const val = { tienda: pesos(m.precio), pedido: m.fijo ? pesos(m.precio) : "$175.000", medida: m.fijo ? "No aplica" : "$185.000", tela: m.tela, escote: m.escote, bolsillos: m.bolsillos, pantalon: m.pantalon,
        colores: Object.keys(m.fotos).join(", ") || "Sin foto", cta: `<a class="btn btn-fucsia" href="modelo-${m.id}.html">Ver ${m.nombre}</a>` };
      $$(`td[data-col="${i}"]`, t).forEach(td => { td.innerHTML = val[td.dataset.k]; td.style.color = val[td.dataset.k] === "Por confirmar" ? "var(--piedra)" : ""; });
    }
    $$("select", t).forEach((s, i) => { s.value = ini[i]; col(i, ini[i]); s.addEventListener("change", () => col(i, s.value)); });
  }, "compara");

  // Chat de preguntas frecuentes; cuando la pregunta es clara, pasa a WhatsApp
  safe(() => {
    const chat = $("#chat"), log = $("#chat-log"), abrir = $("#abrir-chat");
    const quitarTildes = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const msg = (t, quien) => { const p = document.createElement("p"); p.className = "msg " + quien; p.textContent = t; log.append(p); log.scrollTop = log.scrollHeight; return p; };
    function inicio() {
      log.innerHTML = ""; msg("Hola, soy el asistente de Multicostura. Toca una pregunta o escríbela.", "bot");
      const box = document.createElement("div"); box.className = "preguntas";
      box.innerHTML = MC.faq.map((f, i) => `<button type="button" data-i="${i}">${f.q}</button>`).join(""); log.append(box);
    }
    function responder(q) {
      msg(q, "yo");
      const n = quitarTildes(q), hit = MC.faq.find(f => f.k.some(k => n.includes(k)));
      if (hit) msg(hit.a, "bot"); else msg("No tengo esa respuesta guardada. Te paso con la dueña por WhatsApp.", "bot");
      const p = msg("", "bot"); p.innerHTML = `<a class="btn btn-wa" href="${wa(`Hola, tengo una pregunta: ${q}`)}" target="_blank" rel="noopener">Seguir por WhatsApp</a>`;
    }
    abrir.addEventListener("click", () => { const ver = chat.hidden; chat.hidden = !ver; abrir.setAttribute("aria-expanded", ver); if (ver) { if (!log.children.length) inicio(); $("#chat-q").focus(); } });
    $("#cerrar-chat").addEventListener("click", () => { chat.hidden = true; abrir.setAttribute("aria-expanded", "false"); abrir.focus(); });
    log.addEventListener("click", e => { const b = e.target.closest(".preguntas button"); if (b) responder(MC.faq[+b.dataset.i].q); });
    $("#chat-form").addEventListener("submit", e => { e.preventDefault(); const q = $("#chat-q").value.trim(); if (q) { responder(q); $("#chat-q").value = ""; } });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !chat.hidden) $("#cerrar-chat").click(); });
  }, "chat");
})();
