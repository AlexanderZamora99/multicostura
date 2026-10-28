"""Genera los mockups v4 de Multicostura como HTML estático a partir de los datos del negocio.

Uso: python3 generar.py   (escribe los .html en esta misma carpeta)
Los datos vienen de NEGOCIO en index.html; lo marcado "por confirmar" falta que lo confirme la dueña.
"""
import json
from html import escape
from pathlib import Path

AQUI = Path(__file__).parent
URL = "https://kevin9zamora9sanche-cloud.github.io/multicostura/"
WA = "573217830050"

COLORES = {
    "Rosa": "#f2a7c6", "Lila": "#b39ad6", "Azul cielo": "#8dc3e8", "Verde menta": "#a8dcc8", "Fucsia": "#d6247f",
    "Azul rey": "#2456b8", "Verde jade": "#1f8a78", "Azul noche": "#1f2f5c", "Vinotinto": "#7a1f36", "Rojo": "#d22b3a",
    "Negro": "#1f1d22", "Café": "#6b4634", "Blanco": "#ffffff", "Morado": "#6b2d8c", "Petróleo": "#1f5f6e",
    "Beige": "#d2b48c", "Gris": "#a9adb3", "Palo de rosa": "#d9a5a0",
}
TIPOS = [
    {"id": "tienda", "t": "Listo en tienda", "d": "Lo que hay hoy en el taller, en sus tallas y colores.", "precio": None, "tiempo": "Entrega inmediata"},
    {"id": "pedido", "t": "Bajo pedido", "d": "El modelo que te gustó, en tu color y tu talla.", "precio": 175000, "tiempo": "3 a 5 días hábiles"},
    {"id": "medida", "t": "A tu medida", "d": "Cortado con tus medidas de busto, cintura y cadera.", "precio": 185000, "tiempo": "5 a 8 días hábiles"},
]
# tela/escote/bolsillos/pantalón salen de las descripciones del catálogo 2026; lo que no dice queda "Por confirmar"
PC = "Por confirmar"
MODELOS = [
    dict(id="kaill", nombre="Kaill", precio=159000, cat="Uniformes", tag="Más pedido", desc="Antifluido elástico con detalle en el escote, cuello postizo y bolsillos funcionales. Cómodo y moderno.",
         tela="Antifluido elástico", escote="Detalle en el escote y cuello postizo", bolsillos="Funcionales", pantalon=PC,
         fotos={"Azul rey": "kaill-azul-rey", "Lila": "kaill-lila", "Verde jade": "kaill-verde-jade", "Azul cielo": "kaill"}),
    dict(id="alondra", nombre="Alondra", precio=165000, cat="Uniformes", desc="Antifluido stretch de alto desempeño: elongación para moverte libre y tecnología de repelencia. Detalle en el escote posterior.",
         tela="Antifluido stretch", escote="Detalle en el escote posterior", bolsillos=PC, pantalon=PC,
         fotos={"Azul rey": "alondra", "Morado": "alondra-morado", "Negro": "alondra-negro", "Blanco": "alondra-blanco"}),
    dict(id="paris", nombre="París", precio=165000, cat="Uniformes", desc="Antifluido elástico con corte en el cuello y mangas zurcidas. Cómodo y elegante.",
         tela="Antifluido elástico", escote="Corte en el cuello", bolsillos=PC, pantalon=PC,
         fotos={"Lila": "paris", "Rosa": "paris-rosa", "Negro": "paris-negro"}),
    dict(id="clasico", nombre="Clásico", precio=159000, cat="Uniformes", desc="Antifluido stretch y algodón, cuello en V. Pantalón y blusa con cuello y mangas en rib personalizado.",
         tela="Antifluido stretch y algodón", escote="Cuello en V en rib", bolsillos=PC, pantalon=PC,
         fotos={"Morado": "clasico-morado", "Rosa": "clasico-rosa", "Azul cielo": "clasico-azul-cielo", "Petróleo": "clasico-petroleo", "Negro": "clasico-negro", "Blanco": "clasico-blanco-v", "Café": "clasico"}),
    dict(id="durango", nombre="Durango", precio=159000, cat="Uniformes", desc="Antifluido licrado, escote en V y pantalón bota recta. Cuello y mangas en rib personalizado.",
         tela="Antifluido licrado", escote="En V con rib", bolsillos=PC, pantalon="Bota recta",
         fotos={"Petróleo": "durango", "Rojo": "durango-rojo", "Negro": "durango-negro", "Blanco": "durango-blanco"}),
    dict(id="mariee", nombre="Mariee", precio=159000, cat="Uniformes", desc="Antifluido licrado y dacrón nacional, escote en pico redondeado, pantalón bota recta y 3 bolsillos.",
         tela="Antifluido licrado y dacrón", escote="Pico redondeado", bolsillos="3", pantalon="Bota recta",
         fotos={"Petróleo": "mariee-petroleo", "Beige": "mariee-beige", "Vinotinto": "mariee-vinotinto", "Negro": "mariee"}),
    dict(id="neru", nombre="Neru", precio=159000, cat="Uniformes", desc="Antifluido elástico con cuello en V y mangas clásicas. Detalles que encantan.",
         tela="Antifluido elástico", escote="Cuello en V", bolsillos=PC, pantalon=PC,
         fotos={"Fucsia": "neru-fucsia", "Azul rey": "neru", "Verde jade": "neru-verde-jade"}),
    dict(id="valencia", nombre="Valencia", precio=169000, cat="Uniformes", desc="Diseño moderno, blusa sin bolsillos.",
         tela=PC, escote=PC, bolsillos="Blusa sin bolsillos", pantalon=PC,
         fotos={"Gris": "valencia-gris", "Azul rey": "valencia"}),
    dict(id="luna", nombre="Luna", precio=159000, cat="Uniformes", desc="Antifluido licrado. Blusa con escote redondo y ojal en el pecho, pantalón bota ancha.",
         tela="Antifluido licrado", escote="Redondo con ojal", bolsillos=PC, pantalon="Bota ancha",
         fotos={"Petróleo": "luna-petroleo", "Café": "luna"}),
    dict(id="violet", nombre="Violet", precio=165000, cat="Uniformes", desc="Diseño juvenil con bolsillos camuflados, manga corta y cuello redondo.",
         tela=PC, escote="Cuello redondo", bolsillos="Camuflados", pantalon=PC, fotos={"Rosa": "violet"}),
    dict(id="lisboa", nombre="Lisboa", precio=165000, cat="Uniformes", desc="Diseño exclusivo, ideal para quienes quieren lucir profesionales.",
         tela=PC, escote=PC, bolsillos=PC, pantalon=PC, fotos={"Rojo": "lisboa"}),
    dict(id="glam", nombre="Glam", precio=159000, cat="Uniformes", desc="Conjunto de pantalón y blusa en antifluido licrado.",
         tela="Antifluido licrado", escote=PC, bolsillos=PC, pantalon=PC, fotos={"Negro": "glam"}),
    dict(id="clasico-blanco", nombre="Clásico blanco", precio=159000, cat="Línea blancos", desc="Corte recto, cuello en V y bolsillos funcionales. Ideal para jornadas laborales.",
         tela=PC, escote="Cuello en V", bolsillos="Funcionales", pantalon=PC, fotos={"Blanco": "clasico-blanco"}),
    dict(id="bata", nombre="Bata manga larga", precio=140000, cat="Batas y complementos", fijo=True, desc="Bata de manga larga.",
         tela=PC, escote=PC, bolsillos=PC, pantalon="No aplica", fotos={"Negro": "bata", "Palo de rosa": "bata-palo-rosa"}),
    dict(id="pantalon", nombre="Pantalón", precio=90000, cat="Batas y complementos", fijo=True, desc="Pretina adelante, resorte atrás y bolsillos funcionales. Bota recta o jogger, a tu elección.",
         tela=PC, escote="No aplica", bolsillos="Funcionales", pantalon="Bota recta o jogger", fotos={"Blanco": "pantalon"}),
    dict(id="gorro", nombre="Gorro quirúrgico", precio=None, cat="Batas y complementos", desc="Gorro quirúrgico en antifluido, en varios estampados y colores. Consulta precio y disponibilidad.",
         tela="Antifluido", escote="No aplica", bolsillos="No aplica", pantalon="No aplica", fotos={}),
    dict(id="medias", nombre="Medias de compresión", precio=None, cat="Batas y complementos", desc="Medias de compresión para jornadas largas de pie. Consulta tallas, precio y disponibilidad.",
         tela=PC, escote="No aplica", bolsillos="No aplica", pantalon="No aplica", fotos={}),
]
POR_ID = {m["id"]: m for m in MODELOS}
CATS = ["Uniformes", "Línea blancos", "Batas y complementos"]
TABLA = {
    "blusa": {"S": dict(busto=96, cintura=78, cadera=104, largo=68), "M": dict(busto=100, cintura=84, cadera=108, largo=69), "L": dict(busto=108, cintura=90, cadera=114, largo=70), "XL": dict(busto=112, cintura=96, cadera=120, largo=72)},
    "pantalon": {"S": dict(cintura=78, cadera=104, largo=102), "M": dict(cintura=84, cadera=108, largo=104), "L": dict(cintura=90, cadera=114, largo=106), "XL": dict(cintura=96, cadera=120, largo=106)},
}
FAQ = [
    ("¿Cómo se paga?", "Con el 50% empezamos a confeccionar tu uniforme y el resto lo pagas al recibirlo. Los pagos se acuerdan por WhatsApp.", ["pago", "pagar", "abono", "50", "nequi", "transferencia", "tarjeta"]),
    ("¿En cuánto tiempo me lo entregan?", "Listo en tienda: el mismo día. Bajo pedido: 3 a 5 días hábiles. A tu medida: 5 a 8 días hábiles.", ["tiempo", "demora", "tarda", "dias", "entrega", "cuando"]),
    ("¿Hacen envíos fuera de Tuluá?", "Sí, enviamos a toda Colombia. El envío se cotiza según el destino.", ["envio", "envios", "enviar", "ciudad", "colombia", "domicilio"]),
    ("¿Tienen disponible en tienda?", "Lo que hay hoy en el taller lo ves en la tienda en línea, con tallas y colores. Si no está, te lo hacemos bajo pedido.", ["disponible", "tienen", "hay", "stock", "existencia", "tienda"]),
    ("¿Puedo pedir solo la blusa o solo el pantalón?", "Sí. Escríbenos por WhatsApp con el modelo y la talla, y te damos el precio.", ["solo", "blusa", "pantalon", "separado"]),
    ("¿Cuánto cuesta?", "Desde $159.000 en tienda, $175.000 bajo pedido y $185.000 a tu medida. Desde 3 uniformes hay descuento.", ["precio", "cuesta", "cuanto", "valor", "cotizar", "cotizacion", "descuento"]),
    ("¿Hacen uniformes para hombre?", "No. Multicostura confecciona solo para mujer; por eso los cortes están pensados para el cuerpo femenino.", ["hombre", "caballero", "masculino"]),
    ("¿Me pueden bordar el nombre?", "Sí. El nombre cuesta $12.000 y la profesión $6.000, en hilo blanco, dorado, plateado, negro o rosa.", ["bordado", "bordar", "nombre", "logo"]),
]
DATOS_JS = dict(wa=WA, colores=COLORES, tipos=TIPOS, tabla=TABLA, faq=[dict(q=q, a=a, k=k) for q, a, k in FAQ],
                modelos=[{k: m.get(k) for k in ("id", "nombre", "precio", "cat", "desc", "tela", "escote", "bolsillos", "pantalon", "fijo")} | {"fotos": {c: f"img/{f}.webp" for c, f in m["fotos"].items()}} for m in MODELOS],
                horario={0: None, 1: [["08:00", "12:00"], ["14:00", "18:00"]], 2: [["08:00", "12:00"], ["14:00", "18:00"]], 3: [["08:00", "12:00"], ["14:00", "18:00"]], 4: [["08:00", "12:00"], ["14:00", "18:00"]], 5: [["08:00", "12:00"], ["14:00", "18:00"]], 6: [["08:00", "13:00"]]},
                descuentos=[[1, 0], [3, .05], [6, .10], [12, .15]], bordado=dict(nombre=12000, profesion=6000), recargo=8000, bonos=[100000, 150000, 200000, 300000],
                hilos={"Blanco": "#ffffff", "Dorado": "#d4a64a", "Plateado": "#c9ccd2", "Negro": "#1f1d22", "Rosa": "#f2a7c6"})


