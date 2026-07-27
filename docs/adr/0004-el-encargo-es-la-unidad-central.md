# 0004. El encargo es la unidad central y el proyecto es una publicación suya

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Una sesión de fotos aparece en dos sitios: en el portfolio público, como
proyecto, y en la administración, como encargo con su cliente, su factura y sus
gastos.

La tentación es modelarlo como dos entidades, porque los campos que interesan son
distintos. El precio de hacerlo es que el título, la fecha y el cliente acaban
duplicados, y algún día no coinciden.

## Decisión

Una sola entidad, `jobs`. Publicar es un interruptor, no una entidad nueva.

Los campos que solo tienen sentido de cara al público viven en
`job_publications`, ligada uno a uno con `jobs`: slug, título público, resumen,
texto, portada, orden y campos de posicionamiento.

`job_publications` existe solo si el encargo está publicado. No duplica cliente,
categoría ni fecha: eso se lee del encargo.

## Consecuencias

Corregir la fecha de un encargo corrige la fecha que se ve en el portfolio. No
hay dos sitios que sincronizar.

Publicar un trabajo antiguo del archivo es marcar una casilla y rellenar cuatro
campos, no crear una entidad nueva a mano.

La cola de enriquecimiento tiene sentido: convierte una carpeta en encargo y,
opcionalmente, en proyecto publicado, en el mismo gesto.

A cambio, la ficha de encargo del admin mezcla dos audiencias: datos internos y
datos públicos. Se resuelve separándolos en pestañas y sacando la edición pública
a `/admin/portfolio/:id`.

También hay casos raros: un trabajo no remunerado que interesa publicar. Se
registra igual como encargo, con importe cero y cliente propio. Es menos molesto
que una segunda entidad.

## Alternativas descartadas

Tablas separadas `projects` y `jobs` con una referencia opcional entre ellas.
Flexible en teoría, y en la práctica dos sitios donde escribir el mismo título.

Todos los campos públicos dentro de `jobs`. Evita el join pero llena la tabla
central de columnas nulas para los encargos que no se publican, que serán la
mayoría.
