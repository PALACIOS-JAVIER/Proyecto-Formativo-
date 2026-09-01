import { useState } from 'react'
import type { ReactElement } from 'react'
import { Navegacion } from './Navegacion/Navegacion'
import { Dashboard } from './GraficaIndicadores/Dashboard/Dashboard'
import { CargarInforme } from './CargarInforme/CargarInforme'
import { Informes } from './Informes/Informes'
import { Perfil } from './Perfil/Perfil'
import { Notificaciones } from './Notificaciones/Notificaciones'
import { Indicadores } from './GraficaIndicadores/Indicadores'
import { WhatsApp } from './WhatsApp/WhatsApp'
type PageKey = 'dashboard' | 'subir' | 'informes' | 'indicadores' | 'notificaciones' | 'perfil'

interface InstructorAppProps {
  onLogout: () => void
  canEditProfile: boolean
}

export function InstructorApp({ onLogout, canEditProfile }: InstructorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const pageComponents: Record<PageKey, ReactElement> = {
    dashboard: <Dashboard />,
    subir: <CargarInforme />,
    informes: <Informes />,
    indicadores: <Indicadores />,
    notificaciones: <Notificaciones />,
    perfil: <Perfil canEditProfile={canEditProfile} />,
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F6F6F6] text-[#00304D]">
      
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Navegacion active={activePage} onSelect={setActivePage} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Cabecera Móvil */}
        <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-[#00304D]/10 shadow-sm shrink-0">
          <div className="font-bold text-[#00304D] lg:hidden">STIMI</div>
          <div className="hidden lg:flex-1 lg:flex lg:items-center lg:justify-between">
             <div className="text-lg font-semibold text-[#00304D] capitalize">{activePage}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#00304D] lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-transparent">
          {pageComponents[activePage]}
        </main>
      </div>
      <WhatsApp />
    </div>
  )
}