def pesos(n):
    return "$" + f"{n:,}".replace(",", ".")


I = {  # iconos de línea
    "truck": '<path d="M2 6h11v11H2zM13 9.5h4l4 4V17h-8"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    "scissors": '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="m8 8 12 10M8 16 20 6"/>',
    "ruler": '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
    "store": '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5V20h16V9.5M9 20v-5h6v5"/>',
    "home": '<path d="m3 11 9-7 9 7M5.5 9.5V20h13V9.5"/>',
    "grid": '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    "pen": '<path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    "gift": '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/>',
    "pin": '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    "drop": '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    "chat": '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "compare": '<path d="M4 5h6v14H4zM14 5h6v14h-6z"/>',
    "cap": '<path d="M4 15a8 8 0 0 1 16 0v2H4zM4 17c0 2 3 3 8 3s8-1 8-3"/>',
}
WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'


def ico(n, sw="1.6"):
    if n == "wa":
        return WA_SVG
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[n]}</svg>'


def wa_link(texto):
    from urllib.parse import quote
    return f"https://wa.me/{WA}?text={quote(texto)}"


NAV = [("catalogo.html", "Catálogo"), ("disena.html", "Diseña"), ("agenda.html", "Agenda medidas"), ("regalo.html#empresas", "Empresas"), ("regalo.html", "Bonos regalo")]
TABS = [("inicio.html", "Inicio", "home"), ("catalogo.html", "Catálogo", "grid"), ("disena.html", "Diseña", "pen"), ("agenda.html", "Medidas", "calendar"), ("regalo.html", "Bonos", "gift")]


def pagina(archivo, titulo, desc, cuerpo, actual="", ld=None, og_img="img/kaill-azul-rey.webp", canon=""):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if t == actual else ""}>{t}</a>' for h, t in NAV)
    tabs = "".join(f'<a href="{h}"{" aria-current=\"page\"" if t == actual or (t == "Inicio" and actual == "Inicio") else ""}>{ico(i)}{t}</a>' for h, t, i in TABS)
    lds = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    html = f'''<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(titulo)}</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{URL}{canon or archivo}">
<meta property="og:type" content="website"><meta property="og:locale" content="es_CO">
<meta property="og:title" content="{escape(titulo)}"><meta property="og:description" content="{escape(desc)}">
<meta property="og:image" content="{URL}{og_img}">
<meta name="theme-color" content="#d6247f">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="app.css">
{lds}
</head>
<body data-pagina="{archivo.removesuffix(".html")}">
<a class="sr" href="#contenido">Saltar al contenido</a>
<div class="barra">Agenda tu toma de medidas: en el taller, a domicilio en Tuluá o desde tu casa</div>
<header class="cabecera"><div class="contenedor">
  <a class="logo" href="inicio.html" aria-label="Multicostura, inicio"><span class="logo-m" aria-hidden="true">m</span><span><b>MULTICOSTURA</b><small>Uniformes médicos</small></span></a>
  <nav class="nav" aria-label="Principal">{nav}</nav>
  <div class="acciones">
    <a class="icono-btn" href="https://wa.me/{WA}" aria-label="Escribir por WhatsApp" style="color:#128c4b">{ico("wa")}</a>
    <a class="btn btn-fucsia" href="agenda.html">Agendar medidas</a>
  </div>
</div></header>
<main id="contenido">
{cuerpo}
</main>
<footer class="pie"><div class="contenedor">
  <div><a class="logo" href="inicio.html"><span class="logo-m" aria-hidden="true">m</span><span><b>MULTICOSTURA</b><small>Uniformes médicos</small></span></a>
    <p style="margin-top:.8rem;max-width:34ch">Taller de uniformes médicos para mujer en Tuluá, Valle. Cortamos, cosemos y bordamos en el mismo lugar.</p></div>
  <div><h3>Comprar</h3><ul><li><a href="catalogo.html">Catálogo</a></li><li><a href="compara.html">Compara modelos</a></li><li><a href="disena.html">Diseña tu uniforme</a></li><li><a href="regalo.html">Bonos regalo</a></li></ul></div>
  <div><h3>Ayuda</h3><ul><li><a href="inicio.html#talla">Guía y calculadora de tallas</a></li><li><a href="agenda.html">Agenda tus medidas</a></li><li><a href="inicio.html#preguntas">Preguntas frecuentes</a></li><li><a href="regalo.html#empresas">Uniformes para empresas</a></li></ul></div>
  <div><h3>Contacto</h3><ul><li>Calle 24 T10-39, barrio Porvenir, Tuluá</li><li>Lunes a viernes 8 a 12 y 2 a 6; sábados 8 a 1</li><li><a href="https://wa.me/{WA}">WhatsApp 321 783 0050</a></li><li><a href="https://www.instagram.com/multicostura_uniformes/">Instagram</a> · <a href="https://www.tiktok.com/@uniformes_multicostura">TikTok</a></li></ul></div>
  <p class="final">© 2026 Multicostura. Uniformes médicos para mujer hechos en Tuluá.</p>
</div></footer>
<div class="flotantes">
  <button class="f-chat" id="abrir-chat" aria-label="Abrir preguntas frecuentes" aria-expanded="false" aria-controls="chat">{ico("chat")}</button>
  <a class="f-wa" href="https://wa.me/{WA}" aria-label="Escribir por WhatsApp">{ico("wa")}</a>
</div>
<section class="chat" id="chat" hidden aria-label="Preguntas frecuentes">
  <header><b>¿En qué te ayudamos?</b><button id="cerrar-chat" aria-label="Cerrar">×</button></header>
  <div class="log" id="chat-log" aria-live="polite"></div>
  <form id="chat-form"><label class="sr" for="chat-q">Escribe tu pregunta</label><input id="chat-q" placeholder="Escribe tu pregunta" autocomplete="off"><button class="btn btn-fucsia" type="submit">Enviar</button></form>
</section>
<nav class="tabbar" aria-label="Accesos rápidos">{tabs}</nav>
<script src="datos.js"></script>
<script src="app.js"></script>
</body>
</html>
'''
    (AQUI / archivo).write_text(html, encoding="utf-8")


