import type { ReactElement } from 'react'
import { ThemeToggle } from '../../common/ThemeToggle'

type PageKey = 'dashboard' | 'subir' | 'informes' | 'indicadores' | 'notificaciones' | 'perfil' | 'asistente'

const navigationItems: Array<{ id: PageKey; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'subir', label: 'Subir Informe', icon: '📁' },
  { id: 'informes', label: 'Mis Reportes', icon: '🗂️' },
  { id: 'indicadores', label: 'Indicadores', icon: '📈' },
  { id: 'notificaciones', label: 'Alertas', icon: '🔔' },
  { id: 'perfil', label: 'Perfil', icon: '⚙️' },
  { id: 'asistente', label: 'Asistente IA', icon: '🤖' },
]

interface NavegacionProps {
  active: PageKey
  onSelect: (page: PageKey) => void
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Navegacion({ active, onSelect, onLogout, theme, onToggleTheme }: NavegacionProps): ReactElement {
  const isDark = theme === 'dark'

  return (
    <aside className={`flex w-full flex-col justify-between border-b px-5 py-6 backdrop-blur-sm lg:h-screen lg:w-72 lg:border-b-0 lg:border-r ${isDark ? 'border-slate-800 bg-slate-950/95 text-slate-100' : 'border-slate-200 bg-white/90 text-slate-800'}`}>
      <div>
        <div className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
          <img src="/Sena.png" alt="SITMI logo" className="h-11 w-11 rounded-xl object-cover" />
          <div>
            <div className="text-lg font-semibold">SITMI</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Instructor</div>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {navigationItems.map((item) => {
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
                <span className="font-medium">{item.label}</span>
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
