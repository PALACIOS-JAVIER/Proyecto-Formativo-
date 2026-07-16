import type { ReactElement } from 'react'

interface ReportCardProps {
  month: string
  status: string
  date: string
  note: string
  badge: string
}

function ReportCard({ month, status, date, note, badge }: ReportCardProps) {
  return (
    <article className="card report-card">
      <div className="report-card-header">
        <div>
          <span className="report-month">{month}</span>
          <h2>Informe mensual</h2>
        </div>
        <span className={`status-chip status-chip--${status}`}>{badge}</span>
      </div>
      <p className="report-detail">
        <strong>Fecha de registro:</strong> {date}
      </p>
      <p className="report-detail">
        <strong>Observaciones:</strong> {note}
      </p>
      <div className="report-actions">
        <button type="button" className="button button--secondary">Ver</button>
        <button type="button" className="button button--ghost">Descargar</button>
        <button type="button" className="button button--ghost">Editar</button>
      </div>
    </article>
  )
}

export function Informes(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mis Reportes</p>
          <h1>Revisa los informes enviados y su estado actual.</h1>
        </div>
      </header>

      <div className="reports-grid">
        <ReportCard
          month="Marzo 2026"
          status="success"
          date="10/04/2026"
          note="Informe validado y aprobado sin observaciones."
          badge="aprobado"
        />
        <ReportCard
          month="Abril 2026"
          status="warning"
          date="08/05/2026"
          note="Documento en evaluación por coordinación."
          badge="revisión"
        />
        <ReportCard
          month="Mayo 2026"
          status="alert"
          date="15/05/2026"
          note="Se requieren ajustes en las evidencias de movilidad."
          badge="correcciones"
        />
      </div>
    </section>
  )
}
