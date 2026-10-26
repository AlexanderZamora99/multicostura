/**
 * Agenda de toma de medidas de Multicostura — backend en Google Sheets.
 *
 * Hojas:
 *  - "Citas":    una fila por cita. Cambiar "Estado" a "cancelada" libera el horario.
 *  - "Bloqueos": días u horas sin citas (festivos, entregas, diligencias).
 *
 * La página pública solo recibe fecha, hora y duración de lo ocupado.
 * Nunca recibe nombres, teléfonos ni direcciones de otras clientas.
 */

const TZ = "America/Bogota";
const EMAIL_AVISO = "";   // opcional: correo de la dueña para recibir aviso de cada cita nueva
const ESTADOS = ["pendiente", "confirmada", "medidas tomadas", "en confección", "entregada", "cancelada"];

const COL_CITAS = ["Fecha", "Hora", "Duración (min)", "Margen (min)", "Modalidad", "Clienta", "Celular", "Dirección",
  "Diseño", "Cantidad", "Total estimado", "Notas", "Estado", "Creada"];
const COL_BLOQUEOS = ["Fecha", "Desde", "Hasta", "Motivo"];
const COL_ESTADO = 13; // columna M

/** Ejecutar UNA vez desde el editor: crea las hojas con formato. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);

  const citas = ss.getSheetByName("Citas") || ss.insertSheet("Citas");
  citas.getRange(1, 1, 1, COL_CITAS.length).setValues([COL_CITAS]).setFontWeight("bold").setBackground("#f4b6d2");
  citas.setFrozenRows(1);
  citas.getRange("A:D").setNumberFormat("@");   // fecha, hora y minutos como texto
  citas.getRange("G:G").setNumberFormat("@");
  citas.getRange(2, COL_ESTADO, citas.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).build());

  const rango = citas.getRange("A2:N");
  const regla = (estado, color) => SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=$M2="${estado}"`).setBackground(color).setRanges([rango]).build();
  citas.setConditionalFormatRules([
    regla("confirmada", "#dff5e3"),
    regla("medidas tomadas", "#e3eefc"),
    regla("en confección", "#fff4d6"),
    regla("entregada", "#e8e8e8"),
    regla("cancelada", "#fde2e2"),
  ]);

  const bloqueos = ss.getSheetByName("Bloqueos") || ss.insertSheet("Bloqueos");
  bloqueos.getRange(1, 1, 1, COL_BLOQUEOS.length).setValues([COL_BLOQUEOS]).setFontWeight("bold").setBackground("#fcedf4");
  bloqueos.setFrozenRows(1);
  bloqueos.getRange("A:C").setNumberFormat("@");
  bloqueos.getRange("A2").setNote("Formato: 2026-12-24  ·  Desde/Hasta: 08:00 y 18:00 (día completo: 00:00 a 23:59)");

  const hoja1 = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (hoja1 && ss.getSheets().length > 2) ss.deleteSheet(hoja1);
}

/** GET ?action=busy&from=YYYY-MM-DD&to=YYYY-MM-DD → horarios ocupados */
function doGet(e) {
  const p = e.parameter || {};
  if (p.action !== "busy" || !esFecha(p.from) || !esFecha(p.to)) return json({ ok: false, error: "parametros" });
  return json({ ok: true, busy: ocupados(p.from, p.to) });
}

/** POST (JSON como texto) → guarda la cita si el horario sigue libre */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // dos clientas al mismo tiempo no pueden tomar el mismo turno
  } catch (err) {
    return json({ ok: false, error: "ocupada-la-agenda" });
  }
  try {
    const c = JSON.parse(e.postData.contents);
    const cita = {
      fecha: String(c.fecha || ""),
      hora: String(c.hora || ""),
      dur: Number(c.dur),
      margen: Number(c.margen) || 0,
      modalidad: c.modalidad === "Domicilio" ? "Domicilio" : "Taller",
      nombre: texto(c.nombre, 60),
      telefono: String(c.telefono || "").replace(/\D/g, "").slice(0, 15),
      direccion: texto(c.direccion, 120),
      diseno: texto(c.diseno, 200),
      cantidad: Math.max(1, Math.min(99, Number(c.cantidad) || 1)),
      total: Number(c.total) || 0,
      notas: texto(c.notas, 300),
    };

    if (!esFecha(cita.fecha) || !/^\d{2}:\d{2}$/.test(cita.hora) || !(cita.dur >= 10 && cita.dur <= 720)
        || !(cita.margen >= 0 && cita.margen <= 120) || !cita.nombre || cita.telefono.length < 10
        || (cita.modalidad === "Domicilio" && !cita.direccion)) {
      return json({ ok: false, error: "datos" });
    }
    const hoy = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
    if (cita.fecha < hoy) return json({ ok: false, error: "fecha" });

    const inicio = aMin(cita.hora), largo = cita.dur + cita.margen;
    const choca = ocupados(cita.fecha, cita.fecha).some(b =>
      inicio < aMin(b.hora) + b.dur && aMin(b.hora) < inicio + largo);
    if (choca) return json({ ok: false, error: "ocupado" });

    SpreadsheetApp.getActive().getSheetByName("Citas").appendRow([
      cita.fecha, cita.hora, String(cita.dur), String(cita.margen), cita.modalidad, cita.nombre,
      cita.telefono, cita.direccion, cita.diseno, cita.cantidad, cita.total, cita.notas, "pendiente",
      Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm"),
    ]);

    if (EMAIL_AVISO) {
      MailApp.sendEmail(EMAIL_AVISO, `💗 Nueva cita de medidas: ${cita.nombre} · ${cita.fecha} ${cita.hora}`,
        `${cita.modalidad}: ${cita.fecha} a las ${cita.hora} (${cita.dur} min)\n` +
        (cita.direccion ? `Dirección: ${cita.direccion}\n` : "") +
        `Cel: ${cita.telefono}\nDiseño: ${cita.diseno}\nNotas: ${cita.notas || "-"}`);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "servidor" });
  } finally {
    lock.releaseLock();
  }
}

/** Citas no canceladas (con su margen) + bloqueos, solo fecha/hora/duración */
function ocupados(desde, hasta) {
  const ss = SpreadsheetApp.getActive();
  const out = [];
  const hora = /^\d{2}:\d{2}$/;

  ss.getSheetByName("Citas").getDataRange().getDisplayValues().slice(1).forEach(r => {
    const fecha = r[0], h = r[1], dur = Number(r[2]) || 30, margen = Number(r[3]) || 0, estado = r[COL_ESTADO - 1];
    if (fecha >= desde && fecha <= hasta && estado !== "cancelada" && hora.test(h)) {
      out.push({ fecha: fecha, hora: h, dur: dur + margen });
    }
  });

  ss.getSheetByName("Bloqueos").getDataRange().getDisplayValues().slice(1).forEach(r => {
    const [fecha, ini, fin] = r;
    if (esFecha(fecha) && fecha >= desde && fecha <= hasta && hora.test(ini) && hora.test(fin)) {
      out.push({ fecha: fecha, hora: ini, dur: Math.max(0, aMin(fin) - aMin(ini)) });
    }
  });
  return out;
}

function esFecha(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || "")); }
function aMin(hhmm) { const p = hhmm.split(":"); return Number(p[0]) * 60 + Number(p[1]); }
// Quita saltos raros y evita que Sheets interprete el texto como fórmula
function texto(v, max) { return String(v || "").replace(/[\r\n\t]+/g, " ").trim().replace(/^[=+\-@]/, "'$&").slice(0, max); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
