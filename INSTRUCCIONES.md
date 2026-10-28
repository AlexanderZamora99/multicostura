# Multicostura — página web con agenda de toma de medidas

Página 100% estática (`index.html` + estilos en `css/` + código y datos en `js/`) + agenda gratis en Google Sheets.
Se publica gratis en GitHub Pages. No necesita servidor.

## Archivos

| Archivo | Para qué |
|---|---|
| `index.html` | La estructura de la página (los textos fijos y las secciones). |
| `js/datos.js` | **Los datos del negocio** (`const NEGOCIO = {...}`): precios, modelos, horarios, WhatsApp, etc. Es el archivo que se edita. |
| `js/app.js` | El funcionamiento de la página. No se toca. |
| `css/estilos.css` | Los colores y el diseño de la página. |
| `apps-script.gs` | Código de la agenda. Se pega en Google Apps Script (no se sube a GitHub). |
| `img/` | Fotos. Los nombres deben coincidir con los de `NEGOCIO` (`portada-1.jpg`, `kaill.jpg`, `clienta-1.jpg`, …). |

## Ver la página en Visual Studio Code

1. Instala la extensión **Live Server** (de Ritwick Dey).
2. Clic derecho en `index.html` → **Open with Live Server**.
3. Cada vez que guardas, el navegador se recarga solo.

## Qué cambiar con los datos de la dueña

Dentro de `NEGOCIO` en `js/datos.js`:

- `whatsapp`: número con 57 adelante, sin espacios ni `+`.
- `direccionTaller`, `ciudad`.
- `tipos`: modalidades y precios (precio tienda, bajo pedido, por medida).
- `categorias`: filtros del catálogo.
- `horario`: días y rangos. Ej.: `1: [["08:00","12:00"],["14:00","18:00"]]` = lunes de 8 a 12 y de 2 a 6.
- `minutosPorPersona`, `minutosBase`: cuánto dura tomar medidas.
- `margen.domicilio`: minutos de traslado después de una cita a domicilio.
- `recargoDomicilio`.
- `modelos`: nombre, precio tienda, categorías (`cat`), colores (vacío = todos) y foto. `precioFijo: true` = no cambia con la modalidad (batas, pantalones).
- `bordado`, `descuentos`, `bonos`, `proceso`, `medidas`.

## Cómo funciona la agenda

1. La clienta diseña su uniforme (modelo, color, bordado, cantidad).
2. Elige cómo tomar medidas:
   - **En el taller** o **A domicilio** → elige día y hora libres → la cita se guarda en la hoja **Citas** con estado `pendiente` y su diseño.
   - **Me mido en casa** (otra ciudad) → no hay cita: llena sus medidas y se envían por WhatsApp.
3. La duración depende de cuántos uniformes son (`minutosBase + minutosPorPersona × cantidad`).
4. Al final le sale un botón para confirmar por WhatsApp.
5. La dueña maneja todo desde la app **Google Sheets** en el celular, cambiando el **Estado**:
   `pendiente → confirmada → medidas tomadas → en confección → entregada` (o `cancelada`, que libera el horario).
6. Para no recibir citas un día u horas, agrega una fila en **Bloqueos**:

   | Fecha | Desde | Hasta | Motivo |
   |---|---|---|---|
   | 2026-12-24 | 00:00 | 23:59 | Navidad |

Sin `apiUrl`, la página funciona en **modo demostración** (citas guardadas solo en el navegador).

## Activar la agenda real (con la cuenta de Google de la dueña)

La hoja tiene datos de sus clientas: debe quedar en **su** cuenta.

1. Entra a https://sheets.new → nombre: `Agenda Multicostura`.
2. **Extensiones → Apps Script** → borra todo y pega `apps-script.gs`. (Opcional: su correo en `EMAIL_AVISO`). Guarda.
3. Elige la función **setup** → **Ejecutar** → acepta permisos.
   Si sale "Google no ha verificado esta app": **Configuración avanzada → Ir a (proyecto) → Permitir**.
4. **Implementar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Copia la URL que termina en `/exec`.
5. Pégala en `apiUrl` dentro de `NEGOCIO`.
6. Prueba: agenda una cita → debe aparecer en **Citas** y ese horario ya no sale. Cámbiala a `cancelada` → vuelve a salir.

Si después cambias `apps-script.gs`: **Implementar → Gestionar implementaciones → lápiz → Nueva versión → Implementar** (la URL no cambia).

## Publicar gratis en GitHub Pages

1. Crea un repositorio público `multicostura` en GitHub.
2. Sube `index.html` y las carpetas `css/`, `js/` e `img/` (en la raíz del repositorio).
   No subas datos de clientas. `apps-script.gs` e `INSTRUCCIONES.md` pueden ir, no tienen datos privados.
3. **Settings → Pages → Deploy from a branch → main / (root) → Save**.
4. Link: `https://TU-USUARIO.github.io/multicostura/`
