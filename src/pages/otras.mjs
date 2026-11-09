import { esc } from "../lib.mjs";
import { cta, waLink } from "../layout.mjs";
import { cabecera, ranura, formulario, migaHtml } from "./comun.mjs";

export function nosotros(c, n) {
  const mostrarPerfiles = n.perfiles.some((p) => p.nombre) || c.modo_prototipo;
  return `${cabecera("Nosotros", n.titulo, n.intro)}
<section class="sec sec-top"><div class="wrap"><dl class="principios">${n.principios.map((p) => `<div><dt>${esc(p.titulo)}</dt><dd>${esc(p.texto)}</dd></div>`).join("")}</dl></div></section>
<section class="sec sec-alt"><div class="wrap dos">
  <div><h2 class="h2">${esc(n.alcance.titulo)}</h2><p class="lead">${esc(n.alcance.texto)}</p></div>
  <div><h2 class="h2">${esc(n.clientes.titulo)}</h2><p class="lead">${esc(n.clientes.texto)}</p></div>
</div></section>
${mostrarPerfiles ? `<section class="sec"><div class="wrap"><div class="sec-cab"><h2 class="h2">${esc(n.perfiles_titulo)}</h2><p class="lead">${esc(n.perfiles_nota)}</p></div>
<ul class="perfiles">${n.perfiles.map((p) => p.nombre
    ? `<li class="perfil">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" width="400" height="500" loading="lazy" decoding="async">` : ""}<h3 class="h3">${esc(p.nombre)}</h3><p class="mono">${esc(p.cargo)}</p><p>${esc(p.formacion)}</p>${p.matricula ? `<p class="mono">Matrícula profesional ${esc(p.matricula)}</p>` : ""}<p>${esc(p.bio)}</p></li>`
    : `<li class="perfil perfil-vacio">${ranura("Foto del profesional", "", c, 4, 5)}<p class="mono">Nombre · cargo</p><p>Formación, experiencia y matrícula profesional, por completar.</p></li>`).join("")}</ul></div></section>` : ""}
${cta(c, "Hablemos de tu proyecto", "Te escuchamos y definimos juntos el alcance.")}`;
}

export function proceso(c, p, servicios) {
  return `${cabecera("Proceso de trabajo", p.titulo, p.intro)}
<section class="sec sec-top"><div class="wrap"><ol class="etapas">${p.etapas.map((e, i) => `<li class="etapa"><div class="etapa-dim"><span class="mono">Etapa ${i + 1}</span></div><h2 class="h3">${esc(e.nombre)}</h2><p>${esc(e.texto)}</p><p class="recibes"><span class="mono">Recibes</span> ${esc(e.recibes)}</p></li>`).join("")}</ol></div></section>
<section class="sec sec-alt"><div class="wrap"><h2 class="h2">${esc(p.por_servicio_titulo)}</h2>
<dl class="por-serv">${p.por_servicio.map((x) => { const u = servicios.unidades.find((y) => y.id === x.unidad); return `<div><dt><a href="/servicios/${u.slug}/"><span class="mono">${u.id}</span> ${esc(u.corto)}</a></dt><dd>${esc(x.texto)}</dd></div>`; }).join("")}</dl></div></section>
${cta(c, "Empecemos por el diagnóstico", "Cuéntanos qué necesitas y definimos el alcance.")}`;
}

export function proyectos(c, p) {
  const nom = Object.fromEntries(p.categorias.map((x) => [x.id, x.nombre]));
  return `${cabecera("Proyectos y portafolio", p.titulo, p.intro)}
<section class="sec sec-top"><div class="wrap">
<div class="filtros" role="group" aria-label="Filtrar proyectos por área">
  <button type="button" class="filtro" data-filtro="todos" aria-pressed="true">Todos</button>
  ${p.categorias.map((x) => `<button type="button" class="filtro" data-filtro="${x.id}" aria-pressed="false">${esc(x.nombre)}</button>`).join("")}
</div>
<p class="mono filtros-n" id="filtros-n" role="status" aria-live="polite">${p.proyectos.length} proyectos</p>
<ul class="proy" id="proy">${p.proyectos.map((x) => `<li class="proy-i" data-cat="${x.categorias.join(" ")}">
  <button type="button" class="proy-b" data-abrir="${esc(x.id)}" aria-haspopup="dialog">
    ${ranura(x.nombre, x.imagenes[0] || "", c, 4, 3)}
    <span class="proy-m"><span class="mono proy-c">${x.categorias.map((k) => esc(nom[k])).join(" · ")}</span><span class="proy-n">${esc(x.nombre)}</span>${x.ilustrativo ? `<span class="etq-ilus mono">Caso ilustrativo</span>` : ""}</span>
  </button></li>`).join("")}</ul>
</div></section>
${p.proyectos.map((x) => `<dialog class="modal" id="m-${esc(x.id)}" aria-labelledby="m-${esc(x.id)}-t">
  <div class="modal-in"><button class="modal-x" type="button" data-cerrar aria-label="Cerrar">×</button>
  <p class="mono">${x.ilustrativo ? "Caso ilustrativo · no corresponde a una obra real" : esc(x.ubicacion || "Ubicación por definir")}</p>
  <h2 class="h2" id="m-${esc(x.id)}-t">${esc(x.nombre)}</h2><p class="lead">${esc(x.descripcion)}</p>
  <div class="modal-g">${(x.imagenes.length ? x.imagenes : ["", ""]).map((im, i) => ranura(`Fotografía ${i + 1}`, im, c, 4, 3)).join("")}${x.planos.map((im, i) => ranura(`Plano ${i + 1}`, im, c, 4, 3)).join("")}</div>
  <dl class="modal-d"><div><dt>Alcance</dt><dd>${x.alcance.map(esc).join(" · ")}</dd></div><div><dt>Resultados</dt><dd>${esc(x.resultados || "Por documentar")}</dd></div></dl>
  <a class="btn btn-sm" href="/cotizador/?u=${esc(x.servicios[0] || "")}">Solicitar algo similar</a></div></dialog>`).join("")}
${cta(c, "¿Tu proyecto puede ser el próximo?", "Cuéntanos qué necesitas.")}`;
}

export function cotizador(c, q, servicios, tarifas) {
  const verEstimado = c.modo_prototipo || tarifas.verificadas;
  return `${cabecera("Solicitar cotización", q.titulo, q.intro)}
<section class="sec sec-top"><div class="wrap cot">
  <div class="cot-form">${formulario(c, servicios, q)}</div>
  <aside class="cot-res" aria-labelledby="res-t"><h2 class="h3" id="res-t">Resumen de tu solicitud</h2>
    <dl id="resumen" class="resumen"><dt>Servicios</dt><dd id="res-serv">Aún no has seleccionado servicios.</dd></dl>
    <div id="res-info" hidden><h3 class="mini">Información que acelera la propuesta</h3><ul class="lista" id="res-lista"></ul></div>
    ${verEstimado ? `<div id="estimado" class="estimado" hidden>
      <h3 class="mini">Estimación referencial</h3>
      ${tarifas.verificadas ? "" : `<p class="ejemplo mono">${esc(tarifas.aviso_ejemplo)}</p>`}
      <p class="est-total" id="est-total"></p>
      <ul class="est-lineas" id="est-lineas"></ul>
      <p class="nota-sm" id="est-nota">${esc(tarifas.nota)}</p>
      <div class="est-final"><p>${esc(tarifas.mensaje_final)}</p><button type="button" class="btn btn-sm" id="est-enviar">Quiero la cotización detallada</button></div>
    </div>` : `<p class="nota-sm">Cada propuesta se define según alcance, entregables y plazo. Envía tu solicitud y te respondemos con el valor.</p>`}
  </aside>
</div><script type="application/json" id="info-servicio">${JSON.stringify(q.info_por_servicio)}</script>${verEstimado ? `<script type="application/json" id="tarifas">${JSON.stringify({ demo: !tarifas.verificadas, moneda: tarifas.moneda, redondeo: tarifas.redondeo, rango: tarifas.rango, factor_tipo: tarifas.factor_tipo, servicios: tarifas.servicios })}</script>` : ""}</section>`;
}

export function contacto(c, servicios, q) {
  const wa = waLink(c, "Hola, quiero información sobre sus servicios.");
  return `${cabecera("Contacto", "Escríbenos.", "Cuéntanos qué necesitas. Respondemos con una propuesta o con las preguntas necesarias para hacerla.")}
<section class="sec sec-top"><div class="wrap cot">
  <div class="cot-form">${formulario(c, servicios, null)}</div>
  <aside class="cot-res"><h2 class="h3">Datos de contacto</h2>
    <dl class="datos">
      <div><dt>Ubicación</dt><dd>${esc(c.ubicacion.municipio)}, ${esc(c.ubicacion.departamento)}, ${esc(c.ubicacion.pais)}</dd></div>
      <div><dt>Cobertura</dt><dd>${esc(c.ubicacion.cobertura)}</dd></div>
      ${c.contacto.correo ? `<div><dt>Correo</dt><dd><a href="mailto:${esc(c.contacto.correo)}">${esc(c.contacto.correo)}</a></dd></div>` : (c.modo_prototipo ? `<div><dt>Correo</dt><dd class="pend">Por definir</dd></div>` : "")}
      ${wa ? `<div><dt>WhatsApp</dt><dd><a href="${esc(wa)}" target="_blank" rel="noopener">Escribir por WhatsApp</a></dd></div>` : (c.modo_prototipo ? `<div><dt>WhatsApp</dt><dd class="pend">Por definir</dd></div>` : "")}
      ${c.contacto.telefono ? `<div><dt>Teléfono</dt><dd>${esc(c.contacto.telefono)}</dd></div>` : ""}
      ${c.contacto.horario ? `<div><dt>Horario</dt><dd>${esc(c.contacto.horario)}</dd></div>` : ""}
    </dl>
    <p class="nota-sm">¿Ya sabes qué servicios necesitas? Usa el <a href="/cotizador/">formulario de cotización</a>.</p>
  </aside>
</div></section>`;
}

export function privacidad(c) {
  return `${cabecera("Privacidad", "Política de tratamiento de datos.")}
<section class="sec sec-top"><div class="wrap prosa">
${c.modo_prototipo ? `<aside class="aviso" role="note"><p class="mono aviso-t">Borrador</p><p>Este texto es una base. Debe ser revisado por un profesional del derecho antes de publicar el sitio.</p></aside>` : ""}
<h2 class="h3">Responsable</h2><p>${esc(c.nombre)}, con sede en ${esc(c.ubicacion.municipio)}, ${esc(c.ubicacion.departamento)}, ${esc(c.ubicacion.pais)}. Razón social, identificación y canal de contacto para ejercer tus derechos: por definir.</p>
<h2 class="h3">Datos que recolectamos</h2><p>Los que ingresas en los formularios: nombre, correo, teléfono, datos del proyecto y el mensaje.</p>
<h2 class="h3">Para qué los usamos</h2><p>Para responder tu solicitud y preparar una propuesta. No vendemos tus datos.</p>
<h2 class="h3">Tus derechos</h2><p>Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, conforme a la Ley 1581 de 2012 y sus normas reglamentarias.</p>
<h2 class="h3">Servicios de terceros</h2><p>El sitio usa un proveedor de correo para entregar tus mensajes y Google Fonts para las tipografías.</p>
</div></section>`;
}

export function noEncontrada(c) {
  return `${cabecera("Error 404", "No encontramos esa página.", "Puede que el enlace haya cambiado.")}
<section class="sec sec-top"><div class="wrap"><p><a class="btn" href="/">Volver al inicio</a></p></div></section>`;
}
