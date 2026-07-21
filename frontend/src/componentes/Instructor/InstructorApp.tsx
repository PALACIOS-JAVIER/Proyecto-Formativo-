import { useState } from 'react'
import type { ReactElement } from 'react'
import { Navegacion } from './Navegacion/Navegacion'
import { Dashboard } from './GraficaIndicadores/Dashboard/Dashboard'
import { CargarInforme } from './CargarInforme/CargarInforme'
import { Informes } from './Informes/Informes'
import { AsistenteAI } from './AsistenteIA/AsistenteAI'
import { Perfil } from './Perfil/Perfil'
import { Notificaciones } from './Notificaciones/Notificaciones'
import { Indicadores } from './GraficaIndicadores/Indicadores'

type PageKey = 'dashboard' | 'subir' | 'informes' | 'indicadores' | 'notificaciones' | 'perfil' | 'asistente'

interface InstructorAppProps {
  onLogout: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function InstructorApp({ onLogout, theme, onToggleTheme }: InstructorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  const pageComponents: Record<PageKey, ReactElement> = {
    dashboard: <Dashboard theme={theme} />,
    subir: <CargarInforme />,
    informes: <Informes />,
    indicadores: <Indicadores />,
    notificaciones: <Notificaciones />,
    perfil: <Perfil />,
    asistente: <AsistenteAI />,
  }

  return (
    <div className={`flex min-h-screen flex-col lg:flex-row ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      <Navegacion active={activePage} onSelect={setActivePage} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
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
