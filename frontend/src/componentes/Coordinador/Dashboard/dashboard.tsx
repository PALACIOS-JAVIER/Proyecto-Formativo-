import type { ReactElement } from 'react'

const coordinatorDashboardStats = [
  { id: 'informes', label: 'Informes pendientes', value: '12', detail: 'Requieren revisión esta semana', tone: 'warning' },
  { id: 'instructores', label: 'Instructores activos', value: '8', detail: '4 con cumplimiento alto', tone: 'success' },
  { id: 'alertas', label: 'Alertas abiertas', value: '3', detail: '2 de prioridad alta', tone: 'alert' },
]

const recentActivities = [
  { name: 'María Fernández', time: 'Hace 1h', progress: '86%', state: 'Subió informe' },
  { name: 'Luis Ortega', time: 'Hace 2h', progress: '72%', state: 'Revisó indicadores' },
  { name: 'Ana Torres', time: 'Hace 3h', progress: '61%', state: 'Solicitó apoyo' },
]

const priorities = [
  'Revisar 2 informes con estado pendiente',
  'Contactar a 1 instructor con cumplimiento bajo',
  'Confirmar 3 aprobaciones del mes',
]

const toneClassMap: Record<string, string> = {
  success: 'status-chip--success',
  warning: 'status-chip--warning',
  alert: 'status-chip--alert',
}

export function Dashboard(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header coordinator-hero">
        <div>
          <p className="eyebrow">Panel de coordinación</p>
          <h1>Vista operativa del equipo</h1>
          <p className="subtext">Monitorea desempeño, revisa informes y prioriza acciones de seguimiento sin perder contexto.</p>
        </div>
        <div className="hero-actions">
          <span className="status-chip status-chip--success">● En línea</span>
          <span className="status-chip status-chip--warning">17 tareas hoy</span>
        </div>
      </header>

      <div className="stats-grid">
        {coordinatorDashboardStats.map((item: { id: string; label: string; value: string; detail: string; tone: string }) => (
          <article key={item.id} className="card stat-card">
            <p className="stat-label">{item.label}</p>
            <strong>{item.value}</strong>
            <p className="stat-small">{item.detail}</p>
            <span className={`status-chip ${toneClassMap[item.tone]}`}>{item.tone === 'success' ? 'Óptimo' : item.tone === 'warning' ? 'Atención' : 'Crítico'}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-panels">
        <article className="card coordinator-activity-card">
          <h3>Actividad reciente</h3>
          <ul className="load-list">
            {recentActivities.map((activity) => (
              <li key={activity.name}>
                <div className="load-meta">
                  <strong>{activity.name}</strong>
                  <span>{activity.time}</span>
                </div>
                <div className="load-meta load-meta--small">
                  <span className="muted">{activity.state}</span>
                  <span>{activity.progress}</span>
                </div>
                <div className="load-bar"><span style={{ width: activity.progress }} /></div>
              </li>
            ))}
          </ul>
        </article>

        <article className="card coordinator-priority-card">
          <h3>Acciones prioritarias</h3>
          <ul className="priority-list">
            {priorities.map((priority) => (
              <li key={priority}>{priority}</li>
            ))}
          </ul>
          <div className="mini-summary">
            <div>
              <p className="stat-small">Cierre semanal</p>
              <strong>78%</strong>
            </div>
            <div>
              <p className="stat-small">Cumplimiento</p>
              <strong>92%</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
