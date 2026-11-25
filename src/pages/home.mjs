import { esc } from "../lib.mjs";
import { hero } from "../svg.mjs";
import { cta, waLink } from "../layout.mjs";
import { ranura } from "./comun.mjs";

export function home(c, h, servicios, G, pr = null) {
  const reales = pr ? pr.proyectos.filter((x) => !x.ilustrativo && x.imagenes.length) : [];
  const foto = c.imagenes.hero
    ? `<figure class="hero-foto"><img src="${esc(c.imagenes.hero)}" alt="" width="1200" height="900" fetchpriority="high" decoding="async"></figure>`
    : `<div class="hero-dib">${hero()}</div>`;
  const wa = waLink(c, "Hola, quiero información sobre sus servicios.");
  return `
<section class="hero"><div class="wrap hero-in">
  <div class="hero-txt">
    <p class="eyebrow">${esc(h.eyebrow)}</p>
    <h1 class="display">${esc(h.hero_titulo)}</h1>
    <p class="hero-lema mono">${esc(h.hero_lema)}</p>
    <p class="lead">${esc(h.hero_texto)}</p>
    <div class="hero-cta">
      <a class="btn" href="/cotizador/">Solicitar cotización</a>
      <a class="btn btn-borde" href="/servicios/">Explorar servicios</a>
    </div>
    <ul class="hero-notas mono">${h.hero_notas.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>
  ${foto}
</div></section>

<section class="aud"><div class="wrap aud-in"><p class="mono aud-t">${esc(h.audiencias_titulo)}</p><ul>${h.audiencias.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div></section>

<section class="sec"><div class="wrap">
  <div class="sec-cab"><p class="eyebrow">${esc(h.unidades_titulo)}</p><h2 class="h2">${esc(servicios.intro.titulo)}</h2><p class="lead">${esc(servicios.intro.texto)}</p></div>
  <ol class="unidades">
    ${servicios.unidades.map((u) => `<li class="unidad u-${u.id}">
      <a class="unidad-a" href="/servicios/${u.slug}/">
        <span class="unidad-id mono">${u.id}</span>
        <span class="unidad-n"><span class="unidad-t">${esc(u.nombre)}</span><span class="unidad-r">${esc(u.resumen)}</span></span>
        <span class="unidad-l">${u.bloques.slice(0, 4).map((b) => esc(b.nombre)).join(" · ")}</span>
        <span class="unidad-go" aria-hidden="true">→</span>
      </a></li>`).join("")}
  </ol>
</div></section>

${reales.length && c.mostrarProyectos !== false ? `<section class="sec"><div class="wrap">
  <div class="sec-cab"><p class="eyebrow">${esc(h.obras_eyebrow)}</p><h2 class="h2">${esc(h.obras_titulo)}</h2><p class="lead">${esc(h.obras_texto)}</p></div>
  <ul class="obras">${reales.slice(0, 4).map((x) => `<li><a href="/proyectos/">${ranura(x.nombre, x.imagenes[0], c, 4, 3, false)}<span class="obras-t"><strong>${esc(x.nombre)}</strong><span class="mono">${esc(x.ubicacion)}</span></span></a></li>`).join("")}</ul>
  <p class="nota-pie"><a class="enlace" href="/proyectos/">${esc(h.obras_enlace)}</a></p>
</div></section>` : ""}

<section class="sec"><div class="wrap">
  <div class="sec-cab"><p class="eyebrow">${esc(G.indice_titulo)}</p><h2 class="h2">Temas que resolvemos a diario.</h2></div>
  <ul class="temas">${G.guias.map((g) => `<li><a href="/${g.slug}/"><span class="temas-t">${esc(g.corto)}</span><span class="temas-d">${esc(g.seo.descripcion)}</span><span aria-hidden="true">→</span></a></li>`).join("")}<li><a href="/preguntas/"><span class="temas-t">Preguntas frecuentes</span><span class="temas-d">Cómo cotizamos, dónde trabajamos y qué puedes contratar por separado.</span><span aria-hidden="true">→</span></a></li></ul>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-cab"><p class="eyebrow">${esc(h.valores_titulo)}</p><h2 class="h2">Una firma, varias disciplinas, un mismo criterio.</h2></div>
  <dl class="valores">${h.valores.map((v) => `<div><dt>${esc(v.titulo)}</dt><dd>${esc(v.texto)}</dd></div>`).join("")}</dl>
</div></section>

<section class="sec"><div class="wrap tec-teaser">
  <div><p class="eyebrow">Innovación</p><h2 class="h2">${esc(h.tec_titulo)}</h2><p class="lead">${esc(h.tec_texto)}</p><a class="enlace" href="/tecnologia/">Conocer más</a></div>
  <ul class="tec-lista mono"><li>BIM y modelado 3D</li><li>Despiece y cartillas</li><li>Cuantificación de materiales</li><li>Automatización de documentos</li></ul>
</div></section>

${cta(c, h.cta_titulo, h.cta_texto)}`;
}
