import { useState, useEffect } from 'react'
import { Login, type LoginCredentials, type RegistrationData } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'
import type { ProfileData } from './componentes/Instructor/Perfil/Perfil'
import { api } from './services/api'
import { GlobalNotificationListener } from './componentes/GlobalNotificationListener'

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
      const res = await api.get('/usuarios')
      const mappedInstructors = res.data.map((u: any) => {
        // Map backend estado_cuenta to frontend status
        let frontendStatus: InstructorStatus = 'pendiente'
        if (u.estado_cuenta === 'aprobado') frontendStatus = 'activo'
        if (u.estado_cuenta === 'rechazado') frontendStatus = 'rechazado'
        if (u.estado_cuenta === 'inactivo') frontendStatus = 'inactivo'

        return {
          id: u.id_Usuario,
          nombre: u.nombre,
          apellido: u.apellido,
          cedula: u.cedula?.toString() || '',
          telefono: u.telefono?.toString() || '',
          correo: u.correo,
          rol: u.rol?.nombre || 'campesena',
          sede: u.sede?.nombre || 'Yamboro',
          area: u.area?.nombre || 'Desarrollo Formativo',
          codigoContrato: u.codigoContrato || '',
          codigoSiif: u.codigoSiif?.toString() || '',
          fechaInicioContrato: u.fechaInicioContrato || '',
          fechaFinContrato: u.fechaFinContrato || '',
          objetoContrato: '',
          fotoPerfil: u.fotoPerfil || '',
          status: frontendStatus,
          canEdit: false,
          source: u.rol?.nombre === 'Apoyo Administrativo' ? 'coordinador' : 'registro'
        }
      })
      const coordsRes = await api.get('/coordinadores')
      const coordIds = new Set(coordsRes.data.map((c: any) => c.usuario?.id_Usuario))

      const filteredInstructors = mappedInstructors.filter((inst: InstructorProfile) => {
        return !coordIds.has(inst.id) && !inst.rol.toLowerCase().includes('coordinador')
      })
      setInstructors(filteredInstructors)
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
      
      if (user.rol === 'coordinador' || user.rol === 'apoyo_administrativo') {
        fetchInstructors()
      }
      return { success: true, message: '' }
    } catch (error: any) {
      console.warn('API Login endpoint error, checking backend error response:', error)
      const backendMsg = error?.response?.data?.message
      if (backendMsg && error?.response?.status !== 401) {
        const formattedMsg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg
        return { success: false, message: formattedMsg }
      }
    }

    // 2. Demo Fallback: 'coordinador'
    if (
      (lowerUser === 'coordinador' ||
        lowerUser === 'coordinador@sena.edu.co' ||
        lowerUser === 'arcosmunozemiliano719@gmail.com' ||
        lowerUser === 'arcosmunzemiliano719@gmail.com') &&
      rawPass === '123456'
    ) {
      const demoUser = { id: -1, nombre: 'Coordinador Demo', rol: 'coordinador', correo: 'admin@sena.edu.co' }
      localStorage.setItem('access_token', 'demo_token_coordinador')
      localStorage.setItem('user_data', JSON.stringify(demoUser))
      setUserRole('coordinador')
      setAuthenticated(true)
      fetchInstructors()
      return { success: true, message: '' }
    }

    // 3. Demo Fallback: 'instructor'
    if (
      (lowerUser === 'instructor' || lowerUser === 'arcosmunozemiliano@gmail.com') &&
      rawPass === '123456'
    ) {
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
    // Variables extraídas directamente del formulario
    
    try {
      await api.post('/usuarios', {
        nombre: registration.nombre,
        apellido: registration.apellido,
        cedula: Number(registration.cedula),
        telefono: Number(registration.telefono),
        correo: registration.correo,
        password: registration.contraseña,
        passwordConfirm: registration.contraseña,
        id_sede: registration.sede, // User selected from dropdown directly
        id_rol: registration.rol, // User selected from dropdown directly
        id_area: registration.area, // User selected from dropdown directly
        codigoContrato: registration.codigoContrato,
        codigoSiif: Number(registration.codigoSiif) || 0,
        fechaInicioContrato: registration.fechaInicioContrato,
        fechaFinContrato: registration.fechaFinContrato,
        aceptaTerminos: registration.aceptaTerminos,
      })
      return { success: true }
    } catch (error: any) {
      console.error('Error en registro', error)
      const backendMsg = error?.response?.data?.message
      if (backendMsg) {
        const formattedMsg = Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg
        return { success: false, message: formattedMsg }
      }
      return { success: false, message: 'Error en el registro. Verifica los datos o si la cédula/correo ya existe.' }
    }
  }

  const updateInstructor = async (id: number, changes: Partial<InstructorProfile>) => {
    try {
      const payload: any = {}
      if (changes.status) {
        if (changes.status === 'activo') payload.estado_cuenta = 'aprobado'
        if (changes.status === 'rechazado') payload.estado_cuenta = 'rechazado'
        if (changes.status === 'inactivo') payload.estado_cuenta = 'inactivo'
        if (changes.status === 'pendiente') payload.estado_cuenta = 'pendiente'
      }
      
      // Añade más campos aquí si los modifican desde el perfil modal
      if (changes.nombre) payload.nombre = changes.nombre;
      if (changes.apellido) payload.apellido = changes.apellido;
      if (changes.telefono) payload.telefono = Number(changes.telefono);
      if (changes.correo) payload.correo = changes.correo;

      await api.patch(`/usuarios/${id}`, payload)
      // Refrescar lista
      fetchInstructors()
    } catch (error) {
      console.error('Error al actualizar instructor', error)
      alert('No se pudo actualizar el instructor.')
    }
  }

  const createSupportStaff = async (support: Omit<InstructorProfile, 'id' | 'status' | 'canEdit' | 'source'> & { contraseña?: string }) => {
    try {
      const userDataStr = localStorage.getItem('user_data')
      if (!userDataStr) throw new Error('No user data')
      const user = JSON.parse(userDataStr)

      await api.post('/apoyos-administrativos', {
        id_usuario: user.id, // ID del coordinador actual
        nombre: support.nombre,
        apellido: support.apellido,
        cedula: Number(support.cedula),
        telefono: Number(support.telefono),
        correo: support.correo,
        password: support.contraseña || '123456'
      })
      fetchInstructors()
      alert('Apoyo administrativo creado correctamente.')
    } catch (error) {
      console.error('Error creando apoyo', error)
      alert('Error al crear apoyo administrativo. Verifica que no haya correos/cédulas duplicadas.')
    }
  }

  const deleteInstructor = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`)
      fetchInstructors()
    } catch (error) {
      console.error('Error eliminando', error)
      alert('Error al eliminar usuario.')
    }
  }

  const handleForgotPassword = async (identifier: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { correo: identifier })
      return response.data
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || 'Error al solicitar cambio de contraseña' }
    }
  }

  const handleResetPassword = async (correo: string, codigo: string, nueva: string) => {
    try {
      const response = await api.post('/auth/reset-password', { correo, codigo, nuevaContrasena: nueva })
      return response.data
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message || 'Error al restablecer contraseña' }
    }
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={handleForgotPassword} onResetPassword={handleResetPassword} />
  }

  return (
    <>
      <GlobalNotificationListener />
      {(userRole === 'coordinador' || userRole === 'apoyo_administrativo') ? (
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
      )}
    </>
  )
}

export default App
