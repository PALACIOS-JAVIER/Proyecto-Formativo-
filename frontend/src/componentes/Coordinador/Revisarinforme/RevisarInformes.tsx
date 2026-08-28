import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { FiRefreshCw, FiSearch, FiFolder, FiFolderMinus, FiFileText, FiAlertTriangle, FiCpu, FiInfo, FiCheck, FiUpload, FiDownload } from 'react-icons/fi'

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
  const [filter, setFilter] = useState<'todos' | 'revision' | 'aprobado' | 'correccion'>('revision')

  // Folders collapse state (collapsed by default)
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({})
  const [collapsedInstructors, setCollapsedInstructors] = useState<Record<string, boolean>>({})

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths(prev => ({ ...prev, [monthKey]: !(prev[monthKey] ?? true) }))
  }

  const toggleInstructor = (monthKey: string, instructorName: string) => {
    const key = `${monthKey}-${instructorName}`
    setCollapsedInstructors(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))
  }

  // Modal / correction state
  const [correctionTarget, setCorrectionTarget] = useState<{ id: number; tipo: 'GC' | 'GF' } | null>(null)
  const [correctionNote, setCorrectionNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [actionAlert, setActionAlert] = useState('')
  const [expandedIA, setExpandedIA] = useState<Record<string, boolean>>({})
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({})
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({})
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({})

  const fetchAllReports = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token') || ''
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [gcRes, gfRes] = await Promise.all([
        fetch('/api/informes-gc', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/informes-gf', { headers }).then(r => r.ok ? r.json() : [])
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
    const out = { todos: 0, revision: 0, aprobado: 0, correccion: 0 }
    for (const r of reportsWithVersions) {
      const st = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')
      out[st]++
      out.todos++
    }
    return out
  }, [reportsWithVersions])

  const filtered = useMemo(() => {
    return reportsWithVersions.filter((r) => {
      const normalizedStatus = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')
      if (filter !== 'todos' && filter !== normalizedStatus) return false
      
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

  // Group filtered reports by Month, and then by Instructor
  const groupedReports = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {}
    
    filtered.forEach((r) => {
      const monthKey = `${r.mes} ${r.anio}`
      const instructorName = `${r.usuario?.nombre || 'Instructor'} ${r.usuario?.apellido || ''}`.trim()
      
      if (!groups[monthKey]) {
        groups[monthKey] = {}
      }
      if (!groups[monthKey][instructorName]) {
        groups[monthKey][instructorName] = []
      }
      groups[monthKey][instructorName].push(r)
    })
    
    return groups
  }, [filtered])

  const forceDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch file');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error al forzar descarga, abriendo en nueva pestaña...', err);
      window.open(url, '_blank');
    }
  }

  const handleApprove = async (reportId: number, tipo: 'GC' | 'GF', cardKey: string) => {
    const file = selectedFiles[cardKey]
    if (!file) {
      alert('Debes cargar el PDF firmado antes de aprobar el informe.')
      return
    }

    try {
      setIsApproving(prev => ({ ...prev, [cardKey]: true }))
      const token = localStorage.getItem('access_token') || ''
      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/${endpoint}/${reportId}/aprobar-firmado`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        throw new Error(err.message || 'Error al aprobar el informe.')
      }

      setActionAlert(`✓ Informe ${tipo} #${reportId} aprobado exitosamente con firma.`)
      setTimeout(() => setActionAlert(''), 3000)
      setSelectedFiles(prev => {
        const next = { ...prev }
        delete next[cardKey]
        return next
      })
      fetchAllReports()
    } catch (err: any) {
      alert(err.message || 'Ocurrió un error al aprobar.')
    } finally {
      setIsApproving(prev => ({ ...prev, [cardKey]: false }))
    }
  }

  const handleReanalyzeIA = async (reportId: number, tipo: 'GC' | 'GF') => {
    const key = `${tipo}-${reportId}`
    try {
      setAnalyzingIds((prev) => ({ ...prev, [key]: true }))
      setActionAlert(`🤖 Consultando auditoría institucional a Sera 🦅 (n8n + OpenAI) para Informe ${tipo} #${reportId}. Espera unos 8 segundos...`)
      const token = localStorage.getItem('access_token') || ''
      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      const res = await fetch(`/api/${endpoint}/${reportId}/reanalizar-ia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

      const token = localStorage.getItem('access_token') || ''
      const endpoint = tipo === 'GC' ? 'informes-gc' : 'informes-gf'
      const res = await fetch(`/api/${endpoint}/${reportId}/observacion`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      <header className="rounded-[28px] border px-6 py-6 shadow-sm border-slate-200 bg-white text-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Revisar informes PDF</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Evalúa, aprueba o solicita correcciones a las entregas mensuales en PDF</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">Abre el archivo PDF original de cada instructor y envía retroalimentación oportuna.</p>
          </div>
          <button type="button" onClick={fetchAllReports} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <FiRefreshCw /> Actualizar lista
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
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="text-3xl font-bold text-sky-600">{counts.revision}</div>
          <div className="text-sm font-medium text-slate-500 mt-1">En Revisión</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="text-3xl font-bold text-emerald-600">{counts.aprobado}</div>
          <div className="text-sm font-medium text-slate-500 mt-1">Aprobados</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="text-3xl font-bold text-rose-500">{counts.correccion}</div>
          <div className="text-sm font-medium text-slate-500 mt-1">Correcciones</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col sm:flex-row gap-4">
              <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                <span className="text-slate-400 mr-3 text-lg"><FiSearch /></span>
                <input
                  className="w-full border-none bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
                  placeholder="Buscar por instructor, cédula, área o ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Month Selector Filter */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mes:</span>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none shadow-sm cursor-pointer"
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
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === 'todos' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setFilter('todos')}
            >
              Todos ({counts.todos})
            </button>
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === 'revision' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setFilter('revision')}
            >
              En Revisión ({counts.revision})
            </button>
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === 'aprobado' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setFilter('aprobado')}
            >
              Aprobados ({counts.aprobado})
            </button>
            <button
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === 'correccion' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setFilter('correccion')}
            >
              Correcciones ({counts.correccion})
            </button>
          </div>

          {/* list */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="rounded-2xl border bg-bg-card p-6 text-center text-secondary">Cargando entregas de informes...</div>
            ) : Object.keys(groupedReports).length === 0 ? (
              <div className="rounded-2xl border bg-bg-card p-6 text-center text-secondary">No hay informes que coincidan con los filtros seleccionados.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedReports).map(([monthKey, instructorsMap]) => {
                  const isMonthCollapsed = collapsedMonths[monthKey] ?? true;
                  const totalReportsInMonth = Object.values(instructorsMap).reduce((sum, list) => sum + list.length, 0);
                  
                  return (
                    <div key={monthKey} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                      {/* Month Folder Header */}
                      <div 
                        onClick={() => toggleMonth(monthKey)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl border border-amber-200 shadow-sm text-amber-600"><FiFolder /></div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">Periodo: {monthKey}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {Object.keys(instructorsMap).length} instructor(es) · {totalReportsInMonth} informe(s)
                            </p>
                          </div>
                        </div>
                        <span className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-200 transition-colors group-hover:bg-slate-100">
                          {isMonthCollapsed ? <><FiFolder /> <span>Abrir Periodo</span></> : <><FiFolderMinus /> <span>Contraer</span></>}
                        </span>
                      </div>

                      {/* Month Folders Content */}
                      {!isMonthCollapsed && (
                        <div className="pl-8 border-l-2 border-slate-100 space-y-4 pt-2">
                          {Object.entries(instructorsMap).map(([instructorName, reportsList]) => {
                            const instKey = `${monthKey}-${instructorName}`;
                            const isInstCollapsed = collapsedInstructors[instKey] ?? true;
                            
                            return (
                              <div key={instructorName} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                                {/* Instructor Folder Header */}
                                <div 
                                  onClick={() => toggleInstructor(monthKey, instructorName)}
                                  className="flex items-center justify-between cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl text-amber-500 opacity-80"><FiFolder /></span>
                                    <div>
                                      <h4 className="font-semibold text-sm text-slate-800">{instructorName}</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {reportsList.length} informe(s)
                                      </p>
                                    </div>
                                  </div>
                                  <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white rounded-lg text-slate-600 border border-slate-200 shadow-sm transition-colors group-hover:bg-slate-50">
                                    {isInstCollapsed ? <><FiFolder /> <span>Ver Informes</span></> : <><FiFolderMinus /> <span>Ocultar</span></>}
                                  </span>
                                </div>

                                {/* Instructor Folder Content (The actual cards) */}
                                {!isInstCollapsed && (
                                  <div className="space-y-4 pt-2 border-t border-border/50">
                                    {reportsList.map((r) => {
                                      const reportId = (r.id_informe_gc || r.id_informe_gf)!
                                      const cardKey = `${r.tipo}-${reportId}`
                                      const pdfFullUrl = r.archivo_url.startsWith('http')
                                        ? r.archivo_url
                                        : `http://localhost:3000/${r.archivo_url}`

                                      const areaName = typeof r.usuario?.area === 'object' ? r.usuario?.area?.nombre : r.usuario?.area || 'General'

                                      const normalizedStatus = r.estado === 'success' ? 'aprobado' : r.estado === 'alert' ? 'correccion' : (r.estado === 'aprobado' ? 'aprobado' : r.estado === 'correccion' ? 'correccion' : 'revision')

                                      const isCorrectionOpen = correctionTarget?.id === reportId && correctionTarget?.tipo === r.tipo

                                      return (
                                        <div key={cardKey} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                          {/* Card Header */}
                                          <div className="flex items-start justify-between gap-4">
                                            <div>
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${r.tipo === 'GC' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}>
                                                  Informe {r.tipo}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                  Versión {r.version}
                                                </span>
                                              </div>
                                              <h5 className="font-bold text-base text-slate-800">v{r.version} - {r.tipo === 'GC' ? 'Gestión Clave' : 'Gestión Formativa'}</h5>
                                              <p className="text-xs text-slate-500 mt-1">
                                                Cédula: {r.usuario?.cedula || 'N/A'} · Área: {areaName}
                                              </p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${normalizedStatus === 'revision' ? 'bg-sky-50 text-sky-700 border-sky-200' : normalizedStatus === 'aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                              {normalizedStatus === 'revision' ? '⏳ En Revisión' : normalizedStatus === 'aprobado' ? '✓ Aprobado' : '⚠️ Corrección'}
                                            </span>
                                          </div>

                                          {/* Card Details */}
                                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-sm">
                                            <div>
                                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">ID Informe</p>
                                              <p className="font-medium text-slate-800">#INF-{r.tipo}-{reportId}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Periodo</p>
                                              <p className="font-medium text-slate-800">{r.mes} {r.anio}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Fecha Registro</p>
                                              <p className="font-medium text-slate-800">{new Date(r.fecha_registro).toLocaleDateString()}</p>
                                            </div>
                                          </div>

                                          {/* IA Section */}
                                          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-indigo-500"><FiCpu /></span>
                                                <h6 className="font-bold text-xs text-indigo-950">Auditoría IA (Sera 🦅)</h6>
                                                {r.veredicto_ia === 'aprobado_ia' && (
                                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                    ✓ IA Validado
                                                  </span>
                                                )}
                                                {r.veredicto_ia === 'requiere_correccion' && (
                                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                    ⚠️ IA Observaciones
                                                  </span>
                                                )}
                                                {(!r.veredicto_ia || r.veredicto_ia === 'pendiente') && (
                                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
                                                    ⏳ Pendiente IA
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  disabled={analyzingIds[`${r.tipo}-${reportId}`]}
                                                  onClick={() => handleReanalyzeIA(reportId, r.tipo)}
                                                  className="px-2 py-1 text-[10px] font-bold text-sky-800 bg-white hover:bg-sky-50 rounded-lg border border-sky-300 transition-all disabled:opacity-50"
                                                >
                                                  {analyzingIds[`${r.tipo}-${reportId}`] ? 'Analizando...' : 'Reanalizar'}
                                                </button>
                                                {r.analisis_ia && (
                                                  <button
                                                    type="button"
                                                    onClick={() => setExpandedIA((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }))}
                                                    className="px-2 py-1 text-[10px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-lg border border-indigo-200"
                                                  >
                                                    {expandedIA[cardKey] ? 'Ocultar' : 'Ver IA'}
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                            {r.analisis_ia && expandedIA[cardKey] && (
                                              <div className="rounded-lg border border-indigo-200 bg-white p-3 text-[11px] font-mono whitespace-pre-wrap text-slate-800 max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                                                {r.analisis_ia}
                                                {r.veredicto_ia === 'requiere_correccion' && normalizedStatus !== 'correccion' && (
                                                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                                                    <button
                                                      type="button"
                                                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-[10px]"
                                                      onClick={() => {
                                                        setCorrectionTarget({ id: reportId, tipo: r.tipo });
                                                        setCorrectionNote(r.analisis_ia || '');
                                                        setExpandedIA((prev) => ({ ...prev, [cardKey]: false }));
                                                      }}
                                                    >
                                                      ⚡ Usar reporte como observación
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {/* Existing Observations */}
                                          {r.observaciones && r.observaciones.length > 0 && (
                                            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 text-xs text-rose-900">
                                              <strong className="block mb-0.5">Observación enviada:</strong>
                                              <p className="italic">"{r.observaciones[r.observaciones.length - 1].comentario}"</p>
                                            </div>
                                          )}

                                          {/* Correction form */}
                                          {isCorrectionOpen && (
                                            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3 space-y-2">
                                              <label className="block text-[11px] font-bold text-amber-900 uppercase">
                                                Escribe la observación de corrección:
                                              </label>
                                              <textarea
                                                rows={2}
                                                value={correctionNote}
                                                onChange={(e) => setCorrectionNote(e.target.value)}
                                                placeholder="Detalla las correcciones que debe hacer el instructor..."
                                                className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-foreground outline-none"
                                              />
                                              <div className="flex justify-end gap-2">
                                                <button
                                                  type="button"
                                                  className="px-2.5 py-1 text-xs border rounded-lg bg-white"
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
                                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                                                  onClick={() => handleSendCorrection(reportId, r.tipo)}
                                                >
                                                  {isSubmittingNote ? 'Enviando...' : 'Confirmar'}
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Actions */}
                                          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                            {/* Top Row: Solicitar Corrección */}
                                            {normalizedStatus !== 'correccion' && (
                                              <div className="flex items-center justify-end">
                                                <button
                                                  type="button"
                                                  className="h-[36px] px-5 whitespace-nowrap text-xs font-bold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                                  onClick={() => {
                                                    setCorrectionTarget({ id: reportId, tipo: r.tipo })
                                                    setCorrectionNote('') 
                                                  }}
                                                >
                                                  <FiAlertTriangle /> Solicitar Corrección
                                                </button>
                                              </div>
                                            )}

                                            {/* Bottom Row: Cargar, Descargar, Aprobar */}
                                            <div className="flex flex-wrap items-center justify-end gap-2.5">
                                              {normalizedStatus !== 'aprobado' && (
                                                <div className="flex flex-col gap-1 items-center">
                                                  <label className="h-[36px] whitespace-nowrap cursor-pointer px-4 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                                                    <FiUpload /> Cargar PDF
                                                    <input
                                                      type="file"
                                                      accept="application/pdf"
                                                      className="hidden"
                                                      onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          const f = e.target.files[0];
                                                          setSelectedFiles(prev => ({ ...prev, [cardKey]: f }))
                                                        }
                                                      }}
                                                    />
                                                  </label>
                                                  {selectedFiles[cardKey] && (
                                                    <span className="text-[10px] text-slate-500 max-w-[100px] truncate" title={selectedFiles[cardKey].name}>
                                                      {selectedFiles[cardKey].name}
                                                    </span>
                                                  )}
                                                </div>
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => forceDownload(pdfFullUrl, `Informe_${r.tipo}_Original.pdf`)}
                                                className="h-[36px] whitespace-nowrap px-4 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 text-slate-700"
                                              >
                                                <FiDownload /> Descargar
                                              </button>

                                              {normalizedStatus !== 'aprobado' && (
                                                <button
                                                  type="button"
                                                  disabled={!selectedFiles[cardKey] || isApproving[cardKey]}
                                                  className="h-[36px] whitespace-nowrap px-5 text-xs font-bold bg-[#39A900] text-white hover:bg-[#007832] rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                  onClick={() => handleApprove(reportId, r.tipo, cardKey)}
                                                >
                                                  <FiCheck /> {isApproving[cardKey] ? 'Enviando...' : 'Aprobar'}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
              <span className="text-xl text-emerald-600"><FiInfo /></span> Instrucciones
            </h3>
            <div className="text-sm text-emerald-800/80 leading-relaxed space-y-4">
              <p>
                1. Haz clic en <strong>Ver Informe PDF</strong> para inspeccionar el documento institucional adjuntado.
              </p>
              <p>
                2. Si todo cumple, haz clic en <strong>Aprobar Informe</strong>.
              </p>
              <p>
                3. Si requiere correcciones, selecciona <strong>Solicitar Corrección</strong> y describe detalladamente lo que el instructor debe modificar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
