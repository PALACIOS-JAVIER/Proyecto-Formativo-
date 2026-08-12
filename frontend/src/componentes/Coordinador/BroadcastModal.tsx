import { useState } from 'react'
import type { ReactElement, FormEvent } from 'react'
import { api } from '../../services/api'

interface BroadcastModalProps {
  onClose: () => void
}

export function BroadcastModal({ onClose }: BroadcastModalProps): ReactElement {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const rawUser = localStorage.getItem('user_data')
      const userSession = rawUser ? JSON.parse(rawUser) : null
      
      const payload = {
        titulo,
        descripcion,
        tipo: 'general',
        usuario_origen_id: userSession?.id || userSession?.id_Usuario
      }

      await api.post('/notificaciones/broadcast', payload)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || 'Ocurrió un error al enviar el mensaje global.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <header className="bg-emerald-600 px-6 py-5 flex items-center gap-3">
          <span className="text-3xl">📢</span>
          <div>
            <h2 className="text-white text-xl font-bold">Aviso General a Instructores</h2>
            <p className="text-emerald-100 text-sm">Este mensaje llegará a todos los instructores.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
              <span className="text-4xl">✅</span>
              <p className="text-emerald-800 font-bold text-lg">¡Mensaje enviado con éxito!</p>
              <p className="text-emerald-600 text-sm">Todos los instructores han sido notificados.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Título del mensaje</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Reunión Urgente, Actualización de Planilla..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Contenido del mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Escribe aquí las instrucciones o el aviso que deseas comunicar a todos..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Enviando...' : 'Enviar a todos 🚀'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
