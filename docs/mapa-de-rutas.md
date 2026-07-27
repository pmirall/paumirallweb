# Mapa de rutas

46 rutas, 37 pantallas reales. El árbol tal como se validó está en
`arbol-de-pantallas.md`. Este documento lo traduce a decisiones técnicas: quién
puede entrar, cómo se renderiza y qué pasa cuando algo falla.

Columna de renderizado: `estático` se genera en el build y se revalida por
etiqueta, `servidor` se calcula en cada petición.

## Zona A, pública

Layout `(public)`. Cabecera, pie y navegación comunes. Indexable.

| Ruta | Renderizado | Notas |
|---|---|---|
| `/` | estático | hero, tres proyectos destacados, servicios, bloque sobre mí |
| `/trabajo` | estático | filtros por categoría en la URL, `?cat=artista` |
| `/trabajo/:slug` | estático | `generateStaticParams` desde `job_publications`, metadatos propios |
| `/servicios` | estático | lee `services`, más el bloque de "nada de esto encaja" |
| `/sobre-mi` | estático | lee `pages` |
| `/contacto` | servidor | formulario con Server Action |
| `/contacto/gracias` | estático | sin lógica, evita reenvío al recargar |
| `/legal/aviso-legal` | estático | lee `pages` |
| `/legal/privacidad` | estático | lee `pages` |
| `/legal/cookies` | estático | lee `pages` |
| `/404` | estático | enlaza a portada y archivo |

Los filtros de `/trabajo` van en la query, no en el segmento de ruta, para no
multiplicar URL indexables por categorías que comparten contenido. La categoría
sin proyectos muestra un estado vacío con enlace a las demás, nunca una página en
blanco.

`/trabajo/:slug` es la pantalla que más importa de la zona. Lleva galería del
proyecto, cliente, año, categoría, texto corto, navegación al anterior y al
siguiente dentro de la misma categoría, y sus propios metadatos de Open Graph.

El formulario de contacto crea un lead. Protección antispam con campo trampa y
límite por IP, sin captcha. Si el envío falla, el texto escrito no se pierde.

La llamada a la acción "Reservar sesión", que aparece en la cabecera y en la
portada, apunta aquí. No hay ruta `/reservar`. Desde una tarjeta de servicio
arrastra el servicio en la query, `/contacto?servicio=retrato`, y el formulario
llega con ese campo elegido; desde la cabecera va sin parámetro. El valor se
valida contra los slugs de `services` y uno desconocido se ignora sin romper la
página.

## Zona B, cliente

Layout `(client)`. Sin navegación del sitio público. Cabecera mínima con el
nombre del encargo. `noindex` por cabecera HTTP.

Todo cuelga de `/c/:token`. El middleware resuelve el token antes que nada y
corta con 404 si no existe, sin distinguir entre token inválido y galería
borrada.

| Ruta | Renderizado | Requiere PIN |
|---|---|---|
| `/c/:token` | servidor | no, es la puerta |
| `/c/:token/galeria` | servidor | sí |
| `/c/:token/seleccion` | servidor | sí |
| `/c/:token/video` | servidor | sí, y solo si el encargo tiene vídeo |
| `/c/:token/encargo` | servidor | sí |
| `/c/:token/factura` | servidor | sí |
| `/c/:token/factura/ok` | servidor | sí |

La puerta tiene cuatro estados: PIN correcto y entra, PIN erróneo con los
intentos restantes, galería caducada con una vía de contacto para pedir
reapertura, y token inválido que se responde como 404.

La galería es la pantalla principal. Rejilla de fotos con carga progresiva, visor
a pantalla completa en modal con navegación por teclado, descarga individual y
descarga completa, y selector de calidad entre web y alta resolución. Si la
factura está pendiente, se sirven las derivadas con marca de agua y la descarga
en alta resolución se bloquea con un mensaje que explica por qué.

`/c/:token/video` no aparece en el menú si el encargo no tiene entregables de
vídeo. La ruta responde 404 en ese caso, no un mensaje de vacío.

