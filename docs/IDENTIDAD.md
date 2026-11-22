# Identidad visual vigente: ruta C (futurista tecnológica)

Elegida por la dirección de la firma entre tres rutas. Está aplicada al sitio. Las imágenes están en `identidad/`.

**Estado: provisional.** El nombre «Dimenza» es un nombre de trabajo y **no se ha verificado como marca** en las bases oficiales (SIC, USPTO, EUIPO, WIPO) ni en dominios. El isotipo y el wordmark son propuestas de exploración, no un logotipo definitivo registrado.

## Idea
La marca como pieza cortada y medida: una ranura de corte con una cota. El nombre viene de «dimensión» (medir y seccionar), y el isotipo repite el gesto: una **D de sección**, con el plano superior desplazado y una cota lima que mide la ranura. Sin neón y sin degradados decorativos: el acento aparece como luz sobre una cara, una línea o un dato, en menos del 5 % de la pantalla.

## Paleta (modo oscuro por defecto)

| Uso | Oscuro | Claro |
|---|---|---|
| Fondo | `#0A0B0D` negro basalto | `#E9ECEF` cerámica |
| Superficie | `#181B1F` grafito | `#F7F8F9` |
| Texto | `#E9ECEF` | `#0F1214` |
| Texto secundario | `#B7BDC4` plata | `#3A4248` |
| Líneas | `#2E3338` titanio | `#C2C8CE` |
| Acento (botones, cotas, datos) | `#C8F43A` lima láser | `#4B6000` oliva (texto) y `#181B1F` (botones) |

Contrastes medidos (WCAG): texto principal 16,6:1 en oscuro y 15,9:1 en claro; texto secundario 10,4:1 y 8,6:1; lima sobre fondo oscuro 15,4:1; botón lima con texto negro 15,4:1; oliva sobre fondo claro 6,0:1. La lima **no se usa como texto sobre fondo claro** (no llega a 4,5:1): ahí pasa a oliva.

El modo claro se activa con el botón del encabezado. Cian `#2FD3E8` queda como acento alternativo, sin usar.

## Tipografía
- **Michroma** (Google Fonts): nombre de la firma y titular de portada, siempre en mayúsculas y en textos cortos.
- **Manrope**: titulares interiores y texto corrido.
- **IBM Plex Mono**: datos técnicos, rótulos y descriptores.

## Reglas de uso
- El nombre con ranura se lee como tachado a tamaños medios. Por debajo de unos 40 px se usa la versión pequeña, sin ranura y con más espacio entre letras.
- Tamaño mínimo del isotipo: 16 px. A 16 px se pierde el detalle de la cota.
- El descriptor «Ingeniería · Arquitectura · Gestión» acompaña al nombre en el encabezado. En pantallas de menos de 350 px se oculta.
- La unidad D (gestión documental) tiene una cabecera propia en lima con texto negro.
- No usar la lima como único color del logo sobre fondos claros.

## Qué hay en la carpeta `identidad/`
- `ruta-c/board.jpg`: tablero con wordmark, isotipos, paleta, tipografía y lenguaje gráfico.
- `ruta-c/mock-placa.jpg`, `mock-casco.jpg`, `mock-tarjeta.jpg`, `mock-web.jpg`: maquetas vectoriales.
- `otras-rutas/`: las rutas A (industrial brutalista) y B (geométrica y científica), no elegidas.
- `isotipo-d-seccion.svg`: el isotipo.

Las maquetas son ilustraciones vectoriales, no fotografías. Las letras del wordmark parten de la fuente Michroma convertida a contornos; no son un alfabeto dibujado a medida.

## Dónde cambiar cosas
- Colores y fuentes del sitio: bloque `:root` al inicio de `public/assets/styles.css`.
- Nombre, descriptor, WhatsApp y datos: `site.config.json`.
- Isotipo del encabezado: función `marca()` en `src/svg.mjs`.
- Favicon: `public/favicon.svg`. Imagen para compartir en redes: `public/img/og.png`.

## Pendiente
1. Verificar «Dimenza» en SIC, RUES y dominios. Si el resultado no es bueno, hay que rehacer el wordmark con otro nombre; el isotipo es independiente del nombre.
2. Dibujar un alfabeto propio en lugar de la fuente base, si se registra el logotipo.
3. Aplicaciones reales: placas, uniformes, papelería, presentaciones y propuestas.
4. Manual de marca completo.
