// Pruebas de navegador (Playwright). Requiere el sitio en marcha: npm run build && PORT=3111 npm run dev
// Uso: BASE=http://localhost:3111 node tests/e2e.cjs [carpeta_capturas]
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3111";
const SHOTS = process.argv[2];
const WA = process.env.EXPECT_WA || ""; // número esperado si el sitio se compiló con SITE_WHATSAPP

const res = [];
const ok = (n, c, d = "") => { res.push([c, n, d]); console.log(`${c ? "OK  " : "FALLA"} ${n}${d ? " — " + d : ""}`); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_(NAME|INTERNET|TUNNEL|CONNECTION)|Failed to load resource/.test(m.text())) errores.push(m.text()); });

  // 1) Rastreo de enlaces internos
  const vistos = new Set(["/"]), cola = ["/"], rotos = [];
  while (cola.length) {
    const r = cola.shift();
    const resp = await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
    if (!resp || resp.status() !== 200) { rotos.push(r + " → " + (resp && resp.status())); continue; }
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hrefs) {
      if (!h || h.startsWith("#") || /^(https?:|mailto:|tel:)/.test(h)) continue;
      const p = h.split("#")[0].split("?")[0];
      if (p && !vistos.has(p)) { vistos.add(p); cola.push(p); }
    }
  }
  ok("Enlaces internos sin romper", rotos.length === 0, `${vistos.size} rutas${rotos.length ? "; rotas: " + rotos.join(", ") : ""}`);

  // 2) Cada página: un solo h1, title, description, canonical, sin desborde horizontal
  for (const r of vistos) {
    await page.goto(BASE + r);
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length, t: document.title, d: !!document.querySelector('meta[name=description]')?.content,
      c: !!document.querySelector('link[rel=canonical]'), x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sinAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length
    }));
    ok(`Página ${r}`, info.h1 === 1 && info.t.length > 10 && info.d && info.c && info.x <= 0 && info.sinAlt === 0, `h1=${info.h1} desborde=${info.x} sinAlt=${info.sinAlt}`);
  }

  // 3) Tema
  await page.goto(BASE + "/");
  const antes = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click("#tema");
  const despues = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const tema = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.reload();
  const persiste = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  ok("Modo claro/oscuro alterna y persiste", antes !== despues && persiste === tema, `${antes} → ${despues} (${tema})`);
  await page.evaluate(() => localStorage.clear());

  // 4) Menú móvil
  const m = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const pm = await m.newPage();
  await pm.goto(BASE + "/");
  const visibleAntes = await pm.isVisible("#menu");
  await pm.click("#menu-btn");
  const visibleDespues = await pm.isVisible("#menu");
  const exp = await pm.getAttribute("#menu-btn", "aria-expanded");
  await pm.keyboard.press("Escape");
  const cerrado = !(await pm.isVisible("#menu"));
  ok("Menú móvil abre y cierra (Escape)", !visibleAntes && visibleDespues && exp === "true" && cerrado);
  for (const r of ["/", "/servicios/gestion-documental/", "/cotizador/", "/tecnologia/", "/proyectos/"]) {
    await pm.goto(BASE + r);
    const x = await pm.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`Móvil 390px sin desborde ${r}`, x <= 0, `desborde=${x}`);
  }

  // 5) Filtros y ventana de proyecto
  await page.goto(BASE + "/proyectos/");
  const total = await page.$$eval(".proy-i:not([hidden])", (e) => e.length);
  await page.click('[data-filtro="documental"]');
  const filtrados = await page.$$eval(".proy-i:not([hidden])", (e) => e.length);
  const texto = await page.textContent("#filtros-n");
  await page.click('[data-filtro="todos"]');
  ok("Filtros de proyectos", total === 6 && filtrados === 1 && /1 proyecto/.test(texto), `${total} → ${filtrados}`);
  await page.click('[data-abrir="caso-1"]');
  const abierto = await page.$eval("#m-caso-1", (d) => d.open);
  await page.keyboard.press("Escape");
  const cerr = await page.$eval("#m-caso-1", (d) => !d.open);
  ok("Ventana de proyecto abre y cierra con teclado", abierto && cerr);

  // 6) Cotizador: validación, resumen, envío con respuestas simuladas
  await page.goto(BASE + "/cotizador/?u=B&s=" + encodeURIComponent("Detallamiento estructural y despieces"));
  const pre = await page.$$eval("input[name=servicios]:checked", (e) => e.map((x) => x.value));
  ok("Cotizador precarga servicio desde la URL", pre.length === 1 && pre[0].startsWith("B: Detallamiento"), pre.join("|"));
  const resTxt = await page.textContent("#res-serv");
  const infoVis = await page.isVisible("#res-info");
  ok("Resumen vivo e información sugerida", /Detallamiento/.test(resTxt) && infoVis);
  const sinArea = await page.textContent("#est-total");
  ok("Estimado pide el área si falta", /área/.test(sinArea), sinArea);
  await page.fill("#cot-area", "200");
  const e1 = await page.textContent("#est-total");
  await page.selectOption("#cot-tipo", { label: "Edificación existente (evaluación o reforzamiento)" });
  const e2 = await page.textContent("#est-total");
  ok("Estimado calcula un rango en COP y cambia con el tipo de proyecto", /\$/.test(e1) && /–/.test(e1) && e1 !== e2, `${e1} → ${e2}`);
  ok("Estimado muestra el aviso de valores de ejemplo y el mensaje final", /ejemplo/.test(await page.textContent(".ejemplo")) && /cotización detallada/.test(await page.textContent(".est-final")));
  await page.click("#est-enviar");
  ok("Botón del estimado lleva al formulario", await page.evaluate(() => document.activeElement.id) === "cotizar-nombre");
  await page.fill("#cot-area", "");
  await page.selectOption("#cot-tipo", { index: 0 });
  await page.click("#form-cotizar button[type=submit]");
  const errs = await page.$$eval("#form-cotizar .error:not([hidden])", (e) => e.length);
  const foco = await page.evaluate(() => document.activeElement && document.activeElement.id);
  ok("Validación muestra errores y enfoca el primero", errs >= 5 && foco === "cot-tipo", `${errs} errores, foco=${foco}`);
  await page.fill("#cotizar-nombre", "Ana Pérez");
  await page.fill("#cotizar-correo", "malo");
  await page.fill("#cotizar-msg", "Necesito despiece de vigas de un edificio.");
  await page.selectOption("#cot-tipo", { index: 2 }); await page.selectOption("#cot-ubic", { index: 1 });
  await page.selectOption("#cot-nivel", { index: 3 }); await page.selectOption("#cotizar-pref", { index: 1 });
  await page.check("#cotizar-acepto");
  await page.click("#form-cotizar button[type=submit]");
  const eCorreo = await page.textContent("#cotizar-correo-error");
  ok("Correo inválido se rechaza con mensaje", /correo válido/.test(eCorreo), eCorreo);
  await page.fill("#cotizar-correo", "ana@ejemplo.com");

  let enviado = null;
  await page.route("**/api/contacto", async (r) => { enviado = JSON.parse(r.request().postData()); await new Promise((x) => setTimeout(x, 400)); r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.click("#form-cotizar button[type=submit]");
  const cargando = await page.isVisible("#form-cotizar .btn-c");
  await page.waitForSelector("#cotizar-estado.ok");
  ok("Envío muestra estado de carga y confirmación", cargando && /Recibimos/.test(await page.textContent("#cotizar-estado")));
  ok("Datos enviados completos", enviado && enviado.origen === "cotizar" && enviado.servicios.length === 1 && enviado.acepto === true && enviado.correo === "ana@ejemplo.com", JSON.stringify(enviado && Object.keys(enviado)));
  await page.unroute("**/api/contacto");
  await page.route("**/api/contacto", (r) => r.fulfill({ status: 503, contentType: "application/json", body: '{"error":"El envío de mensajes aún no está configurado."}' }));
  await page.check("input[name=servicios]"); // ya tras reset, vuelve a llenar lo mínimo
  await page.fill("#cotizar-nombre", "Ana Pérez"); await page.fill("#cotizar-correo", "ana@ejemplo.com"); await page.fill("#cotizar-msg", "Necesito despiece de vigas de un edificio.");
  await page.selectOption("#cot-tipo", { index: 2 }); await page.selectOption("#cot-ubic", { index: 1 }); await page.selectOption("#cot-nivel", { index: 3 }); await page.selectOption("#cotizar-pref", { index: 1 }); await page.check("#cotizar-acepto");
  await page.click("#form-cotizar button[type=submit]");
  await page.waitForSelector("#cotizar-estado.err");
  ok("Error del servidor se muestra al usuario", /No pudimos enviar/.test(await page.textContent("#cotizar-estado")));
  await page.unroute("**/api/contacto");

  // 7) API real del servidor de desarrollo sin configurar: debe responder 503 y la UI avisar
  await page.goto(BASE + "/contacto/");
  await page.fill("#contacto-nombre", "Luis Gómez"); await page.fill("#contacto-correo", "luis@ejemplo.com");
  await page.selectOption("#contacto-servicio", { index: 1 }); await page.fill("#contacto-msg", "Quisiera información sobre gestión documental.");
  await page.selectOption("#contacto-pref", { index: 1 }); await page.check("#contacto-acepto");
  await page.click("#form-contacto button[type=submit]");
  await page.waitForSelector("#contacto-estado.err, #contacto-estado.ok");
  const cl = await page.getAttribute("#contacto-estado", "class");
  ok("Formulario de contacto contra la función real (sin claves → 503 claro)", /err/.test(cl) && /no está configurado|No pudimos/.test(await page.textContent("#contacto-estado")), await page.textContent("#contacto-estado"));

  // 8) WhatsApp
  const waLinks = await page.$$eval('a[href*="wa.me"]', (a) => a.map((x) => x.href));
  if (WA) {
    ok("Enlaces de WhatsApp con el número configurado", waLinks.length > 0 && waLinks.every((h) => h.includes("wa.me/" + WA)), waLinks[0]);
    await ctx.route("https://wa.me/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
    const [popup] = await Promise.all([page.waitForEvent("popup"), page.click("[data-wa-form]")]);
    ok("Botón 'Enviar por WhatsApp' arma el mensaje", popup.url().includes("wa.me/" + WA) && /text=/.test(popup.url()), popup.url().slice(0, 90));
  } else ok("Sin número de WhatsApp no se muestran enlaces", waLinks.length === 0);

  // 9) Teclado: salto al contenido
  await page.goto(BASE + "/");
  await page.keyboard.press("Tab");
  ok("Enlace 'Saltar al contenido' es el primer foco", await page.evaluate(() => document.activeElement.className === "salto"));

  // 10) Capturas
  if (SHOTS) {
    for (const [nombre, ruta] of [["inicio", "/"], ["servicios-u", "/servicios/ingenieria-arquitectura/"], ["doc", "/servicios/gestion-documental/"], ["tec", "/tecnologia/"], ["proyectos", "/proyectos/"], ["cotizador", "/cotizador/"], ["contacto", "/contacto/"], ["nosotros", "/nosotros/"]]) {
      for (const tema of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: tema });
        await page.goto(BASE + ruta); await page.waitForTimeout(2300);
        await page.screenshot({ path: `${SHOTS}/${nombre}-${tema}.png`, fullPage: true });
      }
    }
    await pm.emulateMedia({ colorScheme: "light" }); await pm.goto(BASE + "/"); await pm.waitForTimeout(2300); await pm.screenshot({ path: `${SHOTS}/movil-inicio.png`, fullPage: true });
    await pm.click("#menu-btn"); await pm.screenshot({ path: `${SHOTS}/movil-menu.png` });
  }

  ok("Sin errores de consola ni excepciones", errores.length === 0, errores.join(" | "));
  await b.close();
  const f = res.filter((r) => !r[0]).length;
  console.log(`\n${res.length - f}/${res.length} pruebas OK`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
