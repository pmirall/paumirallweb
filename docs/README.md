# Documentación

Estado: pre-construcción terminada. Todavía no hay código, pero ya no falta nada
por decidir para empezar a escribirlo. La guía de imagen de marca ha llegado y el
Drive real está explorado.

## Por dónde empezar

Si es tu primer día en el proyecto, lee en este orden: visión y alcance,
arquitectura, modelo de datos, plan de ejecución. Con eso ya puedes trabajar. El
resto se consulta cuando toca.

Si vienes a construir interfaz, añade identidad visual y contenido de
lanzamiento. Si vienes a la sincronización con Drive, añade el inventario del
Drive.

## Índice

| Documento | Para qué sirve |
|---|---|
| [vision-y-alcance.md](vision-y-alcance.md) | Qué resuelve la web, qué entra en la v1 y qué se queda fuera |
| [arbol-de-pantallas.md](arbol-de-pantallas.md) | El árbol de pantallas original, tal como se validó |
| [mapa-de-rutas.md](mapa-de-rutas.md) | Cada ruta con su acceso, su layout y su estado de carga |
| [arquitectura.md](arquitectura.md) | Stack, capas, flujo de datos, dónde vive cada cosa |
| [modelo-de-datos.md](modelo-de-datos.md) | Tablas, relaciones, enumerados, reglas de integridad |
| [integraciones.md](integraciones.md) | Drive, Calendar, facturación, cobros, correo |
| [drive-inventario.md](drive-inventario.md) | Qué hay de verdad en el Drive y qué implica para la cola |
| [seguridad-y-privacidad.md](seguridad-y-privacidad.md) | Accesos, sesiones, protección de datos, RGPD |
| [identidad-visual.md](identidad-visual.md) | Color, tipografía, forma y movimiento de la marca |
| [design/tokens.css](design/tokens.css) | El fichero de tokens original |
| [design/assets/logo/](design/assets/logo/README.md) | Logotipo, isotipo, favicon y marca de agua |
| [design-system.md](design-system.md) | Método, inventario de componentes, accesibilidad |
| [contenido-de-lanzamiento.md](contenido-de-lanzamiento.md) | El texto real con el que sale el sitio |
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
