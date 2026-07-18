import type { ReactElement } from 'react'

interface Props {
  active: string
  onSelect: (page: string) => void
  onLogout: () => void
}

export function Navegacion({ active, onSelect, onLogout }: Props): ReactElement {
  const items = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Resumen general', icon: '📊' },
    { id: 'informes', label: 'Revisar informes', hint: 'Por aprobar', icon: '🧾' },
    { id: 'instructores', label: 'Instructores', hint: 'Equipo activo', icon: '👥' },
    { id: 'historial', label: 'Historial', hint: 'Bitácora', icon: '🕘' },
    { id: 'reportes', label: 'Reportes', hint: 'Indicadores', icon: '📈' },
    { id: 'perfil', label: 'Perfil', hint: 'Datos del cargo', icon: '⚙️' },
  ]

  return (
    <aside className="sidebar coordinator-sidebar">
      <div>
        <div className="sidebar-brand">
          <img src="/Sena.png" alt="SITMI logo" className="brand-image" />
          <div className="brand-text">
            <div className="brand-title">SITMI</div>
            <div className="brand-subtitle">Coordinador</div>
          </div>
        </div>

        <div className="sidebar-summary">
          <p className="eyebrow">Operación</p>
          <strong>Seguimiento en tiempo real</strong>
          <span className="sidebar-pill">En línea</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${active === item.id ? 'nav-link--active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-hint">{item.hint}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="logout-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
