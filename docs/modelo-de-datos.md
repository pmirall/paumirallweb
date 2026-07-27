# Modelo de datos

Postgres en Supabase, esquema definido con Drizzle en `src/db/schema/`. Los
identificadores del código van en inglés; la traducción al vocabulario de negocio
está en `glosario.md`.

Convenciones: clave primaria `id` de tipo `uuid` con valor por defecto, `created_at`
y `updated_at` en todas las tablas, borrado lógico con `deleted_at` solo donde se
indica, y nombres de tabla en plural.

## Mapa

```
clients ──< jobs ──< media_assets ──< media_derivatives
   │         │  │
   │         │  ├──< deliverables
   │         │  ├──< time_entries
   │         │  ├──< expenses
   │         │  └──1 job_publications
   │         │
   │         ├──< galleries ──< gallery_sessions
   │         │        └──< gallery_favorites
   │         │
   │         ├──< quotes ──< quote_lines
   │         └──< invoices ──< payments
   │
   └──< leads

drive_folders ──1 jobs          drive_sync_runs
job_queue      settings      services      pages      email_templates      audit_log
```

## Encargos y clientes

### `clients`

`name`, `email`, `phone`, `company`, `tax_id`, `billing_address`, `notes`.

El correo no es único: hay clientes que repiten con direcciones distintas y
empresas que comparten contacto. La deduplicación se hace desde el admin, no con
una restricción de base de datos.

### `leads`

Lo que entra por el formulario de contacto. `name`, `email`, `phone`, `message`,
`source`, `status`, `client_id` opcional, `job_id` opcional, `spam_score`.

`status`: `new`, `read`, `replied`, `converted`, `discarded`.

Un lead convertido guarda el encargo que generó. No se borra al convertirlo,
porque el texto original del cliente sirve de contexto meses después.

### `jobs`

La tabla central. Todo lo demás cuelga de aquí.

| Campo | Notas |
|---|---|
| `code` | referencia legible, `2026-014`, única |
| `client_id` | obligatorio |
| `title` | interno |
| `category` | `artist`, `sport`, `video` |
| `status` | ver más abajo |
| `shoot_date` | fecha del rodaje |
| `due_date` | entrega comprometida |
| `delivered_at` | entrega real |
| `internal_notes` | texto libre en Markdown |
| `drive_folder_id` | carpeta vinculada en Drive |
| `budget_cents` | importe acordado, sin IVA |
| `published` | si aparece en el portfolio |

`status`: `draft`, `confirmed`, `shot`, `editing`, `delivered`, `closed`,
`cancelled`. La línea de tiempo que ve el cliente en `/c/:token/encargo` muestra
los cuatro estados centrales; `draft`, `closed` y `cancelled` no se le enseñan.

Los importes se guardan en céntimos, en enteros. Nada de decimales flotantes en
dinero.

### `job_publications`

Uno a uno con `jobs`. Existe solo si el encargo se publica. Guarda lo que importa
de cara al público y que no tiene sentido en la ficha interna: `slug` único,
`public_title`, `summary`, `body`, `year`, `cover_media_id`, `sort_order`,
`seo_title`, `seo_description`, `og_image_key`, `published_at`.

Esto respeta la decisión de que encargo y proyecto son la misma entidad. No se
duplica el cliente, ni la categoría, ni la fecha: se leen del encargo. Aquí solo
está lo que es exclusivamente público.

`slug` no cambia una vez publicado. Si hay que cambiarlo, se guarda el anterior en
`slug_history` y se sirve una redirección permanente.

### `deliverables`

Lo comprometido en el encargo: `job_id`, `kind` (`photos`, `video`, `reel`,
`raw`), `description`, `quantity`, `delivered`. Alimenta la lista que ve el
cliente y sirve para comprobar que se ha entregado todo.

### `time_entries`

`job_id`, `date`, `minutes`, `kind` (`shoot`, `edit`, `travel`, `admin`), `note`.

Sin esta tabla no hay euros por hora. Es la que más disciplina exige y la que más
fácil se abandona, así que el alta tiene que caber en dos toques desde el móvil.

## Archivos

### `media_assets`

Un archivo de Drive. `job_id`, `drive_file_id` único, `filename`, `mime_type`,
`kind` (`photo`, `video`), `bytes`, `width`, `height`, `taken_at`, `checksum`,
`sort_order`, `visibility` (`private`, `client`, `public`), `derive_status`
(`pending`, `done`, `failed`).

`visibility` es acumulativa hacia arriba: lo público lo ve también el cliente.

### `media_derivatives`

`media_asset_id`, `variant` (`thumb`, `web`, `mark`), `storage_key`, `bytes`,
`width`, `height`. Única por asset y variante.

## Galerías

### `galleries`

`job_id`, `token` único e imprevisible, `pin_hash`, `expires_at`,
`allow_high_res`, `watermark` (si la factura está pendiente), `status`
(`active`, `expired`, `revoked`), `download_count`, `last_access_at`.

El PIN se guarda con Argon2id. Nunca en claro, ni siquiera para poder
recordárselo al cliente: si se pierde, se genera otro.

`token` se genera con 128 bits de aleatoriedad criptográfica y se codifica en
base32 sin caracteres ambiguos, para que se pueda dictar por teléfono.

