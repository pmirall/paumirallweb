# Identidad visual

La guía llegó como una maqueta de portada funcionando, no como un PDF de normas.
Eso es mejor: las decisiones ya están tomadas en CSS y se pueden leer sin
interpretarlas. Este documento las traduce a reglas.

El fichero de tokens está en `design/tokens.css` y es el original. En la fase 0
se copia a `src/styles/tokens.css`. La maqueta renderizada está en
`design/assets/maqueta-portada.png`.

La paleta viene muestreada de la tarjeta de visita impresa, que está en la
carpeta `branding` del Drive. Eso importa: el sitio tiene que parecerse a algo
que ya existe en papel.

## De qué va esto

Editorial e impreso, no aplicación web. Bloques macizos de color, tipografía
grande en cursiva negra, cero esquinas redondeadas y sombras que son placas
desplazadas en vez de difuminados. Una textura de papel por encima.

Se alterna entre tres tipos de sección a pantalla completa: fondo hueso para el
contenido normal, fondo tinta para lo que tiene que pesar, y fondo turquesa para
los momentos de portada. Esa alternancia es lo que da el ritmo, así que hay que
respetarla al montar páginas nuevas.

## Color

Turquesa `#54b4a4` para los fondos de bloque. Esmeralda `#008b6f` para los
enlaces, los textos de acento sobre fondo claro y el anillo de foco. Tinta
`#1a1b1b` para el texto y los bloques oscuros. Hueso `#f4f2ed` para el fondo de
página. Verde profundo `#0f453c` para las tarjetas dentro de bloques.

Los componentes no usan la paleta base. Usan los alias semánticos, que están
declarados en pares de superficie y contenido para que el contraste se resuelva
en el token: `--surface-ink` va con `--text-on-ink`, `--surface-accent` va con
`--text-on-accent`.

Ojo con el turquesa: sobre él el texto va en tinta, no en blanco. `#54b4a4` con
blanco no llega al contraste mínimo. El token `--text-on-accent` ya apunta a
tinta; el error aparece cuando alguien escribe el color a mano.

El ámbar `#d98218` y el granate `#c2422f` son solo para estados. No se usan como
decoración.

## Tipografía

Archivo para logotipo, titulares e interfaz. Bitter, que es una serif, para los
epígrafes y para los párrafos de entrada. Las dos están en Google Fonts y se
sirven con `next/font`, sin peticiones a dominios de terceros.

Archivo se usa en ancho 88, que es un eje variable de la familia. No es el ancho
por defecto, así que hay que declararlo: si se olvida, el logotipo sale más
ancho de lo que debe.

El logotipo es Archivo cursiva 800. La cursiva no es decorativa, es la marca.

El epígrafe es el detalle que más define el conjunto: Bitter en negrita, tamaño
mínimo, mayúsculas y un espaciado entre letras de `0.34em`, que es enorme. Es lo
que aparece encima de cada título de sección con textos como SELECCIÓN o
SERVICIOS. Con `--type-eyebrow` sale solo.

Cuatro composiciones cubren casi todo: `--type-logotype`, `--type-eyebrow`,
`--type-lead` y `--type-body`. Antes de escribir una combinación nueva de familia,
peso y tamaño, comprueba que no sea una de estas cuatro.

## Forma

El corte de esquina a 45 grados es la firma. Viene de la tarjeta de visita y se
aplica con `clip-path` mediante `--clip-chevron` en tarjetas y bloques grandes, y
`--clip-chevron-s` en botones y etiquetas.

No hay esquinas redondeadas. `--radius-none` es 0 y `--radius-xs` son 2 píxeles
para casos límite como una casilla de verificación. `--radius-pill` existe para
las etiquetas de estado y es lo único que se cierra del todo.

Los bordes son de 2 píxeles y en tinta, no grises finos. El borde forma parte del
dibujo, no es una separación tímida.

Un aviso sobre `clip-path`: recorta el contenido, así que un elemento con
`--clip-chevron` no puede sacar nada fuera de sus límites. Los menús desplegables
y los avisos flotantes no llevan corte.

## Sombra

`--shadow-plate` es un desplazamiento macizo de 14 píxeles sin difuminar. Es lo
que hace que los bloques parezcan impresos y superpuestos. `--shadow-lift` son 2
píxeles y sirve para botones.

Hay dos sombras difuminadas, `--shadow-soft` y `--shadow-print`, y se usan poco:
para el visor de fotos y para elementos que flotan de verdad sobre el contenido.
Si dudas, la placa.

## Movimiento

Transiciones cortas, de 120 a 200 milisegundos, con `--ease-out`. El
desplazamiento al pasar el ratón son 3 píxeles con `--shift-hover`, que combinado
con la sombra de placa da la sensación de que el elemento se apoya.

`--tilt` es una inclinación de poco más de un grado, disponible para elementos
sueltos. Se usa con cuentagotas: dos elementos inclinados en la misma pantalla ya
son demasiados.

Bajo `prefers-reduced-motion` las duraciones bajan a cero y la inclinación
desaparece. Está resuelto en el propio fichero de tokens, así que ningún
componente tiene que acordarse.

## Sin modo oscuro

La marca ya alterna claro y oscuro dentro de la misma página. Un modo oscuro
global tendría que reinventar esa alternancia y acabaría contradiciéndola.

La v1 no lo lleva. La zona de administración, que es donde más sentido tendría
por las horas de uso, se queda igual que el resto.

## Textura

Un papel de 200 por 200 píxeles que se repite cada 110, en
`design/assets/texture-paper-200.png`. En la fase 0 va a `public/brand/`.

Se aplica sobre los bloques grandes de color, no sobre el fondo de página entero
ni sobre las fotografías. Una fotografía no lleva textura encima nunca.

## Qué falta

La guía cubre la web pública. Estas tres cosas no venían y hay que resolverlas
cuando toque:

El logotipo como archivo. Ahora mismo es texto compuesto con Archivo cursiva 800,
que funciona en la web pero no sirve para un favicon ni para una marca de agua.
Hace falta un SVG. En `branding` del Drive hay un fichero llamado
`logo provisional.png` de 2020, que por el nombre no parece definitivo.

La marca de agua de las galerías con factura pendiente. Se compone con el
logotipo, así que depende de lo anterior.

La imagen fija de Open Graph para las páginas que no son un proyecto.

## Reglas al construir

Ningún componente lleva un color, una tipografía, un radio, una sombra ni un
espacio escritos a mano. Todo sale de un token. Si el valor no existe, se añade
el token en `tokens.css`, no el valor suelto en el componente.

Las clases de Tailwind con valor arbitrario están prohibidas y hay una regla de
lint que las bloquea.

Antes de construir una pantalla se invoca la skill `ui-ux-pro-max`, y sus
propuestas de paleta y de tipografía se descartan, porque esas ya están
decididas. Lo que sí se aprovecha es lo que dice sobre jerarquía, estados,
contraste y patrones de interacción. La regla completa está en `CLAUDE.md`.
