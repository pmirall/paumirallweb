# 0009. Construir sobre tokens antes de tener la guía de marca

Estado: aceptada
Fecha: 2026-07-27

## Contexto

La guía de imagen de marca llegará en una fase posterior. El desarrollo no puede
esperar a que llegue, y tampoco puede construirse de forma que aplicarla después
signifique repasar cada componente.

## Decisión

Ningún componente contiene un color, una tipografía, un radio, una sombra ni un
espacio escrito a mano. Todo sale de tokens declarados como custom properties de
CSS en `src/styles/tokens.css` y expuestos a Tailwind con `@theme`.

Mientras no llegue la guía, los tokens tienen valores provisionales: escala de
grises neutra, tipografía de sistema y espacios basados en 4 píxeles.

Los colores se declaran en pares de fondo y contenido, para que el contraste se
resuelva en el token y no en cada uso.

Cuando llegue la guía, se sustituyen los valores de ese fichero. Si hay que tocar
un componente, es que faltaba un token, y se corrige añadiéndolo.

Las clases de Tailwind con valor arbitrario están prohibidas. Una regla de lint
las bloquea.

## Consecuencias

El sitio se ve soso durante todo el desarrollo, y eso es lo correcto. Si una
pantalla funciona en grises, funciona mejor con la marca puesta. Los problemas de
jerarquía y de espaciado se ven mejor sin color de por medio.

Aplicar la guía es un trabajo de horas, no de semanas.

El modo oscuro sale casi gratis: los tokens se redefinen bajo
`prefers-color-scheme: dark` y ningún componente sabe en qué modo está. Si la
guía decide que no hay modo oscuro, se deja el bloque sin rellenar.

A cambio, hay que resistir la tentación de "solo este gris un poco más claro
aquí". La regla de lint ayuda; la disciplina hace el resto.

También hay que aceptar que enseñar avances en gris no impresiona a nadie. Es un
coste de comunicación, no técnico.

## Alternativas descartadas

Esperar a la guía para empezar la interfaz. Bloquea el calendario por una entrega
externa.

Elegir una paleta provisional bonita. Peor que los grises: crea apego a
decisiones que van a cambiar, y esconde los problemas de jerarquía detrás del
color.

Valores escritos a mano ahora y refactor después. Es exactamente el trabajo que
esta decisión evita, multiplicado por treinta y siete pantallas.
