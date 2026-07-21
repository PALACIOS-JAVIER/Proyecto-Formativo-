import type { ReactElement } from 'react'

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps): ReactElement {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
        isDark
          ? 'border-slate-700 bg-slate-800/70 text-slate-100 hover:border-emerald-500/60 hover:bg-slate-700/70'
          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-400 hover:bg-slate-50'
      }`}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}
