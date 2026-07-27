import { Archivo, Bitter } from 'next/font/google'

/**
 * Archivo se carga como variable para poder usar el eje de ancho. La marca
 * pide ancho 88, que no es el valor por defecto: se aplica con font-stretch
 * desde los tokens. Pesos y anchos no se pueden declarar a la vez aquí, así
 * que el peso lo fija el CSS. Ver docs/identidad-visual.md.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
})

export const bitter = Bitter({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-bitter',
})
