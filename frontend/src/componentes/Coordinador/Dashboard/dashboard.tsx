import type { ReactElement } from 'react'

interface DashboardProps {
  theme: 'dark' | 'light'
}

const coordinatorDashboardStats = [
  { id: 'informes', label: 'Informes pendientes', value: '12', detail: 'Requieren revisión esta semana', tone: 'warning' },
  { id: 'instructores', label: 'Instructores activos', value: '8', detail: '4 con cumplimiento alto', tone: 'success' },
  { id: 'alertas', label: 'Alertas abiertas', value: '3', detail: '2 de prioridad alta', tone: 'alert' },
]

const recentActivities = [
  { name: 'María Fernández', time: 'Hace 1h', progress: '86%', state: 'Subió informe' },
  { name: 'Luis Ortega', time: 'Hace 2h', progress: '72%', state: 'Revisó indicadores' },
  { name: 'Ana Torres', time: 'Hace 3h', progress: '61%', state: 'Solicitó apoyo' },
]

const priorities = [
  'Revisar 2 informes con estado pendiente',
  'Contactar a 1 instructor con cumplimiento bajo',
  'Confirmar 3 aprobaciones del mes',
]

export function Dashboard({ theme }: DashboardProps): ReactElement {
  const isDark = theme === 'dark'

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className={`rounded-[28px] border px-6 py-6 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Panel de coordinación</p>
            <h1 className={`mt-2 text-3xl font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Vista operativa del equipo</h1>
            <p className={`mt-3 max-w-2xl text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Monitorea desempeño, revisa informes y prioriza acciones de seguimiento sin perder contexto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>● En línea</span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>17 tareas hoy</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {coordinatorDashboardStats.map((item) => {
          const toneClasses =
            item.tone === 'success'
              ? isDark
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-emerald-100 text-emerald-700'
              : item.tone === 'warning'
                ? isDark
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-amber-100 text-amber-700'
                : isDark
                  ? 'bg-rose-500/15 text-rose-300'
                  : 'bg-rose-100 text-rose-700'

          return (
            <article key={item.id} className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white text-slate-900'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
              <strong className={`mt-2 block text-3xl font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>{item.value}</strong>
              <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.detail}</p>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-medium ${toneClasses}`}>
                {item.tone === 'success' ? 'Óptimo' : item.tone === 'warning' ? 'Atención' : 'Crítico'}
              </span>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white text-slate-900'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Actividad reciente</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Hoy</span>
          </div>
          <ul className="mt-4 space-y-3">
            {recentActivities.map((activity) => (
              <li key={activity.name} className={`rounded-2xl p-3 ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <strong className={isDark ? 'text-slate-100' : 'text-slate-800'}>{activity.name}</strong>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{activity.time}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{activity.state}</span>
                  <span className={isDark ? 'text-slate-100' : 'text-slate-700'}>{activity.progress}</span>
                </div>
                <div className={`mt-3 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: activity.progress }} />
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white text-slate-900'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Acciones prioritarias</h3>
          <ul className="mt-4 space-y-2">
            {priorities.map((priority) => (
              <li key={priority} className={`rounded-2xl px-3 py-2 text-sm ${isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                {priority}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className={`rounded-2xl p-3 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cierre semanal</p>
              <strong className={`mt-1 block text-xl ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>78%</strong>
            </div>
            <div className={`rounded-2xl p-3 ${isDark ? 'bg-sky-500/10' : 'bg-sky-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cumplimiento</p>
              <strong className={`mt-1 block text-xl ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>92%</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
