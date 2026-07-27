# 0010. Analítica sin cookies y sin banner de consentimiento

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Hace falta saber qué proyectos se miran, cuánta gente llega a `/contacto` y
cuánta lo envía. No hace falta seguir a nadie entre sesiones ni construir
audiencias publicitarias.

Cualquier analítica con cookies de seguimiento obliga a pedir consentimiento
previo, lo que significa un banner tapando la primera pantalla que ve un cliente
potencial.

## Decisión

Analítica que mide sin cookies y sin identificar a personas. Las únicas cookies
del sistema son técnicas: la sesión de admin y la sesión de galería, ambas
necesarias para prestar el servicio.

Sin banner de consentimiento en la zona pública.

## Consecuencias

Lo primero que ve un visitante es una fotografía, no un cuadro de diálogo sobre
cookies. En un portfolio, esto vale más que cualquier métrica que se pierda.

Menos superficie legal: sin cookies de seguimiento no hay consentimiento que
recoger, guardar ni demostrar.

Los datos que quedan son suficientes para las tres preguntas que importan. Lo que
se pierde es el seguimiento entre sesiones y la atribución a campañas de pago,
que hoy no existen.

Si algún día se hace publicidad de pago y hace falta atribución, habrá que
revisar esta decisión y probablemente aceptar el banner. Se escribiría un ADR
nuevo.

La página de cookies sigue existiendo y describe las dos cookies técnicas. No
tener banner no es no tener nada que contar.

## Alternativas descartadas

Google Analytics. Gratis y potente, y a cambio banner obligatorio, transferencia
de datos fuera de la Unión Europea y un tercero mirando a los visitantes.

Ninguna analítica. Sin datos no se sabe si el portfolio convierte, que es
justo lo que este proyecto quiere poder medir.
