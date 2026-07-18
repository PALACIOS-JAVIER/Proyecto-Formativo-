import type { ReactElement } from 'react'

export function RevisarInformes(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header coordinator-hero">
        <div>
          <p className="eyebrow">Revisar informes</p>
          <h1>Gestión de informes pendientes</h1>
          <p className="subtext">Aquí podrás aprobar, rechazar y dar seguimiento a los informes enviados.</p>
        </div>
        <span className="status-chip status-chip--warning">3 pendientes</span>
      </header>

      <div className="dashboard-panels">
        <article className="card">
          <h3>Informes por revisar</h3>
          <ul className="priority-list">
            <li>Informe de seguimiento - Instructor A</li>
            <li>Reporte mensual - Instructor B</li>
            <li>Acta de cierre - Instructor C</li>
          </ul>
        </article>
        <article className="card">
          <h3>Resumen</h3>
          <p className="stat-small">2 aprobados hoy</p>
          <p className="stat-small">1 requiere corrección</p>
          <p className="stat-small">1 en espera de firma</p>
        </article>
      </div>
    </section>
  )
}
