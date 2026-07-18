import type { ReactElement } from 'react'

export function Historial(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Historial</p>
          <h1>Trazabilidad de cambios</h1>
          <p className="subtext">Consulta el historial de estados y observaciones del informe.</p>
        </div>
      </header>

      <article className="card">
        <p className="stat-small">Módulo en construcción.</p>
      </article>
    </section>
  )
}
