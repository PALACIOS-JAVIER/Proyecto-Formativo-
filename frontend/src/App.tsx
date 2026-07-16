import { useState } from 'react'
import { Login } from './login/Login'
import { InstructorApp } from './componentes/Insructor/InstructorApp'

function App() {
  const [authenticated, setAuthenticated] = useState(false)

  const handleLogin = ({ username, password }: { username: string; password: string }) => {
    const isValid = username.trim().length > 0 && password.trim().length > 0
    if (isValid) {
      setAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setAuthenticated(false)
  }

  return authenticated ? <InstructorApp onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
}

export default App
