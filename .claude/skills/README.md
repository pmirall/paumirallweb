# Skills instaladas

Estas skills vienen de fuera del repositorio. No se editan aquí: los cambios se
perderían en la siguiente actualización.

## ui-ux-pro-max

Origen: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
Versión: 2.11.0
Commit instalado: `3b5df7547964f0cb3424de74cff55b69039250d3`
Instalada el: 2026-07-27
Licencia: MIT

El paquete trae siete skills. En este proyecto se usan tres:

`ui-ux-pro-max` es la principal. Base de datos consultable de estilos, paletas,
combinaciones tipográficas, guías de experiencia de usuario y patrones por stack,
con Next.js, Tailwind y shadcn/ui entre los soportados.

`ui-styling` cubre componentes accesibles con shadcn/ui sobre Radix y Tailwind.

`design-system` cubre arquitectura de tokens en tres capas, de primitivo a
semántico a componente.

Las otras cuatro (`design`, `brand`, `banner-design`, `slides`) quedan instaladas
porque vienen en el paquete, pero no se usan para construir la web. Ver `CLAUDE.md`.

Los scripts de `design/scripts/` leen un fichero `.env` local buscando
`GEMINI_API_KEY` para generar imágenes. En este proyecto no se ejecutan.

## Actualizar

```bash
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/uiux
rm -rf .claude/skills/{banner-design,brand,design,design-system,slides,ui-styling,ui-ux-pro-max}
cp -r /tmp/uiux/.claude/skills/* .claude/skills/
```

Después, actualiza la versión y el commit de este fichero.
