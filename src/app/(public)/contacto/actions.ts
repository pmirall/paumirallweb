'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { contactPage } from '@/content/pages'
import { SERVICE_SLUGS } from '@/lib/services'

/**
 * Crea un lead. En la fase 3 escribe en la tabla `leads` y avisa por correo;
 * de momento valida. La validación del navegador es comodidad, no seguridad:
 * la de verdad es esta. Ver docs/seguridad-y-privacidad.md.
 */
const schema = z.object({
  name: z.string().trim().min(2, contactPage.errors.name),
  email: z.string().trim().email(contactPage.errors.email),
  phone: z.string().trim().optional(),
  service: z.enum(SERVICE_SLUGS).optional().or(z.literal('')),
  message: z.string().trim().min(10, contactPage.errors.message),
  consent: z.literal('on', { message: contactPage.errors.consent }),
})

export type ContactValues = {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

export type ContactState = {
  errors?: Partial<Record<'name' | 'email' | 'message' | 'consent' | 'form', string>>
  values?: ContactValues
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values: ContactValues = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    service: String(formData.get('service') ?? ''),
    message: String(formData.get('message') ?? ''),
  }

  // Campo trampa: lo rellenan los robots, no las personas. Se responde como si
  // el envío hubiera ido bien, para no darles la pista de que se ha detectado.
  const trap = String(formData.get('website') ?? '')
  if (trap.length > 0) {
    redirect('/contacto/gracias')
  }

  const parsed = schema.safeParse({ ...values, consent: formData.get('consent') ?? '' })

  if (!parsed.success) {
    const errors: ContactState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'name' || key === 'email' || key === 'message' || key === 'consent') {
        errors[key] = issue.message
      }
    }
    // Si el fallo no encaja en ningún campo, se dice igualmente. Un formulario
    // que no envía y no explica por qué es peor que uno que falla.
    if (Object.keys(errors).length === 0) {
      errors.form = contactPage.errors.generic
    }
    // Un envío fallido no pierde lo escrito.
    return { errors, values }
  }

  // TODO fase 3: insertar en `leads` y avisar con Resend.
  redirect('/contacto/gracias')
}
