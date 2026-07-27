# 0005. Acceso de cliente con token y PIN, sin cuentas

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Cada encargo entrega material a un cliente que entra una o dos veces en su vida.
Pedirle que se registre, verifique un correo y recuerde una contraseña es
fricción pura para quien ya ha pagado.

A la vez, las fotos son de personas y no pueden quedar en una URL pública que se
comparta sin control.

## Decisión

El acceso son dos piezas: un token en la URL que identifica la galería y un PIN
de cuatro dígitos que la abre.

El token lleva 128 bits de aleatoriedad criptográfica, codificados en base32 sin
caracteres ambiguos para poder dictarlo por teléfono. No es enumerable y no
contiene información.

El PIN se guarda con Argon2id y sal por galería. No se puede recuperar; si se
pierde, se genera otro.

Al acertar el PIN se emite una cookie de sesión firmada, `HttpOnly`, `Secure` y
`SameSite=Lax`, atada a esa galería concreta.

## Consecuencias

Desaparecen tres pantallas y tres flujos: registro, recuperación de contraseña y
verificación de correo. Y desaparece el soporte que generan.

El enlace y el PIN se envían en el mismo correo. Se valoró separarlos y se
descartó: el correo del cliente ya es el canal de confianza, y separarlos duplica
las llamadas de teléfono sin ganar seguridad real.

Un PIN de cuatro dígitos son diez mil combinaciones, que es poco. La seguridad de
toda la zona descansa en el límite de intentos, no en la longitud del PIN. Por
eso el límite se persiste en la base de datos y no en memoria, y por eso al
quinto fallo se avisa al admin. Está detallado en `seguridad-y-privacidad.md`.

Si alguien reenvía el enlace y el PIN, el acceso se comparte. Se asume: es el
mismo riesgo que tiene un enlace de WeTransfer, y a cambio hay caducidad,
revocación inmediata y registro de accesos, que WeTransfer no da.

Los permisos no se pueden expresar con RLS de Supabase, porque no hay usuario. Se
aplican en la capa de aplicación, en cada petición.

## Alternativas descartadas

Cuentas de cliente con contraseña. Correcto en un producto con uso recurrente,
desproporcionado para dos visitas por encargo.

Enlace mágico por correo en cada entrada. Sin contraseñas y bastante seguro, pero
depende de que el correo llegue rápido cada vez, y los correos se pierden en
carpetas de spam justo cuando el cliente tiene prisa.

Solo token, sin PIN. Es lo que hacen los servicios de transferencia de archivos.
Un enlace reenviado por WhatsApp queda accesible para siempre y sin ninguna
barrera.
