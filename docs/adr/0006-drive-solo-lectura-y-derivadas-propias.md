# 0006. Drive en solo lectura y derivadas propias en Storage

Estado: aceptada
Fecha: 2026-07-27

## Contexto

Ocho años de trabajo están en Google Drive, con una estructura de carpetas que ya
funciona y una copia de seguridad que ya existe. Mover todo eso a otro sitio es
un proyecto en sí mismo y rompe la forma de trabajar de todos los días.

Pero servir imágenes directamente desde Drive es lento, tiene límites de cuota y
expone la estructura de carpetas al navegador.

## Decisión

Drive es el origen de la verdad para los originales y la aplicación solo lee. No
sube, no modifica y no borra. El alcance de la API es `drive.readonly`.

De cada archivo se generan tres derivadas que se guardan en Supabase Storage:
miniatura de 480 px, tamaño web de 2000 px y copia con marca de agua. Eso es lo
que sirve la web.

El original nunca se copia. Cuando el cliente pide la descarga en alta
resolución, el servidor comprueba permisos y hace de intermediario del flujo. La
URL de Drive no llega nunca al navegador.

## Consecuencias

La forma de trabajar no cambia. Se siguen volcando las tarjetas a Drive como
siempre y el sistema se entera solo.

Si mañana se apaga el sistema, las carpetas de Drive siguen exactamente igual.
Esto es lo que hace que la decisión sea reversible.

Si Drive se cae o se agota la cuota, el portfolio y las galerías siguen
funcionando en calidad web, porque las derivadas están en Storage. Lo único que
falla es la descarga en alta resolución. Un modo degradado que el cliente
entiende.

El coste de almacenamiento se duplica en la parte de las derivadas, que son una
fracción del peso de los originales. Aceptable.

Las derivadas se pueden regenerar desde Drive, así que no hace falta incluirlas
en la copia de seguridad.

A cambio, hay latencia entre subir a Drive y ver la foto en el sistema: hasta una
hora, que es lo que tarda la siguiente pasada de sincronización. Se puede forzar
la pasada desde `/admin/drive` cuando hay prisa.

## Alternativas descartadas

Subir los archivos a Storage desde el admin y olvidarse de Drive. Más control y
menos latencia, pero obliga a cambiar el flujo de trabajo de ocho años y a migrar
todo el archivo antes de empezar.

Servir las imágenes directamente desde Drive con enlaces temporales. Ahorra el
almacenamiento de las derivadas, y a cambio deja el rendimiento del sitio en
manos de la cuota de una API que no controlamos.

Escritura en Drive para organizar carpetas desde el admin. Cualquier error del
sistema tocaría archivos originales irrecuperables. No compensa.
