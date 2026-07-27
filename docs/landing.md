# La portada

Qué tiene que hacer la primera pantalla, por qué está compuesta así y qué hay
que respetar al convertirla en componentes durante la fase 3.

El prototipo funcionando está en `design/landing/prototipo.html`. Se abre con
cualquier navegador desde el repositorio. No es código de producción: sirve para
ver la composición y el movimiento antes de escribir los componentes.

## Qué tiene que sentir quien entra

Llega alguien que gestiona a un artista o lleva la comunicación de un club, casi
siempre desde Instagram y casi siempre en el móvil. Tiene unos segundos de
atención y tres preguntas en la cabeza sin formular.

La primera es si este tío sabe. Se responde con una fotografía grande y con una
composición que parece impresa por alguien con criterio, no montada con una
plantilla.

La segunda es si hace lo que yo necesito. Se responde antes de bajar: el rótulo
en marcha dice retrato de artistas, fotografía de deporte y vídeo, y las tres
categorías vuelven a aparecer en la selección de trabajos.

La tercera es cuánto cuesta y si puedo hablar con él. Se responde con el precio
como titular y con un solo botón repetido.

La maqueta de marca respondía bien a la tercera y flojo a la primera, porque el
peso lo llevaba el texto y las fotos eran huecos. Aquí se invierte.

## La idea

La marca viene de la imprenta: bloques macizos, cortes a 45 grados y sombras que
son planchas desplazadas. La portada lleva esa idea a escala de página.

Las secciones no se separan con una línea recta sino con un corte diagonal, el
mismo ángulo del logotipo. Al bajar, la página no pasa de una sección a otra:
pasa de página.

Y el gesto central es una plancha de tinta con el nombre cruzando por delante de
la foto de portada. Tipografía encima de imagen, que es lenguaje de revista, y
además resuelve un problema real de contraste que se explica más abajo.

## Estructura

Hero a pantalla completa sobre turquesa, con el rótulo en marcha arriba, la banda
de foto a todo el ancho, la plancha con el logotipo cruzándola, la frase de
posicionamiento con los dos botones, y abajo la hoja de contactos con el aviso de
deslizar.

Franja de tinta con las constantes en marcha: artista, deporte, vídeo, Palma de
Mallorca, viajo.

Selección sobre hueso con tres trabajos escalonados a distinta altura, cada uno
con su categoría, su año y su título.

Servicios sobre tinta con las tres tarifas, donde el precio es el titular.

Sobre mí sobre hueso, con el retrato y el texto que ya estaba escrito.

Contacto sobre turquesa, con el botón grande y las tres vías de contacto.

Pie sobre tinta.

## Decisiones que conviene no deshacer

### El precio es el titular

En la maqueta, "desde 320 EUR" iba abajo y en cuerpo pequeño. Aquí el número va
en tipografía de titular y lo que se encoge es la palabra "desde" y la moneda.

Para quien contrata una sesión, el precio no es la letra pequeña: es la
información que decide si sigue leyendo. Enseñarlo sin rodeos es lo que más
confianza genera de toda la página, y encaja con el tono que ya tenía la maqueta.

### El logotipo cruza dentro de su propia plancha

Poner el nombre directamente encima de la foto era la primera idea y no funciona.
El logotipo en tinta cruzando una foto oscura no se lee, y en hueso sobre el
turquesa se queda en 2,49:1, que es un suspenso claro.

La solución sale de la propia marca: el nombre viaja dentro de una plancha de
tinta con el corte a 45 grados, y esa plancha es la que cruza la foto. Hueso
sobre tinta da 17:1, se mantiene el cruce y no hay que inventar nada.

### La foto manda

La advertencia principal para un portfolio es mucho texto y mala exposición de
las fotos. La portada reserva una banda a todo el ancho arriba, tres piezas
escalonadas en la selección y un retrato en sobre mí.

Mientras no haya fotos reales, esos huecos se pintan como fotogramas de una hoja
de contactos, con su código de fotograma. No parecen imágenes rotas, parecen
película sin revelar. Es un apaño digno, no el objetivo.

## Movimiento

Todo el movimiento sale de tokens y ninguno es decorativo: o indica que algo se
puede pulsar, o indica que hay más página debajo.

La cabecera empieza transparente sobre el turquesa y se convierte en una plancha
de tinta al salir del hero.

El hero se aleja al bajar, con opacidad y un desplazamiento corto, atado a la
posición de la barra de desplazamiento.

Las tres piezas de la selección derivan a distinta velocidad, la primera y la
tercera en un sentido y la del medio quieta. Es poco, entre 20 y 25 píxeles, lo
justo para que la rejilla respire.

Los bloques aparecen con una subida corta al entrar en pantalla, escalonados de
80 en 80 milisegundos.

