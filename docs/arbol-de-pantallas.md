# Árbol de pantallas, v1

El inventario de pantallas tal como se validó. Es el documento de partida del
proyecto y aquí queda como registro.

Para trabajar, usa `mapa-de-rutas.md`, que traduce este árbol a decisiones
técnicas: accesos, renderizado y comportamiento ante errores.

Tres zonas independientes, un solo sistema de diseño.

## Zona A, público

Sin autenticación. Indexable.

| Ruta | Contenido |
|---|---|
| `/` | hero, selección de tres proyectos, servicios, bloque sobre mí |
| `/trabajo` | archivo con filtros de todo, artista, deporte y vídeo, y estado vacío por categoría |
| `/trabajo/:slug` | ficha de proyecto: galería, cliente, año, categoría, texto corto, navegación anterior y siguiente, metadatos propios |
| `/servicios` | las tres tarjetas más el bloque de "nada de esto encaja", editable desde el admin |
| `/sobre-mi` | texto |
| `/contacto` | formulario que crea un lead en el backoffice |
| `/contacto/gracias` | confirmación |
| `/legal/aviso-legal` | texto |
| `/legal/privacidad` | texto |
| `/legal/cookies` | texto |
| `/404` | error |

11 rutas, 9 pantallas reales.

La portada evoluciona la actual: los proyectos salen de la base de datos.
`/trabajo/:slug` es nueva.

## Zona B, cliente

Sin registro. Enlace privado con token más PIN de cuatro dígitos. Todo cuelga de
`/c/:token`.

| Ruta | Contenido |
|---|---|
| `/c/:token` | puerta: PIN, nombre del encargo, aviso de caducidad. Estados de correcto, PIN erróneo, galería caducada y token inválido |
| `/c/:token/galeria` | la entrega. Rejilla de fotos, visor a pantalla completa en modal, descarga individual y completa, selector de calidad, marca de agua si la factura está pendiente |
| `/c/:token/seleccion` | favoritas marcadas, con contador y confirmación de envío |
| `/c/:token/video` | entregables de vídeo, solo si el encargo los tiene |
| `/c/:token/encargo` | línea de tiempo de confirmado, rodado, editando y entregado, con fechas y entregables |
| `/c/:token/factura` | PDF con QR del proveedor certificado y botón de pago |
| `/c/:token/factura/ok` | pago confirmado |

7 rutas, 6 pantallas reales.

## Zona C, administración

Solo Pau. Google Sign-In. `noindex` en todo.

Entrada: `/admin/login` y `/admin`, el dashboard, con encargos activos, entregas
pendientes, cobros pendientes y próximos rodajes, más los avisos de galerías por
caducar, facturas vencidas y carpetas nuevas en Drive.

Trabajo: `/admin/leads` y `/admin/leads/:id`, que convierte un lead en encargo.
`/admin/encargos`, `/admin/encargos/nuevo` y `/admin/encargos/:id`, la ficha de
encargo, que es el centro de gravedad, con pestañas de resumen, archivos,
galería, dinero y notas. `/admin/clientes` y `/admin/clientes/:id` con historial
y facturación acumulada.

Drive y contenido: `/admin/drive` con el estado de la sincronización,
`/admin/drive/cola` con la cola de enriquecimiento, `/admin/drive/ajustes` con
carpetas raíz, convención de nombres y exclusiones, y `/admin/portfolio` con
`/admin/portfolio/:id` para publicados, borradores y el editor de portada, orden,
textos y posicionamiento.

Dinero: `/admin/finanzas` como resumen, más presupuestos, facturas, gastos,
cobros y rentabilidad, cada uno con su lista y, donde procede, su detalle.

Ajustes: perfil, servicios, Drive, facturación y plantillas de correo.

28 rutas, 22 pantallas reales.

## Resumen de esfuerzo

| Zona | Rutas | Pantallas | Peso de diseño |
|---|---|---|---|
| Público | 11 | 9 | alto, es el escaparate |
| Cliente | 7 | 6 | alto, lo ve quien paga |
| Admin | 28 | 22 | medio, funcional |
| Total | 46 | 37 | |

Parece mucho hasta que se mira de cerca: 22 de las 37 son pantallas de
administración, tablas y formularios que salen de los mismos seis componentes
repetidos.

## Las cinco que hay que diseñar bien

Todo lo demás es variación de estas.

`/trabajo/:slug`, la ficha de proyecto, es donde se decide una contratación.
`/c/:token/galeria` es el producto visto desde fuera. `/admin/encargos/:id`
concentra el trabajo diario. `/admin/drive/cola` es lo que convierte ocho años de
carpetas en portfolio. `/admin` es lo primero de cada mañana.

## Decisiones de estructura

Estas cinco se validaron con el árbol y ya están cerradas. Las cuatro primeras
tienen ADR propio o están recogidas en `vision-y-alcance.md`.

El encargo es la unidad central, no el proyecto. Un encargo puede publicarse o no
en el portfolio: misma entidad, interruptor de visibilidad. Ver
[ADR 0004](adr/0004-el-encargo-es-la-unidad-central.md).

El cliente nunca crea cuenta. Enlace más PIN, sin registro, sin recuperación de
contraseña y sin correos de verificación. Ver
[ADR 0005](adr/0005-acceso-de-cliente-con-token-y-pin.md).

Solo tres pantallas de admin se diseñan pensando primero en el móvil: dashboard,
ficha de encargo y alta de gasto. Son las que se usan en un rodaje o en el coche.
Las tablas de finanzas y la cola de enriquecimiento asumen escritorio.

El visor de fotos es un modal, no una ruta. Si más adelante hace falta compartir
el enlace de una foto concreta, se convierte en `/c/:token/galeria/:foto` y suma
una ruta.

No hay buscador global en la v1. Con el volumen actual, filtrar por estado y por
cliente basta. Se añade cuando haya unos trescientos encargos.
