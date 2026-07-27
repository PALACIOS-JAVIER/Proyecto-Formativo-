import React, { useEffect, useState } from 'react'

export interface ProfileData {
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  rol: 'campesena' | 'regular fit' | 'apoyo administrativo'
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

export function Perfil({ initialData, onSave, canEditProfile = false }: PerfilProps) {
  const [data, setData] = useState<ProfileData>(
    initialData ?? {
      nombre: 'María Fernanda',
      apellido: 'Gómez Pérez',
      cedula: '123456789',
      telefono: '3001234567',
      correo: 'maria.gomez@senasofia.edu.co',
      rol: 'campesena',
      sede: 'Yamboro',
      area: 'Desarrollo Formativo',
      codigoContrato: 'CV-1234-2025',
      codigoSiif: 'SI-5678-2025',
      fechaInicioContrato: '2025-01-15',
      fechaFinContrato: '2026-01-15',
      objetoContrato: 'Prestación de servicios de instrucción de formación en el marco del programa de desarrollo técnico laboral.',
      fotoPerfil: '',
    }
  )

  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(data.fotoPerfil)
  const [firmaPreview, setFirmaPreview] = useState<string | undefined>(data.firma)

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
    if (data.fotoPerfil && !window.confirm('¿Estás seguro de cambiar la foto de perfil? La anterior se reemplazará.')) {
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
    if (data.firma && !window.confirm('¿Estás seguro de cambiar la firma? La anterior se reemplazará.')) {
      return
    }
    setFirmaFile(f)
  }

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault()
    const out = { ...data }
    if (preview) out.fotoPerfil = preview
    if (firmaPreview) out.firma = firmaPreview
    onSave?.(out)
  }

  const isFieldDisabled = (field: keyof ProfileData) => {
    if (field === 'cedula') return true
    if (field === 'telefono' || field === 'fotoPerfil' || field === 'firma') return false
    return !canEditProfile
  }

  return (
    <main className="perfil-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2>Perfil de instructor</h2>
          <p className="subtext">
            {canEditProfile
              ? 'Tienes permiso del coordinador para editar tu perfil completo excepto la cédula.'
              : 'Sin permiso del coordinador solo puedes cambiar teléfono y foto.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="perfil-form">
        <div className="perfil-grid">
          <label>
            Nombre
            <input value={data.nombre} onChange={(e) => handleChange('nombre', e.target.value)} disabled={isFieldDisabled('nombre')} required />
          </label>

          <label>
            Apellido
            <input value={data.apellido} onChange={(e) => handleChange('apellido', e.target.value)} disabled={isFieldDisabled('apellido')} required />
          </label>

          <label>
            Cédula
            <input value={data.cedula} disabled />
          </label>

          <label>
            Teléfono
            <input value={data.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
          </label>

          <label>
            Correo institucional
            <input type="email" value={data.correo} onChange={(e) => handleChange('correo', e.target.value)} disabled={isFieldDisabled('correo')} />
          </label>

          <label>
            Rol
            <select value={data.rol} onChange={(e) => handleChange('rol', e.target.value)} disabled={isFieldDisabled('rol')}>
              <option value="campesena">Campesena</option>
              <option value="regular fit">Regular Fit</option>
              <option value="apoyo administrativo">Apoyo Administrativo</option>
            </select>
          </label>

          <label>
            Sede
            <select value={data.sede} onChange={(e) => handleChange('sede', e.target.value)} disabled={isFieldDisabled('sede')}>
              <option value="Yamboro">Yamboro</option>
              <option value="Otra">Otra</option>
            </select>
          </label>

          <label>
            Área
            <input value={data.area} onChange={(e) => handleChange('area', e.target.value)} disabled={isFieldDisabled('area')} />
          </label>

          <label>
            Código de contrato
            <input value={data.codigoContrato} onChange={(e) => handleChange('codigoContrato', e.target.value)} disabled={isFieldDisabled('codigoContrato')} />
          </label>

          <label>
            Código SIIF
            <input value={data.codigoSiif} onChange={(e) => handleChange('codigoSiif', e.target.value)} disabled={isFieldDisabled('codigoSiif')} />
          </label>

          <label>
            Fecha inicio del contrato
            <input type="date" value={data.fechaInicioContrato} onChange={(e) => handleChange('fechaInicioContrato', e.target.value)} disabled={isFieldDisabled('fechaInicioContrato')} />
          </label>

          <label>
            Fecha fin del contrato
            <input type="date" value={data.fechaFinContrato} onChange={(e) => handleChange('fechaFinContrato', e.target.value)} disabled={isFieldDisabled('fechaFinContrato')} />
          </label>

          <label className="full-width">
            Objeto del contrato
            <textarea value={data.objetoContrato} onChange={(e) => handleChange('objetoContrato', e.target.value)} disabled={isFieldDisabled('objetoContrato')} />
          </label>

          <label className="foto-field">
            Foto de perfil
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFoto(f)
              }}
            />
            {preview ? <img src={preview} alt="preview" /> : null}
          </label>

          <label className="foto-field">
            Agregar firma
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFirma(f)
              }}
            />
            {firmaPreview ? <img src={firmaPreview} alt="firma preview" className="max-h-32 object-contain" /> : null}
          </label>
        </div>

        <div className="mt-6">
          <button type="submit">Guardar cambios</button>
        </div>
      </form>
    </main>
  )
}
