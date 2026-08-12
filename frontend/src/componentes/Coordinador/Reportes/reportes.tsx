import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import * as XLSX from 'xlsx'

interface Contractor {
  id: number
  name: string
  cc: string
  area: string
  reports: any[]
  corrections: any[]
}

export function Reportes(): ReactElement {
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_data') || '{}')
    } catch {
      return {}
    }
  })()
  const coordinatorName = userData.nombre || 'Coordinador'

  const [contractorsData, setContractorsData] = useState<Contractor[]>([])
  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterContractor, setFilterContractor] = useState('')
  const [selectedContractors, setSelectedContractors] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('access_token') || ''
        const headers = { 'Authorization': `Bearer ${token}` }

        const [usersRes, gcRes] = await Promise.all([
          fetch('/api/usuarios', { headers }).then(r => r.ok ? r.json() : []),
          fetch('/api/informes-gc', { headers }).then(r => r.ok ? r.json() : [])
        ])

        const formattedContractors: Contractor[] = (usersRes || [])
          .filter((u: any) => {
            const role = (u.rol?.nombre || u.rol || '').toLowerCase()
            return !role.includes('coordinador') && !role.includes('apoyo')
          })
          .map((u: any) => {
            const userReports = (gcRes || []).filter((r: any) => r.usuario?.id_Usuario === u.id_Usuario)
            return {
              id: u.id_Usuario,
              name: `${u.nombre} ${u.apellido}`,
              cc: u.cedula?.toString() || '',
              area: u.area?.nombre || 'General',
              reports: userReports.map((r: any) => ({
                period: `${r.mes} ${r.anio}`,
                submittedDate: r.fecha_registro
              })),
              corrections: []
            }
          })

        setContractorsData(formattedContractors)
        setSelectedContractors(formattedContractors.map(c => c.id))
      } catch (err) {
        console.error('Error fetching data for reportes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const contractorSearchResults = useMemo(() => {
    return contractorsData.filter((contractor) => {
      const matchesName = filterContractor === '' || contractor.name.toLowerCase().includes(filterContractor.toLowerCase())
      const matchesPeriod = filterPeriod === '' || contractor.reports.some(report => report.period.toLowerCase().includes(filterPeriod.toLowerCase()))
      return matchesName && matchesPeriod
    })
  }, [contractorsData, filterContractor, filterPeriod])

  const filteredContractors = useMemo(() => {
    return contractorSearchResults.filter((contractor) => selectedContractors.includes(contractor.id))
  }, [contractorSearchResults, selectedContractors])

  const displayedContractors = useMemo(() => {
    return filteredContractors.filter((contractor) => {
      if (filterDate === '') return true
      return contractor.reports.some(report => new Date(report.submittedDate) <= new Date(filterDate))
    })
  }, [filteredContractors, filterDate])

  const allVisibleSelected = contractorSearchResults.length > 0 && contractorSearchResults.every((contractor) => selectedContractors.includes(contractor.id))

  function toggleContractor(contractorId: number) {
    setSelectedContractors((current) =>
      current.includes(contractorId) ? current.filter((id) => id !== contractorId) : [...current, contractorId]
    )
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedContractors((current) => current.filter((id) => !contractorSearchResults.some((contractor) => contractor.id === id)))
    } else {
      setSelectedContractors((current) => Array.from(new Set([...current, ...contractorSearchResults.map((contractor) => contractor.id)])))
    }
  }

  const handleExport = () => {
    if (displayedContractors.length === 0) {
      alert('No hay contratistas seleccionados para exportar.')
      return
    }

    // Preparar datos para Excel
    const data = displayedContractors.map(c => ({
      'Cédula': c.cc,
      'Nombre Completo': c.name,
      'Área': c.area,
      'Periodo Filtrado': filterPeriod || 'Todos',
      'Informes Presentados': c.reports.length
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Consolidado")
    
    // Descargar el archivo
    XLSX.writeFile(wb, `Reporte_Consolidado_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <section className="page-panel">
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">Reportes</p>
          <h1 className="text-2xl font-semibold">Panel de Configuración</h1>
          <p className="subtext">Selecciona periodo y contratista para ver todo el historial de informes y correcciones.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5">
          {isLoading && <p className="text-sm text-emerald-600 font-bold mb-4">Cargando datos de instructores...</p>}
          <div>
            <label className="field-label">1. PERIODO MENSUAL</label>
            <select className="month-selector mt-2" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
              <option value="">Todos</option>
              <option value="Enero">Enero</option>
              <option value="Febrero">Febrero</option>
              <option value="Marzo">Marzo</option>
              <option value="Abril">Abril</option>
              <option value="Mayo">Mayo</option>
              <option value="Junio">Junio</option>
              <option value="Julio">Julio</option>
              <option value="Agosto">Agosto</option>
              <option value="Septiembre">Septiembre</option>
              <option value="Octubre">Octubre</option>
              <option value="Noviembre">Noviembre</option>
              <option value="Diciembre">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="field-label">2. SELECCIONAR CONTRATISTAS</label>
            <input
              type="text"
              placeholder="Buscar contratista..."
              className="w-full rounded-xl border border-border bg-bg-alt text-foreground outline-none focus:border-sky-500 px-4 py-2 transition-all mb-3"
              value={filterContractor}
              onChange={(e) => setFilterContractor(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between text-sm text-emerald-600">
              <span>{contractorSearchResults.length} encontrados</span>
              <button type="button" className="font-semibold" onClick={toggleSelectAll}>
                {allVisibleSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="mt-3 max-h-64 overflow-y-auto rounded-3xl border border-border bg-bg-alt p-3">
              {contractorSearchResults.map((contractor) => (
                <label key={contractor.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 rounded px-2">
                  <input
                    type="checkbox"
                    checked={selectedContractors.includes(contractor.id)}
                    onChange={() => toggleContractor(contractor.id)}
                    className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-sm text-foreground">{contractor.name}</div>
                  <span className="ml-auto rounded-full border border-border bg-white px-3 py-1 text-[11px] text-secondary">{contractor.area}</span>
                </label>
              ))}
              {contractorSearchResults.length === 0 && !isLoading && (
                <p className="text-sm text-text-muted">No hay contratistas con ese filtro.</p>
              )}
            </div>
          </div>

          <div>
            <label className="field-label">3. FECHA CORTE</label>
            <input
              type="date"
              className="w-full rounded-xl border border-border bg-bg-alt text-foreground outline-none focus:border-sky-500 px-4 py-2 transition-all"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>

          <div className="mt-5">
            <button 
              onClick={handleExport}
              disabled={isLoading || displayedContractors.length === 0}
              className="button button--primary w-full px-6 py-3 disabled:opacity-50"
            >
              Consolidar y Exportar Reporte
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <p className="stat-small">Vista Previa Interactiva</p>
          <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <div className="text-xs text-secondary">SERVICIO NACIONAL DE APRENDIZAJE - SENA</div>
              <div className="mt-2 text-lg font-semibold text-foreground">REPORTE CONSOLIDADO DE INSTRUCTORES CONTRATISTAS</div>
              <div className="text-sm text-secondary mt-2">Periodo: {filterPeriod || 'Todos'} • Centro de Gestión Yamboro</div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-secondary">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]">Mes reporte</div>
                  <div className="mt-1 text-foreground font-semibold">{filterPeriod || 'Todos'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]">Contratistas</div>
                  <div className="mt-1 text-foreground font-semibold">{displayedContractors.length} seleccionados</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]">Obligaciones</div>
                  <div className="mt-1 text-foreground font-semibold">18 (Regular FIC) / 19 (CampeSENA)</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]">Formato salida</div>
                  <div className="mt-1 text-foreground font-semibold">XLSX</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">1. DATOS GENERALES DEL CONTRATO</h3>
              <div className="grid gap-3 text-sm text-secondary mt-3">
                <div className="flex justify-between gap-4"><span>Centro:</span><span className="text-foreground text-right">Centro de Gestión y Desarrollo Sostenible Surcolombiano</span></div>
                <div className="flex justify-between gap-4"><span>Coordinador / Responsable:</span><span className="text-foreground text-right">{coordinatorName}</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">2. CONTRATISTAS CONSOLIDADOS EN LA PLANILLA</h3>
              <div className="space-y-3 mt-3">
                {displayedContractors.length === 0 ? (
                  <p className="text-sm text-secondary">No hay contratistas seleccionados para este reporte.</p>
                ) : (
                  displayedContractors.map((contractor) => (
                    <div key={contractor.id} className="rounded-2xl border border-border bg-white p-3 flex justify-between items-center text-sm">
                      <span>{contractor.name}</span>
                      <span className="text-xs text-secondary">C.C. {contractor.cc}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">3. OBLIGACIONES INCORPORADAS</h3>
              <p className="text-sm text-secondary mt-3">Se compilarán las bitácoras correspondientes a las **18 obligaciones** para la modalidad Regular - FIC y **19 obligaciones** para la modalidad CampeSENA.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
