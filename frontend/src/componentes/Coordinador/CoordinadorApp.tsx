import { useState } from 'react'
import type { ReactElement } from 'react'
import { Navegacion } from './Navegacion/navegacion'
import { Dashboard } from './Dashboard/dashboard'
import { RevisarInformes } from './Revisarinforme/RevisarInformes'
import Instructores from './Instructores/instructores'
import type { InstructorProfile } from '../../App'
import { Historial } from './Historial/historial'
import { Reportes } from './Reportes/reportes'
import { Perfil } from './Perfil/perfil'
import { BroadcastModal } from './BroadcastModal'

type PageKey = 'dashboard' | 'informes' | 'instructores' | 'historial' | 'reportes' | 'perfil'

interface CoordinadorAppProps {
  onLogout: () => void
  instructors: InstructorProfile[]
  onUpdateInstructor: (id: number, changes: Partial<InstructorProfile>) => void
  onCreateSupportStaff: (support: Omit<InstructorProfile, 'id' | 'status' | 'canEdit' | 'source'> & { contraseña?: string }) => void
  onDeleteInstructor: (id: number) => void
  instructorEditAllowed: boolean
  onToggleInstructorEditPermission: (value: boolean) => void
  isSupportStaff?: boolean
}

export function CoordinadorApp({
  onLogout,
  instructors,
  onUpdateInstructor,
  onCreateSupportStaff,
  onDeleteInstructor,
  instructorEditAllowed,
  onToggleInstructorEditPermission,
  isSupportStaff = false,
}: CoordinadorAppProps): ReactElement {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)

  const handleSelectPage = (page: string) => {
    setActivePage(page as PageKey)
  }

  const pageComponents: Record<PageKey, ReactElement> = {
    dashboard: <Dashboard />,
    informes: <RevisarInformes />,
    instructores: (
      <Instructores
        instructors={instructors}
        onUpdateInstructor={onUpdateInstructor}
        onCreateSupportStaff={onCreateSupportStaff}
        onDeleteInstructor={onDeleteInstructor}
        instructorEditAllowed={instructorEditAllowed}
        onToggleInstructorEditPermission={onToggleInstructorEditPermission}
        isSupportStaff={isSupportStaff}
      />
    ),
    historial: <Historial />,
    reportes: <Reportes />,
    perfil: <Perfil />,
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#F6F6F6] text-[#00304D] relative">
      
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Navegacion active={activePage} onSelect={handleSelectPage} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        {/* Cabecera Móvil */}
        <header className="flex items-center justify-between bg-white px-4 py-3 border-b border-[#00304D]/10 lg:hidden shadow-sm shrink-0">
          <div className="font-bold text-[#00304D]">SITMI</div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#00304D]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-transparent">
          {pageComponents[activePage]}
        </main>
      </div>

      {/* Floating Action Button for Broadcast */}
      <button
        onClick={() => setIsBroadcastOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200"
        title="Enviar aviso general a instructores"
      >
        <span className="text-2xl">📢</span>
      </button>

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <BroadcastModal onClose={() => setIsBroadcastOpen(false)} />
      )}
    </div>
  )
}
