import type { Metadata } from 'next'
import { devBypassAllowed } from '@/lib/auth/admin'
import { adminLogin } from '@/content/admin'
import { buttonClass } from '@/components/ui'
import { devLogin } from './actions'

export const metadata: Metadata = { title: 'Acceso · Administración', robots: { index: false } }

// El acceso de desarrollo depende del entorno en ejecución, así que la página
// no se prerenderiza.
export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  const dev = devBypassAllowed()

  return (
    <main className="pm-login">
      <div className="pm-login__card">
        <p className="pm-eyebrow pm-eyebrow--on-ink">{adminLogin.eyebrow}</p>
        <h1 className="pm-login__title">{adminLogin.title}</h1>
        <p className="pm-login__body">{adminLogin.body}</p>

        {/* Google Sign-In real: pendiente de credenciales. Ver plan, fase 1. */}
        <button className={buttonClass('accent')} type="button" disabled>
          {adminLogin.google}
        </button>

        {dev ? (
          <form action={devLogin}>
            <button className={buttonClass('ghost')} type="submit">
              {adminLogin.dev}
            </button>
          </form>
        ) : null}
      </div>
    </main>
  )
}
