// Adaptador para Cloudflare Pages Functions. Atiende POST /api/contacto.
// La lógica es la misma que en Vercel: api/_nucleo.js. Las variables se definen en el panel de Cloudflare
// (Settings → Variables and secrets) y llegan en context.env. Ver docs/CLOUDFLARE.md.

import { procesar } from "../../api/_nucleo.js";

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const body = request.method === "POST" ? await request.json().catch(() => null) : null;
  const r = await procesar({
    metodo: request.method,
    origin: request.headers.get("origin"),
    host: url.host,
    ip: request.headers.get("cf-connecting-ip") || "?",
    body,
    env
  });
  return new Response(JSON.stringify(r.cuerpo), {
    status: r.codigo,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(r.encabezados || {}) }
  });
}
