import type { ReactElement } from 'react'

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
}

export function Navegacion({ active, onSelect, onLogout }: NavegacionProps): ReactElement {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/Sena.png" alt="SITMI logo" className="brand-image" />
        <div className="brand-text">
          <div className="brand-title">SITMI</div>
          <div className="brand-subtitle">Instructor</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${active === item.id ? 'nav-link--active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="logout-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
