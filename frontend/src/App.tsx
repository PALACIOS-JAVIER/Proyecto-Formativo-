import './App.css'
import { Login } from './Login'

function App() {
  const handleLogin = ({ username, password }: { username: string; password: string }) => {
    console.log('Login attempt:', username, password)
  }

  return <Login onLogin={handleLogin} />
}

export default App
