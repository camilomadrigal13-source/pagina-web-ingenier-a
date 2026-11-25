# Contexto del proyecto (leer primero)

Este archivo existe para que cualquier agente o persona nueva entienda el proyecto sin empezar de cero. Mantenerlo al día: cuando cambie una decisión, se actualiza aquí.

## Qué es
- Sitio web corporativo de una firma nueva, multidisciplinaria, de Medellín (Antioquia, Colombia). Los socios son un ingeniero civil y un arquitecto.
- Nombre de trabajo: **Dimenza** (sin «Estudio»). **No es definitivo:** falta la prueba del nombre (`docs/PRUEBA_NOMBRE.md`), luego verificar SIC/RUES, y solo después comprar dominio y crear correo.
- Sitio informativo: no hay pagos. Contacto principal por WhatsApp (573053230545). Aún no hay correo ni dominio propios.
- Publicado (prototipo) en https://dimenza-a77.pages.dev (Cloudflare Pages). Código en GitHub: `camilomadrigal13-source/pagina-web-ingenier-a`, rama `main`.
- Idioma: español colombiano. La persona que lo dirige no es técnica: explicar paso a paso y sin jerga.

## Servicios (4 unidades, cada una se contrata por separado)
- **A.** Ingeniería civil/estructural y arquitectura.
- **B.** BIM y documentación técnica.
- **C.** Construcción, consultoría y gestión.
- **D.** Gestión documental.

## Cobertura
Estamos en Medellín y atendemos toda el área metropolitana del Valle de Aburrá. Vamos a cualquier lugar de Antioquia y del país. Hay servicios técnicos remotos.

## Reglas de oro
1. **Nunca inventar datos:** cifras, años, clientes, certificaciones, precios, plazos, matrículas. Si falta un dato, se deja pendiente y se pregunta.
2. **Todo lo que la persona dueña pida montar ya está autorizado por ella.** Aun así, las fotos de terceros o de Google Street View no se presentan como propias, ni se quita su crédito o marca de agua.
3. No poner nombres de personas en «Nosotros» por ahora (decisión de la persona dueña).
4. Funcionar bien en celular. «No más errores»: probar antes de avisar.
5. Los secretos (token de Telegram, `TURNSTILE_SECRET`, `SHEETS_TOKEN`, URL del Apps Script) **solo viven en Cloudflare**. Nunca en el chat, en el repositorio ni en archivos.
6. No cambiar `SITE_PROTOTYPE` ni conectar dominio hasta que el nombre esté decidido y un abogado haya revisado.

## Identidad visual
Ruta C: fondo oscuro, lima `#C8F43A`, tipografías Michroma (títulos), Manrope (texto) e IBM Plex Mono (etiquetas). Hero con retícula de plano técnico (la persona dueña la prefiere). Detalle en `docs/IDENTIDAD.md`.

## Portafolio real (roles tal como los dio la persona dueña)
| Proyecto | Lugar y año | Rol |
|---|---|---|
| Living Montes (Hotel Montes) | Laureles–Estadio, Medellín · 2007 | Diseño arquitectónico, acompañamiento técnico y supervisión de obra |
| Edificio Marat | Sabaneta · 2010 | Gerencia técnica, revisión de diseños, construcción y supervisión |
| Edificio Marat Plus | Sabaneta · 2015 | Gerencia técnica, revisión de diseños, construcción y supervisión |
| Hotel Medellín Gold | Laureles–Estadio, Medellín · 2015 | **Solo diseño** |
| Edificio Lusitania | 2016 (ubicación pendiente) | Multifamiliar, diseño y construcción |

Otros seis proyectos del sitio (`caso-1` a `caso-6`) son **ilustrativos** y están marcados como tales.
Fotos: Marat y Lusitania usan imágenes de Street View con crédito (`foto_provisional`); hay que reemplazarlas por fotos propias. Marat Plus usa fotos de la persona dueña. La persona dueña perdió fotos originales por daño de disco.

## Cómo está construido
- Generador estático sin dependencias (Node): contenido en `contenido/*.json`, configuración en `site.config.json`, plantillas en `src/`, activos en `public/`, salida en `dist/`.
- Comandos: `node scripts/build.mjs` (prototipo), `npm test` (40 pruebas; deja `dist/` en modo producción, reconstruir con build antes del e2e), `tests/e2e.cjs` con Playwright (53 pruebas).
- Formulario: `functions/api/contacto.js` (Cloudflare) → hoja de Google (Apps Script) + aviso por Telegram. Verificado: el aviso por Telegram llega.
- Variables en Cloudflare: `SHEETS_WEBHOOK_URL`, `SHEETS_TOKEN`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. No borrarlas.
- Vista previa en un solo archivo: `scripts/preview.mjs` (publicada como artefacto).

## Estado legal (revisión de IA, no es asesoría)
Hecho: página de términos de uso en borrador, proveedores nombrados en la política, Turnstile solo donde hay formulario, sin «promociones de temporada».
Pendiente y solo lo decide un abogado: aprobar política y términos (se quita «Borrador» después), registro de bases de datos ante la SIC, servicios que pueden ofrecer hoy, titularidad de diseños de obras anteriores, registro de marca.
Pendiente de la persona dueña: razón social, NIT, dirección y correo; autorizaciones escritas de dueños de obras; respaldar o suavizar frases como «desde 2007»; fotos propias.

## Decisiones abiertas
- Nombre definitivo (Dimenza / Dimensa / Cota / Trazo) tras la prueba de audio.
- Titular del hero: A «Diseñamos, construimos y supervisamos tu obra en Medellín.» · B «Ingeniería, arquitectura y obra en Medellín, con un solo equipo detrás.» · C el actual.
- Lema, modo claro u oscuro por defecto, uso del lima, imagen para compartir al cerrar el nombre.
- Bot de WhatsApp/chat con IA: reglas propuestas (explica servicios, cobertura y cómo cotizar; recoge datos con consentimiento y los manda a Telegram y a la hoja; pasa a una persona; **nunca** da precios, plazos, conceptos de ingeniería ni promesas; siempre dice que es un asistente automático). Falta aprobación y cuenta con límite de gasto.

## Instagram y redes
No hay conector de Instagram. Para dar contexto: la persona dueña descarga sus datos (Configuración → Centro de cuentas → Tu información y permisos → Descargar tu información, solo publicaciones, JSON) y los pasa para extraer textos, fechas y fotos de proyectos. Todo lo extraído se verifica con ella antes de publicarse.

## Cómo trabajar con la persona dueña
Respuestas cortas y claras, pasos numerados, avisar cuando algo esté listo, separar las decisiones suyas con opciones y una recomendación. Si algo no se puede hacer (quitar créditos, usar fotos ajenas como propias), decirlo con una alternativa.
