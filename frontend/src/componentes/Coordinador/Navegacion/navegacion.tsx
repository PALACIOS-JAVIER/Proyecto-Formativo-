import type { ReactElement } from 'react'
import { ThemeToggle } from '../../common/ThemeToggle'

interface Props {
  active: string
  onSelect: (page: string) => void
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Navegacion({ active, onSelect, onLogout, theme, onToggleTheme }: Props): ReactElement {
  const items = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Resumen general', icon: '📊' },
    { id: 'informes', label: 'Revisar informes', hint: 'Por aprobar', icon: '🧾' },
    { id: 'instructores', label: 'Instructores', hint: 'Equipo activo', icon: '👥' },
    { id: 'historial', label: 'Historial', hint: 'Bitácora', icon: '🕘' },
    { id: 'reportes', label: 'Reportes', hint: 'Indicadores', icon: '📈' },
    { id: 'perfil', label: 'Perfil', hint: 'Datos del cargo', icon: '⚙️' },
  ]

  const isDark = theme === 'dark'

  return (
    <aside className={`sticky top-0 flex w-full flex-col justify-between border-b px-5 py-6 backdrop-blur-sm lg:h-screen lg:w-72 lg:border-b-0 lg:border-r ${isDark ? 'border-slate-800 bg-slate-950/95 text-slate-100' : 'border-slate-200 bg-white text-slate-800 shadow-sm'}`}>
      <div>
        <div className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
          <img src="/Sena.png" alt="SITMI logo" className="h-11 w-11 rounded-xl object-cover" />
          <div>
            <div className="text-lg font-semibold">SITMI</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Coordinador</div>
          </div>
        </div>

        <div className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-400/20 bg-emerald-50'}`}>
          <p className={`text-[11px] uppercase tracking-[0.25em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Operación</p>
          <strong className="mt-1 block text-base">Seguimiento en tiempo real</strong>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>En línea</span>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {items.map((item) => {
            const isActive = active === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'bg-emerald-100 text-emerald-700'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => onSelect(item.id)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.hint}</span>
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          className={`w-full rounded-2xl border px-3 py-3 text-sm font-semibold transition ${isDark ? 'border-slate-800 bg-slate-900/70 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
