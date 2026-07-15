import { FormEvent, useState } from 'react'
import './Login.css'

export interface LoginCredentials {
  username: string
  password: string
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    onLogin?.({ username, password })
  }

  return (
    <main className="login-page">
      <section className="panel panel--brand">
        <div className="brand-card">
          <div className="brand-badge">SITMI</div>
          <h1>Sistema de Información Técnica</h1>
          <p className="brand-subtitle">de Monitoreo e Instructores</p>

          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <div>
              <h2>Gestión Eficiente</h2>
              <p>Administra informes y documentación de manera simple y organizada.</p>
            </div>
          </div>

          <div className="feature-card">
            <span className="feature-icon">✓</span>
            <div>
              <h2>Control Total</h2>
              <p>Seguimiento en tiempo real del cumplimiento y estado de informes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel--form">
        <div className="form-card">
          <div className="form-header">
            <p className="form-label">Iniciar Sesión</p>
            <p className="form-description">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Nombre de usuario
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="instructor o coordinador"
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </label>

            <div className="form-footer">
              <button type="submit" className="login-button">
                Iniciar Sesión
              </button>
              <a href="#" className="link-secondary">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>

          <div className="register-footer">
            ¿No tienes cuenta? <a href="#">Regístrate</a>
          </div>

          {submitted ? (
            <div className="submit-message">
              Usuario: <strong>{username}</strong> enviado.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
