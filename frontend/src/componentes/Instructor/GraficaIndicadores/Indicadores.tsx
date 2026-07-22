import { useState } from 'react'
import type { ReactElement } from 'react'

function LineChart({ data = [] }: { data?: number[] }) {
  const width = 580
  const height = 180
  const padding = 20

  if (data.length === 0) {
    return <div className="text-muted">No hay datos para mostrar.</div>
  }

  const max = Math.max(...data)
  const min = Math.min(...data)

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y = padding + ((max - v) / (max - min || 1)) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const months = ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb']

  return (
    <div className="line-chart">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i / 4) * (height - padding * 2)
          return (
            <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth={0.5} opacity={0.1} />
          )
        })}
        {/* Axis labels */}
        {months.map((m, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2)
          return (
            <text key={m} x={x} y={height - 4} textAnchor="middle" fontSize={10} opacity={0.5}>
              {m}
            </text>
          )
        })}
        {/* Line */}
        <polyline className="chart-animate" fill="none" stroke="var(--color-emerald)" strokeWidth={3} points={points} />
        {/* Points */}
        {data.map((v, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2)
          const y = padding + ((max - v) / (max - min || 1)) * (height - padding * 2)
          return <circle key={i} cx={x} cy={y} r={4} fill="var(--color-emerald)" className="chart-point" />
        })}
      </svg>
    </div>
  )
}

export function Indicadores(): ReactElement {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d')
  const sample = [65, 72, 78, 75, 82, 79]
  const areas = [
    { name: 'Seguimiento', level: 92, color: 'emerald' },
    { name: 'Informes', level: 76, color: 'sky' },
    { name: 'Movilidad', level: 58, color: 'amber' },
    { name: 'Revisiones', level: 48, color: 'red' },
  ]

  const statCards = [
    { label: 'Score general', value: '76%', desc: 'Tu rendimiento promedio de los últimos 5 meses.', trend: '+5%' },
    { label: 'Eficiencia de entrega', value: '88%', desc: 'Entregas realizadas dentro del plazo establecido.', trend: '+12%' },
    { label: 'Alertas pendientes', value: '4', desc: 'Informes con observaciones por revisar.', trend: '-2' },
  ]

  return (
    <section className="page-panel">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Indicadores de desempeño</p>
          <h1>Monitorea tus resultados con métricas claras.</h1>
          <p className="subtext">Visualiza tendencias, compara con el promedio del equipo y detecta oportunidades de mejora.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTimeRange('30d')}
            className={`button ${timeRange === '30d' ? 'button--primary' : 'button--ghost'}`}
          >
            30 días
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90d')}
            className={`button ${timeRange === '90d' ? 'button--primary' : 'button--ghost'}`}
          >
            90 días
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('1y')}
            className={`button ${timeRange === '1y' ? 'button--primary' : 'button--ghost'}`}
          >
            1 año
          </button>
        </div>
      </header>

      {/* Stats grid */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">{stat.label}</p>
              <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-alert-600'}`}>
                {stat.trend}
              </span>
            </div>
            <strong>{stat.value}</strong>
            <p className="stat-small">{stat.desc}</p>
          </article>
        ))}
      </div>

      {/* Charts section */}
      <div className="dashboard-panels mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="chart-panel">
          <h2>Tendencia mensual</h2>
          <LineChart data={sample} />
          <p className="stat-small mt-2">Gráfica con tendencia de los últimos meses. Cada punto representa el score mensual.</p>
        </article>

        <article className="overview-card overview-card--accent">
          <h2>Áreas con mayor carga</h2>
          <ol className="load-list">
            {areas.map((area) => (
              <li key={area.name}>
                <div className="load-meta">
                  <span>{area.name}</span>
                  <strong>{area.level}%</strong>
                </div>
                <div className="load-bar">
                  <span style={{ width: `${area.level}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </article>
      </div>

      {/* Detailed breakdown */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="card">
          <h2 className="mb-4 text-lg font-semibold">Comparativa con el equipo</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">Tu score</span>
                <strong>76%</strong>
              </div>
              <div className="h-2 rounded-full bg-border">
                <div className="h-2 w-3/4 rounded-full bg-emerald" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">Promedio equipo</span>
                <strong>72%</strong>
              </div>
              <div className="h-2 rounded-full bg-border">
                <div className="h-2 w-5/6 rounded-full bg-sky" />
              </div>
            </div>
          </div>
          <p className="stat-small mt-4">Tu rendimiento está por encima del promedio del equipo. ¡Sigue así!</p>
        </article>

        <article className="card">
          <h2 className="mb-4 text-lg font-semibold">Próximos objetivos</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald text-xs font-bold text-white">1</span>
              <span>Mejorar la carga de Movilidad al 70% (actual: 58%)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald text-xs font-bold text-white">2</span>
              <span>Reducir revisiones pendientes a 2 (actual: 4)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald text-xs font-bold text-white">3</span>
              <span>Mantener score general por encima del 80%</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}
