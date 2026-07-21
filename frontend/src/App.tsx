import { useEffect, useState } from 'react'
import { Login } from './login/Login'
import { InstructorApp } from './componentes/Instructor/InstructorApp'
import { CoordinadorApp } from './componentes/Coordinador/CoordinadorApp'

type UserRole = 'instructor' | 'coordinador' | null
type ThemeMode = 'dark' | 'light'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }

    return (window.localStorage.getItem('sitmi-theme') as ThemeMode | null) ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.style.colorScheme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('sitmi-theme', theme)
  }, [theme])

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

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return userRole === 'coordinador' ? (
    <CoordinadorApp onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <InstructorApp onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
  )
}

export default App
