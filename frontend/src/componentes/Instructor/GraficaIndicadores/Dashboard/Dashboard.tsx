import type { ReactElement } from 'react'

export function Dashboard(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Hola, María Fernanda</p>
          <h1>Tu espacio</h1>
          <p className="subtext">Revisa informes y sigue tu trabajo. Aquí encontrarás atajos, avisos y una guía paso a paso para usar el sistema.</p>
        </div>
        <span className="status-chip status-chip--success">Actualizado</span>
      </header>

      <div className="stats-grid">
        <article className="card stat-card">
          <p className="stat-label">Cumplimiento</p>
          <strong>92%</strong>
          <div className="progress-bar"><span style={{ width: '92%' }} /></div>
          <p className="stat-small">Porcentaje de entregas válidas sin observaciones.</p>
        </article>

        <article className="card stat-card">
          <p className="stat-label">Puntualidad</p>
          <strong>87%</strong>
          <div className="progress-bar"><span style={{ width: '87%' }} /></div>
          <p className="stat-small">Informes entregados dentro del plazo.</p>
        </article>
      </div>

      <div className="dashboard-panels extra-grid">
        <article className="card small-card">
          <h3>Próximas entregas</h3>
          <ol>
            <li>Informe movilidad — 05/06</li>
            <li>Informe mensual — 10/06</li>
            <li>Informe seguimiento — 15/06</li>
          </ol>
        </article>

        <article className="card small-card">
          <h3>Resumen mensual</h3>
          <p className="stat-small">Entregas: <strong>12</strong></p>
          <p className="stat-small">Observaciones: <strong>3</strong></p>
          <p className="stat-small">Promedio de cumplimiento: <strong>90%</strong></p>
        </article>

        <article className="card small-card">
          <h3>Top observaciones</h3>
          <ul>
            <li>Falta evidencia de movilidad</li>
            <li>Errores en formato GF</li>
            <li>Fechas incorrectas</li>
          </ul>
        </article>
      </div>

      <aside className="countdown-panel">
        <p className="eyebrow accent">Entrega pendiente</p>
        <div className="countdown-grid">
          <div>
            <strong>05</strong>
            <span>Días</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Horas</span>
          </div>
          <div>
            <strong>35</strong>
            <span>Minutos</span>
          </div>
          <div>
            <strong>02</strong>
            <span>Segundos</span>
          </div>
        </div>
      </aside>
    </section>
  )
}
