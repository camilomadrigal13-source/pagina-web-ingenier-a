// Comprueba la compilación en modo producción (versión informativa lista para publicar). Ejecutar: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = (r) => join(RAIZ, "dist", r);
const leer = (r) => readFileSync(dist(r), "utf8");
const compilar = (env) => execFileSync("node", ["scripts/build.mjs"], { cwd: RAIZ, env: { ...process.env, SITE_PROTOTYPE: "", SITE_URL: "", ...env }, stdio: "pipe" }).toString();
function todosLosHtml(dir = dist("")) {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? todosLosHtml(p) : p.endsWith(".html") ? [p] : []; });
}

test("producción: sin banner de prototipo, indexable, sin proyectos ilustrativos ni perfiles vacíos", () => {
  compilar({ SITE_PROTOTYPE: "0", SITE_URL: "https://ejemplo.co", SITE_WHATSAPP: "573001112233", SITE_EMAIL_PUBLIC: "hola@ejemplo.co" });
  const inicio = leer("index.html");
  assert.ok(!inicio.includes("Prototipo en revisión"));
  assert.ok(!inicio.includes("noindex"));
  assert.ok(existsSync(dist("proyectos")), "con un proyecto real se publica /proyectos/");
  assert.ok(!leer("proyectos/index.html").includes("ilustrativ"), "sin casos ilustrativos en producción");
  assert.ok(inicio.includes("/proyectos/") && leer("sitemap.xml").includes("/proyectos/"));
  const robots = leer("robots.txt");
  assert.ok(robots.includes("Allow: /") && robots.includes("Sitemap: https://ejemplo.co/sitemap.xml") && !robots.includes("Disallow: /\n"));
  for (const f of todosLosHtml()) {
    const h = readFileSync(f, "utf8");
    assert.ok(!h.includes("Caso ilustrativo"), f);
    assert.ok(!h.includes("Espacio para imagen real"), f);
    assert.ok(!h.includes("proto"), f + " conserva el banner");
    assert.ok(!h.includes("Imagen próximamente") && !h.includes('class="ranura'), f + " publica un espacio vacío de imagen");
  }
  assert.ok(!leer("nosotros/index.html").includes("perfil-vacio"));
});

test("producción: el cotizador no muestra precios de ejemplo y su texto coincide", () => {
  const c = leer("cotizador/index.html");
  assert.ok(!c.includes('id="estimado"') && !c.includes('id="tarifas"'));
  assert.ok(c.includes("Marca los servicios que necesitas") && !c.includes("referencia de costo al instante"));
  assert.ok(!c.includes("Valores de ejemplo") && !c.includes("valores de ejemplo"));
});

test("producción: contacto con datos reales y canonical con el dominio", () => {
  const k = leer("contacto/index.html");
  assert.ok(k.includes("https://wa.me/573001112233") && k.includes("mailto:hola@ejemplo.co"));
  assert.ok(!k.includes("Por definir"));
  assert.ok(leer("index.html").includes('<link rel="canonical" href="https://ejemplo.co/">'));
});

test("producción sin dominio falla con un mensaje claro", () => {
  assert.throws(() => compilar({ SITE_PROTOTYPE: "0" }), /dominio/i);
});

test("en Cloudflare el dominio sale de CF_PAGES_URL", () => {
  compilar({ SITE_PROTOTYPE: "0", CF_PAGES_URL: "https://sitio.pages.dev", CF_PAGES: "1" });
  assert.ok(leer("index.html").includes('href="https://sitio.pages.dev/"'));
  assert.ok(existsSync(dist("_headers")));
});

test("prototipo: se conserva todo lo de revisión", () => {
  compilar({});
  assert.ok(leer("index.html").includes("Prototipo en revisión"));
  assert.ok(existsSync(dist("proyectos/index.html")));
  assert.ok(leer("robots.txt").includes("Disallow: /"));
  assert.ok(!existsSync(dist("_headers")));
});

test("guías, preguntas frecuentes y privacidad completa: existen, con datos estructurados y sin Google Fonts", () => {
  compilar({ SITE_PROTOTYPE: "0", SITE_URL: "https://ejemplo.co", SITE_WHATSAPP: "573001112233", SITE_EMAIL_PUBLIC: "hola@ejemplo.co", TURNSTILE_SITE_KEY: "0xTEST" });
  for (const r of ["reforzamiento-estructural-medellin", "vulnerabilidad-sismica-nsr-10", "diseno-estructural-medellin", "revision-estructural-licencia-construccion", "preguntas"]) {
    const h = leer(`${r}/index.html`);
    assert.ok(h.includes("FAQPage"), r);
    assert.ok(leer("sitemap.xml").includes(`/${r}/`), r);
  }
  const inicio = leer("index.html");
  assert.ok(inicio.includes("Ingeniería estructural y arquitectura en Medellín"));
  assert.ok(!inicio.includes("fonts.googleapis") && !inicio.includes("fonts.gstatic"));
  const p = leer("privacidad/index.html");
  assert.ok(p.includes("hola@ejemplo.co") && p.includes("diez (10) días hábiles") && p.includes("Ley 1581") && !p.includes("por definir") && !p.includes("[razón"));
  assert.ok(leer("contacto/index.html").includes("cf-turnstile") && leer("contacto/index.html").includes("challenges.cloudflare.com"));
});

test("sin clave de Turnstile no se carga nada de Cloudflare en la página", () => {
  compilar({ SITE_PROTOTYPE: "0", SITE_URL: "https://ejemplo.co", TURNSTILE_SITE_KEY: "" });
  assert.ok(!leer("contacto/index.html").includes("cf-turnstile"));
});
