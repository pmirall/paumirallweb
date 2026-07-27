import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, devBypassAllowed, verifySession } from '@/lib/auth/admin'
import { Sidebar } from '@/components/admin/Sidebar'
import { adminChrome } from '@/content/admin'
import { logout } from '../login/actions'

/**
 * Marco del panel. El middleware ya corta las peticiones sin sesión antes de
 * llegar aquí; esta comprobación es la segunda barrera y la que le da el correo
 * a la página. La pantalla de acceso vive fuera de este grupo de rutas, así que
 * no lleva el marco.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value)
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="pm-admin">
      <Sidebar dev={devBypassAllowed()} />
      <div className="pm-admin__main">
        <div className="pm-admin__topbar">
          <span className="pm-admin__user">{session.email}</span>
          <form action={logout}>
            <button className="pm-admin__signout" type="submit">
              {adminChrome.signOut}
            </button>
          </form>
        </div>
        <main className="pm-admin__content">{children}</main>
      </div>
    </div>
  )
}
