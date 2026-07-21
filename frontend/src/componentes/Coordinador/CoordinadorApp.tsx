import { useState } from 'react'
import type { ReactElement } from 'react'
import { Navegacion } from './Navegacion/navegacion'
import { Dashboard } from './Dashboard/dashboard'
import { RevisarInformes } from './Revisarinforme/RevisarInformes'
import { Instructores } from './Instructores/instructores'
import { Historial } from './Historial/historial'
import { Reportes } from './Reportes/reportes'
import { Perfil } from './Perfil/perfil'

type PageKey = 'dashboard' | 'informes' | 'instructores' | 'historial' | 'reportes' | 'perfil'

interface CoordinadorAppProps {
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function CoordinadorApp({ onLogout, theme, onToggleTheme }: CoordinadorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  const handleSelectPage = (page: string) => {
    setActivePage(page as PageKey)
  }

  const pageComponents: Record<PageKey, ReactElement> = {
    dashboard: <Dashboard theme={theme} />,
    informes: <RevisarInformes />,
    instructores: <Instructores />,
    historial: <Historial />,
    reportes: <Reportes />,
    perfil: <Perfil />,
  }

  return (
    <div className={`flex min-h-screen flex-col lg:flex-row ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <Navegacion active={activePage} onSelect={handleSelectPage} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
      <main
        className={`flex-1 overflow-y-auto px-4 py-6 md:px-8 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)]'
            : 'bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefcf6_100%)]'
        }`}
      >
        {pageComponents[activePage]}
      </main>
    </div>
  )
}
