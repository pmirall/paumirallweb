# Operativa

## Entornos

Tres, con la misma forma y datos distintos.

Local, en el portátil, con Postgres en Docker y adaptadores falsos para Drive,
Stripe y facturación. Se puede trabajar sin conexión y sin gastar cuota de
ninguna API.

Vista previa, un despliegue por rama en Vercel, contra un proyecto de Supabase de
pruebas y las claves de prueba de Stripe. Nunca toca datos reales ni cobra a
nadie.

Producción, la rama `main`, con el proyecto de Supabase real y las claves reales.

Las variables de entorno se configuran por entorno en Vercel. `.env.example`
lista los nombres. Ninguna clave real entra en git.

## Despliegue

Fusionar en `main` despliega. No hay más ceremonia y no hace falta.

Antes de fusionar, CI tiene que estar en verde: lint, tipos, pruebas,
construcción y, en pull request, extremo a extremo y Lighthouse.

Las migraciones de base de datos se aplican antes del despliegue, no durante.
Toda migración tiene que ser compatible con la versión anterior del código, para
que el momento entre "migración aplicada" y "código nuevo activo" no rompa nada.
En la práctica: primero se añade la columna, luego se despliega el código que la
usa, y solo en un tercer paso se borra lo viejo.

Una migración que borra datos se ejecuta a mano, con copia previa, y nunca un
viernes.

Volver atrás: Vercel permite revertir al despliegue anterior en un clic. Eso
cubre el código. La base de datos no vuelve atrás sola, y por eso las migraciones
tienen que ser compatibles hacia atrás.

## Cron

Los trabajos programados se declaran en `vercel.json` y todos llaman a un Route
Handler bajo `/api/cron/`, protegido con un secreto compartido en la cabecera.
Una URL de cron sin proteger es una URL que alguien acabará llamando.

| Trabajo | Cuándo |
|---|---|
| `drive:scan` | cada hora |
| `media:derive` | cada 5 minutos |
| `zip:build` | cada 5 minutos |
| `gallery:expiry` | a diario, por la mañana |
| `invoice:reminder` | a diario, por la mañana |

Cada ejecución deja registro. `/admin/drive` muestra las de Drive; las demás
aparecen en el dashboard cuando fallan.

## Vigilancia

Lo que hay que mirar sin esperar a que alguien se queje: trabajos en estado
fallido, errores de la última sincronización con Drive, webhooks de Stripe
rechazados, y correos que no se han entregado.

Los cuatro salen en el dashboard como avisos. El dashboard es la herramienta de
vigilancia del sistema, y por eso es una de las cinco pantallas que se diseñan
bien.

Además, aviso por correo al admin cuando: un trabajo agota sus tres intentos, una
galería recibe cinco intentos fallidos de PIN, o un webhook de Stripe falla la
verificación de firma.

Los errores no controlados se registran con el identificador de petición, la zona
y el usuario o el token de galería. La elección de la herramienta de registro se
cierra en la fase 6.

## Copias

Copia diaria de Postgres con treinta días de retención, gestionada por Supabase.

Exportación semanal a almacenamiento independiente. Una copia que vive en el
mismo sitio que el original no protege del escenario que más importa.

Las derivadas de Supabase Storage no se copian: se pueden regenerar desde Drive.
Los originales están en Drive, que tiene su propia protección.

La restauración se prueba una vez en la fase 6, sobre una base de datos de
prueba, y se anota cuánto tardó.

## Cuando algo falla

Drive caído o sin cuota: el portfolio y las galerías siguen funcionando en
calidad web. Falla la descarga en alta resolución y se para la sincronización. La
zona de cliente lo dice con un mensaje concreto en vez de un error genérico. No
hay que hacer nada: la siguiente pasada horaria recupera el ritmo.

Supabase caído: el sitio no funciona. Es la dependencia sin alternativa. Se
comprueba el estado del servicio y se espera.

Stripe caído: no se puede pagar. La factura se sigue viendo y se puede descargar
el PDF. El botón de pago muestra que el cobro no está disponible ahora mismo.

Proveedor de facturación caído: no se pueden emitir facturas nuevas. Las ya
emitidas se ven igual, porque el PDF y la URL de verificación están guardados
aquí.

Cola atascada: la cola vive en Postgres y se puede mirar, reintentar y vaciar
desde el admin. Un trabajo que falla tres veces se queda en `failed` y espera a
que alguien decida.

## Rutina

A diario: mirar el dashboard. Es lo primero de la mañana y para eso está.

Cada semana: repasar la cola de enriquecimiento y los cobros pendientes.

Cada mes: revisar el gasto por categoría y la rentabilidad del mes cerrado.

Cada trimestre: actualizar dependencias, revisar los avisos de seguridad, y
comprobar que las galerías caducadas de hace tiempo siguen caducadas.

Una vez al año: revisar las páginas legales, comprobar que la copia de seguridad
se restaura, y mirar si sigue teniendo sentido cada servicio externo que se paga.
