import { useState } from 'react'
import { Login, type LoginCredentials, type RegistrationData } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'
import type { ProfileData } from './componentes/Instructor/Perfil/Perfil'
import { api } from './services/api'

type UserRole = 'instructor' | 'coordinador' | null
type InstructorStatus = 'pendiente' | 'activo' | 'inactivo' | 'rechazado'

export interface InstructorProfile extends ProfileData {
  id: number
  status: InstructorStatus
  canEdit: boolean
  source: 'registro' | 'coordinador'
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)

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
      // Opcional: Filtrar para no mostrar al coordinador actual (o dejarlo si quieren verse)
      setInstructors(mappedInstructors)
    } catch (error) {
      console.error('Error fetching instructors', error)
    }
  }
  const [instructorEditAllowed, setInstructorEditAllowed] = useState(false)

  const handleLogin = async ({ username, password }: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      const { access_token, user } = response.data
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user_data', JSON.stringify(user))
      
      setUserRole(user.rol as UserRole)
      setAuthenticated(true)
      
      if (user.rol === 'coordinador' || user.rol === 'apoyo_administrativo') {
        fetchInstructors()
      }
      return true
    } catch (error) {
      console.error('Login error', error)
      return false
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setUserRole(null)
  }

  const handleRegister = async (registration: RegistrationData) => {
    // Mapeo básico temporal de strings a IDs
    const id_sede = registration.sede.toLowerCase() === 'otra' ? '2' : '1'
    let id_rol = '1'
    if (registration.rol.toLowerCase().includes('regular')) id_rol = '2'
    
    try {
      await api.post('/usuarios', {
        nombre: registration.nombre,
        apellido: registration.apellido,
        cedula: Number(registration.cedula),
        telefono: Number(registration.telefono),
        correo: registration.correo,
        password: registration.contraseña,
        passwordConfirm: registration.contraseña,
        id_sede,
        id_rol,
        id_area: '1', // Default por ahora ya que el form de login tiene un input texto libre
        codigoContrato: registration.codigoContrato,
        codigoSiif: Number(registration.codigoSiif) || 0,
        fechaInicioContrato: registration.fechaInicioContrato,
        fechaFinContrato: registration.fechaFinContrato
      })
      alert('Registro completado. Tu cuenta está pendiente de aprobación.')
    } catch (error) {
      console.error('Error en registro', error)
      alert('Error en el registro. Verifica los datos o si la cédula/correo ya existe.')
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

  if (!authenticated) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (userRole === 'coordinador' || userRole === 'apoyo_administrativo') ? (
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
