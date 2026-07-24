import type { ReactElement } from 'react'
import { useState } from 'react'

export function Historial(): ReactElement {
  const [history] = useState([
    { id: 1, action: 'Aprobó informe', target: 'Ana Marín', date: '2026-07-20 10:30 AM', details: 'Informe mensual de julio aprobado sin novedades.' },
    { id: 2, action: 'Mandó a corregir', target: 'Apoyo Administrativo (Carlos Gómez)', date: '2026-07-21 02:15 PM', details: 'Faltan firmas en los anexos y evidencias fotográficas.' },
    { id: 3, action: 'Aprobó informe', target: 'María López', date: '2026-07-22 09:00 AM', details: 'Informe de ejecución del segundo trimestre aprobado.' },
    { id: 4, action: 'Mandó a corregir', target: 'Apoyo Administrativo (Ana Marín)', date: '2026-07-23 04:45 PM', details: 'Error en cálculo de horas reportadas, requiere corrección.' },
    { id: 5, action: 'Aprobó informe', target: 'Pedro Martínez', date: '2026-07-24 08:30 AM', details: 'Plan de trabajo semanal aprobado.' },
  ]);

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
      </article>
    </section>
  )
}
