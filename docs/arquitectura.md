# Arquitectura

## Forma general

Una sola aplicación Next.js sirve las tres zonas. No hay backend separado ni
microservicios. El volumen del negocio no lo justifica y un solo despliegue es
más fácil de mantener por una persona.

```
Navegador
   |
   v
Next.js en Vercel
   |  App Router, Server Components, Server Actions, Route Handlers
   |
   +--> Supabase Postgres          datos del negocio
   +--> Supabase Storage           derivadas de imagen y ZIP preparados
   +--> Google Drive API           originales, solo lectura
   +--> Google Calendar API        solo lectura, para sugerir cliente y fecha
   +--> Proveedor de facturación   emisión de facturas
   +--> Stripe                     cobro
   +--> Resend                     correo transaccional
```

Las llamadas a servicios externos salen siempre del servidor. El navegador habla
únicamente con la aplicación.

## Las tres zonas

Cada zona es un grupo de rutas con su propio layout y su propia forma de
autenticación.

La zona pública se renderiza de forma estática siempre que puede, y revalida
cuando cambian los datos. La portada, el archivo y las fichas de proyecto se
generan en el build y se regeneran cuando el admin publica algo. La única página
con estado es el formulario de contacto.

La zona de cliente se renderiza en el servidor en cada petición. No se cachea
nada: el contenido depende de la sesión de galería y de si la factura está
pagada. Es la zona con más lógica de permisos por petición.

La zona de administración también se renderiza por petición. Prioriza la
velocidad de trabajo sobre la belleza: tablas densas, atajos de teclado,
formularios que se guardan sin recargar.

## Renderizado y datos

Por defecto, Server Components. Un componente se marca como cliente cuando
necesita estado local, un evento del navegador o una API del navegador. El visor
de fotos, la cola de enriquecimiento y los formularios largos son componentes de
cliente. Casi todo lo demás no.

Las mutaciones van por Server Actions. Los Route Handlers de `src/app/api/` se
reservan para lo que no encaja en una acción: webhooks entrantes, descargas de
archivo, el sitemap y los cron jobs.

Las consultas viven en `src/db/queries/`, agrupadas por dominio. Un componente no
escribe SQL ni llama a Drizzle directamente; llama a una función con nombre. Así
la misma consulta se reutiliza y se prueba sola.

## Los archivos

Este es el punto donde se decide si el sistema funciona bien o va lento.

Google Drive guarda los originales y es la única fuente de verdad. La aplicación
no sube, no modifica y no borra nada en Drive. Si mañana se apaga el sistema, las
carpetas siguen exactamente igual.

Servir imágenes directamente desde Drive no vale: es lento, tiene límites de
cuota y expone la estructura de carpetas. Por eso, cuando la sincronización
detecta un archivo nuevo, se encola la generación de tres derivadas que se
guardan en Supabase Storage:

| Variante | Uso | Tamaño |
|---|---|---|
| `thumb` | rejillas y listados | 480 px en el lado largo, WebP |
| `web` | visor a pantalla completa y portfolio | 2000 px en el lado largo, WebP |
| `mark` | galerías con factura pendiente | igual que `web`, con marca de agua |

El original en alta resolución no se copia nunca. Cuando el cliente pide la
descarga, el servidor comprueba permisos y hace de intermediario del flujo desde
Drive. El enlace de Drive no llega al navegador en ningún momento.

Consecuencia práctica: si Drive se cae, el portfolio y las galerías siguen
funcionando en calidad web. Lo único que falla es la descarga en alta resolución.

### La descarga completa

Comprimir varios gigabytes en una función serverless con límite de tiempo y de
memoria no sale bien. La v1 lo resuelve así:

Por debajo de 500 MB, ZIP en streaming: un Route Handler en runtime Node abre el
flujo de cada archivo desde Drive y lo va escribiendo comprimido en la respuesta,
sin acumularlo en memoria ni en disco. La compresión va en modo almacenar, porque
un JPEG ya está comprimido y volver a comprimirlo solo gasta tiempo.

Por encima de 500 MB, ZIP preparado: el cliente pulsa el botón, se encola el
trabajo, se genera el archivo en Storage y se le avisa por correo cuando está
listo. El ZIP preparado caduca a los siete días.

El umbral es un ajuste, no una constante en el código. Se mide con encargos
reales durante la fase 4 y se sube o se baja.

## Trabajos en segundo plano

No hay cola dedicada ni Redis. Hay una tabla `job_queue` en Postgres y un cron de
Vercel que la vacía. Suficiente para el volumen previsto y una pieza menos que
mantener.

| Trabajo | Frecuencia | Qué hace |
|---|---|---|
| `drive:scan` | cada hora | busca carpetas y archivos nuevos, alimenta la cola de enriquecimiento |
| `media:derive` | cada 5 min | genera las derivadas pendientes |
| `zip:build` | cada 5 min | prepara los ZIP grandes que se han pedido |
| `gallery:expiry` | diaria | avisa de galerías que caducan en tres días y cierra las caducadas |
| `invoice:reminder` | diaria | recuerda las facturas vencidas |

Cada trabajo es idempotente y lleva contador de intentos. A los tres fallos pasa
a estado `failed` y aparece en `/admin/drive` o en el dashboard, según el tipo.
Un trabajo que falla en silencio es un trabajo que nadie arregla.

## Autenticación

El admin entra con Google Sign-In a través de Supabase Auth. La lista de correos
autorizados está en variable de entorno y contiene una sola dirección. El
middleware corta cualquier petición a `/admin` que no traiga sesión válida y
autorizada, antes de que se ejecute nada.

El cliente no tiene cuenta. El token de la URL localiza la galería, el PIN la
abre y a cambio se emite una cookie de sesión firmada, atada a esa galería
concreta. Un token no da acceso a otra galería aunque se conozca su identificador.
El detalle está en `seguridad-y-privacidad.md`.

## Caché e invalidación

La zona pública usa etiquetas de caché por entidad: `projects`, `project:<slug>`,
`services`, `about`. Cuando el admin publica o despublica un proyecto o edita las
tarifas, la Server Action invalida la etiqueta que toca. No se revalida el sitio
entero por cambiar un texto.

Las zonas de cliente y de administración no se cachean.

## Errores y observabilidad

Todo error no controlado se registra con el identificador de la petición, la zona
y el usuario o el token de galería. La zona pública muestra una página de error
sobria. La zona de cliente explica qué hacer y da una vía de contacto, porque
quien la ve ha pagado. El admin muestra el error técnico entero, porque quien lo
lee es quien lo va a arreglar.

Las acciones sobre dinero y sobre accesos de galería se registran además en
`audit_log`, con quién, qué y cuándo.

## Lo que no hay, y por qué

No hay CMS externo. El contenido editable es poco y concreto (servicios, textos
de proyecto, sobre mí) y vive en la base de datos con su propio editor en el
admin. Un CMS añadiría un sistema más que mantener y otra factura mensual.

No hay GraphQL. Las Server Actions y las funciones de consulta cubren lo mismo
sin capa intermedia.

No hay repositorio de código compartido con la web antigua. La v1 se construye
desde cero, y de la web actual se conservan las URL que ya estén indexadas. Ver
`contenido-y-seo.md`.

No hay tests unitarios de todo. Se prueba lo que rompe caro: permisos, dinero y
sincronización. Ver `testing-y-calidad.md`.
