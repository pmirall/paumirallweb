# Pruebas y calidad

## Qué se prueba

No se persigue un porcentaje de cobertura. Se prueba lo que rompe caro y lo que
rompe en silencio.

Rompe caro: los permisos de la zona de cliente, el cálculo de importes, el estado
de las facturas y el bloqueo de la descarga en alta resolución.

Rompe en silencio: la sincronización con Drive, la generación de derivadas y los
trabajos en segundo plano. Nadie mira esas pantallas hasta que hace falta algo de
ahí, y para entonces lleva rota tres semanas.

Lo que no se prueba con tests automáticos: que una pantalla se vea bien. Para eso
está mirarla.

## Pruebas unitarias

Vitest. Van sobre funciones puras y sobre lógica de dominio aislada de la base de
datos.

Cubren: cálculo de subtotales, IVA y totales; la regla que decide si una galería
lleva marca de agua; el cálculo de euros por hora; la interpretación del nombre
de carpeta de Drive para extraer fecha y cliente; el formateo de dinero y de
fechas; los esquemas de Zod con entradas válidas y con entradas hostiles.

El fichero de prueba vive junto al que prueba, con extensión `.test.ts`.

## Pruebas de integración

También con Vitest, contra Postgres real y migrado desde cero. No hace falta
Docker: se usa PGlite, que es Postgres compilado a WASM y corre dentro del propio
proceso de las pruebas. Nada de simular el ORM, porque una consulta que se prueba
contra un doble no prueba nada sobre SQL.

Arrancar PGlite cuesta unos segundos, así que se levanta una base por fichero y
se vacían las tablas entre pruebas en vez de volver a migrar. La diferencia entre
hacerlo bien y hacerlo mal es de 34 segundos a 7.

Cubren: las funciones de `src/db/queries/`; las Server Actions completas,
incluida la comprobación de permisos; las reglas de integridad del modelo de
datos, comprobando que lo que debe fallar falla; y el vaciado de la cola de
trabajos, incluido el reintento y el paso a fallido.

Las llamadas a Drive, Stripe, el proveedor de facturación y Resend se hacen
contra implementaciones falsas de los adaptadores. Esto es exactamente para lo
que existen los adaptadores.

## Pruebas de extremo a extremo

Playwright, sobre Chromium y sobre WebKit móvil. Pocas y bien elegidas, porque
son lentas y se rompen solas.

Los recorridos que se prueban:

Un visitante entra en la portada, va al archivo, filtra por una categoría, abre
un proyecto y navega al siguiente.

Un visitante rellena el formulario de contacto y el lead aparece en el admin.

Un cliente abre su enlace, falla el PIN, acierta el PIN, ve la galería, marca dos
favoritas, confirma la selección y descarga una foto.

Un cliente con la factura pendiente ve las fotos con marca de agua y recibe el
bloqueo al pedir la alta resolución.

Pau entra en el admin, crea un encargo desde un lead, genera la galería y copia el
enlace.

Pau enriquece tres carpetas en la cola y una de ellas aparece publicada en
`/trabajo`.

Cada recorrido parte de una base de datos sembrada con `pnpm db:seed`, sin
depender del estado que haya dejado el anterior.

## Accesibilidad

Comprobación automática con axe integrada en las pruebas de Playwright, sobre las
pantallas públicas y sobre la galería del cliente. Un fallo de contraste o una
imagen sin texto alternativo rompe la construcción.

Lo automático no lo detecta todo. Antes del lanzamiento se recorren las cinco
pantallas que importan solo con teclado y con un lector de pantalla.

## Rendimiento

Lighthouse en CI sobre `/` y sobre una ficha de proyecto, con umbrales que
bloquean: rendimiento por encima de 90, accesibilidad por encima de 95,
posicionamiento por encima de 95.

Además, dos medidas propias que Lighthouse no da: el tiempo hasta que se ve la
primera fila de fotos en una galería de 300 imágenes, y el tiempo hasta el primer
byte del ZIP en streaming.

## Integración continua

En cada push: instalación con caché, lint, comprobación de tipos, pruebas
unitarias y de integración, y construcción. En los pull requests, además, las
pruebas de extremo a extremo y Lighthouse.

Todo tiene que pasar en verde antes de fusionar. Una prueba que falla de forma
intermitente se arregla o se borra el mismo día; una suite en la que nadie confía
es peor que no tener suite.

## Datos de ejemplo

`pnpm db:seed` deja una base de datos con la que se puede trabajar de verdad: tres
clientes, seis encargos repartidos por todos los estados, uno con galería activa y
factura pagada, otro con galería activa y factura pendiente para ver la marca de
agua, uno caducado, dos publicados en el portfolio, quince carpetas en la cola de
enriquecimiento, y presupuestos, facturas y gastos suficientes para que la
pantalla de rentabilidad muestre números.

Las imágenes de ejemplo son fotografías libres incluidas en el repositorio, no
enlaces a servicios externos que algún día devuelvan 404.

## Revisión antes de dar algo por terminado

`pnpm lint && pnpm typecheck && pnpm test` en verde.

Los criterios de aceptación de la fase, leídos uno a uno.

La pantalla probada en un móvil real si es una de las tres que se diseñan primero
para móvil.

La documentación actualizada si el cambio la contradice.
