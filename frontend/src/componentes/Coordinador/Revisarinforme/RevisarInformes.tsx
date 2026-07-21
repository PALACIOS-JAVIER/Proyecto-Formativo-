import type { ReactElement } from 'react'

export function RevisarInformes(): ReactElement {
  const informes = [
    { titulo: 'Informe de seguimiento', instructor: 'Instructor A', estado: 'Pendiente', prioridad: 'Alta' },
    { titulo: 'Reporte mensual', instructor: 'Instructor B', estado: 'En revisión', prioridad: 'Media' },
    { titulo: 'Acta de cierre', instructor: 'Instructor C', estado: 'Esperando firma', prioridad: 'Baja' },
  ]

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">Revisar informes</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Gestión de informes pendientes</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Aquí podrás aprobar, rechazar y dar seguimiento a los informes enviados con mayor claridad.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            3 pendientes
          </span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Informes por revisar</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">Hoy</span>
          </div>
          <div className="mt-4 space-y-3">
            {informes.map((informe) => (
              <div key={informe.titulo} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{informe.titulo}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{informe.instructor}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {informe.estado}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Prioridad: {informe.prioridad}</span>
                  <button className="font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300">Ver detalle</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resumen del día</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">2 aprobados hoy</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-500/10">
              <p className="text-sm text-amber-700 dark:text-amber-300">1 requiere corrección</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-500/10">
              <p className="text-sm text-sky-700 dark:text-sky-300">1 en espera de firma</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
