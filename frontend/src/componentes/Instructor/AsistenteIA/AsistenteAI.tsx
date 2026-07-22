import { useState } from 'react'
import type { ReactElement } from 'react'

interface Message {
  id: number
  role: 'assistant' | 'user'
  text: string
}

export function AsistenteAI(): ReactElement {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hola María Fernanda. Puedes escribir cualquier duda sobre informes, indicadores o seguimiento de instructores en el campo de abajo.',
    },
  ])

  const handleSend = () => {
    if (!question.trim()) return

    const userMessage: Message = { id: Date.now(), role: 'user', text: question }
    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Estoy preparando una respuesta para tu consulta. Puedes preguntar sobre estados de informe, validación de documentos, seguimiento de instructores y métricas de desempeño.',
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
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
        {/* Message history */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`assistant-message assistant-message--${msg.role}`}
            >
              <strong>{msg.role === 'assistant' ? 'Asistente:' : 'Tú:'}</strong>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="assistant-input-area">
          <label className="assistant-label">
            Tu pregunta sobre informes de instructores
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ejemplo: ¿Cómo puedo validar un informe GF para un instructor?"
            />
          </label>
          <div className="flex items-center gap-3">
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

        {/* Help box */}
        <div className="help-box">
          <strong>Consejos:</strong>
          <ul className="how-to-list">
            <li>Pregunta con contexto: incluye el mes o tipo de informe.</li>
            <li>Pide ejemplos: 'muestra un ejemplo de validación GF'.</li>
            <li>Solicita pasos: '¿qué pasos sigo para corregir observaciones?'.</li>
          </ul>
        </div>
      </article>
    </section>
  )
}
