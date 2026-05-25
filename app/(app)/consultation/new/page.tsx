'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatInterface } from '@/components/consultation/ChatInterface'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, MessageSquarePlus, UserPlus, Brain } from 'lucide-react'

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Consultation {
  id: string
}

export default function NewConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patient_id')

  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [creating, setCreating] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)

  useEffect(() => {
    fetch('/api/patients?limit=100')
      .then((r) => r.json())
      .then((d) => setPatients(d.patients || []))
      .finally(() => setLoadingPatients(false))
  }, [])

  async function startConsultation() {
    if (!selectedPatientId) {
      toast.error('Selecciona un paciente primero')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          chief_complaint: chiefComplaint,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConsultation(data.consultation)
    } catch (err) {
      toast.error(`Error al iniciar consulta: ${(err as Error).message}`)
    } finally {
      setCreating(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  if (consultation && selectedPatient) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar
          title="Consulta con IA"
          subtitle={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
          actions={
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => router.push(`/consultation/${consultation.id}`)}
            >
              Guardar y Cerrar
            </Button>
          }
        />
        <div className="flex-1 overflow-hidden">
          <ChatInterface consultationId={consultation.id} patient={selectedPatient} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Nueva Consulta" />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Iniciar Consulta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un paciente para comenzar la sesión diagnóstica con IA.
            </p>
          </div>

          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paciente
              </Label>
              {loadingPatients ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando pacientes...
                </div>
              ) : patients.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No hay pacientes registrados.
                </div>
              ) : (
                <Select value={selectedPatientId} onValueChange={(v) => setSelectedPatientId(v ?? '')}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Seleccionar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="complaint" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Motivo de Consulta (opcional)
              </Label>
              <Input
                id="complaint"
                placeholder="Ej. Dolor en molar superior derecho, sensibilidad al frío..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="rounded-xl h-11"
                onKeyDown={(e) => e.key === 'Enter' && startConsultation()}
              />
            </div>

            <Button
              className="w-full h-11 rounded-xl font-bold"
              onClick={startConsultation}
              disabled={!selectedPatientId || creating}
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}
            >
              {creating
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>
                : <><MessageSquarePlus className="mr-2 h-4 w-4" /> Iniciar Consulta con IA</>
              }
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() => router.push('/patients/new')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar Nuevo Paciente
          </Button>
        </div>
      </div>
    </div>
  )
}
