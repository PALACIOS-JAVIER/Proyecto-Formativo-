import { useState } from 'react'
import type { ReactElement } from 'react'

export function CargarInforme(): ReactElement {
  const [fileName, setFileName] = useState('')
  const [month, setMonth] = useState('Mayo')
  const [year, setYear] = useState('2026')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [fileSize, setFileSize] = useState<number | null>(null)

  const monthOptions = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const yearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
  const selectedPeriod = `${month} ${year}`

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFileSize(file.size)
    } else {
      setFileName('')
      setFileSize(null)
    }
    setSubmissionMessage('')
  }

  const handleSubmit = () => {
    if (!fileName) {
      setSubmissionMessage('Por favor selecciona un archivo antes de enviar.')
      return
    }

    setSubmissionMessage(`✓ Informe GC programado para ${month} ${year}. Archivo cargado correctamente y enviado a validación.`)
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
          <p className="eyebrow">SUBE Y VALIDA EL ARCHIVO</p>
          <h1>Subir Informe Mensual (GC)</h1>
          <p className="subtext">Selecciona el mes y año de tu periodo de trabajo y adjunta la plantilla oficial GC.</p>
        </div>
      </header>

      <article className="card upload-card">
        {/* Type indicator */}
        <div className="upload-type-picker">
          <button type="button" className="type-button type-button--active">
            GC · Validar archivo
          </button>
          <span className="text-xs text-text-secondary font-medium px-3 py-2 rounded-full border border-border bg-bg-alt flex items-center">
            Formato Institucional GC GTH-F-062
          </span>
        </div>

        {/* Timeline selectors */}
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

        {/* Summary banner */}
        <div className="upload-summary">
          <p>
            Informe <strong>GC</strong> previsto para <strong>{selectedPeriod}</strong>. La validación comprueba la estructura del documento y los anexos de evidencia.
          </p>
        </div>

        {/* Instructions */}
        <div className="upload-instructions">
          <div>
            <span className="instruction-step">1</span>
            <p>Selecciona el mes y año correspondientes a tu periodo de instrucción.</p>
          </div>
          <div>
            <span className="instruction-step">2</span>
            <p>Adjunta el archivo del informe mensual en formato .xlsx o .pdf.</p>
          </div>
          <div>
            <span className="instruction-step">3</span>
            <p>Confirma el envío para notificar a la coordinación asignada.</p>
          </div>
        </div>

        {/* Dropzone */}
        <div className="upload-dropzone">
          <span className="upload-icon">📥</span>
          <h2>Sube tu archivo de Informe GC</h2>
          <p className="upload-note">El sistema revisa el formato, el nombre y la estructura sin modificar la información.</p>
          
          <label className="button button--primary cursor-pointer mt-3">
            Seleccionar archivo GC
            <input type="file" hidden accept=".xlsx,.xls,.pdf,.docx" onChange={handleFile} />
          </label>

          {fileName && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm">
              <span>📎 {fileName} ({fileSize ? formatFileSize(fileSize) : ''})</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="upload-actions justify-end">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setFileName('')
              setFileSize(null)
              setSubmissionMessage('')
            }}
          >
            Limpiar
          </button>
          <button type="button" className="button button--primary" onClick={handleSubmit}>
            Enviar informe GC
          </button>
        </div>

        {submissionMessage && (
          <p className="submission-message font-medium mt-2">
            {submissionMessage}
          </p>
        )}
      </article>
    </section>
  )
}
