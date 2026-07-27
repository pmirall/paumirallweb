# Plan de ejecución

Siete fases. Cada una entrega algo que funciona y se puede usar, no una capa
técnica a medias.

El orden no es caprichoso. El portfolio público necesita proyectos en la base de
datos, los proyectos salen de encargos, y los encargos de ocho años están en
carpetas de Drive. Por eso el archivo se construye antes que el escaparate,
aunque el escaparate sea lo que más ganas hay de ver.

Las estimaciones asumen una persona trabajando de forma continua. Sirven para
ordenar, no para prometer fechas.

| Fase | Qué entrega | Estimación |
|---|---|---|
| 0 | El proyecto arranca, despliega y tiene tokens | 1 semana |
| 1 | Encargos, clientes y leads en el admin | 2 semanas |
| 2 | Drive sincroniza y la cola convierte carpetas en encargos | 2 semanas |
| 3 | La web pública, con el portfolio saliendo de la base de datos | 2 semanas |
| 4 | La zona de cliente completa | 3 semanas |
| 5 | Presupuestos, facturas, gastos y rentabilidad | 3 semanas |
| 6 | Lanzamiento | 1 semana |

La guía de imagen de marca ya está, con sus tokens escritos, así que no hay nada
que esperar: se aplica desde la fase 0 y la fase 3 se construye ya con la marca
puesta. Ver `identidad-visual.md`.

---

## Fase 0. Fundaciones

Nadie ve nada al terminar esta fase. Sin ella, todo lo demás se construye sobre
arena.

Estado: la parte local está hecha y en verde, incluida la base de datos, que
corre con PGlite. Falta apuntar `DATABASE_URL` a un Supabase real y conectar
Vercel, y las dos cosas necesitan cuentas propias. Tres cosas se decidieron al construirla y no
estaban previstas: TypeScript va fijado en la 6, porque Next 15 no admite la 7;
la configuración va en `next.config.mjs` y no en `.ts`, porque la de TypeScript
no carga; y el alias `@/` se declara también en esa configuración, porque el
empaquetador no lo coge de `tsconfig.json`.

### Qué se hace

Crear el proyecto Next.js 15 con App Router, TypeScript estricto, Tailwind v4 y
pnpm. Configurar ESLint, Prettier y el hook de pre-commit.

Copiar `docs/design/tokens.css` a `src/styles/tokens.css` y conectarlo a Tailwind
con `@theme`. Cargar Archivo y Bitter con `next/font`, declarando el ancho 88 de
Archivo. Copiar la textura de papel y el logotipo de `docs/design/assets/` a
`public/brand/`, y enganchar el favicon y los iconos en los metadatos.

Configurar Drizzle, escribir la primera migración con las tablas de la fase 1 y
dejar `pnpm db:generate`, `pnpm db:migrate` y `pnpm db:seed` funcionando. Crear
el proyecto de Supabase y apuntar `DATABASE_URL` ahí.

El desarrollo y las pruebas no esperan a Supabase. Se usa PGlite, que es
Postgres compilado a WASM y corre en el propio proceso, así que no hace falta
ni Docker ni servidor. El esquema y las migraciones son los mismos que en
producción, de modo que lo que pasa en las pruebas pasa en Supabase. Cambiar de
uno a otro es cambiar `DATABASE_URL`.

Montar `src/lib/env.ts` con validación de variables de entorno al arrancar, y
`.env.example` con todos los nombres.

Montar Vitest y Playwright con una prueba de cada tipo que pase, para que el
andamiaje esté probado.

Montar CI en GitHub Actions y conectar el repositorio a Vercel con despliegue de
producción y vistas previas por rama.

Crear los tres layouts de zona con el middleware que aplica `noindex` y
`Cache-Control` a `/admin` y `/c`.

### Criterios de aceptación

