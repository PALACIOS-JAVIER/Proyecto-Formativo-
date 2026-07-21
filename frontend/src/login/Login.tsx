import { useState } from 'react'
import type { FormEvent } from 'react'

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
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => boolean | void
  onRegister?: (data: RegistrationData) => void
}

export function Login({ onLogin, onRegister }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [registration, setRegistration] = useState<RegistrationData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    rol: 'campesena',
    sede: '',
    area: '',
    codigoContrato: '',
    codigoSiif: '',
  })

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
      onRegister?.(registration)
    }
  }

  const handleRegisterChange = (field: keyof RegistrationData, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  const inputClasses = 'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
  const labelClasses = 'flex flex-col gap-2 text-sm font-medium text-slate-700'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eefcf6_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/70 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:flex-row">
        <section className="flex flex-1 flex-col justify-between bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
              SISTEMA SITMI
            </div>
            <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Gestión técnica, seguimiento claro y decisiones más rápidas.</h1>
            <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
              Centraliza informes, revisa avances y mantén al equipo alineado con una vista operativa moderna.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {[
              ['Gestión eficiente', 'Administra informes y documentación de forma simple y organizada.'],
              ['Control total', 'Monitorea cumplimiento y estado de las actividades en tiempo real.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1 bg-white/90 px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center">
            <div className="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setErrorMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setErrorMessage('')
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Registrarse
              </button>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/90 p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {mode === 'login' ? 'Acceso al sistema' : 'Crear una cuenta'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {mode === 'login' ? 'Bienvenido de nuevo' : 'Completa tus datos'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {mode === 'login'
                    ? 'Ingresa tus credenciales para continuar.'
                    : 'Registra a un nuevo usuario para empezar a trabajar.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>}

                {mode === 'login' ? (
                  <>
                    <label className={labelClasses}>
                      <span>Usuario</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="instructor o coordinador"
                        required
                        className={inputClasses}
                      />
                    </label>

                    <label className={labelClasses}>
                      <span>Contraseña</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="********"
                        required
                        className={inputClasses}
                      />
                    </label>

                    <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                      Iniciar sesión
                    </button>
                  </>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
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
                      <input type="number" value={registration.cedula} onChange={(event) => handleRegisterChange('cedula', event.target.value)} className={inputClasses} required />
                    </label>
                    <label className={labelClasses}>
                      <span>Teléfono</span>
                      <input type="number" value={registration.telefono} onChange={(event) => handleRegisterChange('telefono', event.target.value)} className={inputClasses} required />
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
                      <input value={registration.sede} onChange={(event) => handleRegisterChange('sede', event.target.value)} className={inputClasses} required />
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
                      <span>Contraseña</span>
                      <input type="password" value={registration.contraseña} onChange={(event) => handleRegisterChange('contraseña', event.target.value)} className={inputClasses} required />
                    </label>
                  </div>
                )}

                {mode === 'register' && (
                  <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                    Crear cuenta
                  </button>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
