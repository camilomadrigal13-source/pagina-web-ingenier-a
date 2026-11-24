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
  return `${cabecera("Proyectos y portafolio", p.titulo, p.proyectos.some((x) => x.ilustrativo) || !p.intro_real ? p.intro : p.intro_real)}
<section class="sec sec-top"><div class="wrap">
<div class="filtros" role="group" aria-label="Filtrar proyectos por área">
  <button type="button" class="filtro" data-filtro="todos" aria-pressed="true">Todos</button>
  ${p.categorias.map((x) => `<button type="button" class="filtro" data-filtro="${x.id}" aria-pressed="false">${esc(x.nombre)}</button>`).join("")}
</div>
<p class="mono filtros-n" id="filtros-n" role="status" aria-live="polite">${p.proyectos.length} ${p.proyectos.length === 1 ? "proyecto" : "proyectos"}</p>
<ul class="proy" id="proy">${p.proyectos.map((x) => `<li class="proy-i" data-cat="${x.categorias.join(" ")}">
  <button type="button" class="proy-b" data-abrir="${esc(x.id)}" aria-haspopup="dialog">
    ${ranura(x.nombre, x.imagenes[0] || "", c, 4, 3, false)}
    <span class="proy-m"><span class="mono proy-c">${x.categorias.map((k) => esc(nom[k])).join(" · ")}</span><span class="proy-n">${esc(x.nombre)}</span>${x.ilustrativo ? `<span class="etq-ilus mono">Caso ilustrativo</span>` : ""}</span>
  </button></li>`).join("")}</ul>
</div></section>
${p.proyectos.map((x) => `<dialog class="modal" id="m-${esc(x.id)}" aria-labelledby="m-${esc(x.id)}-t">
  <div class="modal-in"><button class="modal-x" type="button" data-cerrar aria-label="Cerrar">×</button>
  <p class="mono">${x.ilustrativo ? "Caso ilustrativo · no corresponde a una obra real" : esc(x.ubicacion || "Ubicación por definir")}</p>
  <h2 class="h2" id="m-${esc(x.id)}-t">${esc(x.nombre)}</h2><p class="lead">${esc(x.descripcion)}</p>
  <div class="modal-g">${(x.imagenes.length ? x.imagenes : ["", ""]).map((im, i) => ranura(`${x.nombre}, fotografía ${i + 1}`, im, c, 4, 3, false)).join("")}${x.planos.map((im, i) => ranura(`${x.nombre}, plano ${i + 1}`, im, c, 4, 3, false)).join("")}</div>
  <dl class="modal-d"><div><dt>Alcance</dt><dd>${x.alcance.map(esc).join(" · ")}</dd></div><div><dt>Resultados</dt><dd>${esc(x.resultados || "Por documentar")}</dd></div></dl>
  <a class="btn btn-sm" href="/cotizador/?u=${esc(x.servicios[0] || "")}">Solicitar algo similar</a></div></dialog>`).join("")}
${cta(c, "¿Tu proyecto puede ser el próximo?", "Cuéntanos qué necesitas.")}`;
}

