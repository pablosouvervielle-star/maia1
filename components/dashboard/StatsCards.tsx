import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      title: 'Total Patients',
      value: stats.total_patients,
      icon: Users,
      description: 'Active patients',
    },
    {
      title: 'This Month',
      value: stats.consultations_this_month,
      icon: Calendar,
      description: 'Consultations',
    },
    {
      title: 'Follow-ups',
      value: stats.pending_followups,
      icon: AlertCircle,
      description: 'Due within 7 days',
    },
    {
      title: 'To Confirm',
      value: stats.unconfirmed_diagnoses,
      icon: CheckCircle2,
      description: 'AI diagnoses pending review',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value ?? '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
