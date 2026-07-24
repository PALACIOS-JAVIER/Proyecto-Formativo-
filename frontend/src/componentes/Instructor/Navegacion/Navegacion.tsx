import type { ReactElement } from 'react'
import sitmiLogo from '../../../assets/Imagenes_Login/Sena.png'

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
  isOpen: boolean
  onClose: () => void
}

export function Navegacion({ active, onSelect, onLogout, isOpen, onClose }: NavegacionProps): ReactElement {

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#00304D]/10 bg-white shadow-sm transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex items-center justify-between lg:hidden mb-6">
          <span className="font-bold text-[#00304D]">Menú</span>
          <button onClick={onClose} className="p-1 text-[#00304D]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#00304D]/10 bg-[#F6F6F6] px-3 py-3">
          <img src={sitmiLogo} alt="SENA logo" className="h-11 w-11 rounded-xl object-contain bg-white" />
          <div>
            <div className="text-lg font-bold text-[#00304D]">SITMI</div>
            <div className="text-sm text-[#475569]">Instructor</div>
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
                    ? 'bg-[#39A900] text-white shadow-md shadow-[#39A900]/20'
                    : 'text-[#475569] hover:bg-[#F6F6F6] hover:text-[#00304D]'
                }`}
                onClick={() => {
                  onSelect(item.id)
                  onClose()
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-5 pb-6">
        <button
          type="button"
          className="w-full rounded-2xl border border-[#00304D]/10 bg-[#F6F6F6] px-3 py-3 text-sm font-bold text-[#00304D] transition hover:bg-red-500 hover:text-white hover:border-red-500"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
