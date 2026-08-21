import { useEffect, useRef } from 'react'
import { api } from '../services/api'

export function GlobalNotificationListener() {
  const notifiedIds = useRef<Set<number>>(new Set())
  useEffect(() => {

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

  return null
}
