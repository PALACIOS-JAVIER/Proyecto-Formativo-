import { useMemo, useState, type ReactElement } from 'react'

type Report = {
  id: string
  instructor: string
  cedula: string
  area: string
  periodo: string
  entrega: string
  status: 'revision' | 'aprobado' | 'correccion'
  dias: string
}

const SAMPLE_REPORTS: Report[] = [
  {
    id: 'INF-2825-02-847',
    instructor: 'Carlos Andrés Martínez',
    cedula: '1098765432',
    area: 'Robótica',
    periodo: 'Febrero 2025',
    entrega: '08 Feb 2025',
    status: 'revision',
    dias: '3 días',
  },
  {
    id: 'INF-2825-02-846',
    instructor: 'Ana María Rodríguez',
    cedula: '1087654321',
    area: 'Desarrollo de Software',
    periodo: 'Febrero 2025',
    entrega: '07 Feb 2025',
    status: 'revision',
    dias: '4 días',
  },
  {
    id: 'INF-2825-02-849',
    instructor: 'Juan Pérez',
    cedula: '1076543210',
    area: 'Ingeniería Civil',
    periodo: 'Febrero 2025',
    entrega: '10 Feb 2025',
    status: 'aprobado',
    dias: '1 día',
  },
]

export function RevisarInformes(): ReactElement {
  const [query, setQuery] = useState('')
  const [periodo, setPeriodo] = useState('Todos los periodos')
  const [filter, setFilter] = useState<'revision' | 'aprobado' | 'correccion'>('revision')

  const counts = useMemo(() => {
    const out = { revision: 0, aprobado: 0, correccion: 0 }
    for (const r of SAMPLE_REPORTS) out[r.status]++
    return out
  }, [])

  const filtered = useMemo(() => {
    return SAMPLE_REPORTS.filter((r) => {
      if (filter !== r.status) return false
      if (periodo !== 'Todos los periodos' && r.periodo !== periodo) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        r.instructor.toLowerCase().includes(q) ||
        r.cedula.includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      )
    })
  }, [filter, periodo, query])

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border border-transparent page-hero-bg p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald">Revisar informes</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Evaluá, aprobá o solicitá correcciones a las entregas mensuales de tu unidad académica</h1>
            <p className="mt-3 max-w-2xl text-sm text-secondary">Filtros rápidos y acciones para revisar los informes con eficiencia.</p>
          </div>
        </div>
      </header>

      {/* stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-sky">{counts.revision}</div>
          <div className="text-sm text-secondary">En Revisión</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-emerald">{counts.aprobado}</div>
          <div className="text-sm text-secondary">Aprobados</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-5 shadow-md">
          <div className="text-2xl font-bold text-warning">{counts.correccion}</div>
          <div className="text-sm text-secondary">Correcciones</div>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-3">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-bg-card px-2 py-2">
            <span className="text-secondary mr-2">🔎</span>
            <input
              className="w-full border-none bg-transparent outline-none text-sm text-foreground"
              placeholder="Buscar por instructor, cédula, área o ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-border bg-bg-card px-2 py-2 text-sm text-foreground"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option>Todos los periodos</option>
            <option>Febrero 2025</option>
            <option>Enero 2025</option>
          </select>
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
        {filtered.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{r.instructor}</h3>
                <p className="text-sm text-secondary">Cédula: {r.cedula} · Área: {r.area}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`status-chip ${r.status === 'revision' ? 'status-chip--info' : r.status === 'aprobado' ? 'status-chip--success' : 'status-chip--alert'}`}>
                  {r.status === 'revision' ? 'En Revisión' : r.status === 'aprobado' ? 'Aprobado' : 'Corrección'}
                </span>
                <span className="rounded-full border px-2 py-1 text-xs text-warning">{r.dias}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3 bg-bg-alt rounded-md p-3 border border-border">
              <div>
                <p className="text-xs text-secondary uppercase font-semibold">ID</p>
                <p className="text-sm font-semibold text-foreground">{r.id}</p>
              </div>
              <div>
                <p className="text-xs text-secondary uppercase font-semibold">Periodo</p>
                <p className="text-sm font-semibold text-foreground">{r.periodo}</p>
              </div>
              <div>
                <p className="text-xs text-secondary uppercase font-semibold">Entrega</p>
                <p className="text-sm font-semibold text-foreground">{r.entrega}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button className="button button--ghost px-4 py-2 text-sm">Ver Informe</button>
              <button className="rounded-md border bg-bg-card px-4 py-2 text-sm text-warning border-warning hover:bg-bg-alt">Solicitar Corrección</button>
              <button className="button button--primary px-4 py-2 text-sm">Aprobar Informe</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="rounded-2xl border bg-bg-card p-6 text-center text-secondary">No hay informes que coincidan con los filtros.</div>}
      </div>
    </section>
  )
}
