import React, { useEffect, useState } from 'react'
import { FaApple } from 'react-icons/fa'

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
  id_especialidad?: string
  id_objeto?: string
  id_area_db?: string // Needed to fetch especialidades and objetos filtered by Area
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
        id_especialidad: u.especialidad?.id_especialidad?.toString() || u.id_especialidad?.toString() || '',
        id_objeto: u.objetoContractual?.id_objeto?.toString() || u.id_objeto?.toString() || '',
        id_area_db: u.area?.id_area?.toString() || u.id_area?.toString() || '',
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
    id_especialidad: '',
    id_objeto: '',
    id_area_db: '',
  }
}

export function Perfil({ initialData, onSave }: PerfilProps) {
  const [data, setData] = useState<ProfileData>(() => initialData ?? loadSessionUserData())
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(data.fotoPerfil)
  const [firmaPreview, setFirmaPreview] = useState<string | undefined>(data.firma)
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(''), 4000)
  }

  const [especialidadesList, setEspecialidadesList] = useState<any[]>([])
  const [objetosList, setObjetosList] = useState<any[]>([])
  const [lockedEspecialidad, setLockedEspecialidad] = useState(false)
  const [lockedObjeto, setLockedObjeto] = useState(false)

  // Crop states
  const [imageSrcToCrop, setImageSrcToCrop] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = React.useRef<HTMLImageElement | null>(null)

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
        objetoContrato: u.objetoContractual?.descripcion || u.objetoContrato || '',
        fotoPerfil: u.fotoPerfil || '',
        firma: u.firma || '',
        id_especialidad: u.especialidad?.id_especialidad?.toString() || '',
        id_objeto: u.objetoContractual?.id_objeto?.toString() || '',
        id_area_db: u.area?.id_area?.toString() || '',
      }
      setData(loaded)
      if (u.especialidad) setLockedEspecialidad(true)
      if (u.objetoContractual) setLockedObjeto(true)
      if (u.fotoPerfil) setPreview(u.fotoPerfil.startsWith('http') ? u.fotoPerfil : `/${u.fotoPerfil}`)
      if (u.firma) setFirmaPreview(u.firma.startsWith('http') ? u.firma : `/${u.firma}`)
    }

    const fetchProfile = async () => {
      try {
        if (userId && userId > 0) {
          const res = await fetch(`/api/usuarios/${userId}`)
          if (res.ok) {
            const u = await res.json()
            mapUserData(u)
            return
          }
        }

        if (userEmail) {
          const res = await fetch(`/api/usuarios`)
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
    if (data.id_area_db) {
      Promise.all([
        fetch(`/api/especialidades?id_area=${data.id_area_db}`).then(r => r.json()),
        fetch(`/api/objeto-contractual?id_area=${data.id_area_db}`).then(r => r.json())
      ]).then(([e, o]) => {
        setEspecialidadesList(e)
        setObjetosList(o)
      }).catch(console.error)
    }
  }, [data.id_area_db])

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

  const handleCropFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrcToCrop(reader.result as string)
        setZoom(1)
        setOffset({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    })
  }

  const handleCropSave = () => {
    if (!imgRef.current || !imageSrcToCrop) return

    const img = imgRef.current
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const renderedWidth = img.width
    const renderedHeight = img.height
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    const imgLeft = 150 + offset.x - (renderedWidth * zoom) / 2
    const imgTop = 150 + offset.y - (renderedHeight * zoom) / 2

    const rx = 50 - imgLeft
    const ry = 50 - imgTop

    const scaleFactorX = naturalWidth / (renderedWidth * zoom)
    const scaleFactorY = naturalHeight / (renderedHeight * zoom)

    const sx = rx * scaleFactorX
    const sy = ry * scaleFactorY
    const sWidth = 200 * scaleFactorX
    const sHeight = 200 * scaleFactorY

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 200, 200)

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'foto_perfil.png', { type: 'image/png' })
        setFotoFile(croppedFile)
        setImageSrcToCrop(null)
      }
    }, 'image/png')
  }

  const handleChange = (k: keyof ProfileData, v: string) => {
    setData((curr) => ({ ...curr, [k]: v } as ProfileData))
  }

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (data.correo && !data.correo.toLowerCase().trim().endsWith('@sena.edu.co')) {
      showToast('El correo debe pertenecer al dominio institucional (@sena.edu.co)', 'error')
      return
    }
    setIsSaving(true)
    setSaveError('')
    const userId = getUserIdFromSession()

    try {
      const payload: Record<string, any> = {
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: Number(data.telefono) || 0,
        correo: data.correo,
        codigoContrato: data.codigoContrato,
        codigoSiif: Number(data.codigoSiif) || 0,
        fechaInicioContrato: data.fechaInicioContrato || null,
        fechaFinContrato: data.fechaFinContrato || null,
      }
      if (data.id_especialidad) payload.id_especialidad = Number(data.id_especialidad)
      if (data.id_objeto) payload.id_objeto = Number(data.id_objeto)

      if (userId) {
        const response = await fetch(`/api/usuarios/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          showToast('Error al guardar los datos en la base de datos.', 'error')
          throw new Error('Error al guardar los datos en la base de datos.')
        }

        // Upload foto if selected
        if (fotoFile) {
          const formData = new FormData()
          formData.append('file', fotoFile)
          await fetch(`/api/usuarios/${userId}/foto`, {
            method: 'PATCH',
            body: formData,
          })
        }

        // Upload firma if selected
        if (firmaFile) {
          const formData = new FormData()
          formData.append('file', firmaFile)
          await fetch(`/api/usuarios/${userId}/firma`, {
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
      showToast('Perfil actualizado correctamente', 'success')
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

  const handleDownloadFirma = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firmaPreview) return;
    try {
      const response = await fetch(firmaPreview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'firma_digital.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading signature:', error);
      showToast('Error al descargar la firma', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      showToast("Las contraseñas no coinciden", 'error')
      return
    }
    if (newPassword.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", 'error')
      return
    }
    try {
      setIsUpdatingPassword(true)
      const userId = getUserIdFromSession()
      if (!userId) throw new Error("ID de usuario no encontrado")

      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) throw new Error("Error al actualizar contraseña")
      showToast("Contraseña actualizada exitosamente", 'success')
      setShowSettings(false)
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      console.error(err)
      showToast("Ocurrió un error al actualizar la contraseña", 'error')
    } finally {
      setIsUpdatingPassword(false)
    }
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
        <div className="flex items-center gap-4">
          <div className="text-xs text-secondary max-w-xs text-right hidden sm:block">
            🔒 Los campos Cédula, Rol y Área están protegidos. Puedes editar y guardar los demás datos.
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors bg-white border border-border shadow-sm text-slate-600"
            title="Ajustes de cuenta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
          Cargando datos del perfil desde la base de datos...
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
            <input type="email" pattern=".*@sena\.edu\.co$" title="El correo debe terminar en @sena.edu.co" placeholder="ejemplo@sena.edu.co" value={data.correo} onChange={(e) => handleChange('correo', e.target.value)} disabled={isFieldDisabled('correo')} />
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
            <span className="font-medium text-xs text-secondary uppercase">Especialidad {lockedEspecialidad && "(Guardada - No editable)"}</span>
            <select
              value={data.id_especialidad || ''}
              onChange={(e) => handleChange('id_especialidad', e.target.value)}
              disabled={lockedEspecialidad || isFieldDisabled('id_especialidad' as keyof ProfileData)}
              className="w-full p-3 border border-border rounded-xl bg-white focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Seleccione su especialidad</option>
              {especialidadesList.map((e: any) => (
                <option key={e.id_especialidad} value={e.id_especialidad.toString()}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="full-width">
            <span className="font-medium text-xs text-secondary uppercase">Objeto del contrato {lockedObjeto && "(Guardado - No editable)"}</span>
            <select
              value={data.id_objeto || ''}
              onChange={(e) => handleChange('id_objeto', e.target.value)}
              disabled={lockedObjeto || isFieldDisabled('id_objeto' as keyof ProfileData)}
              className="w-full p-3 border border-border rounded-xl bg-white focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">Seleccione el objeto contractual</option>
              {objetosList.map((o: any) => (
                <option key={o.id_objeto} value={o.id_objeto.toString()} title={o.descripcion}>
                  {o.descripcion}
                </option>
              ))}
            </select>
          </label>

          <label className="foto-field">
            <span className="font-medium text-xs text-secondary uppercase">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCropFileChange}
              className="mb-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            {preview ? <img src={preview} alt="preview" className="rounded-2xl max-h-36 object-cover border border-border" /> : null}
          </label>

          {/* Modal para recortar foto de perfil */}
          {imageSrcToCrop && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-slate-900 border border-slate-100">
                <h3 className="text-base font-bold text-center text-slate-800">Ajusta tu foto de perfil</h3>
                <p className="text-[11px] text-slate-500 text-center -mt-2 leading-normal">
                  Arrastra la imagen y usa la barra inferior para ajustar el tamaño dentro del círculo.
                </p>
                
                {/* Contenedor del recorte */}
                <div 
                  className="relative w-[300px] h-[300px] bg-slate-950 overflow-hidden cursor-move border border-slate-200 rounded-2xl shadow-inner select-none touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <img
                    ref={imgRef}
                    src={imageSrcToCrop}
                    alt="A recortar"
                    draggable={false}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                  {/* Máscara circular */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
                      borderRadius: '50%',
                      width: '200px',
                      height: '200px',
                      left: '50px',
                      top: '50px',
                      border: '2px dashed rgba(255, 255, 255, 0.8)'
                    }}
                  />
                </div>

                {/* Control deslizante de zoom */}
                <div className="w-full flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Acercamiento</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-2.5 w-full mt-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
                    onClick={() => setImageSrcToCrop(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    onClick={handleCropSave}
                  >
                    Recortar y Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          <label className="foto-field">
            <span className="font-medium text-xs text-secondary uppercase">Firma digital</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFirmaFile(f)
              }}
            />
            {firmaPreview ? (
              <div className="flex flex-col items-start gap-2 mt-2">
                <img src={firmaPreview} alt="firma preview" className="max-h-32 object-contain rounded-xl border border-border p-2 bg-white shadow-sm" />
                <a 
                  href={firmaPreview} 
                  download="firma_digital.png"
                  onClick={handleDownloadFirma}
                  className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar Firma
                </a>
              </div>
            ) : null}
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSaving} className="button button--primary px-8 py-3 rounded-2xl font-bold shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving ? 'Guardando en BD...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {showSettings ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-bg-card border border-border p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Seguridad y Ajustes
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-secondary hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
              <p className="text-sm text-secondary">Cambiar la contraseña de acceso a tu cuenta.</p>
              
              <label className="block">
                <span className="text-xs font-semibold text-secondary uppercase block mb-1">Nueva contraseña</span>
                <input 
                  type="password" 
                  className="w-full p-3 border border-border rounded-xl bg-white" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-secondary uppercase block mb-1">Confirmar nueva contraseña</span>
                <input 
                  type="password" 
                  className="w-full p-3 border border-border rounded-xl bg-white" 
                  value={confirmNewPassword} 
                  onChange={e => setConfirmNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                  placeholder="Confirma la contraseña"
                />
              </label>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isUpdatingPassword} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-white p-4 pr-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={toastType === 'success' ? "text-emerald-500 text-3xl" : "text-rose-500 text-3xl"}>
            <FaApple />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-slate-800">Sistema</h4>
            <p className="text-xs font-medium text-slate-500">{toastMessage}</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}
