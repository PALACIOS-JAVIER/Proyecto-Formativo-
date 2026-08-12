import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { FiRefreshCw, FiEdit, FiCheck } from 'react-icons/fi';


interface HistoryItem {
  id: string
  action: string
  target: string
  date: string
  details: string
  type: 'approval' | 'correction' | 'user'
}

export function Historial(): ReactElement {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const fetchAuditHistory = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token') || ''
      const headers = { 'Authorization': `Bearer ${token}` }

      const [gcRes, gfRes, usersRes] = await Promise.all([
        fetch('/api/informes-gc', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/informes-gf', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/usuarios', { headers }).then(r => r.ok ? r.json() : []),
      ])

      const logs: HistoryItem[] = []

      // 1. Audit log for GC Reports
      ;(gcRes || []).forEach((r: any) => {
        const instName = `${r.usuario?.nombre || 'Instructor'} ${r.usuario?.apellido || ''}`
        if (r.estado === 'aprobado' || r.estado === 'success') {
          logs.push({
            id: `gc-app-${r.id_informe_gc}`,
            action: '<FiCheck /> Informe Aprobado',
            target: `Informe GC (${r.mes} ${r.anio})`,
            date: new Date(r.fecha_registro).toLocaleString(),
            details: `Aprobado el informe de gestión de ${instName}.`,
            type: 'approval',
          })
        }

        if (r.observaciones && r.observaciones.length > 0) {
          r.observaciones.forEach((o: any) => {
            logs.push({
              id: `gc-obs-${o.id_observacion_gc || Math.random()}`,
              action: '<FiEdit /> Solicitud de Corrección Enviada',
              target: `Informe GC (${r.mes} ${r.anio})`,
              date: new Date(o.fecha || r.fecha_registro).toLocaleString(),
              details: `Instructor ${instName}. Observación: "${o.comentario}"`,
              type: 'correction',
            })
          })
        }
      })

      // 2. Audit log for GF Reports
      ;(gfRes || []).forEach((r: any) => {
        const instName = `${r.usuario?.nombre || 'Instructor'} ${r.usuario?.apellido || ''}`
        if (r.estado === 'aprobado' || r.estado === 'success') {
          logs.push({
            id: `gf-app-${r.id_informe_gf}`,
            action: '<FiCheck /> Informe Aprobado',
            target: `Informe GF (${r.mes} ${r.anio})`,
            date: new Date(r.fecha_registro).toLocaleString(),
            details: `Aprobado el informe financiero de ${instName}.`,
            type: 'approval',
          })
        }

        if (r.observaciones && r.observaciones.length > 0) {
          r.observaciones.forEach((o: any) => {
            logs.push({
              id: `gf-obs-${o.id_observacion_gf || Math.random()}`,
              action: '<FiEdit /> Solicitud de Corrección Enviada',
              target: `Informe GF (${r.mes} ${r.anio})`,
              date: new Date(o.fecha || r.fecha_registro).toLocaleString(),
              details: `Instructor ${instName}. Observación: "${o.comentario}"`,
              type: 'correction',
            })
          })
        }
      })

      // 3. Audit log for Instructors status
      ;(usersRes || []).forEach((u: any) => {
        const status = (u.estado_cuenta || '').toLowerCase()
        if (status === 'aprobado' || status === 'activo') {
          logs.push({
            id: `usr-act-${u.id_Usuario}`,
            action: '👤 Instructor Aceptado',
            target: `Instructor: ${u.nombre} ${u.apellido}`,
            date: new Date().toLocaleDateString(),
            details: `Se aprobó y activó la cuenta para el correo ${u.correo}.`,
            type: 'user',
          })
        }
      })

      // Sort by date / timestamp descending
      setHistory(logs)
    } catch (err) {
      console.error('Error fetching audit history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditHistory()
  }, [])

  return (
    <section className="page-panel">
      <header className="page-header flex items-center justify-between">
        <div>
          <p className="eyebrow">Bitácora del Coordinador</p>
          <h1>Trazabilidad de acciones realizadas</h1>
          <p className="subtext">Consulta la bitácora histórica de informes aprobados, correcciones enviadas y permisos de instructores.</p>
        </div>
        <button type="button" onClick={fetchAuditHistory} className="button button--ghost text-xs py-1.5 px-3">
          <FiRefreshCw /> Actualizar historial
        </button>
      </header>

      <article className="card p-6">
        {isLoading ? (
          <p className="text-center text-text-muted">Cargando bitácora de historial...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-text-muted">Sin registros en la bitácora de historial.</p>
        ) : (
          <div className="space-y-6">
            {history.map((item) => {
              const isCorrection = item.type === 'correction';
              const isExpanded = !!expandedItems[item.id];
              return (
                <div key={item.id} className={`relative pl-6 border-l-2 pb-2 ${isCorrection ? 'border-rose-500/30' : 'border-emerald-500/30'}`}>
                  <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${item.type === 'approval' ? 'bg-emerald-500' : item.type === 'correction' ? 'bg-rose-500' : 'bg-sky-500'}`}></div>
                  <div 
                    className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 ${isCorrection ? 'cursor-pointer select-none hover:opacity-85' : ''}`}
                    onClick={() => isCorrection && toggleItem(item.id)}
                  >
                    <div>
                      <h3 className="font-bold text-[1.05rem] text-foreground flex items-center gap-2">
                        {item.action}
                        {isCorrection && (
                          <span className="text-[10px] font-normal text-secondary bg-bg-alt px-2 py-0.5 rounded border border-border">
                            {isExpanded ? '▲ Ocultar' : '▼ Ver detalles'}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-700 mt-0.5">{item.target}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-bg-alt text-text-secondary border border-border whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                  {(!isCorrection || isExpanded) && (
                    <p className="mt-2 text-sm text-text-muted leading-relaxed transition-all animate-fadeIn">{item.details}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  )
}
