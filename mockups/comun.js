// Mockup Multicostura: datos tomados de NEGOCIO (inicio.html) y piezas compartidas.
const WA = "573217830050";
const COLORES = {
  "Rosa": "#f2a7c6", "Lila": "#b39ad6", "Azul cielo": "#8dc3e8", "Verde menta": "#a8dcc8", "Fucsia": "#d6247f",
  "Azul rey": "#2456b8", "Verde jade": "#1f8a78", "Azul noche": "#1f2f5c", "Vinotinto": "#7a1f36", "Rojo": "#d22b3a",
  "Negro": "#1f1d22", "Café": "#6b4634", "Blanco": "#ffffff", "Morado": "#6b2d8c", "Petróleo": "#1f5f6e",
  "Beige": "#d2b48c", "Gris": "#a9adb3", "Palo de rosa": "#d9a5a0",
};
const TIPOS = [
  { id: "tienda", t: "Precio tienda", d: "Listo para llevar, en las tallas y colores que hay en el taller.", precio: "Desde $159.000", tiempo: "Entrega inmediata" },
  { id: "pedido", t: "Bajo pedido", d: "El modelo que te gustó, en tu color y tu talla.", precio: "$175.000", tiempo: "3 a 5 días hábiles" },
  { id: "medida", t: "A tu medida", d: "Te tomamos busto, cintura y cadera y lo cortamos para ti.", precio: "$185.000", tiempo: "5 a 8 días hábiles" },
];
const MODELOS = [
  { id: "kaill", nombre: "Kaill", precio: 159000, desc: "Antifluido elástico con detalle en el escote, cuello postizo y bolsillos funcionales.", fotos: { "Azul rey": "img/kaill-azul-rey.webp", "Lila": "img/kaill-lila.webp", "Verde jade": "img/kaill-verde-jade.webp", "Azul cielo": "img/kaill.webp" }, tag: "Más pedido" },
  { id: "alondra", nombre: "Alondra", precio: 165000, desc: "Antifluido stretch con elongación para moverte libre y detalle en el escote posterior.", fotos: { "Azul rey": "img/alondra.webp", "Morado": "img/alondra-morado.webp", "Negro": "img/alondra-negro.webp", "Blanco": "img/alondra-blanco.webp" } },
  { id: "paris", nombre: "París", precio: 165000, desc: "Antifluido elástico con corte en el cuello y mangas zurcidas.", fotos: { "Lila": "img/paris.webp", "Rosa": "img/paris-rosa.webp", "Negro": "img/paris-negro.webp" } },
  { id: "clasico", nombre: "Clásico", precio: 159000, desc: "Cuello en V, pantalón y blusa con cuello y mangas en rib personalizado.", fotos: { "Morado": "img/clasico-morado.webp", "Rosa": "img/clasico-rosa.webp", "Azul cielo": "img/clasico-azul-cielo.webp", "Petróleo": "img/clasico-petroleo.webp", "Negro": "img/clasico-negro.webp", "Blanco": "img/clasico-blanco-v.webp", "Café": "img/clasico.webp" } },
  { id: "durango", nombre: "Durango", precio: 159000, desc: "Antifluido licrado, escote en V y pantalón bota recta. Cuello y mangas en rib.", fotos: { "Petróleo": "img/durango.webp", "Rojo": "img/durango-rojo.webp", "Negro": "img/durango-negro.webp", "Blanco": "img/durango-blanco.webp" } },
  { id: "mariee", nombre: "Mariee", precio: 159000, desc: "Escote en pico redondeado, pantalón bota recta y 3 bolsillos.", fotos: { "Petróleo": "img/mariee-petroleo.webp", "Beige": "img/mariee-beige.webp", "Vinotinto": "img/mariee-vinotinto.webp", "Negro": "img/mariee.webp" } },
  { id: "neru", nombre: "Neru", precio: 159000, desc: "Antifluido elástico con cuello en V y mangas clásicas.", fotos: { "Fucsia": "img/neru-fucsia.webp", "Azul rey": "img/neru.webp", "Verde jade": "img/neru-verde-jade.webp" } },
  { id: "valencia", nombre: "Valencia", precio: 169000, desc: "Diseño moderno, blusa sin bolsillos.", fotos: { "Gris": "img/valencia-gris.webp", "Azul rey": "img/valencia.webp" } },
  { id: "luna", nombre: "Luna", precio: 159000, desc: "Blusa con escote redondo y ojal en el pecho, pantalón bota ancha.", fotos: { "Petróleo": "img/luna-petroleo.webp", "Café": "img/luna.webp" } },
  { id: "violet", nombre: "Violet", precio: 165000, desc: "Diseño juvenil con bolsillos camuflados, manga corta y cuello redondo.", fotos: { "Rosa": "img/violet.webp" } },
  { id: "lisboa", nombre: "Lisboa", precio: 165000, desc: "Diseño exclusivo, ideal para lucir profesional.", fotos: { "Rojo": "img/lisboa.webp" } },
  { id: "glam", nombre: "Glam", precio: 159000, desc: "Conjunto de pantalón y blusa en antifluido licrado.", fotos: { "Negro": "img/glam.webp" } },
];
// Tabla de medidas real de la clienta (img/guia-tallas.webp), en cm.
const TABLA = {
  blusa: { S: { busto: 96, cintura: 78, cadera: 104 }, M: { busto: 100, cintura: 84, cadera: 108 }, L: { busto: 108, cintura: 90, cadera: 114 }, XL: { busto: 112, cintura: 96, cadera: 120 } },
  pantalon: { S: { cintura: 78, cadera: 104, largo: 102 }, M: { cintura: 84, cadera: 108, largo: 104 }, L: { cintura: 90, cadera: 114, largo: 106 }, XL: { cintura: 96, cadera: 120, largo: 106 } },
};
// La talla más pequeña en la que caben todas las medidas; null = ninguna, va a la medida.
function tallaPara(prenda, med) {
  return Object.keys(TABLA[prenda]).find(t => Object.entries(med).every(([k, v]) => !v || !(k in TABLA[prenda][t]) || k === "largo" || v <= TABLA[prenda][t][k])) || null;
}
const pesos = n => "$" + n.toLocaleString("es-CO");
const ICO = {
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v11H2zM13 9.5h4l4 4V17h-8"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="m8 8 12 10M8 16 20 6"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-7 9 7M5.5 9.5V20h13V9.5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5V20h16V9.5M9 20v-5h6v5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
};

