import React, { useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

export interface CoordinatorProfileData {
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  rol: string
  sede: string
  anio_ejercicio: string
  fotoPerfil?: string
  firma?: string
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

const loadSessionUserData = (): CoordinatorProfileData => {
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
        rol: u.rol || 'Coordinador',
        sede: u.sede || 'Yamboro',
        anio_ejercicio: u.anio_ejercicio?.toString() || new Date().getFullYear().toString(),
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
    rol: 'Coordinador',
    sede: '',
    anio_ejercicio: new Date().getFullYear().toString(),
  }
}

export function Perfil() {
  const [data, setData] = useState<CoordinatorProfileData>(loadSessionUserData())
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(data.fotoPerfil)
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // Crop states
  const [imageSrcToCrop, setImageSrcToCrop] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = React.useRef<HTMLImageElement | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Load profile directly from Backend DB on mount
  useEffect(() => {
    const userId = getUserIdFromSession()
    const rawUser = localStorage.getItem('user_data')
    const userSession = rawUser ? JSON.parse(rawUser) : null
    const userEmail = userSession?.correo

    setIsLoading(true)

    const mapUserData = (u: any) => {
      const parts = (u.nombre || '').trim().split(' ')
      const nombre = parts[0] || u.nombre || ''
      const apellido = u.apellido || parts.slice(1).join(' ') || ''

      const loaded: CoordinatorProfileData = {
        nombre,
        apellido,
        cedula: u.cedula !== undefined && u.cedula !== null ? u.cedula.toString() : '',
        telefono: u.telefono !== undefined && u.telefono !== null ? u.telefono.toString() : '',
        correo: u.correo || '',
        rol: userSession?.rol?.toLowerCase() === 'coordinador' ? 'COORDINADOR ACADÉMICO' : (userSession?.rol?.toLowerCase() === 'apoyo_administrativo' ? 'APOYO ADMINISTRATIVO' : (typeof u.rol === 'object' && u.rol ? u.rol.nombre : (u.rol || 'Coordinador Académico'))),
        sede: typeof u.sede === 'object' && u.sede ? u.sede.nombre : (u.sede || 'Yamboro'),
        anio_ejercicio: u.anio_ejercicio || u.coordinador_data?.anio_ejercicio?.toString() || new Date().getFullYear().toString(),
        fotoPerfil: u.fotoPerfil || '',
        firma: u.firma || '',
      }
      setData(loaded)
      if (u.fotoPerfil) setPreview(u.fotoPerfil.startsWith('http') ? u.fotoPerfil : `/${u.fotoPerfil}`)
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token') || '';
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        if (userId && userId > 0) {
          const res = await fetch(`/api/usuarios/${userId}`, { headers })
          if (res.ok) {
            const u = await res.json()
            mapUserData(u)
            return
          }
        }
        if (userEmail) {
          const res = await fetch(`/api/usuarios`, { headers })
          if (res.ok) {
            const list = await res.json()
            const match = list.find((item: any) => item.correo?.toLowerCase().trim() === userEmail.toLowerCase().trim())
            if (match) {
              mapUserData(match)
              if (userSession) {
                userSession.id = match.id_Usuario
                localStorage.setItem('user_data', JSON.stringify(userSession))
              }
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

  // Crop Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => setIsDragging(false)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y })
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
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

  const handleChange = (k: keyof CoordinatorProfileData, v: string) => {
    setData((curr) => ({ ...curr, [k]: v } as CoordinatorProfileData))
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
      }

      if (userId) {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch(`/api/usuarios/${userId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          showToast('Error al guardar los datos en la base de datos.', 'error')
          throw new Error('Error al guardar los datos en la base de datos.')
        }

        if (fotoFile) {
          const formData = new FormData()
          formData.append('file', fotoFile)
          await fetch(`/api/usuarios/${userId}/foto`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          })
        }

        const raw = localStorage.getItem('user_data')
        if (raw) {
          const u = JSON.parse(raw)
          u.nombre = `${data.nombre} ${data.apellido}`.trim()
          u.correo = data.correo
          localStorage.setItem('user_data', JSON.stringify(u))
        }
      }

      showToast('Perfil actualizado correctamente', 'success')
    } catch (err: any) {
      console.error('Error saving profile to backend DB:', err)
      setSaveError(err.message || 'Ocurrió un error al actualizar la base de datos.')
    } finally {
      setIsSaving(false)
    }
  }

  const isFieldDisabled = (field: keyof CoordinatorProfileData) => {
    if (field === 'cedula' || field === 'rol' || field === 'sede' || field === 'anio_ejercicio') return true
    return false
  }

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

      const token = localStorage.getItem('access_token') || '';
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const initials = `${(data.nombre[0] || '').toUpperCase()}${(data.apellido[0] || '').toUpperCase()}` || 'CO'

  return (
    <section className="page-panel perfil-page">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden border-2 border-emerald-500">
            {preview ? <img src={preview} alt="Perfil" className="h-full w-full object-cover" /> : initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {data.nombre || 'Mi Perfil'} {data.apellido}
            </h1>
            <p className="text-sm text-secondary">{data.correo}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {data.rol}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors bg-white border border-border shadow-sm text-slate-600"
            title="Ajustes de seguridad"
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
          <FiAlertTriangle className="inline-block mr-2" /> {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="perfil-form">
        <h2 className="text-lg font-bold mb-4 text-foreground">Información Personal y de Contacto</h2>
        
        <div className="perfil-grid">
          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Nombre</span>
            <input 
              value={data.nombre} 
              onChange={(e) => handleChange('nombre', e.target.value)} 
              disabled={isFieldDisabled('nombre')} 
              className="w-full text-foreground bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm"
              required 
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Apellido</span>
            <input 
              value={data.apellido} 
              onChange={(e) => handleChange('apellido', e.target.value)} 
              disabled={isFieldDisabled('apellido')} 
              className="w-full text-foreground bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm"
              required 
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Cédula</span>
            <input 
              value={data.cedula} 
              disabled 
              className="w-full text-foreground opacity-70 cursor-not-allowed bg-slate-100" 
              title="La cédula no se puede modificar directamente" 
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Teléfono</span>
            <input 
              value={data.telefono} 
              onChange={(e) => handleChange('telefono', e.target.value)} 
              className="w-full text-foreground bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm"
              placeholder="Ingresa tu teléfono" 
            />
          </label>

          <label className="full-width">
            <span className="font-semibold text-text-secondary text-sm mb-1">Correo Electrónico</span>
            <input 
              type="email" 
              pattern=".*@sena\.edu\.co$" 
              title="El correo debe terminar en @sena.edu.co" 
              placeholder="ejemplo@sena.edu.co" 
              value={data.correo} 
              onChange={(e) => handleChange('correo', e.target.value)} 
              className="w-full text-foreground bg-bg-alt focus:bg-bg-card border-border hover:border-emerald-500/40 shadow-sm"
              disabled={isFieldDisabled('correo')} 
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Cargo / Rol</span>
            <input 
              value={data.rol} 
              disabled 
              className="w-full text-foreground opacity-70 cursor-not-allowed bg-slate-100 uppercase" 
            />
          </label>

          <label>
            <span className="font-semibold text-text-secondary text-sm mb-1">Sede Afiliada</span>
            <input 
              value={data.sede} 
              disabled 
              className="w-full text-foreground opacity-70 cursor-not-allowed bg-slate-100" 
            />
          </label>

          <label className="full-width">
            <span className="font-semibold text-text-secondary text-sm mb-1">Año de Ejercicio</span>
            <input 
              value={data.anio_ejercicio} 
              disabled 
              className="w-full text-foreground opacity-70 cursor-not-allowed bg-slate-100" 
            />
          </label>

          <label className="foto-field full-width">
            <span className="font-semibold text-text-secondary text-sm mb-1">Foto de Perfil</span>
            <div className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCropFileChange}
                className="mb-2 block w-full text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer shadow-sm"
              />
            </div>
          </label>
        </div>

        {/* Modal Recorte Foto */}
        {imageSrcToCrop && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-slate-900 border border-slate-100">
              <h3 className="text-base font-bold text-center text-slate-800">Ajusta tu foto de perfil</h3>
              <p className="text-[11px] text-slate-500 text-center -mt-2 leading-normal">
                Arrastra la imagen y usa la barra inferior para ajustar el tamaño dentro del círculo.
              </p>
              
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

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSaving} className="button button--primary px-8 py-3 rounded-2xl font-bold shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving ? 'Guardando en BD...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Modal Seguridad */}
      {showSettings && (
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
                  className="w-full p-3 border border-border rounded-xl bg-white focus:border-emerald-500 focus:ring-emerald-500" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required
                />
              </label>
              
              <label className="block">
                <span className="text-xs font-semibold text-secondary uppercase block mb-1">Confirmar nueva contraseña</span>
                <input 
                  type="password" 
                  className="w-full p-3 border border-border rounded-xl bg-white focus:border-emerald-500 focus:ring-emerald-500" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  required
                />
              </label>
              
              <div className="flex justify-end mt-6">
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notificaciones */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-bounce-short">
          <div className={`px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 ${
            toastType === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {toastType === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <FiAlertTriangle className="h-5 w-5" />
            )}
            {toastMessage}
          </div>
        </div>
      )}
    </section>
  )
}
