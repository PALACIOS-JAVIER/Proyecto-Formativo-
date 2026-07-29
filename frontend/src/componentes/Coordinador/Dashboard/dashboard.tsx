import type { ReactElement } from 'react'

export function Dashboard(): ReactElement {
const coordinatorDashboardStats = [
  { id: 'informes', label: 'Informes pendientes', value: '0', detail: 'Sin informes por revisar', tone: 'success' },
  { id: 'instructores', label: 'Instructores activos', value: '0', detail: 'Registrados en el sistema', tone: 'success' },
  { id: 'alertas', label: 'Alertas abiertas', value: '0', detail: 'Sin observaciones o alertas', tone: 'success' },
]

const recentActivities: any[] = []
const priorities: any[] = []

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border px-6 py-6 shadow-sm border-slate-200 bg-white text-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Panel de coordinación</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Vista operativa del equipo</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Monitorea desempeño, revisa informes y prioriza acciones de seguimiento sin perder contexto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700">● En línea</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {coordinatorDashboardStats.map((item) => {
          const toneClasses =
            item.tone === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : item.tone === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'

          return (
            <article key={item.id} className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
              <p className="text-sm text-slate-500">{item.label}</p>
              <strong className="mt-2 block text-3xl font-semibold text-slate-900">{item.value}</strong>
              <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-medium ${toneClasses}`}>
                Óptimo
              </span>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Actividad reciente</h3>
            <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600">Hoy</span>
          </div>
          {recentActivities.length === 0 ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">
              Sin actividad reciente registrada.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.name} className="rounded-2xl p-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800">{activity.name}</strong>
                    <span className="text-sm text-slate-500">{activity.time}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{activity.state}</span>
                    <span className="text-slate-700">{activity.progress}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: activity.progress }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <h3 className="text-lg font-semibold text-slate-900">Acciones prioritarias</h3>
          {priorities.length === 0 ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">
              Sin acciones prioritarias pendientes.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {priorities.map((priority) => (
                <li key={priority} className="rounded-2xl px-3 py-2 text-sm bg-slate-50 text-slate-700">
                  {priority}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 bg-emerald-50">
              <p className="text-sm text-slate-500">Cierre semanal</p>
              <strong className="mt-1 block text-xl text-emerald-700">0%</strong>
            </div>
            <div className="rounded-2xl p-3 bg-sky-50">
              <p className="text-sm text-slate-500">Cumplimiento</p>
              <strong className="mt-1 block text-xl text-sky-700">0%</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
