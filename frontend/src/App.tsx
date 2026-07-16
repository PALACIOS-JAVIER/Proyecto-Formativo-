import { useState } from 'react'
import { Login } from './login/Login'
import { InstructorApp } from './componentes/Insructor/InstructorApp'

function App() {
  const [authenticated, setAuthenticated] = useState(false)

  const handleLogin = ({ username, password }: { username: string; password: string }) => {
    if (username && password) {
      setAuthenticated(true)
    }
  }

  return authenticated ? <InstructorApp /> : <Login onLogin={handleLogin} />
}

export default App
