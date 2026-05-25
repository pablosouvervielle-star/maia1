import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TopBar } from '@/components/layout/TopBar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquarePlus, Users, FlaskConical, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [profileResult, statsResult, recentResult] = await Promise.all([
    admin.from('profiles').select('full_name, email').eq('id', user.id).single(),
    admin.rpc('get_dentist_stats', { p_dentist_id: user.id }),
    admin
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

  const firstName = profile?.full_name?.split(' ')[0] || 'Doctor'

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Dashboard"
        subtitle={`Bienvenido, Dr. ${firstName}`}
        userInitials={initials}
        userEmail={profile?.email}
        actions={
          <Link
            href="/consultation/new"
            className={cn(buttonVariants({ size: 'sm' }))}
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="stagger-children">
          <StatsCards stats={stats} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Consultations */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'hsl(var(--border))' }}>
              <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Consultas Recientes
              </h2>
              <Link
                href="/patients"
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
              {recentConsultations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <MessageSquarePlus className="h-6 w-6 text-indigo-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Sin consultas aún. ¡Empieza una!</p>
                  <Link href="/consultation/new" className={cn(buttonVariants({ size: 'sm' }))}>
                    Iniciar consulta IA
                  </Link>
                </div>
              ) : (
                recentConsultations.map((c) => {
                  const patient = c.patients as unknown as { first_name: string; last_name: string } | null
                  return (
                    <Link
                      key={c.id}
                      href={`/consultation/${c.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {patient ? patient.first_name[0] : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente desconocido'}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.title || 'Sin título'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.created_at), "d MMM", { locale: es })}
                        </p>
                        <span className={`text-xs font-semibold ${c.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {c.status === 'active' ? 'Activa' : c.status === 'completed' ? 'Completada' : 'Archivada'}
                        </span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
              <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Acciones Rápidas
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/consultation/new"
                className="flex items-center gap-3 rounded-xl p-4 text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
              >
                <MessageSquarePlus className="h-5 w-5" />
                <span className="text-sm font-semibold">Consulta con IA</span>
              </Link>
              <Link
                href="/patients/new"
                className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-accent hover:-translate-y-0.5"
                style={{ border: '1px solid hsl(var(--border))' }}
              >
                <Users className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-semibold">Registrar Paciente</span>
              </Link>
              <Link
                href="/research"
                className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-accent hover:-translate-y-0.5"
                style={{ border: '1px solid hsl(var(--border))' }}
              >
                <FlaskConical className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold">Ver Investigación</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