def muestras(m, clase="", n=None):
    cols = list(m["fotos"])[:n] if n else list(m["fotos"])
    return f'<ul class="muestras {clase}" aria-label="Colores con foto">' + "".join(
        f'<li><button class="muestra" style="--m:{COLORES[c]}" aria-label="{c}" aria-pressed="{str(i == 0).lower()}" data-foto="img/{m["fotos"][c]}.webp" data-c="{COLORES[c]}"><i></i></button></li>'
        for i, c in enumerate(cols)) + "</ul>"


def tarjeta(m, insignias=True):
    cols = list(m["fotos"])
    if cols:
        foto = f'<img src="img/{m["fotos"][cols[0]]}.webp" alt="Uniforme médico {m["nombre"]} en {cols[0].lower()}" loading="lazy" width="800" height="1000">'
        nota = f'{cols[0]} y {len(COLORES) - len(cols)} colores más bajo pedido' if not m.get("fijo") else cols[0]
    else:
        foto = f'<div class="sin-foto-ilus">{ico("cap")}<span>Foto pendiente de la clienta</span></div>'
        nota = "Varios colores y estampados"
    precio = f'{pesos(m["precio"])}{" <small>a $185.000</small>" if not m.get("fijo") else ""}' if m["precio"] else "Consulta el precio"
    extra = (f'<div class="insignias"><span title="Tela antifluido">{ico("drop")}</span><span title="También a tu medida">{ico("ruler")}</span></div><span class="tela">Antifluido</span>' if insignias and cols and not m.get("fijo") else "")
    tag = f'<span class="etiqueta">{m["tag"]}</span>' if m.get("tag") else ""
    return f'''<article class="tarjeta" data-cat="{m["cat"]}" data-id="{m["id"]}">
  <div class="foto">{foto}{extra}{tag}</div>
  <h3><a href="modelo-{m["id"]}.html">{m["nombre"]}</a></h3>
  <p class="precio">{precio}</p>
  {muestras(m, "pequenas") if len(cols) > 1 else ""}
  <p class="nota" data-otros="{len(COLORES) - len(cols)}">{nota}</p>
</article>'''


LOCAL = {"@context": "https://schema.org", "@type": "ClothingStore", "name": "Multicostura", "url": URL, "telephone": "+57 321 783 0050",
         "description": "Taller de uniformes médicos para mujer en Tuluá: conjuntos antifluido en tienda, bajo pedido y a la medida.",
         "image": URL + "img/kaill-azul-rey.webp", "priceRange": "$159.000 - $185.000",
         "address": {"@type": "PostalAddress", "streetAddress": "Calle 24 T10-39, barrio Porvenir", "addressLocality": "Tuluá", "addressRegion": "Valle del Cauca", "postalCode": "763028", "addressCountry": "CO"},
         "geo": {"@type": "GeoCoordinates", "latitude": 4.092361, "longitude": -76.20625},
         "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:00", "closes": "12:00"},
                                       {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "14:00", "closes": "18:00"},
                                       {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "08:00", "closes": "13:00"}],
         "sameAs": ["https://www.instagram.com/multicostura_uniformes/", "https://www.tiktok.com/@uniformes_multicostura"]}


def migas_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": URL + u} for i, (n, u) in enumerate(items)]}


def tabla_tallas():
    filas = [("Busto", "blusa", "busto"), ("Cintura", "blusa", "cintura"), ("Cadera", "blusa", "cadera"), ("Largo blusa", "blusa", "largo"), ("Largo pantalón", "pantalon", "largo")]
    cab = "".join(f'<th data-t="{t}">{t}</th>' for t in TABLA["blusa"])
    cuerpo = "".join(f'<tr><td>{n}</td>' + "".join(f'<td data-t="{t}" data-p="{p}">{TABLA[p][t][k]}</td>' for t in TABLA["blusa"]) + "</tr>" for n, p, k in filas)
    return f'<div class="envoltura-tabla"><table class="tabla" id="tabla-tallas"><caption class="sr">Tabla de medidas de Multicostura, en centímetros</caption><thead><tr><th>Medida (cm)</th>{cab}</tr></thead><tbody>{cuerpo}</tbody></table></div>'


