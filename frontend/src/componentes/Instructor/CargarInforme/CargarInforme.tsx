import { useState } from 'react'
import type { ReactElement } from 'react'

export function CargarInforme(): ReactElement {
  const [selection, setSelection] = useState<'gc' | 'gf'>('gc')
  const [fileName, setFileName] = useState('')
  const [month, setMonth] = useState('Mayo')
  const [year, setYear] = useState('2026')
  const [submissionMessage, setSubmissionMessage] = useState('')

  const monthOptions = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const yearOptions = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
  const selectedPeriod = `${month} ${year}`
  const validationNote = selection === 'gc'
    ? 'La validación GC comprueba el formato financiero y la estructura general del documento.'
    : 'La validación GF revisa el contenido según las reglas de gestión financiera y evidencias.'

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? '')
    setSubmissionMessage('')
  }

  const handleSubmit = () => {
    if (!fileName) {
      setSubmissionMessage('Por favor selecciona un archivo antes de enviar.')
      return
    }

    setSubmissionMessage(`Informe ${selection.toUpperCase()} programado para ${month}. Archivo listo para validación.`)
  }

  return (
    <section className="page-panel">
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">Subir Informe</p>
          <h1>Sube y valida el archivo</h1>
          <p className="subtext">Elige el tipo de informe, selecciona el mes y agrega el archivo.</p>
        </div>
        <div className="steps-pill-group" />
      </header>

      <article className="card upload-card">
        <div className="upload-type-picker">
          <button type="button" className={`type-button ${selection === 'gc' ? 'type-button--active' : ''}`} onClick={() => setSelection('gc')}>
            GC · Validar archivo
          </button>
          <button type="button" className={`type-button ${selection === 'gf' ? 'type-button--active' : ''}`} onClick={() => setSelection('gf')}>
            GF · Validar archivo
          </button>
        </div>

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
            Informe <strong>{selection.toUpperCase()}</strong> previsto para <strong>{selectedPeriod}</strong>.
            {` ${validationNote}`}
          </p>
        </div>

        <div className="upload-instructions">
          <div>
            <span className="instruction-step">1</span>
            <p>Elige si el informe es GC o GF según la plantilla que tengas.</p>
          </div>
          <div>
            <span className="instruction-step">2</span>
            <p>Selecciona el mes y año correctos para el periodo del informe.</p>
          </div>
          <div>
            <span className="instruction-step">3</span>
            <p>Sube el archivo y confirma para que el sistema lo valide automáticamente.</p>
          </div>
        </div>

        <div className="upload-dropzone">
          <span className="upload-icon">⭳</span>
          <h2>Sube un archivo GF o GC para validarlo</h2>
          <p>El sistema revisa el formato, el nombre y el tamaño. No genera ni crea archivos adicionales.</p>
          <label className="button button--primary">
            Seleccionar archivo {selection.toUpperCase()}
            <input type="file" hidden onChange={handleFile} />
          </label>
          <p className="upload-note">{fileName ? `Archivo seleccionado: ${fileName}` : 'Aún no se ha subido ningún archivo.'}</p>
        </div>

        <div className="upload-actions">
          <button type="button" className="button button--secondary" onClick={handleSubmit}>
            Enviar informe
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setFileName('')
              setSubmissionMessage('')
            }}
          >
            Limpiar
          </button>
        </div>

        {submissionMessage && (
          <p className="submission-message">
            {submissionMessage} <strong>{month} {year}</strong>
          </p>
        )}
      </article>
    </section>
  )
}
