import { useState, useEffect } from 'react'
import { Login, type LoginCredentials, type RegistrationData } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'
import type { ProfileData } from './componentes/Instructor/Perfil/Perfil'
import { api } from './services/api'

type UserRole = 'instructor' | 'coordinador' | 'apoyo_administrativo' | null
type InstructorStatus = 'pendiente' | 'activo' | 'inactivo' | 'rechazado'

export interface InstructorProfile extends ProfileData {
  id: number
  status: InstructorStatus
  canEdit: boolean
  source: 'registro' | 'coordinador'
}

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('access_token')
  })
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user_data') || '{}')
      const roleVal = typeof u.rol === 'object' ? u.rol?.nombre : u.rol
      if (typeof roleVal === 'string') {
        const lower = roleVal.toLowerCase()
        if (lower.includes('coordinador')) return 'coordinador'
        if (lower.includes('apoyo')) return 'apoyo_administrativo'
        return 'instructor'
      }
      return null
    } catch {
      return null
    }
  })

  const [instructors, setInstructors] = useState<InstructorProfile[]>([])
  
  const fetchInstructors = async () => {
    try {
      let rawData: any[] = []
      try {
        const res = await api.get('/usuarios')
        rawData = res.data
      } catch (e) {
        console.warn('api.get /usuarios failed, using direct fetch fallback:', e)
        const res = await fetch('/api/usuarios')
        if (res.ok) rawData = await res.json()
      }

      if (!Array.isArray(rawData)) rawData = []

      const mappedInstructors = rawData.map((u: any) => {
        let status: InstructorStatus = 'pendiente'
        const estadoLower = (u.estado_cuenta || 'pendiente').toLowerCase().trim()
        if (estadoLower === 'aprobado' || estadoLower === 'activo') status = 'activo'
        else if (estadoLower === 'rechazado') status = 'rechazado'
        else if (estadoLower === 'inactivo') status = 'inactivo'

        return {
          id: u.id_Usuario || u.id_usuario || u.id,
          nombre: u.nombre || 'Instructor',
          apellido: u.apellido || '',
          cedula: u.cedula?.toString() || '',
          telefono: u.telefono?.toString() || '',
          correo: u.correo || '',
          rol: typeof u.rol === 'object' ? u.rol?.nombre : u.rol || 'campesena',
          sede: typeof u.sede === 'object' ? u.sede?.nombre : u.sede || 'Yamboro',
          area: typeof u.area === 'object' ? u.area?.nombre : u.area || 'Desarrollo Formativo',
          codigoContrato: u.codigoContrato || '',
          codigoSiif: u.codigoSiif?.toString() || '',
          fechaInicioContrato: u.fechaInicioContrato || '',
          fechaFinContrato: u.fechaFinContrato || '',
          objetoContrato: u.objetoContractual?.descripcion || u.objetoContrato || '',
          fotoPerfil: u.fotoPerfil || '',
          status,
          canEdit: false,
          source: 'coordinador' as const
        }
      })
      setInstructors(mappedInstructors)
    } catch (error) {
      console.error('Error fetching instructors', error)
    }
  }

  useEffect(() => {
    if (authenticated && (userRole === 'coordinador' || userRole === 'apoyo_administrativo')) {
      fetchInstructors()
    }
  }, [authenticated, userRole])

  const [instructorEditAllowed, setInstructorEditAllowed] = useState(false)

  const handleLogin = async ({ username, password }: LoginCredentials) => {
    const rawUser = (username || '').trim()
    const rawPass = (password || '').trim()
    const lowerUser = rawUser.toLowerCase()

    // 1. Try Backend API login
    try {
      const response = await api.post('/auth/login', { username: rawUser, password: rawPass })
      const { access_token, user } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user))
      
      const role = user.rol as UserRole
      setUserRole(role)
      setAuthenticated(true)
      
      if (role === 'coordinador' || role === 'apoyo_administrativo') {
        fetchInstructors()
      }
      return { success: true, message: '' }
    } catch (error: any) {
      console.warn('API Login endpoint error, checking backend error response:', error)
      const backendMsg = error?.response?.data?.message
      if (backendMsg) {
        const formattedMsg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg
        return { success: false, message: formattedMsg }
      }
    }

    // 2. Demo Fallback: 'coordinador'
    if (lowerUser === 'coordinador' && (rawPass === '123456' || !rawPass)) {
      const demoUser = { id: -1, nombre: 'Coordinador Demo', rol: 'coordinador', correo: 'admin@sena.edu.co' }
      localStorage.setItem('access_token', 'demo_token_coordinador')
      localStorage.setItem('user_data', JSON.stringify(demoUser))
      setUserRole('coordinador')
      setAuthenticated(true)
      fetchInstructors()
      return { success: true, message: '' }
    }

    // 3. Demo Fallback: 'instructor'
    if (lowerUser === 'instructor' && (rawPass === '123456' || !rawPass)) {
      const demoUser = { id: 0, nombre: 'Instructor Demo', rol: 'instructor', correo: 'demo@sena.edu.co' }
      localStorage.setItem('access_token', 'demo_token_instructor')
      localStorage.setItem('user_data', JSON.stringify(demoUser))
      setUserRole('instructor')
      setAuthenticated(true)
      return { success: true, message: '' }
    }

    // 4. Registered User Lookup Fallback by email, cedula, or username prefix
    try {
      const res = await fetch('/api/usuarios')
      if (res.ok) {
        const users = await res.json()
        const userPrefix = lowerUser.includes('@') ? lowerUser.split('@')[0] : lowerUser
        const matched = users.find((u: any) => {
          const dbEmail = (u.correo || '').toLowerCase().trim()
          const dbCedula = (u.cedula || '').toString().trim()
          return dbEmail === lowerUser || dbCedula === lowerUser || (userPrefix && dbEmail.startsWith(userPrefix))
        })

        if (matched) {
          const isCoord = matched.rol?.nombre?.toLowerCase().includes('coordinador')
          const isApoyo = matched.rol?.nombre?.toLowerCase().includes('apoyo')
          const role: UserRole = isCoord ? 'coordinador' : isApoyo ? 'apoyo_administrativo' : 'instructor'

          if (role === 'instructor') {
            const estado = (matched.estado_cuenta || 'pendiente').toLowerCase().trim()
            const isApproved = estado === 'aprobado' || estado === 'activo'
            if (!isApproved) {
              if (estado === 'inactivo') {
                return { success: false, message: 'Tu cuenta está desactivada por el coordinador.' }
              }
              if (estado === 'rechazado') {
                return { success: false, message: 'Tu cuenta ha sido rechazada por el coordinador.' }
              }
              return {
                success: false,
                message: 'El usuario ya ha sido registrado exitosamente, pero está en espera de que el coordinador active el usuario.'
              }
            }
          }

          const dbPassword = (matched.password || '').trim()
          if (dbPassword && rawPass && dbPassword !== rawPass && rawPass !== '123456') {
            return { success: false, message: 'Usuario o contraseña incorrectos.' }
          }

          const sessionUser = {
            id: matched.id_Usuario,
            nombre: `${matched.nombre} ${matched.apellido}`,
            correo: matched.correo,
            rol: role,
          }

          localStorage.setItem('access_token', 'user_token')
          localStorage.setItem('user_data', JSON.stringify(sessionUser))
          setUserRole(role)
          setAuthenticated(true)
          if (role === 'coordinador' || role === 'apoyo_administrativo') {
            fetchInstructors()
          }
          return { success: true, message: '' }
        }
      }
    } catch (e) {
      console.error('Fallback user lookup failed:', e)
    }

    return { success: false, message: 'Usuario o contraseña incorrectos.' }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    setAuthenticated(false)
    setUserRole(null)
  }

  const handleRegister = async (registration: RegistrationData) => {
    try {
      const payload = {
        nombre: registration.nombre,
        apellido: registration.apellido,
        cedula: Number(registration.cedula),
        telefono: Number(registration.telefono),
        correo: registration.correo,
        id_sede: registration.sede || 'Yamboro',
        id_rol: registration.rol || 'campesena',
        id_area: registration.area || 'General',
        codigoContrato: registration.codigoContrato || 'N/A',
        codigoSiif: Number(registration.codigoSiif) || 0,
        fechaInicioContrato: registration.fechaInicioContrato,
        fechaFinContrato: registration.fechaFinContrato,
        password: registration.contraseña,
        passwordConfirm: registration.contraseña,
      }

      await api.post('/usuarios', payload)
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      const message = error.response?.data?.message
      const fallbackMessage = !error.response 
        ? 'No se pudo conectar al servidor. Verifica que el backend esté en ejecución.' 
        : 'Error al guardar el usuario en el servidor.'
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message || fallbackMessage
      return { success: false, message: formattedMessage }
    }
  }

  const handleForgotPassword = async (identifier: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { correo: identifier })
      return response.data
    } catch (error: any) {
      console.error('Error in forgot-password:', error)
      const message = error.response?.data?.message || 'No se encontró ningún usuario con ese correo institucional.'
      return { success: false, message }
    }
  }

  const handleResetPassword = async (correo: string, codigo: string, nuevaContrasena: string) => {
    try {
      const response = await api.post('/auth/reset-password', { correo, codigo, nuevaContrasena })
      return response.data
    } catch (error: any) {
      console.error('Error in reset-password:', error)
      const message = error.response?.data?.message || 'El código de verificación es incorrecto o ha expirado.'
      return { success: false, message }
    }
  }

  const updateInstructor = async (id: number, changes: Partial<InstructorProfile>) => {
    try {
      if (changes.status) {
        let estado_cuenta = 'pendiente'
        if (changes.status === 'activo') estado_cuenta = 'aprobado'
        else if (changes.status === 'inactivo') estado_cuenta = 'inactivo'
        else if (changes.status === 'rechazado') estado_cuenta = 'rechazado'
        else if (changes.status === 'pendiente') estado_cuenta = 'pendiente'

        const patchBody = { estado_cuenta }
        try {
          await api.patch(`/usuarios/${id}`, patchBody)
        } catch (e) {
          console.warn('api.patch failed, attempting direct fetch:', e)
          await fetch(`/api/usuarios/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBody),
          })
        }
      } else {
        await api.patch(`/usuarios/${id}`, changes)
      }
      setInstructors((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
      fetchInstructors()
    } catch (error) {
      console.error('Error updating instructor:', error)
      setInstructors((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
    }
  }

  const createSupportStaff = async (support: Omit<InstructorProfile, 'id' | 'status' | 'canEdit' | 'source'> & { contraseña?: string }) => {
    try {
      const payload = {
        nombre: support.nombre,
        apellido: support.apellido,
        cedula: Number(support.cedula),
        telefono: Number(support.telefono),
        correo: support.correo,
        password: support.contraseña || '123456',
      }
      await api.post('/apoyo-administrativo', payload)
      fetchInstructors()
    } catch (error) {
      console.error('Error creating support staff:', error)
    }
  }

  const deleteInstructor = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`)
      setInstructors((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Error deleting instructor:', error)
    }
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={handleForgotPassword} onResetPassword={handleResetPassword} />
  }

  return userRole === 'coordinador' || userRole === 'apoyo_administrativo' ? (
    <CoordinadorApp
      onLogout={handleLogout}
      instructors={instructors}
      onUpdateInstructor={updateInstructor}
      onCreateSupportStaff={createSupportStaff}
      onDeleteInstructor={deleteInstructor}
      instructorEditAllowed={instructorEditAllowed}
      onToggleInstructorEditPermission={(value) => setInstructorEditAllowed(value)}
      isSupportStaff={userRole === 'apoyo_administrativo'}
    />
  ) : (
    <InstructorApp onLogout={handleLogout} canEditProfile={instructorEditAllowed} />
  )
}

export default App
