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
import { Loader2 } from 'lucide-react'

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
      toast.error('Please select a patient')
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
      toast.error(`Failed to start consultation: ${(err as Error).message}`)
    } finally {
      setCreating(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  if (consultation && selectedPatient) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar
          title="AI Consultation"
          subtitle={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/consultation/${consultation.id}`)}
            >
              Save & Close
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
      <TopBar title="New Consultation" />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Start Consultation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a patient to begin the AI-assisted diagnostic session.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              {loadingPatients ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading patients...
                </div>
              ) : (
                <Select value={selectedPatientId} onValueChange={(v) => setSelectedPatientId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient..." />
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

            <div className="space-y-2">
              <Label htmlFor="complaint">Chief Complaint (optional)</Label>
              <Input
                id="complaint"
                placeholder="e.g. Toothache upper right, cold sensitivity..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={startConsultation}
              disabled={!selectedPatientId || creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Begin Consultation
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/patients/new')}
            >
              + Register New Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
