    // ===== DATOS DEL NEGOCIO: confirma todo con la dueña =====
    const NEGOCIO = {
      nombre: "Multicostura",
      whatsapp: "573217830050",
      instagram: "https://www.instagram.com/multicostura_uniformes/",
      tiktok: "https://www.tiktok.com/@uniformes_multicostura",
      facebook: "https://www.facebook.com/multicosturas2016",
      correo: "multicostura222@gmail.com", // de la página de Facebook
      horarioTexto: "Lunes a viernes de 8:00 a. m. a 12:00 m. y de 2:00 a 6:00 p. m. Sábados de 8:00 a. m. a 1:00 p. m.",
      direccionTaller: "Calle 24 T10-39, barrio Porvenir, Tuluá (Valle)",
      // Pin del mapa (4°05'32.5"N 76°12'22.5"W, confirmado por la dueña)
      mapa: "4.092361,-76.206250",
      ciudad: "Tuluá",

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
        { id: "taller", ico: "🧵", t: "En el taller", d: "Vienes, te medimos y ves las telas en persona." },
        { id: "domicilio", ico: "🏠", t: "A domicilio", d: "Vamos a tu casa o consultorio en Tuluá." },
        { id: "casa", ico: "📏", t: "Me mido en casa", d: "Estás en otra ciudad: nos envías tus medidas." },
      ],

      // ---- Diseño y precios (del catálogo 2026) ----
      // precio: null = el precio tienda de cada modelo. Los modelos con precioFijo no cambian de precio.
      tipos: [
        { id: "tienda", t: "Precio tienda", d: "Modelos disponibles y listos para entrega.", precio: null },
        { id: "pedido", t: "Diseño bajo pedido", d: "Elige uno de nuestros modelos y lo confeccionamos con tus medidas.", precio: 175000 },
        { id: "medida", t: "Diseño por medida", d: "Diseño y confección personalizada según tus necesidades.", precio: 185000 },
      ],
      // Colores de ejemplo: confirmar con la dueña
      colores: {
        "Rosa": "#f2a7c6", "Lila": "#b39ad6", "Azul cielo": "#8dc3e8", "Verde menta": "#a8dcc8",
        "Fucsia": "#d6247f", "Azul rey": "#2456b8", "Verde jade": "#1f8a78", "Azul noche": "#1f2f5c",
        "Vinotinto": "#7a1f36", "Rojo": "#d22b3a", "Negro": "#1f1d22", "Café": "#6b4634", "Blanco": "#ffffff",
      },
      // Colores que solo tienen algunos modelos (se nombran en su lista "colores"); no se agregan a todos
      coloresExtra: { "Morado": "#5b2a86", "Malva": "#a0609f", "Beige": "#d6c7b6", "Petróleo": "#1f5f6e", "Verde oliva": "#5d6b3a", "Lavanda": "#8478e0", "Coral": "#f2a19a", "Amarillo": "#f3e29a", "Gris": "#9a9ea6", "Palo de rosa": "#d39a9c",
        // estampados de los gorros
        "Dibujos animados": "linear-gradient(135deg, #f2c230 50%, #1f1d22 50%)", "Ratoncita rosa": "linear-gradient(135deg, #e7408a 50%, #1f1d22 50%)", "Flamencos": "linear-gradient(135deg, #1f1d22 50%, #f08bb3 50%)",
        "Estrellas": "linear-gradient(135deg, #1f1d22 50%, #e66fae 50%)", "Tropical": "linear-gradient(135deg, #1e6b5c 50%, #f4c9d8 50%)", "Ratoncito negro": "linear-gradient(135deg, #1f1d22 50%, #f2a7c6 50%)",
        // estampados de las medias
        "Perrito rosa": "linear-gradient(135deg, #f07aa8 50%, #ffffff 50%)", "Garabatos": "linear-gradient(135deg, #ffffff 50%, #1f1d22 50%)", "Muñequita roja": "linear-gradient(135deg, #1f1d22 50%, #d22b3a 50%)",
        "Gatita rosa": "linear-gradient(135deg, #f4a3c4 50%, #ffffff 50%)", "Heroínas": "linear-gradient(135deg, #ffffff 50%, #e05a8f 50%)", "Monstruo azul": "linear-gradient(135deg, #1f4fb5 50%, #f2c230 50%)", "Amarillitos": "linear-gradient(135deg, #f2d330 50%, #3a6fb5 50%)",
        "Negro y rosa": "linear-gradient(90deg, #1f1d22 50%, #f4b6d2 50%)", "Rojo y gris": "linear-gradient(90deg, #d22b3a 50%, #c9ccd2 50%)" },
      hilos: { "Blanco": "#ffffff", "Dorado": "#d4a64a", "Plateado": "#c9ccd2", "Negro": "#1f1d22", "Rosa": "#f2a7c6" },
      bordado: { nombre: 12000, profesion: 6000 },
      descuentos: [[1, 0], [3, 0.05], [6, 0.10], [12, 0.15]],
      envio: "Para otras ciudades, el envío se cotiza según el destino.",
      categorias: ["Todos", "Conjuntos", "Línea blancos", "Batas y pantalones", "Gorros quirúrgicos", "Medias de compresión"],
      // Franja de confianza bajo la portada (ico = nombre en ICONO de app.js). Solo hechos del negocio, iguales a las preguntas frecuentes
      confianza: [
        { ico: "truck", t: "Envíos a toda Colombia", d: "El envío se cotiza según el destino" },
        { ico: "scissors", t: "Taller propio en Tuluá", d: "Cortamos y cosemos en el mismo lugar" },
        { ico: "ruler", t: "A tu medida", d: "En el taller, a domicilio o desde tu casa" },
        { ico: "card", t: "Pago 50% para empezar", d: "Con el 50% empezamos a confeccionar tu uniforme" },
      ],
      // "Descubre el look completo": puntos sobre la foto (x, y en %). d puede ser una función para armar precios desde NEGOCIO
      look: {
        modelo: "kaill", color: "Azul rey", foto: "img/kaill-azul-rey.webp", alt: "Uniforme Kaill en azul rey, puesto",
        puntos: [
          { x: 52, y: 30, t: "Blusa Kaill", d: "Antifluido elástico, detalle en el escote y cuello postizo. Bolsillos funcionales." },
          { x: 45, y: 88, t: "Pantalón Kaill", d: "Viene con la blusa, en el mismo color. Si lo quieres solo, pídelo por WhatsApp." },
          { x: 62, y: 42, t: "Bordado opcional", d: n => `Tu nombre por ${pesos(n.bordado.nombre)} y tu profesión por ${pesos(n.bordado.profesion)}, en el color de hilo que prefieras.` },
        ],
      },
      // Ids de los modelos que se destacan en el inicio (8, en este orden)
      recomendados: ["kaill", "alondra", "paris", "violet", "clasico", "durango", "luna", "lisboa"],
      // Sin "colores" = todos los colores de la lista de arriba
      modelos: [
        { id: "kaill", nombre: "Kaill", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido elástico con detalle en el escote, cuello postizo y bolsillos funcionales. Cómodo y moderno.", foto: "img/kaill.webp",
          // Foto por color. Reales: azul rey, lila, verde jade (catálogo 2026). simulados = recoloreadas desde una foto real.
          fotos: { "Azul rey": "img/kaill-azul-rey.webp", "Lila": "img/kaill-lila.webp", "Verde jade": "img/kaill-verde-jade.webp", "Blanco": "img/kaill.webp",
            "Rosa": "img/color/kaill-rosa.webp", "Azul cielo": "img/color/kaill-azul-cielo.webp", "Verde menta": "img/color/kaill-verde-menta.webp",
            "Fucsia": "img/color/kaill-fucsia.webp", "Azul noche": "img/color/kaill-azul-noche.webp", "Vinotinto": "img/color/kaill-vinotinto.webp",
            "Rojo": "img/color/kaill-rojo.webp", "Negro": "img/color/kaill-negro.webp", "Café": "img/color/kaill-cafe.webp" },
          simulados: ["Rosa", "Azul cielo", "Verde menta", "Fucsia", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"] },
        { id: "alondra", nombre: "Alondra", precio: 165000, cat: ["Conjuntos"], desc: "Antifluido stretch de alto desempeño: elongación para moverte libre y tecnología de repelencia. Detalle en el escote posterior.", foto: "img/alondra.webp",
          colores: ["Rosa", "Lila", "Morado", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Blanco"],
          // Foto por color. Reales: azul rey, morado (pág. 7), negro (pág. 14), blanco (pág. 26). simulados = recoloreadas desde la azul.
          fotos: { "Azul rey": "img/alondra.webp", "Morado": "img/alondra-morado.webp", "Negro": "img/alondra-negro.webp", "Blanco": "img/alondra-blanco.webp",
            "Rosa": "img/color/alondra-rosa.webp", "Lila": "img/color/alondra-lila.webp", "Azul cielo": "img/color/alondra-azul-cielo.webp",
            "Verde menta": "img/color/alondra-verde-menta.webp", "Fucsia": "img/color/alondra-fucsia.webp", "Verde jade": "img/color/alondra-verde-jade.webp",
            "Azul noche": "img/color/alondra-azul-noche.webp", "Vinotinto": "img/color/alondra-vinotinto.webp", "Rojo": "img/color/alondra-rojo.webp", "Café": "img/color/alondra-cafe.webp" },
          simulados: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Café"] },
        { id: "clasico", nombre: "Clásico", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido stretch y algodón, cuello en V. Pantalón y blusa con cuello y mangas en rib personalizado.", foto: "img/clasico.webp",
          colores: ["Rosa", "Lila", "Malva", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Beige", "Blanco"],
          // Foto por color. Reales: café (pág. 5), rosa, azul cielo y beige (pág. 8), negro (pág. 21), blanco (pág. 11), malva (pág. 40). simulados = recoloreadas desde la azul cielo.
          fotos: { "Café": "img/clasico.webp", "Rosa": "img/clasico-rosa.webp", "Azul cielo": "img/clasico-azul-cielo.webp", "Beige": "img/clasico-beige.webp",
            "Negro": "img/clasico-negro.webp", "Blanco": "img/clasico-blanco-v.webp", "Malva": "img/clasico-morado.webp",
            "Lila": "img/color/clasico-lila.webp", "Verde menta": "img/color/clasico-verde-menta.webp", "Fucsia": "img/color/clasico-fucsia.webp",
            "Azul rey": "img/color/clasico-azul-rey.webp", "Verde jade": "img/color/clasico-verde-jade.webp", "Azul noche": "img/color/clasico-azul-noche.webp",
            "Vinotinto": "img/color/clasico-vinotinto.webp", "Rojo": "img/color/clasico-rojo.webp" },
          simulados: ["Lila", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo"] },
        { id: "durango", nombre: "Durango", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado, escote en V y pantalón bota recta. Cuello y mangas en rib personalizado.", foto: "img/durango.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Petróleo", "Verde oliva", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Beige", "Blanco"],
          // Foto por color. Reales: petróleo, verde menta, verde oliva (pág. 10), rojo, blanco, lila (pág. 13), negro (pág. 42). simulados = recoloreadas desde la petróleo.
          fotos: { "Petróleo": "img/durango.webp", "Verde menta": "img/durango-verde-menta.webp", "Verde oliva": "img/durango-verde-oliva.webp",
            "Rojo": "img/durango-rojo.webp", "Blanco": "img/durango-blanco-v.webp", "Lila": "img/durango-lila.webp", "Negro": "img/durango-negro.webp",
            "Rosa": "img/color/durango-rosa.webp", "Azul cielo": "img/color/durango-azul-cielo.webp", "Fucsia": "img/color/durango-fucsia.webp",
            "Azul rey": "img/color/durango-azul-rey.webp", "Verde jade": "img/color/durango-verde-jade.webp", "Azul noche": "img/color/durango-azul-noche.webp",
            "Vinotinto": "img/color/durango-vinotinto.webp", "Café": "img/color/durango-cafe.webp", "Beige": "img/color/durango-beige.webp" },
          simulados: ["Rosa", "Azul cielo", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Café", "Beige"] },
        { id: "neru", nombre: "Neru", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido elástico con cuello en V y mangas clásicas. Detalles que encantan.", foto: "img/neru.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"],
          // Foto por color. Reales: verde jade y fucsia (pág. 31). simulados = recoloreadas desde la verde jade.
          fotos: { "Rosa": "img/color/neru-rosa.webp", "Lila": "img/color/neru-lila.webp", "Azul cielo": "img/color/neru-azul-cielo.webp",
            "Verde menta": "img/color/neru-verde-menta.webp", "Fucsia": "img/neru-fucsia.webp", "Azul rey": "img/color/neru-azul-rey.webp",
            "Verde jade": "img/neru.webp", "Azul noche": "img/color/neru-azul-noche.webp", "Vinotinto": "img/color/neru-vinotinto.webp",
            "Rojo": "img/color/neru-rojo.webp", "Negro": "img/color/neru-negro.webp", "Café": "img/color/neru-cafe.webp" },
          simulados: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Azul rey", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"] },
        { id: "glam", nombre: "Glam", precio: 159000, cat: ["Conjuntos"], desc: "Conjunto de pantalón y blusa en antifluido licrado, en bloques de color.", foto: "img/glam.webp",
          // Diseño en bloques de color: solo las combinaciones reales del catálogo (pág. 22), no se recolorea
          colores: ["Negro y rosa", "Rojo y gris"],
          fotos: { "Negro y rosa": "img/glam.webp", "Rojo y gris": "img/glam-rojo.webp" } },
        { id: "mariee", nombre: "Mariee", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado y dacrón nacional, escote en pico redondeado, pantalón bota recta y 3 bolsillos.", foto: "img/mariee.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Lavanda", "Coral", "Petróleo", "Beige"],
          // Foto por color. Reales: negro y azul cielo (pág. 12), rosa, vinotinto y café (pág. 15), lavanda y coral (pág. 23), petróleo (pág. 6), beige (pág. 35). simulados = recoloreadas desde la petróleo.
          fotos: { "Rosa": "img/mariee-rosa.webp", "Lila": "img/color/mariee-lila.webp", "Azul cielo": "img/mariee-azul-cielo.webp",
            "Verde menta": "img/color/mariee-verde-menta.webp", "Fucsia": "img/color/mariee-fucsia.webp", "Azul rey": "img/color/mariee-azul-rey.webp",
            "Verde jade": "img/color/mariee-verde-jade.webp", "Azul noche": "img/color/mariee-azul-noche.webp", "Vinotinto": "img/mariee-vinotinto.webp",
            "Rojo": "img/color/mariee-rojo.webp", "Negro": "img/mariee.webp", "Café": "img/mariee-cafe.webp",
            "Lavanda": "img/mariee-lavanda.webp", "Coral": "img/mariee-coral.webp", "Petróleo": "img/mariee-petroleo.webp",
            "Beige": "img/mariee-beige.webp" },
          simulados: ["Lila", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Rojo"] },
        { id: "luna", nombre: "Luna", precio: 159000, cat: ["Conjuntos"], desc: "Antifluido licrado. Blusa con escote redondo y ojal en el pecho, pantalón bota ancha.", foto: "img/luna.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Petróleo"],
          // Foto por color. Reales: café (pág. 25) y petróleo (pág. 36). simulados = recoloreadas desde la petróleo.
          fotos: { "Rosa": "img/color/luna-rosa.webp", "Lila": "img/color/luna-lila.webp", "Azul cielo": "img/color/luna-azul-cielo.webp",
            "Verde menta": "img/color/luna-verde-menta.webp", "Fucsia": "img/color/luna-fucsia.webp", "Azul rey": "img/color/luna-azul-rey.webp",
            "Verde jade": "img/color/luna-verde-jade.webp", "Azul noche": "img/color/luna-azul-noche.webp", "Vinotinto": "img/color/luna-vinotinto.webp",
            "Rojo": "img/color/luna-rojo.webp", "Negro": "img/color/luna-negro.webp", "Café": "img/luna.webp",
            "Petróleo": "img/luna-petroleo.webp" },
          simulados: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro"] },
        { id: "violet", nombre: "Violet", precio: 165000, cat: ["Conjuntos"], desc: "Diseño juvenil con bolsillos camuflados, manga corta y cuello redondo.", foto: "img/violet.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"],
          // Foto por color. Real: rosa (pág. 29, fondo limpiado). simulados = recoloreadas desde la rosa.
          fotos: { "Rosa": "img/violet.webp", "Lila": "img/color/violet-lila.webp", "Azul cielo": "img/color/violet-azul-cielo.webp",
            "Verde menta": "img/color/violet-verde-menta.webp", "Fucsia": "img/color/violet-fucsia.webp", "Azul rey": "img/color/violet-azul-rey.webp",
            "Verde jade": "img/color/violet-verde-jade.webp", "Azul noche": "img/color/violet-azul-noche.webp", "Vinotinto": "img/color/violet-vinotinto.webp",
            "Rojo": "img/color/violet-rojo.webp", "Negro": "img/color/violet-negro.webp", "Café": "img/color/violet-cafe.webp" },
          simulados: ["Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"] },
        { id: "paris", nombre: "París", precio: 165000, cat: ["Conjuntos", "Línea blancos"], desc: "Antifluido elástico con corte en el cuello y mangas zurcidas. Cómodo y elegante.", foto: "img/paris.webp",
          colores: ["Rosa", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café", "Lavanda", "Amarillo"],
          // Foto por color. Reales: lavanda (pág. 27), rosa (pág. 34), negro (pág. 38) y amarillo (pág. 30). simulados = recoloreadas desde la lavanda.
          fotos: { "Rosa": "img/paris-rosa.webp", "Azul cielo": "img/color/paris-azul-cielo.webp", "Verde menta": "img/color/paris-verde-menta.webp",
            "Fucsia": "img/color/paris-fucsia.webp", "Azul rey": "img/color/paris-azul-rey.webp", "Verde jade": "img/color/paris-verde-jade.webp",
            "Azul noche": "img/color/paris-azul-noche.webp", "Vinotinto": "img/color/paris-vinotinto.webp", "Rojo": "img/color/paris-rojo.webp",
            "Negro": "img/paris-negro.webp", "Café": "img/color/paris-cafe.webp", "Lavanda": "img/paris.webp",
            "Amarillo": "img/paris-amarillo.webp" },
          simulados: ["Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Café"] },
        { id: "lisboa", nombre: "Lisboa", precio: 165000, cat: ["Conjuntos"], desc: "Diseño exclusivo, ideal para quienes quieren lucir profesionales.", foto: "img/lisboa.webp",
          colores: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Rojo", "Negro", "Café"],
          // Foto por color. Real: rojo (pág. 37, sin la modelo transparente de atrás). simulados = recoloreadas desde la roja.
          fotos: { "Rosa": "img/color/lisboa-rosa.webp", "Lila": "img/color/lisboa-lila.webp", "Azul cielo": "img/color/lisboa-azul-cielo.webp",
            "Verde menta": "img/color/lisboa-verde-menta.webp", "Fucsia": "img/color/lisboa-fucsia.webp", "Azul rey": "img/color/lisboa-azul-rey.webp",
            "Verde jade": "img/color/lisboa-verde-jade.webp", "Azul noche": "img/color/lisboa-azul-noche.webp", "Vinotinto": "img/color/lisboa-vinotinto.webp",
            "Rojo": "img/lisboa.webp", "Negro": "img/color/lisboa-negro.webp", "Café": "img/color/lisboa-cafe.webp" },
          simulados: ["Rosa", "Lila", "Azul cielo", "Verde menta", "Fucsia", "Azul rey", "Verde jade", "Azul noche", "Vinotinto", "Negro", "Café"] },
        { id: "jomper", nombre: "Jomper", precio: 165000, cat: ["Conjuntos"], desc: "Modelo enterizo tipo jumper.", foto: "img/jomper.jpg" },
        { id: "alondra-blanco", nombre: "Alondra blanco", precio: 159000, cat: ["Línea blancos"], desc: "El Alondra en antifluido licrado blanco.", colores: ["Blanco"], foto: "img/alondra-blanco.webp" }, // pág. 26
        { id: "clasico-blanco", nombre: "Clásico blanco", precio: 159000, cat: ["Línea blancos"], desc: "Corte recto, cuello en V y bolsillos funcionales. Ideal para jornadas laborales.", colores: ["Blanco"], foto: "img/clasico-blanco.webp" }, // pág. 17, logo del catálogo tapado
        { id: "durango-blanco", nombre: "Durango blanco", precio: 159000, cat: ["Línea blancos"], desc: "El Durango en antifluido licrado blanco.", colores: ["Blanco"], foto: "img/durango-blanco-v.webp" }, // pág. 13 (en la 24 hay texto y otra modelo detrás)
        { id: "bata", nombre: "Bata manga larga", precio: 140000, precioFijo: true, cat: ["Batas y pantalones", "Línea blancos"], desc: "Bata de manga larga.", foto: "img/bata.webp",
          // Fotos reales (pág. 39): negro y palo de rosa
          colores: ["Negro", "Palo de rosa"], fotos: { "Negro": "img/bata.webp", "Palo de rosa": "img/bata-palo-rosa.webp" } },
        { id: "pantalon", nombre: "Pantalón", precio: 90000, precioFijo: true, cat: ["Batas y pantalones"], desc: "Pretina adelante, resorte atrás y bolsillos funcionales. Bota recta o jogger, a tu elección.", foto: "img/pantalon.webp",
          // Fotos reales (pág. 41): gris, lila, blanco, lavanda y palo de rosa
          colores: ["Gris", "Lila", "Lavanda", "Palo de rosa", "Blanco"],
          fotos: { "Gris": "img/pantalon.webp", "Lila": "img/pantalon-lila.webp", "Lavanda": "img/pantalon-lavanda.webp", "Palo de rosa": "img/pantalon-palo-rosa.webp", "Blanco": "img/pantalon-blanco.webp" } },
        // Gorros (fotos de la dueña, 6 estampados). precio: promoción de Instagram "3 gorros por $60.000" (confirmar con la dueña)
        { id: "gorro", nombre: "Gorro quirúrgico", precio: 20000, precioFijo: true, accesorio: true, articulo: "un", cat: ["Gorros quirúrgicos"],
          caracteristicas: ["Tela antifluido", "Moña para recoger el cabello y toalla para el sudor", "Varios estampados: pregunta por los disponibles", "Envíos a toda Colombia"], desc: "Gorro quirúrgico antifluido y estampado, con moña para recoger el cabello y toalla para el sudor. Cómodo durante toda la jornada.", foto: "img/gorro-animados.webp",
          colores: ["Dibujos animados", "Ratoncita rosa", "Flamencos", "Estrellas", "Tropical", "Ratoncito negro"],
          fotos: { "Dibujos animados": "img/gorro-animados.webp", "Ratoncita rosa": "img/gorro-ratoncita-rosa.webp", "Flamencos": "img/gorro-flamencos.webp",
            "Estrellas": "img/gorro-estrellas.webp", "Tropical": "img/gorro-tropical.webp", "Ratoncito negro": "img/gorro-ratoncito-negro.webp" } },
        // Medias de compresión (fotos de la dueña, 7 estampados). precio: null = "Precio a consultar" (falta el precio de la dueña)
        { id: "medias", nombre: "Medias de compresión", precio: null, precioFijo: true, accesorio: true, articulo: "unas", cat: ["Medias de compresión"], desc: "Medias de compresión estampadas para largas jornadas de pie: tus piernas se sienten más descansadas y con mejor circulación al final del turno.", foto: "img/medias-perrito-rosa.webp",
          caracteristicas: ["Compresión para largas jornadas de pie", "Estampados divertidos para tu turno", "Varios diseños: pregunta por los disponibles", "Envíos a toda Colombia"],
          colores: ["Perrito rosa", "Garabatos", "Muñequita roja", "Gatita rosa", "Heroínas", "Monstruo azul", "Amarillitos"],
          fotos: { "Perrito rosa": "img/medias-perrito-rosa.webp", "Garabatos": "img/medias-garabatos.webp", "Muñequita roja": "img/medias-munequita-roja.webp", "Gatita rosa": "img/medias-gatita-rosa.webp",
            "Heroínas": "img/medias-heroinas.webp", "Monstruo azul": "img/medias-monstruo-azul.webp", "Amarillitos": "img/medias-amarillitos.webp" } },
      ],
      // Tiempos de entrega por modalidad (confirmar con la dueña). No se trabaja por tallas: siempre se toman las medidas
      tiempos: { tienda: "entrega inmediata", pedido: "3 a 5 días hábiles", medida: "5 a 8 días hábiles" },
      // ---- Preguntas frecuentes (sección #faq y chatbot) ----
      // claves: palabras que activan la respuesta en el chat (sin tildes, en minúscula). Si "a" es función, recibe NEGOCIO.
      faq: [
        { id: "pago", q: "¿Cómo se paga?", a: "Con el 50% de abono empezamos a confeccionar tu uniforme y el otro 50% lo pagas al recibirlo.", claves: ["pago", "pagar", "abono", "abonar", "anticipo", "nequi", "transferencia", "efectivo", "tarjeta", "consignar"] },
        { id: "tiempos", q: "¿En cuánto tiempo me lo entregan?", a: n => `Precio tienda: ${n.tiempos.tienda}. Bajo pedido: ${n.tiempos.pedido}. Por medida: ${n.tiempos.medida}.`, claves: ["tiempo", "demora", "demoran", "tarda", "tardan", "dias", "entrega", "entregan", "listo", "rapido"] },
        { id: "precios", q: "¿Cuánto cuestan los uniformes?", a: n => `En tienda desde ${pesos(Math.min(...n.modelos.filter(m => !m.precioFijo).map(m => m.precio)))}. Bajo pedido ${pesos(n.tipos[1].precio)} y por medida ${pesos(n.tipos[2].precio)}. Hay descuento desde ${n.descuentos.find(([, p]) => p)[0]} uniformes.`, claves: ["precio", "precios", "cuesta", "cuestan", "cuanto", "valor", "vale", "costo", "descuento", "promocion"] },
        { id: "tallas", q: "¿Tengo que saber mi talla?", a: "No. No trabajamos por tallas: te tomamos las medidas en el taller, a domicilio o te guiamos para que te midas en casa, y el uniforme queda a tu cuerpo.", claves: ["talla", "tallas", "size", "xl", "grande", "pequena", "mediana"] },
        { id: "medidas", q: "¿Cómo tomo mis medidas?", a: "Usa un metro de costura, sin apretar: busto, cintura, cadera, largo de manga, largo de pantalón, hombros y estatura. Te explicamos cada una en la guía de medidas.", claves: ["medida", "medidas", "medir", "medirme", "metro", "cinta"] },
        { id: "envios", q: "¿Hacen envíos?", a: n => `Sí, enviamos a toda Colombia. ${n.envio}`, claves: ["envio", "envios", "enviar", "envian", "despacho", "ciudad", "colombia", "flete", "mandan"] },
        { id: "domicilio", q: "¿Toman medidas a domicilio?", a: n => `Sí, en ${n.ciudad} vamos a tu casa o consultorio con un recargo de ${pesos(n.recargoDomicilio)}. También puedes venir al taller o medirte en casa.`, claves: ["domicilio", "visita", "vienen", "recargo", "consultorio", "casa"] },
        { id: "bordado", q: "¿Bordan el nombre y la profesión?", a: n => `Sí. El nombre bordado cuesta ${pesos(n.bordado.nombre)} y la profesión ${pesos(n.bordado.profesion)}, en hilo ${Object.keys(n.hilos).join(", ").toLowerCase()}.`, claves: ["bordado", "bordar", "borda", "nombre", "profesion", "logo", "hilo"] },
        { id: "arreglos", q: "¿Hacen arreglos o devoluciones?", a: "Los arreglos (pinzas, ruedos, etc.) tienen un costo adicional. Si quieres modificar algún elemento, el uniforme se confecciona desde cero y el precio varía. No se hace devolución de dinero.", claves: ["arreglo", "arreglos", "ruedo", "pinza", "devolucion", "devolver", "cambio", "cambiar", "garantia"] },
        { id: "cuidado", q: "¿Cómo cuido mi uniforme?", a: "Lávalo con cuidado, no lo mezcles con otra ropa y evita el exceso de cloro. Así conserva el color y la tela por más tiempo.", claves: ["lavar", "lavado", "cuidar", "cuidado", "cloro", "planchar", "secar"] },
        { id: "empresas", q: "¿Hacen uniformes para empresas?", a: "Sí, somos fabricantes directos: clínicas, consultorios, spas, restaurantes y comercios. Vamos a tomar medidas a todo el equipo, bordamos el logo y damos precio por cantidad.", claves: ["empresa", "empresas", "clinica", "equipo", "dotacion", "personal", "restaurante", "spa", "mayor"] },
        { id: "empleo", q: "¿Quieres trabajar con nosotros?", a: n => `¡Nos encantaría conocerte! Envíanos tu hoja de vida (CV) al correo <a class="faq-mail" href="mailto:${n.correo}?subject=${encodeURIComponent("Hoja de vida - Quiero trabajar en Multicostura")}&body=${encodeURIComponent("Hola Multicostura,\n\nMe interesa trabajar con ustedes. Adjunto mi hoja de vida.\n\nNombre:\nCelular:\nCargo o área que me interesa:\nExperiencia:\n\nGracias.")}">${n.correo}</a>, con el cargo o área que te interesa. Recuerda adjuntar el archivo antes de enviar.`, claves: ["trabajo", "trabajar", "empleo", "vacante", "vacantes", "hoja", "cv", "curriculum", "costurera", "contratar", "contratan", "oportunidad"] },
        { id: "bono", q: "¿Tienen bonos de regalo?", a: n => `Sí, bonos de ${n.bonos.map(pesos).join(", ")}. Quien lo recibe elige su modelo y agenda sus medidas.`, claves: ["bono", "bonos", "regalo", "regalar", "obsequio", "cumpleanos", "grado"] },
        { id: "ubicacion", q: "¿Dónde están y qué horario tienen?", a: n => `Estamos en ${n.direccionTaller}. Atendemos ${n.horarioTexto.charAt(0).toLowerCase() + n.horarioTexto.slice(1)}`, claves: ["donde", "ubicacion", "direccion", "taller", "tienda", "mapa", "horario", "abren", "abierto", "atienden"] },
      ],
      proceso: [
        ["Diseña", "Elige modelo, color y bordado aquí o en el catálogo."],
        ["Agenda tus medidas", "En el taller, a domicilio o midiéndote en casa."],
        ["Abona y confeccionamos", "Con el 50% empezamos. Tu uniforme está en 5 a 8 días hábiles."],
        ["Prueba y entrega", "Te lo entregamos o enviamos. Si hay que ajustar algo, lo ajustamos."],
      ],
      medidas: [
        ["Busto o pecho", "Por la parte más llena, con el metro derecho por la espalda."],
        ["Cintura", "En la parte más angosta del abdomen."],
        ["Cadera", "En la parte más ancha de los glúteos."],
        ["Largo de manga", "Del hombro hasta donde quieres que termine."],
        ["Largo de pantalón", "De la cintura al tobillo, por el costado."],
        ["Ancho de hombros", "De la punta de un hombro a la otra, por la espalda."],
        ["Estatura", "Descalza, contra la pared."],
      ],
      // Tabla de medidas de referencia en cm (la misma de img/tabla-medidas.jpg): la calculadora de la ficha sugiere la talla más pequeña que cubre todas las medidas
      tallas: {
        orden: ["S", "M", "L", "XL"],
        blusa: {
          S: { busto: 96, cintura: 78, cadera: 104, largo: 68 }, M: { busto: 100, cintura: 84, cadera: 108, largo: 69 },
          L: { busto: 108, cintura: 90, cadera: 114, largo: 70 }, XL: { busto: 112, cintura: 96, cadera: 120, largo: 72 },
        },
        pantalon: {
          S: { cintura: 78, cadera: 104, largo: 102, entrepierna: 80, bota: 22 }, M: { cintura: 84, cadera: 108, largo: 104, entrepierna: 81.5, bota: 23 },
          L: { cintura: 90, cadera: 114, largo: 106, entrepierna: 83, bota: 24 }, XL: { cintura: 96, cadera: 120, largo: 106, entrepierna: 84.5, bota: 25 },
        },
      },
      bonos: [100000, 150000, 200000, 300000],
      clientas: [
        { foto: "img/clienta-1.jpg", texto: "Odontóloga" },
        { video: "video/clienta-enfermera", texto: "Enfermera jefe" }, // reel de Instagram DIwBEZzsQN9
        { video: "video/clienta-esteticista", texto: "Esteticista" }, // reel de Instagram Dd91kh3R-zz
        { foto: "img/clienta-4.jpg", texto: "Médica general" },
        // video = ruta sin extensión: video/<nombre>.webm y .mp4, con portada video/<nombre>-poster.webp
        { video: "video/clienta-psicologia", texto: "Psicología" }, // reel de Instagram DejlX_9xpLO (colaboración con la clienta)
      ],
      // Diseña tu uniforme: color de la foto base de cada modelo (img/disena/<id>.webp, a resolución original).
      // Los demás colores son esa misma foto recoloreada (img/disena/<id>-<color>.webp).
      disena: { kaill: "Azul rey", alondra: "Azul rey", clasico: "Azul cielo", durango: "Petróleo", neru: "Fucsia", mariee: "Petróleo", luna: "Petróleo", violet: "Rosa", paris: "Lavanda", lisboa: "Rojo" },
      // Pasarela de la portada: una foto a la vez en el recuadro grande. Fotos en alta resolución (img/pasarela/),
      // a la resolución original del catálogo; cambiar aquí para elegir otras
      pasarela: [
        { foto: "img/pasarela/clasico-rosa.webp", nombre: "Clásico rosa" },
        { foto: "img/pasarela/mariee.webp", nombre: "Mariee negro" },
        { foto: "img/pasarela/paris.webp", nombre: "París lavanda" },
        { foto: "img/pasarela/alondra.webp", nombre: "Alondra azul" },
        { foto: "img/pasarela/kaill-lila.webp", nombre: "Kaill lila" },
        { foto: "img/pasarela/neru-fucsia.webp", nombre: "Neru fucsia" },
        { foto: "img/pasarela/violet.webp", nombre: "Violet rosa" },
        { foto: "img/pasarela/mariee-coral.webp", nombre: "Mariee coral" },
        { foto: "img/pasarela/durango-negro.webp", nombre: "Durango negro" },
        { foto: "img/pasarela/luna-petroleo.webp", nombre: "Luna petróleo" },
      ],
    };
    // ==========================================================
