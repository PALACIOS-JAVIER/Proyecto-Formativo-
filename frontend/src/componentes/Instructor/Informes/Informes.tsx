import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'

interface BackendObservacion {
  id_observacion_gc: number
  comentario: string
  fecha: string
}

interface BackendReport {
  id_informe_gc?: number
  id_informe_gf?: number
  tipo: 'GC' | 'GF'
  mes: string
  anio: number
  estado: string // 'aprobado', 'correccion', 'revisando', 'success', 'warning', 'alert'
  fecha_registro: string
  archivo_url: string
  observaciones?: BackendObservacion[]
}

interface ReportWithVersion extends BackendReport {
  version: number
}

export function Informes(): ReactElement {
  const [reports, setReports] = useState<BackendReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'aprobado' | 'revisando' | 'correccion'>('all')
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({})

  const fetchUserReports = async () => {
    try {
      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      const userId = userSession?.id || userSession?.id_Usuario

      if (!userId) return

      setIsLoading(true)
      const [gcRes, gfRes] = await Promise.all([
        fetch(`http://localhost:3000/api/informes-gc/usuario/${userId}`).then(r => r.ok ? r.json() : []),
        fetch(`http://localhost:3000/api/informes-gf/usuario/${userId}`).then(r => r.ok ? r.json() : [])
      ])

      const gcList = (gcRes || []).map((r: any) => ({ ...r, tipo: 'GC' as const }))
      const gfList = (gfRes || []).map((r: any) => ({ ...r, tipo: 'GF' as const }))

      const combined = [...gcList, ...gfList]
      setReports(combined)
    } catch (err) {
      console.error('Error fetching instructor reports:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserReports()
  }, [])

  // Calculate chronological versions (Versión 1, Versión 2) per (mes + anio + tipo)
  const reportsWithVersions = useMemo(() => {
    // Sort oldest first to assign sequential version numbers
    const sortedOldestFirst = [...reports].sort((a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime())
    
    const versionTracker: Record<string, number> = {}
    const withVer: ReportWithVersion[] = sortedOldestFirst.map((r) => {
      const key = `${r.mes}_${r.anio}_${r.tipo}`
      versionTracker[key] = (versionTracker[key] || 0) + 1
      return { ...r, version: versionTracker[key] }
    })

    // Return sorted newest first for UI display
    return withVer.sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
  }, [reports])

  const filteredReports = reportsWithVersions.filter((report) => {
    const periodText = `${report.mes} ${report.anio}`.toLowerCase()
    const matchesSearch = periodText.includes(searchTerm.toLowerCase()) || 
      report.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `versión ${report.version}`.includes(searchTerm.toLowerCase()) ||
      report.observaciones?.some(o => o.comentario.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const normalizedEstado = report.estado === 'success' ? 'aprobado' : report.estado === 'alert' ? 'correccion' : report.estado
    const matchesStatus = statusFilter === 'all' || normalizedEstado === statusFilter
    return matchesSearch && matchesStatus
  })

  // Group reports by Month & Year
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, ReportWithVersion[]> = {}
    for (const r of filteredReports) {
      const folderKey = `${r.mes} ${r.anio}`
      if (!groups[folderKey]) groups[folderKey] = []
      groups[folderKey].push(r)
    }
    return groups
  }, [filteredReports])

  const toggleFolder = (folderKey: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folderKey]: !prev[folderKey] }))
  }

  const approvedCount = reports.filter((r) => r.estado === 'aprobado' || r.estado === 'success').length
  const pendingCount = reports.filter((r) => r.estado === 'revisando' || r.estado === 'warning').length
  const correctionCount = reports.filter((r) => r.estado === 'correccion' || r.estado === 'alert').length

  const getStatusBadge = (estado: string) => {
    if (estado === 'aprobado' || estado === 'success') {
      return <span className="status-chip status-chip--success bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs">✓ Aprobado</span>
    }
    if (estado === 'correccion' || estado === 'alert') {
      return <span className="status-chip status-chip--alert bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1 rounded-full text-xs">⚠️ Corrección requerida</span>
    }
    return <span className="status-chip status-chip--info bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs">⏳ En revisión por coordinador</span>
  }

  const renderCard = (report: ReportWithVersion) => {
    const pdfFullUrl = report.archivo_url.startsWith('http')
      ? report.archivo_url
      : `http://localhost:3000/${report.archivo_url}`

    const lastObs = report.observaciones && report.observaciones.length > 0
      ? report.observaciones[report.observaciones.length - 1]
      : null

    const reportKey = `${report.tipo}-${report.id_informe_gc || report.id_informe_gf}`

    return (
      <article key={reportKey} className="card rounded-2xl p-4 border border-border bg-bg-alt shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${report.tipo === 'GC' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-sky-100 text-sky-800 border border-sky-300'}`}>
                  Informe {report.tipo}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Versión {report.version}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{report.mes} {report.anio} (v{report.version})</h3>
            </div>
            {getStatusBadge(report.estado)}
          </div>

          <p className="text-xs text-secondary mb-3">
            <strong>Fecha de registro:</strong> {new Date(report.fecha_registro).toLocaleDateString()}
          </p>

          {/* Corrections Note */}
          {lastObs && (report.estado === 'correccion' || report.estado === 'alert') && (
            <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900">
              <p className="font-bold flex items-center gap-1 text-rose-800 mb-1">
                <span>📝 Observaciones del Coordinador (A corregir v{report.version}):</span>
              </p>
              <p className="italic leading-relaxed">"{lastObs.comentario}"</p>
            </div>
          )}

          {lastObs && report.estado === 'aprobado' && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
              <strong>Nota del coordinador:</strong> "{lastObs.comentario}"
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border flex-wrap">
          <a
            href={pdfFullUrl}
            download={`Informe_${report.tipo}_${report.mes}_${report.anio}_v${report.version}.pdf`}
            className="button button--ghost px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-border hover:bg-bg-card"
          >
            <span>📥</span> Descargar PDF
          </a>
          <a
            href={pdfFullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button--primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <span>📄</span> Ver PDF v{report.version}
          </a>
        </div>
      </article>
    )
  }

  return (
    <section className="page-panel">
      <header className="page-header flex items-center justify-between">
        <div>
          <p className="eyebrow">Mis Informes (Carpetas Mensuales y Versiones)</p>
          <h1>Revisa tus informes organizados por tipo (GC/GF), mes y versión.</h1>
          <p className="subtext">Los informes GC y GF se organizan por separado con sus respectivas versiones (v1, v2) de corrección.</p>
        </div>
        <button type="button" onClick={fetchUserReports} className="button button--ghost text-xs">
          🔄 Actualizar lista
        </button>
      </header>

      {/* Summary stats */}
      <div className="stats-grid mb-6">
        <article className="stat-card">
          <p className="stat-label">Aprobados</p>
          <strong className="text-emerald-600">{approvedCount}</strong>
          <p className="stat-small">Informes validados sin observaciones.</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">En revisión</p>
          <strong className="text-amber-600">{pendingCount}</strong>
          <p className="stat-small">En evaluación por coordinación.</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Correcciones</p>
          <strong className="text-rose-600">{correctionCount}</strong>
          <p className="stat-small">Requieren ajustes y reenviar PDF.</p>
        </article>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por mes, tipo (GC/GF), versión o correcciones..."
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
            onClick={() => setStatusFilter('aprobado')}
            className={`button button--ghost ${statusFilter === 'aprobado' ? 'button--primary' : ''}`}
          >
            Aprobados
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('revisando')}
            className={`button button--ghost ${statusFilter === 'revisando' ? 'button--primary' : ''}`}
          >
            En Revisión
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('correccion')}
            className={`button button--ghost ${statusFilter === 'correccion' ? 'button--primary' : ''}`}
          >
            Correcciones
          </button>
        </div>
      </div>

      {isLoading ? (
        <article className="card p-6 text-center text-secondary">
          Cargando carpetas de informes...
        </article>
      ) : Object.keys(groupedByMonth).length === 0 ? (
        <article className="card p-6 text-center text-secondary">
          No se encontraron carpetas e informes PDF que coincidan con los filtros.
        </article>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([folderMonth, monthReports]) => {
            const isCollapsed = collapsedFolders[folderMonth]
            const gcReports = monthReports.filter(r => r.tipo === 'GC')
            const gfReports = monthReports.filter(r => r.tipo === 'GF')
            
            const monthCorrections = monthReports.filter(r => r.estado === 'correccion' || r.estado === 'alert').length
            const monthApproved = monthReports.filter(r => r.estado === 'aprobado' || r.estado === 'success').length
            const monthPending = monthReports.filter(r => r.estado === 'revisando' || r.estado === 'warning').length

            return (
              <div key={folderMonth} className="rounded-3xl border border-border bg-bg-card p-5 shadow-sm space-y-6">
                {/* Folder Header */}
                <div 
                  onClick={() => toggleFolder(folderMonth)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-bold border border-emerald-300">
                      📁
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Carpeta {folderMonth}</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        {monthReports.length} informe(s) subido(s) en total ({gcReports.length} GC · {gfReports.length} GF)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {monthCorrections > 0 && (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-300">
                        ⚠️ {monthCorrections} Corrección(es)
                      </span>
                    )}
                    {monthPending > 0 && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                        ⏳ {monthPending} En revisión
                      </span>
                    )}
                    {monthApproved > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                        ✓ {monthApproved} Aprobado(s)
                      </span>
                    )}
                    <button type="button" className="button button--ghost text-xs py-1.5 px-3 ml-2">
                      {isCollapsed ? 'Abrir carpeta 📂' : 'Contraer 📁'}
                    </button>
                  </div>
                </div>

                {/* Folder Content: Separated GC and GF Sections */}
                {!isCollapsed && (
                  <div className="pt-4 border-t border-border space-y-6">
                    {/* Section GC */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                      <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                        <span>📗</span> Informes de Gestión Clave (GC) — {gcReports.length} versión(es)
                      </h3>
                      {gcReports.length === 0 ? (
                        <p className="text-xs text-secondary italic">No hay informes GC registrados en este mes.</p>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {gcReports.map(renderCard)}
                        </div>
                      )}
                    </div>

                    {/* Section GF */}
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
                      <h3 className="text-base font-bold text-sky-900 flex items-center gap-2">
                        <span>📘</span> Informes de Gestión Formativa (GF) — {gfReports.length} versión(es)
                      </h3>
                      {gfReports.length === 0 ? (
                        <p className="text-xs text-secondary italic">No hay informes GF registrados en este mes.</p>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {gfReports.map(renderCard)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
