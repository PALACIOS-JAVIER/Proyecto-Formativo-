import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import {
  LuUser, LuBuilding2, LuShieldCheck,
  LuCircleAlert, LuCircleCheck,
  LuEye, LuEyeOff, LuChevronDown,
} from 'react-icons/lu'
import './Login.css'
import senaLogo from '../assets/Imagenes_Login/Sena.png'

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
  objetoContrato?: string
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => boolean | void | Promise<boolean | void | { success: boolean; message?: string }>
  onRegister?: (data: RegistrationData) => Promise<{ success: boolean; message?: string } | void> | void
  onForgotPassword?: (identifier: string) => Promise<{ success: boolean; message?: string; correo?: string; devCode?: string }> | boolean | void
  onResetPassword?: (correo: string, codigo: string, nuevaContrasena: string) => Promise<{ success: boolean; message?: string }> | void
}

export function Login({ onLogin, onRegister, onForgotPassword, onResetPassword }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)
  const [targetEmail, setTargetEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [registration, setRegistration] = useState<RegistrationData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    rol: '' as any,
    sede: '',
    area: '',
    codigoContrato: 'COD-',
    codigoSiif: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
  })

  // ── Mostrar/ocultar contraseña ──────────────────────────────────────
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  // ── Touched states para validación en tiempo real ───────────────────
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const touch = (field: string) => setTouched(p => ({ ...p, [field]: true }))

  // --- Constantes UI extraídas para evitar errores TS ---
  const LABEL = "flex flex-col gap-1.5 text-sm font-semibold text-slate-700"
  const Req = () => <span className="text-red-500 ml-0.5">*</span>
  const BASE_INPUT = "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#39A900]/20 focus:border-[#39A900]"
  
  const fieldState = (_value: string, isValid: boolean, isTouched: boolean) => {
    if (!isTouched) return 'default'
    return isValid ? 'valid' : 'invalid'
  }
  
  const dynInput = (state: string) => {
    let classes = BASE_INPUT
    if (state === 'invalid') classes += ' border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
    else if (state === 'valid') classes += ' border-[#39A900]/50 bg-[#39A900]/5 focus:border-[#39A900]'
    return classes
  }

  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
    </div>
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setMode('reset')
    }
  }, [])

  const [sedesList, setSedesList] = useState<any[]>([])
  const [rolesList, setRolesList] = useState<any[]>([])
  const [areasList, setAreasList] = useState<any[]>([])

  useEffect(() => {
    if (mode === 'register') {
      const fallbackSedes = [{ id_sede: 1, nombre: 'Yamboro' }]
      const fallbackRoles = [
        { id_rol: 1, nombre: 'regular fit', sede: { id_sede: 1, nombre: 'Yamboro' } },
        { id_rol: 2, nombre: 'campesena', sede: { id_sede: 1, nombre: 'Yamboro' } },
      ]
      const fallbackAreas = [
        { id_area: 1, nombre: 'Construcción', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 2, nombre: 'Agricola', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 3, nombre: 'Agropecuaria', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 4, nombre: 'Ambiental', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 5, nombre: 'Informatica', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 6, nombre: 'Cocina', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 7, nombre: 'Deportes', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 8, nombre: 'Etica', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 9, nombre: 'Comunicación', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 10, nombre: 'Seguridad Y Salud En El Trabajo', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 11, nombre: 'Emprendimiento', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 12, nombre: 'Produccion Pecuaria', rol: { id_rol: 2, nombre: 'campesena' } },
        { id_area: 13, nombre: 'Agricola', rol: { id_rol: 2, nombre: 'campesena' } },
        { id_area: 14, nombre: 'Opereciones Forestales', rol: { id_rol: 2, nombre: 'campesena' } },
        { id_area: 15, nombre: 'Comunicación', rol: { id_rol: 2, nombre: 'campesena' } },
        { id_area: 16, nombre: 'Bilinguismo', rol: { id_rol: 1, nombre: 'regular fit' } },
        { id_area: 17, nombre: 'Idiomas', rol: { id_rol: 2, nombre: 'campesena' } },
      ]

      Promise.all([
        fetch('/api/sedes').then(r => r.ok ? r.json() : fallbackSedes).catch(() => fallbackSedes),
        Promise.resolve(fallbackRoles), // Forzar roles locales para que aparezcan exactos
        fetch('/api/areas').then(r => r.ok ? r.json() : fallbackAreas).catch(() => fallbackAreas),
      ]).then(([s, _r, a]) => {
        const validSedes = ((s && s.length > 0) ? s : fallbackSedes).filter((sede: any) => sede.nombre?.toLowerCase() !== 'otra')
        const validRoles = fallbackRoles // Siempre usar los predefinidos para asegurar que salgan ambos
        setSedesList(validSedes)
        setRolesList(validRoles)
        setAreasList((a && a.length > 0) ? a : fallbackAreas)
      }).catch((error) => {
        console.error('Error al cargar catálogos desde el servidor, usando respaldo:', error)
        setSedesList(fallbackSedes)
        setRolesList(fallbackRoles)
        setAreasList(fallbackAreas)
      })
    }
  }, [mode])

  const inputClasses = 'input-field'

  const filteredRoles = rolesList.filter(r => {
    const isNotApoyo = !r.nombre?.toLowerCase().includes('apoyo')
    if (!isNotApoyo) return false
    return !registration.sede ||
      r.sede?.id_sede?.toString() === registration.sede.toString() ||
      r.sede?.nombre?.toLowerCase() === registration.sede.toLowerCase() ||
      r.id_sede?.toString() === registration.sede.toString()
  })
  const filteredAreas = areasList.filter(a =>
    !registration.rol ||
    a.rol?.id_rol?.toString() === registration.rol.toString() ||
    a.rol?.nombre?.toLowerCase() === registration.rol.toLowerCase() ||
    a.id_rol?.toString() === registration.rol.toString()
  )

  // ── Validaciones en tiempo real ─────────────────────────────────────
  const vCedula = /^\d+$/.test(registration.cedula) && registration.cedula.length >= 6
  const vTelefono = /^\d{7,15}$/.test(registration.telefono)
  const vCorreo = registration.correo.includes('@')
  const vConfirm = registration.contraseña !== '' && confirmPassword === registration.contraseña

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (mode === 'forgot') {
      if (!forgotSubmitted) {
        if (!forgotIdentifier.trim()) {
          setErrorMessage('Ingresa tu usuario o correo institucional.')
          return
        }

        setLoading(true)
        const result = await onForgotPassword?.(forgotIdentifier)
        setLoading(false)

        if (result && typeof result === 'object') {
          if (!result.success) {
            setErrorMessage(result.message || 'No se encontró ningún usuario con ese correo institucional.')
            return
          }
          if (result.correo) setTargetEmail(result.correo)
          
          setSuccessMessage(`Hemos enviado un código de seguridad de 6 dígitos a tu correo ${result.correo}.`)
          setForgotSubmitted(true)
        } else if (result === false) {
          setErrorMessage('No se encontró ningún usuario registrado con ese correo institucional o usuario.')
          return
        } else {
          setForgotSubmitted(true)
        }
        return
      } else {
        if (!verificationCode.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
          setErrorMessage('Por favor completa todos los campos para cambiar tu contraseña.')
          return
        }
        if (newPassword.length < 6) {
          setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.')
          return
        }
        if (newPassword !== confirmNewPassword) {
          setErrorMessage('Las contraseñas ingresadas no coinciden.')
          return
        }

        setLoading(true)
        const resetResult = await onResetPassword?.(targetEmail || forgotIdentifier, verificationCode, newPassword)
        setLoading(false)

        if (resetResult && !resetResult.success) {
          setErrorMessage(resetResult.message || 'Error al cambiar la contraseña. Verifica el código.')
          return
        }
        setSuccessMessage('¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...')
        setTimeout(() => {
          goToLogin()
          setSuccessMessage('Contraseña actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.')
        }, 2500)
        return
      }
    }

    if (mode === 'login') {
      if (!username.trim() || !password.trim()) {
        setErrorMessage('Por favor ingresa usuario y contraseña.')
        return
      }

      // Solicitar permiso de notificaciones con la interacción del usuario
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        const hasPrompted = localStorage.getItem('notif_prompt_dismissed');
        if (!hasPrompted) {
          Notification.requestPermission().then((perm) => {
            if (perm !== 'granted') {
              localStorage.setItem('notif_prompt_dismissed', 'true');
            }
          }).catch(() => {});
        }
      }

      try {
        setLoading(true)
        const loginResult = await onLogin?.({ username, password })
        if (typeof loginResult === 'object' && loginResult !== null && 'success' in loginResult) {
          if (!loginResult.success) {
            setErrorMessage(loginResult.message || 'Usuario o contraseña incorrectos.')
            return
          }
        } else if (loginResult === false) {
          setErrorMessage('Usuario o contraseña incorrectos.')
          return
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'Usuario o contraseña incorrectos.'
        setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg)
        return
      } finally {
        setLoading(false)
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
      if (!registration.correo.includes('@')) {
        setErrorMessage('Por favor, ingresa un correo electrónico válido.')
        return
      }
      if (registration.contraseña !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.')
        return
      }
      try {
        setLoading(true)
        const result = await onRegister?.(registration)
        if (result && result.success === false) {
          setErrorMessage(result.message || 'Error al registrar la cuenta.')
          return
        }
        setSuccessMessage('¡Registro exitoso! Redirigiendo al inicio de sesión...')
        setTimeout(() => {
          goToLogin()
          setSuccessMessage('')
        }, 2000)
      } catch (error: any) {
        setErrorMessage('Ocurrió un error inesperado durante el registro.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRegisterChange = (field: keyof RegistrationData, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  const goToRegister = () => { setMode('register'); setErrorMessage('') }
  // ── Helpers para campo con icono ojo ───────────────────────────────
  const PwdToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#39A900] transition-colors p-0.5 cursor-pointer"
      tabIndex={-1}
    >
      {show ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
    </button>
  )

  const goToLogin = () => {
    setMode('login')
    setErrorMessage('')
    setSuccessMessage('')
    setForgotSubmitted(false)
    setForgotIdentifier('')
    setVerificationCode('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  const goToForgot = () => {
    setMode('forgot')
    setErrorMessage('')
    setSuccessMessage('')
    setForgotSubmitted(false)
  }

  return (
    <main className="login-shell">
      <div className="login-page">
        <img src={senaLogo} alt="SENA" className="site-logo" />

        <div className={`login-card ${mode === 'register' ? 'login-card--wide' : ''}`}>
          {/* ── Encabezado ── */}
          <div className="card-header mb-6 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#39A900]/10 text-[#2D8600] text-xs font-bold uppercase tracking-wider rounded-full border border-[#39A900]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39A900] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39A900]" />
                </span>
                {mode === 'login' && 'Acceso al sistema'}
                {mode === 'register' && 'CREAR UNA CUENTA'}
                {mode === 'forgot' && 'Recuperar acceso'}
                {mode === 'reset' && 'Restablecer acceso'}
              </span>
              {mode === 'register' && (
                <span className="text-xs text-slate-400 font-semibold tracking-wide hidden sm:inline">Formulario institucional</span>
              )}
            </div>
            <h2 className="form-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {mode === 'login' && 'Bienvenido de nuevo'}
              {mode === 'register' && 'Completa tus datos'}
              {mode === 'forgot' && '¿Olvidaste tu contraseña?'}
              {mode === 'reset' && 'Restablecer contraseña'}
            </h2>
            <p className="form-copy text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'login' && 'Ingresa tus credenciales para continuar.'}
              {mode === 'register' && 'Diligencia la información correspondiente para solicitar acceso a la plataforma.'}
              {mode === 'forgot' &&
                (forgotSubmitted
                  ? 'Ingresa el código que te enviamos al correo institucional y escribe tu nueva contraseña.'
                  : 'Ingresa tu usuario o correo institucional y te enviaremos un código de seguridad para restablecer tu contraseña.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={mode === 'register' ? 'register-form' : 'login-form'}>

            {/* ════════════════════ MODO FORGOT ════════════════════ */}
            {mode === 'forgot' ? (
              forgotSubmitted ? (
                <>
                  <div className="floating-field">
                    <input
                      id="verification-code"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value)}
                      placeholder=" "
                      required
                      className={`${inputClasses} floating-input`}
                    />
                    <label htmlFor="verification-code" className="floating-label">
                      Código de verificación (6 dígitos)
                    </label>
                  </div>

                  <div className="floating-field">
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder=" "
                      required
                      className={`${inputClasses} floating-input`}
                    />
                    <label htmlFor="new-password" className="floating-label">
                      Nueva contraseña
                    </label>
                  </div>

                  <div className="floating-field">
                    <input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                      placeholder=" "
                      required
                      className={`${inputClasses} floating-input`}
                    />
                    <label htmlFor="confirm-new-password" className="floating-label">
                      Confirmar nueva contraseña
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="button-primary">
                    {loading ? 'Validando código...' : 'Guardar nueva contraseña'}
                  </button>

                  <div className="switch-mode-row" style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSubmitted(false)
                        setVerificationCode('')
                        setNewPassword('')
                        setConfirmNewPassword('')
                        setErrorMessage('')
                        setSuccessMessage('')
                      }}
                      className="link-button"
                    >
                      Volver a solicitar código
                    </button>
                  </div>
                  <div className="switch-mode-row">
                    <button type="button" onClick={goToLogin} className="link-button">
                      Volver a iniciar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="floating-field">
                    <input
                      id="forgot-identifier"
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder=" "
                      required
                      className={`${inputClasses} floating-input`}
                    />
                    <label htmlFor="forgot-identifier" className="floating-label">Usuario o correo institucional</label>
                  </div>
                  <button type="submit" className="button-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Enviar instrucciones'}
                  </button>
                  <div className="switch-mode-row">
                    <button type="button" onClick={goToLogin} className="link-button">Volver a iniciar sesión</button>
                  </div>
                </>
              )

            /* ════════════════════ MODO RESET ════════════════════ */
            ) : mode === 'reset' ? (
              <>
                <div className="space-y-4">
                  {/* Nueva contraseña */}
                  <div className={LABEL}>
                    <span>Nueva contraseña<Req /></span>
                    <div className="relative">
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        value={registration.contraseña}
                        onChange={(e) => handleRegisterChange('contraseña', e.target.value)}
                        onBlur={() => touch('contraseña')}
                        autoComplete="new-password"
                        className={`${dynInput(fieldState(registration.contraseña, registration.contraseña.length >= 6, !!touched.contraseña))} pr-10`}
                        required
                      />
                      <PwdToggle show={showRegPwd} onToggle={() => setShowRegPwd(p => !p)} />
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className={LABEL}>
                    <span>Confirmar nueva contraseña<Req /></span>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => touch('confirmPassword')}
                        autoComplete="new-password"
                        className={`${dynInput(fieldState(confirmPassword, vConfirm, !!touched.confirmPassword))} pr-10`}
                        required
                      />
                      <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(p => !p)} />
                    </div>
                    {touched.confirmPassword && !vConfirm && confirmPassword !== '' && (
                      <span className="text-red-500 text-xs font-normal flex items-center gap-1">
                        <LuCircleAlert className="w-3 h-3" />Las contraseñas no coinciden
                      </span>
                    )}
                  </div>
                </div>

                <button type="submit" className="button-primary mt-6" disabled={loading}>
                  {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </button>

                <div className="switch-mode-row text-center pt-2">
                  <button type="button" onClick={goToLogin} className="link-button text-xs font-bold text-[#39A900] hover:text-[#2D8600] hover:underline">
                    Volver a iniciar sesión
                  </button>
                </div>
              </>

            /* ════════════════════ MODO LOGIN ════════════════════ */
            ) : mode === 'login' ? (
              <>
                <div className="floating-field">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder=" "
                    required
                    className={`${inputClasses} floating-input`}
                  />
                  <label htmlFor="username" className="floating-label">Usuario</label>
                </div>

                {/* Contraseña login con ojo */}
                <div className="floating-field">
                  <input
                    id="password"
                    type={showLoginPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    required
                    className={`${inputClasses} floating-input pr-10`}
                  />
                  <label htmlFor="password" className="floating-label">Contraseña</label>
                  <PwdToggle show={showLoginPwd} onToggle={() => setShowLoginPwd(p => !p)} />
                </div>

                <div className="login-options-row">
                  <label className="remember-me">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Recordarme
                  </label>
                  <button type="button" onClick={goToForgot} className="link-button_password">¿Olvidaste tu contraseña?</button>
                </div>

                <button type="submit" className="button-primary">Iniciar sesión</button>

                <div className="switch-mode-row">
                  <span>¿No tienes cuenta?</span>
                  <button type="button" onClick={goToRegister} className="link-button">Registrarse</button>
                </div>
              </>

            /* ════════════════════ MODO REGISTER ════════════════════ */
            ) : (
              <div className="space-y-6">

                {/* ── Sección 1: Datos personales ── */}
                <div className="bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 rounded-2xl space-y-4 transition-all duration-200 hover:border-[#39A900]/30 hover:bg-slate-50 shadow-2xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39A900]/15 to-[#2D8600]/10 border border-[#39A900]/20 text-[#2D8600] flex items-center justify-center shrink-0 shadow-2xs">
                      <LuUser className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Datos personales</h3>
                      <p className="text-xs text-slate-500 font-normal">Información básica de contacto e identificación</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nombre */}
                    <label className={LABEL}>
                      <span>Nombre<Req /></span>
                      <input
                        value={registration.nombre}
                        onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                        onBlur={() => touch('nombre')}
                        className={dynInput(fieldState(registration.nombre, registration.nombre.trim().length >= 2, !!touched.nombre))}
                        placeholder="Ej. Juan"
                        required
                      />
                      {touched.nombre && registration.nombre.trim().length < 2 && registration.nombre !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1"><LuCircleAlert className="w-3 h-3" />Mínimo 2 caracteres</span>
                      )}
                    </label>

                    {/* Apellido */}
                    <label className={LABEL}>
                      <span>Apellido<Req /></span>
                      <input
                        value={registration.apellido}
                        onChange={(e) => handleRegisterChange('apellido', e.target.value)}
                        onBlur={() => touch('apellido')}
                        className={dynInput(fieldState(registration.apellido, registration.apellido.trim().length >= 2, !!touched.apellido))}
                        placeholder="Ej. Pérez"
                        required
                      />
                      {touched.apellido && registration.apellido.trim().length < 2 && registration.apellido !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1"><LuCircleAlert className="w-3 h-3" />Mínimo 2 caracteres</span>
                      )}
                    </label>

                    {/* Cédula */}
                    <label className={LABEL}>
                      <span>Cédula<Req /></span>
                      <input
                        value={registration.cedula}
                        onChange={(e) => handleRegisterChange('cedula', e.target.value)}
                        onBlur={() => touch('cedula')}
                        className={dynInput(fieldState(registration.cedula, vCedula, !!touched.cedula))}
                        placeholder="Solo números"
                        required
                      />
                      {touched.cedula && !vCedula && registration.cedula !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1"><LuCircleAlert className="w-3 h-3" />Solo números, mínimo 6 dígitos</span>
                      )}
                    </label>

                    {/* Teléfono */}
                    <label className={LABEL}>
                      <span>Teléfono<Req /></span>
                      <input
                        value={registration.telefono}
                        onChange={(e) => handleRegisterChange('telefono', e.target.value)}
                        onBlur={() => touch('telefono')}
                        className={dynInput(fieldState(registration.telefono, vTelefono, !!touched.telefono))}
                        placeholder="Ej. 3001234567"
                        required
                      />
                      {touched.telefono && !vTelefono && registration.telefono !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1"><LuCircleAlert className="w-3 h-3" />Solo números, 7–15 dígitos</span>
                      )}
                    </label>

                    {/* Correo */}
                    <label className={`${LABEL} sm:col-span-1 lg:col-span-2`}>
                      <span>Correo electrónico<Req /></span>
                      <input
                        type="email"
                        value={registration.correo}
                        onChange={(e) => handleRegisterChange('correo', e.target.value)}
                        onBlur={() => touch('correo')}
                        placeholder="ejemplo@correo.com"
                        className={dynInput(fieldState(registration.correo, vCorreo, !!touched.correo))}
                        required
                      />
                      {touched.correo && !vCorreo && registration.correo !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1"><LuCircleAlert className="w-3 h-3" />Debe ser un correo válido</span>
                      )}
                      {touched.correo && vCorreo && (
                        <span className="text-[#39A900] text-xs font-normal flex items-center gap-1"><LuCircleCheck className="w-3 h-3" />Correo válido</span>
                      )}
                    </label>
                  </div>
                </div>

                {/* ── Sección 2: Datos institucionales ── */}
                <div className="bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 rounded-2xl space-y-4 transition-all duration-200 hover:border-[#39A900]/30 hover:bg-slate-50 shadow-2xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39A900]/15 to-[#2D8600]/10 border border-[#39A900]/20 text-[#2D8600] flex items-center justify-center shrink-0 shadow-2xs">
                      <LuBuilding2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Datos institucionales</h3>
                      <p className="text-xs text-slate-500 font-normal">Sede, rol, área y vigencia del contrato</p>
                    </div>
                  </div>

                  {/* Fila 1: Sede · Rol · Área  (3 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className={LABEL}>
                      <span>Sede<Req /></span>
                      <SelectWrap>
                        <select
                          value={registration.sede}
                          onChange={(e) => {
                            handleRegisterChange('sede', e.target.value)
                            handleRegisterChange('rol', '')
                            handleRegisterChange('area', '')
                          }}
                          className={`${BASE_INPUT} border-slate-300 hover:border-slate-400 pr-9 appearance-none`}
                          required
                        >
                          <option value="">Seleccione una sede</option>
                          {sedesList.map(s => (
                            <option key={s.id_sede} value={s.id_sede.toString()}>{s.nombre}</option>
                          ))}
                        </select>
                      </SelectWrap>
                    </label>

                    <label className={LABEL}>
                      <span>Rol<Req /></span>
                      <SelectWrap>
                        <select
                          value={registration.rol}
                          onChange={(e) => {
                            handleRegisterChange('rol', e.target.value)
                            handleRegisterChange('area', '')
                          }}
                          className={`${BASE_INPUT} border-slate-300 hover:border-slate-400 pr-9 appearance-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                          required
                          disabled={!registration.sede}
                        >
                          <option value="">Seleccione un rol</option>
                          {filteredRoles.map(r => (
                            <option key={r.id_rol} value={r.id_rol.toString()}>{r.nombre}</option>
                          ))}
                        </select>
                      </SelectWrap>
                    </label>

                    <label className={LABEL}>
                      <span>Área<Req /></span>
                      <SelectWrap>
                        <select
                          value={registration.area}
                          onChange={(e) => handleRegisterChange('area', e.target.value)}
                          className={`${BASE_INPUT} border-slate-300 hover:border-slate-400 pr-9 appearance-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                          required
                          disabled={!registration.rol}
                        >
                          <option value="">Seleccione un área</option>
                          {filteredAreas.map(a => (
                            <option key={a.id_area} value={a.id_area.toString()}>{a.nombre}</option>
                          ))}
                        </select>
                      </SelectWrap>
                    </label>
                  </div>

                  {/* Fila 2: Código contrato · Código SIIF · Fecha inicio  (3 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className={LABEL}>
                      <span>Código de contrato<Req /></span>
                      <input
                        value={registration.codigoContrato}
                        onChange={(e) => handleRegisterChange('codigoContrato', e.target.value)}
                        className={`${BASE_INPUT} border-slate-300 hover:border-slate-400`}
                        required
                      />
                    </label>
                    <label className={LABEL}>
                      <span>Código SIIF<Req /></span>
                      <input
                        value={registration.codigoSiif}
                        onChange={(e) => handleRegisterChange('codigoSiif', e.target.value)}
                        className={`${BASE_INPUT} border-slate-300 hover:border-slate-400`}
                        required
                      />
                    </label>
                    <label className={LABEL}>
                      <span>Fecha inicio<Req /></span>
                      <input
                        type="date"
                        value={registration.fechaInicioContrato}
                        onChange={(e) => handleRegisterChange('fechaInicioContrato', e.target.value)}
                        className={`${BASE_INPUT} border-slate-300 hover:border-slate-400`}
                        required
                      />
                    </label>
                  </div>

                  {/* Fila 3: Fecha fin (sola en primera col para mantener el ancho) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className={LABEL}>
                      <span>Fecha fin del contrato<Req /></span>
                      <input
                        type="date"
                        value={registration.fechaFinContrato}
                        onChange={(e) => handleRegisterChange('fechaFinContrato', e.target.value)}
                        className={`${BASE_INPUT} border-slate-300 hover:border-slate-400`}
                        required
                      />
                    </label>
                  </div>
                </div>

                {/* ── Sección 3: Seguridad ── */}
                <div className="bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 rounded-2xl space-y-4 transition-all duration-200 hover:border-[#39A900]/30 hover:bg-slate-50 shadow-2xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39A900]/15 to-[#2D8600]/10 border border-[#39A900]/20 text-[#2D8600] flex items-center justify-center shrink-0 shadow-2xs">
                      <LuShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Seguridad de la cuenta</h3>
                      <p className="text-xs text-slate-500 font-normal">Establece tu contraseña confidencial de acceso</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contraseña con ojo */}
                    <div className={LABEL}>
                      <span>Contraseña<Req /></span>
                      <div className="relative">
                        <input
                          type={showRegPwd ? 'text' : 'password'}
                          value={registration.contraseña}
                          onChange={(e) => handleRegisterChange('contraseña', e.target.value)}
                          onBlur={() => touch('contraseña')}
                          autoComplete="new-password"
                          className={`${dynInput(fieldState(registration.contraseña, registration.contraseña.length >= 6, !!touched.contraseña))} pr-10`}
                          required
                        />
                        <PwdToggle show={showRegPwd} onToggle={() => setShowRegPwd(p => !p)} />
                      </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className={LABEL}>
                      <span>Confirmar contraseña<Req /></span>
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => touch('confirmPassword')}
                          autoComplete="new-password"
                          className={`${dynInput(fieldState(confirmPassword, vConfirm, !!touched.confirmPassword))} pr-10`}
                          required
                        />
                        <PwdToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(p => !p)} />
                      </div>
                      {touched.confirmPassword && !vConfirm && confirmPassword !== '' && (
                        <span className="text-red-500 text-xs font-normal flex items-center gap-1">
                          <LuCircleAlert className="w-3 h-3" />Las contraseñas no coinciden
                        </span>
                      )}
                      {touched.confirmPassword && vConfirm && (
                        <span className="text-[#39A900] text-xs font-normal flex items-center gap-1">
                          <LuCircleCheck className="w-3 h-3" />Contraseñas coinciden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Botón de envío ── */}
                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-[#39A900] via-[#339900] to-[#2D8600] hover:from-[#2D8600] hover:to-[#1e6100] active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-xl shadow-[#39A900]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>

                <div className="switch-mode-row text-center pt-2">
                  <span className="text-xs text-slate-500 font-medium">¿Ya tienes una cuenta registrada?</span>
                  <button type="button" onClick={goToLogin} className="link-button ml-1 text-xs font-bold text-[#39A900] hover:text-[#2D8600] hover:underline">
                    Inicia sesión aquí
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── TOAST: éxito ── */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-auto bg-white border-2 border-[#39A900] text-slate-800 p-4 rounded-2xl shadow-2xl shadow-emerald-900/25 flex items-center gap-3.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-[#39A900]/15 flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-6 h-6 text-[#39A900]" />
          </div>
          <div className="pr-3">
            <h4 className="text-sm font-extrabold text-slate-900">¡Registro Completado!</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{successMessage}</p>
          </div>
          <button type="button" onClick={() => setSuccessMessage('')} className="ml-auto text-slate-400 hover:text-slate-700 p-1 text-sm font-bold leading-none cursor-pointer" title="Cerrar">✕</button>
        </div>
      )}

      {/* ── TOAST: error ── */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-auto bg-white border-2 border-red-500 text-slate-800 p-4 rounded-2xl shadow-2xl shadow-red-900/25 flex items-center gap-3.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <LuCircleAlert className="w-6 h-6 text-red-600" />
          </div>
          <div className="pr-3">
            <h4 className="text-sm font-extrabold text-slate-900">Atención</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button type="button" onClick={() => setErrorMessage('')} className="ml-auto text-slate-400 hover:text-slate-700 p-1 text-sm font-bold leading-none cursor-pointer" title="Cerrar">✕</button>
        </div>
      )}
    </main>
  )
}
