import { useState } from 'react'
import type { ReactElement } from 'react'
import { Navegacion } from './Navegacion/Navegacion'
import { Dashboard } from './Dashboard/Dashboard'
import { CargarInforme } from './CargarInforme/CargarInforme'
import { Informes } from './Informes/Informes'
import { AsistenteAI } from './AsistenteIA/AsistenteAI'
import { Perfil } from './Perfil/Perfil'
import { Notificaciones } from './Notificaciones/Notificaciones'
import { Indicadores } from './GraficaIndicadores/Indicadores'

type PageKey = 'dashboard' | 'subir' | 'informes' | 'indicadores' | 'notificaciones' | 'perfil' | 'asistente'

const pageComponents: Record<PageKey, ReactElement> = {
  dashboard: <Dashboard />,
  subir: <CargarInforme />,
  informes: <Informes />,
  indicadores: <Indicadores />,
  notificaciones: <Notificaciones />,
  perfil: <Perfil />,
  asistente: <AsistenteAI />,
}

interface InstructorAppProps {
  onLogout: () => void
}

export function InstructorApp({ onLogout }: InstructorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  return (
    <div className="instructor-layout">
      <Navegacion active={activePage} onSelect={setActivePage} onLogout={onLogout} />
      <main className="instructor-main">{pageComponents[activePage]}</main>
    </div>
  )
}
