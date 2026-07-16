import { useState } from 'react'
import type { ReactElement } from 'react'

export function CargarInforme(): ReactElement {
  const [selection, setSelection] = useState<'gc' | 'gf'>('gc')
  const [fileName, setFileName] = useState('')

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? '')
  }

  return (
    <section className="page-panel">
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">Subir Informe</p>
          <h1>Sube y valida el archivo</h1>
          <p className="subtext">Elige el tipo de informe y agrega el archivo para validación.</p>
        </div>
        <div className="steps-pill-group">
          <span className="step-pill step-pill--active">1 Selecciona el tipo</span>
          <span className="step-pill">2 Sube y valida el archivo</span>
        </div>
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
      </article>
    </section>
  )
}
