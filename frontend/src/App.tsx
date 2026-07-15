import { Login } from './login/Login'

function App() {
  const handleLogin = ({ username, password }: { username: string; password: string }) => {
    console.log('Login attempt:', username, password)
  }

  return <Login onLogin={handleLogin} />
}

export default App
