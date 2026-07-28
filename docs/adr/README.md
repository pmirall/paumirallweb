# Decisiones de arquitectura

Un fichero por decisión, numerado y con la fecha en que se tomó. Una decisión no
se edita cuando se cambia de opinión: se escribe otra que la sustituye y la vieja
se marca como sustituida, con el enlace a la nueva.

Se escribe un ADR cuando una decisión afecta a más de un fichero, es cara de
revertir, o alguien va a preguntar dentro de seis meses por qué se hizo así.

## Formato

Título, estado, fecha, contexto, decisión, consecuencias y alternativas
descartadas. Corto. Un ADR de tres páginas no lo lee nadie.

Estados posibles: aceptada, cumplida, sustituida por NNNN, revertida. Cumplida es
para una decisión que cubría una situación temporal que ya pasó, y cuyo fondo
sigue vigente.

## Índice

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-una-sola-aplicacion-nextjs.md) | Una sola aplicación Next.js para las tres zonas | aceptada |
| [0002](0002-supabase-como-plataforma-de-datos.md) | Supabase para base de datos, autenticación y almacenamiento | aceptada |
| [0003](0003-drizzle-como-orm.md) | Drizzle como ORM y sistema de migraciones | aceptada |
| [0004](0004-el-encargo-es-la-unidad-central.md) | El encargo es la unidad central y el proyecto es una publicación suya | aceptada |
| [0005](0005-acceso-de-cliente-con-token-y-pin.md) | Acceso de cliente con token y PIN, sin cuentas | aceptada |
| [0006](0006-drive-solo-lectura-y-derivadas-propias.md) | Drive en solo lectura y derivadas propias en Storage | aceptada |
| [0007](0007-facturacion-delegada-en-proveedor-certificado.md) | La factura la emite un proveedor certificado | aceptada |
| [0008](0008-cola-de-trabajos-en-postgres.md) | Cola de trabajos en Postgres en vez de servicio dedicado | aceptada |
| [0009](0009-tokens-antes-que-guia-de-marca.md) | Construir sobre tokens antes de tener la guía de marca | cumplida |
| [0010](0010-analitica-sin-cookies.md) | Analítica sin cookies y sin banner de consentimiento | aceptada |
| [0011](0011-sistema-visual-editorial-impreso.md) | Sistema visual editorial, sin radios y sin modo oscuro | aceptada |
| [0012](0012-la-cola-recorre-un-arbol-no-una-lista.md) | La cola de enriquecimiento recorre un árbol, no una lista | aceptada |
| [0013](0013-cobro-manual-primero-stripe-latente.md) | El cobro arranca manual y Stripe queda latente | aceptada |
