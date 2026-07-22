import type { ReactElement } from 'react'

interface BarChartProps {
  data: Array<{ label: string; value: number }>
  color?: string
}

function BarChart({ data, color = 'var(--color-emerald)' }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-20 text-sm text-muted">{item.label}</span>
          <div className="relative flex-1">
            <div className="h-6 rounded-full bg-border">
              <div
                className="h-6 rounded-full transition-all duration-700"
                style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="absolute -top-5 right-2 text-xs font-semibold">{item.value}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Graficas(): ReactElement {
  const barData = [
    { label: 'Marzo', value: 72 },
    { label: 'Abril', value: 68 },
    { label: 'Mayo', value: 85 },
    { label: 'Junio', value: 79 },
    { label: 'Julio', value: 88 },
  ]

  const pieData = [
    { label: 'Aprobados', value: 65, color: 'var(--color-emerald)' },
    { label: 'Revisión', value: 20, color: 'var(--color-warning)' },
    { label: 'Correcciones', value: 15, color: 'var(--color-alert)' },
  ]

  return (
    <section className="page-panel">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gráficas</p>
          <h1>Visualización de indicadores</h1>
          <p className="subtext">Explora las gráficas detalladas de tu desempeño y el de tu equipo.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="card">
          <h2 className="mb-4 text-lg font-semibold">Entregas por mes</h2>
          <BarChart data={barData} />
        </article>

        <article className="card">
          <h2 className="mb-4 text-lg font-semibold">Distribución de estados</h2>
          <div className="space-y-3">
            {pieData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.label}</span>
                <strong className="ml-auto">{item.value}%</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
