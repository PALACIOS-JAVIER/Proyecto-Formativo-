import type { ReactElement } from 'react'
import { FiPieChart, FiFileText, FiUsers, FiClock, FiTrendingUp, FiSettings } from 'react-icons/fi'

interface Props {
  active: string
  onSelect: (page: string) => void
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

export function Navegacion({ active, onSelect, onLogout, isOpen, onClose }: Props): ReactElement {
  const items = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Resumen general', icon: <FiPieChart /> },
    { id: 'informes', label: 'Revisar informes', hint: 'Por aprobar', icon: <FiFileText /> },
    { id: 'instructores', label: 'Instructores', hint: 'Equipo activo', icon: <FiUsers /> },
    { id: 'historial', label: 'Historial', hint: 'Bitácora', icon: <FiClock /> },
    { id: 'reportes', label: 'Reportes', hint: 'Indicadores', icon: <FiTrendingUp /> },
    { id: 'perfil', label: 'Perfil', hint: 'Datos del cargo', icon: <FiSettings /> },
  ]

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
          <img src="/Sena.png" alt="SENA logo" className="h-11 w-11 rounded-xl object-contain bg-white" />
          <div>
            <div className="text-lg font-bold text-[#00304D]">SITMI</div>
            <div className="text-sm text-[#475569]">Coordinador</div>
          </div>
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
                    ? 'bg-[#39A900] text-white shadow-md shadow-[#39A900]/20'
                    : 'text-[#475569] hover:bg-[#F6F6F6] hover:text-[#00304D]'
                }`}
                onClick={() => {
                  onSelect(item.id)
                  onClose()
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  <span className={`text-sm ${isActive ? 'text-white/80' : 'text-[#64748b]'}`}>{item.hint}</span>
                </span>
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
