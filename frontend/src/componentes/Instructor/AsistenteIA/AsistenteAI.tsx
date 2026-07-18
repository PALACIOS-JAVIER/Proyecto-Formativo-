import { useState } from 'react'
import type { ReactElement } from 'react'

export function AsistenteAI(): ReactElement {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')

  const handleSend = () => {
    if (!question.trim()) return
    setResponse(
      'Estoy preparando una respuesta para tu consulta. Puedes preguntar sobre estados de informe, validación de documentos, seguimiento de instructores y métricas de desempeño.'
    )
    setQuestion('')
  }

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Asistente IA</p>
          <h1>Asistente inteligente</h1>
          <p className="subtext">Escribe tu pregunta relacionada con informes de instructores, validación de documentos o estado de reportes.</p>
        </div>
      </header>

      <article className="card assistant-card">
        <div className="assistant-message assistant-message--assistant">
          <strong>Asistente:</strong>
          <p>Hola María Fernanda. Puedes escribir cualquier duda sobre informes, indicadores o seguimiento de instructores en el campo de abajo.</p>
        </div>

        <div className="assistant-input-area">
          <label className="assistant-label">
            Tu pregunta sobre informes de instructores
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ejemplo: ¿Cómo puedo validar un informe GF para un instructor?"
            />
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button" className="button button--primary assistant-send" onClick={handleSend}>
              Enviar pregunta
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setQuestion('')}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="help-box">
          <strong>Consejos:</strong>
          <ul>
            <li>Pregunta con contexto: incluye el mes o tipo de informe.</li>
            <li>Pide ejemplos: 'muestra un ejemplo de validación GF'.</li>
            <li>Solicita pasos: '¿qué pasos sigo para corregir observaciones?'.</li>
          </ul>
        </div>

        {response ? (
          <div className="assistant-message assistant-message--assistant">
            <strong>Asistente:</strong>
            <p>{response}</p>
          </div>
        ) : null}
      </article>
    </section>
  )
}

