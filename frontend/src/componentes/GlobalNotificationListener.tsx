import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'

export function GlobalNotificationListener() {
  const notifiedIds = useRef<Set<number>>(new Set())
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [showBanner, setShowBanner] = useState(true)

  const requestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      setShowBanner(false)
    }
  }

  useEffect(() => {
    // Intentar solicitar permiso al montar
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        setPermission(perm)
      }).catch(() => {})
    }

    const checkNotifications = async () => {
      try {
        const rawUser = localStorage.getItem('user_data')
        if (!rawUser) return
        const userSession = JSON.parse(rawUser)
        const userId = userSession?.id || userSession?.id_Usuario
        if (!userId) return

        const res = await api.get(`/notificaciones/usuario/${userId}`)
        const data = res.data

        if (Array.isArray(data)) {
          // Filtrar notificaciones nuevas que no hemos notificado aún en esta sesión
          const newNotifs = data.filter((n: any) => n.is_new && !notifiedIds.current.has(n.id_notificacion))
          
          if (newNotifs.length > 0) {
            newNotifs.forEach((n: any) => {
              notifiedIds.current.add(n.id_notificacion)
              
              if (Notification.permission === 'granted') {
                const title = n.tipo === 'general' ? '📢 Aviso General' : '🔔 Nueva Notificación'
                new Notification(title, {
                  body: n.titulo || n.descripcion,
                  icon: '/vite.svg', // o el logo de sena si se tiene disponible públicamente
                })
              }
            })
          }
        }
      } catch (error) {
        // Silently fail on network error for polling
      }
    }

    // Comprobar notificaciones cada 15 segundos
    const interval = setInterval(checkNotifications, 15000)
    // Comprobar inmediatamente al montar
    checkNotifications()

    return () => clearInterval(interval)
  }, [])

  if (permission === 'default' && showBanner) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        border: '1px solid #e5e7eb',
        maxWidth: '300px'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontFamily: 'sans-serif' }}>
          Para recibir avisos importantes, necesitas habilitar las notificaciones del navegador.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setShowBanner(false)}
            style={{ padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}
          >
            Ahora no
          </button>
          <button 
            onClick={requestPermission}
            style={{ padding: '6px 12px', border: 'none', background: '#39A900', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            Activar
          </button>
        </div>
      </div>
    )
  }

  return null
}
