# Publicar en Cloudflare Pages

Alternativa a Vercel. Para un sitio estático con pocas visitas, el plan gratis de Cloudflare Pages cubre el uso. Según su documentación, los archivos estáticos son gratis e ilimitados, y las funciones (el formulario) tienen 100.000 solicitudes diarias gratis. Verifica los precios y los términos de uso comercial del plan gratis antes de lanzar: no los pude confirmar.

El código ya está preparado: la carpeta `functions/` contiene la función del formulario y `scripts/build.mjs` genera las cabeceras de seguridad cuando compila en Cloudflare. No se perdió nada de la versión de Vercel.

## Pasos

1. Crea una cuenta en dash.cloudflare.com.
2. Menú **Workers & Pages → Create → Pages → Connect to Git**. Autoriza GitHub y elige el repositorio.
3. En la configuración de compilación:
   - **Framework preset:** None
   - **Build command:** `node scripts/build.mjs`
   - **Build output directory:** `dist`
4. Pulsa **Save and Deploy**. Obtendrás una dirección `.pages.dev`.
5. Variables del formulario: en el proyecto, **Settings → Variables and secrets**, agrega las de `docs/INTEGRACIONES.md` (por ejemplo `SHEETS_WEBHOOK_URL` y `SHEETS_TOKEN`). Las claves van como **Secret**, no como texto. Después, en **Deployments**, vuelve a desplegar.
6. Dominio propio: **Custom domains → Set up a domain**. Pon también el dominio en `dominio` de `site.config.json`.

## Antibots gratis: Turnstile (recomendado antes de publicar)
1. En el panel de Cloudflare: **Turnstile → Add widget**. Nombre libre, dominio: el de tu sitio (`.pages.dev` o el propio), modo **Managed**. Te da dos claves.
2. En el proyecto de Pages → **Settings → Variables and secrets**: `TURNSTILE_SITE_KEY` (clave del sitio, texto normal) y `TURNSTILE_SECRET` (clave secreta, tipo **Secret**).
3. Vuelve a desplegar. El formulario muestra la verificación y el servidor rechaza los envíos sin ella. Sin las claves, todo sigue funcionando como antes.

## Versión informativa (lista para publicar)

Mientras no definas nada, el sitio se publica como **prototipo**: con un aviso arriba, oculto a Google, con los proyectos de ejemplo y los espacios de imagen. Para publicar la versión final sin tocar el código, agrega estas variables en **Settings → Variables and secrets** (como texto) y vuelve a desplegar:

| Variable | Valor | Qué hace |
|---|---|---|
| `SITE_PROTOTYPE` | `0` | Quita el aviso, permite que Google indexe y oculta lo provisional. |
| `SITE_WHATSAPP` | `573001112233` (tu número con indicativo, sin signos) | Muestra el botón de WhatsApp y el aviso del formulario. |
| `SITE_EMAIL_PUBLIC` | `hola@tudominio.co` | Muestra el correo en Contacto y en el pie. |
| `SITE_NAME` | El nombre definitivo | Cambia el nombre en todo el sitio. Opcional si ya lo editaste en `site.config.json`. |

Qué hace el modo producción:
- No publica los casos ilustrativos. Si no hay proyectos reales, la sección **Proyectos** desaparece del menú y del mapa del sitio.
- No muestra los espacios vacíos para fotos ni los perfiles sin datos.
- El cotizador no muestra precios de ejemplo: solo recibe la solicitud. Los precios vuelven cuando pongas tus tarifas verificadas en `contenido/tarifas.json`.
- Genera `robots.txt` y el mapa del sitio con tu dominio.

## Qué cambia respecto a Vercel
- La función del formulario vive en `functions/api/contacto.js` (en Vercel, `api/contacto.js`). Las dos usan la misma lógica, que está en `api/_nucleo.js`.
- Las variables se leen del panel de Cloudflare, no de Vercel.
- Los encabezados de seguridad salen del archivo `_headers`, que se genera solo al compilar en Cloudflare.

## Qué se probó y qué no
- **Probado** (`npm test`): el adaptador de Cloudflare con `Request` y `Response` simulados: método no permitido, falta de configuración, lectura de variables de `context.env`, origen ajeno y cuerpo inválido.
- **No probado:** el despliegue real en Cloudflare, las funciones corriendo en su plataforma y el envío con las claves reales.
