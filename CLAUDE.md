# CLAUDE.md

Guía de trabajo para agentes y personas que tocan este repositorio.

## Qué es esto

La web de Pau Miralles, fotógrafo y videógrafo. No es solo un portfolio: el mismo
sistema publica el escaparate público, entrega el material a los clientes y lleva
la administración del negocio (encargos, facturas, gastos, rentabilidad).

Tres zonas, un solo sistema de diseño y una sola base de datos:

| Zona | Prefijo | Acceso | Indexable |
|---|---|---|---|
| Pública | `/` | abierto | sí |
| Cliente | `/c/:token` | token en la URL + PIN de 4 dígitos | no |
| Administración | `/admin` | Google Sign-In restringido a una cuenta | no |

El detalle de rutas está en `docs/mapa-de-rutas.md`. Antes de escribir código,
lee `docs/README.md`.

## Estado del repositorio

Fase de pre-construcción. Aquí solo hay documentación. La fase 0 del plan
(`docs/plan-de-ejecucion.md`) crea el proyecto y los comandos que se listan más
abajo; hasta entonces no existen.

## Stack

- Next.js 15 con App Router y React Server Components
- TypeScript en modo estricto
- Tailwind CSS v4 con tokens de diseño en CSS custom properties
- Supabase: Postgres, Auth, Storage
- Drizzle ORM para el esquema y las migraciones
- Vercel para hosting y cron jobs
- Google Drive API como origen de los archivos, Google Calendar en solo lectura
- Stripe para el cobro, proveedor certificado externo para la factura
- Resend para el correo transaccional
- Vitest y Playwright

Las razones de cada elección están en `docs/adr/`. Si vas a cambiar una de ellas,
escribe un ADR nuevo antes de tocar el código.

## Comandos

```bash
pnpm dev              # servidor de desarrollo
pnpm build            # build de producción
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm db:generate      # genera la migración a partir del esquema Drizzle
pnpm db:migrate       # aplica migraciones
pnpm db:seed          # datos de ejemplo para desarrollo
```

Antes de dar por terminado cualquier cambio: `pnpm lint && pnpm typecheck && pnpm test`.

## Estructura

```
src/
  app/
    (public)/         # zona A
    c/[token]/        # zona B
    admin/            # zona C
    api/              # route handlers
  components/
    ui/               # primitivas del sistema de diseño
    public/           # componentes de la zona A
    client/           # componentes de la zona B
    admin/            # componentes de la zona C
  db/
    schema/           # tablas Drizzle, un fichero por dominio
    queries/          # consultas reutilizables
  lib/
    drive/            # cliente de Google Drive y sincronización
    billing/          # adaptador del proveedor de facturación
    media/            # derivadas, marca de agua, ZIP
    auth/             # sesión de admin y sesión de galería
  styles/
docs/
.claude/
  skills/            # skills externas, no se editan aquí
```

## Reglas que no se negocian

### Idiomas

El código va en inglés: nombres de tablas, columnas, funciones, variables,
ficheros y ramas. Los textos que ve una persona van en español, y viven en
`src/content/` o en la base de datos, nunca incrustados en un componente. La
tabla de equivalencias entre el vocabulario del negocio y el del código está en
`docs/glosario.md`.

### Diseño

Ningún componente lleva colores, tipografías, radios, sombras ni espacios
escritos a mano. Todo sale de los tokens de `src/styles/tokens.css`. Si necesitas
un valor que no existe como token, añade el token. No metas el valor suelto, y no
uses clases de Tailwind con valor arbitrario.

Los tokens ya tienen los valores definitivos de la marca. El original está en
`docs/design/tokens.css` y la fase 0 lo copia a `src/styles/tokens.css`. Si la
marca cambia, cambia primero en el original.

Lo que define visualmente el sitio: turquesa, esmeralda, tinta y hueso; Archivo
en cursiva 800 para titulares y Bitter para epígrafes y entradillas; corte de
esquina a 45 grados en vez de esquinas redondeadas; sombras que son placas
macizas desplazadas, no difuminados. Sin modo oscuro. El detalle está en
`docs/identidad-visual.md`.

### Trabajo de interfaz

