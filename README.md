# Sitio web de la firma (prototipo v2)

Sitio corporativo en español: Inicio, Nosotros, Servicios (4 unidades, cada una con su página), Tecnología, Proyectos, Proceso, Cotizador, Contacto y Privacidad.
Nombre provisional: **Cota Estudio** (se cambia en un solo archivo).

## Decisión técnica: por qué NO Next.js (todavía)

El sitio es de contenido (páginas informativas, un portafolio y dos formularios). Para eso basta:

- **Generador estático propio, sin dependencias** (`scripts/build.mjs`): lee JSON y produce HTML. Es rápido, indexa bien en Google y no hay `node_modules` que mantener ni actualizar.
- **Una función serverless** (`api/contacto.js`) para los formularios.
- **Vercel** aloja ambas cosas y compila solo cada vez que se sube un cambio a GitHub.

Next.js/React/Tailwind se justifican cuando haya cuentas de cliente, panel de administración, blog con muchas entradas o un CMS. La estructura (contenido en JSON, páginas como funciones) migra a Next.js sin rehacer el contenido. Hoy sumaría costo de mantenimiento sin beneficio visible.

## Estructura

```
site.config.json     nombre, lema, ubicación, contacto, redes, logo, modo prototipo, dominio
contenido/*.json     TODOS los textos: servicios, tecnología, proyectos, nosotros, proceso, cotizador, inicio
public/              CSS, JS, favicon, imágenes (se copian tal cual a dist/)
src/                 plantillas (layout, páginas, diagramas SVG)
scripts/build.mjs    genera dist/ (HTML, sitemap.xml, robots.txt, JSON-LD)
scripts/dev.mjs      servidor local (sirve dist/ y la función de contacto)
api/contacto.js      recibe el formulario y lo envía por correo con Resend
tests/               pruebas de la función (npm test) y de navegador (e2e.cjs)
vercel.json          cabeceras de seguridad y configuración de compilación
```

## Ejecutar en el computador

Requiere Node 18 o superior. No hay que instalar paquetes.

```bash
cd sitio_web
npm run build        # genera dist/
PORT=3000 npm run dev  # abre http://localhost:3000
npm test             # pruebas de la función de contacto
```

Para probar el envío real en local, crear un archivo `.env` (no se sube) y cargarlo: `node --env-file=.env scripts/dev.mjs`.

## Cómo actualizar el sitio

| Qué cambiar | Dónde |
|---|---|
| Nombre, lema, logo, correo, WhatsApp, redes, dominio | `site.config.json` |
| Servicios, entregables, textos de cada unidad | `contenido/servicios.json` |
| Tecnología, capacidades del software, notas de alcance | `contenido/tecnologia.json` |
| Proyectos del portafolio | `contenido/proyectos.json` (quitar `"ilustrativo": true` al cargar uno real) |
| Perfiles de los profesionales y matrículas | `contenido/nosotros.json` (campos `perfiles`) |
| Fotos | copiar a `public/img/` y poner la ruta (`/img/archivo.jpg`) en el JSON o en `imagenes.hero` |
| Textos de portada | `contenido/home.json` |

Al guardar y subir a GitHub, Vercel recompila. No hay que tocar código. Lo que está vacío (`""`) no se publica.

Cambiar de nombre: editar `nombre` en `site.config.json` y poner `nombre_definitivo: true`. Cambiar el logo: poner la ruta en `logo`. Regenerar `public/img/og.png` (imagen para compartir) con el nombre nuevo.

## Formularios: recomendación

| Opción | Costo | Mantenimiento | Seguridad |
|---|---|---|---|
| **Resend + función en Vercel (elegida)** | Gratis hasta 3.000 correos/mes y 100/día | Bajo: un archivo y 3 variables | Clave solo en el servidor; validación, trampa anti-bots, límite por IP y verificación de origen |
| Formspree | Gratis 50 envíos/mes; luego pago mensual | Muy bajo | Los datos viven en un tercero |
| Backend propio | Servidor + tiempo | Alto | Tú respondes por todo |

Variables en Vercel → Settings → Environment Variables (ver `.env.example`): `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. Las claves nunca van en el navegador.

Además del correo, cada solicitud puede guardarse en una **hoja de Google** y avisarse por **WhatsApp** con toda la información. Se envía por todos los canales configurados a la vez; basta con que uno llegue para confirmar al cliente. Guía paso a paso: [`docs/INTEGRACIONES.md`](docs/INTEGRACIONES.md).

Sin ningún canal configurado, el formulario responde "El envío de mensajes aún no está configurado" y ofrece WhatsApp si hay número. No se muestra un falso éxito.

## Publicar (paso a paso)

1. **GitHub**: subir esta carpeta como repositorio propio (recomendado separarlo del repositorio del programa de despiece) o usarla como subcarpeta (en Vercel, *Root Directory* = la carpeta del sitio). Este repositorio ya es independiente.
2. **Vercel**: crear cuenta, *Add New Project*, importar el repositorio. No requiere configuración extra: `vercel.json` ya define compilación y carpeta de salida.
3. **Resend**: crear cuenta, verificar el dominio (registros DNS que indica Resend), crear una API key. Mientras no haya dominio verificado, Resend solo permite enviar al correo del dueño de la cuenta, y sirve para probar.
4. **Variables de entorno** en Vercel: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. Volver a desplegar.
5. **Dominio**: comprar uno (registrador colombiano o internacional), agregarlo en Vercel → Domains y poner los registros DNS que indica. Poner el dominio en `dominio` de `site.config.json`.
6. **Salir de prototipo**: poner `"modo_prototipo": false` en `site.config.json`. Eso quita el aviso, permite que Google indexe (`robots.txt` y `meta robots`) y exige que haya dominio.
7. **Google**: registrar el sitio en Search Console y enviar `/sitemap.xml`. Crear la ficha de Google Business Profile con la dirección de Sabaneta.

### Costos recurrentes
- Dominio: unos USD 10–20 al año (.com) o más para .co.
- Vercel: plan Hobby gratis para pruebas. Un sitio comercial técnicamente debería usar el plan Pro (≈ USD 20/mes por usuario), porque Hobby no permite uso comercial. Verificar condiciones vigentes.
- Resend: gratis hasta 3.000 correos/mes.
- Correo corporativo (Google Workspace, Zoho, etc.): opcional.

Verifica precios y condiciones en cada servicio antes de contratar: cambian.

## Lo que falta definir (no se inventó)
Nombre definitivo, logotipo, correo, WhatsApp, perfiles y matrículas, fotografías, proyectos reales y clientes autorizados, redes, dominio y tarifas. El comando de compilación lista los pendientes. Las tarifas del prototipo anterior se eliminaron: el cotizador es una solicitud de propuesta, sin valores.

## Pruebas realizadas
Ver `docs/PLAN.md`, sección «Verificación». Las pruebas de navegador se ejecutan con `node tests/e2e.cjs` (requiere Playwright y el sitio en marcha).
