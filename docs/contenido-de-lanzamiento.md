# Contenido de lanzamiento

Todo lo que aparece aquí sale de la maqueta de portada entregada como guía. Es
el texto real con el que sale el sitio, no un relleno de ejemplo.

Al construir, este texto va a los sitios que dice `contenido-y-seo.md`: las
etiquetas de interfaz a `src/content/`, y los servicios, el texto de sobre mí y
las páginas legales a la base de datos, donde se pueden editar desde el admin sin
desplegar.

## Identidad

Nombre: Pau Miralles. Descriptor: fotógrafo y videógrafo, que en la maqueta
aparece siempre en mayúsculas y con el espaciado de epígrafe.

De cara al cliente solo existe Pau Miralles. La maqueta llevaba PAU MIRALL STUDIO
en el pie y sale, junto con la línea del pie que lo contenía. El nombre del
estudio no aparece en la web, ni en los metadatos, ni en los correos.

Una excepción que no es de marca sino legal: la factura la emite un proveedor
certificado y lleva el nombre fiscal que esté dado de alta allí. Eso lo fija la
configuración fiscal, no este documento.

## Posicionamiento

> Retrato de artistas y fotografía de deporte. Vivo en Palma de Mallorca y viajo
> a donde estés trabajando.

Esta frase es la de la portada y define el negocio mejor que ninguna otra. Las
descripciones de posicionamiento del sitio salen de aquí, no de una redacción
nueva.

## Navegación

Inicio, Trabajo, Servicios, Sobre mí, Contacto. En mayúsculas, con el espaciado
de etiqueta.

Aparte va una llamada a la acción destacada, "Reservar sesión", que se repite en
la portada junto a "Ver el trabajo".

Lleva a `/contacto`. No hay ruta `/reservar` y no se crea. Cuando se pulsa desde
una tarjeta de servicio, arrastra el servicio en la query,
`/contacto?servicio=retrato`, y el formulario llega con ese campo ya elegido.
Desde la cabecera va sin parámetro.

## Portada

Bloque principal con el logotipo, el descriptor, la frase de posicionamiento y
dos botones: "Ver el trabajo" y "Reservar sesión".

Sección de selección, con el epígrafe SELECCIÓN, el título "Lo último" y la
entrada:

> Tres trabajos de los dos últimos años, entre escenario y pista.

La maqueta decía seis y enseñaba tres. Son tres, y el texto se ajusta a lo que se
ve.

Y un enlace a "Todo el trabajo". Cada proyecto se muestra con su categoría, su
año y su título.

Los tres proyectos de la maqueta son de ejemplo y sirven para ver el formato:
Júlia Ferrer, artista, 2025. Trail Serra de Tramuntana, deporte, 2025. Sala
Pelaires, vídeo, 2024. Los reales salen de la base de datos.

Sección de sobre mí, con retrato, el epígrafe SOBRE MÍ, el nombre y el texto:

> Trabajo solo, así que hablas conmigo de principio a fin. Vengo del deporte y
> sigo entrenando, que ayuda a saber dónde ponerse.

Tres etiquetas: Palma de Mallorca, Sony A7, Viajo. Y un enlace, "Seguir leyendo",
que lleva a `/sobre-mi`.

## Servicios

Epígrafe SERVICIOS, título "Cómo trabajo" y entrada:

> Tres formatos. Si tu proyecto no encaja en ninguno, escríbeme y lo hablamos.

Las tres tarifas van numeradas 01, 02 y 03, y cada punto de la lista se separa
con una barra en lugar de un topo.

### 01. Retrato de artista

Prensa, portada de disco y material para la gira.

Dos horas en tu espacio. Cuarenta fotos editadas. Versiones para prensa y para
redes.

Desde 320 EUR.

### 02. Deporte

Entrenamiento, competición o sesión de marca.

Cobertura de media jornada. Ciento cincuenta fotos editadas. Entrega en cuarenta
y ocho horas si hay prisa.

Desde 450 EUR.

### 03. Vídeo

Piezas cortas para lanzamientos, patrocinadores y redes.

Guion y rodaje. Montaje de uno a tres minutos. Música con licencia.

Desde 700 EUR.

Estos tres servicios son las filas iniciales de la tabla `services` y se editan
desde `/admin/ajustes/servicios`. Los importes se guardan en céntimos, así que
320 EUR son 32000.

## Contacto

Instagram: @paumirall_studio
Correo: paumirallstudio@gmail.com
Teléfono: +34 676 779 771
Ubicación: Palma de Mallorca, y viaja

En la maqueta la etiqueta del teléfono aparece como TELEFONO, sin tilde. Va con
tilde.

El usuario de Instagram y la dirección de correo llevan la palabra studio dentro.
Son identificadores de cuentas que ya existen, no decisiones de marca, así que se
dejan tal cual aunque el nombre del estudio no aparezca en ningún texto.

## Categorías

Artista, deporte y vídeo. Coinciden con las del árbol de pantallas y con los
identificadores del glosario: `artist`, `sport`, `video`.

En las etiquetas visibles, vídeo lleva tilde.

## Tono

Frases cortas y directas. Tutea. No se vende con adjetivos, se explica qué se
hace y cuánto cuesta.

Dos cosas que hace la maqueta y conviene mantener. Da el precio de entrada sin
rodeos, en la misma tarjeta y sin pedir que escribas para saberlo. Y deja salida
a lo que no encaja, con esa frase de "escríbeme y lo hablamos", en vez de
presentar las tres tarifas como si fueran todo lo que hay.

Los textos que se escriban a partir de ahora pasan por la skill `humanizer` y
tienen que sonar como estos. Si un texto nuevo suena más comercial que la
maqueta, está mal.

## Diferencias con la maqueta

Tres cosas de la maqueta no coincidían con el árbol de pantallas. Están decididas
y ya recogidas arriba; quedan anotadas aquí para que dentro de un año se sepa por
qué el sitio no es idéntico a la maqueta.

"Reservar sesión" no tiene ruta propia y lleva a `/contacto`, con el servicio en
la query cuando se pulsa desde una tarjeta.

La selección de la portada son tres proyectos, como decía el árbol, y la entrada
pasa de decir seis a decir tres.

El nombre del estudio desaparece de la web, pie incluido. De cara al cliente solo
existe Pau Miralles.
