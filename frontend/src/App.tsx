import { useState } from 'react'
import { Login } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'

type UserRole = 'instructor' | 'coordinador' | null

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)

  const handleLogin = ({ username, password }: { username: string; password: string }) => {
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

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return userRole === 'coordinador' ? <CoordinadorApp onLogout={handleLogout} /> : <InstructorApp onLogout={handleLogout} />
}

export default App
