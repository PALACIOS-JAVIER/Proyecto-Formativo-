import { useState } from 'react'
import type { ReactElement } from 'react'

interface ReportData {
  id: number
  month: string
  status: 'success' | 'warning' | 'alert'
  date: string
  note: string
  badge: string
  instructor: string
  contract: string
  items: number
}

interface ReportCardProps extends ReportData {
  onView: () => void
  onDownload: () => void
  onDelete: () => void
}

function ReportCard({ month, status, date, note, badge, instructor, contract, items, onView, onDownload, onDelete }: ReportCardProps) {
  return (
    <article className="card report-card">
      <div className="report-card-header">
        <div>
          <span className="report-month">{month}</span>
          <h2>Informe mensual</h2>
        </div>
        <span className={`status-chip status-chip--${status}`}>{badge}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Instructor:</span>
          <strong className="text-foreground">{instructor}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Contrato:</span>
          <strong className="text-foreground">{contract}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Evidencias:</span>
          <strong className="text-foreground">{items} archivos</strong>
        </div>
      </div>

      <p className="report-detail">
        <strong>Fecha de registro:</strong> {date}
      </p>
      <p className="report-detail">
        <strong>Observaciones:</strong> {note}
      </p>

      <div className="report-actions">
        <button type="button" className="button button--secondary" onClick={onView}>
          Ver detalles
        </button>
        <button type="button" className="button button--ghost" onClick={onDownload}>
          Descargar
        </button>
        <button type="button" className="button button--ghost" onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export function Informes(): ReactElement {
  const [reports, setReports] = useState<ReportData[]>([
    {
      id: 1,
      month: 'Marzo 2026',
      status: 'success',
      date: '10/04/2026',
      note: 'Informe validado y aprobado sin observaciones.',
      badge: 'aprobado',
      instructor: 'María Fernanda',
      contract: '#1234',
      items: 5,
    },
    {
      id: 2,
      month: 'Abril 2026',
      status: 'warning',
      date: '08/05/2026',
      note: 'Documento en evaluación por coordinación.',
      badge: 'revisión',
      instructor: 'María Fernanda',
      contract: '#1234',
      items: 3,
    },
    {
      id: 3,
      month: 'Mayo 2026',
      status: 'alert',
      date: '15/05/2026',
      note: 'Se requieren ajustes en las evidencias de movilidad.',
      badge: 'correcciones',
      instructor: 'María Fernanda',
      contract: '#1234',
      items: 4,
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'alert'>('all')

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.month.toLowerCase().includes(searchTerm.toLowerCase()) || report.note.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const viewReport = (month: string) => window.alert(`Visualizando informe de ${month}.`)
  const downloadReport = (month: string) => window.alert(`Descargando informe de ${month}...`)
  const deleteReport = (id: number) => setReports((prev) => prev.filter((report) => report.id !== id))

  const totalReports = reports.length
  const approvedCount = reports.filter((r) => r.status === 'success').length
  const pendingCount = reports.filter((r) => r.status === 'warning').length
  const correctionCount = reports.filter((r) => r.status === 'alert').length

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mis Reportes</p>
          <h1>Revisa los informes enviados y su estado actual.</h1>
          <p className="subtext">Filtra por mes, estado o palabra clave para encontrar rápidamente lo que necesitas.</p>
        </div>
      </header>

      {/* Summary stats */}
      <div className="stats-grid mb-6">

        <article className="stat-card">
          <p className="stat-label">Aprobados</p>
          <strong className="text-emerald-600">{approvedCount}</strong>
          <p className="stat-small">Informes validados y aprobados.</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">En revisión</p>
          <strong className="text-warning-600">{pendingCount}</strong>
          <p className="stat-small">Documentos en evaluación.</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Correcciones</p>
          <strong className="text-alert-600">{correctionCount}</strong>
          <p className="stat-small">Requieren ajustes.</p>
        </article>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por mes o observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-border bg-bg-alt px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`button button--ghost ${statusFilter === 'all' ? 'button--primary' : ''}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('success')}
            className={`button button--ghost ${statusFilter === 'success' ? 'button--primary' : ''}`}
          >
            Aprobados
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('warning')}
            className={`button button--ghost ${statusFilter === 'warning' ? 'button--primary' : ''}`}
          >
            Revisión
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('alert')}
            className={`button button--ghost ${statusFilter === 'alert' ? 'button--primary' : ''}`}
          >
            Correcciones
          </button>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <article className="card">
          <p className="text-muted">No se encontraron informes que coincidan con los filtros aplicados.</p>
        </article>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              {...report}
              onView={() => viewReport(report.month)}
              onDownload={() => downloadReport(report.month)}
              onDelete={() => deleteReport(report.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
