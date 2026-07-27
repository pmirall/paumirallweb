// Variables de entorno para las pruebas. Se fijan antes de importar nada, para
// que src/lib/env.ts las valide con los valores de prueba.
process.env.ADMIN_ALLOWED_EMAILS = 'pau@example.com'
process.env.SESSION_SECRET = 'secreto-de-prueba'
