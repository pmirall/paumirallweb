# Documentación

Estado: pre-construcción. Todavía no hay código. Estos documentos son lo que hay
que leer para poder empezar a escribirlo.

## Por dónde empezar

Si es tu primer día en el proyecto, lee en este orden: visión y alcance,
arquitectura, modelo de datos, plan de ejecución. Con eso ya puedes trabajar. El
resto se consulta cuando toca.

## Índice

| Documento | Para qué sirve |
|---|---|
| [vision-y-alcance.md](vision-y-alcance.md) | Qué resuelve la web, qué entra en la v1 y qué se queda fuera |
| [arbol-de-pantallas.md](arbol-de-pantallas.md) | El árbol de pantallas original, tal como se validó |
| [mapa-de-rutas.md](mapa-de-rutas.md) | Cada ruta con su acceso, su layout y su estado de carga |
| [arquitectura.md](arquitectura.md) | Stack, capas, flujo de datos, dónde vive cada cosa |
| [modelo-de-datos.md](modelo-de-datos.md) | Tablas, relaciones, enumerados, reglas de integridad |
| [integraciones.md](integraciones.md) | Drive, Calendar, facturación, cobros, correo |
| [seguridad-y-privacidad.md](seguridad-y-privacidad.md) | Accesos, sesiones, protección de datos, RGPD |
| [design-system.md](design-system.md) | Tokens, componentes y el hueco reservado a la guía de marca |
| [contenido-y-seo.md](contenido-y-seo.md) | Textos, metadatos, sitemap, migración de URLs |
| [convenciones.md](convenciones.md) | Cómo se escribe el código en este repositorio |
| [testing-y-calidad.md](testing-y-calidad.md) | Qué se prueba, cómo y hasta dónde |
| [operativa.md](operativa.md) | Entornos, despliegue, copias, qué hacer cuando algo falla |
| [plan-de-ejecucion.md](plan-de-ejecucion.md) | Las siete fases, con entregables y criterios de aceptación |
| [glosario.md](glosario.md) | Vocabulario del negocio en español y su nombre en el código |
| [adr/](adr/) | Decisiones de arquitectura, una por fichero |

## Cómo se mantiene

Un cambio de código que contradiga un documento incluye la corrección del
documento en el mismo commit.

Las decisiones que afectan a la estructura del sistema se registran como ADR. Un
ADR no se edita cuando se cambia de opinión: se escribe uno nuevo que sustituye
al anterior y se marca el viejo como sustituido.
