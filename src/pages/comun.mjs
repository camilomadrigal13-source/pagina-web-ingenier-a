// Fragmentos que usan varias páginas: encabezado interno, bloque de captura y formulario.
import { esc, existe } from "../lib.mjs";
import { trama } from "../svg.mjs";

export const cabecera = (eyebrow, titulo, texto = "") => `<section class="cab"><div class="wrap cab-in">
  <div class="cab-txt"><p class="eyebrow">${esc(eyebrow)}</p><h1 class="h1">${esc(titulo)}</h1>${texto ? `<p class="lead">${esc(texto)}</p>` : ""}</div>
  ${trama()}
</div></section>`;

export const migaHtml = (items) => `<nav class="miga" aria-label="Ruta"><ol>${items.map((m, i) => `<li>${m.ruta ? `<a href="${m.ruta}">${esc(m.nombre)}</a>` : `<span aria-current="page">${esc(m.nombre)}</span>`}</li>`).join("")}</ol></nav>`;

/** Espacio para imagen real. Si hay archivo lo muestra; si no, deja un marcador editable. */
/** <picture> con WebP (800 y 1400 px) si existen; si no, la imagen tal cual. */
export function foto(imagen, alt, { ancho = 800, alto = 600, prioridad = false, sizes = "(max-width:700px) 92vw, 400px" } = {}) {
  const atr = prioridad ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  const img = `<img src="${esc(imagen)}" alt="${esc(alt)}" width="${ancho}" height="${alto}" ${atr}>`;
  const base = imagen.replace(/\.jpe?g$/i, "");
  if (base === imagen || !existe(`public${base}.webp`)) return img;
  const chica = existe(`public${base}-800.webp`);
  return `<picture><source type="image/webp" srcset="${chica ? `${esc(base)}-800.webp 800w, ` : ""}${esc(base)}.webp 1400w" sizes="${sizes}">${img}</picture>`;
}

/** Espacio para imagen real. Si hay archivo lo muestra; si no, deja un marcador editable. */
export function ranura(titulo, imagen = "", c, ancho = 4, alto = 3, leyenda = true, alt = "") {
  if (imagen) return `<figure class="ranura con-img">${foto(imagen, alt || titulo, { ancho: ancho * 200, alto: alto * 200 })}${leyenda ? `<figcaption>${esc(titulo)}</figcaption>` : ""}</figure>`;
  if (!c.modo_prototipo) return ""; // en producción no se publican espacios vacíos
  const nota = "Espacio para imagen real";
  return `<figure class="ranura" style="--r:${ancho}/${alto}"><div class="ranura-in"><span class="mono">${nota}</span></div><figcaption>${esc(titulo)}</figcaption></figure>`;
}

const campo = (id, label, control, ayuda = "") => `<div class="campo"><label for="${id}">${label}</label>${control}${ayuda ? `<p class="ayuda" id="${id}-ayuda">${ayuda}</p>` : ""}<p class="error" id="${id}-error" role="alert" hidden></p></div>`;
const opciones = (arr, vacio) => `${vacio ? `<option value="">${vacio}</option>` : ""}${arr.map((o) => `<option>${esc(o)}</option>`).join("")}`;

