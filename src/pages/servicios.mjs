import { esc } from "../lib.mjs";
import { expediente } from "../svg.mjs";
import { cta } from "../layout.mjs";
import { cabecera, migaHtml } from "./comun.mjs";

export function indice(c, s) {
  return `${cabecera("Servicios", s.intro.titulo, s.intro.texto)}
<section class="sec"><div class="wrap"><ol class="unidades unidades-lg">
${s.unidades.map((u) => `<li class="unidad u-${u.id}"><a class="unidad-a" href="/servicios/${u.slug}/">
  <span class="unidad-id mono">${u.id}</span>
  <span class="unidad-n"><span class="unidad-t">${esc(u.nombre)}</span><span class="unidad-r">${esc(u.resumen)}</span></span>
  <span class="unidad-l">${u.bloques.map((b) => esc(b.nombre)).join(" · ")}</span><span class="unidad-go" aria-hidden="true">→</span></a></li>`).join("")}
</ol>
<p class="nota-pie">Cada servicio se puede contratar de forma independiente. <a href="/cotizador/">Cuéntanos qué necesitas</a> y armamos la propuesta.</p></div></section>
${cta(c, "¿No sabes por dónde empezar?", "Cuéntanos tu situación y te decimos qué servicios hacen falta y cuáles no.")}`;
}

export function unidad(c, s, u) {
  const otras = s.unidades.filter((x) => x.id !== u.id);
  const dibujo = u.id === "D" ? `<div class="u-dib">${expediente()}</div>` : "";
  return `${cabecera(`Unidad ${u.id}`, u.nombre, u.resumen)}
<div class="wrap">${migaHtml([{ nombre: "Inicio", ruta: "/" }, { nombre: "Servicios", ruta: "/servicios/" }, { nombre: u.corto }])}</div>
<section class="sec sec-top"><div class="wrap u-intro"><p class="lead">${esc(u.intro)}</p>${dibujo}</div></section>
<section class="sec sec-top"><div class="wrap">
${u.bloques.map((b, i) => `<article class="bloque" id="${esc(b.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">
  <header class="bloque-h"><p class="mono bloque-n">${u.id}.${i + 1}</p><h2 class="h3">${esc(b.nombre)}</h2><ul class="etq">${b.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></header>
  <div class="bloque-c">
    <div><h3 class="mini">Qué ofrecemos</h3><p>${esc(b.ofrecemos)}</p></div>
    <div><h3 class="mini">Qué problema resuelve</h3><p>${esc(b.problema)}</p></div>
    <div><h3 class="mini">Entregables</h3><ul class="lista">${b.entregables.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div><h3 class="mini">Es apropiado para</h3><ul class="lista">${b.para.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="bloque-acc"><a class="btn btn-sm" href="/cotizador/?u=${u.id}&amp;s=${encodeURIComponent(b.nombre)}">Pedir propuesta</a>${b.enlace_tecnologia ? `<a class="enlace" href="/tecnologia/">Ver nuestra tecnología de detallamiento</a>` : ""}</div>
  </div>
</article>`).join("")}
${u.nota ? `<aside class="aviso" role="note"><p class="mono aviso-t">Importante</p><p>${esc(u.nota)}</p></aside>` : ""}
</div></section>
<section class="sec sec-alt"><div class="wrap"><h2 class="h3">Otras unidades</h2>
<ul class="otras">${otras.map((o) => `<li><a href="/servicios/${o.slug}/"><span class="mono">${o.id}</span> ${esc(o.nombre)}</a></li>`).join("")}</ul></div></section>
${cta(c, `¿Necesitas algo de ${u.corto.toLowerCase()}?`, "Cuéntanos el proyecto y te respondemos con una propuesta personalizada.", `?u=${u.id}`)}`;
}
