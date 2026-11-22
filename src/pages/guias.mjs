// Guías por tema (páginas pensadas para quien busca un servicio concreto) y preguntas frecuentes.
import { esc } from "../lib.mjs";
import { cta } from "../layout.mjs";
import { cabecera, migaHtml } from "./comun.mjs";

const faqHtml = (items) => `<div class="faq">${items.map((x) => `<details><summary>${esc(x.p)}</summary><p>${esc(x.r)}</p></details>`).join("")}</div>`;

export const faqLd = (items) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: items.map((x) => ({ "@type": "Question", name: x.p, acceptedAnswer: { "@type": "Answer", text: x.r } }))
});

export function guia(c, G, g, servicios) {
  const u = servicios.find((s) => s.id === g.unidad);
  const otras = G.guias.filter((x) => x.slug !== g.slug);
  return `${cabecera("Guía", g.titulo, g.lead)}
<div class="wrap">${migaHtml([{ nombre: "Inicio", ruta: "/" }, { nombre: "Servicios", ruta: "/servicios/" }, { nombre: g.corto }])}</div>
<section class="sec sec-top"><div class="wrap prosa">
${g.secciones.map((s) => `<h2 class="h3">${esc(s.h)}</h2>
${s.p ? `<p>${esc(s.p)}</p>` : ""}
${s.lista ? `<ul class="lista">${s.lista.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
${s.pasos ? `<ol class="pasos-g">${s.pasos.map((x, i) => `<li><span class="mono">${i + 1}</span><div><strong>${esc(x.t)}</strong><p>${esc(x.p)}</p></div></li>`).join("")}</ol>` : ""}`).join("\n")}
<h2 class="h3">Preguntas frecuentes</h2>
${faqHtml(g.faq)}
<aside class="aviso" role="note"><p class="mono aviso-t">Importante</p><p>${esc(G.aviso)}</p></aside>
<p class="nota-sm">Esta guía hace parte de nuestro servicio de <a href="/servicios/${esc(u.slug)}/">${esc(u.nombre)}</a>.</p>
</div></section>
<section class="sec sec-alt"><div class="wrap"><h2 class="h3">Otros temas</h2>
<ul class="otras">${otras.map((o) => `<li><a href="/${o.slug}/">${esc(o.corto)}</a></li>`).join("")}<li><a href="/preguntas/">Preguntas frecuentes</a></li></ul></div></section>
${cta(c, "¿Tienes un caso así?", "Cuéntanos tu situación y te respondemos con una propuesta o con las preguntas que nos faltan.", `?u=${g.unidad}`)}`;
}

export function preguntas(c, Q) {
  return `${cabecera("Preguntas frecuentes", Q.titulo, Q.texto)}
<section class="sec sec-top"><div class="wrap prosa">
${Q.grupos.map((gr) => `<h2 class="h3">${esc(gr.titulo)}</h2>${faqHtml(gr.items)}`).join("\n")}
</div></section>
${cta(c, "¿Te quedó una duda?", "Escríbenos y te respondemos.")}`;
}

export const todasLasPreguntas = (Q) => Q.grupos.flatMap((g) => g.items);
