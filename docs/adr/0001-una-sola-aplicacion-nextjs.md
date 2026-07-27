# 0001. Una sola aplicación Next.js para las tres zonas

Estado: aceptada
Fecha: 2026-07-27

## Contexto

El sistema tiene tres zonas con necesidades distintas. La pública quiere ser
rápida e indexable. La de cliente quiere renderizarse por petición y no cachear
nada. La de administración quiere densidad y velocidad de trabajo, y le da igual
el posicionamiento.

Eso invita a pensar en tres despliegues separados, o en una web estática más una
aplicación aparte para el panel.

## Decisión

Una sola aplicación Next.js 15 con App Router. Las tres zonas son tres grupos de
rutas con su propio layout y su propia autenticación.

El renderizado se decide por ruta: estático con revalidación por etiqueta en la
zona pública, por petición en las otras dos.

## Consecuencias

Un despliegue, un conjunto de dependencias, un sistema de diseño y un modelo de
datos. Para una persona manteniendo el sistema, esto pesa más que cualquier
ventaja de la separación.

Los componentes de la interfaz se comparten entre zonas sin publicar paquetes ni
montar un monorepo.

A cambio, un fallo en el build afecta a todo. Se acepta: el sitio público no
tiene tanto tráfico como para que un despliegue fallido de diez minutos sea un
problema serio.

Hay que ser disciplinado con las fronteras. Una regla de ESLint prohíbe que un
componente de una zona importe de otra. Lo compartido vive en `ui`.

## Alternativas descartadas

Sitio estático generado aparte más aplicación separada para admin y cliente.
Duplica el sistema de diseño y obliga a mantener dos despliegues y dos conjuntos
de dependencias.

Next.js para lo público más un backend propio en otro servicio. Añade una API que
mantener entre dos piezas que siempre se despliegan juntas.