### `gallery_sessions`

Sesión abierta tras acertar el PIN. `gallery_id`, `session_id`, `ip_hash`,
`user_agent`, `created_at`, `expires_at`, `revoked_at`.

Permite cerrar accesos sin cambiar el PIN y saber si el cliente ha entrado.

### `gallery_pin_attempts`

`gallery_id`, `ip_hash`, `attempted_at`, `success`. Base del límite de intentos.
Se purga a los 30 días.

### `gallery_favorites`

`gallery_id`, `media_asset_id`, `marked_at`, `submitted_at`, `client_note`.

Mientras `submitted_at` es nulo, el cliente sigue eligiendo. Cuando confirma el
envío se sella la fecha, se avisa por correo y la selección queda cerrada.

## Dinero

### `quotes` y `quote_lines`

Presupuesto con `number`, `job_id`, `client_id`, `status` (`draft`, `sent`,
`accepted`, `rejected`, `expired`), `valid_until`, `subtotal_cents`,
`tax_cents`, `total_cents`, `sent_at`, `accepted_at`, `public_token`.

Las líneas guardan `description`, `quantity`, `unit_price_cents`, `tax_rate`.

Un presupuesto aceptado no se edita. Se duplica y se envía uno nuevo.

### `invoices`

La factura la emite un proveedor certificado. Aquí solo se guarda el reflejo:
`job_id`, `client_id`, `provider`, `provider_invoice_id`, `number`, `status`
(`draft`, `issued`, `paid`, `overdue`, `void`), `issued_at`, `due_at`, `paid_at`,
`subtotal_cents`, `tax_cents`, `total_cents`, `pdf_url`, `verification_url`.

Una factura emitida no se borra ni se modifica. Si está mal, el proveedor emite
una rectificativa y aquí se registra como una factura nueva enlazada por
`corrects_invoice_id`.

### `payments`

`invoice_id`, `provider` (`stripe`, `transfer`, `cash`), `provider_payment_id`,
`amount_cents`, `status`, `paid_at`. Una factura puede tener varios pagos
(anticipo y resto).

### `expenses`

`job_id` opcional porque hay gastos generales, `category`, `supplier`,
`amount_cents`, `tax_cents`, `date`, `receipt_storage_key`, `note`.

El alta rápida desde el móvil crea la fila con la foto del ticket y el importe.
El resto se completa después desde el escritorio.

## Drive

### `drive_folders`

`drive_folder_id` único, `name`, `path`, `parent_drive_id`, `detected_at`,
`file_count`, `queue_status` (`pending`, `enriched`, `ignored`), `job_id`
opcional, `suggested_client_id`, `suggested_date`, `suggested_category`.

Las sugerencias salen de cruzar la fecha de la carpeta con los eventos de Google
Calendar y de buscar coincidencias del nombre con clientes existentes. Son
sugerencias: la cola siempre pide confirmación.

### `drive_sync_runs`

`started_at`, `finished_at`, `folders_seen`, `folders_new`, `files_new`,
`errors`, `error_detail`. Es lo que pinta `/admin/drive`.

## Contenido editable

`services` guarda las tres tarifas de `/servicios`: `slug`, `name`,
`price_from_cents`, `summary`, `bullets` en JSON, `sort_order`, `active`.

`pages` guarda los textos largos de `/sobre-mi` y las tres páginas legales:
`slug`, `title`, `body`, `seo_title`, `seo_description`, `updated_at`.

`email_templates` guarda los correos de presupuesto, entrega, recordatorio y
caducidad: `slug`, `subject`, `body`, `variables` en JSON.

`settings` es una tabla de clave y valor para lo que no merece tabla propia:
umbral del ZIP, días de caducidad por defecto, texto legal del pie.

## Infraestructura

`job_queue`: `kind`, `payload` en JSON, `run_after`, `attempts`, `status`
(`pending`, `running`, `done`, `failed`), `last_error`, `locked_at`.

`audit_log`: `actor` (correo del admin, `system` o `gallery:<token>`), `action`,
`entity`, `entity_id`, `diff` en JSON, `ip_hash`, `created_at`. Obligatorio en
facturas, pagos, gastos, cambios de PIN y de caducidad, y borrados.

## Reglas de integridad

Un encargo no pasa a `delivered` si tiene entregables sin marcar.

Una galería no se activa si el encargo no tiene ningún `media_asset` con
`visibility` de `client` o superior.

Un encargo con factura emitida no se puede borrar. Se cancela.

Borrar un cliente con encargos está prohibido a nivel de clave foránea.

La marca de agua se activa sola cuando existe una factura en `issued` u `overdue`
del encargo y se desactiva cuando pasa a `paid`. Es una regla de aplicación, no
un campo que se toca a mano, aunque se puede forzar desde el admin.

## Row Level Security

Supabase RLS activo en todas las tablas, con política de denegar por defecto.

La aplicación accede con la clave de servicio desde el servidor y aplica los
permisos en su propia capa, porque los permisos de la zona de cliente dependen de
una sesión de galería y no de un usuario de Supabase. RLS actúa aquí como red de
seguridad frente a un acceso directo a la base de datos, no como mecanismo
principal.

La clave de servicio nunca sale del servidor. La clave anónima no se usa.
