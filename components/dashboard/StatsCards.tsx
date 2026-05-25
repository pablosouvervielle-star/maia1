import { Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Stats {
  total_patients: number
  total_consultations: number
  consultations_this_month: number
  pending_followups: number
  unconfirmed_diagnoses: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Total Pacientes',
      value: stats.total_patients,
      icon: Users,
      description: 'Pacientes activos',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      glow: 'rgba(99,102,241,0.3)',
    },
    {
      title: 'Este Mes',
      value: stats.consultations_this_month,
      icon: Calendar,
      description: 'Consultas realizadas',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
      glow: 'rgba(14,165,233,0.3)',
    },
    {
      title: 'Seguimientos',
      value: stats.pending_followups,
      icon: AlertCircle,
      description: 'Próximos 7 días',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      glow: 'rgba(245,158,11,0.3)',
    },
    {
      title: 'Por Confirmar',
      value: stats.unconfirmed_diagnoses,
      icon: CheckCircle2,
      description: 'Diagnósticos IA pendientes',
      gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
      glow: 'rgba(16,185,129,0.3)',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: `0 4px 20px ${card.glow}`,
            }}
          >
            {/* Gradient accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: card.gradient }} />

            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: card.gradient, boxShadow: `0 0 12px ${card.glow}` }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="text-4xl font-black tracking-tight mb-1">
              {card.value ?? '—'}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
        )
      })}
    </div>
  )
}