`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y
`pnpm test:e2e` funcionan en limpio tras clonar.

Un push a una rama produce una vista previa desplegada con CI en verde.

Cambiar el valor de `--pm-teal` en `tokens.css` cambia el color en la pantalla de
ejemplo sin tocar ningún componente.

Una pantalla de ejemplo muestra las cuatro composiciones tipográficas, el corte
de esquina y la sombra de placa, y se parece a la maqueta de
`docs/design/assets/maqueta-portada.png`.

Arrancar sin una variable de entorno obligatoria falla con un mensaje que dice
cuál falta.

Una petición a `/admin` devuelve la cabecera `X-Robots-Tag: noindex`.

---

## Fase 1. Núcleo de datos y admin

El primer trozo utilizable. Al terminar, un encargo se puede registrar y seguir
en el sistema en vez de en la cabeza.

### Qué se hace

Esquema completo de `clients`, `leads`, `jobs`, `job_publications`,
`deliverables`, `time_entries` y `audit_log`.

Google Sign-In con Supabase Auth, restringido por lista de correos, y
`/admin/login`. Hasta que haya credenciales de Google, hay un acceso de
desarrollo que emite la misma cookie de sesión firmada, gated para que nunca
surta efecto en un despliegue de Vercel. Así el admin se construye y se prueba
entero, y el Sign-In real se conecta sin tocar ninguna pantalla.

Las primitivas de `src/components/ui/`: botón, campo, selector, casilla,
interruptor, selector de fecha, etiqueta de estado, aviso, modal, panel lateral,
pestañas, tabla con orden y paginación, formulario con errores, estado vacío y
notificación flotante. Construirlas ahora es lo que hace que las veintidós
pantallas del admin salgan rápido después.

Layout del admin con barra lateral y cabecera de página.

`/admin/clientes`, `/admin/clientes/:id`, `/admin/encargos`,
`/admin/encargos/nuevo` y `/admin/encargos/:id` con las pestañas de resumen,
entregables y notas. Las pestañas de archivos, galería y dinero quedan visibles y
vacías, con un texto que dice en qué fase llegan.

`/admin/leads`, `/admin/leads/:id` y la conversión de lead en encargo.

Registro de horas, con un alta que funcione bien desde el móvil.

Un dashboard mínimo en `/admin` con encargos activos y próximos rodajes.

### Criterios de aceptación

Un correo no autorizado que inicia sesión con Google recibe 404 en `/admin`.

Se crea un cliente, se crea un encargo, se recorren todos sus estados y la
línea de tiempo lo refleja.

Un encargo con entregables sin marcar no puede pasar a entregado.

Un lead se convierte en encargo y conserva el texto original.

Cada cambio de estado de encargo deja una fila en `audit_log`.

La ficha de encargo se usa con comodidad en un móvil real.

Cambiar de pestaña conserva lo escrito en un formulario sin guardar.

---

## Fase 2. Drive y la cola de enriquecimiento

La fase que convierte ocho años de carpetas en datos. Es la que más valor
desbloquea y la que más trabajo manual va a exigir aunque salga perfecta.

### Qué se hace

Adaptador de Google Drive en solo lectura, con cuenta de servicio, y su versión
falsa para pruebas y desarrollo local.

Tablas `drive_folders`, `drive_sync_runs`, `media_assets`, `media_derivatives` y
`job_queue`.

Sincronización incremental con la API de cambios, con token de página guardado y
reintento con espera creciente ante límites de cuota. Recorrido de hasta tres
niveles, con clasificación de cada carpeta como encargo, contenedor de cliente o
ignorada, y filtro configurable por tipo de archivo. Ver `drive-inventario.md`.

Generación de derivadas en la cola: miniatura, tamaño web y copia con marca de
agua. La marca de agua se compone repitiendo el mosaico de
`docs/design/assets/logo/marca-de-agua.svg` sobre la variante de tamaño web.

Lectura de Google Calendar para sugerir cliente y fecha a partir de la fecha de
la carpeta.

`/admin/drive` con el estado de la última pasada y los errores.

`/admin/drive/cola`, la pantalla clave de esta fase: una carpeta por fila, con
cliente, categoría y visibilidad pública. Autocompletado, selección múltiple con
acciones en lote y atajos de teclado. Asume escritorio.

`/admin/drive/ajustes` con carpetas raíz, patrón de nombres y exclusiones.

La pestaña de archivos de la ficha de encargo.

### Criterios de aceptación

La primera sincronización completa recorre el Drive real y deja las carpetas en
la cola sin agotar la cuota, y deja anotado el recuento total de carpetas y
archivos, que hoy no se conoce.

Una carpeta de cliente con años dentro, como `Pepo`, se clasifica una vez y sus
sesiones aparecen con el cliente ya sugerido.

Una carpeta con fecha ambigua, como `Jorge.24.13.02`, llega a la cola con la
fecha marcada como dudosa en vez de con un valor inventado.

Los ficheros `.psd` no entran como archivos del encargo.

Una carpeta nueva en Drive aparece en la cola en menos de una hora sin
intervención.

Renombrar una carpeta en Drive no crea una entrada duplicada.

Enriquecer una carpeta crea el encargo con su cliente y sus archivos vinculados.

Cincuenta carpetas se enriquecen en una sesión sin soltar el teclado.

Un archivo con derivadas generadas se muestra en menos de un segundo en la
rejilla del admin.

Un trabajo de la cola que falla tres veces queda en `failed` y sale como aviso en
`/admin/drive`.

Cortar la conexión con Drive a mitad de sincronización no deja datos a medias.

---

## Fase 3. Web pública

La primera fase que ve alguien de fuera, y la primera con la marca puesta de
verdad. El texto con el que sale está en `contenido-de-lanzamiento.md`; no se
redacta nada nuevo salvo lo que allí falte.

Estado: las once rutas públicas están construidas y en verde, con sus esqueletos
de carga, su manejador de error de zona, sitemap, robots y 404 con estado 404 de
verdad. Falta lo que necesita base de datos: que los proyectos, las tarifas y los
textos salgan de Postgres en vez de de `src/lib` y `src/content`, y que el
formulario escriba en `leads` y avise con Resend. La forma del dato ya es la
definitiva, así que ese cambio no toca ningún componente.

También falta el editor de portfolio del admin y la analítica.

### Qué se hace

Layout público con cabecera, pie y navegación.

`/` con hero, tres proyectos destacados, servicios y bloque sobre mí.

`/trabajo` con filtros por categoría en la query y estado vacío por categoría.

`/trabajo/:slug` generada de forma estática desde `job_publications`, con galería,
datos del encargo, texto, navegación al anterior y al siguiente, y sus propios
metadatos.

`/servicios` leyendo `services`, `/sobre-mi` y las tres páginas legales leyendo
`pages`.

`/contacto` con Server Action, validación con Zod, campo trampa, límite por IP y
creación de lead. `/contacto/gracias`. Aviso por correo con Resend.

`/404`.

`/admin/portfolio` y `/admin/portfolio/:id` con portada, orden de las fotos,
textos, texto alternativo y campos de posicionamiento.

`/admin/ajustes/servicios` para editar las tarifas.

Sitemap desde la base de datos, `robots.txt`, datos estructurados, imágenes de
Open Graph e invalidación de caché por etiqueta al publicar.

### Criterios de aceptación

Publicar un proyecto desde el admin lo hace visible en `/trabajo` sin desplegar
nada.

Despublicarlo lo retira y su URL responde 404.

Cambiar una tarifa en el admin se refleja en `/servicios` sin desplegar.

Lighthouse en móvil supera 90 en rendimiento y 95 en accesibilidad y
posicionamiento, en la portada y en una ficha de proyecto.

Una ficha de proyecto compartida en WhatsApp muestra su portada y su título.

Un envío del formulario crea el lead, avisa por correo y lleva a la página de
gracias. Un envío fallido conserva lo escrito.

Una categoría sin proyectos muestra un estado vacío con salida, no una página
vacía.

Las páginas legales llevan texto real o están marcadas como provisionales de
forma visible.

---

## Fase 4. Zona de cliente

El producto visto desde fuera. La fase con más lógica de permisos por petición y
la que más hay que probar en móviles reales.

### Qué se hace

Tablas `galleries`, `gallery_sessions`, `gallery_pin_attempts` y
`gallery_favorites`.

Generación de token y PIN, con hash Argon2id, caducidad y revocación.

Middleware de la zona: resolver el token, comprobar la sesión, aplicar `noindex`
y `no-store`.

Límite de intentos por token y por IP, persistido en la base de datos, con aviso
al admin al quinto fallo.

`/c/:token`, la puerta, con sus cuatro estados.

`/c/:token/galeria`: rejilla con carga progresiva y espacio reservado por
proporción, visor a pantalla completa en modal con teclado, descarga individual y
selector de calidad.

Descarga completa: ZIP en streaming por debajo del umbral, ZIP preparado en
segundo plano por encima, con aviso por correo y caducidad a los siete días. Con
originales de 10 a 19 MB, casi cualquier encargo de deporte cruza el umbral, así
que la rama del ZIP preparado es el camino normal y se construye primero.

Marca de agua servida cuando la factura está pendiente, con bloqueo real de la
alta resolución en el servidor.

`/c/:token/seleccion` con contador y confirmación de envío, que avisa al admin.

`/c/:token/video`, que responde 404 si el encargo no tiene vídeo.

`/c/:token/encargo` con la línea de tiempo y los entregables acordados.

La pestaña de galería en la ficha de encargo: enlace, PIN, caducidad, favoritos
recibidos y revocación.

Correo de entrega con enlace y PIN, y aviso de galería a punto de caducar.

### Criterios de aceptación

Un token válido con PIN correcto entra; con PIN incorrecto muestra los intentos
restantes; con cinco fallos bloquea quince minutos; un token inventado devuelve
404.

La cookie de sesión de una galería no da acceso a otra galería.

Con factura pendiente, todas las fotos llegan con marca de agua y la petición
directa a la derivada sin marca se rechaza en el servidor.

Al marcar la factura como pagada, la marca de agua desaparece sin tocar nada más.

Una galería de 300 fotos muestra la primera fila en menos de dos segundos en
móvil con conexión lenta.

Un ZIP de 2 GB se descarga entero sin que la función se quede sin tiempo.

Una galería caducada explica qué pasa y ofrece pedir la reapertura.

Revocar una galería desde el admin corta el acceso al instante.

Ninguna URL de Google Drive aparece en el HTML ni en las peticiones de red.

Todo el recorrido funciona en un iPhone y en un Android reales.

---

## Fase 5. Dinero

La fase que responde a la pregunta de cuánto se gana de verdad.

### Qué se hace

Elegir proveedor de facturación y escribir el ADR. Hasta entonces, todo se
construye contra el adaptador falso.

Tablas `quotes`, `quote_lines`, `invoices`, `payments` y `expenses`.

`/admin/finanzas/presupuestos` y su editor, con envío por correo y enlace público
de aceptación.

Adaptador de facturación y `/admin/finanzas/facturas` con el detalle de la
factura emitida, su PDF y su URL de verificación. Rectificativas enlazadas.

Stripe Checkout, webhook con verificación de firma e idempotencia, y la
transacción que marca la factura como pagada, registra el pago y quita la marca
de agua.

`/c/:token/factura` y `/c/:token/factura/ok`, que no se fía del retorno del
navegador.

`/admin/finanzas/gastos` con alta rápida desde el móvil y foto del ticket.

`/admin/finanzas/cobros` ordenado por antigüedad, con recordatorio automático.

`/admin/finanzas/rentabilidad`, que cruza importes, gastos y horas para dar euros
por hora por encargo y por servicio.

`/admin/finanzas` como resumen del mes.

La pestaña de dinero de la ficha de encargo.

`/admin/ajustes/facturacion` y `/admin/ajustes/plantillas`.

### Criterios de aceptación

Un presupuesto se envía, el cliente lo acepta desde el enlace y el encargo pasa a
confirmado.

Una factura se emite a través del proveedor y su PDF y su URL de verificación se
guardan aquí.

Una factura emitida no se puede editar ni borrar; corregirla genera una
rectificativa enlazada.

Un pago con Stripe marca la factura como pagada, registra el pago y quita la
marca de agua de la galería.

El mismo webhook recibido dos veces no crea dos pagos.

Un pago por transferencia registrado a mano produce el mismo efecto.

Un gasto se da de alta desde el móvil con foto del ticket en menos de treinta
segundos.

La pantalla de rentabilidad da un número de euros por hora en un encargo cerrado
que cuadra con el cálculo hecho a mano.

Toda escritura sobre dinero deja fila en `audit_log`.

---

## Fase 6. Lanzamiento

### Qué se hace

Redactar las páginas legales con asesoría y sustituir los textos provisionales.

Sacar la lista de URL de la web actual y escribir las redirecciones en
`next.config.ts`, cada una con su comentario.

Pasar la política de seguridad de contenido de modo informe a modo bloqueo.

Conectar la analítica sin cookies y Search Console, y enviar el sitemap.

Elegir y conectar la herramienta de registro de errores.

Repaso de accesibilidad con teclado y lector de pantalla sobre las cinco
pantallas que importan.

Probar la restauración de una copia de seguridad y anotar cuánto tarda.

Cargar los datos reales: clientes, encargos abiertos y el archivo enriquecido.

Cambiar el DNS y vigilar veinticuatro horas.

### Criterios de aceptación

Toda URL antigua con tráfico responde 301 a su equivalente o 410 a propósito.

La política de seguridad de contenido está en modo bloqueo y no rompe ninguna
pantalla.

Search Console tiene el sitemap y no reporta errores de rastreo a los siete días.

`/admin` y `/c` no aparecen en ningún índice.

Una copia de seguridad se ha restaurado de verdad.

Las páginas legales tienen texto definitivo.

Un encargo real completo, desde el lead hasta el cobro, ha pasado por el sistema.

---

## Después de la v1

Nada de esto entra ahora. Se anota para no volver a discutirlo cada vez que surja.

Ruta propia para cada foto de la galería, si hace falta compartir una concreta.
Buscador global en el admin, cuando haya unos trescientos encargos. Venta de
copias. Segundo idioma. Acceso para colaboradores. Aplicación móvil.

Cada uno de estos empieza por un ADR, no por una rama.
