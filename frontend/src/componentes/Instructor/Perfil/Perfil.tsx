import React, { useEffect, useState } from 'react'

export interface ProfileData {
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  rol: string
  sede: string
  area: string
  codigoContrato: string
  codigoSiif: string
  fechaInicioContrato: string
  fechaFinContrato: string
  objetoContrato?: string
  fotoPerfil?: string
  firma?: string
}

interface PerfilProps {
  initialData?: ProfileData
  onSave?: (data: ProfileData) => void
  canEditProfile?: boolean
}

const getUserIdFromSession = (): number | null => {
  try {
    const raw = localStorage.getItem('user_data')
    if (raw) {
      const u = JSON.parse(raw)
      return u.id || null
    }
  } catch (e) {
    console.error('Error reading user_data from localStorage:', e)
  }
  return null
}

const loadSessionUserData = (): ProfileData => {
  try {
    const raw = localStorage.getItem('user_data')
    if (raw) {
      const u = JSON.parse(raw)
      const parts = (u.nombre || '').trim().split(' ')
      const nombre = parts[0] || u.nombre || ''
      const apellido = parts.slice(1).join(' ') || u.apellido || ''

      return {
        nombre,
        apellido,
        cedula: u.cedula?.toString() || '',
        telefono: u.telefono?.toString() || '',
        correo: u.correo || '',
        rol: u.rol || 'campesena',
        sede: u.sede || 'Yamboro',
        area: u.area || 'General',
        codigoContrato: u.codigoContrato || '',
        codigoSiif: u.codigoSiif?.toString() || '',
        fechaInicioContrato: u.fechaInicioContrato || '',
        fechaFinContrato: u.fechaFinContrato || '',
        objetoContrato: u.objetoContrato || '',
        fotoPerfil: u.fotoPerfil || '',
        firma: u.firma || '',
      }
    }
  } catch (e) {
    console.error('Error loading user session data for profile:', e)
  }
  return {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    rol: 'campesena',
    sede: 'Yamboro',
    area: '',
    codigoContrato: '',
    codigoSiif: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
    objetoContrato: '',
  }
}

