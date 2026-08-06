import { useState } from 'react'
import type { ReactElement } from 'react'

export function CargarInforme(): ReactElement {
  const [gcFile, setGcFile] = useState<File | null>(null)
  const [gfFile, setGfFile] = useState<File | null>(null)
  const [month, setMonth] = useState('Mayo')
  const [year, setYear] = useState('2026')
  
  const [gcMessage, setGcMessage] = useState('')
  const [gfMessage, setGfMessage] = useState('')
  const [isGcError, setIsGcError] = useState(false)
  const [isGfError, setIsGfError] = useState(false)
  
  const [isSubmittingGc, setIsSubmittingGc] = useState(false)
  const [isSubmittingGf, setIsSubmittingGf] = useState(false)

  const monthOptions = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const yearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
  const selectedPeriod = `${month} ${year}`

  const handleGcFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setIsGcError(false)
    setGcMessage('')

    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setGcFile(null)
        setIsGcError(true)
        setGcMessage('⚠️ Solo se permiten archivos en formato PDF (.pdf).')
        return
      }
      setGcFile(file)
    } else {
      setGcFile(null)
    }
  }

  const handleGfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setIsGfError(false)
    setGfMessage('')

    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setGfFile(null)
        setIsGfError(true)
        setGfMessage('⚠️ Solo se permiten archivos en formato PDF (.pdf).')
        return
      }
      setGfFile(file)
    } else {
      setGfFile(null)
    }
  }

  const handleGcSubmit = async () => {
    if (!gcFile) {
      setIsGcError(true)
      setGcMessage('Por favor selecciona un archivo PDF para el informe GC.')
      return
    }

    try {
      setIsSubmittingGc(true)
      setIsGcError(false)
      setGcMessage('Subiendo informe GC...')

      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      const userId = userSession?.id || userSession?.id_Usuario

      if (!userId) {
        throw new Error('No se encontró la sesión del usuario. Por favor inicie sesión de nuevo.')
      }

      const formData = new FormData()
      formData.append('file', gcFile)
      formData.append('mes', month)
      formData.append('anio', year)
      formData.append('id_usuario', userId.toString())

      const response = await fetch('/api/informes-gc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession?.token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al subir el informe GC.')
      }

      setIsGcError(false)
      setGcMessage(`✓ Informe GC (${month} ${year}) en PDF subido exitosamente.`)
      setGcFile(null)
    } catch (err: any) {
      console.error('Error uploading GC report:', err)
      setIsGcError(true)
      setGcMessage(err.message || 'Error al intentar subir el archivo GC.')
    } finally {
      setIsSubmittingGc(false)
    }
  }

  const handleGfSubmit = async () => {
    if (!gfFile) {
      setIsGfError(true)
      setGfMessage('Por favor selecciona un archivo PDF para el informe GF.')
      return
    }

    try {
      setIsSubmittingGf(true)
      setIsGfError(false)
      setGfMessage('Subiendo informe GF...')

      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      const userId = userSession?.id || userSession?.id_Usuario

      if (!userId) {
        throw new Error('No se encontró la sesión del usuario. Por favor inicie sesión de nuevo.')
      }

      const formData = new FormData()
      formData.append('file', gfFile)
      formData.append('mes', month)
      formData.append('anio', year)
      formData.append('id_usuario', userId.toString())

      const response = await fetch('/api/informes-gf/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userSession?.token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al subir el informe GF.')
      }

      setIsGfError(false)
      setGfMessage(`✓ Informe GF (${month} ${year}) en PDF subido exitosamente.`)
      setGfFile(null)
    } catch (err: any) {
      console.error('Error uploading GF report:', err)
      setIsGfError(true)
      setGfMessage(err.message || 'Error al intentar subir el archivo GF.')
    } finally {
      setIsSubmittingGf(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <section className="page-panel">
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">SUBE TUS INFORMES EN PDF</p>
          <h1>Subir informes mensuales (GC y GF)</h1>
          <p className="subtext">Selecciona el mes y año de tu periodo de trabajo y adjunta los archivos oficiales GC y GF únicamente en formato PDF.</p>
        </div>
      </header>

      <article className="card upload-card">
        <div className="timeline-selectors">
          <label className="field-label">
            Mes de la carga
            <select className="month-selector" value={month} onChange={(event) => setMonth(event.target.value)}>
              {monthOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Año de la carga
            <select className="month-selector" value={year} onChange={(event) => setYear(event.target.value)}>
              {yearOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="upload-summary">
          <p>
            Informes previstos para <strong>{selectedPeriod}</strong>. Adjunta los archivos en formato <strong>PDF (.pdf)</strong> para su revisión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card border border-border rounded-3xl p-6 bg-bg-card shadow-sm flex flex-col justify-between">
            <div>
              <div className="upload-type-picker mb-4">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                  📄 Informe GC (PDF)
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Cargar Informe GC</h2>
              <p className="text-xs text-secondary mt-1">Formato Institucional GC. Adjunta el archivo en formato PDF.</p>

              <label className="button button--primary cursor-pointer mt-4 inline-flex items-center gap-2">
                Seleccionar PDF GC
                <input type="file" hidden accept="application/pdf,.pdf" onChange={handleGcFileChange} />
              </label>

              {gcFile && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm">
                  <span>📄 {gcFile.name} ({formatFileSize(gcFile.size)})</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="button button--ghost text-xs"
                  onClick={() => {
                    setGcFile(null)
                    setGcMessage('')
                    setIsGcError(false)
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingGc}
                  className="button button--primary text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleGcSubmit}
                >
                  {isSubmittingGc ? 'Subiendo GC...' : 'Cargar informe GC'}
                </button>
              </div>

              {gcMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${isGcError ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                  {gcMessage}
                </div>
              )}
            </div>
          </div>

          <div className="card border border-border rounded-3xl p-6 bg-bg-card shadow-sm flex flex-col justify-between">
            <div>
              <div className="upload-type-picker mb-4">
                <span className="px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs border border-sky-300">
                  📄 Informe GF (PDF)
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Cargar Informe GF</h2>
              <p className="text-xs text-secondary mt-1">Formato Institucional GF. Adjunta el archivo en formato PDF.</p>

              <label className="button button--primary cursor-pointer mt-4 inline-flex items-center gap-2">
                Seleccionar PDF GF
                <input type="file" hidden accept="application/pdf,.pdf" onChange={handleGfFileChange} />
              </label>

              {gfFile && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-600 shadow-sm">
                  <span>📄 {gfFile.name} ({formatFileSize(gfFile.size)})</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="button button--ghost text-xs"
                  onClick={() => {
                    setGfFile(null)
                    setGfMessage('')
                    setIsGfError(false)
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingGf}
                  className="button button--primary text-xs font-bold bg-sky-600 text-white hover:bg-sky-700"
                  onClick={handleGfSubmit}
                >
                  {isSubmittingGf ? 'Subiendo GF...' : 'Cargar informe GF'}
                </button>
              </div>

              {gfMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${isGfError ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}>
                  {gfMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
