// Utilidades comunes: lectura de contenido, escape HTML y configuración.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
export const leer = (rel) => JSON.parse(readFileSync(join(RAIZ, rel), "utf8"));
export const existe = (rel) => existsSync(join(RAIZ, rel));

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Configuración con posibles sobrescrituras por variables de entorno (útil en Vercel y en pruebas). */
export function cargarConfig() {
  const c = leer("site.config.json");
  const env = process.env;
  if (env.SITE_NAME) c.nombre = env.SITE_NAME;
  if (env.SITE_WHATSAPP) c.contacto.whatsapp = env.SITE_WHATSAPP;
  if (env.SITE_EMAIL_PUBLIC) c.contacto.correo = env.SITE_EMAIL_PUBLIC;
  if (env.SITE_PROTOTYPE) c.modo_prototipo = env.SITE_PROTOTYPE === "1";
  let url = env.SITE_URL || c.dominio || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  c.urlPendiente = !url;
  c.url = (url || "https://dominio-pendiente.example").replace(/\/+$/, "");
  c.waNumero = (c.contacto.whatsapp || "").replace(/\D/g, "");
  return c;
}

/** Ítems de configuración pendientes, para avisar al compilar. */
export function pendientes(c) {
  const p = [];
  if (!c.nombre_definitivo) p.push("nombre definitivo de la firma");
  if (!c.logo) p.push("logotipo (se usa una marca provisional)");
  if (!c.contacto.correo) p.push("correo público");
  if (!c.waNumero) p.push("número de WhatsApp");
  if (c.urlPendiente) p.push("dominio (SITE_URL o dominio en site.config.json)");
  if (!Object.values(c.redes).some(Boolean)) p.push("redes sociales");
  if (!c.imagenes.hero) p.push("fotografía principal (opcional)");
  return p;
}
