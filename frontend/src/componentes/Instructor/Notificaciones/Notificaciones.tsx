import type { ReactElement } from 'react'

export function Notificaciones(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Alertas</p>
          <h1>Gestiona tus avisos y solicitudes más recientes.</h1>
        </div>
      </header>

      <article className="card notifications-card">
        <div className="notification-item notification-item--new notification-pulse">
          <div>
            <h2>Tarea pendiente</h2>
            <p>El informe de movilidad debe ser completado antes del viernes.</p>
            <small className="muted">21/05/2026 • 09:15</small>
          </div>
          <div className="notification-actions">
            <span className="notification-tag">Nueva</span>
            <button type="button" className="button button--secondary">Ver</button>
          </div>
        </div>

        <div className="notification-item notification-animate">
          <div>
            <h2>Nueva plantilla</h2>
            <p>Se agregó una nueva plantilla mensual para contratos SENA.</p>
            <small className="muted">18/05/2026 • 12:02</small>
          </div>
          <div className="notification-actions">
            <button type="button" className="button button--ghost">Marcar como leída</button>
          </div>
        </div>

        <div className="notification-item notification-animate">
          <div>
            <h2>Recordatorio</h2>
            <p>Revisa el estado de tus reportes antes de la próxima reunión.</p>
            <small className="muted">16/05/2026 • 08:00</small>
          </div>
          <div className="notification-actions">
            <button type="button" className="button button--ghost">Marcar como leída</button>
          </div>
        </div>
        
        <div className="notification-item notification-animate">
          <div>
            <h2>Observación</h2>
            <p>Se requieren ajustes en las evidencias de movilidad del contrato #1234.</p>
            <small className="muted">15/05/2026 • 11:30</small>
          </div>
          <div className="notification-actions">
            <button type="button" className="button button--secondary">Ver detalles</button>
          </div>
        </div>
      </article>
    </section>
  )
}