/** Formulario de contacto o cotización. Se envía por fetch a la función serverless. */
export function formulario(c, servicios, cot = null, tarifas = null) {
  const esCot = !!cot;
  const paso = (n, t) => `<p class="paso-f"><span class="mono">${n}</span>${t}</p>`;
  const etiqueta = (u, b) => { const t = tarifas && tarifas.servicios[`${u.id}: ${b.nombre}`]; return t ? `<small class="tag-est mono">${t.modo === "m2" ? "estimable" : "a cotizar"}</small>` : ""; };
  const idf = esCot ? "cotizar" : "contacto";
  const unidadesOpc = [...servicios.map((u) => `${u.id}. ${u.nombre}`), "Varias unidades", "No estoy seguro"];
  const bloque1 = campo(`${idf}-nombre`, "Nombre completo", `<input id="${idf}-nombre" name="nombre" type="text" autocomplete="name" required maxlength="120">`)
    + `<div class="fila">${campo(`${idf}-correo`, "Correo electrónico", `<input id="${idf}-correo" name="correo" type="email" autocomplete="email" maxlength="160" inputmode="email">`, "Con tu correo o tu teléfono basta.")}${campo(`${idf}-tel`, "Teléfono o WhatsApp", `<input id="${idf}-tel" name="telefono" type="tel" autocomplete="tel" maxlength="30" inputmode="tel">`)}</div>`;
  const cotProyecto = esCot ? `
    <div class="fila">
      ${campo("cot-tipo", "Tipo de proyecto", `<select id="cot-tipo" name="tipo_proyecto" required>${opciones(cot.tipos_proyecto, "Selecciona")}</select>`)}
      ${campo("cot-ubic", "Ubicación", `<select id="cot-ubic" name="ubicacion" required>${opciones(cot.ubicaciones, "Selecciona")}</select>`)}
    </div>
    <div class="fila">
      ${campo("cot-area", "Área aproximada en m² (si aplica)", `<input id="cot-area" name="area_m2" type="number" min="1" max="1000000" step="1" inputmode="numeric">`, "Puedes dejarlo vacío si no aplica.")}
      ${campo("cot-nivel", "Nivel de desarrollo del proyecto", `<select id="cot-nivel" name="nivel" required>${opciones(cot.niveles.map((n) => n.texto), "Selecciona")}</select>`)}
    </div>` : "";
  const cotServicios = esCot ? `
    <fieldset class="grupo" id="cot-servicios"><legend class="sr">Servicios que necesitas</legend>
      ${servicios.map((u) => `<div class="grupo-u"><p class="grupo-t"><span class="mono">${u.id}</span> ${esc(u.corto)}</p><div class="checks">${u.bloques.map((b, i) => `<label class="chk"><input type="checkbox" name="servicios" value="${esc(u.id)}: ${esc(b.nombre)}" data-u="${u.id}"><span>${esc(b.nombre)}${etiqueta(u, b)}</span></label>`).join("")}</div></div>`).join("")}
      <p class="error" id="cot-servicios-error" role="alert" hidden></p>
    </fieldset>` : "";
  const cotCampos = esCot ? "" : campo("contacto-servicio", "Servicio de interés", `<select id="contacto-servicio" name="servicio" required>${opciones(unidadesOpc, "Selecciona")}</select>`);
  const msg = campo(`${idf}-msg`, esCot ? "Describe tu proyecto o necesidad" : "Cuéntanos tu proyecto", `<textarea id="${idf}-msg" name="mensaje" rows="5" required minlength="15" maxlength="4000" placeholder="Qué necesitas, dónde, en qué estado está y para cuándo."></textarea>`);
  const pref = campo(`${idf}-pref`, "¿Cómo prefieres que te contactemos?", `<select id="${idf}-pref" name="contacto_preferido" required>${opciones(esCot ? cot.contacto_preferido : ["Correo electrónico", "WhatsApp", "Llamada"], "Selecciona")}</select>`);
  return `<form class="form" id="form-${idf}" data-form="${idf}" novalidate>
    <input type="hidden" name="origen" value="${idf}">${esCot ? '<input type="hidden" name="estimacion" id="cot-estimacion">' : ""}
    <div class="hp" aria-hidden="true"><label>No llenar este campo<input type="text" name="sitio_web" tabindex="-1" autocomplete="off"></label></div>
    ${esCot
      ? `${paso(1, "Tu proyecto")}${cotProyecto}${paso(2, "Servicios que necesitas")}<p class="ayuda">Marca todos los que apliquen. También puedes pedir uno solo.</p>${cotServicios}${paso(3, "Tus datos")}${bloque1}${paso(4, "Cuéntanos más")}${msg}${pref}`
      : `${bloque1}${cotCampos}${msg}${pref}`}
    <div class="campo chk-uno"><label class="chk"><input type="checkbox" name="acepto" id="${idf}-acepto" required><span>Autorizo el tratamiento de mis datos para responder esta solicitud, según la <a href="/privacidad/" target="_blank" rel="noopener">política de privacidad</a>.</span></label><p class="error" id="${idf}-acepto-error" role="alert" hidden></p></div>
    ${c.turnstile ? `<div class="cf-turnstile" data-sitekey="${esc(c.turnstile)}" data-language="es" data-theme="auto"></div>` : ""}
    <div class="form-acc">
      <button class="btn" type="submit"><span class="btn-t">${esCot ? "Enviar solicitud" : "Enviar mensaje"}</span><span class="btn-c" hidden>Enviando…</span></button>
      ${c.waNumero ? `<button class="btn btn-borde" type="button" data-wa-form>Enviar por WhatsApp</button>` : ""}
    </div>
    <div class="estado" id="${idf}-estado" role="status" aria-live="polite" tabindex="-1" hidden></div>
  </form>`;
}