function cabecera(actual) {
  const nav = [["catalogo.html", "Catálogo"], ["producto.html?m=kaill", "Diseña"], ["inicio.html#medidas", "Agenda medidas"], ["#", "Empresas"], ["#", "Bonos regalo"]];
  return `
  <div class="barra"><ul><li>Agenda tu toma de medidas: en el taller, a domicilio en Tuluá o desde tu casa</li></ul></div>
  <header class="cabecera"><div class="contenedor">
    <a class="logo" href="inicio.html" aria-label="Multicostura, inicio"><span class="logo-m" aria-hidden="true">m</span><span><b>MULTICOSTURA</b><small>Uniformes médicos</small></span></a>
    <nav class="nav" aria-label="Principal">${nav.map(([h, t]) => `<a href="${h}"${t === actual ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
    <div class="acciones">
      <a class="icono-btn" href="https://wa.me/${WA}" aria-label="Escribir por WhatsApp" style="color:#128c4b">${ICO.wa}</a>
      <a class="btn btn-fucsia" href="inicio.html#medidas">Agendar medidas</a>
    </div>
  </div></header>`;
}
function pie() {
  return `
  <footer class="pie"><div class="contenedor">
    <div><a class="logo" href="inicio.html"><span class="logo-m">m</span><span><b>MULTICOSTURA</b><small>Uniformes médicos</small></span></a>
      <p style="max-width:34ch">Taller de uniformes médicos para mujer en Tuluá. Cortamos, cosemos y bordamos en el mismo lugar.</p></div>
    <div><h3>Comprar</h3><ul><li><a href="catalogo.html">Catálogo</a></li><li><a href="producto.html?m=kaill">Diseña tu uniforme</a></li><li><a href="#">Ver disponibles en tienda</a></li><li><a href="#">Bonos regalo</a></li></ul></div>
    <div><h3>Ayuda</h3><ul><li><a href="inicio.html#talla">Calcula tu talla</a></li><li><a href="inicio.html#medidas">Cómo tomar tus medidas</a></li><li><a href="inicio.html#preguntas">Preguntas frecuentes</a></li><li><a href="#">Uniformes para empresas</a></li></ul></div>
    <div><h3>Visítanos</h3><ul><li>Calle 24 T10-39, Tuluá (Valle)</li><li>Lunes a viernes 8 a 12 y 2 a 6</li><li>Sábados 8 a 1</li><li><a href="https://wa.me/${WA}">WhatsApp 321 783 0050</a></li><li><a href="https://www.instagram.com/multicostura_uniformes/">Instagram</a> y <a href="https://www.tiktok.com/@uniformes_multicostura">TikTok</a></li></ul></div>
  </div></footer>
  <a class="flotante" href="https://wa.me/${WA}" aria-label="Escribir por WhatsApp" style="color:#fff">${ICO.wa}</a>
  <nav class="tabbar" aria-label="Accesos rápidos">
    <a href="inicio.html">${ICO.home}Inicio</a><a href="catalogo.html">${ICO.grid}Catálogo</a><a href="producto.html?m=kaill">${ICO.pen}Diseña</a><a href="inicio.html#medidas">${ICO.calendar}Medidas</a><a href="#">${ICO.gift}Bonos</a>
  </nav>`;
}

// Tarjeta de producto: las muestras con foto cambian la imagen.
function tarjeta(m) {
  const cols = Object.keys(m.fotos);
  const otros = Object.keys(COLORES).length - cols.length;
  return `<article class="tarjeta" data-id="${m.id}">
    ${m.tag ? `<span class="etiqueta">${m.tag}</span>` : ""}
    <div class="foto"><img src="${m.fotos[cols[0]]}" alt="${m.nombre} en ${cols[0].toLowerCase()}" loading="lazy"></div>
    <h3><a href="producto.html?m=${m.id}">${m.nombre}</a></h3>
    <p class="precio">${pesos(m.precio)} <small>a $185.000</small></p>
    <ul class="muestras pequenas" aria-label="Colores con foto">${cols.map((c, i) => `<li><button class="muestra" style="--c:${COLORES[c]}" aria-pressed="${i === 0}" aria-label="${c}" data-foto="${m.fotos[c]}"><span></span></button></li>`).join("")}</ul>
    <p class="mas-colores" data-otros="${otros}">${cols[0]} y ${otros} colores más bajo pedido</p>
  </article>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest(".tarjeta .muestra");
  if (!b) return;
  const t = b.closest(".tarjeta"), img = t.querySelector(".foto img");
  t.querySelectorAll(".muestra").forEach(x => x.setAttribute("aria-pressed", x === b));
  img.src = b.dataset.foto; img.alt = `${t.querySelector("h3").textContent} en ${b.getAttribute("aria-label").toLowerCase()}`;
  const mas = t.querySelector(".mas-colores");
  mas.textContent = `${b.getAttribute("aria-label")} y ${mas.dataset.otros} colores más bajo pedido`;
});
