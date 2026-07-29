import type { ReactElement } from 'react'
import { useState } from 'react'

export function Historial(): ReactElement {
  const [history] = useState<any[]>([]);

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Historial</p>
          <h1>Trazabilidad de acciones</h1>
          <p className="subtext">Consulta el registro de todo lo que has realizado: informes aprobados y enviados a corregir al apoyo administrativo.</p>
        </div>
      </header>

      <article className="card">
        {history.length === 0 ? (
          <p className="p-6 text-center text-text-muted">Sin registros en la bitácora de historial.</p>
        ) : (
          <div className="space-y-6">
            {history.map(item => (
              <div key={item.id} className="relative pl-6 border-l-2 border-emerald-500/30 pb-2">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="font-bold text-[1.05rem] text-foreground">{item.action}</h3>
                    <p className="text-sm font-medium text-emerald-600">{item.target}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-bg-alt text-text-secondary border border-border whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-muted">{item.details}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
