import { useState } from 'react'
import type { FormEvent } from 'react'
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
  contraseña: string
  rol: 'campesena' | 'regular fit' | 'apoyo administrativo'
  sede: string
  area: string
  codigoContrato: string
  codigoSiif: string
  fechaInicioContrato: string
  fechaFinContrato: string
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => boolean | void
  onRegister?: (data: RegistrationData) => void
  onForgotPassword?: () => void
}

export function Login({ onLogin, onRegister, onForgotPassword }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [registration, setRegistration] = useState<RegistrationData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    rol: 'campesena',
    sede: 'Yamboro',
    area: '',
    codigoContrato: '',
    codigoSiif: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
  })

  const inputClasses = 'input-field'
  const labelClasses = 'label-field'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (mode === 'login') {
      if (!username.trim() || !password.trim()) {
        setErrorMessage('Por favor ingresa usuario y contraseña.')
        return
      }

      const loginResult = onLogin?.({ username, password })
      if (loginResult === false) {
        setErrorMessage('Usuario o contraseña incorrectos.')
        return
      }
    } else {
      if (!registration.fechaInicioContrato || !registration.fechaFinContrato) {
        setErrorMessage('Por favor ingresa fecha de inicio y fin del contrato.')
        return
      }

      if (new Date(registration.fechaInicioContrato) > new Date(registration.fechaFinContrato)) {
        setErrorMessage('La fecha de inicio debe ser anterior a la fecha fin del contrato.')
        return
      }

      if (registration.contraseña !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.')
        return
      }

      onRegister?.(registration)
    }
  }

  const handleRegisterChange = (field: keyof RegistrationData, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  const goToRegister = () => {
    setMode('register')
    setErrorMessage('')
  }

  const goToLogin = () => {
    setMode('login')
    setErrorMessage('')
  }

  return (
    <main className="login-shell">
      <header className="site-header">
        <div className="site-header-inner">
          {/* Reemplaza esta ruta por el logo institucional del SENA */}
          <img src="./assets/Imagenes_Login/LogoSena.png" alt="SENA" className="site-logo" />
        </div>
      </header>

      <div className="login-page">
        <div className={`login-card ${mode === 'register' ? 'login-card--wide' : ''}`}>
          <div className="card-header">
            <p className="section-label">
              {mode === 'login' ? 'Acceso al sistema' : 'Crear una cuenta'}
            </p>
            <h2 className="form-heading">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Completa tus datos'}
            </h2>
            <p className="form-copy">
              {mode === 'login'
                ? 'Ingresa tus credenciales para continuar.'
                : 'Completa tus datos para solicitar acceso a la plataforma.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={mode === 'login' ? 'login-form' : 'register-form'}>
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {mode === 'login' ? (
              <>
                <div className="floating-field">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder=" "
                    required
                    className={`${inputClasses} floating-input`}
                  />
                  <label htmlFor="username" className="floating-label">
                    Usuario
                  </label>
                </div>

                <div className="floating-field">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder=" "
                    required
                    className={`${inputClasses} floating-input`}
                  />
                  <label htmlFor="password" className="floating-label">
                    Contraseña
                  </label>
                </div>

                <div className="login-options-row">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    Recordarme
                  </label>

                  <button
                    type="button"
                    onClick={() => onForgotPassword?.()}
                    className="link-button_password"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button type="submit" className="button-primary">
                  Iniciar sesión
                </button>

                <div className="switch-mode-row">
                  <span>¿No tienes cuenta?</span>
                  <button type="button" onClick={goToRegister} className="link-button">
                    Registrarse
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="registration-grid">
                  <label className={labelClasses}>
                    <span>Nombre</span>
                    <input value={registration.nombre} onChange={(event) => handleRegisterChange('nombre', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Apellido</span>
                    <input value={registration.apellido} onChange={(event) => handleRegisterChange('apellido', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Cédula</span>
                    <input value={registration.cedula} onChange={(event) => handleRegisterChange('cedula', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Teléfono</span>
                    <input value={registration.telefono} onChange={(event) => handleRegisterChange('telefono', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Correo institucional</span>
                    <input type="email" value={registration.correo} onChange={(event) => handleRegisterChange('correo', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Rol</span>
                    <select value={registration.rol} onChange={(event) => handleRegisterChange('rol', event.target.value)} className={inputClasses} required>
                      <option value="campesena">Campesena</option>
                      <option value="regular fit">Regular Fit</option>
                      <option value="apoyo administrativo">Apoyo Administrativo</option>
                    </select>
                  </label>
                  <label className={labelClasses}>
                    <span>Sede</span>
                    <select value={registration.sede} onChange={(event) => handleRegisterChange('sede', event.target.value)} className={inputClasses} required>
                      <option value="Yamboro">Yamboro</option>
                      <option value="Otra">Otra</option>
                    </select>
                  </label>
                  <label className={labelClasses}>
                    <span>Área</span>
                    <input value={registration.area} onChange={(event) => handleRegisterChange('area', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Código de contrato</span>
                    <input value={registration.codigoContrato} onChange={(event) => handleRegisterChange('codigoContrato', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Código SIIF</span>
                    <input value={registration.codigoSiif} onChange={(event) => handleRegisterChange('codigoSiif', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Fecha inicio del contrato</span>
                    <input type="date" value={registration.fechaInicioContrato} onChange={(event) => handleRegisterChange('fechaInicioContrato', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Fecha fin del contrato</span>
                    <input type="date" value={registration.fechaFinContrato} onChange={(event) => handleRegisterChange('fechaFinContrato', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Contraseña</span>
                    <input type="password" value={registration.contraseña} onChange={(event) => handleRegisterChange('contraseña', event.target.value)} className={inputClasses} required />
                  </label>
                  <label className={labelClasses}>
                    <span>Confirmar contraseña</span>
                    <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClasses} required />
                  </label>
                </div>

                <button type="submit" className="button-primary register-submit">
                  Crear cuenta
                </button>

                <div className="switch-mode-row">
                  <span>¿Ya tienes cuenta?</span>
                  <button type="button" onClick={goToLogin} className="link-button">
                    Inicia sesión aquí
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
