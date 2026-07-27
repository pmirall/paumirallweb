# Sistema de diseño

La guía de imagen de marca llega en una fase posterior. Este documento define la
estructura que la va a recibir, para que cuando llegue se pueda aplicar sin
reescribir componentes.

## El contrato

Ningún componente contiene un color, una tipografía, un radio, una sombra ni un
espacio escritos a mano. Todo sale de tokens declarados como custom properties de
CSS en `src/styles/tokens.css`, expuestos a Tailwind mediante `@theme`.

Mientras no exista la guía, los tokens tienen valores provisionales: una escala
de grises neutra, una tipografía de sistema y una escala de espacios basada en 4
píxeles. El sitio se puede construir entero así, y se verá soso a propósito. Eso
es lo correcto en esta fase: si algo se ve bien con grises, se verá mejor con la
marca puesta.

Cuando llegue la guía, el cambio consiste en sustituir los valores de ese
fichero. Si hay que tocar un componente, el token que faltaba estaba mal
diseñado y se corrige en el token, no en el componente.

## Tokens previstos

Color, en pares de fondo y contenido para que el contraste se resuelva en el
token y no en cada uso: `--color-bg`, `--color-fg`, `--color-muted`,
`--color-subtle`, `--color-border`, `--color-accent`, `--color-accent-fg`, más
los cuatro semánticos de éxito, aviso, error e información.

Tipografía: `--font-display` y `--font-body`, una escala de tamaños de `xs` a
`4xl` con altura de línea emparejada, y tres pesos.

Espacio: escala de 4 px, de `space-1` a `space-24`.

Forma: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`, y tres
niveles de sombra.

Movimiento: `--duration-fast`, `--duration-base`, `--duration-slow` y dos curvas.
Todas las transiciones se anulan bajo `prefers-reduced-motion`.

Capas: una escala de `z-index` con nombre para modal, menú desplegable, aviso
flotante y visor de imagen, para que nadie escriba `z-index: 9999`.

## Modo claro y oscuro

Los tokens se declaran en `:root` y se redefinen bajo `prefers-color-scheme: dark`.
Los componentes no saben en qué modo están.

La decisión de si el sitio público tiene modo oscuro depende de la guía de marca.
La estructura lo soporta desde el principio; activarlo es cuestión de rellenar el
bloque oscuro.

## La skill de interfaz

En `.claude/skills/` está instalada `ui-ux-pro-max`, una base de datos de
patrones de interfaz y experiencia de usuario con soporte para Next.js, Tailwind
y shadcn/ui. Se invoca antes de construir o revisar cualquier pantalla. La regla
completa está en `CLAUDE.md`.

Sirve para decidir jerarquía, espaciado, estados, contraste y patrones de
interacción. No sirve para elegir la paleta ni la tipografía: eso lo decide la
guía de imagen de marca y entra por `tokens.css`.

## Inventario de componentes

El admin son veintidós pantallas construidas con los mismos seis componentes
repetidos. Merece la pena construirlos bien una vez.

Primitivas en `src/components/ui/`: botón con sus variantes, campo de texto,
selector, casilla, interruptor, selector de fecha, etiqueta de estado, aviso,
modal, panel lateral, menú, pestañas, tabla con orden y paginación, formulario
con errores, estado vacío, esqueleto de carga y notificación flotante.

De la zona pública: cabecera, pie, tarjeta de proyecto, rejilla del archivo,
filtros, galería de proyecto, tarjeta de servicio, formulario de contacto.

De la zona de cliente: puerta con PIN, rejilla de fotos, visor a pantalla
completa, barra de acciones, línea de tiempo del encargo, resumen de factura.

Del admin: barra lateral, cabecera de página con acciones, tarjeta de métrica,
tabla de datos, fila de la cola de enriquecimiento, editor de texto largo,
subida de archivo.

Cada primitiva se construye antes que la primera pantalla que la usa. Una
pantalla que necesita una primitiva nueva la añade al inventario en el mismo
commit.

## Accesibilidad

Contraste mínimo AA en todo texto. Si la guía de marca propone una combinación
que no llega, se avisa antes de aplicarla y se busca alternativa.

Todo lo que se hace con ratón se puede hacer con teclado. El visor de fotos
navega con flechas y se cierra con Escape. El modal atrapa el foco mientras está
abierto y lo devuelve al cerrarse.

Foco siempre visible, con un estilo propio del sistema en vez del del navegador,
pero nunca eliminado.

Las imágenes del portfolio llevan texto alternativo escrito, no el nombre del
archivo. Es un campo del editor de proyecto y forma parte del trabajo de
publicar.

Los formularios asocian etiqueta y campo, y los errores se anuncian a los
lectores de pantalla, no solo se pintan en rojo.

## Rendimiento visual

Las imágenes usan `next/image` con tamaños declarados, para que no haya saltos de
maquetación mientras cargan.

La rejilla de la galería reserva el espacio de cada foto con la proporción real,
que se conoce porque `media_assets` guarda ancho y alto.

Las fuentes se cargan con `next/font`, subconjunto latino, y con
`font-display: swap`. Cero peticiones a dominios de terceros.

Objetivo: LCP por debajo de 2,5 s y CLS por debajo de 0,1 en móvil con conexión
lenta, medido en `/` y en `/trabajo/:slug`.

## Cuando llegue la guía

El orden de aplicación es: rellenar los tokens, revisar las cinco pantallas que
importan, ajustar lo que se rompa, y solo entonces recorrer el resto.

Si la guía trae componentes que no están en el inventario, se añaden. Si trae
decisiones que contradicen algo de este documento, gana la guía y este documento
se actualiza.
