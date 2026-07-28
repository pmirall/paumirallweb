# 0013. El cobro arranca manual y Stripe queda latente

Estado: aceptada
Fecha: 2026-07-28

## Contexto

El plan de la fase 5 preveía Stripe Checkout como forma de cobro desde el
principio. En la práctica, el negocio empieza cobrando en efectivo, por
transferencia o con un TPV externo, y no necesita todavía cobro con tarjeta
dentro de la web.

Activar Stripe ahora significa contrato, claves, verificación del webhook y una
comisión por operación, para resolver un problema que aún no existe.

## Decisión

El cobro se registra a mano: efectivo, transferencia o TPV externo. El admin
anota el cobro sobre la factura y, cuando cubre el total, la factura pasa a
pagada y se apaga la marca de agua de la galería. Es el mismo efecto que tendría
un cobro con Stripe.

Stripe queda preparado pero inactivo. El método de pago `stripe` existe en el
modelo, con idempotencia por el identificador del pago. El webhook vive en
`/api/pagos/stripe`: sin `STRIPE_WEBHOOK_SECRET` responde 503 y no procesa nada.
La verificación de la firma está escrita y probada, así que activar Stripe es
poner las claves y encender el Checkout, sin tocar el modelo ni el registro de
cobros.

## Consecuencias

Se cobra desde el primer día sin depender de nadie ni pagar comisiones.

El registro manual exige disciplina: un cobro que no se anota deja la factura
como pendiente y la galería con marca de agua. Es una acción de una línea en la
ficha del encargo.

Cuando Stripe se encienda, el cliente podrá pagar desde `/c/:token/factura` sin
que cambie nada de lo ya construido: el webhook registra el cobro por la misma
vía que el manual.

## Alternativas descartadas

Activar Stripe ya. Añade contrato, claves y comisiones para un flujo que hoy se
resuelve a mano.

No dejar nada de Stripe preparado. Ahorraría el andamiaje del webhook, pero
obligaría a rehacer el modelo de pagos cuando llegue, en vez de encender lo que
ya está.
