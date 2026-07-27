# Glosario

El negocio se habla en español. El código se escribe en inglés. Esta tabla es el
puente, y se consulta antes de inventar un nombre.

## Negocio y código

| Español | Código | Qué es |
|---|---|---|
| encargo | `job` | un trabajo remunerado con cliente, fecha y factura. La unidad central del sistema |
| cliente | `client` | quien contrata. No tiene cuenta ni contraseña |
| lead, consulta | `lead` | alguien que ha escrito por el formulario y todavía no es cliente |
| proyecto | `job_publication` | un encargo publicado en el portfolio. No es una entidad aparte |
| galería | `gallery` | la entrega privada de un encargo, con token y PIN |
| favorita, selección | `gallery_favorite` | foto que el cliente marca para pedirla |
| entregable | `deliverable` | lo comprometido en el encargo: 40 fotos, un reel, un vídeo |
| archivo, foto, vídeo | `media_asset` | un archivo que vive en Drive y está registrado aquí |
| derivada | `media_derivative` | miniatura, tamaño web o copia con marca de agua |
| marca de agua | `watermark` | la capa que se aplica mientras la factura está pendiente |
| presupuesto | `quote` | oferta enviada antes del trabajo. No es una factura |
| factura | `invoice` | documento emitido por el proveedor certificado |
| rectificativa | `corrects_invoice_id` | factura que corrige otra. Nunca se borra la original |
| cobro | `payment` | el dinero que entra. Puede haber varios por factura |
| gasto | `expense` | dinero que sale. Puede colgar de un encargo o ser general |
| horas | `time_entry` | tiempo dedicado. Sin esto no hay euros por hora |
| rentabilidad | `profitability` | euros por hora reales por encargo y por servicio |
| tarifa, servicio | `service` | cada una de las tres tarjetas de `/servicios` |
| cola de enriquecimiento | `drive_folders` con `queue_status` | las carpetas de Drive pendientes de clasificar |
| sincronización | `drive_sync_run` | cada pasada de lectura de Drive |
| cola de trabajos | `job_queue` | los trabajos en segundo plano |
| registro de auditoría | `audit_log` | quién tocó qué y cuándo |
| ajustes | `settings` | valores de configuración del sistema |

Cuidado con `job`. En este proyecto significa encargo, no trabajo en segundo
plano. Los de segundo plano son `job_queue` y siempre se nombran con ese prefijo:
`enqueueJob`, `runQueuedJob`. No es ideal, pero cambiar `job` por otra cosa lo
empeora, porque encargo es la palabra que se usa a diario.

## Estados

Encargo (`jobs.status`): `draft` borrador, `confirmed` confirmado, `shot` rodado,
`editing` editando, `delivered` entregado, `closed` cerrado, `cancelled`
cancelado.

Al cliente solo se le muestran los cuatro centrales.

Lead (`leads.status`): `new` nuevo, `read` leído, `replied` respondido,
`converted` convertido, `discarded` descartado.

Galería (`galleries.status`): `active` activa, `expired` caducada, `revoked`
revocada.

Presupuesto (`quotes.status`): `draft` borrador, `sent` enviado, `accepted`
aceptado, `rejected` rechazado, `expired` caducado.

Factura (`invoices.status`): `draft` borrador, `issued` emitida, `paid` pagada,
`overdue` vencida, `void` anulada.

## Categorías

Las tres del portfolio: `artist` artista, `sport` deporte, `video` vídeo.

En las URL públicas van en español: `/trabajo?cat=artista`.

## Zonas

Zona A, pública, prefijo `/`, carpeta `(public)`.

Zona B, cliente, prefijo `/c/:token`, carpeta `c/[token]`.

Zona C, administración, prefijo `/admin`, carpeta `admin`.

## Palabras que no se usan

"Usuario" a secas, porque hay tres cosas distintas: el admin, el cliente y el
visitante. Se dice cuál.

"Post", "entrada" o "artículo". No hay blog.

"Álbum". Se dice galería si es la entrega al cliente y proyecto si es lo
publicado.

"Pedido". Es un encargo.
