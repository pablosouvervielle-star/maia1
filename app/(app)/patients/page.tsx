import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { UserPlus, MessageSquarePlus } from 'lucide-react'
import { format } from 'date-fns'
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

  let query = supabase
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

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Patients"
        subtitle={`${count || 0} active patients`}
        actions={
          <Link
            href="/patients/new"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New Patient
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Search */}
        <form method="get" className="mb-6">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search patients by name..."
            className="w-full max-w-sm rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Patient list */}
        {!patients || patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
            <p className="text-sm">{search ? 'No patients match your search.' : 'No patients yet.'}</p>
            <Link href="/patients/new" className={cn(buttonVariants())}>
              Register First Patient
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => {
              const age = patient.date_of_birth
                ? Math.floor(
                    (Date.now() - new Date(patient.date_of_birth).getTime()) /
                      (365.25 * 24 * 3600 * 1000)
                  )
                : null

              return (
                <Card key={patient.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {age !== null && (
                            <Badge variant="secondary" className="text-xs">{age} yrs</Badge>
                          )}
                          {patient.gender && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {patient.gender}
                            </Badge>
                          )}
                        </div>
                        {patient.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{patient.phone}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {format(new Date(patient.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Link
                        href={`/consultation/new?patient_id=${patient.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0')}
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
