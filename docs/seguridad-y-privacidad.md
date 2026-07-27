# Seguridad y privacidad

El sistema guarda fotografías de personas, datos de contacto de clientes y datos
fiscales. Eso lo pone dentro del RGPD sin discusión posible.

## Acceso de administración

Google Sign-In a través de Supabase Auth. La variable `ADMIN_ALLOWED_EMAILS`
contiene la lista de correos autorizados y hoy tiene una sola dirección.

El middleware comprueba la sesión y la pertenencia a esa lista antes de que se
ejecute ningún código de página. Una sesión válida de Google que no esté en la
lista recibe 404, no 403: no hace falta confirmarle a nadie que existe un panel.

Sesión de ocho horas. Se renueva con actividad, caduca sin ella.

## Acceso de cliente

No hay cuentas. El acceso son dos piezas: un token en la URL y un PIN de cuatro
dígitos.

El token se genera con 128 bits de aleatoriedad criptográfica y se codifica en
base32 sin caracteres que se confundan al dictarlos. No es adivinable ni
enumerable. No lleva información dentro.

El PIN se guarda con Argon2id, con sal por galería. No se puede recuperar. Si el
cliente lo pierde, se genera uno nuevo y se le envía.

Un PIN de cuatro dígitos son diez mil combinaciones. Eso es poco, y por eso el
límite de intentos es lo que sostiene la seguridad de toda la zona:

Cinco intentos fallidos por token bloquean quince minutos. Veinte intentos
fallidos en una hora desde la misma IP bloquean esa IP durante seis horas. Cada
intento se registra en `gallery_pin_attempts`. Al quinto fallo se avisa al admin
por correo.

El bloqueo va en la base de datos, no en memoria del proceso. Un despliegue no
puede reiniciar el contador.

Al acertar el PIN se emite una cookie `HttpOnly`, `Secure`, `SameSite=Lax`, con
el identificador de sesión y firma. La cookie está atada a una galería concreta:
no sirve para otra aunque se conozca su token. Caduca a los treinta días o cuando
caduca la galería, lo que llegue antes.

Cada galería tiene fecha de caducidad. Por defecto noventa días desde la entrega,
configurable por encargo. Una galería caducada muestra una pantalla que lo
explica y ofrece pedir la reapertura, no un error.

## Archivos

Ninguna URL de Google Drive llega al navegador. Las descargas pasan por un Route
Handler que comprueba la sesión de galería, comprueba que el archivo pertenece a
esa galería, comprueba el permiso de alta resolución y solo entonces hace de
intermediario del flujo.

Las derivadas en Supabase Storage se sirven con URL firmadas de vida corta,
generadas por petición. El bucket no es público.

La marca de agua no es solo visual: cuando está activa, las derivadas sin marca
no se sirven en absoluto y la descarga en alta resolución se rechaza en el
servidor. Quitar la marca desde el navegador no da acceso a nada.

## Datos personales

| Dato | Dónde vive | Cuánto se guarda |
|---|---|---|
| Contacto del cliente | `clients` | mientras haya relación comercial, más los seis años de obligación fiscal |
| Leads sin convertir | `leads` | doce meses, luego se anonimizan |
| Fotografías | Drive y derivadas en Storage | según acuerdo con el cliente |
| IP de acceso a galería | `gallery_sessions`, `gallery_pin_attempts` | treinta días, siempre con hash |
| Registro de auditoría | `audit_log` | seis años |

Las IP se guardan con hash y sal del servidor, nunca en claro. Sirven para
limitar intentos, no para perfilar a nadie.

El formulario de contacto pide lo mínimo y lleva casilla de consentimiento sin
marcar, con enlace a la política de privacidad. Sin casilla marcada no se envía.

Las tres páginas legales (aviso legal, privacidad y cookies) se redactan con
asesoría antes del lanzamiento. Los textos de ejemplo que haya durante el
desarrollo se marcan como provisionales y bloquean la fase de lanzamiento hasta
que se sustituyan.

## Cookies

La zona pública no lleva analítica con cookies. Se usa una herramienta que mide
sin identificar, y por tanto no aparece banner de consentimiento. Es la decisión
más limpia para un sitio de este tamaño: menos fricción para el visitante y menos
superficie legal.

Las únicas cookies del sistema son técnicas: la sesión de admin y la sesión de
galería. Ambas son necesarias para prestar el servicio y no requieren
consentimiento previo, aunque sí se describen en la página de cookies.

## Cabeceras

En todas las respuestas: `Strict-Transport-Security` con un año,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` cerrando cámara, micrófono y geolocalización, y una
`Content-Security-Policy` que solo permite el propio dominio, Supabase Storage y
Stripe.

En `/admin` y `/c`: `X-Robots-Tag: noindex, nofollow` y `Cache-Control: private, no-store`.

La política de seguridad de contenido se escribe en modo informe durante el
desarrollo y se pasa a modo bloqueo antes del lanzamiento, cuando se sepa qué
falla de verdad.

## Contra abusos

El formulario de contacto lleva campo trampa y límite por IP. Sin captcha,
porque el volumen no lo pide y los captchas espantan clientes.

Las Server Actions validan la entrada con Zod antes de tocar nada. La validación
del navegador es comodidad, no seguridad.

Las descargas se limitan por sesión de galería para que un enlace filtrado no se
convierta en un servidor de archivos ajeno.

El webhook de Stripe verifica la firma antes de leer el cuerpo.

## Copias de seguridad

Copia diaria automática de Postgres con retención de treinta días, gestionada por
Supabase. Exportación semanal a almacenamiento independiente, porque una copia
que vive en el mismo sitio que el original no es una copia.

Las fotos originales están en Drive, que ya tiene su propia copia y su papelera.
No se replican.

La restauración se prueba una vez, en la fase de lanzamiento, con una base de
datos de prueba. Una copia que nunca se ha restaurado no se sabe si funciona.

## Si pasa algo

Ante un acceso indebido a una galería: revocar el token, generar uno nuevo,
avisar al cliente. La revocación es inmediata porque el token es una fila en la
base de datos, no un fichero servido.

Ante una filtración de datos personales, el RGPD da setenta y dos horas para
notificar a la autoridad. El registro de auditoría y los logs de acceso son lo
que permite saber el alcance. Por eso existen.
