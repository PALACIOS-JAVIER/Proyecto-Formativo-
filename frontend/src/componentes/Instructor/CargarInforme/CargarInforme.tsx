import { useState } from 'react'
import type { ReactElement } from 'react'

export function CargarInforme(): ReactElement {
  const [gcFileName, setGcFileName] = useState('')
  const [gcFileSize, setGcFileSize] = useState<number | null>(null)
  const [gfFileName, setGfFileName] = useState('')
  const [gfFileSize, setGfFileSize] = useState<number | null>(null)
  const [gcMessage, setGcMessage] = useState('')
  const [gfMessage, setGfMessage] = useState('')
  const [month, setMonth] = useState('Mayo')
  const [year, setYear] = useState('2026')

  const monthOptions = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const yearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
  const selectedPeriod = `${month} ${year}`
  const bothFilesSelected = Boolean(gcFileName && gfFileName)
  const createdFolderName = `${selectedPeriod}`

  const handleGcFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setGcFileName(file.name)
      setGcFileSize(file.size)
    } else {
      setGcFileName('')
      setGcFileSize(null)
    }
    setGcMessage('')
  }

  const handleGfFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setGfFileName(file.name)
      setGfFileSize(file.size)
    } else {
      setGfFileName('')
      setGfFileSize(null)
    }
    setGfMessage('')
  }

  const handleGcSubmit = () => {
    if (!gcFileName) {
      setGcMessage('Por favor selecciona el archivo GC antes de cargarlo.')
      return
    }

    setGcMessage(`✓ Informe GC para ${selectedPeriod} cargado correctamente.`)
  }

  const handleGfSubmit = () => {
    if (!gfFileName) {
      setGfMessage('Por favor selecciona el archivo GF antes de cargarlo.')
      return
    }

    setGfMessage(`✓ Informe GF para ${selectedPeriod} cargado correctamente.`)
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
          <p className="eyebrow">SUBE EL ARCHIVO</p>
          <h1>Subir informes mensuales</h1>
          <p className="subtext">Selecciona el mes y año de tu periodo de trabajo y adjunta los archivos oficiales GC y GF.</p>
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
            Informes previstos para <strong>{selectedPeriod}</strong>. Adjunta los archivos oficiales sin modificar la información.
          </p>
        </div>

        {bothFilesSelected && (
          <div className="folder-preview">
            <div className="folder-preview__icon">📁</div>
            <div className="folder-preview__content">
              <p className="folder-preview__label">Carpeta creada automáticamente</p>
              <p className="folder-preview__title">{createdFolderName}</p>
              <p className="folder-preview__text">Guardada en <strong>Mis Informes</strong>.</p>
            </div>
          </div>
        )}

        <div className="upload-sections">
          <div className="card upload-card--compact upload-section">
            <div className="upload-type-picker">
              <span className="type-label">GC · Cargar archivo</span>
            </div>
            <h2>Informe GC</h2>
            <p className="upload-note">Adjunta el archivo de informe GC en formato .xlsx o .pdf.</p>

            <label className="button button--primary file-picker-button cursor-pointer mt-3">
              Seleccionar archivo GC
              <input type="file" hidden accept=".xlsx,.xls,.pdf,.docx" onChange={handleGcFile} />
            </label>

            {gcFileName && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm">
                <span>📎 {gcFileName} ({gcFileSize ? formatFileSize(gcFileSize) : ''})</span>
              </div>
            )}

            <div className="upload-actions justify-end mt-4">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setGcFileName('')
                  setGcFileSize(null)
                  setGcMessage('')
                }}
              >
                Limpiar
              </button>
              <button type="button" className="button button--primary" onClick={handleGcSubmit}>
                Cargar informe GC
              </button>
            </div>

            {gcMessage && <p className="submission-message font-medium mt-2">{gcMessage}</p>}
          </div>

          <div className="card upload-card--compact upload-section">
            <div className="upload-type-picker">
              <span className="type-label">GF · Cargar archivo</span>
            </div>
            <h2>Informe GF</h2>
            <p className="upload-note">Adjunta el archivo de informe GF en formato .xlsx o .pdf.</p>

            <label className="button button--primary file-picker-button cursor-pointer mt-3">
              Seleccionar archivo GF
              <input type="file" hidden accept=".xlsx,.xls,.pdf,.docx" onChange={handleGfFile} />
            </label>

            {gfFileName && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm">
                <span>📎 {gfFileName} ({gfFileSize ? formatFileSize(gfFileSize) : ''})</span>
              </div>
            )}

            <div className="upload-actions justify-end mt-4">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setGfFileName('')
                  setGfFileSize(null)
                  setGfMessage('')
                }}
              >
                Limpiar
              </button>
              <button type="button" className="button button--primary" onClick={handleGfSubmit}>
                Cargar informe GF
              </button>
            </div>

            {gfMessage && <p className="submission-message font-medium mt-2">{gfMessage}</p>}
          </div>
        </div>
      </article>
    </section>
  )
}
