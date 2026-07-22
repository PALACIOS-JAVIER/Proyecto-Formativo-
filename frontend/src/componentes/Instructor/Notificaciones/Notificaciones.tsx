import { useState } from 'react'
import type { ReactElement } from 'react'

interface NotificationData {
  id: number
  title: string
  description: string
  date: string
  time: string
  isNew: boolean
  type: 'pending' | 'info' | 'reminder' | 'observation'
}

interface NotificationItemProps extends NotificationData {
  onMarkRead: () => void
  onView: () => void
}

function NotificationItem({ title, description, date, time, isNew, type, onMarkRead, onView }: NotificationItemProps) {
  const typeIcons = {
    pending: '📋',
    info: '📄',
    reminder: '🔔',
    observation: '⚠️',
  }

  return (
    <div className={`notification-item ${isNew ? 'notification-pulse' : ''} notification-animate`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl">{typeIcons[type]}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
          <small className="muted">{date} • {time}</small>
        </div>
      </div>
      <div className="notification-actions">
        {isNew ? <span className="notification-tag">Nueva</span> : null}
        <button type="button" className="button button--ghost" onClick={onView}>
          Ver detalles
        </button>
        {isNew ? <button type="button" className="button button--ghost" onClick={onMarkRead}>Marcar como leída</button> : null}
      </div>
    </div>
  )
}

export function Notificaciones(): ReactElement {
  const [notifications, setNotifications] = useState<NotificationData[]>([
    {
      id: 1,
      title: 'Tarea pendiente',
      description: 'El informe de movilidad debe ser completado antes del viernes.',
      date: '21/05/2026',
      time: '09:15',
      isNew: true,
      type: 'pending',
    },
    {
      id: 2,
      title: 'Nueva plantilla',
      description: 'Se agregó una nueva plantilla mensual para contratos SENA.',
      date: '18/05/2026',
      time: '12:02',
      isNew: false,
      type: 'info',
    },
    {
      id: 3,
      title: 'Recordatorio',
      description: 'Revisa el estado de tus reportes antes de la próxima reunión.',
      date: '16/05/2026',
      time: '08:00',
      isNew: false,
      type: 'reminder',
    },
    {
      id: 4,
      title: 'Observación',
      description: 'Se requieren ajustes en las evidencias de movilidad del contrato #1234.',
      date: '15/05/2026',
      time: '11:30',
      isNew: true,
      type: 'observation',
    },
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.isNew
    if (filter === 'read') return !n.isNew
    return true
  })

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isNew: false } : n)))
  }

  const viewNotification = (title: string) => window.alert(`Detalles de: ${title}`)

  const unreadCount = notifications.filter((n) => n.isNew).length

  return (
    <section className="page-panel">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Alertas</p>
          <h1>Gestiona tus avisos y solicitudes más recientes.</h1>
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

      {filteredNotifications.length === 0 ? (
        <article className="card">
          <p className="text-muted">No hay notificaciones que mostrar con el filtro actual.</p>
        </article>
      ) : (
        <article className="card notifications-card">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onMarkRead={() => markAsRead(notification.id)}
              onView={() => viewNotification(notification.title)}
            />
          ))}
        </article>
      )}
    </section>
  )
}
