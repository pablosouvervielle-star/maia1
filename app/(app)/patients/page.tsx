import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TopBar } from '@/components/layout/TopBar'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { UserPlus, MessageSquarePlus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const page = parseInt(params.page || '1')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = admin
    .from('patients')
    .select('*', { count: 'exact' })
    .eq('dentist_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1)

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
  }

  const { data: patients, count } = await query

  const genderLabel: Record<string, string> = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    prefer_not_to_say: 'No especifica',
  }

  const avatarColors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #0ea5e9, #6366f1)',
    'linear-gradient(135deg, #10b981, #0ea5e9)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
  ]

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Pacientes"
        subtitle={`${count || 0} pacientes activos`}
        actions={
          <Link
            href="/patients/new"
            className={cn(buttonVariants({ size: 'sm' }))}
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 animate-fade-in">
        {/* Search */}
        <form method="get" className="mb-6">
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar pacientes por nombre..."
            className="w-full max-w-sm rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </form>

        {/* Patient list */}
        {!patients || patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Users className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold">{search ? 'Sin resultados' : 'Sin pacientes aún'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Intenta con otro nombre.' : 'Registra tu primer paciente para empezar.'}
              </p>
            </div>
            {!search && (
              <Link href="/patients/new" className={cn(buttonVariants())}
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}>
                Registrar primer paciente
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
            {patients.map((patient, i) => {
              const age = patient.date_of_birth
                ? Math.floor(
                    (Date.now() - new Date(patient.date_of_birth).getTime()) /
                      (365.25 * 24 * 3600 * 1000)
                  )
                : null
              const initials = `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase()
              const avatarGradient = avatarColors[i % avatarColors.length]

              return (
                <div
                  key={patient.id}
                  className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: avatarGradient }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="text-sm font-bold leading-tight hover:text-primary transition-colors block truncate"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                        {age !== null && (
                          <p className="text-xs text-muted-foreground">{age} años</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/consultation/new?patient_id=${patient.id}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'icon' }),
                        'shrink-0 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity'
                      )}
                      title="Nueva consulta"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {patient.gender && (
                      <Badge variant="secondary" className="text-xs rounded-lg">
                        {genderLabel[patient.gender] || patient.gender}
                      </Badge>
                    )}
                    {patient.phone && (
                      <Badge variant="outline" className="text-xs rounded-lg">
                        {patient.phone}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Actualizado {format(new Date(patient.updated_at), "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
