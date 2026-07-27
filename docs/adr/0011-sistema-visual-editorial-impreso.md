# 0011. Sistema visual editorial, sin radios y sin modo oscuro

Estado: aceptada
Fecha: 2026-07-27

## Contexto

La guía de imagen de marca llegó como una maqueta de portada funcionando, con los
tokens ya escritos en CSS, y no como un documento de normas. La paleta viene
muestreada de la tarjeta de visita impresa.

Eso deja poco que interpretar en color y tipografía, pero sí obliga a decidir tres
cosas que la maqueta impone sin enunciar y que afectan a las treinta y siete
pantallas.

## Decisión

El lenguaje de forma es el corte de esquina a 45 grados, aplicado con `clip-path`
mediante los tokens `--clip-chevron` y `--clip-chevron-s`. No hay esquinas
redondeadas: `--radius-none` es 0, `--radius-xs` son 2 píxeles para casos como
una casilla, y `--radius-pill` queda reservado a las etiquetas de estado.

Las sombras son placas macizas desplazadas, `--shadow-plate` y `--shadow-lift`,
no difuminados. Las dos sombras difuminadas que existen se reservan para lo que
flota de verdad sobre el contenido.

No hay modo oscuro.

Los tokens de la guía se transcriben tal cual a `docs/design/tokens.css`. Lo que
el sistema necesita y la guía no cubría se añade en ese mismo fichero, marcado
como añadido: superficies de estado, escala densa para el admin y escala de
capas.

## Consecuencias

El sitio se parece a algo impreso, que es de donde viene la marca. Es una
identidad reconocible y difícil de confundir con una plantilla.

`clip-path` recorta el contenido, así que un elemento con corte no puede sacar
nada fuera de sus límites. Los menús desplegables, los avisos flotantes y
cualquier cosa que se despliegue van sin corte. Es la restricción práctica más
molesta de esta decisión y conviene tenerla presente al construir las primitivas.

Sin modo oscuro se ahorra la mitad de las combinaciones de color que habría que
probar. La marca ya alterna secciones claras y oscuras dentro de la misma página,
y un modo global tendría que reinventar esa alternancia. El coste es el admin,
que se usa de noche y agradecería un tema oscuro. Se acepta: es un solo usuario y
la coherencia pesa más.

El turquesa `#54b4a4` no da contraste suficiente con texto blanco. El par de
tokens lo resuelve, pero cualquier color escrito a mano puede romperlo. Es otra
razón para la regla de que no se escriben valores sueltos.

Archivo se usa en ancho 88, que no es el valor por defecto de la familia. Hay que
declararlo explícitamente al cargar la fuente.

## Alternativas descartadas

Redondear las esquinas y quedarse solo con la paleta. Sería más rápido de
construir y perdería justo lo que hace reconocible a la marca.

Añadir modo oscuro solo en el admin. Dos sistemas de color que mantener para una
sola persona.

Reinterpretar los tokens de la guía en una arquitectura de tres capas propia.
Añade una traducción entre lo que dice la marca y lo que usa el código, y con
ella la posibilidad de que las dos dejen de coincidir.
