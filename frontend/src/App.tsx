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
        const res = await fetch('http://localhost:3000/api/usuarios')
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
      return true
    } catch (error) {
      console.warn('API Login endpoint error, attempting fallbacks:', error)
    }

    // 2. Demo Fallback: 'coordinador'
    if (lowerUser === 'coordinador' && (rawPass === '123456' || !rawPass)) {
      const demoUser = { id: -1, nombre: 'Coordinador Demo', rol: 'coordinador', correo: 'admin@sena.edu.co' }
      localStorage.setItem('access_token', 'demo_token_coordinador')
      localStorage.setItem('user_data', JSON.stringify(demoUser))
      setUserRole('coordinador')
      setAuthenticated(true)
      fetchInstructors()
      return true
    }

    // 3. Demo Fallback: 'instructor'
    if (lowerUser === 'instructor' && (rawPass === '123456' || !rawPass)) {
      const demoUser = { id: 0, nombre: 'Instructor Demo', rol: 'instructor', correo: 'demo@sena.edu.co' }
      localStorage.setItem('access_token', 'demo_token_instructor')
      localStorage.setItem('user_data', JSON.stringify(demoUser))
      setUserRole('instructor')
      setAuthenticated(true)
      return true
    }

    // 4. Registered User Lookup Fallback by email, cedula, or username prefix
    try {
      const res = await fetch('http://localhost:3000/api/usuarios')
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
            if (estado === 'inactivo' || estado === 'pendiente' || estado === 'rechazado') {
              console.warn('Instructor account is not active or approved:', matched.estado_cuenta)
              return false
            }
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
          return true
        }
      }
    } catch (e) {
      console.error('Fallback user lookup failed:', e)
    }

    return false
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
      let formattedMessage = Array.isArray(message) ? message.join(', ') : message || 'Error al guardar el usuario en el servidor.'
      if (typeof formattedMessage === 'string') {
        if (formattedMessage.toLowerCase() === 'internal server error') {
          formattedMessage = 'La cédula ingresada o el correo electrónico ya se encuentran registrados en el sistema.'
        } else if (formattedMessage.toLowerCase().includes('network error') || !error.response) {
          formattedMessage = 'No fue posible conectar con el servidor central. Verifique su conexión o intente nuevamente más tarde.'
        }
      }
      return { success: false, message: formattedMessage }
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
          await fetch(`http://localhost:3000/api/usuarios/${id}`, {
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
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
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
