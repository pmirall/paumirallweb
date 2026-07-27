# 0003. Drizzle como ORM y sistema de migraciones

Estado: aceptada
Fecha: 2026-07-27

## Contexto

El esquema tiene unas veinticinco tablas con relaciones densas y algunas
consultas de agregación que no son triviales, sobre todo la de rentabilidad, que
cruza importes, gastos y horas.

Hay que elegir entre escribir SQL a mano, usar un ORM completo o usar algo
intermedio.

## Decisión

Drizzle, con el esquema declarado en TypeScript en `src/db/schema/` y las
migraciones generadas con `drizzle-kit`.

Los tipos se infieren del esquema. No se escriben tipos a mano que dupliquen una
tabla.

## Consecuencias

Las consultas se parecen a SQL, así que quien sepa SQL sabe leerlas y quien no,
aprende. No hay que adivinar qué consulta va a generar el ORM.

No añade un runtime pesado ni un motor de consultas propio, lo que importa en
funciones serverless donde el arranque en frío se nota.

Las migraciones son ficheros SQL que se pueden leer y corregir antes de
aplicarlas. Con migraciones automáticas opacas, la primera vez que hay que tocar
producción a mano se pasa mal.

A cambio, hay menos comodidades que en un ORM completo: no hay carga perezosa de
relaciones ni un cliente de administración visual maduro. Para este proyecto no
hacen falta.

Las consultas complejas de agregación pueden necesitar SQL suelto con la utilidad
de Drizzle. Se acepta, siempre dentro de `src/db/queries/` y con pruebas de
integración contra un Postgres real.

## Alternativas descartadas

Prisma. Mejor experiencia de desarrollo y mejores herramientas, pero un runtime
más pesado, un lenguaje de esquema propio y menos control sobre el SQL que
acaba ejecutándose.

El cliente de Supabase con PostgREST. Suficiente para consultas simples, incómodo
para agregaciones y sin tipos derivados del esquema con la misma solidez.

SQL a mano con una capa fina. Máximo control y ningún tipo derivado. La
sincronización entre esquema y tipos se convierte en trabajo manual eterno.
