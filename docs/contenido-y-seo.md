# Contenido y posicionamiento

## Dónde vive cada texto

Ningún texto visible se escribe dentro de un componente. Hay dos sitios posibles
y la regla para elegir es sencilla: si lo va a cambiar Pau sin llamar a nadie, va
en la base de datos; si solo cambia con un despliegue, va en un fichero.

En `src/content/`, en ficheros TypeScript exportando objetos tipados: etiquetas de
la interfaz, mensajes de error, textos de estados vacíos, botones, títulos de
sección, avisos legales cortos del pie.

En la base de datos: las tarifas de `/servicios`, el texto de `/sobre-mi`, las
tres páginas legales, los textos de cada proyecto publicado y las plantillas de
correo.

Los textos de `src/content/` se agrupan por zona y por pantalla, no en un único
fichero gigante. La clave describe el sitio, no el contenido: `gallery.pin.error`
y no `pinIncorrecto`.

## Tono

Español de España, tuteando. Frases cortas. Sin jerga de fotógrafo cuando escribe
para el cliente y sin jerga de programador cuando escribe para Pau.

Los mensajes de error dicen qué ha pasado y qué hacer. "El PIN no es correcto. Te
quedan tres intentos" sirve. "Error de autenticación" no.

Todo texto pasa por la skill `humanizer` antes de entrar en el repositorio. Sin
em dashes, sin emojis decorativos, sin mayúscula inicial en cada palabra de un
título, sin listas de tres por costumbre.

## Metadatos

Cada ruta pública define su título y su descripción con el API de metadatos de
Next. Nada de un título genérico repetido.

Título: entre 50 y 60 caracteres, con el nombre al final. Descripción: entre 140
y 160, escrita para que alguien la lea, no para meter palabras.

`/trabajo/:slug` saca el título y la descripción de `job_publications`, con dos
campos editables desde `/admin/portfolio/:id`. Si están vacíos, se genera uno a
partir del título del proyecto y la categoría, pero el editor avisa de que
conviene escribirlo.

Open Graph e imagen de compartición en todas las páginas públicas. La imagen de
un proyecto es su portada. La del resto del sitio es una imagen fija que se
define con la guía de marca.

Datos estructurados: `Person` y `LocalBusiness` en la portada, `ImageGallery` en
cada ficha de proyecto, `BreadcrumbList` en las rutas anidadas. Es lo que hace
que Google entienda que hay un fotógrafo detrás y no un blog.

## Sitemap y robots

`sitemap.xml` generado desde la base de datos, con las rutas públicas y una
entrada por proyecto publicado, con su fecha de última modificación real.

`robots.txt` permite todo lo público y bloquea `/admin` y `/c`. El bloqueo real
lo hace la cabecera `X-Robots-Tag`; el fichero es la primera línea, no la única.

## Migración desde la web actual

Antes de lanzar hay que sacar la lista de URL de la web actual que reciben
tráfico o tienen enlaces entrantes. Fuentes: Search Console, los registros del
servidor y una exploración del sitio.

Cada URL antigua acaba en uno de tres sitios: la ruta equivalente nueva con
redirección 301, la portada con 301 si no hay equivalente claro, o un 410 si la
página desaparece a propósito y no interesa que se siga pidiendo.

Las redirecciones van en `next.config.ts`, en una lista con comentario que
explique de dónde salió cada una. Una redirección sin explicación es una
redirección que nadie se atreverá a borrar dentro de dos años.

Search Console conectado antes del lanzamiento, con el sitemap enviado el mismo
día. Las dos semanas siguientes se revisan los errores de rastreo.

## Imágenes y posicionamiento

El nombre del archivo que se sirve importa poco; el texto alternativo importa
mucho. Es un campo obligatorio en el editor de proyecto.

Las derivadas se sirven en WebP con AVIF cuando el navegador lo acepta. El
original nunca se sirve en una página pública.

La portada de un proyecto se marca con prioridad de carga. El resto de la galería
carga de forma diferida.

## Medición

Analítica sin cookies, sin identificación de personas y sin banner. Se mide qué
páginas se ven, de dónde llega la gente y qué se pulsa en el formulario de
contacto.

Las tres preguntas que la analítica tiene que poder responder: qué proyectos se
miran más, cuánta gente llega a `/contacto` y cuánta lo envía, y qué buscó en
Google quien acabó contratando.
