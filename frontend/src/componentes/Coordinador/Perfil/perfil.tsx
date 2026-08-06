import type { ReactElement } from 'react'
import { useState } from 'react'

export function Perfil(): ReactElement {
  const [profile, setProfile] = useState({
    nombre: 'Diana López',
    cargo: 'Coordinadora académica',
    email: 'diana.lopez@sena.edu.co',
    telefono: '300 123 4567',
    centro: 'Centro Agropecuario y Desarrollo Empresarial de Formación',
    regional: 'Huila'
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!profile.email.toLowerCase().trim().endsWith('@sena.edu.co')) {
      alert('El correo debe pertenecer al dominio institucional (@sena.edu.co).')
      return
    }
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
    }, 800)
  }

  return (
    <section className="page-panel perfil-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Perfil</p>
          <h1>Configuración de Cuenta</h1>
          <p className="subtext">Gestiona tu información personal y los datos de contacto.</p>
        </div>
      </header>

      <div className="perfil-form">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-border pb-4">
          <h2 className="!mb-0 text-xl font-bold text-foreground">Información Personal</h2>
          <button 
            type="button" 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
              isEditing 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5' 
                : 'bg-bg-alt border-2 border-border text-foreground hover:bg-border hover:border-emerald-500/30 hover:-translate-y-0.5'
            }`}
          >
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
          </button>
        </div>

        <div className="perfil-grid">
          <div className="foto-field mb-4">
            <span className="font-semibold text-text-secondary text-sm">Foto de Perfil</span>
            <div className="flex items-center gap-6 mt-1">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-sky-400/20 text-emerald-600 flex items-center justify-center text-3xl font-bold border-2 border-emerald-500/30 shadow-inner">
                {profile.nombre.charAt(0)}
              </div>
              {isEditing && (
                <button type="button" className="text-sm px-4 py-2 bg-bg-alt border-2 border-border rounded-xl font-medium text-text-secondary hover:text-foreground hover:border-sky-500 transition-colors shadow-sm">
                  Cambiar foto
                </button>
              )}
            </div>
          </div>

          <label>
            <span className="font-semibold text-text-secondary mb-1">Nombre Completo</span>
            <input 
              type="text" 
              name="nombre"
              value={profile.nombre} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary mb-1">Cargo</span>
            <input 
              type="text" 
              name="cargo"
              value={profile.cargo} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary mb-1">Correo Electrónico</span>
            <input 
              type="email" 
              pattern=".*@sena\.edu\.co$"
              title="El correo debe terminar en @sena.edu.co"
              placeholder="ejemplo@sena.edu.co"
              name="email"
              value={profile.email} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary mb-1">Teléfono</span>
            <input 
              type="tel" 
              name="telefono"
              value={profile.telefono} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>
          
          <label className="full-width">
            <span className="font-semibold text-text-secondary mb-1">Centro de Formación</span>
            <input 
              type="text" 
              name="centro"
              value={profile.centro} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>

          <label className="full-width">
            <span className="font-semibold text-text-secondary mb-1">Regional</span>
            <input 
              type="text" 
              name="regional"
              value={profile.regional} 
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full text-foreground ${!isEditing ? 'opacity-70 bg-bg-alt/40 cursor-not-allowed border-transparent' : 'bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm'}`}
            />
          </label>
        </div>
      </div>
    </section>
  )
}
