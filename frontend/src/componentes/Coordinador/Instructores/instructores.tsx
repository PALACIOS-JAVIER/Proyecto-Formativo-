import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { InstructorProfile } from '../../../App'

interface SupportStaffData {
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  correo: string
  contraseña: string
}

interface InstructoresProps {
  instructors: InstructorProfile[]
  onUpdateInstructor: (id: number, changes: Partial<InstructorProfile>) => void
  onCreateSupportStaff: (support: Omit<InstructorProfile, 'id' | 'status' | 'canEdit' | 'source'> & { contraseña?: string }) => void
  onDeleteInstructor: (id: number) => void
  instructorEditAllowed: boolean
  onToggleInstructorEditPermission: (value: boolean) => void
  isSupportStaff?: boolean
}

// (formatRemaining removed - not used)

export function Instructores({
  instructors,
  onUpdateInstructor,
  onCreateSupportStaff,
  onDeleteInstructor,
  instructorEditAllowed,
  onToggleInstructorEditPermission: _onToggleInstructorEditPermission,
  isSupportStaff = false,
}: InstructoresProps): ReactElement {
  const btnBase = 'rounded-lg px-3 py-1 text-sm font-semibold'
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('Todas')
  const [roleFilter, setRoleFilter] = useState('Todas')
  const [selectedInstructorForm, setSelectedInstructorForm] = useState<InstructorProfile | null>(null)
  const [supportStaffData, setSupportStaffData] = useState<SupportStaffData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
  })
  const [notificationMessage, setNotificationMessage] = useState('')

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  useEffect(() => {
    // keep notification short-lived
    if (!notificationMessage) return
    const t = setTimeout(() => setNotificationMessage(''), 4000)
    return () => clearTimeout(t)
  }, [notificationMessage])

  const roleOptions = useMemo(() => ['Todas', ...Array.from(new Set(instructors.map((item) => item.rol)))], [instructors])
  const areaOptions = useMemo(() => ['Todas', ...Array.from(new Set(instructors.map((item) => item.area)))], [instructors])

  const filteredInstructors = useMemo(
    () =>
      instructors.filter((item) => {
        const matchesName = `${item.nombre} ${item.apellido}`.toLowerCase().includes(search.toLowerCase())
        const matchesArea = areaFilter === 'Todas' || item.area === areaFilter
        const matchesRole = roleFilter === 'Todas' || item.rol === roleFilter
        return matchesName && matchesArea && matchesRole
      }),
    [instructors, search, areaFilter, roleFilter]
  )

  const handleSupportInput = (field: keyof SupportStaffData, value: string) => {
    setSupportStaffData((curr) => ({ ...curr, [field]: value }))
  }

  const openProfileModal = (instructor: InstructorProfile) => {
    setSelectedInstructorForm(instructor)
    setShowProfileModal(true)
  }

  const openSupportModal = (prefill?: Partial<SupportStaffData>) => {
    if (prefill) setSupportStaffData((curr) => ({ ...curr, ...prefill }))
    setShowSupportModal(true)
  }

  const handleCreateSupport = () => {
    if (!supportStaffData.nombre || !supportStaffData.apellido || !supportStaffData.cedula || !supportStaffData.correo) {
      setNotificationMessage('Completa los campos obligatorios para crear el apoyo.')
      return
    }

    onCreateSupportStaff({
      ...supportStaffData,
      rol: 'apoyo administrativo',
      sede: 'Yamboro',
      area: 'Apoyo administrativo',
      codigoContrato: 'N/A',
      codigoSiif: 'N/A',
      fechaInicioContrato: new Date().toISOString().slice(0, 10),
      fechaFinContrato: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      objetoContrato: 'Apoyo administrativo asignado por el coordinador.',
      fotoPerfil: '',
    })

    setNotificationMessage('Apoyo administrativo creado correctamente.')
    setShowSupportModal(false)
    setSupportStaffData({ nombre: '', apellido: '', cedula: '', telefono: '', correo: '', contraseña: '' })
  }

  const handleAccept = (instructor: InstructorProfile) => {
    onUpdateInstructor(instructor.id, { status: 'activo' })
    setNotificationMessage(`✓ Instructor ${instructor.nombre} ${instructor.apellido} aceptado correctamente.`)
  }

  const handleReject = (instructor: InstructorProfile) => {
    onUpdateInstructor(instructor.id, { status: 'rechazado' })
    setNotificationMessage(`⚠️ Registro de ${instructor.nombre} ${instructor.apellido} rechazado.`)
  }

  const toggleActivation = (instructor: InstructorProfile) => {
    const nextStatus = instructor.status === 'activo' ? 'inactivo' : 'activo'
    onUpdateInstructor(instructor.id, { status: nextStatus })
    setNotificationMessage(`✓ Estado de ${instructor.nombre} ${instructor.apellido} cambiado a: ${nextStatus}.`)
  }

  const handleDeleteInstructor = (id: number) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este instructor? Esta acción no se puede deshacer.')
    if (!confirmed) return
    onDeleteInstructor(id)
    setNotificationMessage('Instructor eliminado correctamente.')
  }

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Instructores</p>
          <h1>Gestión de instructores</h1>
          <p className="subtext">Revisa nuevos registros, filtra por área, nombre o rol y administra estados y permisos desde aquí.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        {/* Left: filters + compact instructor list */}
        <article className="card">
          <div className="card-section">
            <div className="flex items-center justify-between">
              <div>
                <h2>Filtros activos</h2>
                <p className="subtext">Busca por instructor, área o rol.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
              <label className="block">
                <span className="text-xs font-semibold text-secondary">Filtro por nombre</span>
                <input type="search" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field mt-2" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-secondary">Filtro por área</span>
                <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="input-field mt-2">
                  {areaOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-secondary">Filtro por rol</span>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field mt-2">
                  {roleOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card-section">
            <h3 className="text-base font-semibold">Instructores registrados</h3>
            <p className="subtext">Total: {filteredInstructors.length} instructores encontrados.</p>

            <div className="space-y-3 mt-4">
              {filteredInstructors.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white font-semibold">{(inst.nombre[0] || '') + (inst.apellido[0] || '')}</div>
                    <div>
                      <div className="font-semibold text-foreground">{inst.nombre} {inst.apellido}</div>
                      <div className="text-xs text-secondary">{inst.rol} · {inst.sede}</div>
                      <div className="mt-1">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${inst.status === 'activo' ? 'bg-emerald-100 text-emerald-800' : inst.status === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button type="button" onClick={() => openProfileModal(inst)} className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}>
                      Ver perfil
                    </button>
                    {inst.status === 'pendiente' ? (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button type="button" onClick={() => handleAccept(inst)} className={`${btnBase} bg-emerald-100 text-emerald-800 hover:bg-emerald-200`}>Aceptar</button>
                        <button type="button" onClick={() => handleReject(inst)} className={`${btnBase} bg-rose-100 text-rose-800 hover:bg-rose-200`}>Rechazar</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button type="button" onClick={() => toggleActivation(inst)} className={`${btnBase} bg-slate-100 text-slate-800 hover:bg-slate-200`}>{inst.status === 'activo' ? 'Desactivar' : 'Activar'}</button>
                        <button type="button" onClick={() => handleDeleteInstructor(inst.id)} className={`${btnBase} bg-rose-100 text-rose-800 hover:bg-rose-200`}>Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Right: solicitudes + assign control */}
        <article className="card">
          <div className="card-section">
            <h2>Solicitudes</h2>
            <p className="subtext">Revisa las solicitudes nuevas y pendientes antes de asignar apoyos administrativos.</p>
          </div>

          <div className="card-section">
            <div className="space-y-3 max-h-112 overflow-y-auto">
              {instructors.filter((item) => item.status === 'pendiente' && item.rol !== 'apoyo administrativo').length === 0 ? (
                <div className="rounded-xl border border-border bg-bg-alt p-4 text-secondary">No hay solicitudes pendientes.</div>
              ) : (
                instructors
                  .filter((item) => item.status === 'pendiente' && item.rol !== 'apoyo administrativo')
                  .map((request) => (
                    <div key={request.id} className="rounded-xl border border-border bg-bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="block text-sm text-foreground">{request.nombre} {request.apellido}</strong>
                          <p className="text-xs text-secondary">{request.correo} · {request.sede}</p>
                          <p className="text-xs mt-1 text-secondary">Tipo: registro de instructor</p>
                        </div>
                        <span className="status-chip status-chip--warning">Pendiente</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openProfileModal(request)} className={`${btnBase} bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-bg-alt dark:text-foreground`}>Ver solicitud</button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {!isSupportStaff && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Asignar apoyo administrativo</h3>
                <p className="subtext mb-3">Registra solo los datos básicos necesarios.</p>
                <button type="button" onClick={() => openSupportModal()} className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}>Asignar apoyo administrativo</button>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Profile modal */}
      {showProfileModal && selectedInstructorForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowProfileModal(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-bg-card border border-border p-6 shadow-xl mx-4 overflow-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-foreground">Perfil — {selectedInstructorForm.nombre} {selectedInstructorForm.apellido}</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-secondary hover:text-foreground">Cerrar</button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                Nombre
                <input className="input-field" value={selectedInstructorForm.nombre} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, nombre: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Apellido
                <input className="input-field" value={selectedInstructorForm.apellido} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, apellido: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Cédula
                <input className="input-field" value={selectedInstructorForm.cedula} disabled />
              </label>
              <label>
                Teléfono
                <input className="input-field" value={selectedInstructorForm.telefono} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, telefono: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Correo institucional
                <input type="email" className="input-field" value={selectedInstructorForm.correo} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, correo: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Rol
                <input className="input-field" value={selectedInstructorForm.rol} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, rol: e.target.value as any })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Sede
                <input className="input-field" value={selectedInstructorForm.sede} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, sede: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Área
                <input className="input-field" value={selectedInstructorForm.area} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, area: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Código de contrato
                <input className="input-field" value={selectedInstructorForm.codigoContrato || ''} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, codigoContrato: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Código SIIF
                <input className="input-field" value={selectedInstructorForm.codigoSiif || ''} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, codigoSiif: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Fecha inicio del contrato
                <input type="date" className="input-field" value={selectedInstructorForm.fechaInicioContrato || ''} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, fechaInicioContrato: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label>
                Fecha fin del contrato
                <input type="date" className="input-field" value={selectedInstructorForm.fechaFinContrato || ''} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, fechaFinContrato: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
              <label className="md:col-span-2">
                Objeto del contrato
                <textarea className="input-field min-h-24" value={selectedInstructorForm.objetoContrato || ''} onChange={(e) => setSelectedInstructorForm({ ...selectedInstructorForm, objetoContrato: e.target.value })} disabled={!instructorEditAllowed} />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {selectedInstructorForm.status === 'pendiente' && selectedInstructorForm.source === 'registro' ? (
                <>
                  <button type="button" onClick={() => { onUpdateInstructor(selectedInstructorForm.id, { status: 'activo' }); setShowProfileModal(false); setNotificationMessage('Solicitud aceptada.'); }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Aceptar registro</button>
                  <button type="button" onClick={() => { onUpdateInstructor(selectedInstructorForm.id, { status: 'rechazado' }); setShowProfileModal(false); setNotificationMessage('Solicitud rechazada.'); }} className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-200">Rechazar registro</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { if (selectedInstructorForm) { onUpdateInstructor(selectedInstructorForm.id, { ...selectedInstructorForm }); setNotificationMessage('Perfil actualizado.'); } }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" disabled={!instructorEditAllowed}>Guardar</button>
                  <button type="button" onClick={() => { if (selectedInstructorForm) toggleActivation(selectedInstructorForm) }} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 dark:bg-bg-alt dark:text-foreground">{selectedInstructorForm.status === 'activo' ? 'Desactivar' : 'Activar'}</button>
                  <button type="button" onClick={() => { if (selectedInstructorForm) { handleDeleteInstructor(selectedInstructorForm.id); setShowProfileModal(false); } }} className="rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-200">Eliminar</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Support assign modal */}
      {showSupportModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSupportModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-bg-card border border-border p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Asignar apoyo administrativo</h3>
              <button onClick={() => setShowSupportModal(false)} className="text-secondary hover:text-foreground">Cerrar</button>
            </div>

            <div className="mt-4 space-y-3">
              <label>
                Nombre
                <input className="input-field" value={supportStaffData.nombre} onChange={(e) => handleSupportInput('nombre', e.target.value)} />
              </label>
              <label>
                Apellido
                <input className="input-field" value={supportStaffData.apellido} onChange={(e) => handleSupportInput('apellido', e.target.value)} />
              </label>
              <label>
                Cédula
                <input className="input-field" value={supportStaffData.cedula} onChange={(e) => handleSupportInput('cedula', e.target.value)} />
              </label>
              <label>
                Teléfono
                <input className="input-field" value={supportStaffData.telefono} onChange={(e) => handleSupportInput('telefono', e.target.value)} />
              </label>
              <label>
                Correo institucional
                <input type="email" className="input-field" value={supportStaffData.correo} onChange={(e) => handleSupportInput('correo', e.target.value)} />
              </label>
              <label>
                Contraseña
                <input type="password" className="input-field" value={supportStaffData.contraseña} onChange={(e) => handleSupportInput('contraseña', e.target.value)} />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowSupportModal(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200">Cancelar</button>
              <button onClick={handleCreateSupport} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Crear apoyo</button>
            </div>
          </div>
        </div>
      ) : null}

      {notificationMessage ? <div className="fixed bottom-6 right-6 rounded-lg bg-slate-800 px-4 py-2 text-white">{notificationMessage}</div> : null}
    </section>
  )
}

export default Instructores
