import type { ReactElement } from 'react'

export function WhatsApp(): ReactElement {
  const phoneNumber = '573112971539'
  const message = 'Hola, necesito ayuda con mi informe.'

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-trigger"
      aria-label="Contactar por WhatsApp"
    >
      <span>💬</span>
      <span>WhatsApp</span>
    </a>
  )
}
