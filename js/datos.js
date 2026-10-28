// ===== DATOS DEL NEGOCIO: confirma todo con la dueña =====
const NEGOCIO = {
  nombre: "Multicostura",
  whatsapp: "573217830050",
  correo: "multicostura222@gmail.com", // de la página de Facebook
  instagram: "https://www.instagram.com/multicostura_uniformes/",
  tiktok: "https://www.tiktok.com/@uniformes_multicostura",
  direccionTaller: "Calle 24 T10-39, Tuluá (Valle) 763028",
  // Ubicación del pin en el mapa: "lat,lng" o el nombre exacto del negocio en Google Maps.
  // 4°05'32.5"N 76°12'22.5"W, confirmado por la dueña
  mapa: "4.092361,-76.206250",
  ciudad: "Tuluá",
  // Tienda en línea de Mecodes (confirmar con la dueña). Vacío = el botón abre WhatsApp.
  tiendaOnline: "",
  // Videos (confirmar con la dueña): { src: "video/a.mp4", titulo } o { youtube: "ID", titulo }. Vacío = sección oculta.
  // tiktok / instagram = id del video en su enlace (tiktok.com/@.../video/ID, instagram.com/reel/ID)
  videos: [
    { tiktok: "7686901923747745044", titulo: "Mini vlog: un día en Multicostura" },
    { instagram: "Dd_whrdjdQ2", titulo: "Viernes de producción en el taller" },
    { instagram: "DemTNC_AaFr", titulo: "Detrás de cada uniforme hay manos y dedicación" },
    { tiktok: "7632789467396394261", titulo: "Uniformes Multicostura" },
  ],

  // ---- Agenda de toma de medidas ----
  // URL de la aplicación web de Google Apps Script. Vacío = modo demostración.
  apiUrl: "",
  // Horario por día (0 = domingo). Varios rangos para dejar la hora de almuerzo libre.
  horario: {
    0: null,
    1: [["08:00", "12:00"], ["14:00", "18:00"]],
    2: [["08:00", "12:00"], ["14:00", "18:00"]],
    3: [["08:00", "12:00"], ["14:00", "18:00"]],
    4: [["08:00", "12:00"], ["14:00", "18:00"]],
    5: [["08:00", "12:00"], ["14:00", "18:00"]],
    6: [["08:00", "13:00"]],
  },
  paso: 30,              // cada cuántos minutos empieza un turno
  minutosPorPersona: 20, // tomar medidas a una persona
  minutosBase: 10,       // saludo, mostrar telas, etc.
  margen: { taller: 0, domicilio: 30 }, // minutos extra después de la cita (traslado)
  anticipacion: 120,     // minutos mínimos para agendar hoy
  diasVisibles: 14,
  recargoDomicilio: 8000,
  modalidades: [
    { id: "taller", ico: "store", t: "En el taller", d: "Vienes, te medimos y ves las telas en persona." },
    { id: "domicilio", ico: "home", t: "A domicilio", d: "Vamos a tu casa o consultorio en Tuluá." },
    { id: "casa", ico: "ruler", t: "Me mido en casa", d: "Estás en otra ciudad: nos envías tus medidas." },
  ],

  // ---- Diseño y precios (del catálogo 2026) ----
  // precio: null = el precio tienda de cada modelo. Los modelos con precioFijo no cambian de precio.
  // tiempo: tiempos de entrega de ejemplo, confirmar con la dueña
  tipos: [
    { id: "tienda", t: "Precio tienda", d: "Modelos disponibles y listos para entrega.", precio: null, tiempo: "Entrega inmediata", forma: "Listo en tienda", dias: "hoy" },
    { id: "pedido", t: "Diseño bajo pedido", d: "Elige uno de nuestros modelos y solicita tu talla.", precio: 175000, tiempo: "3 a 5 días hábiles", forma: "Bajo pedido", dias: "3 a 5 días" },
    { id: "medida", t: "Diseño por medida", d: "Diseño y confección personalizada según tus necesidades.", precio: 185000, tiempo: "5 a 8 días hábiles", forma: "A tu medida", dias: "5 a 8 días" },
  ],
  // Colores de ejemplo: confirmar con la dueña
  colores: {
    "Rosa": "#f2a7c6", "Lila": "#b39ad6", "Azul cielo": "#8dc3e8", "Verde menta": "#a8dcc8",
    "Fucsia": "#d6247f", "Azul rey": "#2456b8", "Verde jade": "#1f8a78", "Azul noche": "#1f2f5c",
    "Vinotinto": "#7a1f36", "Rojo": "#d22b3a", "Negro": "#1f1d22", "Café": "#6b4634", "Blanco": "#ffffff",
    // Vistos en el catálogo 2026 de Canva (nombres por confirmar con la dueña)
    "Morado": "#6b2d8c", "Petróleo": "#1f5f6e", "Beige": "#d2b48c", "Gris": "#a9adb3", "Palo de rosa": "#d9a5a0",
  },
  hilos: { "Blanco": "#ffffff", "Dorado": "#d4a64a", "Plateado": "#c9ccd2", "Negro": "#1f1d22", "Rosa": "#f2a7c6" },
  bordado: { nombre: 12000, profesion: 6000 },
  descuentos: [[1, 0], [3, 0.05], [6, 0.10], [12, 0.15]],
  envio: "Para otras ciudades, el envío se cotiza según el destino.",
  categorias: ["Todos", "Conjuntos", "Línea blancos", "Batas y pantalones", "Gorros quirúrgicos", "Medias de compresión"],
  // Ids de los modelos de "Nuestros recomendados": hasta 8 (confirmar con la dueña)
  // Categorías que no son uniformes: sin foto muestran un recuadro neutro, no el uniforme en SVG
  categoriasNoUniforme: ["Gorros quirúrgicos", "Medias de compresión"],
  recomendados: ["kaill", "alondra", "paris", "violet", "clasico", "durango", "luna", "lisboa"],
  // "Explora nuestras colecciones": cats = categorías del catálogo que filtra "Ver todo" (varias = un grupo con el nombre de la colección).
  // placeholder: replace with the client's photos (img = foto de la colección; sin img = tesela gris con el nombre y la cantidad)
  colecciones: [
    { t: "Uniformes", ico: "hanger", cats: ["Conjuntos"] },
    { t: "Línea blancos", ico: "coat", cats: ["Línea blancos"] },
    { t: "Gorros y medias", ico: "cap", cats: ["Gorros quirúrgicos", "Medias de compresión"] },
  ],
  // "¿Cuál es el uniforme para ti?": una foto por modalidad de NEGOCIO.tipos.
  // placeholder: replace with the client's photos
  perfiles: [
    { tipo: "tienda", cta: "Ver disponibles en tienda" },
    { tipo: "pedido", cta: "Elegir mi modelo" },
    { tipo: "medida", cta: "Agendar mis medidas" },
  ],
  // "Confianza en cada paso de tu compra" (ico = nombre en ICONO). Solo hechos del negocio.
  confianza: [
    { ico: "truck", t: "Envíos a toda Colombia", d: "El envío se cotiza según el destino" },
    { ico: "scissors", t: "Taller propio en Tuluá", d: "Cortamos, cosemos y bordamos en el mismo lugar" },
    { ico: "ruler", t: "A tu medida", d: "En el taller, a domicilio o desde tu casa" },
    { ico: "card", t: "Pago 50% para empezar", d: "Con el 50% empezamos a confeccionar tu uniforme" },
  ],
  // Imagen de la guía de tallas (confirmar con la dueña)
  guiaTallas: "img/guia-tallas.webp",
  // Tabla de tallas (de la foto de la guía de la dueña), en cm. La calculadora usa estos valores
  tallas: {
    orden: ["S", "M", "L", "XL"],
    blusa: {
      S: { busto: 96, cintura: 78, cadera: 104, largo: 68 }, M: { busto: 100, cintura: 84, cadera: 108, largo: 69 },
      L: { busto: 108, cintura: 90, cadera: 114, largo: 70 }, XL: { busto: 112, cintura: 96, cadera: 120, largo: 72 },
    },
    pantalon: {
      S: { cintura: 78, cadera: 104, largo: 102, largoRodilla: 60, contornoRodilla: 22 }, M: { cintura: 84, cadera: 108, largo: 104, largoRodilla: 61.5, contornoRodilla: 23 },
      L: { cintura: 90, cadera: 114, largo: 106, largoRodilla: 63, contornoRodilla: 24 }, XL: { cintura: 96, cadera: 120, largo: 106, largoRodilla: 64.5, contornoRodilla: 25 },
    },
  },
  // "Descubre el look completo": puntos sobre la foto (x, y en %). d puede ser una función para armar precios desde NEGOCIO
  look: {
    modelo: "kaill", color: "Azul rey", foto: "img/kaill-azul-rey.webp", alt: "Uniforme Kaill en azul rey, puesto",
    puntos: [
      { x: 52, y: 38, t: "Blusa Kaill", d: "Antifluido elástico, detalle en el escote y cuello postizo. Bolsillos funcionales." },
      { x: 50, y: 80, t: "Pantalón Kaill", d: "Viene con la blusa, en el mismo color. Si lo quieres solo, pídelo por WhatsApp." },
      { x: 62, y: 30, t: "Bordado opcional", d: () => `Tu nombre por ${pesos(NEGOCIO.bordado.nombre)} y tu profesión por ${pesos(NEGOCIO.bordado.profesion)}, en hilo ${listaY(Object.keys(NEGOCIO.hilos).map(h => h.toLowerCase()))}.` },
    ],
  },
  // Sin "colores" = todos los colores de la lista de arriba
  // precio: null = se consulta por WhatsApp (no se diseña). fotos: { Color: "ruta" } = foto por color (opcional)
  // Fotos recortadas del catálogo 2026 de Canva (img/*.webp)
  modelos: [
    { id: "kaill", recolor: true, nombre: "Kaill", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido elástico con detalle en el escote, cuello postizo y bolsillos funcionales. Cómodo y moderno.", foto: "img/kaill.webp",
      fotos: { "Azul rey": "img/kaill-azul-rey.webp", "Lila": "img/kaill-lila.webp", "Verde jade": "img/kaill-verde-jade.webp" } },
    { id: "alondra", recolor: true, nombre: "Alondra", precio: 165000, cat: ["Conjuntos"], desc: "Antifluido stretch de alto desempeño: elongación para moverte libre y tecnología de repelencia. Detalle en el escote posterior.", foto: "img/alondra.webp",
      fotos: { "Azul rey": "img/alondra.webp", "Morado": "img/alondra-morado.webp", "Negro": "img/alondra-negro.webp" } },
    { id: "clasico", recolor: true, nombre: "Clásico", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido stretch y algodón, cuello en V. Pantalón y blusa con cuello y mangas en rib personalizado.", foto: "img/clasico.webp",
      fotos: { "Café": "img/clasico.webp", "Negro": "img/clasico-negro.webp", "Blanco": "img/clasico-blanco-v.webp", "Rosa": "img/clasico-rosa.webp", "Azul cielo": "img/clasico-azul-cielo.webp", "Petróleo": "img/clasico-petroleo.webp", "Morado": "img/clasico-morado.webp" } },
    { id: "durango", recolor: true, nombre: "Durango", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado, escote en V y pantalón bota recta. Cuello y mangas en rib personalizado.", foto: "img/durango.webp",
      fotos: { "Petróleo": "img/durango.webp", "Rojo": "img/durango-rojo.webp", "Negro": "img/durango-negro.webp" } },
    { id: "neru", recolor: true, nombre: "Neru", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido elástico con cuello en V y mangas clásicas. Detalles que encantan.", foto: "img/neru.webp",
      fotos: { "Azul rey": "img/neru.webp", "Fucsia": "img/neru-fucsia.webp", "Verde jade": "img/neru-verde-jade.webp" } },
    { id: "glam", nombre: "Glam", precio: 159000, cat: ["Conjuntos"], desc: "Conjunto de pantalón y blusa en antifluido licrado, en bloques de color.", colores: ["Negro"], foto: "img/glam.webp" }, // diseño en bloques: no se recolorea; confirmar combinaciones con la dueña
    { id: "mariee", recolor: true, nombre: "Mariee", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado y dacrón nacional, escote en pico redondeado, pantalón bota recta y 3 bolsillos.", foto: "img/mariee.webp",
      fotos: { "Negro": "img/mariee.webp", "Vinotinto": "img/mariee-vinotinto.webp", "Beige": "img/mariee-beige.webp", "Petróleo": "img/mariee-petroleo.webp" } },
    { id: "luna", recolor: true, nombre: "Luna", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado. Blusa con escote redondo y ojal en el pecho, pantalón bota ancha.", foto: "img/luna.webp",
      fotos: { "Café": "img/luna.webp", "Petróleo": "img/luna-petroleo.webp" } },
    { id: "violet", recolor: true, nombre: "Violet", precio: 165000, cat: ["Conjuntos"], desc: "Diseño juvenil con bolsillos camuflados, manga corta y cuello redondo.", foto: "img/violet.webp" },
    { id: "paris", recolor: true, nombre: "París", precio: 165000, cat: ["Conjuntos", "Línea blancos"], desc: "Antifluido elástico con corte en el cuello y mangas zurcidas. Cómodo y elegante.", foto: "img/paris.webp",
      fotos: { "Lila": "img/paris.webp", "Rosa": "img/paris-rosa.webp", "Negro": "img/paris-negro.webp" } },
    { id: "lisboa", recolor: true, nombre: "Lisboa", precio: 165000, cat: ["Conjuntos"], desc: "Diseño exclusivo, ideal para quienes quieren lucir profesionales.", foto: "img/lisboa.webp" },
    { id: "valencia", recolor: true, nombre: "Valencia", precio: 169000, cat: ["Conjuntos"], desc: "Diseño moderno, blusa sin bolsillos.", foto: "img/valencia.webp", // nombre por confirmar: en el catálogo se lee "...ENCIA"
      fotos: { "Azul rey": "img/valencia.webp", "Gris": "img/valencia-gris.webp" } },
    { id: "alondra-blanco", nombre: "Alondra blanco", precio: 159000, cat: ["Línea blancos"], desc: "El Alondra en antifluido licrado blanco.", colores: ["Blanco"], foto: "img/alondra-blanco.webp" },
    { id: "clasico-blanco", nombre: "Clásico blanco", precio: 159000, cat: ["Línea blancos"], desc: "Corte recto, cuello en V y bolsillos funcionales. Ideal para jornadas laborales.", colores: ["Blanco"], foto: "img/clasico-blanco.webp" },
    { id: "durango-blanco", nombre: "Durango blanco", precio: 159000, cat: ["Línea blancos"], desc: "El Durango en antifluido licrado blanco.", colores: ["Blanco"], foto: "img/durango-blanco.webp" },
    { id: "bata", nombre: "Bata manga larga", precio: 140000, precioFijo: true, cat: ["Batas y pantalones", "Línea blancos"], sil: "sil-bata", desc: "Bata de manga larga.", colores: ["Negro", "Palo de rosa"], foto: "img/bata.webp", // colores del catálogo 2026
      fotos: { "Negro": "img/bata.webp", "Palo de rosa": "img/bata-palo-rosa.webp" } },
    { id: "gorro-quirurgico", nombre: "Gorro quirúrgico", precio: null, cat: ["Gorros quirúrgicos"], desc: "Gorro quirúrgico antifluido con toalla para el sudor y moña para el cabello, en varios diseños. Consulta precio y disponibilidad.", colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Negro"], foto: "img/gorro-quirurgico.webp" }, // confirmar con la dueña
    { id: "medias-compresion", nombre: "Medias de compresión", precio: null, cat: ["Medias de compresión"], desc: "Medias de compresión para jornadas largas de pie. Consulta tallas, precio y disponibilidad.", colores: ["Blanco", "Negro", "Café"], foto: "img/medias-compresion.webp" }, // confirmar con la dueña
    { id: "pantalon", nombre: "Pantalón", precio: 90000, precioFijo: true, cat: ["Batas y pantalones"], sil: "sil-pantalon", recolor: true, desc: "Pretina adelante, resorte atrás y bolsillos funcionales. Bota recta o jogger, a tu elección.", foto: "img/pantalon-gris.webp",
      fotos: { "Gris": "img/pantalon-gris.webp", "Lila": "img/pantalon-lila.webp", "Blanco": "img/pantalon.webp" } },
  ],
  proceso: [
    ["Diseña", "Elige modelo, color y bordado aquí o en el catálogo."],
    ["Agenda tus medidas", "En el taller, a domicilio o midiéndote en casa."],
    ["Abona y confeccionamos", "Con el 50% empezamos. Tu uniforme está en 5 a 8 días hábiles."],
    ["Prueba y entrega", "Te lo entregamos o enviamos. Si hay que ajustar algo, lo ajustamos."],
  ],
  // [nombre, cómo se mide, mínimo y máximo en cm]. El diagrama numera estas medidas en este mismo orden.
  medidas: [
    ["Busto o pecho", "Por la parte más llena, con el metro derecho por la espalda.", 60, 180],
    ["Cintura", "En la parte más angosta del abdomen.", 45, 180],
    ["Cadera", "En la parte más ancha de los glúteos.", 70, 200],
    ["Largo de manga", "Del hombro hasta donde quieres que termine.", 10, 90],
    ["Largo de pantalón", "De la cintura al tobillo, por el costado.", 50, 130],
    ["Ancho de hombros", "De la punta de un hombro a la otra, por la espalda.", 25, 70],
    ["Estatura", "Descalza, contra la pared.", 120, 220],
  ],
  // ---- Preguntas frecuentes (chatbot) ----
  // Respuestas de ejemplo: confirmar con la dueña. Si "a" es función, recibe NEGOCIO y arma el texto con sus datos (precios, tiempos, recargo, bonos).
  // claves: palabras que activan la respuesta (sin tildes, en minúscula).
  faq: [
    { q: "¿Cómo se paga?", a: "Con el 50% empezamos a confeccionar tu uniforme y el resto lo pagas al recibirlo.", claves: ["pago", "pagar", "abono", "abonar", "anticipo", "50", "nequi", "transferencia", "efectivo", "tarjeta"] }, // confirmar con la dueña
    { q: "¿En cuánto tiempo me lo entregan?", a: n => n.tipos.map(t => `${t.t}: ${t.tiempo.toLowerCase()}`).join(". ") + ".", claves: ["tiempo", "demora", "demoran", "tarda", "tardan", "cuando", "dias", "entrega", "entregan", "entregar", "listo"] }, // confirmar con la dueña
    { q: "¿Cuánto cuestan?", a: n => `Precio tienda desde ${pesos(minTienda)}, ${n.tipos[1].t.toLowerCase()} ${pesos(n.tipos[1].precio)} y ${n.tipos[2].t.toLowerCase()} ${pesos(n.tipos[2].precio)}. El bordado cuesta ${pesos(n.bordado.nombre)} el nombre y ${pesos(n.bordado.profesion)} la profesión, y hay descuento desde ${n.descuentos.find(([, p]) => p)[0]} uniformes.`, claves: ["precio", "precios", "cuesta", "cuestan", "cuanto", "valor", "vale", "costo", "bordado", "descuento"] }, // confirmar con la dueña
    { q: "¿Hacen envíos?", a: n => `Sí, enviamos a toda Colombia. ${n.envio}`, claves: ["envio", "envios", "enviar", "envian", "despacho", "ciudad", "colombia", "flete"] }, // confirmar con la dueña
    { q: "¿Toman medidas a domicilio?", a: n => `Sí, en ${n.ciudad} vamos a tu casa o consultorio con un recargo de ${pesos(n.recargoDomicilio)}. También puedes venir al taller o medirte en casa y enviarnos tus medidas.`, claves: ["domicilio", "visita", "visitan", "vienen", "van", "recargo", "consultorio"] }, // confirmar con la dueña
    { q: "¿Cómo tomo mis medidas?", a: "Usa un metro de costura, sin apretar: busto, cintura, cadera, largo de manga, largo de pantalón, hombros y estatura. Mira la guía en la sección \"Cómo tomar tus medidas en casa\" o agenda tu cita.", claves: ["medida", "medidas", "medir", "medirme", "talla", "tallas", "metro", "cinta"] }, // confirmar con la dueña
    { q: "¿Tienen bonos de regalo?", a: n => `Sí, bonos de ${n.bonos.map(pesos).join(", ")}. Pídelo en la sección "Bono de regalo".`, claves: ["bono", "bonos", "regalo", "regalar", "obsequio", "cumpleanos", "grado"] }, // confirmar con la dueña
    { q: "¿Hacen uniformes para empresas?", a: "Sí. Somos fabricantes directos: hacemos uniformes para clínicas, consultorios, restaurantes, cafeterías y comercios. Vamos a tomar medidas a todo el personal, con logo bordado y precio especial por cantidad. Llena el formulario de la sección Empresas.", claves: ["empresa", "empresas", "clinica", "equipo", "logo", "personal", "spa", "mayor", "restaurante", "cafeteria", "dotacion"] }, // confirmar con la dueña
    // De la historia destacada "INFORMACIÓN" de Instagram
    { q: "¿Hacen arreglos o devoluciones?", a: "Los arreglos (pinzas, ruedos, etc.) tienen un costo adicional. Si quieres modificar algún elemento de un uniforme, se confecciona desde cero y el precio varía según la confección personalizada. No se hace devolución de dinero.", claves: ["arreglo", "arreglos", "ruedo", "pinza", "devolucion", "devolver", "cambio", "cambiar", "modificar", "ajuste"] },
    // De las publicaciones de cuidado del uniforme en Facebook
    { q: "¿Cómo cuido mi uniforme?", a: "Lávalo con cuidado, no lo mezcles con otra ropa y evita el exceso de cloro. Así conserva el color y la tela por más tiempo.", claves: ["lavar", "lavado", "lavo", "cuidar", "cuidado", "cloro", "planchar", "plancha", "secar"] },
    { q: "¿Qué más venden en la tienda?", a: n => `Además de uniformes, en la tienda física (${n.direccionTaller}) encuentras gorros quirúrgicos antifluido, medias de compresión, batas quirúrgicas, calzado y porta carnet.`, claves: ["gorro", "gorros", "medias", "calzado", "zapatos", "portacarnet", "carnet", "bata", "accesorios", "tienda"] }, // confirmar con la dueña
    { q: "¿Dónde están y qué horario tienen?", a: n => `Estamos en ${n.direccionTaller}. Atendemos ${n.horarioTexto.charAt(0).toLowerCase() + n.horarioTexto.slice(1)}`, claves: ["donde", "ubicacion", "ubicados", "direccion", "taller", "mapa", "tulua", "horario", "abren", "abierto"] }, // confirmar con la dueña
  ],
  bonos: [100000, 150000, 200000, 300000],
  // Fotos de clientas reales. Las marcadas ejemplo: true son fotos de archivo (no son clientas) y nunca se muestran; la sección aparece cuando hay una foto real que carga.
  clientas: [
    { foto: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?auto=format&fit=crop&w=600&h=600&crop=top&q=70", texto: "Odontóloga", ejemplo: true },
    { foto: "https://images.unsplash.com/photo-1674049406176-021807a2802e?auto=format&fit=crop&w=600&h=600&crop=top&q=70", texto: "Enfermera jefe", ejemplo: true },
    { foto: "img/clienta-3.jpg", texto: "Esteticista" },
    { foto: "img/clienta-4.jpg", texto: "Médica general" },
  ],
  // Testimonios. placeholder: texts below are examples (ejemplo: true) and stay hidden; replace with real ones from the client's customers and remove "ejemplo: true"
  testimonios: [
    // Reseñas públicas en la página de Facebook de Multicostura (recomendaciones)
    { nombre: "Mónica O.", oficio: "Reseña en Facebook", texto: "Hermosos uniformes y cumple con mis expectativas. Gracias por crear una empresa tan completa." },
    { nombre: "Carol Lizeth A.", oficio: "Reseña en Facebook", texto: "Los he comprado y son de muy buena calidad." },
  ],
  horarioTexto: "Lunes a viernes de 8:00 a. m. a 12:00 m. y de 2:00 a 6:00 p. m. Sábados de 8:00 a. m. a 1:00 p. m.",
  // Banner principal. placeholder: replace with the client's photos (img = escritorio, imgMovil = celular). Fotos de ejemplo revisadas: sin logos, bordados ni marcas visibles.
  portada: [
    { img: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=1920&h=620&crop=top&q=70",
      imgMovil: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=800&h=640&crop=top&q=70",
      titulo: "Uniformes médicos hechos con cuidado", texto: "Conjuntos de pantalón y blusa en antifluido, cómodos para toda la jornada.", cta: "Ver catálogo", href: "#modelos" },
    { img: "https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=1920&h=620&crop=top&q=70",
      imgMovil: "https://images.unsplash.com/photo-1758691462651-611d730c5272?auto=format&fit=crop&w=800&h=640&crop=top&q=70",
      titulo: "Hechos a tu medida", texto: "Agenda la toma de medidas en el taller, a domicilio o desde tu casa.", cta: "Agendar medidas", href: "#agenda" },
    // Sin img: la diapositiva se muestra solo con texto hasta tener una foto propia
    { titulo: "Diseña tu uniforme", texto: "Elige modelo y color, y agrega tu nombre bordado.", cta: "Diseñar ahora", href: "#personaliza" },
  ],
};
// ==========================================================
