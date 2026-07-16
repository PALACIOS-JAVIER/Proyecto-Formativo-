import type { ReactElement } from 'react'

export function Perfil(): ReactElement {
  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Perfil</p>
          <h1>Actualiza tu información personal y de seguridad.</h1>
        </div>
      </header>

      <article className="card profile-card">
        <div className="profile-top">
          <div className="avatar">MF</div>
          <div>
            <h2>María Fernanda López</h2>
            <p className="muted">Instructor • SENA</p>
          </div>
          <div className="profile-actions">
            <button className="button button--primary">Editar perfil</button>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <p className="field-label">Correo</p>
            <div className="field-value">instructor@sena.edu.co</div>
          </div>
          <div className="profile-field">
            <p className="field-label">Celular</p>
            <div className="field-value">+57 310 123 4567</div>
          </div>
          <div className="profile-field">
            <p className="field-label">Banco</p>
            <div className="field-value">Bancolombia</div>
          </div>
          <div className="profile-field">
            <p className="field-label">Cuenta</p>
            <div className="field-value">1234567890</div>
          </div>
          <div className="profile-field">
            <p className="field-label">Contraseña</p>
            <div className="field-value">••••••••</div>
          </div>
        </div>
      </article>
    </section>
  )
}
