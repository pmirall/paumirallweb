# Visión y alcance

## El problema

Ocho años de trabajo repartidos entre carpetas de Google Drive, una web que no se
actualiza porque actualizarla cuesta abrir un editor de código, entregas por
WeTransfer que caducan y hay que repetir, y una contabilidad que vive en un
Excel. Cada encargo se toca cuatro veces en cuatro sitios distintos.

La web nueva no es un rediseño. Es el sitio donde ocurre el trabajo.

## Qué resuelve

Un encargo entra por el formulario de contacto o por WhatsApp, se registra una
vez y a partir de ahí todo cuelga de él: el presupuesto, la carpeta de Drive, la
galería que ve el cliente, la factura, los gastos y las horas. Al final del año
se puede responder a la pregunta de cuánto se gana de verdad por hora en cada
tipo de trabajo, que hoy no se puede responder.

El portfolio se alimenta solo. Cuando una carpeta de Drive se marca como pública
en la cola de enriquecimiento, el proyecto aparece en `/trabajo` sin tocar
código.

El cliente recibe un enlace y un PIN. Ve sus fotos, marca las que quiere, se las
descarga en la calidad que necesita y paga desde la misma pantalla. No crea una
cuenta ni recuerda una contraseña.

## Quién lo usa

Pau, a diario, desde el escritorio y a veces desde el móvil en mitad de un
rodaje. Es el único usuario del panel de administración y no hay planes de que
haya un segundo.

Los clientes de cada encargo, una o dos veces por encargo, durante las semanas
que la galería está activa. Muchos entran desde el móvil.

Quien busca un fotógrafo y aterriza en la web desde Google o desde Instagram.
Este es el visitante que decide si hay negocio, y llega a `/trabajo/:slug` más
que a la portada.

## Qué entra en la versión 1

Las 46 rutas del árbol de pantallas validado, agrupadas en tres zonas. La lista
completa está en `mapa-de-rutas.md`.

De todas ellas, cinco cargan con el peso del producto:

`/trabajo/:slug` es donde se decide una contratación. `/c/:token/galeria` es el
producto visto desde fuera. `/admin/encargos/:id` concentra el trabajo diario.
`/admin/drive/cola` es lo que convierte ocho años de carpetas en portfolio.
`/admin` es la primera pantalla de cada mañana.

El resto son variaciones de estas cinco o formularios y tablas construidos con el
mismo puñado de componentes.

## Qué se queda fuera de la v1

Ni tienda ni venta de copias. Ni blog. Ni reservas con calendario público. Ni
segundo idioma: el sitio va en español y punto. Ni aplicación móvil. Ni acceso
para colaboradores o segundos usuarios. Ni buscador global en el admin, porque
con el volumen actual filtrar por estado y por cliente basta y sobra.

Ninguna de estas se descarta para siempre. Se descartan para la v1 porque
retrasan la fecha en la que el sistema empieza a ahorrar tiempo.

## Decisiones de estructura ya cerradas

El encargo es la unidad central, no el proyecto. Un encargo puede publicarse o no
en el portfolio. Es un interruptor de visibilidad sobre la misma entidad, no dos
entidades que hay que mantener sincronizadas.

El cliente nunca crea cuenta. Enlace más PIN. Esto elimina el registro, la
recuperación de contraseña y los correos de verificación.

Solo tres pantallas de administración se diseñan pensando primero en el móvil: el
dashboard, la ficha de encargo y el alta rápida de gasto. Son las que se usan en
un rodaje o dentro del coche. Las tablas de finanzas y la cola de enriquecimiento
dan por hecho un escritorio.

El visor de fotos de la galería es un modal, no una ruta. Si más adelante hace
falta que el cliente pueda enviar el enlace de una foto concreta, se convierte en
`/c/:token/galeria/:foto` y suma una ruta.

## Cómo se sabe que ha funcionado

Publicar un proyecto en el portfolio pasa de abrir el editor a marcar una casilla.

Entregar un encargo pasa de subir archivos a WeTransfer y escribir un correo a
generar un enlace.

Al cerrar el año existe un número de euros por hora por cada tipo de servicio,
sacado de datos registrados durante el año y no reconstruidos en diciembre.

Ninguna galería entregada vuelve a caducar antes de que el cliente se descargue
lo suyo.

## Riesgos conocidos

Ocho años de carpetas con nombres inconsistentes es el trabajo sucio del
proyecto. La cola de enriquecimiento existe justo para eso, y aun así habrá un
día entero de clasificación manual. Conviene aceptarlo desde el principio en vez
de esperar que la automatización lo resuelva del todo.

La facturación en España tiene requisitos legales que cambian de fecha con cierta
frecuencia. Por eso la factura la emite un proveedor certificado y el sistema
solo guarda la referencia y el PDF. Ver `integraciones.md`.

El volumen de fotos por encargo puede llegar a varios gigabytes. La descarga
completa en alta resolución es el punto del sistema con más probabilidad de dar
problemas y tiene un apartado propio en `arquitectura.md`.
