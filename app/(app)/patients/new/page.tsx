'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: '',
    medications: '',
    allergies: '',
    notes: '',
  })

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.last_name) {
      toast.error('First and last name are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          medical_history: {
            conditions: medicalHistory.conditions.split(',').map((s) => s.trim()).filter(Boolean),
            medications: medicalHistory.medications.split(',').map((s) => s.trim()).filter(Boolean),
            allergies: medicalHistory.allergies.split(',').map((s) => s.trim()).filter(Boolean),
            notes: medicalHistory.notes,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Patient registered successfully')
      router.push(`/patients/${data.patient.id}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Register Patient" />
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setField('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setField('last_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setField('date_of_birth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setField('gender', v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setField('address', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Systemic Conditions</Label>
                <Input
                  placeholder="Diabetes, Hypertension, Osteoporosis... (comma separated)"
                  value={medicalHistory.conditions}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, conditions: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Input
                  placeholder="Metformin 500mg, Warfarin... (comma separated)"
                  value={medicalHistory.medications}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, medications: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Input
                  placeholder="Penicillin, Latex, Aspirin... (comma separated)"
                  value={medicalHistory.allergies}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, allergies: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any other relevant medical information..."
                  value={medicalHistory.notes}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea
              placeholder="General dentist's notes about this patient..."
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Patient
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
