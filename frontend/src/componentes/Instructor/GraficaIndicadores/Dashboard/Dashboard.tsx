import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

export function Dashboard(): ReactElement {
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_data') || '{}')
    } catch {
      return {}
    }
  })()
  const userName = userData.nombre || 'Instructor'
  const userId = userData.id || userData.id_Usuario

  const [stats, setStats] = useState({
    totalEntregas: 0,
    totalObservaciones: 0,
    cumplimiento: 0,
    topObservaciones: [] as string[],
    pendingCorrections: [] as Array<{ title: string; details: string }>,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCorrections, setExpandedCorrections] = useState<Record<number, boolean>>({})

  const toggleCorrection = (idx: number) => {
    setExpandedCorrections((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const fetchInstructorStats = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token') || ''
      const headers = { 'Authorization': `Bearer ${token}` }

      const [gcRes, gfRes] = await Promise.all([
        fetch(`/api/informes-gc/usuario/${userId}`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`/api/informes-gf/usuario/${userId}`, { headers }).then(r => r.ok ? r.json() : [])
      ])

      const gcList = (gcRes || []).map((r: any) => ({ ...r, tipo: 'GC' }))
      const gfList = (gfRes || []).map((r: any) => ({ ...r, tipo: 'GF' }))
      const allReports = [...gcList, ...gfList]

      const totalEntregas = allReports.length
      const approved = allReports.filter(r => r.estado === 'aprobado' || r.estado === 'success').length
      const cumplimiento = totalEntregas > 0 ? Math.round((approved / totalEntregas) * 100) : 100

      const obsList: string[] = []
      const correctionsList: Array<{ title: string; details: string }> = []

      allReports.forEach(r => {
        if (r.observaciones && r.observaciones.length > 0) {
          r.observaciones.forEach((o: any) => {
            if (o.comentario) obsList.push(`[${r.tipo} ${r.mes} ${r.anio}] "${o.comentario}"`)
          })
        }
        if (r.estado === 'correccion' || r.estado === 'alert') {
          const lastNote = r.observaciones && r.observaciones.length > 0 ? r.observaciones[r.observaciones.length - 1].comentario : ''
          correctionsList.push({
            title: `Informe ${r.tipo} de ${r.mes} ${r.anio}`,
            details: lastNote || 'El coordinador solicitó correcciones.'
          })
        }
      })

      setStats({
        totalEntregas,
        totalObservaciones: obsList.length,
        cumplimiento,
        topObservaciones: obsList,
        pendingCorrections: correctionsList,
      })
    } catch (err) {
      console.error('Error fetching instructor stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructorStats()
  }, [userId])

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border px-6 py-6 shadow-sm border-slate-200 bg-white text-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Hola, {userName}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tu espacio</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Revisa informes y sigue tu trabajo con una vista más clara y organizada.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={fetchInstructorStats} className="button button--ghost text-xs py-1.5 px-3">
              🔄 Actualizar
            </button>
            <span className="rounded-full px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-700">Actualizado</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <p className="text-sm text-slate-500">Cumplimiento</p>
          <strong className="mt-2 block text-3xl font-semibold text-slate-900">
            {isLoading ? '...' : `${stats.cumplimiento}%`}
          </strong>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${stats.cumplimiento}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Porcentaje de entregas válidas sin observaciones.</p>
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <p className="text-sm text-slate-500">Puntualidad</p>
          <strong className="mt-2 block text-3xl font-semibold text-slate-900">100%</strong>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-sky-500" style={{ width: '100%' }} />
          </div>
          <p className="mt-3 text-sm text-slate-600">Informes entregados dentro del plazo.</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white text-slate-900">
          <h3 className="text-lg font-semibold text-slate-900">Próximas entregas</h3>
          {isLoading ? (
            <div className="mt-4 rounded-2xl px-4 py-3 text-sm bg-slate-50 text-slate-500">Cargando...</div>
          ) : stats.pendingCorrections.length > 0 ? (
            <div className="mt-4 space-y-2">
              {stats.pendingCorrections.map((corr, idx) => {
                const isExpanded = !!expandedCorrections[idx];
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleCorrection(idx)}
                    className="cursor-pointer rounded-2xl p-3 text-xs bg-rose-50 border border-rose-200 text-rose-900 font-medium transition-all hover:bg-rose-100/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>⚠️ <strong>Pendiente de reenvío:</strong> {corr.title}</span>
                      <span className="text-[10px] text-rose-600 shrink-0 font-bold">
                        {isExpanded ? '▲ Ocultar' : '▼ Ver observaciones'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 pl-3 border-l border-rose-350 text-rose-800 font-normal whitespace-pre-wrap animate-fadeIn">
                        {corr.details}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl px-4 py-3 text-sm bg-slate-50 text-slate-500">
              Sin entregas pendientes por corregir.
            </div>
          )}
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white/80">
          <h3 className="text-lg font-semibold text-slate-900">Resumen mensual</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl p-3 bg-slate-50">
              <p className="text-slate-500">Entregas</p>
              <strong className="mt-1 block text-xl text-slate-900">
                {isLoading ? '...' : stats.totalEntregas}
              </strong>
            </div>
            <div className="rounded-2xl p-3 bg-slate-50">
              <p className="text-slate-500">Observaciones</p>
              <strong className="mt-1 block text-xl text-rose-700">
                {isLoading ? '...' : stats.totalObservaciones}
              </strong>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border p-5 shadow-sm border-slate-200 bg-white/80">
          <h3 className="text-lg font-semibold text-slate-900">Top observaciones</h3>
          {isLoading ? (
            <div className="mt-4 rounded-2xl px-4 py-3 text-sm bg-slate-50 text-slate-500">Cargando...</div>
          ) : stats.topObservaciones.length === 0 ? (
            <div className="mt-4 rounded-2xl px-4 py-3 text-sm bg-slate-50 text-slate-500">
              Sin observaciones registradas.
            </div>
          ) : (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {stats.topObservaciones.map((obs, idx) => (
                <div key={idx} className="rounded-2xl p-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium leading-relaxed">
                  📝 {obs}
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <aside className={`rounded-[28px] border px-5 py-5 shadow-sm border-slate-200 text-slate-900 ${stats.pendingCorrections.length > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white'}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Entrega pendiente</p>
        <p className="mt-3 text-sm text-slate-700">
          {stats.pendingCorrections.length > 0
            ? `Tienes ${stats.pendingCorrections.length} informe(s) que requieren corrección en "Mis Informes".`
            : 'No hay entregas programadas ni observaciones pendientes por el momento.'}
        </p>
      </aside>
    </section>
  )
}
