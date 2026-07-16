import { useState } from 'react'
import type { ReactElement } from 'react'

interface ReportData {
  month: string
  status: 'success' | 'warning' | 'alert'
  date: string
  note: string
  badge: string
}

interface ReportCardProps extends ReportData {
  onView: () => void
  onDownload: () => void
  onEdit: () => void
  onDelete: () => void
}

function ReportCard({ month, status, date, note, badge, onView, onDownload, onEdit, onDelete }: ReportCardProps) {
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
        <button type="button" className="button button--secondary" onClick={onView}>
          Ver
        </button>
        <button type="button" className="button button--ghost" onClick={onDownload}>
          Descargar
        </button>
        <button type="button" className="button button--ghost" onClick={onEdit}>
          Editar
        </button>
        <button type="button" className="button button--danger" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export function Informes(): ReactElement {
  const [reports, setReports] = useState<ReportData[]>([
    {
      month: 'Marzo 2026',
      status: 'success',
      date: '10/04/2026',
      note: 'Informe validado y aprobado sin observaciones.',
      badge: 'aprobado',
    },
    {
      month: 'Abril 2026',
      status: 'warning',
      date: '08/05/2026',
      note: 'Documento en evaluación por coordinación.',
      badge: 'revisión',
    },
    {
      month: 'Mayo 2026',
      status: 'alert',
      date: '15/05/2026',
      note: 'Se requieren ajustes en las evidencias de movilidad.',
      badge: 'correcciones',
    },
  ])

  const viewReport = (month: string) => window.alert(`Visualizando informe de ${month}.`)
  const downloadReport = (month: string) => window.alert(`Descargando informe de ${month}...`)
  const editReport = (month: string) => window.alert(`Editar informe de ${month}.`)
  const deleteReport = (month: string) => setReports((prev) => prev.filter((report) => report.month !== month))

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mis Reportes</p>
          <h1>Revisa los informes enviados y su estado actual.</h1>
        </div>
      </header>

      {reports.length === 0 ? (
        <article className="card">
          <p>No hay informes guardados en este momento.</p>
        </article>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <ReportCard
              key={report.month}
              {...report}
              onView={() => viewReport(report.month)}
              onDownload={() => downloadReport(report.month)}
              onEdit={() => editReport(report.month)}
              onDelete={() => deleteReport(report.month)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
