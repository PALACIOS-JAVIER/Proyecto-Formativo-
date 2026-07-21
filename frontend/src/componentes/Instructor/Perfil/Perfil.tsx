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
    fotoPerfil?: string // URL base64 o blob URL
}

interface PerfilProps {
    initialData?: ProfileData
    onSave?: (data: ProfileData) => void
}

export function Perfil({ initialData, onSave }: PerfilProps) {
    const [data, setData] = useState<ProfileData>(
        initialData ?? {
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
            fotoPerfil: '',
        }
    )

    const [fotoFile, setFotoFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | undefined>(data.fotoPerfil)

    useEffect(() => {
        if (fotoFile) {
            const url = URL.createObjectURL(fotoFile)
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [fotoFile])

    useEffect(() => {
        if (initialData) setData(initialData)
    }, [initialData])

    const handleChange = (k: keyof ProfileData, v: string) => {
        setData((curr) => ({ ...curr, [k]: v } as ProfileData))
    }

    const handleFoto = (f?: File) => {
        if (!f) return
        setFotoFile(f)
        setData((curr) => ({ ...curr, fotoPerfil: curr.fotoPerfil || '' }))
    }

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault()
        const out = { ...data }
        if (preview) out.fotoPerfil = preview
        onSave?.(out)
    }

    return (
        <main className="perfil-page">
            <h2>Perfil de instructor</h2>

            <form onSubmit={handleSave} className="perfil-form">
                <div className="perfil-grid">
                    <label>
                        Nombre
                        <input value={data.nombre} onChange={(e) => handleChange('nombre', e.target.value)} required />
                    </label>

                    <label>
                        Apellido
                        <input value={data.apellido} onChange={(e) => handleChange('apellido', e.target.value)} required />
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
                        <input type="email" value={data.correo} onChange={(e) => handleChange('correo', e.target.value)} />
                    </label>

                    <label>
                        Rol
                        <select value={data.rol} onChange={(e) => handleChange('rol', e.target.value)}>
                            <option value="campesena">Campesena</option>
                            <option value="regular fit">Regular Fit</option>
                            <option value="apoyo administrativo">Apoyo Administrativo</option>
                        </select>
                    </label>

                    <label>
                        Sede
                        <select value={data.sede} onChange={(e) => handleChange('sede', e.target.value)}>
                            <option value="Yamboro">Yamboro</option>
                            <option value="Otra">Otra</option>
                        </select>
                    </label>

                    <label>
                        Área
                        <input value={data.area} onChange={(e) => handleChange('area', e.target.value)} />
                    </label>

                    <label>
                        Código de contrato
                        <input value={data.codigoContrato} onChange={(e) => handleChange('codigoContrato', e.target.value)} />
                    </label>

                    <label>
                        Código SIIF
                        <input value={data.codigoSiif} onChange={(e) => handleChange('codigoSiif', e.target.value)} />
                    </label>

                    <label>
                        Fecha inicio del contrato
                        <input type="date" value={data.fechaInicioContrato} onChange={(e) => handleChange('fechaInicioContrato', e.target.value)} />
                    </label>

                    <label>
                        Fecha fin del contrato
                        <input type="date" value={data.fechaFinContrato} onChange={(e) => handleChange('fechaFinContrato', e.target.value)} />
                    </label>

                    <label className="full-width">
                        Objeto del contrato
                        <textarea value={data.objetoContrato} onChange={(e) => handleChange('objetoContrato', e.target.value)} />
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
                        {preview ? <img src={preview} alt="preview" style={{ maxWidth: 160, marginTop: 8 }} /> : null}
                    </label>
                </div>

                <div style={{ marginTop: 12 }}>
                    <button type="submit">Guardar cambios</button>
                </div>
            </form>
        </main>
    )
}
