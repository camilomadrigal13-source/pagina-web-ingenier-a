// Adaptador para Vercel (función Node). La lógica está en api/_nucleo.js y los canales en api/_canales.js.
// Las claves viven en variables de entorno del servidor. Nunca se envían al navegador. Ver docs/INTEGRACIONES.md.

import { procesar, visitas } from "./_nucleo.js";

const ip = (req) => String(req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "?").split(",")[0].trim();

export default async function handler(req, res) {
  const r = await procesar({
    metodo: req.method,
    origin: req.headers?.origin,
    host: req.headers?.["x-forwarded-host"] || req.headers?.host,
    ip: ip(req),
    body: req.body,
    env: process.env
  });
  res.statusCode = r.codigo;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(r.encabezados || {})) res.setHeader(k, v);
  res.end(JSON.stringify(r.cuerpo));
}

export const _prueba = { visitas };
