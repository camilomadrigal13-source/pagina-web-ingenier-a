// Diagramas propios (SVG). Todos usan variables CSS para funcionar en claro y oscuro.

export const marca = () => `<svg class="marca" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <rect x="3.5" y="3.5" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M3.5 16h25M16 3.5v25" stroke="currentColor" stroke-width="1" opacity=".55"/>
  <path d="M3.5 22.5v6h6" fill="none" stroke="var(--tec)" stroke-width="1.8"/>
</svg>`;

/** Alzado arquitectónico con ejes, cotas y retícula: imagen principal de la portada. */
export function hero() {
  const ejes = [90, 200, 310, 420];
  const pisos = [330, 250, 170, 90];
  const ejeTxt = ["A", "B", "C", "D"];
  return `<svg class="dib dib-hero" viewBox="0 0 560 420" role="img" aria-label="Alzado de un edificio con ejes y cotas">
  <defs>
    <pattern id="ret" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="var(--linea)" stroke-width=".5"/></pattern>
    <linearGradient id="vid" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="var(--arena)" stop-opacity=".35"/><stop offset="1" stop-color="var(--arena)" stop-opacity=".08"/></linearGradient>
  </defs>
  <rect width="560" height="420" fill="url(#ret)" opacity=".8"/>
  <!-- terreno -->
  <path class="t" d="M20 346H540" stroke="var(--tinta)" stroke-width="2"/>
  <path d="M30 346l-8 8M60 346l-8 8M90 346l-8 8M120 346l-8 8M150 346l-8 8M180 346l-8 8M210 346l-8 8M240 346l-8 8M270 346l-8 8M300 346l-8 8M330 346l-8 8M360 346l-8 8M390 346l-8 8M420 346l-8 8M450 346l-8 8M480 346l-8 8M510 346l-8 8" stroke="var(--tenue)" stroke-width=".8"/>
  <!-- volumen principal -->
  <rect class="ed" x="90" y="74" width="330" height="272" fill="url(#vid)" stroke="var(--tinta)" stroke-width="1.6"/>
  <!-- placas -->
  ${pisos.map((y) => `<path d="M82 ${y}H428" stroke="var(--tinta)" stroke-width="3" class="plc"/>`).join("")}
  <!-- columnas -->
  ${ejes.map((x) => `<path d="M${x} 74V346" stroke="var(--tinta)" stroke-width="5" class="col"/>`).join("")}
  <!-- ventanería -->
  ${[0, 1, 2].map((i) => [0, 1, 2].map((j) => `<rect x="${106 + j * 110}" y="${100 + i * 80}" width="82" height="${i === 2 ? 56 : 52}" fill="none" stroke="var(--tenue)" stroke-width="1"/><path d="M${106 + j * 110 + 41} ${100 + i * 80}v${i === 2 ? 56 : 52}" stroke="var(--tenue)" stroke-width=".8"/>`).join("")).join("")}
  <!-- voladizo y planta baja -->
  <rect x="420" y="250" width="100" height="14" fill="var(--bg)" stroke="var(--tinta)" stroke-width="1.6"/>
  <rect x="150" y="286" width="100" height="60" fill="none" stroke="var(--tinta)" stroke-width="1.2"/>
  <path d="M200 286V346" stroke="var(--tenue)" stroke-width=".8"/>
  <!-- ejes -->
  ${ejes.map((x, i) => `<g class="eje"><path d="M${x} 56V386" stroke="var(--tec)" stroke-width=".8" stroke-dasharray="10 3 2 3"/><circle cx="${x}" cy="40" r="12" fill="var(--bg)" stroke="var(--tec)" stroke-width="1"/><text x="${x}" y="44" text-anchor="middle" class="d-txt">${ejeTxt[i]}</text></g>`).join("")}
  <!-- cotas horizontales -->
  <g class="cota" stroke="var(--tec)" stroke-width="1" fill="none">
    <path d="M90 392H420M90 386v12M200 386v12M310 386v12M420 386v12"/>
  </g>
  <text class="d-txt" x="145" y="410" text-anchor="middle">4.50</text>
  <text class="d-txt" x="255" y="410" text-anchor="middle">4.50</text>
  <text class="d-txt" x="365" y="410" text-anchor="middle">4.50</text>
  <!-- cotas verticales -->
  <g class="cota" stroke="var(--tec)" stroke-width="1" fill="none">
    <path d="M52 90V346M46 90h12M46 170h12M46 250h12M46 346h12"/>
  </g>
  <text class="d-txt" x="44" y="132" text-anchor="middle" transform="rotate(-90 44 132)">3.20</text>
  <text class="d-txt" x="44" y="212" text-anchor="middle" transform="rotate(-90 44 212)">3.20</text>
  <text class="d-txt" x="44" y="298" text-anchor="middle" transform="rotate(-90 44 298)">3.20</text>
  <text class="d-lbl" x="440" y="82">ALZADO · EJES A–D</text>
  <text class="d-lbl" x="440" y="96">ESC. 1:100 · ILUSTRATIVO</text>
</svg>`;
}

