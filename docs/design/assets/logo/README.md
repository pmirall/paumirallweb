# Logotipo

No hay un logotipo dibujado. Hay uno compuesto, que es lo que la marca ya decía:
"Pau Miralles" en Archivo cursiva 800, ancho 88, con el descriptor en Bitter 700
espaciado hasta igualar el ancho del nombre.

Estos ficheros son ese texto convertido a curvas con las fuentes reales, así que
no dependen de que la tipografía cargue y se ven igual en un favicon que en una
marca de agua. El muestrario está en `muestrario.png`.

## Qué hay

| Fichero | Para qué |
|---|---|
| `logotipo.svg` | el principal: nombre y descriptor. Cabecera, pie, correos |
| `logotipo-wordmark.svg` | solo el nombre, cuando el descriptor sobra o no cabe |
| `isotipo.svg` | PM dentro del corte de la marca. Avatar, perfiles, sellos |
| `isotipo-turquesa.svg` | el mismo sobre turquesa, para fondos oscuros o de foto |
| `favicon.svg` | una P sola. Es el que va en la pestaña |
| `marca-de-agua.svg` | mosaico para las galerías con la factura pendiente |
| `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png` | iconos rasterizados |

## Cómo se usan

`logotipo.svg` y `logotipo-wordmark.svg` van en `currentColor`, así que toman el
color del contexto: blanco sobre los bloques de tinta, tinta sobre los de hueso.
No hay que mantener una copia por color.

El isotipo y el favicon sí llevan color fijo, porque el corte a 45 grados
necesita un relleno propio para leerse.

El favicon lleva una P y no PM a propósito. A 16 píxeles las dos letras en
cursiva se emborronan y no se distingue nada; con una sola se lee. El isotipo
completo se reserva para 32 píxeles en adelante.

La marca de agua es un mosaico de 560 por 340 pensado para repetirse sobre la
foto, no para colocarse una vez. Va en blanco al 34 por ciento con un filo oscuro
muy suave, para que se lea tanto sobre cielo como sobre sombra. El generador de
derivadas la compone sobre la variante `mark`.

## Espacio libre y tamaño mínimo

Alrededor del logotipo se deja como mínimo la altura de la P mayúscula. Nada
entra en ese margen.

El principal no baja de 140 píxeles de ancho, porque por debajo el descriptor
deja de leerse. Por debajo de eso se usa el wordmark, y por debajo de 90, el
isotipo.

## Lo que no se hace

No se reescribe con otra tipografía. No se pone recto: la cursiva es la marca.
No se estira ni se comprime, que para eso el eje de ancho ya está fijado en 88.
No se le añade contorno, sombra ni degradado. No se mete dentro de una forma que
no sea el corte del isotipo.

## Cómo se regeneró

Las fuentes salieron de la propia guía de marca, que las traía empotradas.
Archivo se instanció en ancho 88 y Bitter en peso 700, se compuso el texto con
HarfBuzz para que el kerning fuese el real, y se convirtieron los glifos a
trazados.

Si hay que rehacerlo con otro texto, el procedimiento está en el historial de la
rama; lo que importa conservar son los dos valores de los ejes, 88 y 700, porque
son los que hacen que el logotipo coincida con el resto del sitio.

## Licencia

Archivo y Bitter se distribuyen por Google Fonts bajo la SIL Open Font License,
que permite convertir los glifos a curvas y usarlos así en un logotipo. Los
ficheros de este directorio no contienen fuentes, solo trazados.
