import { useState } from 'react'
import { Login, type LoginCredentials, type RegistrationData } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'
import type { ProfileData } from './componentes/Instructor/Perfil/Perfil'

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

  const [instructors, setInstructors] = useState<InstructorProfile[]>([
    {
      id: 1,
      nombre: 'Ana',
      apellido: 'Marín',
      cedula: '1010101010',
      telefono: '3001112222',
      correo: 'ana.marin@senasofia.edu.co',
      rol: 'campesena',
      sede: 'Yamboro',
      area: 'Desarrollo Formativo',
      codigoContrato: 'CTR-001',
      codigoSiif: 'SI-001',
      fechaInicioContrato: '2025-01-15',
      fechaFinContrato: '2026-01-15',
      objetoContrato: 'Instrucción de programación y metodologías ágiles.',
      fotoPerfil: '',
      status: 'activo',
      canEdit: false,
      source: 'coordinador',
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Gómez',
      cedula: '2020202020',
      telefono: '3002223333',
      correo: 'carlos.gomez@senasofia.edu.co',
      rol: 'regular fit',
      sede: 'Yamboro',
      area: 'Ingeniería',
      codigoContrato: 'CTR-002',
      codigoSiif: 'SI-002',
      fechaInicioContrato: '2025-05-10',
      fechaFinContrato: '2025-12-31',
      objetoContrato: 'Formación en diseño de sistemas y herramientas de gestión.',
      fotoPerfil: '',
      status: 'pendiente',
      canEdit: false,
      source: 'registro',
    },
    {
      id: 3,
      nombre: 'María',
      apellido: 'López',
      cedula: '3030303030',
      telefono: '3004445555',
      correo: 'maria.lopez@senasofia.edu.co',
      rol: 'campesena',
      sede: 'Otra',
      area: 'Ciencias Sociales',
      codigoContrato: 'CTR-003',
      codigoSiif: 'SI-003',
      fechaInicioContrato: '2024-10-01',
      fechaFinContrato: '2025-10-01',
      objetoContrato: 'Facilitación de actividades pedagógicas y comunitarias.',
      fotoPerfil: '',
      status: 'activo',
      canEdit: false,
      source: 'coordinador',
    },
  ])
  const [instructorEditAllowed, setInstructorEditAllowed] = useState(false)

  const handleLogin = ({ username, password }: LoginCredentials) => {
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedPassword = password.trim()

    const validCredentials: Record<string, string> = {
      instructor: '123456',
      coordinador: '123456',
    }

    const isValidUser = Object.prototype.hasOwnProperty.call(validCredentials, normalizedUsername)
    const isValidPassword = normalizedPassword.length > 0 && validCredentials[normalizedUsername] === normalizedPassword

    if (isValidUser && isValidPassword) {
      setUserRole(normalizedUsername as UserRole)
      setAuthenticated(true)
      return true
    }

    return false
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