export function Perfil({ initialData, onSave }: PerfilProps) {
  const [data, setData] = useState<ProfileData>(() => initialData ?? loadSessionUserData())
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(data.fotoPerfil)
  const [firmaPreview, setFirmaPreview] = useState<string | undefined>(data.firma)
  const [savedAlert, setSavedAlert] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load profile directly from Backend DB on mount (with ID & email fallback)
  useEffect(() => {
    let userId = getUserIdFromSession()
    const rawUser = localStorage.getItem('user_data')
    const userSession = rawUser ? JSON.parse(rawUser) : null
    const userEmail = userSession?.correo

    setIsLoading(true)

    const mapUserData = (u: any) => {
      const parts = (u.nombre || '').trim().split(' ')
      const nombre = parts[0] || u.nombre || ''
      const apellido = u.apellido || parts.slice(1).join(' ') || ''

      const loaded: ProfileData = {
        nombre,
        apellido,
        cedula: u.cedula !== undefined && u.cedula !== null ? u.cedula.toString() : '',
        telefono: u.telefono !== undefined && u.telefono !== null ? u.telefono.toString() : '',
        correo: u.correo || '',
        rol: typeof u.rol === 'object' && u.rol ? u.rol.nombre : (u.rol || 'campesena'),
        sede: typeof u.sede === 'object' && u.sede ? u.sede.nombre : (u.sede || 'Yamboro'),
        area: typeof u.area === 'object' && u.area ? u.area.nombre : (u.area || 'General'),
        codigoContrato: u.codigoContrato || '',
        codigoSiif: u.codigoSiif !== undefined && u.codigoSiif !== null ? u.codigoSiif.toString() : '',
        fechaInicioContrato: u.fechaInicioContrato ? u.fechaInicioContrato.split('T')[0] : '',
        fechaFinContrato: u.fechaFinContrato ? u.fechaFinContrato.split('T')[0] : '',
        objetoContrato: u.objetoContrato || '',
        fotoPerfil: u.fotoPerfil || '',
        firma: u.firma || '',
      }
      setData(loaded)
      if (u.fotoPerfil) setPreview(u.fotoPerfil.startsWith('http') ? u.fotoPerfil : `http://localhost:3000/${u.fotoPerfil}`)
      if (u.firma) setFirmaPreview(u.firma.startsWith('http') ? u.firma : `http://localhost:3000/${u.firma}`)
    }

    const fetchProfile = async () => {
      try {
        if (userId && userId > 0) {
          const res = await fetch(`http://localhost:3000/api/usuarios/${userId}`)
          if (res.ok) {
            const u = await res.json()
            mapUserData(u)
            return
          }
        }

        if (userEmail) {
          const res = await fetch(`http://localhost:3000/api/usuarios`)
          if (res.ok) {
            const list = await res.json()
            const match = list.find((item: any) => item.correo?.toLowerCase().trim() === userEmail.toLowerCase().trim())
            if (match) {
              mapUserData(match)
              if (userSession) {
                userSession.id = match.id_Usuario
                localStorage.setItem('user_data', JSON.stringify(userSession))
              }
              return
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user profile from API:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (fotoFile) {
      const url = URL.createObjectURL(fotoFile)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [fotoFile])

  useEffect(() => {
    if (firmaFile) {
      const url = URL.createObjectURL(firmaFile)
      setFirmaPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [firmaFile])

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      setPreview(initialData.fotoPerfil)
      setFirmaPreview(initialData.firma)
    }
  }, [initialData])

  const handleChange = (k: keyof ProfileData, v: string) => {
    setData((curr) => ({ ...curr, [k]: v } as ProfileData))
  }

  const handleFoto = (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen para la foto de perfil.')
      return
    }
    setFotoFile(f)
  }

  const handleFirma = (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen para la firma.')
      return
    }
    setFirmaFile(f)
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsSaving(true)
    setSaveError('')
    const userId = getUserIdFromSession()

    try {
      const payload: Record<string, any> = {
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        correo: data.correo,
        codigoContrato: data.codigoContrato,
        codigoSiif: data.codigoSiif,
        fechaInicioContrato: data.fechaInicioContrato || null,
        fechaFinContrato: data.fechaFinContrato || null,
        objetoContrato: data.objetoContrato,
      }

      if (userId) {
        const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Error al guardar los datos en la base de datos.')
        }

        // Upload foto if selected
        if (fotoFile) {
          const formData = new FormData()
          formData.append('file', fotoFile)
          await fetch(`http://localhost:3000/api/usuarios/${userId}/foto`, {
            method: 'PATCH',
            body: formData,
          })
        }

        // Upload firma if selected
        if (firmaFile) {
          const formData = new FormData()
          formData.append('file', firmaFile)
          await fetch(`http://localhost:3000/api/usuarios/${userId}/firma`, {
            method: 'PATCH',
            body: formData,
          })
        }

        // Update localStorage
        const raw = localStorage.getItem('user_data')
        if (raw) {
          const u = JSON.parse(raw)
          u.nombre = `${data.nombre} ${data.apellido}`.trim()
          u.correo = data.correo
          localStorage.setItem('user_data', JSON.stringify(u))
        }
      }

      const out = { ...data }
      if (preview) out.fotoPerfil = preview
      if (firmaPreview) out.firma = firmaPreview
      onSave?.(out)

      setSavedAlert(true)
      setTimeout(() => setSavedAlert(false), 3500)
    } catch (err: any) {
      console.error('Error saving profile to backend DB:', err)
      setSaveError(err.message || 'Ocurrió un error al actualizar la base de datos.')
    } finally {
      setIsSaving(false)
    }
  }

  // Cedula, Rol, Area cannot be edited per requirement
  const isFieldDisabled = (field: keyof ProfileData) => {
    if (field === 'cedula' || field === 'rol' || field === 'area') return true
    return false
  }

  const initials = `${(data.nombre[0] || '').toUpperCase()}${(data.apellido[0] || '').toUpperCase()}` || 'IN'

  return (
    <main className="perfil-page">
      <header className="mb-6 rounded-[28px] border border-border bg-bg-card p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden border-2 border-emerald-500">
            {preview ? <img src={preview} alt="Perfil" className="h-full w-full object-cover" /> : initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {data.nombre || 'Mi Perfil'} {data.apellido}
            </h1>
            <p className="text-sm text-secondary">{data.correo || 'Usuario SENA'}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {data.rol || 'Instructor'}
            </span>
          </div>
        </div>
        <div className="text-xs text-secondary max-w-xs text-right">
          🔒 Los campos Cédula, Rol y Área están protegidos. Puedes editar y guardar los demás datos.
        </div>
      </header>

      {isLoading && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
          Cargando datos del perfil desde la base de datos...
        </div>
      )}

      {savedAlert && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✓ Cambios guardados correctamente en la base de datos.
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          ⚠️ {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="perfil-form">
        <h2 className="text-lg font-bold mb-4 text-foreground">Información personal y de contacto</h2>
        <div className="perfil-grid">
          <label>
            <span className="font-medium text-xs text-secondary uppercase">Nombre</span>
            <input value={data.nombre} onChange={(e) => handleChange('nombre', e.target.value)} disabled={isFieldDisabled('nombre')} required />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Apellido</span>
            <input value={data.apellido} onChange={(e) => handleChange('apellido', e.target.value)} disabled={isFieldDisabled('apellido')} required />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Cédula (No editable)</span>
            <input value={data.cedula} disabled className="opacity-70 cursor-not-allowed bg-slate-100" title="La cédula no se puede modificar" />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Teléfono</span>
            <input value={data.telefono} onChange={(e) => handleChange('telefono', e.target.value)} placeholder="Ingresa tu teléfono" />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Correo institucional</span>
            <input type="email" value={data.correo} onChange={(e) => handleChange('correo', e.target.value)} disabled={isFieldDisabled('correo')} />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Rol (No editable)</span>
            <input value={data.rol} disabled className="opacity-70 cursor-not-allowed bg-slate-100 uppercase" title="El rol no se puede modificar" />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Sede</span>
            <input value={data.sede} onChange={(e) => handleChange('sede', e.target.value)} disabled={isFieldDisabled('sede')} />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Área (No editable)</span>
            <input value={data.area} disabled className="opacity-70 cursor-not-allowed bg-slate-100" title="El área no se puede modificar" />
          </label>
        </div>

        <h2 className="text-lg font-bold mt-8 mb-4 text-foreground">Detalles del contrato</h2>
        <div className="perfil-grid">
          <label>
            <span className="font-medium text-xs text-secondary uppercase">Código de contrato</span>
            <input value={data.codigoContrato} onChange={(e) => handleChange('codigoContrato', e.target.value)} disabled={isFieldDisabled('codigoContrato')} placeholder="Ingresa código de contrato" />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Código SIIF</span>
            <input value={data.codigoSiif} onChange={(e) => handleChange('codigoSiif', e.target.value)} disabled={isFieldDisabled('codigoSiif')} placeholder="Ingresa código SIIF" />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Fecha inicio del contrato</span>
            <input type="date" value={data.fechaInicioContrato} onChange={(e) => handleChange('fechaInicioContrato', e.target.value)} disabled={isFieldDisabled('fechaInicioContrato')} />
          </label>

          <label>
            <span className="font-medium text-xs text-secondary uppercase">Fecha fin del contrato</span>
            <input type="date" value={data.fechaFinContrato} onChange={(e) => handleChange('fechaFinContrato', e.target.value)} disabled={isFieldDisabled('fechaFinContrato')} />
          </label>

          <label className="full-width">
            <span className="font-medium text-xs text-secondary uppercase">Objeto del contrato</span>
            <textarea value={data.objetoContrato} onChange={(e) => handleChange('objetoContrato', e.target.value)} disabled={isFieldDisabled('objetoContrato')} placeholder="Ingresa objeto contractual" />
          </label>

          <label className="foto-field">
            <span className="font-medium text-xs text-secondary uppercase">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFoto(f)
              }}
            />
            {preview ? <img src={preview} alt="preview" className="rounded-2xl max-h-36 object-cover" /> : null}
          </label>

          <label className="foto-field">
            <span className="font-medium text-xs text-secondary uppercase">Firma digital</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFirma(f)
              }}
            />
            {firmaPreview ? <img src={firmaPreview} alt="firma preview" className="max-h-32 object-contain rounded-xl border border-border p-2 bg-white" /> : null}
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSaving} className="button button--primary px-8 py-3 rounded-2xl font-bold shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving ? 'Guardando en BD...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </main>
  )
}
