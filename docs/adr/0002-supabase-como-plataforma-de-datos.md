# 0002. Supabase para base de datos, autenticación y almacenamiento

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Hacen falta tres cosas: un Postgres, una forma de autenticar al admin con Google
y un sitio donde guardar las derivadas de imagen. Se pueden contratar por
separado o buscar algo que traiga las tres.

## Decisión

Supabase para las tres: Postgres gestionado, Auth con proveedor de Google y
Storage compatible con S3.

La aplicación accede con la clave de servicio desde el servidor. La clave anónima
no se usa. RLS está activo con política de denegar por defecto, como red de
seguridad frente a un acceso directo a la base de datos.

## Consecuencias

Un proveedor, una factura, una consola. Las copias de seguridad diarias vienen
incluidas.

Es Postgres de verdad, no una capa propietaria encima. Si algún día hay que
salir, se saca un volcado y se restaura en cualquier sitio. Esto es lo que hace
que la dependencia sea aceptable.

Storage compatible con S3 significa que cambiar a otro almacenamiento es cambiar
la configuración del cliente, no reescribir la capa de archivos.

A cambio, si Supabase se cae, el sitio se cae. No hay plan alternativo y no
merece la pena montarlo para este tamaño de negocio.

Los permisos de la zona de cliente no se pueden expresar con RLS, porque dependen
de una sesión de galería y no de un usuario de Supabase. Se aplican en la capa de
aplicación. Hay que tenerlo presente: RLS aquí no es el mecanismo principal.

## Alternativas descartadas

Neon o Postgres gestionado a secas, más NextAuth, más Cloudflare R2. Más control
y probablemente más barato a escala, pero son tres servicios que integrar y
mantener para ganar poco.

Prisma Postgres o Vercel Postgres. Buena integración con el resto del stack, pero
no traen ni autenticación ni almacenamiento.