`/c/:token/factura/ok` se sirve tras el retorno de Stripe, pero no se fía de ese
retorno: el estado real lo marca el webhook. Si el webhook aún no ha llegado, la
pantalla dice que el pago se está confirmando y se actualiza sola.

## Zona C, administración

Layout `(admin)`. Barra lateral, buscador contextual por sección, atajos de
teclado. `noindex` por cabecera. Middleware que exige sesión de Google
autorizada.

### Entrada

`/admin/login` y `/admin`. El dashboard reúne encargos activos, entregas
pendientes, cobros pendientes y próximos rodajes, más los avisos de galerías por
caducar, facturas vencidas y carpetas nuevas detectadas en Drive. Se diseña
pensando primero en el móvil.

### Trabajo

| Ruta | Notas |
|---|---|
| `/admin/leads` | bandeja de entrada, filtro por estado |
| `/admin/leads/:id` | detalle y conversión en encargo |
| `/admin/encargos` | lista con filtro por estado y por cliente |
| `/admin/encargos/nuevo` | alta |
| `/admin/encargos/:id` | ficha con cinco pestañas |
| `/admin/clientes` | lista |
| `/admin/clientes/:id` | historial y facturación acumulada |

La ficha de encargo es el centro de gravedad del admin. Cinco pestañas: resumen
con cliente, fechas, estado y entregables; archivos con la carpeta de Drive
vinculada; galería con enlace, PIN, caducidad y favoritos recibidos; dinero con
presupuesto, factura, gastos y rentabilidad; y notas.

Las pestañas van en la query (`?tab=dinero`), no en segmentos de ruta. Así el
enlace se puede compartir y el estado del formulario no se pierde al cambiar de
pestaña. Se diseña pensando primero en el móvil.

### Drive y contenido

| Ruta | Notas |
|---|---|
| `/admin/drive` | estado de la sincronización, última pasada, errores |
| `/admin/drive/cola` | cola de enriquecimiento |
| `/admin/drive/ajustes` | carpetas raíz, convención de nombres, exclusiones |
| `/admin/portfolio` | publicados y borradores |
| `/admin/portfolio/:id` | editor de portada, orden, textos y SEO |

La cola de enriquecimiento asume escritorio. Una carpeta por fila con cliente,
categoría y visibilidad pública. Autocompletado, acciones en lote sobre selección
múltiple y atajos de teclado para no soltar las manos. Sugiere el cliente
cruzando la fecha de la carpeta con Google Calendar. Es la pantalla que decide si
ocho años de archivo acaban siendo portfolio o siguen en Drive.

### Dinero

| Ruta | Notas |
|---|---|
| `/admin/finanzas` | ingresos del mes, pendiente de cobro, gasto por categoría |
| `/admin/finanzas/presupuestos` | lista |
| `/admin/finanzas/presupuestos/:id` | editor y envío |
| `/admin/finanzas/facturas` | lista |
| `/admin/finanzas/facturas/:id` | detalle de la factura emitida por el proveedor |
| `/admin/finanzas/gastos` | alta rápida con foto del ticket |
| `/admin/finanzas/cobros` | pendientes ordenados por antigüedad |
| `/admin/finanzas/rentabilidad` | euros por hora reales por encargo y por servicio |

El alta de gasto se diseña pensando primero en el móvil. El resto de finanzas
asume escritorio.

### Ajustes

`/admin/ajustes/perfil`, `/admin/ajustes/servicios`, `/admin/ajustes/drive`,
`/admin/ajustes/facturacion` y `/admin/ajustes/plantillas`.

## Reglas transversales

Cada ruta define su `loading.tsx` con esqueleto de contenido, no con un
indicador giratorio genérico. Cada zona define su `error.tsx` con el tono que le
corresponde.

Las rutas con parámetro validan el parámetro antes de consultar la base de datos.
Un slug o un identificador con formato incorrecto se responde con 404 sin llegar
a Postgres.

Las URL públicas van en español y en minúsculas, con guiones y sin acentos.

`/admin` y `/c` se excluyen del sitemap y se bloquean en `robots.txt`, además de
la cabecera `X-Robots-Tag`.
