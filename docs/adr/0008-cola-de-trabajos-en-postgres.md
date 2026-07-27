# 0008. Cola de trabajos en Postgres en vez de servicio dedicado

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Hay trabajo que no puede ocurrir dentro de una petición: sincronizar con Drive,
generar derivadas de imagen, preparar ZIP grandes, avisar de galerías que caducan
y recordar facturas vencidas.

Son cinco tipos de trabajo, con volúmenes que se cuentan en decenas o cientos al
día, no en miles por segundo.

## Decisión

Una tabla `job_queue` en Postgres y un cron de Vercel que la vacía. Cada trabajo
guarda su tipo, su carga útil en JSON, cuándo puede ejecutarse, cuántos intentos
lleva y el último error.

Todos los trabajos son idempotentes. A los tres fallos pasan a estado `failed` y
aparecen como aviso en el admin.

## Consecuencias

Cero infraestructura nueva. No hay Redis, ni servicio de colas, ni otra factura,
ni otro panel que mirar.

El estado de la cola se consulta con SQL, que es lo que ya se usa para todo lo
demás. Ver por qué falló un trabajo es una consulta, no abrir otra herramienta.

Encolar un trabajo ocurre dentro de la misma transacción que el cambio que lo
provoca. Si la transacción se deshace, el trabajo no queda encolado. Con una cola
externa esto exige cuidado adicional.

A cambio, la latencia mínima es el intervalo del cron: hasta cinco minutos para
las derivadas y hasta una hora para Drive. Aceptable para todo lo que hay, y
forzable a mano desde el admin cuando hace falta.

Y no escala a miles de trabajos por minuto. Cuando llegue ese día, cambiar de
mecanismo será un trabajo acotado, porque el resto del código solo llama a
`enqueueJob`.

Un trabajo que falla en silencio es un trabajo que nadie arregla. Por eso el paso
a `failed` sale como aviso en el dashboard y no solo en un registro.

## Alternativas descartadas

Servicio de colas gestionado tipo Inngest o QStash. Mejores reintentos, mejores
herramientas y trabajos de larga duración. Es otro servicio que integrar,
entender y pagar para un volumen que no lo pide.

Redis con una librería de colas. Lo mismo, más un servidor que mantener.

Hacer el trabajo dentro de la petición. Las derivadas de una carpeta de 300 fotos
no caben en el límite de tiempo de una función serverless.
