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

const pageComponents: Record<PageKey, ReactElement> = {
  dashboard: <Dashboard />,
  informes: <RevisarInformes />,
  instructores: <Instructores />,
  historial: <Historial />,
  reportes: <Reportes />,
  perfil: <Perfil />,
}

interface CoordinadorAppProps {
  onLogout: () => void
}

export function CoordinadorApp({ onLogout }: CoordinadorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  const handleSelectPage = (page: string) => {
    setActivePage(page as PageKey)
  }

  return (
    <div className="instructor-layout">
      <Navegacion active={activePage} onSelect={handleSelectPage} onLogout={onLogout} />
      <main className="instructor-main">{pageComponents[activePage]}</main>
    </div>
  )
}
