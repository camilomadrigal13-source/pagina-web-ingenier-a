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
const limpiar = () => { delete process.env.RESEND_API_KEY; delete process.env.CONTACT_TO; _prueba.visitas.clear(); };
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
test("falla de Resend responde 502 sin filtrar detalles", async () => { limpiar(); entorno(); simular(false); const r = await llamar(valido); assert.equal(r.code, 502); assert.ok(!JSON.stringify(r.json).includes("re_test")); });
test("limita envíos repetidos por IP", async () => {
  limpiar(); entorno(); simular(); let ultimo;
  for (let i = 0; i < 7; i++) ultimo = await llamar(valido, { ip: "9.9.9.9" });
  assert.equal(ultimo.code, 429);
});
