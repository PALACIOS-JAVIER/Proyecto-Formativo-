import type { ReactElement } from 'react'
import { useState } from 'react'

export function Reportes(): ReactElement {
  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterInstructor, setFilterInstructor] = useState('')

  const [reports] = useState([
    { id: 1, instructor: 'Ana Marín', period: 'Julio 2026', date: '2026-07-20', status: 'Entregado a tiempo', details: 'Informe mensual', fileCount: 3 },
    { id: 2, instructor: 'Carlos Gómez', period: 'Julio 2026', date: '2026-07-21', status: 'Entregado con retraso', details: 'Informe de actividades', fileCount: 1 },
    { id: 3, instructor: 'María López', period: 'Junio 2026', date: '2026-06-30', status: 'Entregado a tiempo', details: 'Informe mensual', fileCount: 2 },
    { id: 4, instructor: 'Ana Marín', period: 'Junio 2026', date: '2026-06-28', status: 'Entregado a tiempo', details: 'Plan de trabajo', fileCount: 1 },
  ])

  const filteredReports = reports.filter(r => 
    (filterPeriod === '' || r.period.toLowerCase().includes(filterPeriod.toLowerCase())) &&
    (filterDate === '' || r.date === filterDate) &&
    (filterInstructor === '' || r.instructor.toLowerCase().includes(filterInstructor.toLowerCase()))
  );

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1>Indicadores y seguimiento</h1>
          <p className="subtext">Filtra por periodo, fecha e instructor para visualizar los informes subidos y tiempos de entrega.</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Filtros */}
        <div className="card space-y-5">
          <h3 className="font-semibold text-lg text-foreground">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Buscar por instructor..." 
              className="w-full rounded-xl border border-border bg-bg-alt text-foreground outline-none focus:border-sky-500 px-4 py-2 transition-all"
              value={filterInstructor}
              onChange={e => setFilterInstructor(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Periodo (ej. Julio)" 
              className="w-full rounded-xl border border-border bg-bg-alt text-foreground outline-none focus:border-sky-500 px-4 py-2 transition-all"
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
            />
            <input 
              type="date" 
              className="w-full rounded-xl border border-border bg-bg-alt text-foreground outline-none focus:border-sky-500 px-4 py-2 transition-all"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Listado de Reportes */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Informes Subidos</h3>
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div key={report.id} className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl border border-border bg-bg-alt hover:border-emerald-500/30 transition-colors">
                  <div>
                    <p className="font-bold text-foreground">{report.instructor}</p>
                    <p className="text-sm text-text-muted mt-1">{report.details} - <span className="font-semibold">{report.period}</span></p>
                    <p className="text-xs text-text-secondary mt-2">Archivos adjuntos: {report.fileCount}</p>
                  </div>
                  <div className="flex flex-col sm:items-end justify-between">
                    <span className={`status-chip ${report.status === 'Entregado a tiempo' ? 'status-chip--success' : 'status-chip--alert'}`}>
                      {report.status}
                    </span>
                    <p className="text-xs font-medium text-text-muted mt-2">{report.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">No se encontraron informes con los filtros aplicados.</p>
          )}
        </div>
      </div>
    </section>
  )
}
