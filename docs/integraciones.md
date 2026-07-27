# Integraciones

Cinco servicios externos. Cada uno entra por un adaptador propio en `src/lib/`,
con una interfaz que no menciona al proveedor. El resto de la aplicación no sabe
si detrás hay Stripe o Drive.

La regla es la misma en los cinco casos: si el servicio se cae, el sistema sigue
funcionando en modo degradado y lo dice claramente. Nunca una pantalla en blanco.

## Google Drive

Origen de la verdad para los archivos originales. Solo lectura, siempre.

Autenticación con cuenta de servicio y delegación, o con OAuth y refresh token
guardado en la base de datos. La cuenta de servicio es preferible porque no
caduca cuando cambia la contraseña de la cuenta personal.

Alcance mínimo: `drive.readonly`. Si el adaptador necesita alguna vez un alcance
de escritura, es señal de que algo se ha entendido mal.

La sincronización usa la API de cambios con token de página en vez de recorrer
las carpetas enteras. La primera pasada sí es completa y puede tardar; las
siguientes solo traen lo nuevo. El token de página se guarda en `settings`.

Convención de carpetas configurable desde `/admin/drive/ajustes`. El patrón por
defecto es `AAAA-MM-DD Cliente - Descripción`, y de ahí se extraen la fecha y el
nombre del cliente que se ofrecen como sugerencia en la cola. Las carpetas que no
encajen en el patrón entran igual en la cola, sin sugerencia.

Cuotas: la API de Drive limita las peticiones por usuario y por proyecto. El
adaptador reintenta con espera creciente ante un 429 y registra el incidente. Si
la cuota se agota, la sincronización se detiene hasta la siguiente pasada horaria
en vez de insistir.

Los archivos ya vistos se identifican por `drive_file_id`, no por nombre. Un
archivo renombrado en Drive no se duplica. Un archivo borrado en Drive se marca
como ausente en la base de datos, pero no se elimina la fila: el histórico del
encargo se conserva.

## Google Calendar

Solo lectura, y solo para una cosa: sugerir a qué cliente pertenece una carpeta
cruzando su fecha con los eventos del día.

Alcance `calendar.readonly`. Si Calendar falla, la cola de enriquecimiento
funciona igual, sin sugerencia. No es una dependencia crítica y no debe
comportarse como si lo fuera.

## Facturación

España exige que las facturas se emitan con un sistema que cumpla la normativa
vigente sobre registro y verificación. El sistema no emite facturas: las emite un
proveedor certificado y aquí se guarda la referencia, el PDF y la URL de
verificación.

Esto tiene una consecuencia de diseño. El adaptador `src/lib/billing/` define
cuatro operaciones y nada más:

```
createInvoice(job, client, lines) -> { providerInvoiceId, number, pdfUrl, verificationUrl }
getInvoice(providerInvoiceId)     -> estado actual
voidInvoice(providerInvoiceId)    -> anulación por rectificativa
listInvoices(since)               -> conciliación
```

La elección concreta de proveedor se cierra al empezar la fase 5 y se registra
como ADR. Los candidatos deben cumplir tres cosas: API documentada, emisión
conforme a la normativa española en vigor, y exportación de datos si algún día
hay que cambiar de proveedor.

Mientras no haya proveedor elegido, la fase 5 se desarrolla contra una
implementación falsa del mismo adaptador que genera PDFs de prueba. El resto del
sistema no se entera del cambio.

El presupuesto sí lo genera el sistema. Un presupuesto no es una factura y no
tiene requisitos de certificación.

## Cobros

Stripe. El cliente pulsa el botón en `/c/:token/factura`, el servidor crea una
sesión de Checkout con el importe de la factura y devuelve la URL.

El estado del pago lo fija el webhook `checkout.session.completed`, nunca el
retorno del navegador. El retorno solo lleva al cliente a una pantalla que dice
que se está confirmando.

El webhook verifica la firma antes de leer el cuerpo. Es idempotente: el mismo
evento repetido no crea dos pagos. Stripe reintenta, y lo hará.

Cuando el pago se confirma, tres cosas ocurren en la misma transacción: la
factura pasa a `paid`, se registra la fila en `payments`, y la marca de agua de
la galería se desactiva. El cliente ve sus fotos limpias sin tener que pedir nada.

Los pagos por transferencia se registran a mano desde el admin. Producen el mismo
efecto que un pago de Stripe.

## Correo

Resend, con dominio propio verificado y registros SPF, DKIM y DMARC.

Cuatro plantillas editables desde `/admin/ajustes/plantillas`: envío de
presupuesto, aviso de entrega con enlace y PIN, recordatorio de factura vencida y
aviso de galería a punto de caducar.

El PIN y el enlace van en el mismo correo. Se ha valorado separarlos por
seguridad y se ha descartado: el correo del cliente ya es el canal de confianza,
y separarlos duplica el soporte por teléfono sin ganar nada real.

Todo envío queda registrado con destinatario, plantilla, encargo y resultado. Un
correo que no llega es la causa más común de "no me ha llegado nada" y hay que
poder comprobarlo en diez segundos.

Los correos van en texto plano bien maquetado, sin imágenes de fondo ni tablas
anidadas. Se leen en el móvil y sobreviven a cualquier cliente de correo.

## Variables de entorno

Todas las claves viven en variables de entorno, agrupadas por servicio. El
fichero `.env.example` del repositorio lista los nombres con valores vacíos y
sirve de referencia. Ninguna clave real entra en git.

Ninguna variable de las que aparecen ahí lleva el prefijo `NEXT_PUBLIC_`. Si
alguna vez hace falta una, es que algo se está resolviendo en el sitio
equivocado.