Antes de construir o revisar interfaz, invoca la skill `ui-ux-pro-max`. Cuenta
como interfaz crear o refactorizar una pantalla o un componente, decidir
jerarquía visual, espaciado o disposición, definir estados e interacciones,
resolver comportamiento responsive, y revisar accesibilidad. Se invoca antes de
escribir el componente, no después para justificar lo que ya está hecho.

No se invoca para lógica de servidor, consultas, integraciones ni infraestructura.
Ahí no aporta nada.

Del paquete instalado en `.claude/skills/` se usan tres: `ui-ux-pro-max` para las
decisiones de interfaz, `ui-styling` para componentes accesibles con Tailwind, y
`design-system` para la arquitectura de tokens. Las otras cuatro (`design`,
`brand`, `banner-design`, `slides`) vienen en el paquete y no se usan aquí.

Cuando la skill y la documentación de este repositorio digan cosas distintas,
gana la documentación de este repositorio. Dos casos concretos que se van a dar:

La skill propone paletas y combinaciones tipográficas. Aquí eso ya está decidido
por la marca, así que se descarta. Aprovecha sus recomendaciones de estructura,
jerarquía, estados, contraste y patrones de interacción, y deja fuera los valores
concretos de color y de tipografía.

La skill sugiere a veces escribir valores directos en las clases. Aquí no se
hace, ni siquiera si la sugerencia viene de ella. El valor entra como token.

### Seguridad

Las credenciales de Google Drive, Stripe y el proveedor de facturación se usan
solo en el servidor. Ninguna llega al navegador, ni siquiera a un Server
Component que luego se serialice.

La zona de cliente no tiene cuentas. El token de la URL identifica la galería y
el PIN la desbloquea. Al validar el PIN se emite una cookie de sesión firmada,
`HttpOnly` y `SameSite=Lax`, con caducidad propia. Los intentos de PIN se limitan
por token y por IP. Detalles en `docs/seguridad-y-privacidad.md`.

Ninguna ruta bajo `/c/` o `/admin` se indexa. Cabecera `X-Robots-Tag: noindex` en
el middleware, no solo en el `<meta>`.

### Datos

Un encargo es la unidad central. Un proyecto del portfolio es un encargo con
publicación activa, no una entidad aparte. Nunca dupliques datos del encargo en
una tabla de portfolio; los campos que solo importan de cara al público viven en
`job_publications`, ligada uno a uno.

Toda escritura sobre dinero (facturas, cobros, gastos) deja registro en
`audit_log`. No se borra una factura: se rectifica.

### Archivos

Google Drive es el origen de la verdad para los originales. La aplicación nunca
los modifica ni los borra, solo lee. Las versiones que sirve la web (miniatura,
tamaño web, copia con marca de agua) se generan una vez y se guardan en Supabase
Storage. Si Drive se cae, la web sigue mostrando el portfolio y las galerías en
calidad web; lo único que falla es la descarga en alta resolución.

## Cómo trabajar aquí

Lee la documentación del dominio que vas a tocar antes de escribir nada. Cada
documento de `docs/` cubre un área y dice qué decisiones ya están cerradas.

Trabaja por fases del plan de ejecución. Cada fase tiene criterios de aceptación
escritos; una fase está hecha cuando se cumplen todos, no cuando el código
compila.

Si el plan y la realidad no coinciden, actualiza el plan en el mismo commit que
cambia el código. Documentación que miente es peor que no tenerla.

Cuando una decisión no esté escrita en ningún sitio y afecte a más de un fichero,
para y pregunta. No la inventes en silencio.

### Textos

Todo texto que lea una persona pasa por la skill `humanizer` antes de entrar en
el repositorio. Aplica a la web pública, a los mensajes de la zona de cliente, a
las etiquetas del admin, a los correos y a esta documentación. Sin em dashes, sin
emojis decorativos, sin títulos en mayúscula inicial en cada palabra, sin listas
de tres por costumbre.

## Git

Ramas: `feat/`, `fix/`, `docs/`, `chore/` seguido de una descripción corta en
inglés y con guiones.

Commits en imperativo, en inglés, con el asunto por debajo de 72 caracteres. Un
commit hace una cosa. Si el mensaje necesita una "y", probablemente son dos
commits.

No se hace push a `main` directamente. No se crea un pull request salvo que se
pida de forma explícita.
