# Convenciones de código

## Idioma

Todo identificador va en inglés: ficheros, carpetas, funciones, variables,
tablas, columnas, tipos, ramas y mensajes de commit.

Todo texto que lee una persona va en español, y no se escribe dentro de un
componente. Ver `contenido-y-seo.md`.

Los comentarios van en español cuando explican una decisión de negocio y en
inglés cuando explican código. En la práctica casi todos serán en español,
porque el código que necesita explicarse suele ser el que codifica una regla del
negocio.

La tabla de equivalencias está en `glosario.md`. Se consulta antes de inventar un
nombre.

## Ficheros y carpetas

Carpetas y ficheros de ruta en minúsculas con guiones, como exige el App Router.
Componentes en `PascalCase.tsx`. Utilidades y consultas en `camelCase.ts`.

Un componente por fichero, con el mismo nombre que el fichero. Los componentes
auxiliares que solo usa ese fichero pueden vivir dentro sin exportarse.

Barrel files solo en `src/components/ui/`. En el resto, importación directa: los
índices que reexportan todo rompen el árbol de dependencias y alargan los builds.

## TypeScript

Modo estricto, sin excepciones. `any` está prohibido; cuando no se conoce el
tipo, `unknown` y una comprobación.

Los tipos de la base de datos se infieren del esquema de Drizzle, no se escriben
a mano. Un tipo escrito a mano que duplica una tabla se desincroniza el día que
alguien añade una columna.

Toda entrada externa se valida con Zod: formularios, parámetros de ruta, query
params, cuerpos de webhook y respuestas de APIs de terceros. La respuesta de un
servicio externo es entrada externa aunque su documentación diga otra cosa.

`type` para formas de datos, `interface` solo cuando hace falta extender.

Sin enums de TypeScript. Uniones de literales, que se llevan mejor con Zod y con
Drizzle.

## Componentes

Server Component por defecto. `'use client'` solo cuando hace falta estado,
efecto, evento del navegador o una API del navegador, y se pone en el componente
más pequeño que lo necesite. Un formulario interactivo dentro de una página
estática es un componente de cliente pequeño, no una página de cliente entera.

Las props se tipan con un `type` declarado justo encima del componente. Sin
`React.FC`.

Un componente que recibe más de seis props probablemente está haciendo dos cosas.

Nada de `useEffect` para traer datos. Los datos se traen en el servidor y bajan
como props.

## Datos

Las consultas viven en `src/db/queries/`, agrupadas por dominio, y se exportan
como funciones con nombre que describe la intención: `getPublishedProjects`,
`getJobWithClient`, `listOverdueInvoices`.

Un componente nunca llama a Drizzle directamente ni escribe SQL.

Las mutaciones van en Server Actions, en ficheros `actions.ts` junto a la ruta que
las usa. Cada acción valida con Zod, comprueba permisos, hace el trabajo,
invalida la caché que toque y devuelve un resultado tipado con éxito o error. No
lanza excepciones para errores esperables.

El dinero se guarda y se opera en céntimos, en enteros. La conversión a euros
ocurre solo al pintar. Una sola función de formato, en `src/lib/format.ts`.

Las fechas se guardan en UTC y se pintan en la zona horaria de Madrid. Una sola
función de formato para eso también.

## Estilos

Tailwind con tokens. Ninguna clase con valor arbitrario del tipo `text-[#1a1a1a]`
o `p-[13px]`. Si el valor no existe, se añade el token.

Las clases largas se organizan siempre en el mismo orden: disposición, tamaño,
espaciado, tipografía, color, estado. Lo aplica un plugin de Prettier, no la
disciplina de nadie.

Las variantes de un componente se resuelven con un mapa de clases, no
concatenando cadenas.

## Errores

Un error esperable es un valor de retorno. Un error inesperado es una excepción
que sube y la registra el manejador de la zona.

Los errores que ve el cliente en `/c/` explican qué hacer. Los del admin muestran
el detalle técnico. Los de la zona pública son sobrios y ofrecen volver.

Nada de `catch` vacíos. Nada de `console.log` en el código que se despliega; para
eso está el registro con contexto.

## Accesibilidad

HTML con la etiqueta que corresponde. Un botón es un `<button>`. Un enlace que
navega es un `<a>`. Un `<div>` con `onClick` no se acepta en revisión.

Ver `design-system.md` para el resto.

## Formato y linting

Prettier con la configuración del repositorio, sin discusión sobre estilo.

ESLint con la configuración de Next más reglas propias: prohibido `any`,
prohibido importar entre zonas (un componente de `admin` no importa de `client`),
prohibido usar variables de entorno del servidor fuera de `src/lib/env.ts`.

Las variables de entorno se leen una vez en `src/lib/env.ts`, se validan con Zod
al arrancar y se exportan tipadas. Si falta una, la aplicación no arranca en vez
de fallar tres pantallas más adelante.

Todo esto corre en el hook de pre-commit y en CI. Lo que pasa en local pasa en
CI.

## Commits y ramas

Ramas: `feat/`, `fix/`, `docs/`, `chore/` más una descripción corta en inglés con
guiones.

Commits en imperativo y en inglés, con el asunto por debajo de 72 caracteres. Un
commit hace una cosa. Si el mensaje necesita una "y", suelen ser dos commits.

El cuerpo del commit explica por qué, no qué. El qué ya está en el diff.

No se hace push a `main`. No se abre un pull request si no se ha pedido.
