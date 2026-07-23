import { useMemo, useState, type ReactElement } from 'react'

type Entry = {
  id: string
  instructor: string
  cedula: string
  area: string
  periodo: string
  entrega: string
  estado: 'Aprobado' | 'Requiere Correcciones' | 'En Revisión'
  fecha: string
}

const SAMPLE: Entry[] = [
  { id: 'INF-2025-01', instructor: 'María Fernanda López Ruiz', cedula: '1023456789', area: 'Desarrollo de Software', periodo: 'Enero 2025', entrega: '30 Ene 2025', estado: 'Aprobado', fecha: '2025-01-30' },
  { id: 'INF-2024-12', instructor: 'Juan Pérez', cedula: '1098765432', area: 'Robótica', periodo: 'Diciembre 2024', entrega: '22 Dic 2024', estado: 'Requiere Correcciones', fecha: '2024-12-22' },
  { id: 'INF-2024-11', instructor: 'Ana Gómez', cedula: '1087654321', area: 'Ingeniería Civil', periodo: 'Noviembre 2024', entrega: '18 Nov 2024', estado: 'Aprobado', fecha: '2024-11-18' },
]

export function Historial(): ReactElement {
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [periodo, setPeriodo] = useState('Todos')

  const filtered = useMemo(() => {
    return SAMPLE.filter((e) => {
      if (estado !== 'Todos' && e.estado !== estado) return false
      if (periodo !== 'Todos' && e.periodo !== periodo) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        e.instructor.toLowerCase().includes(q) ||
        e.cedula.includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q)
      )
    })
  }, [query, estado, periodo])

  return (
    <section className="page-panel">
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">Historial</p>
          <h1 className="text-2xl font-semibold">Historial y Trazabilidad General</h1>
          <p className="subtext">Consulta la bitácora histórica de informes, firmas y aprobaciones.</p>
        </div>
      </header>

      <div className="grid gap-6">
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3 w-full">
              <div className="flex flex-1 items-center rounded-lg border border-border bg-bg-card px-3 py-2">
                <span className="text-secondary mr-2">🔎</span>
                <input className="w-full border-none bg-transparent outline-none text-sm text-foreground" placeholder="Nombre, cédula o ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-foreground" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option>Todos</option>
                <option>Aprobado</option>
                <option>Requiere Correcciones</option>
                <option>En Revisión</option>
              </select>
              <select className="rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-foreground" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option>Todos</option>
                <option>Enero 2025</option>
                <option>Diciembre 2024</option>
                <option>Noviembre 2024</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <p className="stat-small">Resultados encontrados: <strong>{filtered.length}</strong></p>

          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-secondary text-xs text-left">
                  <th className="py-3 pr-6">CÓDIGO / ID</th>
                  <th className="py-3 pr-6">INSTRUCTOR</th>
                  <th className="py-3 pr-6">ÁREA / CÉDULA</th>
                  <th className="py-3 pr-6">PERIODO</th>
                  <th className="py-3 pr-6">ENTREGA</th>
                  <th className="py-3 pr-6">ESTADO</th>
                  <th className="py-3 pr-6">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="align-top border-t border-border">
                    <td className="py-4 pr-6 text-foreground font-semibold">{r.id}</td>
                    <td className="py-4 pr-6">
                      <div className="text-foreground font-semibold">{r.instructor}</div>
                    </td>
                    <td className="py-4 pr-6 text-secondary">{r.area}<div className="text-xs text-secondary mt-1">C.C. {r.cedula}</div></td>
                    <td className="py-4 pr-6 text-foreground font-semibold">{r.periodo}</td>
                    <td className="py-4 pr-6 text-secondary">{r.entrega}</td>
                    <td className="py-4 pr-6">
                      <span className={`status-chip ${r.estado === 'Aprobado' ? 'status-chip--success' : r.estado === 'En Revisión' ? 'status-chip--info' : 'status-chip--warning'}`}>{r.estado}</span>
                    </td>
                    <td className="py-4 pr-6">
                      <button className="button button--ghost px-3 py-2 text-sm">Ver Soportes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