# ---------- Inicio ----------
def inicio():
    diapos = [("kaill", "Catálogo 2026", "Kaill", "En cuatro colores", "Pedir el Kaill", "modelo-kaill.html"),
              ("alondra", "Bajo pedido o a tu medida", "Hecho para tu cuerpo", "Te medimos en el taller o en tu casa", "Agendar medidas", "agenda.html"),
              ("durango", "Cuello y mangas en rib", "Durango", "Blanco, rojo, negro y petróleo", "Pedir el Durango", "modelo-durango.html")]
    d_html = ""
    for i, (mid, kick, t, sub, cta, href) in enumerate(diapos):
        m = POR_ID[mid]
        cols = list(m["fotos"])[:3]
        fotos = "".join(f'<a href="modelo-{mid}.html" aria-label="{m["nombre"]} en {c.lower()}"><img src="img/{m["fotos"][c]}.webp" alt="" {"fetchpriority=\"high\"" if i == 0 else "loading=\"lazy\""}><span>{c}</span></a>' for c in cols)
        sw = "".join(f'<li><span class="muestra" title="{c}"><i style="--m:{COLORES[c]}"></i></span></li>' for c in m["fotos"])
        d_html += f'''<div class="diapo{" activa" if i == 0 else ""}" data-c="{COLORES[cols[0]]}" aria-roledescription="diapositiva" aria-label="{i + 1} de {len(diapos)}">
  <div class="fotos">{fotos}</div>
  <div class="texto"><span class="kicker">{kick}</span><h2>{t}</h2><span class="sub">{sub}</span><ul class="muestras" aria-hidden="true">{sw}</ul><a class="btn btn-fucsia" href="{href}">{cta}</a></div>
</div>'''
    datos_franja = "".join(f"<li>{ico(i)}{t}</li>" for i, t in [("scissors", "Casi 10 años confeccionando para mujer"), ("truck", "Envíos a toda Colombia"), ("store", "Taller propio en Tuluá"), ("ruler", "Bajo pedido o a tu medida")])
    reco = "".join(tarjeta(POR_ID[i]) for i in ["kaill", "alondra", "paris", "clasico", "durango", "mariee", "neru", "valencia"])
    para = [("Listo en tienda", "Para la que lo necesita hoy", "valencia-gris", "Desde $159.000", "Hoy mismo", "Ver disponibles en tienda", "btn-blanco", "catalogo.html#tienda"),
            ("Bajo pedido", "Tu modelo favorito, en tu color y tu talla", "kaill-lila", "$175.000", "3 a 5 días hábiles", "Elegir mi modelo", "btn-fucsia", "catalogo.html"),
            ("A tu medida", "Para que te quede exacto, con tus medidas", "durango-rojo", "$185.000", "5 a 8 días hábiles", "Agendar mis medidas", "btn-blanco", "agenda.html")]
    para_html = "".join(f'<article class="pt"><img src="img/{img}.webp" alt="" loading="lazy"><div><h3>{t}</h3><p>{d}</p><span class="dato"><span>{p}</span><span>{tm}</span></span><a class="btn {cl} btn-ancho" href="{h}">{cta}</a></div></article>' for t, d, img, p, tm, cta, cl, h in para)
    vids = "".join(f'<div class="video"><div class="marco"><img src="img/{POR_ID[i]["fotos"][c]}.webp" alt="" loading="lazy"><span class="pendiente">Video pendiente</span><span class="play"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg></span></span></div><a class="btn btn-borde" href="modelo-{i}.html">{POR_ID[i]["nombre"]}, {pesos(POR_ID[i]["precio"])}</a></div>' for i, c in [("kaill", "Azul rey"), ("neru", "Verde jade"), ("mariee", "Beige"), ("paris", "Rosa"), ("clasico", "Petróleo")])
    faq_html = "".join(f'<details class="acordeon"{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a, _) in enumerate(FAQ))
    redes = "".join(f'<a href="https://www.instagram.com/multicostura_uniformes/"><img src="img/{f}.webp" alt="Uniforme Multicostura en Instagram" loading="lazy"></a>' for f in ["alondra-morado", "mariee-beige", "neru-verde-jade", "paris-rosa"])
    cuerpo = f'''<h1 class="sr">Multicostura, uniformes médicos para mujer en Tuluá</h1>
<section class="banner" aria-roledescription="carrusel" aria-label="Campañas" style="--c:{COLORES["Azul rey"]}">
  {d_html}
  <div class="banner-ctrl"><button class="icono-btn" id="b-pausa" aria-label="Pausar el carrusel"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="6" width="3.5" height="12" rx="1"/><rect x="13.5" y="6" width="3.5" height="12" rx="1"/></svg></button><div class="puntos" id="b-puntos">{"".join(f'<button aria-label="Ver campaña {i + 1}"{" aria-current=\"true\"" if i == 0 else ""}><span></span></button>' for i in range(len(diapos)))}</div></div>
</section>
<div class="franja"><div class="pista"><ul>{datos_franja}</ul><ul aria-hidden="true">{datos_franja}</ul></div></div>

<section class="seccion"><div class="contenedor">
  <div class="titulo"><h2>Nuestros recomendados</h2><p>Conjuntos de blusa y pantalón en antifluido. Toca un color para verlo puesto.</p></div>
  <div class="grilla">{reco}</div>
  <div class="centro"><a class="btn btn-fucsia" href="catalogo.html">Ver todo el catálogo</a></div>
</div></section>

<section class="seccion" style="padding-top:0">
  <div class="titulo contenedor"><h2>Explora nuestras colecciones</h2><p>Uniformes hechos solo para mujer, con un corte pensado para el cuerpo femenino y la jornada completa.</p></div>
  <div class="mosaico-col">
    <a class="col" href="catalogo.html"><img src="img/neru-fucsia.webp" alt="" loading="lazy"><div><h3>Uniformes</h3><p>12 modelos de blusa y pantalón en antifluido, en 18 colores.</p><span class="btn btn-fucsia">Ver uniformes</span></div></a>
    <a class="col" href="catalogo.html?cat=L%C3%ADnea%20blancos"><img src="img/clasico-blanco-v.webp" alt="" loading="lazy"><div><h3>Línea blancos</h3><p>Conjuntos blancos para laboratorio, odontología y consulta.</p><span class="btn btn-fucsia">Conoce la línea</span></div></a>
    <a class="col" href="catalogo.html?cat=Batas%20y%20complementos"><img src="img/bata-palo-rosa.webp" alt="" loading="lazy"><div><h3>Batas y complementos</h3><p>Batas, pantalones, gorros quirúrgicos y medias de compresión.</p><span class="btn btn-fucsia">Descubre todo</span></div></a>
  </div>
</section>

<section class="seccion gris" style="padding-block:3rem"><div class="contenedor">
  <div class="titulo"><h2>Confianza en cada paso de tu pedido</h2></div>
  <div class="confianza">
    <div>{ico("truck")}<b>Envíos a toda Colombia</b><span>El envío se cotiza según el destino</span></div>
    <div>{ico("scissors")}<b>Taller propio</b><span>Cortamos, cosemos y bordamos en Tuluá</span></div>
    <div>{ico("ruler")}<b>A tu medida</b><span>En el taller, a domicilio o desde casa</span></div>
    <div>{ico("wa")}<b>Atención directa</b><span>La dueña responde tu pedido por WhatsApp</span></div>
  </div>
</div></section>

<section class="seccion"><div class="contenedor">
  <div class="titulo"><h2>¿Cuál es el uniforme para ti?</h2><p>El mismo modelo se compra de tres formas. Elige según para cuándo lo necesitas y qué tan exacto lo quieres.</p></div>
  <div class="carril">{para_html}</div>
</div></section>

<section class="seccion gris"><div class="contenedor">
  <div class="titulo"><h2>Mira Multicostura en acción</h2><p>Así se mueven nuestros uniformes en una jornada real.</p></div>
  <div class="carril cinco">{vids}</div>
</div></section>

<section class="seccion" id="talla"><div class="contenedor">
  <div class="titulo"><h2>Encuentra tu talla</h2><p>Mídete con un metro de costura, sin apretar. Te decimos la talla de blusa y de pantalón según nuestra tabla.</p></div>
  <div class="talla">
    <div style="display:grid;gap:1rem">{tabla_tallas()}
      <details class="acordeon"><summary>Ver la guía con la foto</summary><img src="img/guia-tallas.webp" alt="Tabla de medidas de Multicostura con las partes del cuerpo señaladas: busto, cintura, cadera y largo de pantalón" loading="lazy" style="border-radius:8px;margin-bottom:1rem"></details>
    </div>
    <form class="caja" id="calc" novalidate>
      <div class="campos tres">
        <div class="campo"><label for="t-busto">Busto</label><div class="entrada"><input id="t-busto" type="number" inputmode="decimal" value="98"><span>cm</span></div></div>
        <div class="campo"><label for="t-cintura">Cintura</label><div class="entrada"><input id="t-cintura" type="number" inputmode="decimal" value="80"><span>cm</span></div></div>
        <div class="campo"><label for="t-cadera">Cadera</label><div class="entrada"><input id="t-cadera" type="number" inputmode="decimal" value="110"><span>cm</span></div></div>
      </div>
      <div class="aviso" aria-live="polite" style="display:grid;gap:.3rem"><b id="r-tallas">Blusa L · Pantalón L</b><span id="r-nota">Te queda la talla L en blusa y pantalón.</span></div>
      <a class="btn btn-fucsia" id="r-cta" href="catalogo.html">Ver modelos en mi talla</a>
    </form>
  </div>
</div></section>

<section class="look" aria-label="Descubre el look completo">
  <div class="look-foto" id="look-foto"><img src="img/kaill-azul-rey.webp" alt="Uniforme Kaill en azul rey, puesto" loading="lazy">
    <button class="punto" style="left:52%;top:38%" aria-pressed="true" data-t="Blusa Kaill" data-d="Antifluido elástico, detalle en el escote y cuello postizo. Bolsillos funcionales." aria-label="Blusa Kaill"></button>
    <button class="punto" style="left:50%;top:80%" aria-pressed="false" data-t="Pantalón Kaill" data-d="Viene con la blusa, en el mismo color. Si lo quieres solo, pídelo por WhatsApp." aria-label="Pantalón Kaill"></button>
    <button class="punto" style="left:62%;top:30%" aria-pressed="false" data-t="Bordado opcional" data-d="Tu nombre por $12.000 y tu profesión por $6.000, en hilo blanco, dorado, plateado, negro o rosa." aria-label="Bordado opcional"></button>
  </div>
  <div class="look-info">
    <h2 class="h2">Descubre el look completo</h2>
    <p class="lead">Toca los puntos de la foto para ver cada parte del uniforme Kaill.</p>
    <div class="look-item" id="look-item" aria-live="polite"><b>Blusa Kaill</b><p class="lead">Antifluido elástico, detalle en el escote y cuello postizo. Bolsillos funcionales.</p></div>
    <a class="btn btn-fucsia" href="modelo-kaill.html" style="justify-self:start">Pedir el Kaill completo</a>
  </div>
</section>

<section class="seccion"><div class="contenedor">
  <div class="titulo"><h2>Lo que dicen las que ya usan Multicostura</h2><p>Aquí van reseñas reales de clientas, con foto y nombre. Pendiente: capturas de WhatsApp o reseñas de Google.</p></div>
  <div class="resenas"><div class="resena">Reseña real pendiente</div><div class="resena">Reseña real pendiente</div><div class="resena">Reseña real pendiente</div><div class="resena">Reseña real pendiente</div></div>
</div></section>

<section class="seccion gris"><div class="contenedor dos">
  <div class="panel oscuro"><h2>Uniforma a tu equipo</h2><p class="lead">Vamos a tu clínica o consultorio, tomamos medidas a todo el equipo y bordamos el logo. Desde 3 uniformes hay descuento.</p><a class="btn btn-blanco" href="regalo.html#empresas">Pedir cotización</a></div>
  <div class="panel claro"><h2>Bono de regalo</h2><p class="lead">Regala un uniforme: quien lo recibe viene a tomarse las medidas y elige su modelo. Ideal para grados y cumpleaños.</p><a class="btn btn-fucsia" href="regalo.html">Comprar un bono</a></div>
</div></section>

<section class="seccion" id="preguntas"><div class="contenedor">
  <div class="titulo"><h2>Preguntas frecuentes</h2></div>
  <div class="faq">{faq_html}</div>
</div></section>

<section class="seccion gris"><div class="contenedor taller">
  <div>
    <h2 class="h2">Visítanos en Tuluá</h2>
    <p class="lead" style="margin-top:.8rem">Multicostura confecciona uniformes médicos solo para mujer desde hace casi 10 años. Lo que ves en el catálogo se corta, se cose y se borda en nuestro taller, y la dueña atiende cada pedido.</p>
    <dl class="horario"><dt>Dirección</dt><dd>Calle 24 T10-39, barrio Porvenir, Tuluá (Valle)</dd><dt>Lunes a viernes</dt><dd>8:00 a 12:00 y 2:00 a 6:00</dd><dt>Sábados</dt><dd>8:00 a 1:00</dd></dl>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap"><a class="btn btn-borde" href="https://www.google.com/maps?q=4.092361,-76.206250">Cómo llegar</a><a class="btn btn-wa" href="https://wa.me/{WA}">{ico("wa")}Escribir por WhatsApp</a></div>
  </div>
  <div style="display:grid;gap:10px">
    <div class="mapa"><div>{ico("pin")}<b>Mapa de Google embebido</b><br>Pin en Calle 24 T10-39</div></div>
    <div class="local">Foto del local pendiente de la clienta</div>
  </div>
</div></section>

<section class="seccion"><div class="contenedor">
  <h2 class="h2" style="margin-bottom:1.4rem">Encuéntranos en redes como <a class="enlace" href="https://www.instagram.com/multicostura_uniformes/">@multicostura_uniformes</a></h2>
  <div class="redes">{redes}</div>
</div></section>'''
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a, _ in FAQ]}
    pagina("inicio.html", "Uniformes médicos para mujer en Tuluá | Multicostura",
           "Taller de uniformes médicos para mujer en Tuluá, Valle. Conjuntos antifluido desde $159.000, bajo pedido en 3 a 5 días o a tu medida. Envíos a toda Colombia.",
           cuerpo, "Inicio", [LOCAL, faq_ld], canon="")


