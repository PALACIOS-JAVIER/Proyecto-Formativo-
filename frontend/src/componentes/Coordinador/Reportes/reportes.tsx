import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'

const CONTRACTORS: any[] = []

export function Reportes(): ReactElement {
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_data') || '{}')
    } catch {
      return {}
    }
  })()
  const coordinatorName = userData.nombre || 'Coordinador'

  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterContractor, setFilterContractor] = useState('')
  const [selectedContractors, setSelectedContractors] = useState<number[]>(CONTRACTORS.map((contractor) => contractor.id))

  const contractorSearchResults = useMemo(() => {
    return CONTRACTORS.filter((contractor) => {
      const matchesName = filterContractor === '' || contractor.name.toLowerCase().includes(filterContractor.toLowerCase())
      const matchesPeriod = filterPeriod === '' || contractor.reports.some((report: any) => report.period.toLowerCase().includes(filterPeriod.toLowerCase()))
      return matchesName && matchesPeriod
    })
  }, [filterContractor, filterPeriod])

  const filteredContractors = useMemo(() => {
    return contractorSearchResults.filter((contractor) => selectedContractors.includes(contractor.id))
  }, [contractorSearchResults, selectedContractors])

  const displayedContractors = useMemo(() => {
    return filteredContractors.filter((contractor) => {
      const matchesDate =
        filterDate === '' ||
        contractor.reports.some((report: any) => new Date(report.submittedDate) <= new Date(filterDate)) ||
        contractor.corrections.some((correction: any) => new Date(correction.date) <= new Date(filterDate))
      return matchesDate
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
          <div>
            <label className="field-label">1. PERIODO MENSUAL</label>
            <select className="month-selector mt-2" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
              <option value="">Todos</option>
              <option>Febrero 2026</option>
              <option>Enero 2026</option>
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
                <label key={contractor.id} className="flex items-center gap-3 py-2">
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
              {contractorSearchResults.length === 0 && <p className="text-sm text-text-muted">No hay contratistas con ese filtro.</p>}
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
            <button className="button button--primary w-full px-6 py-3">Consolidar y Exportar Reporte</button>
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
                <div className="flex justify-between gap-4"><span>Centro:</span><span className="text-foreground">Centro de Gestión y Desarrollo Sostenible Surcolombiano</span></div>
                <div className="flex justify-between gap-4"><span>Coordinador / Responsable:</span><span className="text-foreground">{coordinatorName}</span></div>
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
              <h3 className="text-sm font-semibold text-foreground">3. OBLIGACIONES INCORPORADAS (GC GTH-F-062 V10)</h3>
              <p className="text-sm text-secondary mt-3">Se compilarán las bitácoras semanales correspondientes a las **18 obligaciones** para la modalidad Regular - FIC y **19 obligaciones** para la modalidad CampeSENA según corresponda.</p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">4. PLANILLA DE DESPLAZAMIENTOS SENA</h3>
              <p className="text-sm text-secondary mt-3">Se anexarán tablas de desplazamientos que justifican la ejecución de formación en subsedes o ambientes alternos.</p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">5. DISCO VIRTUAL DE EVIDENCIAS (DRIVE / ONEDRIVE)</h3>
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-foreground">Se adjuntarán automáticamente los enlaces oficiales de las carpetas de almacenamiento virtual verificadas para cada contratista.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
