// Plantilla común: <head> con SEO, encabezado, pie y datos estructurados.
import { esc } from "./lib.mjs";
import { marca } from "./svg.mjs";

const FUENTES = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap";

export const NAV = [
  { href: "/nosotros/", texto: "Nosotros" },
  { href: "/servicios/", texto: "Servicios" },
  { href: "/tecnologia/", texto: "Tecnología" },
  { href: "/proyectos/", texto: "Proyectos" },
  { href: "/proceso/", texto: "Proceso" },
  { href: "/contacto/", texto: "Contacto" }
];

export const waLink = (c, texto = "") =>
  c.waNumero ? `https://wa.me/${c.waNumero}${texto ? `?text=${encodeURIComponent(texto)}` : ""}` : "";

export function logo(c) {
  const img = c.logo ? `<img src="${esc(c.logo)}" alt="" width="28" height="28">` : marca();
  return `<a class="logo" href="/" aria-label="${esc(c.nombre)}, inicio">${img}<span>${esc(c.nombre)}</span></a>`;
}

function jsonLd(c, servicios) {
  const dir = { "@type": "PostalAddress", addressLocality: c.ubicacion.municipio, addressRegion: c.ubicacion.departamento, addressCountry: "CO" };
  const org = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${c.url}/#organizacion`,
    name: c.nombre,
    description: c.descriptor,
    url: c.url,
    image: `${c.url}${c.imagenes.og}`,
    address: dir,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Valle de Aburrá" },
      { "@type": "AdministrativeArea", name: "Antioquia" },
      { "@type": "Country", name: "Colombia" }
    ],
    knowsAbout: servicios.map((u) => u.nombre),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: servicios.map((u) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: u.nombre, description: u.resumen } }))
    }
  };
  if (c.contacto.correo) org.email = c.contacto.correo;
  if (c.contacto.telefono) org.telephone = c.contacto.telefono;
  const redes = Object.values(c.redes).filter(Boolean);
  if (redes.length) org.sameAs = redes;
  return org;
}

export function pagina(c, { ruta, titulo, descripcion, cuerpo, servicios, migas = [], bodyClass = "", home = false, extraLd = [] }) {
  const tituloCompleto = home ? `${titulo} | ${c.nombre}` : `${titulo} | ${c.nombre}`;
  const canon = `${c.url}${ruta}`;
  const og = `${c.url}${c.imagenes.og}`;
  const ld = [jsonLd(c, servicios), { "@context": "https://schema.org", "@type": "WebSite", name: c.nombre, url: c.url, inLanguage: "es-CO" }, ...extraLd];
  if (migas.length) {
    ld.push({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [{ nombre: "Inicio", ruta: "/" }, ...migas].map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: `${c.url}${m.ruta}` }))
    });
  }
  const nav = NAV.map((n) => `<li><a href="${n.href}"${ruta.startsWith(n.href) ? ' aria-current="page"' : ""}>${n.texto}</a></li>`).join("");
  const banner = c.modo_prototipo
    ? `<div class="proto" role="note">Prototipo en revisión. El nombre, los datos de contacto, los proyectos y las imágenes son provisionales.</div>` : "";
  const wa = waLink(c, `Hola, quiero información sobre sus servicios.`);
  return `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${esc(canon)}">
<meta name="theme-color" content="#263B42">
${c.modo_prototipo ? '<meta name="robots" content="noindex,nofollow">' : ""}
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CO">
<meta property="og:site_name" content="${esc(c.nombre)}">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${esc(canon)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FUENTES}">
<script src="/assets/theme.js"></script>
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="${bodyClass}" data-wa="${esc(c.waNumero)}" data-endpoint="${esc(c.formulario.endpoint)}">
<a class="salto" href="#contenido">Saltar al contenido</a>
${banner}
<header class="enc">
  <div class="wrap enc-in">
    ${logo(c)}
    <nav id="menu" class="nav" aria-label="Principal"><ul>${nav}</ul></nav>
    <div class="enc-acc">
      <button class="icono" id="tema" type="button" aria-label="Cambiar entre modo claro y oscuro" aria-pressed="false">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <a class="btn btn-sm" href="/cotizador/">Solicitar cotización</a>
      <button class="icono menu-btn" id="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>
</header>
<main id="contenido">
${cuerpo}
</main>
<footer class="pie">
  <div class="wrap pie-grid">
    <div>
      ${logo(c)}
      <p class="pie-desc">${esc(c.descriptor)}.</p>
      <p class="mono pie-loc">${esc(c.ubicacion.municipio)}, ${esc(c.ubicacion.departamento)} · ${esc(c.ubicacion.pais)}</p>
    </div>
    <nav aria-label="Servicios"><h2 class="pie-t">Servicios</h2><ul>
      ${servicios.map((u) => `<li><a href="/servicios/${u.slug}/">${esc(u.corto)}</a></li>`).join("")}
    </ul></nav>
    <nav aria-label="Firma"><h2 class="pie-t">Firma</h2><ul>
      <li><a href="/nosotros/">Nosotros</a></li><li><a href="/tecnologia/">Tecnología</a></li><li><a href="/proyectos/">Proyectos</a></li><li><a href="/proceso/">Proceso</a></li><li><a href="/privacidad/">Privacidad</a></li>
    </ul></nav>
    <div><h2 class="pie-t">Contacto</h2><ul>
      <li><a href="/cotizador/">Solicitar cotización</a></li>
      <li><a href="/contacto/">Escríbenos</a></li>
      ${wa ? `<li><a href="${esc(wa)}" rel="noopener" target="_blank">WhatsApp</a></li>` : ""}
      ${c.contacto.correo ? `<li><a href="mailto:${esc(c.contacto.correo)}">${esc(c.contacto.correo)}</a></li>` : ""}
      ${Object.entries(c.redes).filter(([, v]) => v).map(([k, v]) => `<li><a href="${esc(v)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a></li>`).join("")}
    </ul></div>
  </div>
  <div class="wrap pie-base mono"><span>© ${new Date().getFullYear()} ${esc(c.nombre)}</span><span>Las decisiones de ingeniería las valida y firma el profesional competente.</span></div>
</footer>
${wa ? `<a class="wa-flot" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 8.6c.2-.5.5-.5.8-.5s.4.4.6.9c.1.3-.1.5-.3.8-.2.2-.3.4-.1.7.5.9 1.4 1.7 2.4 2.1.3.1.5 0 .7-.2.2-.3.4-.5.7-.4l1.1.5c.3.2.4.3.3.6-.2.9-1.1 1.4-2 1.3-2.7-.4-5.2-2.7-5.8-5.2-.1-.4 0-.8.2-1.1Z" fill="currentColor"/></svg><span>WhatsApp</span></a>` : ""}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

/** Bloque de llamada a la acción reutilizable. */
export function cta(c, titulo, texto, extra = "") {
  const wa = waLink(c, "Hola, quiero cotizar un proyecto.");
  return `<section class="cta-banda"><div class="wrap cta-in">
    <div><h2 class="h2">${esc(titulo)}</h2><p>${esc(texto)}</p></div>
    <div class="cta-btns"><a class="btn btn-claro" href="/cotizador/${extra}">Solicitar cotización</a>${wa ? `<a class="btn btn-borde" href="${esc(wa)}" target="_blank" rel="noopener">Escribir por WhatsApp</a>` : `<a class="btn btn-borde" href="/contacto/">Contacto</a>`}</div>
  </div></section>`;
}
