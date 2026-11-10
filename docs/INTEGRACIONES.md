# Integraciones del formulario: correo, hoja de cálculo y WhatsApp

Cada solicitud (formulario de contacto o cotizador) sale por **todos los canales que estén configurados, a la vez**. Con que uno llegue, el cliente ve la confirmación. Si todos fallan, ve un error y puede escribir por WhatsApp. Si ninguno está configurado, el formulario avisa que el envío aún no está activo.

| Canal | Para qué | Costo | Dificultad |
|---|---|---|---|
| Correo (Resend) | Aviso con todos los datos y «responder a» el cliente | Gratis hasta 3.000/mes | Fácil |
| Hoja de Google | Registro ordenado de todas las solicitudes | Gratis | Fácil |
| WhatsApp (CallMeBot) | Aviso al celular de la firma, con toda la información | Gratis | Fácil, pero no oficial |
| WhatsApp (Meta Cloud API) | Lo mismo, con el servicio oficial | Por conversación, con tarifas de Meta | Media |

Todas las claves se guardan solo en Vercel (Settings → Environment Variables), nunca en el código. Después de agregar o cambiar variables hay que volver a desplegar (Deployments → los tres puntos del último → Redeploy).

---

## 1. Hoja de cálculo (Google Sheets)

1. Crea una hoja nueva en Google Sheets, por ejemplo «Solicitudes del sitio».
2. Menú **Extensiones → Apps Script**. Borra el código que aparece y pega el contenido de `integraciones/google-sheets.gs`. Guarda.
3. A la izquierda, **Configuración del proyecto (engranaje) → Propiedades del script → Agregar propiedad**:
   - Propiedad: `TOKEN`
   - Valor: una contraseña larga inventada por ti (por ejemplo, 30 letras y números al azar). Anótala.
4. Arriba a la derecha: **Implementar → Nueva implementación → tipo «Aplicación web»**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - Pulsa **Implementar** y autoriza los permisos que pida Google.
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. En Vercel agrega:
   - `SHEETS_WEBHOOK_URL` = esa URL
   - `SHEETS_TOKEN` = la misma contraseña del paso 3
7. Cada solicitud agrega una fila con: fecha, origen, nombre, correo, teléfono, contacto preferido, servicio(s), tipo de proyecto, ubicación, área, nivel, mensaje, cotización mostrada y estado («Nuevo», para que lo cambien ustedes).

Seguridad: «Cualquier persona» significa que la URL se puede llamar sin iniciar sesión en Google. Lo que protege la hoja es el `TOKEN`: sin él, el script no escribe nada. No publiques la URL ni el token. Si se filtran, cambia el `TOKEN` en ambos lados.

Si cambias el código del script, hay que crear una **nueva implementación** (o editar la existente y elegir «Nueva versión») para que el cambio se aplique.

---

## 2. Aviso por WhatsApp

El mensaje que llega incluye nombre, correo, teléfono, preferencia de contacto, servicios, tipo de proyecto, ubicación, área, nivel, el mensaje del cliente y la cotización preliminar que vio.

### Opción A: CallMeBot (la más rápida)
Servicio gratuito, de terceros y **no oficial**. Sirve para avisarte a ti mismo en tu propio WhatsApp. Puede cambiar o dejar de funcionar sin aviso, y no es lo ideal para una operación crítica.

1. Entra a **callmebot.com**, sección de WhatsApp, y sigue las instrucciones para activar el servicio con tu número. Normalmente consiste en agregar el contacto del servicio y enviarle un mensaje de activación, tras lo cual te responde con una **apikey**.
2. En Vercel agrega:
   - `WA_PROVIDER` = `callmebot`
   - `CALLMEBOT_PHONE` = tu número con indicativo, por ejemplo `+573001112233`
   - `CALLMEBOT_APIKEY` = la clave que te dio el servicio

### Opción B: WhatsApp Cloud API de Meta (la oficial)
Recomendada a largo plazo. Requiere más trámite:
1. Una cuenta de **Meta Business** y una app en developers.facebook.com con el producto WhatsApp.
2. Un número de teléfono de WhatsApp Business para enviar los avisos (no puede estar usándose en la app normal de WhatsApp).
3. Una **plantilla de mensaje** aprobada por Meta, de categoría utilidad, con un solo parámetro en el cuerpo. Ejemplo de cuerpo: `Nueva solicitud del sitio web: {{1}}`. Un aviso iniciado por la empresa fuera de una conversación abierta solo puede enviarse con plantilla aprobada.
4. Un token de acceso permanente (usuario del sistema) y el identificador del número de teléfono.
5. En Vercel agrega:
   - `WA_PROVIDER` = `meta`
   - `WA_META_TOKEN` = el token
   - `WA_META_PHONE_ID` = el identificador del número emisor
   - `WA_META_TO` = el número que recibe los avisos, con indicativo
   - `WA_META_TEMPLATE` = el nombre de la plantilla aprobada
   - `WA_META_LANG` = `es` (opcional; usa el idioma con que aprobaron la plantilla)

Sin `WA_META_TEMPLATE`, la función envía un mensaje de texto libre. Meta solo lo entrega si el destinatario escribió a ese número en las últimas 24 horas, así que para avisos automáticos conviene usar plantilla.

---

## 3. Correo (Resend)
Ver la sección «Formularios» del README. Variables: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`.

---

## Privacidad
Con estos canales, los datos de los clientes pasan por Google (hoja), por el proveedor de WhatsApp (CallMeBot o Meta) y por Resend. La política de privacidad del sitio ya lo menciona, pero debe revisarla un abogado antes de publicar. Limita el acceso a la hoja a las personas que realmente necesiten verla.

## Qué se probó y qué no
- **Probado con servicios simulados** (`npm test`, 18 pruebas): envío a cada canal con el contenido correcto, token de la hoja, mensaje de WhatsApp con toda la información, plantilla de Meta en una sola línea, éxito si llega por al menos un canal, error si fallan todos, y aviso de «no configurado» cuando falta la configuración.
- **No probado con los servicios reales**: Resend, Google Apps Script, CallMeBot y Meta requieren cuentas y claves de ustedes. Al activar cada canal conviene enviar una solicitud de prueba y verificar que llega.
