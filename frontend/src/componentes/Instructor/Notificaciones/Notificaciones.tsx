import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

interface NotificationData {
  id_notificacion: number
  titulo: string
  descripcion: string
  tipo: string
  is_new: boolean
  fecha_creacion: string
}

export function Notificaciones(): ReactElement {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const fetchUserNotifications = async () => {
    try {
      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      const userId = userSession?.id || userSession?.id_Usuario

      setIsLoading(true)

      const requests: Promise<any>[] = [
        userId ? fetch(`/api/notificaciones/usuario/${userId}`).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
        userId ? fetch(`/api/informes-gc/usuario/${userId}`).then(r => r.ok ? r.json() : []) : fetch('/api/informes-gc').then(r => r.ok ? r.json() : []),
        userId ? fetch(`/api/informes-gf/usuario/${userId}`).then(r => r.ok ? r.json() : []) : fetch('/api/informes-gf').then(r => r.ok ? r.json() : []),
      ]

      const [notifsData, gcRes, gfRes] = await Promise.all(requests)

      const mergedList: NotificationData[] = [...(notifsData || [])]

      // Fallback merge observations from reports
      const gcList = (gcRes || []).map((r: any) => ({ ...r, tipo: 'GC' }))
      const gfList = (gfRes || []).map((r: any) => ({ ...r, tipo: 'GF' }))
      const reports = [...gcList, ...gfList]

      reports.forEach((r) => {
        if (r.observaciones && r.observaciones.length > 0) {
          r.observaciones.forEach((o: any) => {
            const obsId = 900000 + (o.id_observacion_gc || o.id_observacion_gf || Math.floor(Math.random() * 10000))
            if (!mergedList.some(n => n.descripcion.includes(o.comentario))) {
              mergedList.push({
                id_notificacion: obsId,
                titulo: `⚠️ Corrección en Informe ${r.tipo} (${r.mes} ${r.anio})`,
                descripcion: `Observación del coordinador: "${o.comentario}"`,
                tipo: 'observation',
                is_new: r.estado === 'correccion' || r.estado === 'alert',
                fecha_creacion: o.fecha || r.fecha_registro || new Date().toISOString(),
              })
            }
          })
        }
      })

      mergedList.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      setNotifications(mergedList)
    } catch (err) {
      console.error('Error fetching user notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notificaciones/${id}/marcar-leida`, {
        method: 'PATCH',
      })
      setNotifications((prev) => prev.map((n) => (n.id_notificacion === id ? { ...n, is_new: false } : n)))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.is_new
    if (filter === 'read') return !n.is_new
    return true
  })

  const unreadCount = notifications.filter((n) => n.is_new).length

  return (
    <section className="page-panel">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Alertas del Coordinador</p>
          <h1>Gestiona tus avisos y solicitudes de corrección.</h1>
          <p className="subtext">Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`button ${filter === 'all' ? 'button--primary' : 'button--ghost'}`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`button ${filter === 'unread' ? 'button--primary' : 'button--ghost'}`}
          >
            Sin leer
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`button ${filter === 'read' ? 'button--primary' : 'button--ghost'}`}
          >
            Leídas
          </button>
        </div>
      </header>

      {isLoading ? (
        <article className="card p-6 text-center text-secondary">Cargando alertas...</article>
      ) : filteredNotifications.length === 0 ? (
        <article className="card p-6 text-center text-secondary">
          <p className="text-muted">No hay notificaciones u observaciones que mostrar con el filtro actual.</p>
        </article>
      ) : (
        <article className="card notifications-card space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id_notificacion}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${n.is_new ? 'border-amber-300 bg-amber-50/80 shadow-sm' : 'border-border bg-bg-alt'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{n.tipo === 'observation' ? '⚠️' : '🔔'}</span>
                <div>
                  <h2 className="text-base font-bold text-foreground">{n.titulo}</h2>
                  <p className="text-sm text-secondary mt-1">{n.descripcion}</p>
                  <small className="text-xs text-text-muted mt-2 block">
                    {new Date(n.fecha_creacion).toLocaleString()}
                  </small>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.is_new && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                    Nueva
                  </span>
                )}
                {n.is_new && (
                  <button
                    type="button"
                    className="button button--ghost text-xs py-1.5 px-3"
                    onClick={() => markAsRead(n.id_notificacion)}
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </article>
      )}
    </section>
  )
}