# ---------- Catálogo ----------
def catalogo():
    uniformes = [m for m in MODELOS]
    tarjetas = [tarjeta(m) for m in uniformes]
    tarjetas.insert(6, f'<div class="solo-prenda" data-cat="Uniformes"><h3>¿Solo la blusa o solo el pantalón?</h3><p>También los hacemos por separado. Cuéntanos el modelo y la talla, y te damos el precio.</p><a class="btn btn-wa" href="{wa_link("Hola, quiero cotizar solo una prenda (blusa o pantalón) del modelo: ")}">{ico("wa")}Preguntar por WhatsApp</a></div>')
    cuenta = {c: sum(1 for m in MODELOS if m["cat"] == c) for c in CATS}
    cats = f'<label><input type="radio" name="cat" value="" checked> Todos <span class="cuenta">{len(MODELOS)}</span></label>' + "".join(
        f'<label><input type="radio" name="cat" value="{c}"> {c} <span class="cuenta">{cuenta[c]}</span></label>' for c in CATS)
    formas = "".join(f'<label><input type="radio" name="forma" value="{t["id"]}"{" checked" if t["id"] == "pedido" else ""}> {t["t"]}<span class="cuenta">{t["tiempo"].replace(" hábiles", "").replace("Entrega inmediata", "hoy")}</span></label>' for t in TIPOS)
    colores = "".join(f'<li><button type="button" class="muestra" style="--m:{h}" aria-label="{c}" aria-pressed="false" data-color="{c}"><i></i></button></li>' for c, h in COLORES.items())
    cuerpo = f'''<div class="contenedor catalogo">
  <div class="migas"><a href="inicio.html">Inicio</a> / Catálogo</div>
  <div class="titulo" style="text-align:left;margin:0"><h1 class="h2">Catálogo de uniformes médicos para mujer</h1><p>Todos los modelos se hacen bajo pedido en tu color y talla (S a XL), o a tu medida. Bajo pedido: 3 a 5 días hábiles. A tu medida: 5 a 8.</p></div>
  <div class="tienda-fisica" id="tienda">{ico("store")}<p><b>¿Lo necesitas hoy?</b><br><span class="lead">Mira qué modelos, tallas y colores hay listos en el taller.</span></p><a class="btn btn-borde" href="#">Ver disponibles en tienda física</a></div>
  <div class="con-filtros">
    <aside class="panel-filtros" id="panel-filtros" aria-label="Filtros">
      <div class="pf-cabeza"><b>Filtros</b><button type="button" class="icono-btn" id="cerrar-filtros" aria-label="Cerrar filtros">×</button></div>
      <form id="filtros" class="pf-cuerpo">
        <fieldset><legend>Categoría</legend>{cats}</fieldset>
        <fieldset><legend>Forma de compra</legend>{formas}<small class="lead">Cambia el precio que ves en cada modelo.</small></fieldset>
        <fieldset><legend>Talla</legend><div class="chips" id="f-talla"><button type="button" aria-pressed="false">S</button><button type="button" aria-pressed="false">M</button><button type="button" aria-pressed="false">L</button><button type="button" aria-pressed="false">XL</button></div><a class="enlace" href="inicio.html#talla" style="font-size:.88rem">Calcula tu talla</a></fieldset>
        <fieldset><legend>Color <span class="lead" id="f-color-n" style="font-weight:500"></span></legend><ul class="muestras" id="f-colores">{colores}</ul><small class="lead">Muestra los modelos que tienen foto en ese color. Todos se hacen en cualquier color bajo pedido.</small></fieldset>
        <button type="reset" class="btn btn-borde btn-ancho">Quitar filtros</button>
      </form>
      <div class="pf-pie"><button type="button" class="btn btn-fucsia btn-ancho" id="ver-resultados">Ver modelos</button></div>
    </aside>
    <section>
      <div class="barra-res">
        <button type="button" class="btn btn-borde btn-filtros" id="abrir-filtros" aria-controls="panel-filtros" aria-expanded="false">Filtros</button>
        <p class="lead" id="res-cuenta" aria-live="polite">{len(MODELOS)} modelos</p>
        <label class="orden"><span class="sr">Ordenar</span><select id="orden"><option value="">Más pedidos</option><option value="asc">Precio menor</option><option value="desc">Precio mayor</option></select></label>
      </div>
      <div class="grilla" id="grilla-cat">{"".join(tarjetas)}</div>
      <p class="lead" id="sin-res" hidden>Ningún modelo tiene foto en ese color todavía, pero lo hacemos bajo pedido en cualquier modelo. <a class="enlace" href="disena.html">Míralo en Diseña</a>.</p>
    </section>
  </div>
</div>'''
    lista = {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{URL}modelo-{m['id']}.html", "name": m["nombre"]} for i, m in enumerate(MODELOS)]}
    pagina("catalogo.html", "Catálogo de uniformes médicos para mujer | Multicostura Tuluá",
           "12 modelos de uniformes médicos antifluido para mujer en 18 colores, tallas S a XL o a tu medida. Línea blancos, batas, gorros y medias. Envíos a toda Colombia.",
           cuerpo, "Catálogo", [lista, migas_ld([("Inicio", ""), ("Catálogo", "catalogo.html")])])


# ---------- Ficha por modelo ----------
def ficha(m):
    cols = list(m["fotos"])
    c0 = cols[0] if cols else None
    otros = [c for c in COLORES if c not in cols]
    sw_foto = "".join(f'<li><button class="muestra" style="--m:{COLORES[c]}" aria-label="{c}" aria-pressed="{str(c == c0).lower()}" data-color="{c}"><i></i></button></li>' for c in cols)
    sw_todos = "".join(f'<li><button class="muestra{"" if c in cols else " sin-foto"}" style="--m:{COLORES[c]}" aria-label="{c}{"" if c in cols else ", sin foto"}" aria-pressed="{str(c == c0).lower()}" data-color="{c}"><i></i></button></li>' for c in cols + (otros if not m.get("fijo") else []))
    modos = "" if m.get("fijo") or not m["precio"] else "".join(
        f'<label class="opcion"><input type="radio" name="modo" value="{t["id"]}"{" checked" if t["id"] == "pedido" else ""}><b>{t["t"]} <em>{pesos(t["precio"] or m["precio"])}</em></b><small>{t["d"]} {t["tiempo"]}.</small></label>' for t in TIPOS)
    escena = (f'<img id="f-foto" src="img/{m["fotos"][c0]}.webp" alt="{m["nombre"]} en {c0.lower()}" fetchpriority="high">' if c0 else f'<div class="sin-foto-ilus" style="height:100%">{ico("cap")}<span>Foto pendiente de la clienta</span></div>')
    precio = pesos(175000 if not m.get("fijo") and m["precio"] else m["precio"]) if m["precio"] else "Consulta el precio"
    ld = {"@context": "https://schema.org", "@type": "Product", "name": f"Uniforme médico {m['nombre']}", "description": m["desc"], "brand": {"@type": "Brand", "name": "Multicostura"},
          "image": [URL + f"img/{f}.webp" for f in m["fotos"].values()], "category": m["cat"], "audience": {"@type": "PeopleAudience", "suggestedGender": "female"}}
    if m["precio"]:
        ld["offers"] = {"@type": "AggregateOffer", "priceCurrency": "COP", "lowPrice": m["precio"], "highPrice": m["precio"] if m.get("fijo") else 185000, "availability": "https://schema.org/InStock"}
    cuerpo = f'''<div class="contenedor">
  <div class="migas"><a href="inicio.html">Inicio</a> / <a href="catalogo.html">Catálogo</a> / {m["nombre"]}</div>
  <div class="ficha" id="ficha" data-id="{m["id"]}" style="--c:{COLORES[c0] if c0 else "#d6247f"}">
    <div class="lado">
      <div class="escenario">{escena}{f'<div class="sobre"><b id="f-color">{c0}</b><ul class="muestras" aria-label="Color">{sw_foto}</ul></div>' if len(cols) > 1 else ""}</div>
      {'<div class="vistas" role="group" aria-label="Vista"><button aria-pressed="true">Frente</button><button disabled title="Foto pendiente">Espalda</button><button disabled title="Foto pendiente">Lado</button></div>' if c0 else ""}
    </div>
    <div class="ficha-info">
      <h1>{m["nombre"]}</h1>
      <p class="lead">{m["desc"]}</p>
      <div><span class="precio-grande" id="f-total">{precio}</span>{"" if m.get("fijo") or not m["precio"] else ' <span class="lead" id="f-antes"></span>'}<p class="lead" style="font-size:.9rem">{"Conjunto completo de blusa y pantalón. " if m["cat"] != "Batas y complementos" else ""}Se empieza con el 50%.</p></div>
      {f'<div class="bloque"><p class="rotulo">Cómo lo quieres</p><div class="opciones" id="f-modos">{modos}</div></div>' if modos else ""}
      {f'<div class="bloque"><p class="rotulo">Color <span id="f-color2">{c0}</span></p><ul class="muestras" id="f-colores">{sw_todos}</ul>{"<small class=lead>Los colores atenuados no tienen foto todavía; se hacen igual bajo pedido.</small>" if not m.get("fijo") else ""}</div>' if c0 else ""}
      {'<div class="bloque" id="f-b-talla"><p class="rotulo">Talla <a class="enlace" href="inicio.html#talla" style="font-weight:600;font-size:.88rem">¿No sabes tu talla? Calcúlala</a></p><div class="chips" id="f-tallas"><button aria-pressed="false">S</button><button aria-pressed="true">M</button><button aria-pressed="false">L</button><button aria-pressed="false">XL</button></div></div>' if m["precio"] else ""}
      {'<div class="bloque"><p class="rotulo">Cantidad <span>desde 3, con descuento</span></p><div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center"><div class="cantidad"><button type="button" data-d="-1" aria-label="Quitar uno">−</button><output id="f-cant">1</output><button type="button" data-d="1" aria-label="Agregar uno">+</button></div><div class="escala" id="f-escala"><span data-n="3">3+: 5%</span><span data-n="6">6+: 10%</span><span data-n="12">12+: 15%</span></div></div></div>' if m["precio"] and not m.get("fijo") else ""}
      <div class="pegajoso">
        <a class="btn btn-fucsia btn-ancho" id="f-pedir" href="{wa_link(f"Hola, quiero pedir el {m['nombre']}.")}" target="_blank" rel="noopener">{ico("wa")}Pedir por WhatsApp</a>
        {f'<a class="btn btn-borde btn-ancho" href="disena.html?m={m["id"]}">Diseñarlo con bordado</a>' if c0 and not m.get("fijo") else ""}
      </div>
      <p class="lead" style="font-size:.85rem">Así le llega tu pedido a la dueña:</p>
      <div class="resumen" id="f-resumen">Hola, quiero pedir el {m["nombre"]}.</div>
      <div>
        <details class="acordeon" open><summary>Detalles del modelo</summary><p>Tela: {m["tela"]}. Escote: {m["escote"]}. Bolsillos: {m["bolsillos"]}. Pantalón: {m["pantalon"]}.</p></details>
        <details class="acordeon"><summary>¿Solo la blusa o solo el pantalón?</summary><p>También se hacen por separado. Escríbenos por WhatsApp con el modelo y la talla, y te damos el precio.</p></details>
        <details class="acordeon"><summary>Envíos y entregas</summary><p>Enviamos a toda Colombia; el envío se cotiza según el destino. Bajo pedido: 3 a 5 días hábiles. A tu medida: 5 a 8.</p></details>
      </div>
    </div>
  </div>
  <section style="padding-bottom:4rem;display:grid;gap:1.2rem"><h2 class="h2">También te puede gustar</h2><div class="grilla">{"".join(tarjeta(x) for x in [y for y in MODELOS if y["id"] != m["id"] and y["cat"] == "Uniformes" and y["fotos"]][:4])}</div></section>
</div>'''
    pagina(f"modelo-{m['id']}.html", f"{m['nombre']}, uniforme médico para mujer | Multicostura Tuluá",
           f"{m['nombre']}: {m['desc']} {'Desde ' + pesos(m['precio']) + '.' if m['precio'] else ''} Hecho en Tuluá, envíos a toda Colombia.",
           cuerpo, "Catálogo", [ld, migas_ld([("Inicio", ""), ("Catálogo", "catalogo.html"), (m["nombre"], f"modelo-{m['id']}.html")])],
           og_img=f"img/{m['fotos'][c0]}.webp" if c0 else "img/kaill-azul-rey.webp")


# ---------- Diseña ----------
def disena():
    uniformes = [m for m in MODELOS if m["cat"] in ("Uniformes", "Línea blancos") and m["fotos"]]
    chips = "".join(f'<button type="button" aria-pressed="{str(i == 0).lower()}" data-m="{m["id"]}">{m["nombre"]}</button>' for i, m in enumerate(uniformes))
    hilos = "".join(f'<li><button type="button" class="muestra" style="--m:{h}" aria-label="Hilo {n.lower()}" aria-pressed="{str(n == "Blanco").lower()}" data-hilo="{n}"><i></i></button></li>' for n, h in DATOS_JS["hilos"].items())
    cuerpo = f'''<div class="contenedor">
  <div class="migas"><a href="inicio.html">Inicio</a> / Diseña tu uniforme</div>
  <div class="dise" id="dise" style="--c:{COLORES["Azul rey"]}">
    <div class="lado">
      <div class="escenario" id="d-escena">
        <img id="d-foto" src="img/kaill-azul-rey.webp" alt="Kaill en azul rey">
        <div class="ilustracion" id="d-ilus" hidden>
          <svg viewBox="0 0 200 300" role="img" aria-label="Ilustración del uniforme con tu bordado">
            <path id="d-top" d="M62 20 L88 14 Q100 40 112 14 L138 20 L176 44 L190 98 L160 106 L150 74 L152 150 L48 150 L50 74 L40 106 L10 98 L24 44 Z" fill="#2456b8" stroke="rgba(0,0,0,.18)"/>
            <path d="M88 14 Q100 40 112 14" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
            <rect x="58" y="104" width="30" height="26" rx="3" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="2"/><rect x="112" y="104" width="30" height="26" rx="3" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="2"/>
            <path id="d-pants" d="M52 156 L148 156 L156 292 L114 292 L100 196 L86 292 L44 292 Z" fill="#2456b8" stroke="rgba(0,0,0,.18)"/>
            <text id="d-nombre" x="128" y="62" text-anchor="middle" class="bordado-txt" font-size="11" fill="#ffffff"></text>
            <text id="d-prof" x="128" y="74" text-anchor="middle" font-family="Open Sans, sans-serif" font-size="6.5" font-weight="700" fill="#ffffff" letter-spacing=".5"></text>
          </svg>
        </div>
      </div>
      <div class="vistas" role="group" aria-label="Cómo verlo"><button type="button" id="v-foto" aria-pressed="true">Foto real</button><button type="button" id="v-ilus" aria-pressed="false">Ilustración con mi bordado</button></div>
      <p class="lead" style="font-size:.85rem">El nombre bordado se ve sobre la ilustración, no sobre la foto real.</p>
    </div>
    <form class="ficha-info" id="d-form" novalidate>
      <h1>Diseña tu uniforme</h1>
      <p class="lead">Elige el modelo y el color, agrega tu bordado y mira el precio con el descuento por cantidad. Al final te llega el resumen listo para enviar por WhatsApp.</p>
      <div class="bloque"><p class="rotulo">1. Modelo</p><div class="chips" id="d-modelos">{chips}</div></div>
      <div class="bloque"><p class="rotulo">2. Color <span id="d-color-n">Azul rey</span></p><ul class="muestras" id="d-colores"></ul><small class="lead">Los colores atenuados no tienen foto; en la ilustración sí los ves.</small></div>
      <div class="bloque"><p class="rotulo">3. Cómo lo quieres</p><div class="opciones" id="d-modos">{"".join(f'<label class="opcion"><input type="radio" name="d-modo" value="{t["id"]}"{" checked" if t["id"] == "pedido" else ""}><b>{t["t"]} <em data-p="{t["id"]}"></em></b><small>{t["tiempo"]}</small></label>' for t in TIPOS)}</div></div>
      <div class="bloque"><p class="rotulo">4. Bordado <span>opcional</span></p>
        <div class="campos" style="grid-template-columns:1fr 1fr">
          <div class="campo"><label for="d-b-nombre">Nombre <span class="req">+ $12.000</span></label><div class="entrada"><input id="d-b-nombre" maxlength="18" placeholder="Laura Gómez"></div></div>
          <div class="campo"><label for="d-b-prof">Profesión <span class="req">+ $6.000</span></label><div class="entrada"><input id="d-b-prof" maxlength="22" placeholder="Odontóloga"></div></div>
        </div>
        <p class="rotulo" style="margin:0">Color del hilo <span id="d-hilo-n" style="font-weight:500;color:var(--piedra)">Blanco</span></p><ul class="muestras" id="d-hilos">{hilos}</ul>
      </div>
      <div class="bloque"><p class="rotulo">5. Cantidad</p><div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center"><div class="cantidad"><button type="button" data-d="-1" aria-label="Quitar uno">−</button><output id="d-cant">1</output><button type="button" data-d="1" aria-label="Agregar uno">+</button></div><div class="escala" id="d-escala"><span data-n="3">3+: 5%</span><span data-n="6">6+: 10%</span><span data-n="12">12+: 15%</span></div></div></div>
      <div class="bloque"><p class="rotulo">Total estimado</p><div><span class="precio-grande" id="d-total">$175.000</span> <span class="lead" id="d-ahorro"></span></div></div>
      <div class="pegajoso"><a class="btn btn-fucsia btn-ancho" id="d-pedir" href="#" target="_blank" rel="noopener">{ico("wa")}Enviar mi diseño por WhatsApp</a><a class="btn btn-borde btn-ancho" href="agenda.html">Agendar medidas</a></div>
      <div class="resumen" id="d-resumen"></div>
    </form>
  </div>
</div>'''
    pagina("disena.html", "Diseña tu uniforme médico con bordado | Multicostura Tuluá",
           "Elige modelo y color, agrega tu nombre y profesión bordados y calcula el precio con descuento por cantidad. Envía tu diseño por WhatsApp.",
           cuerpo, "Diseña")


# ---------- Agenda ----------
def agenda():
    disenos = "".join(f'<option>{m["nombre"]}</option>' for m in MODELOS if m["precio"])
    medidas = [("busto", "Busto", "Por la parte más llena"), ("cintura", "Cintura", "En la parte más angosta"), ("cadera", "Cadera", "En la parte más ancha"),
               ("manga", "Largo de manga", "Del hombro a donde termine"), ("pantalon", "Largo de pantalón", "De la cintura al tobillo"), ("hombros", "Ancho de hombros", "De punta a punta por la espalda")]
    cuerpo = f'''<div class="contenedor">
  <div class="migas"><a href="inicio.html">Inicio</a> / Agenda tus medidas</div>
  <div class="titulo" style="text-align:left;margin:0 0 1.4rem"><h1 class="h2">Agenda tu toma de medidas</h1><p>Elige cómo te medimos, el día y la hora. Te confirmamos por WhatsApp. Para una persona son unos 30 minutos.</p></div>
  <div class="agenda">
    <form class="pasos" id="a-form" novalidate>
      <section class="paso"><h2>¿Cómo te medimos?</h2>
        <div class="opciones">
          <label class="opcion"><input type="radio" name="a-modo" value="taller" checked><b>En el taller <em>Sin costo</em></b><small>Calle 24 T10-39, Tuluá. Ves las telas en persona.</small></label>
          <label class="opcion"><input type="radio" name="a-modo" value="domicilio"><b>A domicilio <em>+ $8.000</em></b><small>Vamos a tu casa o consultorio en Tuluá.</small></label>
          <label class="opcion"><input type="radio" name="a-modo" value="casa"><b>Me mido en casa <em>Sin costo</em></b><small>Estás en otra ciudad: te guiamos y nos envías tus medidas.</small></label>
        </div>
      </section>
      <section class="paso" id="a-paso-fecha"><h2>Día y hora</h2>
        <div class="campo"><label for="a-personas">¿Cuántas personas?</label><div class="cantidad"><button type="button" data-d="-1" aria-label="Una persona menos">−</button><output id="a-personas">1</output><button type="button" data-d="1" aria-label="Una persona más">+</button></div></div>
        <div class="dias" id="a-dias" role="group" aria-label="Día"></div>
        <div class="horas" id="a-horas" role="group" aria-label="Hora"></div>
        <small class="lead" id="a-dur">Duración: 30 minutos. Las horas tachadas ya están ocupadas (ejemplo).</small>
      </section>
      <section class="paso" id="a-paso-medidas" hidden><h2>Tus medidas</h2>
        <div class="aviso">Mídete con un metro de costura, sin apretar. Si una medida queda mal tomada, el ajuste corre por tu cuenta.</div>
        <img src="img/guia-tallas.webp" alt="Guía de medidas de Multicostura" loading="lazy" style="border-radius:8px;max-height:420px;object-fit:contain;background:var(--gris-1)">
        <div class="campos" style="grid-template-columns:1fr 1fr">{"".join(f'<div class="campo"><label for="a-m-{k}">{n}</label><div class="entrada"><input id="a-m-{k}" type="number" inputmode="decimal"><span>cm</span></div><small class="lead">{h}</small></div>' for k, n, h in medidas)}</div>
      </section>
      <section class="paso"><h2>Tus datos</h2>
        <div class="campos">
          <div class="campo"><label for="a-nombre">Nombre <span class="req">(obligatorio)</span></label><div class="entrada"><input id="a-nombre" autocomplete="name" required></div></div>
          <div class="campo"><label for="a-cel">Celular <span class="req">(obligatorio)</span></label><div class="entrada"><input id="a-cel" type="tel" inputmode="tel" autocomplete="tel" required placeholder="300 123 4567"></div></div>
          <div class="campo" id="a-c-dir" hidden><label for="a-dir">Dirección en Tuluá</label><div class="entrada"><input id="a-dir" autocomplete="street-address"></div></div>
          <div class="campo"><label for="a-diseno">Diseño que te interesa</label><div class="entrada"><select id="a-diseno"><option value="">Aún no sé</option>{disenos}</select></div></div>
        </div>
      </section>
    </form>
    <aside class="lado caja">
      <p class="rotulo" style="margin:0">Resumen</p>
      <div class="resumen" id="a-resumen"></div>
      <p class="lead" id="a-falta" style="font-size:.88rem"></p>
      <a class="btn btn-fucsia btn-ancho" id="a-enviar" href="#" target="_blank" rel="noopener">{ico("wa")}Confirmar por WhatsApp</a>
    </aside>
  </div>
</div>'''
    pagina("agenda.html", "Agenda tu toma de medidas | Multicostura Tuluá",
           "Agenda la toma de medidas para tu uniforme médico: en el taller en Tuluá, a domicilio o midiéndote en casa con nuestra guía. Confirmación por WhatsApp.",
           cuerpo, "Agenda medidas")


# ---------- Regalo y empresas ----------
def regalo():
    montos = "".join(f'<button type="button" aria-pressed="{str(b == 200000).lower()}" data-v="{b}">{pesos(b)}</button>' for b in DATOS_JS["bonos"])
    cuerpo = f'''<div class="contenedor" style="padding-bottom:4rem">
  <div class="migas"><a href="inicio.html">Inicio</a> / Bonos y empresas</div>
  <div class="dos" style="align-items:start">
    <form class="panel claro" id="bono" novalidate>
      <h1 class="h2">Bono de regalo</h1>
      <p class="lead">Compras el bono, lo pagas por WhatsApp y te lo entregamos impreso para que se lo des a quien quieras. Ella viene, se toma las medidas y elige su modelo.</p>
      <div><p class="rotulo">Valor del bono</p><div class="chips" id="b-montos">{montos}</div></div>
      <div class="campos">
        <div class="campo"><label for="b-para">¿Para quién es? <span class="req">(obligatorio)</span></label><div class="entrada"><input id="b-para" placeholder="Valentina"></div></div>
        <div class="campo"><label for="b-de">¿De parte de quién? <span class="req">(obligatorio)</span></label><div class="entrada"><input id="b-de" placeholder="Tu nombre"></div></div>
        <div class="campo"><label for="b-msg">Mensaje para la tarjeta</label><div class="entrada"><textarea id="b-msg" placeholder="¡Feliz grado!"></textarea></div></div>
      </div>
      <div class="resumen" id="b-resumen"></div>
      <a class="btn btn-fucsia btn-ancho" id="b-enviar" href="#" target="_blank" rel="noopener">{ico("wa")}Pedir el bono por WhatsApp</a>
    </form>
    <form class="panel oscuro" id="empresas" novalidate style="scroll-margin-top:90px">
      <h2>Uniforma a tu equipo</h2>
      <p class="lead">Vamos a tu clínica, consultorio o spa, tomamos medidas a todo el equipo y bordamos el logo.</p>
      <ul><li>3 a 5 uniformes: 5% menos</li><li>6 a 11 uniformes: 10% menos</li><li>12 o más: 15% menos</li></ul>
      <div class="campos">
        <div class="campo"><label for="e-emp">Empresa</label><div class="entrada"><input id="e-emp" autocomplete="organization"></div></div>
        <div class="campo"><label for="e-nom">Tu nombre</label><div class="entrada"><input id="e-nom" autocomplete="name"></div></div>
        <div class="campo"><label for="e-cant">¿Cuántas personas?</label><div class="entrada"><input id="e-cant" type="number" inputmode="numeric" value="6"></div></div>
        <div class="campo"><label for="e-ciudad">Ciudad</label><div class="entrada"><input id="e-ciudad" value="Tuluá"></div></div>
      </div>
      <label class="opcion" style="color:var(--tinta)"><input type="checkbox" id="e-logo" checked><b>Con logo bordado</b><small>Nos envías el logo por WhatsApp.</small></label>
      <a class="btn btn-fucsia btn-ancho" id="e-enviar" href="#" target="_blank" rel="noopener">{ico("wa")}Pedir cotización por WhatsApp</a>
    </form>
  </div>
</div>'''
    pagina("regalo.html", "Bono de regalo y uniformes para empresas | Multicostura Tuluá",
           "Regala un uniforme médico con un bono de Multicostura, o pide cotización para uniformar a tu clínica o consultorio con descuento por cantidad.",
           cuerpo, "Bonos regalo")


# ---------- Comparador ----------
def compara():
    ops = "".join(f'<option value="{m["id"]}">{m["nombre"]}</option>' for m in MODELOS if m["cat"] != "Batas y complementos")
    filas = [("Precio en tienda", "tienda"), ("Bajo pedido", "pedido"), ("A tu medida", "medida"), ("Tela", "tela"), ("Escote", "escote"), ("Bolsillos", "bolsillos"), ("Pantalón", "pantalon"), ("Colores con foto", "colores")]
    cuerpo = f'''<div class="contenedor" style="padding-bottom:4rem;display:grid;grid-template-columns:minmax(0,1fr);gap:1.4rem">
  <div class="migas"><a href="inicio.html">Inicio</a> / <a href="catalogo.html">Catálogo</a> / Compara modelos</div>
  <div class="titulo" style="text-align:left;margin:0"><h1 class="h2">Compara modelos</h1><p>Elige hasta tres modelos y míralos lado a lado. Lo que dice "Por confirmar" lo completa la dueña.</p></div>
  <div class="comparador"><table id="cmp">
    <thead><tr><th></th>{"".join(f'<th><div class="cmp-foto" data-col="{i}"></div><label class="sr" for="cmp-{i}">Modelo {i + 1}</label><select id="cmp-{i}" data-col="{i}">{ops}</select></th>' for i in range(3))}</tr></thead>
    <tbody>{"".join(f'<tr><th scope="row">{n}</th>{"".join(f"<td data-col={i} data-k={k}></td>" for i in range(3))}</tr>' for n, k in filas)}<tr><th></th>{"".join(f'<td data-col="{i}" data-k="cta"></td>' for i in range(3))}</tr></tbody>
  </table></div>
</div>'''
    pagina("compara.html", "Compara uniformes médicos para mujer | Multicostura",
           "Compara modelos de uniformes médicos lado a lado: precio, tela, escote, bolsillos, pantalón y colores.", cuerpo, "Catálogo")


if __name__ == "__main__":
    (AQUI / "datos.js").write_text("window.MC = " + json.dumps(DATOS_JS, ensure_ascii=False) + ";\n", encoding="utf-8")
    inicio(); catalogo(); disena(); agenda(); regalo(); compara()
    for m in MODELOS:
        ficha(m)
    print("Páginas:", len(list(AQUI.glob("*.html"))))
