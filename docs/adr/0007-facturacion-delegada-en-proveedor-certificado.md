# 0007. La factura la emite un proveedor certificado

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Facturar en España tiene requisitos legales sobre cómo se generan, se registran y
se verifican las facturas. Son requisitos que cambian de contenido y de fecha de
entrada en vigor con cierta frecuencia.

Un sistema propio que emita facturas tendría que cumplirlos y mantenerse al día
de cada cambio normativo. Eso no es trabajo de esta web.

## Decisión

El sistema no emite facturas. Las emite un proveedor certificado a través de su
API, y aquí se guarda el reflejo: número, importes, estado, PDF y URL de
verificación.

El acceso al proveedor pasa por un adaptador en `src/lib/billing/` con cuatro
operaciones: crear factura, consultar factura, anular por rectificativa y listar
para conciliación. Ninguna otra parte del código sabe qué proveedor hay detrás.

El presupuesto sí lo genera el sistema. Un presupuesto no es una factura y no
tiene requisitos de certificación.

## Consecuencias

Los cambios normativos son problema del proveedor. Es la razón principal de la
decisión y por sí sola la justifica.

Cambiar de proveedor es reescribir un adaptador de cuatro funciones. Por eso el
criterio de elección incluye que permita exportar los datos.

La fase 5 se puede desarrollar y probar entera contra una implementación falsa
del adaptador, sin esperar a tener contrato con nadie y sin emitir facturas de
prueba con validez legal.

A cambio, se depende de que el proveedor esté disponible para emitir. Si se cae,
no se pueden emitir facturas nuevas; las ya emitidas se siguen viendo, porque su
PDF y su URL de verificación están guardados aquí.

Y hay una factura mensual más.

## Alternativas descartadas

Emitir facturas desde el sistema. Barato hasta el primer cambio normativo, y
entonces caro para siempre.

Facturar desde un programa de contabilidad aparte y no tocarlo desde la web. Es
lo que se hace hoy. Rompe la cadena que va del encargo al cobro, que es media
razón de ser del proyecto.

Elegir ya el proveedor y escribir el código contra su API. Ata la fase 5 a una
decisión comercial que todavía no está tomada, sin ganar nada frente al
adaptador.
