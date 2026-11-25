/**
 * Recibe las solicitudes del sitio y las guarda como filas en una hoja de Google.
 * Pegar en: hoja de cálculo → Extensiones → Apps Script. Instrucciones: docs/INTEGRACIONES.md
 *
 * Requiere una propiedad de script llamada TOKEN (Configuración del proyecto → Propiedades del script),
 * con el mismo valor que la variable SHEETS_TOKEN de Vercel.
 */
var NOMBRE_HOJA = "Solicitudes";
var COLUMNAS = ["Fecha", "Origen", "Nombre", "Correo", "Teléfono", "Contacto preferido", "Servicio", "Servicios",
  "Tipo de proyecto", "Ubicación", "Área (m²)", "Nivel", "Mensaje", "Cotización mostrada", "Estado"];

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    var token = PropertiesService.getScriptProperties().getProperty("TOKEN");
    if (!token || datos.token !== token) return salida({ ok: false });

    var f = datos.fila || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = ss.getSheetByName(NOMBRE_HOJA) || ss.insertSheet(NOMBRE_HOJA);
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(COLUMNAS);
      hoja.setFrozenRows(1);
      hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold");
    }
    var fila = [f.fecha, f.origen, f.nombre, f.correo, f.telefono, f.contacto_preferido, f.servicio, f.servicios,
      f.tipo_proyecto, f.ubicacion, f.area_m2, f.nivel, f.mensaje, f.estimacion, "Nuevo"]
      .map(function (v) { return v == null ? "" : String(v); });

    // Formato de texto plano: nada de lo que escriba un visitante se interpreta como fórmula.
    var destino = hoja.getRange(hoja.getLastRow() + 1, 1, 1, COLUMNAS.length);
    destino.setNumberFormat("@");
    destino.setValues([fila]);
    avisar(f);
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false });
  }
}

/**
 * Envía un correo con la solicitud a quien es dueño de la hoja (o a las direcciones de la propiedad AVISO_CORREO,
 * separadas por comas). Con la app de Gmail en el celular, llega como notificación. Si falla, la fila ya quedó guardada.
 */
function avisar(f) {
  try {
    var para = PropertiesService.getScriptProperties().getProperty("AVISO_CORREO") || Session.getEffectiveUser().getEmail();
    var lineas = ["Origen: " + (f.origen || ""), "Nombre: " + (f.nombre || ""), "Correo: " + (f.correo || ""),
      "Teléfono: " + (f.telefono || ""), "Prefiere: " + (f.contacto_preferido || ""), "Servicio(s): " + (f.servicio || f.servicios || ""),
      "Proyecto: " + (f.tipo_proyecto || ""), "Ubicación: " + (f.ubicacion || ""), "Área: " + (f.area_m2 || ""), "Nivel: " + (f.nivel || ""),
      "", "Mensaje:", f.mensaje || "", "", f.estimacion || "", "", "Hoja: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()];
    MailApp.sendEmail({
      to: para,
      subject: "Nueva solicitud: " + (f.nombre || "sin nombre") + " · " + (f.servicio || f.servicios || f.origen || ""),
      body: lineas.join("\n"),
      replyTo: f.correo || para
    });
  } catch (err) { /* el aviso es un extra: nunca debe impedir que se guarde la solicitud */ }
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
