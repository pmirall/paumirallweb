# 0012. La cola de enriquecimiento recorre un árbol, no una lista

Estado: aceptada
Fecha: 2026-07-27

## Contexto

El diseño inicial de la cola daba por hecho que cada carpeta hija de
`02-Sesiones` era un encargo. La exploración del Drive real, recogida en
`docs/drive-inventario.md`, dice que no.

Conviven tres formas. Sesiones sueltas con nombre y fecha, del tipo
`Marlene.25.07.01`. Carpetas de cliente sin fecha, como `Pepo`, que dentro tienen
una carpeta por año y dentro de cada año las sesiones. Y carpetas de evento, como
`ElToroRugby.24.06.15`, que no corresponden a un cliente.

Además el formato de fecha no es fiable. Hay días de tres cifras, meses trece,
comas en lugar de puntos y, en el caso de `Pepo`, carpetas donde la misma cifra
es el año o el día según dónde estén.

## Decisión

La cola recorre un árbol de hasta tres niveles y no asume nada sobre lo que
encuentra. Cada carpeta detectada entra en la cola con una clasificación
pendiente, y quien la enriquece decide si es un encargo, un contenedor de cliente
o algo que se ignora. La clasificación de contenedor hace que se recorra su
interior; la de ignorar poda esa rama entera.

La fecha extraída del nombre es siempre una sugerencia que se muestra como tal y
que nunca se aplica sola. Cuando la carpeta cuelga de una carpeta de año, ese año
manda sobre el que se deduzca del nombre.

La fecha de creación en Drive no se usa como respaldo.

La configuración admite varias carpetas raíz, no una.

## Consecuencias

El modelo de datos ya lo soporta: `drive_folders` tiene `parent_drive_id` y
`queue_status`, y hace falta añadir el tipo de carpeta al enumerado de la cola.

El trabajo manual de la primera pasada es mayor de lo previsto, porque hay que
clasificar contenedores además de encargos. A cambio, un contenedor se clasifica
una sola vez y las sesiones que cuelgan de él aparecen ya con el cliente
sugerido.

El cruce con Google Calendar sube de categoría. Deja de ser un adorno: en las
carpetas sin fecha fiable es la única pista automática que queda, y eso lo mueve
de "estaría bien" a parte del camino normal.

Las acciones en lote de la cola tienen que operar sobre una selección que puede
mezclar niveles del árbol. Es más trabajo de interfaz del que pedía una lista
plana.

## Alternativas descartadas

Renombrar las carpetas del Drive para que cumplan una convención y luego asumir
la lista plana. Es tocar el origen de la verdad para acomodar al sistema, que va
en contra del [ADR 0006](0006-drive-solo-lectura-y-derivadas-propias.md), y son
ocho años de carpetas a mano antes de poder empezar.

Aplanar el árbol en la sincronización y tratar cada carpeta hoja como encargo.
Pierde la relación entre `Pepo` y sus sesiones, que es información real y útil
para sugerir el cliente.

Deducir el tipo de carpeta por heurística, sin confirmación. Con estos nombres,
la heurística se equivocaría lo bastante como para que revisar sus errores
costase más que clasificar a mano.
