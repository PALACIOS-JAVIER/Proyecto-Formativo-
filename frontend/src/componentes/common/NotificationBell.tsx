import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const rawUser = localStorage.getItem('user_data')
      if (!rawUser) return
      const userSession = JSON.parse(rawUser)
      const userId = userSession?.id || userSession?.id_Usuario
      if (!userId) return

      const res = await api.get(`/notificaciones/usuario/${userId}`)
      setNotifications(res.data || [])
    } catch (error) {
      // silently fail
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read', error)
    }
  }

  const unreadCount = notifications.filter(n => n.is_new).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#00304D] hover:bg-[#F6F6F6] rounded-full transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#00304D]/10 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#00304D]/10 flex justify-between items-center bg-[#F6F6F6]">
            <h3 className="font-bold text-[#00304D]">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-[#39A900] font-semibold">{unreadCount} nuevas</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id_notificacion}
                  className={`px-4 py-3 border-b border-[#00304D]/5 hover:bg-gray-50 cursor-pointer transition-colors ${notif.is_new ? 'bg-blue-50/20' : ''}`}
                  onClick={() => notif.is_new && markAsRead(notif.id_notificacion)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${notif.is_new ? 'font-bold text-[#00304D]' : 'font-medium text-gray-700'}`}>
                      {notif.titulo}
                    </h4>
                    {notif.is_new && (
                      <span className="w-2 h-2 rounded-full bg-[#39A900] mt-1.5 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className={`text-xs ${notif.is_new ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notif.descripcion}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notif.fecha_creacion).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
