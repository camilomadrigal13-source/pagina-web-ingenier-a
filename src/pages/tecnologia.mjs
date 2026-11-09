import { esc } from "../lib.mjs";
import { flujo, vigaDetalle } from "../svg.mjs";
import { cta } from "../layout.mjs";
import { ranura, migaHtml } from "./comun.mjs";

export function tecnologia(c, t) {
  return `<section class="cab cab-tec"><div class="wrap">
  <p class="eyebrow">${esc(t.eyebrow)}</p><h1 class="h1">${esc(t.titulo)}</h1><p class="lead">${esc(t.subtitulo)}</p>
  <p class="contexto">${esc(t.contexto)}</p></div></section>
<div class="wrap">${migaHtml([{ nombre: "Inicio", ruta: "/" }, { nombre: "Tecnología" }])}</div>

<section class="sec sec-top"><div class="wrap">
  <div class="sec-cab"><h2 class="h2">${esc(t.flujo_titulo)}</h2></div>
  <div class="flujo-dib">${flujo()}</div>
  <ol class="pasos">${t.flujo.map((p, i) => `<li class="paso"><div class="paso-txt"><p class="mono paso-n">${i + 1} · ${esc(p.n)}</p><h3 class="h3">${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>${ranura(p.captura, "", c, 16, 9)}</li>`).join("")}</ol>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-cab"><h2 class="h2">${esc(t.capacidades_titulo)}</h2><p class="lead">${esc(t.capacidades_nota)}</p></div>
  <ul class="capac">${t.capacidades.map((x) => `<li><p class="estado-t ${x.estado === "Automatizado" ? "ok" : "dev"} mono">${esc(x.estado)}</p><h3 class="h3">${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></li>`).join("")}</ul>
</div></section>

<section class="sec"><div class="wrap interf">
  <div><h2 class="h2">${esc(t.interferencias_titulo)}</h2>
  <ul class="lista lista-lg">${t.interferencias.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  <div class="interf-dib">${vigaDetalle()}</div>
</div></section>

<section class="sec sec-alt"><div class="wrap">
  <div class="sec-cab"><h2 class="h2">${esc(t.alcance_titulo)}</h2></div>
  <dl class="cuatro">${t.alcance.map((x) => `<div><dt>${esc(x.titulo)}</dt><dd>${esc(x.texto)}</dd></div>`).join("")}</dl>
  <aside class="aviso" role="note"><p class="mono aviso-t">Alcance normativo</p><p>${esc(t.aviso)}</p></aside>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-cab"><h2 class="h2">${esc(t.demo_titulo)}</h2><p class="lead">${esc(t.demo_texto)}</p></div>
  <div class="galeria-tec">${t.demos.map((d) => ranura(d.titulo, d.imagen, c, 4, 3)).join("")}</div>
</div></section>
${cta(c, t.cta, "Te respondemos con una propuesta o con las preguntas necesarias para hacerla.", "?u=B")}`;
}