/** Sección de viga con refuerzo, para la página de tecnología. */
export function vigaDetalle() {
  const est = (x1, x2, paso) => { let s = ""; for (let x = x1; x <= x2; x += paso) s += `M${x} 74v92`; return s; };
  return `<svg class="dib" viewBox="0 0 520 260" role="img" aria-label="Esquema de viga con estribos más juntos junto a los apoyos">
  <rect x="24" y="70" width="472" height="100" fill="none" stroke="var(--tinta)" stroke-width="1.6"/>
  <rect x="24" y="40" width="28" height="160" fill="var(--bg)" stroke="var(--tinta)" stroke-width="1.6"/>
  <rect x="468" y="40" width="28" height="160" fill="var(--bg)" stroke="var(--tinta)" stroke-width="1.6"/>
  <path d="M34 82H486M34 158H486" stroke="var(--tec)" stroke-width="2.6"/>
  <path d="${est(66, 150, 12)}${est(370, 454, 12)}" stroke="var(--tec)" stroke-width="1.2"/>
  <path d="${est(180, 340, 32)}" stroke="var(--tenue)" stroke-width="1.2"/>
  <path d="M66 212H150M66 206v12M150 206v12" stroke="var(--tec)" stroke-width="1" fill="none"/>
  <path d="M370 212H454M370 206v12M454 206v12" stroke="var(--tec)" stroke-width="1" fill="none"/>
  <text class="d-txt" x="108" y="232" text-anchor="middle">zona de confinamiento</text>
  <text class="d-txt" x="412" y="232" text-anchor="middle">zona de confinamiento</text>
  <text class="d-lbl" x="260" y="232" text-anchor="middle">zona central</text>
  <text class="d-lbl" x="24" y="22">ESQUEMA ILUSTRATIVO · NO ES UN PLANO DE PROYECTO</text>
</svg>`;
}

/** Flujo de cinco pasos de la sección de tecnología. */
export function flujo() {
  const nom = ["Entrada", "Proceso", "Detalle", "Revisión", "Salida"];
  const x = (i) => 50 + i * 115;
  return `<svg class="dib dib-flujo" viewBox="0 0 640 90" role="img" aria-label="Cinco pasos: entrada, proceso, detalle, revisión y salida">
  <path d="M50 34H625" stroke="var(--tec)" stroke-width="1.2"/>
  ${nom.map((n, i) => `<circle cx="${x(i)}" cy="34" r="9" fill="var(--bg)" stroke="var(--tec)" stroke-width="1.4"/><text class="d-txt" x="${x(i)}" y="38" text-anchor="middle">${i + 1}</text><text class="d-lbl" x="${x(i)}" y="70" text-anchor="middle">${n}</text>`).join("")}
</svg>`;
}

/** Estructura de expediente: identidad visual de la unidad D. */
export function expediente() {
  return `<svg class="dib" viewBox="0 0 520 300" role="img" aria-label="Esquema de organización documental en niveles">
  <g stroke="var(--tinta)" stroke-width="1.4" fill="none">
    <rect x="20" y="20" width="150" height="38"/><rect x="60" y="86" width="150" height="38"/><rect x="60" y="152" width="150" height="38"/>
    <rect x="100" y="218" width="150" height="38"/><rect x="300" y="86" width="190" height="38"/><rect x="300" y="152" width="190" height="38"/><rect x="300" y="218" width="190" height="38"/>
  </g>
  <path d="M40 58V105H60M40 105V171H60M80 190V237H100" stroke="var(--tec)" stroke-width="1.2" fill="none"/>
  <path d="M210 105H300M210 171H300M250 237H300" stroke="var(--tec)" stroke-width="1.2" stroke-dasharray="4 3" fill="none"/>
  <text class="d-lbl" x="95" y="43" text-anchor="middle">Archivo</text>
  <text class="d-lbl" x="135" y="109" text-anchor="middle">Serie</text>
  <text class="d-lbl" x="135" y="175" text-anchor="middle">Expediente</text>
  <text class="d-lbl" x="175" y="241" text-anchor="middle">Documento</text>
  <text class="d-txt" x="395" y="109" text-anchor="middle">código · fecha · versión</text>
  <text class="d-txt" x="395" y="175" text-anchor="middle">índice de búsqueda</text>
  <text class="d-txt" x="395" y="241" text-anchor="middle">inventario</text>
</svg>`;
}

/** Plano parcial de planta con retícula: trama decorativa del encabezado de las páginas internas. */
export function trama() {
  return `<svg class="trama" viewBox="0 0 400 200" aria-hidden="true" focusable="false">
  <g stroke="var(--tenue)" stroke-width=".8" fill="none">
    <path d="M0 40H400M0 100H400M0 160H400M60 0V200M170 0V200M280 0V200M370 0V200"/>
    <circle cx="60" cy="40" r="3"/><circle cx="170" cy="40" r="3"/><circle cx="280" cy="40" r="3"/><circle cx="370" cy="40" r="3"/>
    <circle cx="60" cy="100" r="3"/><circle cx="170" cy="100" r="3"/><circle cx="280" cy="100" r="3"/><circle cx="370" cy="100" r="3"/>
  </g>
  <g stroke="var(--tec)" stroke-width="1" fill="none"><path d="M60 178H170M60 172v12M170 172v12"/></g>
  <text class="d-txt" x="115" y="196" text-anchor="middle">5.50</text>
</svg>`;
}
