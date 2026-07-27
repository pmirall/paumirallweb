// Next inyecta el CSS en el build, pero TypeScript necesita saber que un
// import de hoja de estilos es válido como efecto secundario.
declare module '*.css'
