import { useState } from 'react'
import './Login.css'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegistrationData {
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  rol: 'campesena' | 'regular fit' | 'apoyo administrativo'
  sede: string
  area: string
  codigoContrato: string
  codigoSiif: string
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => void
  onRegister?: (data: RegistrationData) => void
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [registration, setRegistration] = useState<RegistrationData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    rol: 'campesena',
    sede: '',
    area: '',
    codigoContrato: '',
    codigoSiif: '',
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    if (mode === 'login') {
      onLogin?.({ username, password })
    } else {
      onRegister?.(registration)
    }
  }

  const handleRegisterChange = (field: keyof RegistrationData, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }))
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
            <p className="form-label">{mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</p>
            <p className="form-description">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Completa el formulario para crear una nueva cuenta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'login' ? (
              <>
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
                </div>
                <div className="register-footer">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setMode('register')
                      setSubmitted(false)
                    }}
                  >
                    Regístrate
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="register-grid">
                  <label>
                    Nombre
                    <input
                      type="text"
                      value={registration.nombre}
                      onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Apellido
                    <input
                      type="text"
                      value={registration.apellido}
                      onChange={(e) => handleRegisterChange('apellido', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Cédula
                    <input
                      type="number"
                      value={registration.cedula}
                      onChange={(e) => handleRegisterChange('cedula', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      type="number"
                      value={registration.telefono}
                      onChange={(e) => handleRegisterChange('telefono', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Correo institucional
                    <input
                      type="email"
                      value={registration.correo}
                      onChange={(e) => handleRegisterChange('correo', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Rol
                    <select
                      value={registration.rol}
                      onChange={(e) => handleRegisterChange('rol', e.target.value)}
                      required
                    >
                      <option value="campesena">Campesena</option>
                      <option value="regular fit">Regular Fit</option>
                      <option value="apoyo administrativo">Apoyo Administrativo</option>
                    </select>
                  </label>
                  <label>
                    Sede
                    <input
                      type="text"
                      value={registration.sede}
                      onChange={(e) => handleRegisterChange('sede', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Área
                    <input
                      type="text"
                      value={registration.area}
                      onChange={(e) => handleRegisterChange('area', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Código de contrato
                    <input
                      type="text"
                      value={registration.codigoContrato}
                      onChange={(e) => handleRegisterChange('codigoContrato', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Código SIIF
                    <input
                      type="text"
                      value={registration.codigoSiif}
                      onChange={(e) => handleRegisterChange('codigoSiif', e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-footer">
                  <button type="submit" className="login-button">
                    Crear cuenta
                  </button>
                </div>
              </>
            )}
          </form>

          {submitted ? (
            <div className="submit-message">
              {mode === 'login' ? (
                <>Usuario: <strong>{username}</strong> enviado.</>
              ) : (
                <>Registro enviado para <strong>{registration.nombre} {registration.apellido}</strong>.</>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
