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
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false });
  }
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
