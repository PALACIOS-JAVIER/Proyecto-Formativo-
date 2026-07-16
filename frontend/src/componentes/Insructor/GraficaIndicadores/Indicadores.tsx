import type { ReactElement } from 'react'

function LineChart({ data = [] }: { data?: number[] }) {
  const width = 580
  const height = 180
  const padding = 20

  if (data.length === 0) {
    return <div>No hay datos para mostrar.</div>
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

  return (
    <div className="line-chart">
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        <polyline className="chart-animate" fill="none" stroke="#2fd06f" strokeWidth={3} points={points} />
        {data.map((v, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2)
          const y = padding + ((max - v) / (max - min || 1)) * (height - padding * 2)
          return <circle key={i} cx={x} cy={y} r={4} fill="#2fd06f" className="chart-point" />
        })}
      </svg>
    </div>
  )
}

export function Indicadores(): ReactElement {
  const sample = [65, 72, 78, 75, 82, 79]
  const areas = [
    { name: 'Seguimiento', level: 92 },
    { name: 'Informes', level: 76 },
    { name: 'Movilidad', level: 58 },
    { name: 'Revisiones', level: 48 },
  ]

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Indicadores de desempeño</p>
          <h1>Monitorea tus resultados con métricas claras.</h1>
        </div>
        <span className="status-chip status-chip--success">Última actualización: hoy</span>
      </header>

      <div className="stats-grid">
        <article className="card stat-card">
          <p className="stat-label">Score general</p>
          <strong>76%</strong>
          <p className="stat-small">Tu rendimiento promedio de los últimos 5 meses.</p>
        </article>
        <article className="card stat-card">
          <p className="stat-label">Eficiencia de entrega</p>
          <strong>88%</strong>
          <p className="stat-small">Entregas realizadas dentro del plazo establecido.</p>
        </article>
        <article className="card stat-card">
          <p className="stat-label">Alertas pendientes</p>
          <strong>4</strong>
          <p className="stat-small">Informes con observaciones por revisar.</p>
        </article>
      </div>

      <div className="dashboard-panels">
        <article className="card chart-panel">
          <h2>Tendencia mensual</h2>
          <LineChart data={sample} />
          <p className="stat-small">Gráfica con tendencia de los últimos meses.</p>
        </article>

        <article className="card overview-card overview-card--accent notifications-compact">
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
    </section>
  )
}
