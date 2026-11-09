// Generador estático sin dependencias: lee site.config.json y contenido/*.json y escribe dist/.
import { mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, leer, cargarConfig, pendientes } from "../src/lib.mjs";
import { pagina } from "../src/layout.mjs";
import { home } from "../src/pages/home.mjs";
import { indice, unidad } from "../src/pages/servicios.mjs";
import { tecnologia } from "../src/pages/tecnologia.mjs";
import { nosotros, proceso, proyectos, cotizador, contacto, privacidad, noEncontrada } from "../src/pages/otras.mjs";

const c = cargarConfig();
const dist = join(RAIZ, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(RAIZ, "public"), dist, { recursive: true });

const S = leer("contenido/servicios.json");
const H = leer("contenido/home.json");
const T = leer("contenido/tecnologia.json");
const N = leer("contenido/nosotros.json");
const P = leer("contenido/proceso.json");
const PR = leer("contenido/proyectos.json");
const Q = leer("contenido/cotizador.json");
const TAR = leer("contenido/tarifas.json");
const unidades = S.unidades;

const rutas = [];
function emitir(ruta, opts, archivo) {
  const html = pagina(c, { ruta, servicios: unidades, ...opts });
  const out = archivo ? join(dist, archivo) : join(dist, ruta, "index.html");
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, html);
  if (!archivo) rutas.push(ruta);
}

emitir("/", { titulo: H.seo.titulo, descripcion: H.seo.descripcion, cuerpo: home(c, H, S), home: true, bodyClass: "pg-home" });
emitir("/nosotros/", { titulo: N.seo.titulo, descripcion: N.seo.descripcion, cuerpo: nosotros(c, N), migas: [{ nombre: "Nosotros", ruta: "/nosotros/" }] });
emitir("/servicios/", { titulo: "Servicios de ingeniería, arquitectura, BIM, construcción y gestión documental", descripcion: S.intro.texto, cuerpo: indice(c, S), migas: [{ nombre: "Servicios", ruta: "/servicios/" }] });
for (const u of unidades) {
  emitir(`/servicios/${u.slug}/`, {
    titulo: u.seo.titulo, descripcion: u.seo.descripcion, cuerpo: unidad(c, S, u), bodyClass: `u-pg u-${u.id}`,
    migas: [{ nombre: "Servicios", ruta: "/servicios/" }, { nombre: u.corto, ruta: `/servicios/${u.slug}/` }]
  });
}
emitir("/tecnologia/", { titulo: T.seo.titulo, descripcion: T.seo.descripcion, cuerpo: tecnologia(c, T), migas: [{ nombre: "Tecnología", ruta: "/tecnologia/" }], bodyClass: "pg-tec" });
emitir("/proyectos/", { titulo: PR.seo.titulo, descripcion: PR.seo.descripcion, cuerpo: proyectos(c, PR), migas: [{ nombre: "Proyectos", ruta: "/proyectos/" }] });
emitir("/proceso/", { titulo: P.seo.titulo, descripcion: P.seo.descripcion, cuerpo: proceso(c, P, S), migas: [{ nombre: "Proceso", ruta: "/proceso/" }] });
emitir("/cotizador/", { titulo: Q.seo.titulo, descripcion: Q.seo.descripcion, cuerpo: cotizador(c, Q, unidades, TAR), migas: [{ nombre: "Cotización", ruta: "/cotizador/" }] });
emitir("/contacto/", { titulo: "Contacto", descripcion: `Escríbenos desde ${c.ubicacion.municipio}, ${c.ubicacion.departamento}, o por WhatsApp. Atendemos todo Colombia.`, cuerpo: contacto(c, unidades, Q), migas: [{ nombre: "Contacto", ruta: "/contacto/" }] });
emitir("/privacidad/", { titulo: "Política de privacidad", descripcion: "Cómo tratamos los datos que nos envías por los formularios del sitio.", cuerpo: privacidad(c), migas: [{ nombre: "Privacidad", ruta: "/privacidad/" }] });
emitir("/404.html", { titulo: "Página no encontrada", descripcion: "Página no encontrada.", cuerpo: noEncontrada(c) }, "404.html");

const hoy = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas.map((r) => `  <url><loc>${c.url}${r}</loc><lastmod>${hoy}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(dist, "robots.txt"),
  c.modo_prototipo ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${c.url}/sitemap.xml\n`);

console.log(`Sitio generado: ${rutas.length + 1} páginas en dist/ (modo ${c.modo_prototipo ? "prototipo, sin indexar" : "producción"}).`);
const pend = pendientes(c);
if (pend.length) console.log("Pendiente de definir:\n  - " + pend.join("\n  - "));
if (!c.modo_prototipo && c.urlPendiente) { console.error("ERROR: producción sin dominio. Define SITE_URL o dominio en site.config.json."); process.exit(1); }
