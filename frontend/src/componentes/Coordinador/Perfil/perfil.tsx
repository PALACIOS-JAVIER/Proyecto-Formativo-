import type { ReactElement } from 'react'

const coordinatorProfileMock = {
  nombre: 'Diana López',
  cargo: 'Coordinadora académica',
  email: 'diana.lopez@institucion.edu.co',
  telefono: '300 123 4567',
}

export function Perfil(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Perfil</p>
          <h1>Información del coordinador</h1>
          <p className="subtext">Consulta y edita tus datos de contacto y responsabilidades.</p>
        </div>
      </header>

      <article className="card">
        <p><strong>Nombre:</strong> {coordinatorProfileMock.nombre}</p>
        <p><strong>Cargo:</strong> {coordinatorProfileMock.cargo}</p>
        <p><strong>Email:</strong> {coordinatorProfileMock.email}</p>
        <p><strong>Teléfono:</strong> {coordinatorProfileMock.telefono}</p>
      </article>
    </section>
  )
}
