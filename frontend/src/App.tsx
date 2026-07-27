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
      // Mapear los datos del backend al formato que espera el frontend si es necesario
      const mappedInstructors = res.data.map((u: any) => ({
        id: u.id_Usuario,
        nombre: u.nombre,
        apellido: u.apellido,
        cedula: u.cedula?.toString() || '',
        telefono: u.telefono?.toString() || '',
        correo: u.correo,
        rol: u.rol?.nombre || 'campesena',
        sede: u.sede?.nombre || 'Yamboro',
        area: u.area?.nombre || 'Desarrollo Formativo',
        codigoContrato: '',
        codigoSiif: '',
        fechaInicioContrato: '',
        fechaFinContrato: '',
        objetoContrato: '',
        fotoPerfil: u.fotoPerfil || '',
        status: 'activo',
        canEdit: false,
        source: 'coordinador'
      }))
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
      
      if (user.rol === 'coordinador') {
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

  const handleRegister = (registration: RegistrationData) => {
    const { contraseña, ...profile } = registration
    const newInstructor: InstructorProfile = {
      id: Date.now(),
      ...profile,
      objetoContrato: registration.objetoContrato ?? '',
      fotoPerfil: '',
      status: 'pendiente',
      canEdit: false,
      source: 'registro',
    }

    setInstructors((current) => [...current, newInstructor])
  }

  const updateInstructor = (id: number, changes: Partial<InstructorProfile>) => {
    setInstructors((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  const createSupportStaff = (support: Omit<InstructorProfile, 'id' | 'status' | 'canEdit' | 'source'> & { contraseña?: string }) => {
    setInstructors((current) => [
      ...current,
      {
        id: Date.now(),
        ...support,
        status: 'activo',
        canEdit: false,
        source: 'coordinador',
      },
    ])
  }

  const deleteInstructor = (id: number) => {
    setInstructors((current) => current.filter((item) => item.id !== id))
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
  }

  return userRole === 'coordinador' ? (
    <CoordinadorApp
      onLogout={handleLogout}
      instructors={instructors}
      onUpdateInstructor={updateInstructor}
      onCreateSupportStaff={createSupportStaff}
      onDeleteInstructor={deleteInstructor}
      instructorEditAllowed={instructorEditAllowed}
      onToggleInstructorEditPermission={(value) => setInstructorEditAllowed(value)}
    />
  ) : (
    <InstructorApp onLogout={handleLogout} canEditProfile={instructorEditAllowed} />
  )
}

export default App
