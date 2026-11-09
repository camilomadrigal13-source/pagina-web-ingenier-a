// Servidor local: sirve dist/ y monta la función api/contacto.js. Uso: npm run build && npm run dev
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { pathToFileURL } from "node:url";
import { RAIZ } from "../src/lib.mjs";

const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain" };
const dist = join(RAIZ, "dist");
const PUERTO = Number(process.env.PORT) || 3000;
const { default: contacto } = await import(pathToFileURL(join(RAIZ, "api", "contacto.js")).href);

async function archivo(ruta) {
  let p = normalize(join(dist, decodeURIComponent(ruta)));
  if (!p.startsWith(dist)) return null;
  try { const s = await stat(p); if (s.isDirectory()) p = join(p, "index.html"); await stat(p); return p; } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/contacto") {
    let raw = ""; for await (const ch of req) raw += ch;
    try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = null; }
    return contacto(req, res);
  }
  let p = await archivo(url.pathname);
  if (!p) { res.statusCode = 404; p = join(dist, "404.html"); }
  res.setHeader("Content-Type", TIPOS[extname(p)] || "application/octet-stream");
  res.end(await readFile(p));
}).listen(PUERTO, () => console.log(`http://localhost:${PUERTO}`));
