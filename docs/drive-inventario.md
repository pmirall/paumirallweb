# Inventario del Drive

Exploración en solo lectura del Drive real, hecha antes de diseñar la
sincronización. Sirve para que la cola de enriquecimiento se construya contra lo
que hay, no contra lo que sería cómodo que hubiera.

Lo que sigue son datos observados. Donde hay una muestra en vez de un recuento
completo, se dice.

## La raíz

La carpeta principal contiene esto:

| Carpeta | Qué parece contener |
|---|---|
| `00-Organización` | administración |
| `01-Videos` | material de vídeo |
| `02-Sesiones` | las sesiones de fotos, que es lo que alimenta la web |
| `03-Cortos` | piezas cortas |
| `04-Prints` | material para impresión |
| `05-stories` | material vertical para redes |
| `branding` | tarjeta de visita, logotipo, textos |
| `Backup` | copia |
| `Composition` | referencias |
| `Vintage` | referencias |
| `Viajes` | personal |
| `Product photography` | producto |
| `Fotos Spartan 2024` | una competición concreta, fuera de `02-Sesiones` |
| `Mis fotos de perfil` | personal |
| `Pedidos` | encargos de copias |
| `Hashtags` | notas de redes |

Hay además un documento de Google suelto en la raíz, `Wrainstorm dossier Pepo`.

Solo seis carpetas llevan prefijo numérico. El resto creció sin convención, y
algunas contienen trabajo real que no está en `02-Sesiones`, como `Fotos Spartan
2024`. La configuración de carpetas raíz en `/admin/drive/ajustes` tiene que
permitir varias, no una.

## Las sesiones

`02-Sesiones` tiene 41 carpetas hijas. Y no todas son lo mismo, que es el hallazgo
que más afecta al diseño.

Hay tres formas distintas conviviendo.

La mayoría son sesiones sueltas con nombre y fecha, del estilo `Marlene.25.07.01`
o `Perales.25.11.07`.

Otras son carpetas de cliente sin fecha, como `Pepo`, `Carlos`, `Adela`, `Aimee`
o `Family`. Dentro de `Pepo` hay una carpeta por año, de 2020 a 2026, y dentro de
cada año las sesiones: `2026` contiene `Group.21.06.26` e `Intensive 06.06.26`.

Y hay carpetas que no son de un cliente sino de un evento o un tema, como
`Inca Street Art 25.05.17`, `ElToroRugby.24.06.15` o `Horizontal_convention.24.10.25`.

Consecuencia directa: una carpeta no equivale a un encargo. La cola tiene que
recorrer al menos tres niveles y dejar decidir, carpeta a carpeta, si es un
encargo, un contenedor de cliente o algo que se ignora.

## Cómo están escritos los nombres

El patrón dominante es `Nombre.AA.MM.DD`. A partir de ahí, todo lo que puede
variar, varía:

| Nombre real | Qué pasa |
|---|---|
| `Isabella.23.11.112` | día de tres cifras |
| `Jorge.24.13.02` | mes 13, aquí el orden es año, día, mes |
| `Whekau.24.05,03` | coma en lugar de punto |
| `HormiLucio22.10.23` | sin separador entre nombre y fecha |
| `Pepo Cape town 26.03.02` | espacios y varias palabras |
| `Inca Street Art 25.05.17` | espacios |
| `Horizontal_convention.24.10.25` | guion bajo |
| `MarlenendPepo.23.03.26` | dos nombres pegados |
| `Group.21.06.26` | dentro de la carpeta de año 2026, así que aquí es día, mes, año |
| `Family`, `Carlos`, `Adela` | sin fecha |

Ese último caso es el peor: la misma cifra puede ser el año o el día según la
carpeta. `Group.21.06.26` está dentro de `2026`, y eso es lo único que permite
resolverlo.

De ahí salen tres reglas para la cola:

La fecha que se extrae del nombre es siempre una sugerencia y la pantalla la
muestra como tal, nunca la aplica sola.

Cuando la carpeta está dentro de una de año, ese año manda sobre el que se
deduzca del nombre.

La fecha de creación de la carpeta en Drive no sirve como respaldo. Muchas de
estas se crearon el mismo día de 2023, cuando se reorganizó el Drive, y no tienen
nada que ver con la fecha del trabajo.

Y una consecuencia de producto: el cruce con Google Calendar deja de ser un
adorno. En las carpetas sin fecha fiable es la única pista automática que queda.

## Qué hay dentro de una sesión

Muestra tomada de `Perales.25.11.07`, sin subcarpetas.

Los originales son JPEG con el nombre que pone la cámara, `DSC00671.jpg` y
similares, de entre 10 y 19 MB cada uno. Junto a ellos conviven un fichero de
trabajo de Photoshop de 22 MB y una exportación en PNG.

Tres cosas que se derivan de esto.

El filtro por tipo de archivo no es opcional. Los `.psd` se ignoran, y el
selector de qué extensiones entran es configurable desde
`/admin/drive/ajustes`, porque aparecerán casos que hoy no se ven.

El peso confirma el diseño de la descarga. A 15 MB de media, las 150 fotos
editadas del servicio de deporte son más de 2 GB. El umbral de 500 MB que separa
el ZIP en streaming del ZIP preparado se cruza en casi cualquier encargo de
deporte, así que la rama del ZIP preparado no es un caso raro: es el camino
normal y hay que construirla bien.

Y hace falta distinguir entregable de material de trabajo. Un PNG exportado junto
a un PSD probablemente sea una prueba, no una foto para el cliente. Mientras no
haya una convención, todo lo que no sea JPEG entra en la cola marcado como
dudoso, y se decide a mano.

## Lo que hay en branding

`Tarjeta de visita 1 front.png` y `Tarjeta de visita 1 back.png`, con sus PSD.
Son el origen de la paleta de la guía de imagen de marca.

`logo provisional.png`, de 2020 y de 11 KB. Por el nombre y por el peso, no es un
logotipo definitivo. Sigue haciendo falta un SVG, como dice `identidad-visual.md`.

Un documento llamado `Meet the photographer`, que puede servir de material para
`/sobre-mi`.

## Lo que no se ha mirado

`01-Videos`, `03-Cortos`, `04-Prints`, `05-stories` y `Pedidos` no se han
explorado por dentro. Los tres primeros importan para los entregables de vídeo y
para la pestaña de archivos del encargo, y conviene mirarlos antes de la fase 2.

Tampoco se ha hecho un recuento total de archivos. Para dimensionar la primera
sincronización completa hace falta ese número, y es lo primero que debe dar la
fase 2.

## Sobre los permisos

Esta exploración se hizo solo con operaciones de lectura. No se creó, copió,
movió ni modificó nada.

Es la misma regla que aplica al sistema entero: el alcance de la API es
`drive.readonly` y no hay ninguna ruta de código con permiso de escritura sobre
Drive. Está en el [ADR 0006](adr/0006-drive-solo-lectura-y-derivadas-propias.md).
