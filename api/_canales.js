// Canales de salida del formulario. Cada uno devuelve true (entregado) o false, y nunca lanza.
// El archivo empieza con "_" para que Vercel no lo publique como ruta. Solo lo importa contacto.js.
//
// Variables de entorno (todas del SERVIDOR; ver docs/INTEGRACIONES.md):
//   Correo (Resend):   RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
//   Hoja de cálculo:   SHEETS_WEBHOOK_URL, SHEETS_TOKEN
//   WhatsApp:          WA_PROVIDER = "callmebot" | "meta"
//     callmebot:       CALLMEBOT_PHONE, CALLMEBOT_APIKEY
//     meta (oficial):  WA_META_TOKEN, WA_META_PHONE_ID, WA_META_TO, [WA_META_TEMPLATE, WA_META_LANG]

const TIEMPO_MS = 8000;

async function pedir(url, opciones) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIEMPO_MS);
  try { return await fetch(url, { ...opciones, signal: c.signal }); } finally { clearTimeout(t); }
}

const recortar = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function configurados(env = process.env) {
  const wa = env.WA_PROVIDER;
  return {
    correo: !!(env.RESEND_API_KEY && env.CONTACT_TO),
    hoja: !!(env.SHEETS_WEBHOOK_URL && env.SHEETS_TOKEN),
    whatsapp:
      (wa === "callmebot" && !!(env.CALLMEBOT_PHONE && env.CALLMEBOT_APIKEY)) ||
      (wa === "meta" && !!(env.WA_META_TOKEN && env.WA_META_PHONE_ID && env.WA_META_TO))
  };
}

/** Texto con toda la información de la solicitud, para WhatsApp. */
export function textoWhatsApp(d) {
  const l = [`*Nueva ${d.origen === "cotizar" ? "solicitud de cotización" : "consulta"}*`];
  const add = (k, v) => { if (v) l.push(`${k}: ${v}`); };
  add("Nombre", d.nombre); add("Correo", d.correo); add("Teléfono", d.telefono); add("Prefiere", d.contacto_preferido);
  add("Servicio", d.servicio); add("Servicios", d.servicios.join("; ")); add("Proyecto", d.tipo_proyecto);
  add("Ubicación", d.ubicacion); add("Área", d.area_m2 && `${d.area_m2} m²`); add("Nivel", d.nivel);
  l.push("", `Mensaje: ${d.mensaje}`);
  if (d.estimacion) l.push("", d.estimacion);
  return recortar(l.join("\n"), 1500);
}

export async function correo(d, { plano, html, asunto }, env = process.env) {
  try {
    const r = await pedir("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM || "Sitio web <onboarding@resend.dev>",
        to: env.CONTACT_TO.split(",").map((x) => x.trim()).filter(Boolean),
        reply_to: d.correo, subject: asunto, text: plano, html
      })
    });
    if (!r.ok) console.error("Canal correo: Resend respondió", r.status);
    return r.ok;
  } catch (e) { console.error("Canal correo falló:", e?.name); return false; }
}

/** Guarda una fila en Google Sheets mediante un Apps Script publicado como aplicación web (ver integraciones/). */
export async function hoja(d, env = process.env) {
  const fila = {
    fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota", hour12: false }),
    origen: d.origen === "cotizar" ? "Cotización" : "Contacto",
    nombre: d.nombre, correo: d.correo, telefono: d.telefono, contacto_preferido: d.contacto_preferido,
    servicio: d.servicio, servicios: d.servicios.join("; "), tipo_proyecto: d.tipo_proyecto,
    ubicacion: d.ubicacion, area_m2: d.area_m2, nivel: d.nivel, mensaje: d.mensaje, estimacion: d.estimacion
  };
  try {
    const r = await pedir(env.SHEETS_WEBHOOK_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: env.SHEETS_TOKEN, fila })
    });
    const j = r.ok ? await r.json().catch(() => null) : null;
    if (!j || j.ok !== true) console.error("Canal hoja: respuesta no válida", r.status);
    return !!(j && j.ok === true);
  } catch (e) { console.error("Canal hoja falló:", e?.name); return false; }
}

/** Aviso por WhatsApp con toda la información. */
export async function whatsapp(d, env = process.env) {
  const texto = textoWhatsApp(d);
  try {
    let r;
    if (env.WA_PROVIDER === "callmebot") {
      const q = `phone=${encodeURIComponent(env.CALLMEBOT_PHONE)}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`;
      r = await pedir(`https://api.callmebot.com/whatsapp.php?${q}`, { method: "GET" });
    } else {
      const cuerpo = env.WA_META_TEMPLATE
        ? { type: "template", template: { name: env.WA_META_TEMPLATE, language: { code: env.WA_META_LANG || "es" },
            components: [{ type: "body", parameters: [{ type: "text", text: recortar(texto.replace(/\*/g, "").replace(/\s*\n\s*/g, " | ").replace(/ {2,}/g, " "), 900) }] }] } }
        : { type: "text", text: { body: texto } }; // solo llega si el destinatario escribió al número en las últimas 24 h
      r = await pedir(`https://graph.facebook.com/v21.0/${env.WA_META_PHONE_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.WA_META_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: String(env.WA_META_TO).replace(/\D/g, ""), ...cuerpo })
      });
    }
    if (!r.ok) console.error("Canal WhatsApp: respondió", r.status);
    return r.ok;
  } catch (e) { console.error("Canal WhatsApp falló:", e?.name); return false; }
}
