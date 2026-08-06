import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

export function Dashboard(): ReactElement {
  const [stats, setStats] = useState({
    pendingReports: 0,
    activeInstructors: 0,
    openAlerts: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [priorities, setPriorities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [gcRes, gfRes, usersRes] = await Promise.all([
        fetch('/api/informes-gc').then(r => r.ok ? r.json() : []),
        fetch('/api/informes-gf').then(r => r.ok ? r.json() : []),
        fetch('/api/usuarios').then(r => r.ok ? r.json() : []),
      ])

      const gcList = (gcRes || []).map((r: any) => ({ ...r, tipo: 'GC' }))
      const gfList = (gfRes || []).map((r: any) => ({ ...r, tipo: 'GF' }))
      const allReports = [...gcList, ...gfList]

      const pending = allReports.filter(r => r.estado === 'revisando' || r.estado === 'warning' || r.estado === 'revision')
      const alerts = allReports.filter(r => r.estado === 'correccion' || r.estado === 'alert')
      
      const instructorUsers = (usersRes || []).filter((u: any) => 
        !u.rol?.nombre?.toLowerCase().includes('coordinador')
      )

      setStats({
        pendingReports: pending.length,
        activeInstructors: instructorUsers.length || usersRes.length || 0,
        openAlerts: alerts.length,
      })

      // Map recent activities from newest reports
      const sortedReports = [...allReports].sort(
        (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
      ).slice(0, 5)

      const mappedActivities = sortedReports.map(r => ({
        id: `${r.tipo}-${r.id_informe_gc || r.id_informe_gf}`,
        name: `${r.usuario?.nombre || 'Instructor'} ${r.usuario?.apellido || ''} - Informe ${r.tipo} (${r.mes} ${r.anio})`,
        time: new Date(r.fecha_registro).toLocaleDateString(),
        state: r.estado === 'aprobado' || r.estado === 'success' ? '✓ Aprobado' : r.estado === 'correccion' || r.estado === 'alert' ? '⚠️ Corrección' : '⏳ En revisión',
        progress: r.estado === 'aprobado' || r.estado === 'success' ? '100%' : '50%',
      }))

      setRecentActivities(mappedActivities)

      // Map priority actions
      const priorityList: string[] = []
      if (pending.length > 0) {
        priorityList.push(`Tienes ${pending.length} informe(s) pendiente(s) por evaluar en la sección "Revisar informes".`)
      }
      if (alerts.length > 0) {
        priorityList.push(`Hay ${alerts.length} informe(s) con solicitud de corrección enviada a los instructores.`)
      }
      if (priorityList.length === 0) {
        priorityList.push('No hay acciones urgentes pendientes en este momento.')
      }

      setPriorities(priorityList)
    } catch (err) {
      console.error('Error loading coordinator dashboard stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const coordinatorDashboardStats = [
    {
      id: 'informes',
      label: 'Informes pendientes',
      value: stats.pendingReports.toString(),
      detail: stats.pendingReports > 0 ? `${stats.pendingReports} informe(s) por evaluar` : 'Sin informes por revisar',
      tone: stats.pendingReports > 0 ? 'warning' : 'success',
    },
    {
      id: 'instructores',
      label: 'Instructores activos',
      value: stats.activeInstructors.toString(),
      detail: 'Registrados en la plataforma',
      tone: 'success',
    },
    {
      id: 'alertas',
      label: 'Alertas abiertas',
      value: stats.openAlerts.toString(),
      detail: stats.openAlerts > 0 ? `${stats.openAlerts} con correcciones` : 'Sin observaciones pendientes',
      tone: stats.openAlerts > 0 ? 'alert' : 'success',
    },
  ]

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
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={fetchDashboardData} className="button button--ghost text-xs py-1.5 px-3">
              🔄 Actualizar
            </button>
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
                ? 'bg-amber-100 text-amber-700 font-bold'
                : 'bg-rose-100 text-rose-700 font-bold'

          return (
            <article key={item.id} className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
              <p className="text-sm text-slate-500">{item.label}</p>
              <strong className="mt-2 block text-3xl font-semibold text-slate-900">
                {isLoading ? '...' : item.value}
              </strong>
              <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-medium ${toneClasses}`}>
                {item.tone === 'success' ? 'Óptimo' : item.tone === 'warning' ? 'Revisión Requerida' : 'Atención'}
              </span>
            </article>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Actividad reciente</h3>
            <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600">Reciente</span>
          </div>
          {isLoading ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">Cargando actividad...</div>
          ) : recentActivities.length === 0 ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">
              Sin actividad reciente registrada.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 text-sm">{activity.name}</strong>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">{activity.state}</span>
                    <span className="text-emerald-700">{activity.progress}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: activity.progress }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <h3 className="text-lg font-semibold text-slate-900">Acciones prioritarias</h3>
          {isLoading ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">Cargando acciones...</div>
          ) : priorities.length === 0 ? (
            <div className="mt-4 rounded-2xl p-4 text-sm bg-slate-50 text-slate-500">
              Sin acciones prioritarias pendientes.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {priorities.map((priority, i) => (
                <li key={i} className="rounded-2xl px-3.5 py-2.5 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-900">
                  📌 {priority}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3 bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-slate-500">Informes Totales</p>
              <strong className="mt-1 block text-xl text-emerald-700">
                {stats.pendingReports + stats.openAlerts}
              </strong>
            </div>
            <div className="rounded-2xl p-3 bg-sky-50 border border-sky-100">
              <p className="text-sm text-slate-500">Instructores</p>
              <strong className="mt-1 block text-xl text-sky-700">{stats.activeInstructors}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
