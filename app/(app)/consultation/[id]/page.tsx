import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ChatInterface } from '@/components/consultation/ChatInterface'
import { DiagnosisPanel } from '@/components/consultation/DiagnosisPanel'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import type { DiagnosisUpdate } from '@/types/ai.types'

export default async function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: consultation } = await supabase
    .from('consultations')
    .select(`
      *,
      patients ( id, first_name, last_name, date_of_birth, gender, medical_history ),
      chat_messages ( id, role, content, has_images, created_at, is_pinned ),
      diagnoses ( * )
    `)
    .eq('id', id)
    .eq('dentist_id', user.id)
    .single()

  if (!consultation) notFound()

  const patient = consultation.patients as {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string | null
    gender: string | null
  } | null

  if (!patient) notFound()

  const latestDiagnosis = consultation.diagnoses?.[0]

  // Build initial messages from DB
  const initialMessages = (consultation.chat_messages || [])
    .filter((m: { role: string }) => m.role !== 'system')
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((m: { id: string; role: string; content: string; created_at: string }) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      displayContent: m.content,
      createdAt: m.created_at,
    }))

  const isActive = consultation.status === 'active'

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title={consultation.title || 'Consultation'}
        subtitle={`${patient.first_name} ${patient.last_name} · ${format(new Date(consultation.created_at), 'MMM d, yyyy')}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'} className="capitalize">
              {consultation.status}
            </Badge>
            <Link href={`/patients/${patient.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Patient
            </Link>
          </div>
        }
      />

      {isActive ? (
        // Active: show live chat
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            consultationId={id}
            patient={patient}
          />
        </div>
      ) : (
        // Completed: show read-only view
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Clinical Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {[
                        ['Chief Complaint', consultation.chief_complaint],
                        ['Subjective', consultation.subjective_notes],
                        ['Objective', consultation.objective_notes],
                        ['Assessment', consultation.assessment_notes],
                        ['Plan', consultation.plan_notes],
                      ].map(([label, value]) =>
                        value ? (
                          <div key={label as string}>
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-0.5">{value}</p>
                          </div>
                        ) : null
                      )}
                    </CardContent>
                  </Card>

                  <div>
                    <DiagnosisPanel
                      diagnosis={latestDiagnosis as DiagnosisUpdate | null}
                      className="h-auto"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conversation" className="mt-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {initialMessages.map((msg: { id: string; role: 'user' | 'assistant'; content: string; displayContent: string; createdAt: string }) => (
                      <div key={msg.id} className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                        <div className={`rounded-xl p-3 text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.displayContent}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                          {msg.role === 'user' ? 'You' : 'MAIA'} ·{' '}
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