export function cotizador(c, q, servicios, tarifas) {
  const verEstimado = c.modo_prototipo || tarifas.verificadas;
  return `${cabecera("Solicitar cotización", q.titulo, verEstimado ? q.intro : (q.intro_sin_estimado || q.intro))}
<section class="sec sec-top"><div class="wrap cot">
  <div class="cot-form">${formulario(c, servicios, q, verEstimado ? tarifas : null)}</div>
  <aside class="cot-res" id="panel-cot" aria-labelledby="res-t"><h2 class="h3" id="res-t">Tu cotización</h2>
    ${verEstimado ? `<p class="est-vacio nota-sm" id="est-vacio">Marca servicios y completa el área para ver tu estimado.</p>
    <div id="estimado" class="estimado" hidden>
      <p class="est-etq mono">${esc(tarifas.etiqueta)}</p>
      <p class="nota-sm">${esc(tarifas.intro_preliminar)}</p>
      <p class="est-total" id="est-total"></p>
      <ul class="est-lineas" id="est-lineas"></ul>
      <p class="nota-sm" id="est-nota">${esc(tarifas.nota)}</p>
      <div class="est-final"><h3 class="est-final-t">${esc(tarifas.final_titulo)}</h3><p>${esc(tarifas.mensaje_final)}</p>
        <div class="est-final-b"><button type="button" class="btn btn-sm" id="est-enviar">${esc(tarifas.boton_final)}</button>${c.waNumero ? `<a class="btn btn-sm btn-borde" href="${esc(waLink(c, "Hola, vi la cotización preliminar y quiero una cotización más ajustada."))}" target="_blank" rel="noopener">Escribir por WhatsApp</a>` : ""}</div></div>
      ${tarifas.verificadas ? "" : `<p class="ejemplo mono">${esc(tarifas.aviso_ejemplo)}</p>`}
    </div>` : `<p class="nota-sm">Cada propuesta se define según alcance, entregables y plazo. Envía tu solicitud y te respondemos con el valor. Cualquier referencia del sitio es preliminar y no vinculante: el valor final se define en la propuesta. Si quieres una cotización más ajustada, escríbenos.</p>`}
    <dl id="resumen" class="resumen" hidden><dt>Servicios elegidos</dt><dd id="res-serv"></dd></dl>
    <div id="res-info" hidden><h3 class="mini">Información que acelera la propuesta</h3><ul class="lista" id="res-lista"></ul></div>
  </aside>
  ${verEstimado ? `<a class="est-barra" id="est-barra" href="#panel-cot" hidden><span class="mono">Tu estimado</span><strong id="est-barra-t"></strong></a>` : ""}
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
  const l = c.legal || {};
  const wa = waLink(c);
  const canal = c.contacto.correo
    ? `el correo <a href="mailto:${esc(c.contacto.correo)}">${esc(c.contacto.correo)}</a>${wa ? ` o por <a href="${esc(wa)}" rel="noopener" target="_blank">WhatsApp</a>` : ""}`
    : wa ? `<a href="${esc(wa)}" rel="noopener" target="_blank">WhatsApp</a> (+${esc(c.waNumero)})` : "el formulario de <a href=\"/contacto/\">contacto</a>";
  const ident = [l.razon_social || c.nombre, l.documento ? `identificación ${esc(l.documento)}` : "", l.direccion ? esc(l.direccion) : `${esc(c.ubicacion.municipio)}, ${esc(c.ubicacion.departamento)}, ${esc(c.ubicacion.pais)}`].filter(Boolean).join(", ");
  const pend = (t) => (c.modo_prototipo ? ` <span class="pend">[${t}]</span>` : "");
  return `${cabecera("Privacidad", "Política de tratamiento de datos personales.", "Cómo recibimos, usamos y protegemos los datos que nos envías.")}
<section class="sec sec-top"><div class="wrap prosa">
${c.modo_prototipo ? `<aside class="aviso" role="note"><p class="mono aviso-t">Borrador</p><p>Este texto es una base. Debe ser revisado por un profesional del derecho antes de publicar el sitio. Los datos entre corchetes se completan con la información real de la firma.</p></aside>` : ""}
<p class="nota-sm">Esta política se adopta conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas aplicables en Colombia.</p>
<h2 class="h3">1. Responsable del tratamiento</h2>
<p>${ident}.${pend("razón social e identificación por completar")} Canal para consultas, reclamos y ejercicio de tus derechos: ${canal}.</p>
<h2 class="h3">2. Datos que recolectamos</h2>
<p>Solo los que tú ingresas en los formularios del sitio o nos envías por WhatsApp: nombre, correo electrónico, teléfono, medio de contacto preferido, datos del proyecto (tipo, ubicación, área, estado) y el mensaje. No pedimos datos sensibles ni de menores de edad; te pedimos no incluirlos.</p>
<h2 class="h3">3. Finalidades</h2>
<ul class="lista">
<li>Responder tu solicitud de información o de cotización.</li>
<li>Preparar y enviarte propuestas técnicas y económicas.</li>
<li>Contactarte por el medio que indicaste para dar seguimiento a tu solicitud.</li>
<li>Llevar un registro interno de las solicitudes recibidas.</li>
</ul>
<p>No vendemos ni cedemos tus datos para publicidad de terceros. No te enviaremos comunicaciones comerciales no relacionadas con tu solicitud sin tu autorización.</p>
<h2 class="h3">4. Autorización</h2>
<p>Al marcar la casilla del formulario y enviarlo, nos autorizas de manera previa, expresa e informada para tratar tus datos con las finalidades descritas. Puedes revocar esta autorización en cualquier momento, salvo que exista un deber legal o contractual de conservar los datos.</p>
<h2 class="h3">5. Tus derechos</h2>
<p>Como titular puedes: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorización; ser informado del uso que les damos; presentar quejas ante la Superintendencia de Industria y Comercio; revocar la autorización y solicitar la supresión de tus datos; y acceder gratuitamente a ellos.</p>
<h2 class="h3">6. Cómo ejercer tus derechos</h2>
<p>Escríbenos por ${canal} indicando tu nombre y qué quieres hacer (consultar, corregir o eliminar tus datos). Respondemos las consultas en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, contados desde su recibo. Si necesitamos más tiempo, te avisamos el motivo y la nueva fecha.</p>
<h2 class="h3">7. Proveedores que intervienen y transferencia a otros países</h2>
<p>Para recibir y guardar tu solicitud usamos servicios de terceros que pueden procesar datos en servidores fuera de Colombia: Cloudflare (alojamiento del sitio y recepción del formulario, y, cuando está activa, su verificación antibots Turnstile), Google (hoja de cálculo donde se registra tu solicitud) y, si está activo, un proveedor de correo electrónico y un servicio de avisos por WhatsApp. Estos proveedores actúan como encargados del tratamiento y aplican sus propias medidas de seguridad. Las tipografías del sitio se alojan en el propio sitio: no se solicitan a Google.</p>
<h2 class="h3">8. Seguridad y conservación</h2>
<p>El formulario se envía por conexión cifrada y el acceso a los registros está restringido a quienes los necesitan. Conservamos tus datos mientras sea necesario para atender tu solicitud y la relación que de ella surja, y luego los eliminamos o anonimizamos, salvo obligación legal de conservarlos.</p>
<h2 class="h3">9. Cookies y analítica</h2>
<p>Este sitio no usa cookies de seguimiento ni de publicidad. Guarda en tu navegador, sin enviarla a ningún servidor, solo tu preferencia de tema claro u oscuro.${c.turnstile ? " El control antibots de Cloudflare puede usar tecnologías propias para verificar que eres una persona." : ""}</p>
<h2 class="h3">10. Vigencia y cambios</h2>
<p>Esta política rige desde su publicación. Si la modificamos de manera sustancial, lo informaremos en este sitio. Última actualización: ${new Date().toISOString().slice(0, 10)}.</p>
</div></section>`;
}

export function noEncontrada(c) {
  return `${cabecera("Error 404", "No encontramos esa página.", "Puede que el enlace haya cambiado.")}
<section class="sec sec-top"><div class="wrap"><p><a class="btn" href="/">Volver al inicio</a></p></div></section>`;
}