Los botones hacen la prensa: al pasar el ratón se separan de su sombra y al
pulsar se meten dentro de ella. Es el gesto mecánico de la marca aplicado a la
interacción.

Los dos rótulos en marcha son continuos y no se detienen.

Nada de esto se ancla al scroll más de una vez, no hay parallax sobre texto y
todo desaparece bajo `prefers-reduced-motion`, que ya está resuelto en el fichero
de tokens.

Se implementa con animaciones CSS atadas al scroll y un observador de intersección
para las apariciones. Sin librerías de animación: pesan y este sitio tiene un
objetivo de rendimiento por encima de 90.

## Lo que se aprendió construyéndolo

Cuatro cosas que costaron un rato y conviene que no vuelvan a costarlo.

`clip-path` recorta la sombra. Cualquier elemento con el corte a 45 grados pierde
su `box-shadow`. La sombra de plancha se hace con `filter: drop-shadow`, que sí
sigue la forma cortada. Afecta a botones, tarjetas y placas, o sea a casi todo.

La textura de papel cuesta contraste. Con multiply al 50 por ciento, el turquesa
baja de `#54b4a4` a `#389986` y el texto en tinta cae de 6,94 a 4,99. Está a 32
por ciento por eso. Y sobre turquesa, el esmeralda profundo se queda en 3,13, así
que todo el texto legible sobre turquesa va en tinta.

La textura tiene que ir por debajo del contenido. Si se pinta encima, el multiply
tiñe los blancos y el logotipo deja de ser blanco.

Dentro de una rejilla, `margin-inline: auto` anula el estirado y el contenedor se
encoge al contenido. Necesita `width: 100%`.

## Accesibilidad

El contenido no depende del JavaScript para verse. El estado oculto de las
apariciones solo se aplica si hay JavaScript, así que sin él, y para quien
rastrea la página, todo está visible desde el primer momento.

Todas las áreas pulsables llegan a 44 píxeles. En los enlaces pequeños se
consigue con un pseudoelemento que amplía el área sin mover la composición.

Contrastes comprobados sobre el resultado renderizado, no sobre los valores
nominales: hueso sobre tinta 17,3, tinta sobre turquesa texturado 5,7, esmeralda
oscuro sobre hueso 5,8. El esmeralda normal sobre hueso se queda en 3,81 y por
eso los epígrafes sobre fondo claro van en esmeralda oscuro.

Sin desbordamiento horizontal a 390, 768 ni 1440.

## Las fotos

La portada está cableada para recibirlas. Se dejan cinco archivos con nombre fijo
en `design/landing/fotos/` y entran solas; si falta alguno, ese hueco se queda con
el marcador y la página sigue funcionando. Los nombres, formatos y tamaños están
en el README de esa carpeta. No entran en git.

Elegirlas desde este entorno no es posible: la política de red bloquea Google y
el conector de Drive devuelve vacío para imágenes, así que se pueden listar las
carpetas pero no ver ni descargar el contenido. La selección la hace una persona.

De lo que hay en `02-Sesiones`, estas son las candidatas por fecha y por variedad,
con la categoría inferida del nombre de la carpeta y por tanto sin confirmar:

Lo más reciente son `Pepo/2026/Group.21.06.26` e `Intensive 06.06.26`, de junio de
2026, y `Pepo Cape town 26.03.02`, de marzo.

De 2025: `Perales.25.11.07`, `Marlene.25.07.01`, `Luca.25.07.01`,
`Gabrielle.25.06.25`, `Autumn.25.06.26` e `Inca Street Art 25.05.17`.

Con pinta de deporte: `ElToroRugby.24.06.15` y `Horizontal_convention.24.10.25`.

Lo que más se va a notar es que las tres piezas de la selección sean de categorías
distintas. Ahí lo que se demuestra es el rango, y eso pesa más que lo buena que
sea cada foto por separado.

Los enlaces del menú apuntan a anclas dentro de la propia página porque aquí solo
existe la portada. En producción van a sus rutas, y "Reservar sesión" a
`/contacto`, como se decidió.

Dos frases nuevas que no venían de la maqueta y que conviene aprobar o cambiar:
el título de la sección de contacto, "Cuéntame qué necesitas", y su entradilla,
"Escríbeme con la fecha y el sitio. Te contesto con un presupuesto cerrado".

## Al pasar a componentes

La portada se descompone en cabecera, hero, franja, selección, servicios, sobre
mí, contacto y pie. La placa, el botón, la etiqueta de categoría y el epígrafe
son primitivas y se construyen en `src/components/ui/` antes que las secciones,
porque el resto del sitio las usa.

Ningún valor del prototipo está escrito a mano: todo sale de `tokens.css`. Al
convertirlo, esa propiedad se mantiene o el trabajo no está hecho.
