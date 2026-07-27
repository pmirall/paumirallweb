# Sistema de diseño

Cómo se construye la interfaz. Las decisiones visuales concretas, que ya están
tomadas, están en `identidad-visual.md`; este documento cubre el método, el
inventario de componentes y las reglas de accesibilidad y rendimiento.

## El contrato

Ningún componente contiene un color, una tipografía, un radio, una sombra ni un
espacio escritos a mano. Todo sale de tokens declarados como custom properties de
CSS, expuestos a Tailwind mediante `@theme`.

El fichero original de tokens es `design/tokens.css`. La fase 0 lo copia a
`src/styles/tokens.css` y lo conecta a Tailwind. Cuando la marca cambie, se
cambia el original y se vuelve a copiar.

Si hay que tocar un componente para conseguir un efecto visual, faltaba un token.
Se corrige añadiendo el token, no escribiendo el valor en el componente. Las
clases de Tailwind con valor arbitrario están prohibidas y una regla de lint las
bloquea.

## Los tokens

Están agrupados por familia en `design/tokens.css`, con la transcripción de la
guía y los añadidos que necesita el sistema marcados como tales.

Color en dos capas. La paleta base con prefijo `--pm-`, que no se usa
directamente, y encima los alias semánticos declarados en pares de superficie y
contenido, para que el contraste se resuelva en el token: `--surface-ink` va con
`--text-on-ink`, `--surface-accent` va con `--text-on-accent`.

Tipografía con cuatro composiciones listas para usar, `--type-logotype`,
`--type-eyebrow`, `--type-lead` y `--type-body`, además de las escalas sueltas de
tamaño, altura de línea, espaciado entre letras y peso.

Espacio en escala de 4 píxeles, de `--sp-1` a `--sp-11`, con medidas de página y
una escala densa aparte para el admin.

Forma sin radios: el corte de esquina a 45 grados con `--clip-chevron`, bordes de
2 píxeles y sombras de placa maciza.

Movimiento con tres duraciones y tres curvas, anuladas bajo
`prefers-reduced-motion` en el propio fichero de tokens.

Capas con nombre, de `--z-header` a `--z-toast`, para que nadie escriba
`z-index: 9999`.

## Sin modo oscuro

La marca ya alterna secciones claras y oscuras dentro de la misma página, así que
un modo oscuro global tendría que reinventar esa alternancia y acabaría
contradiciéndola. La v1 no lo lleva, ni siquiera en el admin.

## La skill de interfaz

En `.claude/skills/` está instalada `ui-ux-pro-max`, una base de datos de
patrones de interfaz y experiencia de usuario con soporte para Next.js, Tailwind
y shadcn/ui. Se invoca antes de construir o revisar cualquier pantalla. La regla
completa está en `CLAUDE.md`.

Sirve para decidir jerarquía, espaciado, estados, contraste y patrones de
interacción. No sirve para elegir la paleta ni la tipografía: eso ya lo decide la
marca y entra por `tokens.css`.

## Inventario de componentes

El admin son veintidós pantallas construidas con los mismos seis componentes
repetidos. Merece la pena construirlos bien una vez.

Las primitivas se escriben en CSS dentro de `@layer components`, no con
utilidades de Tailwind. El lenguaje de la marca se apoya en `clip-path` y en
`drop-shadow` con valores de token, y expresarlo con utilidades obligaría a
clases de valor arbitrario, que están prohibidas. Las utilidades se siguen
usando para maquetar.

Dos cosas de Tailwind v4 que conviene saber: su reset anula cualquier estilo que
no esté en una capa, así que las primitivas van dentro de `@layer components`
para ganarle; y Lightning CSS no resuelve `@import` a ficheros propios, así que
ese CSS vive dentro de `globals.css` en vez de en un fichero aparte.

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

Contraste mínimo AA en todo texto.

Hay una combinación de la marca que hay que vigilar: sobre el turquesa `#54b4a4`
el texto va en tinta, nunca en blanco, porque en blanco no llega. El token
`--text-on-accent` ya lo resuelve, así que el fallo solo aparece si alguien
escribe el color a mano.

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
`font-display: swap`. Cero peticiones a dominios de terceros. Son dos familias de
Google Fonts, Archivo y Bitter, y de Archivo hay que declarar el ancho 88 porque
no es el valor por defecto.

La textura de papel es un PNG de 200 píxeles que se repite. Se sirve desde
`public/brand/` y se aplica solo a bloques de color, nunca sobre una fotografía.

Objetivo: LCP por debajo de 2,5 s y CLS por debajo de 0,1 en móvil con conexión
lenta, medido en `/` y en `/trabajo/:slug`.
