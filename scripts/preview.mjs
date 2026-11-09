// Vista previa en UN solo archivo HTML (todas las páginas con enrutado por #hash), para compartir sin servidor.
// Uso: npm run build && node scripts/preview.mjs [salida.html]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../src/lib.mjs";

const dist = join(RAIZ, "dist");
const salida = process.argv[2] || join(dist, "vista-previa.html");
const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
const rutas = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const slug = (r) => (r === "/" ? "inicio" : r.replace(/^\/|\/$/g, "").replace(/\//g, "-"));
const rutaDe = (h) => { const p = h.split("#")[0].split("?")[0]; return p === "" ? "/" : p; };

const reenlazar = (html) => html.replace(/href="(\/[^"]*)"/g, (m, h) => {
  const p = rutaDe(h);
  if (/\.(css|js|svg|png|xml|txt)$/.test(p)) return m;
  return rutas.includes(p) ? `href="#${slug(p)}"` : m;
});

const leer = (r) => readFileSync(join(dist, r === "/" ? "index.html" : join(r, "index.html")), "utf8");
const inicio = leer("/");
const cabecera = reenlazar(inicio.match(/<header class="enc">[\s\S]*?<\/header>/)[0]);
const pie = reenlazar(inicio.match(/<footer class="pie">[\s\S]*?<\/footer>/)[0]);
const banner = (inicio.match(/<div class="proto"[\s\S]*?<\/div>/) || [""])[0];
const fuentes = inicio.match(/<link rel="stylesheet" href="(https:\/\/fonts[^"]+)">/)[1];
const css = readFileSync(join(dist, "assets/styles.css"), "utf8");
const tema = readFileSync(join(dist, "assets/theme.js"), "utf8");
const app = readFileSync(join(dist, "assets/app.js"), "utf8");

const vistas = rutas.map((r) => {
  const h = leer(r);
  const cuerpo = reenlazar(h.match(/<main id="contenido">([\s\S]*?)<\/main>/)[1]);
  const clase = (h.match(/<body class="([^"]*)"/) || [, ""])[1];
  const titulo = h.match(/<title>([^<]*)<\/title>/)[1];
  return `<div class="vista" id="v-${slug(r)}" data-ruta="${r}" data-body="${clase}" data-titulo="${titulo.replace(/"/g, "&quot;")}" hidden>${cuerpo}</div>`;
}).join("\n");

const enrutador = `
(function(){
  var vistas=[].slice.call(document.querySelectorAll(".vista"));
  function ir(){
    var id=(location.hash||"#inicio").slice(1), v=vistas.filter(function(x){return x.id==="v-"+id;})[0]||vistas[0];
    vistas.forEach(function(x){x.hidden=x!==v;});
    document.body.className=v.getAttribute("data-body")||"";
    document.title=v.getAttribute("data-titulo");
    [].slice.call(document.querySelectorAll(".nav a")).forEach(function(a){
      var ok=v.getAttribute("data-ruta").indexOf(a.getAttribute("href").replace("#","/").replace(/^\\/inicio$/,"/"))===0 && a.getAttribute("href")!=="#inicio";
      if(ok)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
    });
    window.scrollTo(0,0);
  }
  window.addEventListener("hashchange",ir);ir();
})();`;

const html = `<title>Cota Estudio</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${fuentes}">
<style>${css}
.salto{display:none}</style>
<script>${tema}</script>
${banner}
${cabecera}
<main id="contenido">
${vistas}
</main>
${pie}
<script data-endpoint-preview>document.body.setAttribute("data-endpoint","/api/contacto");</script>
<script>${app}</script>
<script>${enrutador}</script>`;
writeFileSync(salida, html);
console.log(`Vista previa: ${salida} (${rutas.length} páginas, ${(html.length / 1024).toFixed(0)} KB)`);
