import { useEffect, useMemo, useState, type ReactElement } from 'react'

interface BackendObservacion {
  id_observacion_gc: number
  comentario: string
  fecha: string
}

interface BackendInforme {
  id_informe_gc?: number
  id_informe_gf?: number
  tipo: 'GC' | 'GF'
  mes: string
  anio: number
  estado: string
  veredicto_ia?: string
  analisis_ia?: string
  fecha_registro: string
  archivo_url: string
  usuario?: {
    id_Usuario: number
    nombre: string
    apellido: string
    cedula: string
    area?: { nombre: string } | string
    sede?: { nombre: string } | string
  }
  observaciones?: BackendObservacion[]
}

export function RevisarInformes(): ReactElement {
  const [reports, setReports] = useState<BackendInforme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [periodo, setPeriodo] = useState('Todos los periodos')
  const [filter, setFilter] = useState<'revision' | 'aprobado' | 'correccion'>('revision')

  // Modal / correction state
  const [correctionTarget, setCorrectionTarget] = useState<{ id: number; tipo: 'GC' | 'GF' } | null>(null)
  const [correctionNote, setCorrectionNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [actionAlert, setActionAlert] = useState('')
  const [expandedIA, setExpandedIA] = useState<Record<string, boolean>>({})
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({})

  const fetchAllReports = async () => {
    try {
      setIsLoading(true)
      const [gcRes, gfRes] = await Promise.all([
        fetch('http://localhost:3000/api/informes-gc').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:3000/api/informes-gf').then(r => r.ok ? r.json() : [])
      ])

      const gcList = (gcRes || []).map((r: any) => ({ ...r, tipo: 'GC' as const }))
      const gfList = (gfRes || []).map((r: any) => ({ ...r, tipo: 'GF' as const }))

      const combined = [...gcList, ...gfList].sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
      setReports(combined)
    } catch (err) {
      console.error('Error fetching reports for coordinator:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllReports()
  }, [])

  const reportsWithVersions = useMemo(() => {
    const sortedOldest = [...reports].sort((a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime())
    const tracker: Record<string, number> = {}
    
    const mapped = sortedOldest.map((r) => {
      const instructorId = r.usuario?.id_Usuario || r.usuario?.cedula || 'unknown'
      const key = `${instructorId}_${r.mes}_${r.anio}_${r.tipo}`
      tracker[key] = (tracker[key] || 0) + 1
      return { ...r, version: tracker[key] }
    })

    return mapped.sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
  }, [reports])

  const counts = useMemo(() => {
    const out = { revision: 0, aprobado: 0, correccion: 0 }
    for (const r of reportsWithVersions) {
      const st = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')
      out[st]++
    }
    return out
  }, [reportsWithVersions])

  const filtered = useMemo(() => {
    return reportsWithVersions.filter((r) => {
      const normalizedStatus = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')
      if (filter !== normalizedStatus) return false
      
      const pText = `${r.mes} ${r.anio}`
      if (periodo !== 'Todos los periodos' && pText !== periodo) return false

      const q = query.trim().toLowerCase()
      if (!q) return true
      
      const instructorName = `${r.usuario?.nombre || ''} ${r.usuario?.apellido || ''}`.toLowerCase()
      const cedulaStr = (r.usuario?.cedula || '').toString()
      const areaStr = (typeof r.usuario?.area === 'object' ? r.usuario?.area?.nombre : r.usuario?.area || '').toLowerCase()
      const idStr = (r.id_informe_gc || r.id_informe_gf || '').toString()
      const verStr = `versión ${r.version}`

      return (
        instructorName.includes(q) ||
        cedulaStr.includes(q) ||
        areaStr.includes(q) ||
        idStr.includes(q) ||
        verStr.includes(q) ||
        r.tipo.toLowerCase().includes(q)
      )
    })
  }, [reportsWithVersions, filter, periodo, query])

  const handleApprove = async (reportId: number, tipo: 'GC' | 'GF') => {
    try {
      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      const res = await fetch(`http://localhost:3000/api/${endpoint}/${reportId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'aprobado' }),
      })

      if (!res.ok) throw new Error('Error al aprobar el informe.')

      setActionAlert(`✓ Informe ${tipo} #${reportId} aprobado exitosamente.`)
      setTimeout(() => setActionAlert(''), 3000)
      fetchAllReports()
    } catch (err: any) {
      alert(err.message || 'Ocurrió un error al aprobar.')
    }
  }

  const handleReanalyzeIA = async (reportId: number, tipo: 'GC' | 'GF') => {
    const key = `${tipo}-${reportId}`
    try {
      setAnalyzingIds((prev) => ({ ...prev, [key]: true }))
      setActionAlert(`🤖 Consultando auditoría institucional a Sera 🦅 (n8n + OpenAI) para Informe ${tipo} #${reportId}. Espera unos 8 segundos...`)
      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      const res = await fetch(`http://localhost:3000/api/${endpoint}/${reportId}/reanalizar-ia`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Error al solicitar reanálisis a la IA.')
      await fetchAllReports()
      setActionAlert(`✅ ¡Auditoría de Sera 🦅 completada y cargada en pantalla para el Informe ${tipo} #${reportId}!`)
      setTimeout(() => setActionAlert(''), 5000)
    } catch (err: any) {
      alert(err.message || 'Error al conectar con IA.')
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleSendCorrection = async (reportId: number, tipo: 'GC' | 'GF') => {
    if (!correctionNote.trim()) {
      alert('Por favor escribe el motivo o la observación de corrección.')
      return
    }

    try {
      setIsSubmittingNote(true)
      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      const coordId = userSession?.id || userSession?.id_Usuario

      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      const res = await fetch(`http://localhost:3000/api/${endpoint}/${reportId}/observacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comentario: correctionNote.trim(),
          coordinadorId: coordId || undefined,
        }),
      })

      if (!res.ok) throw new Error('Error al registrar la observación.')

      setActionAlert(`⚠️ Informe ${tipo} #${reportId} enviado a corrección con la observación indicada.`)
      setTimeout(() => setActionAlert(''), 3500)
      setCorrectionTarget(null)
      setCorrectionNote('')
      fetchAllReports()
    } catch (err: any) {
      alert(err.message || 'Error al enviar corrección.')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const monthOptions = useMemo(() => {
    const setOfMonths = new Set<string>()
    setOfMonths.add('Todos los periodos')
    reports.forEach((r) => {
      if (r.mes && r.anio) setOfMonths.add(`${r.mes} ${r.anio}`)
    })
    return Array.from(setOfMonths)
  }, [reports])

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border border-transparent page-hero-bg p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">Revisar informes PDF</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Evalúa, aprueba o solicita correcciones a las entregas mensuales en PDF</h1>
            <p className="mt-3 max-w-2xl text-sm text-secondary">Abre el archivo PDF original de cada instructor y envía retroalimentación oportuna.</p>
          </div>
          <button type="button" onClick={fetchAllReports} className="button button--ghost text-xs">
            🔄 Actualizar lista
          </button>
        </div>
      </header>

      {actionAlert && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 font-bold text-emerald-800 text-sm shadow-sm">
          {actionAlert}
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-sky">{counts.revision}</div>
          <div className="text-sm text-secondary">En Revisión</div>
        </div>
        <div className="rounded-2xl border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-emerald">{counts.aprobado}</div>
          <div className="text-sm text-secondary">Aprobados</div>
        </div>
        <div className="rounded-2xl border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-warning">{counts.correccion}</div>
          <div className="text-sm text-secondary">Correcciones</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col sm:flex-row gap-3">
              <div className="flex flex-1 items-center rounded-lg border border-border bg-bg-card px-3 py-2">
                <span className="text-secondary mr-2">🔎</span>
                <input
                  className="w-full border-none bg-transparent outline-none text-sm text-foreground"
                  placeholder="Buscar por instructor, cédula, área o ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Month Selector Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-secondary uppercase">Mes:</span>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 focus:outline-none"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-full font-semibold ${filter === 'revision' ? 'bg-emerald text-white shadow' : 'bg-bg-alt text-secondary border border-border'}`}
              onClick={() => setFilter('revision')}
            >
              En Revisión ({counts.revision})
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold ${filter === 'aprobado' ? 'bg-emerald text-white shadow' : 'bg-bg-alt text-secondary border border-border'}`}
              onClick={() => setFilter('aprobado')}
            >
              Aprobados ({counts.aprobado})
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold ${filter === 'correccion' ? 'bg-emerald text-white shadow' : 'bg-bg-alt text-secondary border border-border'}`}
              onClick={() => setFilter('correccion')}
            >
              Correcciones ({counts.correccion})
            </button>
          </div>

          {/* list */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="rounded-2xl border bg-bg-card p-6 text-center text-secondary">Cargando entregas de informes...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border bg-bg-card p-6 text-center text-secondary">No hay informes que coincidan con los filtros seleccionados.</div>
            ) : (
              filtered.map((r) => {
                const reportId = (r.id_informe_gc || r.id_informe_gf)!
                const cardKey = `${r.tipo}-${reportId}`
                const pdfFullUrl = r.archivo_url.startsWith('http')
                  ? r.archivo_url
                  : `http://localhost:3000/${r.archivo_url}`

                const instructorFullName = `${r.usuario?.nombre || 'Instructor'} ${r.usuario?.apellido || ''}`
                const areaName = typeof r.usuario?.area === 'object' ? r.usuario?.area?.nombre : r.usuario?.area || 'General'

                const normalizedStatus = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')

                const isCorrectionOpen = correctionTarget?.id === reportId && correctionTarget?.tipo === r.tipo

                return (
                  <div key={cardKey} className="rounded-2xl border bg-bg-card p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.tipo === 'GC' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-sky-100 text-sky-800 border border-sky-300'}`}>
                            Informe {r.tipo}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Versión {r.version}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{instructorFullName}</h3>
                        <p className="text-sm text-secondary">
                          Cédula: {r.usuario?.cedula || 'N/A'} · Área: {areaName}
                        </p>
                      </div>
                      <span className={`status-chip ${normalizedStatus === 'revision' ? 'status-chip--info' : normalizedStatus === 'aprobado' ? 'status-chip--success' : 'status-chip--alert'}`}>
                        {normalizedStatus === 'revision' ? '⏳ En Revisión' : normalizedStatus === 'aprobado' ? '✓ Aprobado' : '⚠️ Corrección'}
                      </span>
                    </div>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 bg-bg-alt rounded-xl p-3 border border-border text-sm">
                      <div>
                        <p className="text-xs text-secondary uppercase font-semibold">ID Informe</p>
                        <p className="font-semibold text-foreground">#INF-{r.tipo}-{reportId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary uppercase font-semibold">Periodo</p>
                        <p className="font-semibold text-foreground">{r.mes} {r.anio}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary uppercase font-semibold">Fecha Registro</p>
                        <p className="font-semibold text-foreground">{new Date(r.fecha_registro).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Auditoría IA (Sera 🦅) */}
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <h4 className="font-bold text-sm text-indigo-950">Auditoría IA (Sera 🦅)</h4>
                          {r.veredicto_ia === 'aprobado_ia' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ IA Validado - Sin observaciones
                            </span>
                          )}
                          {r.veredicto_ia === 'requiere_correccion' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ⚠️ IA Detectó Observaciones
                            </span>
                          )}
                          {(!r.veredicto_ia || r.veredicto_ia === 'pendiente') && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
                              ⏳ Analizando o pendiente de IA...
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={analyzingIds[`${r.tipo}-${reportId}`]}
                            onClick={() => handleReanalyzeIA(reportId, r.tipo)}
                            className="button button--ghost px-3 py-1 text-xs font-bold text-sky-800 bg-sky-50/80 hover:bg-sky-100 disabled:opacity-60 disabled:cursor-wait rounded-xl border border-sky-300 shadow-sm transition-all"
                            title="Disparar análisis de IA de nuevo al servidor n8n"
                          >
                            {analyzingIds[`${r.tipo}-${reportId}`] ? '⏳ Analizando (espérame 8s)...' : '🔄 Forzar análisis IA'}
                          </button>
                          {r.analisis_ia && (
                            <button
                              type="button"
                              onClick={() => setExpandedIA((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }))}
                              className="button button--ghost px-3 py-1 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-100/50 rounded-xl border border-indigo-200"
                            >
                              {expandedIA[cardKey] ? '▲ Ocultar reporte IA' : '▼ Ver reporte detallado IA'}
                            </button>
                          )}
                        </div>
                      </div>

                      {r.analisis_ia && expandedIA[cardKey] && (
                        <div className="rounded-xl border border-indigo-200/80 bg-white p-4 text-xs font-mono whitespace-pre-wrap text-slate-800 shadow-inner max-h-96 overflow-y-auto leading-relaxed">
                          {r.analisis_ia}
                          {r.veredicto_ia === 'requiere_correccion' && normalizedStatus !== 'correccion' && (
                            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                              <button
                                type="button"
                                className="button bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5"
                                onClick={() => {
                                  setCorrectionTarget({ id: reportId, tipo: r.tipo });
                                  setCorrectionNote(r.analisis_ia || '');
                                  setExpandedIA((prev) => ({ ...prev, [cardKey]: false }));
                                }}
                              >
                                ⚡ Usar este reporte como observación para el instructor
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Display existing observations if any */}
                    {r.observaciones && r.observaciones.length > 0 && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900">
                        <strong className="block mb-1 font-bold">Observación enviada al instructor:</strong>
                        <p className="italic">"{r.observaciones[r.observaciones.length - 1].comentario}"</p>
                      </div>
                    )}

                    {/* Form to submit correction observation */}
                    {isCorrectionOpen && (
                      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 space-y-3">
                        <label className="block text-xs font-bold text-amber-900 uppercase">
                          Escribe el motivo / detalles que el instructor debe corregir para el Informe {r.tipo}:
                        </label>
                        <textarea
                          rows={3}
                          value={correctionNote}
                          onChange={(e) => setCorrectionNote(e.target.value)}
                          placeholder="Ej: Faltan firmas en el anexo 2, ajustar horas en la tabla..."
                          className="w-full rounded-xl border border-amber-300 bg-white p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="button button--ghost px-3 py-1.5 text-xs font-semibold"
                            onClick={() => {
                              setCorrectionTarget(null)
                              setCorrectionNote('')
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingNote}
                            className="button bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-sm"
                            onClick={() => handleSendCorrection(reportId, r.tipo)}
                          >
                            {isSubmittingNote ? 'Enviando...' : 'Confirmar y Enviar a Corrección'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                      <a
                        href={pdfFullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button--ghost px-4 py-2 text-sm flex items-center gap-1.5"
                      >
                        📄 Ver Informe PDF
                      </a>

                      {normalizedStatus !== 'correccion' && (
                        <button
                          type="button"
                          className="rounded-xl border bg-bg-card px-4 py-2 text-sm text-amber-700 border-amber-400 hover:bg-amber-50 font-semibold"
                          onClick={() => {
                            setCorrectionTarget({ id: reportId, tipo: r.tipo })
                            setCorrectionNote(r.analisis_ia || '')
                          }}
                        >
                          Solicitar Corrección
                        </button>
                      )}

                      {normalizedStatus !== 'aprobado' && (
                        <button
                          type="button"
                          className="button button--primary px-4 py-2 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => handleApprove(reportId, r.tipo)}
                        >
                          ✓ Aprobar Informe
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-300 bg-bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-lg text-emerald-800 mb-2">Instrucciones de Revisión</h3>
            <p className="text-xs text-secondary leading-relaxed">
              1. Haz clic en <strong>Ver Informe PDF</strong> para inspeccionar el documento institucional adjuntado.
              <br/><br/>
              2. Si todo cumple, haz clic en <strong>Aprobar Informe</strong>.
              <br/><br/>
              3. Si requiere correcciones, selecciona <strong>Solicitar Corrección</strong> y describe detalladamente lo que el instructor debe modificar.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
