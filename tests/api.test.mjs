// Pruebas de la función de contacto con Resend simulado. Ejecutar: npm test
import test from "node:test";
import assert from "node:assert/strict";
import handler, { _prueba } from "../api/contacto.js";

const valido = { origen: "contacto", nombre: "Ana Pérez", correo: "ana@ejemplo.com", mensaje: "Necesito un diseño estructural.", servicio: "A. Ingeniería", contacto_preferido: "Correo electrónico", acepto: true };
function llamar(body, { method = "POST", headers = {}, ip = "1.1.1.1" } = {}) {
  return new Promise((ok) => {
    const res = { statusCode: 0, h: {}, setHeader(k, v) { this.h[k] = v; }, end(t) { ok({ code: this.statusCode, json: JSON.parse(t) }); } };
    handler({ method, body, headers: { host: "sitio.test", "x-forwarded-for": ip, ...headers }, socket: {} }, res);
  });
}
const entorno = () => { process.env.RESEND_API_KEY = "re_test"; process.env.CONTACT_TO = "yo@ejemplo.com"; };
const VARS = ["RESEND_API_KEY", "CONTACT_TO", "CONTACT_FROM", "SHEETS_WEBHOOK_URL", "SHEETS_TOKEN", "WA_PROVIDER", "CALLMEBOT_PHONE", "CALLMEBOT_APIKEY", "WA_META_TOKEN", "WA_META_PHONE_ID", "WA_META_TO", "WA_META_TEMPLATE"];
const limpiar = () => { VARS.forEach((v) => delete process.env[v]); _prueba.visitas.clear(); };
const entornoHoja = () => { process.env.SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/ABC/exec"; process.env.SHEETS_TOKEN = "tok_secreto"; };
const entornoCallmebot = () => { process.env.WA_PROVIDER = "callmebot"; process.env.CALLMEBOT_PHONE = "+573001112233"; process.env.CALLMEBOT_APIKEY = "k123"; };
/** Respuestas por servicio: { resend, hoja, wa } con true/false. Devuelve la lista de llamadas. */
const simularCanales = ({ resend = true, hoja = true, wa = true }) => {
  llamadas = [];
  globalThis.fetch = async (u, o) => {
    llamadas.push({ u: String(u), o });
    if (String(u).includes("resend.com")) return { ok: resend, status: resend ? 200 : 500, json: async () => ({}) };
    if (String(u).includes("script.google.com")) return { ok: true, status: 200, json: async () => ({ ok: hoja }) };
    return { ok: wa, status: wa ? 200 : 500, json: async () => ({}) };
  };
};
const completo = { ...valido, origen: "cotizar", servicios: ["A: Diseño estructural y cimentaciones", "A: Revisión de diseños estructurales"], tipo_proyecto: "Vivienda multifamiliar o edificio", ubicacion: "Sabaneta", area_m2: "1200", nivel: "Tengo diseños", telefono: "300 111 2233", estimacion: "Cotización preliminar: $60.600.000 – $89.100.000" };
let llamadas;
const simular = (ok = true) => { llamadas = []; globalThis.fetch = async (u, o) => { llamadas.push({ u, o }); return { ok, status: ok ? 200 : 500 }; }; };

test("rechaza métodos distintos de POST", async () => { limpiar(); assert.equal((await llamar(null, { method: "GET" })).code, 405); });
test("rechaza origen ajeno", async () => { limpiar(); assert.equal((await llamar(valido, { headers: { origin: "https://malo.com" } })).code, 403); });
test("valida campos y reporta cuáles", async () => {
  limpiar(); entorno(); simular();
  const r = await llamar({ ...valido, correo: "x", mensaje: "corto", acepto: false });
  assert.equal(r.code, 400); assert.ok(r.json.campos.correo && r.json.campos.mensaje && r.json.campos.acepto); assert.equal(llamadas.length, 0);
});
test("cotización exige servicios", async () => { limpiar(); entorno(); simular(); assert.equal((await llamar({ ...valido, origen: "cotizar" })).code, 400); });
test("honeypot responde éxito sin enviar", async () => { limpiar(); entorno(); simular(); const r = await llamar({ ...valido, sitio_web: "x" }); assert.equal(r.code, 200); assert.equal(llamadas.length, 0); });
test("sin configuración responde 503", async () => { limpiar(); simular(); assert.equal((await llamar(valido)).code, 503); });
test("envía a Resend con clave en el encabezado y reply_to", async () => {
  limpiar(); entorno(); simular();
  const r = await llamar({ ...valido, nombre: "Ana\r\nBcc: x@y.com", mensaje: "<b>hola</b> necesito algo" });
  assert.equal(r.code, 200); assert.equal(llamadas.length, 1);
  const { u, o } = llamadas[0]; const p = JSON.parse(o.body);
  assert.equal(u, "https://api.resend.com/emails"); assert.equal(o.headers.Authorization, "Bearer re_test");
  assert.equal(p.reply_to, "ana@ejemplo.com"); assert.deepEqual(p.to, ["yo@ejemplo.com"]);
  assert.ok(!/[\r\n]/.test(p.subject)); assert.ok(p.html.includes("&lt;b&gt;")); assert.ok(!JSON.stringify(r.json).includes("re_test"));
});
test("incluye en el correo la estimación que vio el cliente", async () => {
  limpiar(); entorno(); simular();
  const r = await llamar({ ...valido, origen: "cotizar", servicios: ["B: Detallamiento"], estimacion: "Estimación: $1 – $2 <x>" });
  assert.equal(r.code, 200);
  const p = JSON.parse(llamadas[0].o.body);
  assert.ok(p.text.includes("Estimación: $1") && p.html.includes("&lt;x&gt;"));
});
test("hoja de cálculo: envía el token y la fila completa, solo con ese canal", async () => {
  limpiar(); entornoHoja(); simularCanales({});
  const r = await llamar(completo);
  assert.equal(r.code, 200); assert.equal(llamadas.length, 1);
  const p = JSON.parse(llamadas[0].o.body);
  assert.equal(p.token, "tok_secreto");
  assert.equal(p.fila.nombre, "Ana Pérez"); assert.equal(p.fila.area_m2, "1200");
  assert.ok(p.fila.servicios.includes("Revisión de diseños estructurales")); assert.ok(p.fila.estimacion.includes("$60.600.000")); assert.match(p.fila.fecha, /\d/);
});
test("hoja: si el Apps Script responde ok:false se considera falla (502 si es el único canal)", async () => {
  limpiar(); entornoHoja(); simularCanales({ hoja: false }); assert.equal((await llamar(completo)).code, 502);
});
test("WhatsApp (CallMeBot): avisa con toda la información", async () => {
  limpiar(); entornoCallmebot(); simularCanales({});
  const r = await llamar(completo);
  assert.equal(r.code, 200); assert.equal(llamadas.length, 1);
  const u = new URL(llamadas[0].u); const t = u.searchParams.get("text");
  assert.equal(u.hostname, "api.callmebot.com"); assert.equal(u.searchParams.get("phone"), "+573001112233"); assert.equal(u.searchParams.get("apikey"), "k123");
  for (const x of ["Ana Pérez", "ana@ejemplo.com", "300 111 2233", "Sabaneta", "1200 m²", "Revisión de diseños estructurales", "Necesito un diseño estructural", "$60.600.000"]) assert.ok(t.includes(x), "falta: " + x);
});
test("WhatsApp (Meta) con plantilla: un parámetro de una línea sin saltos", async () => {
  limpiar(); Object.assign(process.env, { WA_PROVIDER: "meta", WA_META_TOKEN: "EAAtok", WA_META_PHONE_ID: "123456", WA_META_TO: "+57 300 111 2233", WA_META_TEMPLATE: "nueva_solicitud" }); simularCanales({});
  const r = await llamar(completo);
  assert.equal(r.code, 200);
  const { u, o } = llamadas[0]; const p = JSON.parse(o.body);
  assert.ok(u.includes("graph.facebook.com") && u.includes("/123456/messages")); assert.equal(o.headers.Authorization, "Bearer EAAtok");
  assert.equal(p.to, "573001112233"); assert.equal(p.type, "template"); assert.equal(p.template.name, "nueva_solicitud");
  const par = p.template.components[0].parameters[0].text; assert.ok(!/[\n\t]/.test(par) && par.includes("Ana Pérez") && par.length <= 900);
});
test("tres canales: los tres reciben la solicitud", async () => {
  limpiar(); entorno(); entornoHoja(); entornoCallmebot(); simularCanales({});
  assert.equal((await llamar(completo)).code, 200); assert.equal(llamadas.length, 3);
});
test("si un canal falla y otro llega, el cliente ve éxito", async () => {
  limpiar(); entorno(); entornoHoja(); entornoCallmebot(); simularCanales({ resend: false, wa: false });
  assert.equal((await llamar(completo)).code, 200);
});
test("si todos los canales configurados fallan, 502", async () => {
  limpiar(); entorno(); entornoHoja(); simularCanales({ resend: false, hoja: false }); assert.equal((await llamar(completo)).code, 502);
});
test("proveedor de WhatsApp incompleto no cuenta como configurado (503)", async () => {
  limpiar(); process.env.WA_PROVIDER = "callmebot"; simularCanales({}); assert.equal((await llamar(completo)).code, 503);
});
test("falla de Resend responde 502 sin filtrar detalles", async () => { limpiar(); entorno(); simular(false); const r = await llamar(valido); assert.equal(r.code, 502); assert.ok(!JSON.stringify(r.json).includes("re_test")); });
test("limita envíos repetidos por IP", async () => {
  limpiar(); entorno(); simular(); let ultimo;
  for (let i = 0; i < 7; i++) ultimo = await llamar(valido, { ip: "9.9.9.9" });
  assert.equal(ultimo.code, 429);
});
