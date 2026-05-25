import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquarePlus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [profileResult, statsResult, recentResult] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
    supabase.rpc('get_dentist_stats', { p_dentist_id: user.id }),
    supabase
      .from('consultations')
      .select('id, title, created_at, status, patients(first_name, last_name)')
      .eq('dentist_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data
  const stats = statsResult.data || {
    total_patients: 0,
    total_consultations: 0,
    consultations_this_month: 0,
    pending_followups: 0,
    unconfirmed_diagnoses: 0,
  }
  const recentConsultations = recentResult.data || []

  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'D'

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Dashboard"
        subtitle={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Doctor'}`}
        userInitials={initials}
        userEmail={profile?.email}
        actions={
          <Link
            href="/consultation/new"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Consultation
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <StatsCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Consultations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Consultations</CardTitle>
              <Link
                href="/patients"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentConsultations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No consultations yet. Start one!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentConsultations.map((c) => {
                    const patient = c.patients as unknown as { first_name: string; last_name: string } | null
                    return (
                      <Link
                        key={c.id}
                        href={`/consultation/${c.id}`}
                        className="flex items-center justify-between rounded-lg p-3 hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {patient
                              ? `${patient.first_name} ${patient.last_name}`
                              : 'Unknown Patient'}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(c.created_at), 'MMM d')}
                          </p>
                          <span
                            className={`text-xs font-medium capitalize ${
                              c.status === 'active'
                                ? 'text-green-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/consultation/new"
                className={cn(buttonVariants(), 'w-full justify-start')}
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Start AI Consultation
              </Link>
              <Link
                href="/patients/new"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start')}
              >
                <Users className="mr-2 h-4 w-4" />
                Register New Patient
              </Link>
              <Link
                href="/research"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start')}
              >
                View Research Analytics
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
