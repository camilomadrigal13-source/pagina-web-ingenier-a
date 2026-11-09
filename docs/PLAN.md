# Plan y verificación del sitio

## Fase 1 · Diagnóstico del prototipo anterior
- **Se conservó:** el lenguaje de planos (cotas, ejes, retículas), el cotizador como idea (ahora solicitud de propuesta), las etapas con cotas y el nombre provisional.
- **Se corrigió:** tarifas ficticias en el cotizador (eliminadas), formulario que no enviaba nada, datos inventados (correo, teléfono, proyectos).
- **Se amplió:** de 1 página a 14; cuatro unidades de negocio; tecnología, proyectos con filtros, nosotros, proceso, SEO, formularios reales, modo claro/oscuro, menú móvil.
- **Se eliminó:** el posicionamiento centrado en el despiece. El software es una sección de «Tecnología aplicada a la ingeniería» y no domina la portada.
- **Tecnología:** generador estático sin dependencias + función serverless + Vercel (ver README).

## Fase 2 · Diseño
- **Lema:** «Del primer trazo al último detalle.» Reemplaza «al último estribo», que remitía solo a estructuras. El estribo queda en la sección de tecnología.
- **Paleta:** petróleo #263B42, grafito #272A29, marfil #E9E4DA, arena #B4A58F. El azul de copia (#2F5FA8, y #8FB0E6 en oscuro) se usa solo en ejes, cotas y datos técnicos: así el plano se lee como plano y el azul no compite con la marca. La arena es el color propio de la unidad D (gestión documental).
- **Tipografía:** Newsreader (títulos, serif editorial), Manrope (texto), IBM Plex Mono (información técnica).
- **Estructura:** Inicio, Nosotros, Servicios (+4 páginas), Tecnología, Proyectos, Proceso, Cotizador, Contacto, Privacidad.
- **Honestidad de contenido:** la sección de tecnología distingue lo automatizado, las verificaciones implementadas, los parámetros configurables y lo que decide el ingeniero. Se revisó contra el código del programa: la coordinación de interferencias entre elementos es parcial y así se declara; el acero estructural figura «en desarrollo»; la cimentación se declara preliminar; no se afirma cumplimiento integral de NSR-10 ni de ACI 318-25.

## Fase 4 · Verificación (ejecutada)
- Pruebas de la función de contacto (`npm test`): 9/9. Cubren método, origen, validación, trampa anti-bots, 503 sin configuración, envío con Resend simulado, inyección de encabezados, escape de HTML, fallo de Resend y límite por IP.
- Pruebas de navegador (Chromium, `tests/e2e.cjs`): 34/34 sin WhatsApp y 35/35 compilando con un número de prueba. Cubren rastreo de enlaces, un solo h1, title, description, canonical y alt, desborde horizontal en escritorio y a 390 px, modo oscuro y su persistencia, menú móvil con teclado, filtros, ventana de proyecto, cotizador (validación, resumen, precarga), estados de carga, éxito y error, enlace «saltar al contenido» y consola sin errores.
- **No probado:** envío real de correo (requiere la clave de Resend), entrega por WhatsApp en un teléfono, Lighthouse y rendimiento en Vercel, lectores de pantalla, Safari y Firefox, y el despliegue en Vercel. Las tipografías de Google Fonts no cargaron en el entorno de pruebas (sin salida a internet); se vio el respaldo.

## Pendiente
- Revisión legal de la política de privacidad y de las habilitaciones de los servicios de construcción e interventoría.
- Fotos y capturas reales; perfiles y matrículas; proyectos reales.
- Optimización de imágenes al cargar las reales (convertir a WebP/AVIF y anchos múltiples).
- Revisar contraste con una herramienta y una prueba con lector de pantalla.
