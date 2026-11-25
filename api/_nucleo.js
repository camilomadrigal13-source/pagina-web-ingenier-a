// Lógica del formulario, independiente de la plataforma (Vercel o Cloudflare).
// Los adaptadores (api/contacto.js y functions/api/contacto.js) solo traducen la petición y la respuesta.
// El archivo empieza con "_" para que Vercel no lo publique como ruta.
//   ALLOWED_ORIGINS  orígenes extra permitidos, separados por comas (opcional; el propio dominio siempre se permite)

import { configurados, correo, hoja, whatsapp } from "./_canales.js";

const LIMITE = { ventanaMs: 10 * 60 * 1000, max: 6 };
export const visitas = new Map(); // mejor esfuerzo: en serverless cada instancia tiene su propia memoria

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const linea = (s, n) => String(s ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);
const texto = (s, n) => String(s ?? "").replace(/\r/g, "").trim().slice(0, n);

function limitado(clave, ahora = Date.now()) {
  const l = (visitas.get(clave) || []).filter((t) => ahora - t < LIMITE.ventanaMs);
  if (l.length >= LIMITE.max) { visitas.set(clave, l); return true; }
  l.push(ahora); visitas.set(clave, l);
  if (visitas.size > 5000) visitas.clear();
  return false;
}

function origenPermitido(origin, host, env) {
  if (!origin) return true; // peticiones sin Origin (p. ej. pruebas con curl) no son navegadores
  let h;
  try { h = new URL(origin).host; } catch { return false; }
  const extra = (env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean).map((x) => { try { return new URL(x).host; } catch { return x; } });
  return h === host || extra.includes(h);
}

export function validar(b) {
  const e = {};
  const d = {
    nombre: linea(b.nombre, 120), correo: linea(b.correo, 160), telefono: linea(b.telefono, 30),
    mensaje: texto(b.mensaje, 4000), contacto_preferido: linea(b.contacto_preferido, 40),
    origen: b.origen === "cotizar" ? "cotizar" : "contacto",
    servicio: linea(b.servicio, 120), tipo_proyecto: linea(b.tipo_proyecto, 120), ubicacion: linea(b.ubicacion, 120),
    nivel: linea(b.nivel, 160), area_m2: linea(b.area_m2, 12), estimacion: texto(b.estimacion, 1800),
    servicios: Array.isArray(b.servicios) ? b.servicios.slice(0, 40).map((s) => linea(s, 140)).filter(Boolean) : []
  };
  if (d.nombre.length < 2) e.nombre = "Falta el nombre.";
  if (d.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)) e.correo = "Correo no válido.";
  else if (!d.correo && !d.telefono) e.correo = "Indica un correo o un teléfono.";
  if (d.telefono && !/^[0-9 +()\-]{7,30}$/.test(d.telefono)) e.telefono = "Teléfono no válido.";
  if (d.mensaje.length < 15) e.mensaje = "El mensaje es muy corto.";
  if (d.area_m2 && !(Number(d.area_m2) > 0)) e.area_m2 = "Área no válida.";
  if (b.acepto !== true) e.acepto = "Falta la autorización de datos.";
  if (d.origen === "cotizar" && !d.servicios.length) e.servicios = "Selecciona al menos un servicio.";
  if (d.origen === "contacto" && !d.servicio) e.servicio = "Selecciona un servicio.";
  return { d, e };
}

function armar(d) {
  const filas = [
    ["Origen", d.origen === "cotizar" ? "Solicitud de cotización" : "Formulario de contacto"],
    ["Nombre", d.nombre], ["Correo", d.correo], ["Teléfono", d.telefono], ["Contacto preferido", d.contacto_preferido],
    ["Servicio", d.servicio], ["Servicios", d.servicios.join("; ")], ["Tipo de proyecto", d.tipo_proyecto],
    ["Ubicación", d.ubicacion], ["Área (m²)", d.area_m2], ["Nivel de desarrollo", d.nivel]
  ].filter(([, v]) => v);
  const plano = filas.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nMensaje:\n${d.mensaje}\n` + (d.estimacion ? `\n${d.estimacion}\n` : "");
  const html = `<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">${filas.map(([k, v]) => `<tr><td style="color:#555"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join("")}</table><p style="font:14px Arial,sans-serif;white-space:pre-wrap"><b>Mensaje</b><br>${esc(d.mensaje)}</p>${d.estimacion ? `<p style="font:13px Arial,sans-serif;white-space:pre-wrap;color:#555"><b>Lo que vio el cliente</b><br>${esc(d.estimacion)}</p>` : ""}`;
  return { plano, html, asunto: `${d.origen === "cotizar" ? "Cotización" : "Contacto"}: ${d.nombre}` };
}

/** Verifica el token de Cloudflare Turnstile (antibots gratis). Solo se exige si TURNSTILE_SECRET está definida. */
async function turnstileOk(token, ip, env) {
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  try {
    const p = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
    if (ip) p.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: p, signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return j.success === true;
  } catch { return false; }
}

/**
 * Procesa una solicitud del formulario.
 * @param {{metodo:string, origin?:string, host:string, ip:string, body:any, env:Record<string,string|undefined>}} p
 * @returns {Promise<{codigo:number, cuerpo:object, encabezados?:Record<string,string>}>}
 */
export async function procesar({ metodo, origin, host, ip, body, env }) {
  if (metodo !== "POST") return { codigo: 405, cuerpo: { error: "Método no permitido." }, encabezados: { Allow: "POST" } };
  if (!origenPermitido(origin, host, env)) return { codigo: 403, cuerpo: { error: "Origen no permitido." } };
  if (limitado(ip || "?")) return { codigo: 429, cuerpo: { error: "Demasiados envíos. Espera unos minutos." } };

  let b = body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== "object") return { codigo: 400, cuerpo: { error: "Solicitud no válida." } };

  if (b.sitio_web) return { codigo: 200, cuerpo: { ok: true } }; // trampa para bots: se simula éxito y no se envía nada

  const { d, e } = validar(b);
  if (Object.keys(e).length) return { codigo: 400, cuerpo: { error: "Revisa los datos del formulario.", campos: e } };

  if (env.TURNSTILE_SECRET && !(await turnstileOk(b["cf-turnstile-response"], ip, env))) {
    return { codigo: 400, cuerpo: { error: "No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo." } };
  }

  // Se envía por todos los canales configurados a la vez. Basta con que uno llegue para confirmar al cliente.
  const cfg = configurados(env);
  const canales = [];
  if (cfg.correo) canales.push(["correo", correo(d, armar(d), env)]);
  if (cfg.hoja) canales.push(["hoja", hoja(d, env)]);
  if (cfg.whatsapp) canales.push(["whatsapp", whatsapp(d, env)]);
  if (!canales.length) return { codigo: 503, cuerpo: { error: "El envío de mensajes aún no está configurado." } };

  const resultados = await Promise.all(canales.map(async ([nombre, p]) => [nombre, await p.catch(() => false)]));
  const fallan = resultados.filter(([, ok]) => !ok).map(([n]) => n);
  if (fallan.length === resultados.length) return { codigo: 502, cuerpo: { error: "No se pudo entregar el mensaje." } };
  if (fallan.length) console.error("Canales con falla (el resto entregó):", fallan.join(", "));
  return { codigo: 200, cuerpo: { ok: true } };
}
