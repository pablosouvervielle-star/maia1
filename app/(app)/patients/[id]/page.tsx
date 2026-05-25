import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OdontogramTab } from '@/components/patients/OdontogramTab'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MessageSquarePlus, Phone, Mail } from 'lucide-react'
import { format, differenceInYears, parseISO } from 'date-fns'

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: patient } = await admin
    .from('patients')
    .select(`
      *,
      consultations (
        id, title, chief_complaint, status, created_at,
        diagnoses ( id, conditions, dentist_confirmed )
      )
    `)
    .eq('id', id)
    .eq('dentist_id', user.id)
    .single()

  if (!patient) notFound()

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null

  const consultations = (patient.consultations || []).sort(
    (a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const mh = patient.medical_history as {
    conditions?: string[]
    medications?: string[]
    allergies?: string[]
    notes?: string
  } | null

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title={`${patient.first_name} ${patient.last_name}`}
        subtitle={age !== null ? `${age} años` : undefined}
        actions={
          <Link href={`/consultation/new?patient_id=${id}`} className={cn(buttonVariants({ size: 'sm' }))}
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Patient header */}
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {age !== null && <Badge variant="secondary">{age} años</Badge>}
                {patient.gender && <Badge variant="outline" className="capitalize">{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}</Badge>}
                {patient.blood_type && <Badge variant="outline">{patient.blood_type}</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {patient.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {patient.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
              <TabsTrigger value="history">Consultas ({consultations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Medical History */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Historia Médica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Condiciones</p>
                      {mh?.conditions?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {mh.conditions.map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Ninguna reportada</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Medicamentos</p>
                      {mh?.medications?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {mh.medications.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Ninguno</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Alergias</p>
                      {mh?.allergies?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {mh.allergies.map((a) => (
                            <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin alergias conocidas</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notas Clínicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {patient.notes || 'Sin notas registradas.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="odontogram" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Odontograma FDI</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <OdontogramTab patientId={id} initialOdontogram={patient.odontogram || {}} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-3">
                {consultations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Sin consultas aún.
                  </p>
                ) : (
                  consultations.map((c: {
                    id: string
                    title: string
                    chief_complaint: string | null
                    status: string
                    created_at: string
                    diagnoses: Array<{ id: string; conditions: unknown[]; dentist_confirmed: boolean }>
                  }) => (
                    <Link key={c.id} href={`/consultation/${c.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium">{c.title}</p>
                              {c.chief_complaint && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {c.chief_complaint}
                                </p>
                              )}
                              {c.diagnoses?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(c.diagnoses[0].conditions as Array<{ name: string }>)
                                    .slice(0, 3)
                                    .map((cond) => (
                                      <Badge key={cond.name} variant="secondary" className="text-xs">
                                        {cond.name}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(c.created_at), 'MMM d, yyyy')}
                              </p>
                              <Badge
                                variant={c.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs mt-1"
                              >
                                {c.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
