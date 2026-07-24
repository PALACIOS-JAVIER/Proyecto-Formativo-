import type { ReactElement } from 'react'

export function Dashboard(): ReactElement {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border px-6 py-6 shadow-sm border-slate-200 bg-white text-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Hola, María Fernanda</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tu espacio</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Revisa informes y sigue tu trabajo con una vista más clara y organizada.
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700">Actualizado</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <p className="text-sm text-slate-500">Cumplimiento</p>
          <strong className="mt-2 block text-3xl font-semibold text-slate-900">92%</strong>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: '92%' }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Porcentaje de entregas válidas sin observaciones.</p>
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <p className="text-sm text-slate-500">Puntualidad</p>
          <strong className="mt-2 block text-3xl font-semibold text-slate-900">87%</strong>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-sky-500" style={{ width: '87%' }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Informes entregados dentro del plazo.</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <h3 className="text-lg font-semibold text-slate-900">Próximas entregas</h3>
          <ol className="mt-4 space-y-2">
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Informe movilidad — 05/06</li>
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Informe mensual — 10/06</li>
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Informe seguimiento — 15/06</li>
          </ol>
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white/80">
          <h3 className="text-lg font-semibold text-slate-900">Resumen mensual</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl p-3 bg-slate-50">
              <p className="text-slate-500">Entregas</p>
              <strong className="mt-1 block text-xl text-slate-900">12</strong>
            </div>
            <div className="rounded-2xl p-3 bg-slate-50">
              <p className="text-slate-500">Observaciones</p>
              <strong className="mt-1 block text-xl text-slate-900">3</strong>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white/80">
          <h3 className="text-lg font-semibold text-slate-900">Top observaciones</h3>
          <ul className="mt-4 space-y-2">
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Falta evidencia de movilidad</li>
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Errores en formato GF</li>
            <li className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">Fechas incorrectas</li>
          </ul>
        </article>
      </div>

      <aside className="rounded-[28px] border px-5 py-5 shadow-sm border-slate-200 bg-white text-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Entrega pendiente</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ['05', 'Días'],
            ['02', 'Horas'],
            ['35', 'Minutos'],
            ['02', 'Segundos'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl p-3 text-center bg-slate-50">
              <strong className="block text-2xl font-semibold text-slate-900">{value}</strong>
              <span className="text-sm text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
