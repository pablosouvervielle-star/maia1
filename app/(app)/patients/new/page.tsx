'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, UserPlus, Heart, FileText } from 'lucide-react'

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
      toast.error('El nombre y apellido son requeridos')
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
      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : 'Error al registrar paciente'
        throw new Error(errMsg)
      }
      toast.success('Paciente registrado exitosamente')
      router.push(`/patients/${data.patient.id}`)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const sectionClass = "rounded-2xl overflow-hidden"
  const sectionStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }
  const headerClass = "flex items-center gap-3 px-5 py-4 border-b"
  const headerStyle = { borderColor: 'hsl(var(--border))' }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Registrar Paciente" />
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">

          {/* Personal Info */}
          <div className={sectionClass} style={sectionStyle}>
            <div className={headerClass} style={headerStyle}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-sm">Información Personal</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nombre *
                </Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setField('first_name', e.target.value)}
                  placeholder="Juan"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Apellido *
                </Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setField('last_name', e.target.value)}
                  placeholder="Pérez"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fecha de Nacimiento
                </Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setField('date_of_birth', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Género
                </Label>
                <Select value={form.gender} onValueChange={(v) => setField('gender', v ?? '')}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefiere no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dirección
                </Label>
                <Input
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Calle, Ciudad, Estado"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className={sectionClass} style={sectionStyle}>
            <div className={headerClass} style={headerStyle}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                <Heart className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-sm">Historia Médica</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Condiciones Sistémicas
                </Label>
                <Input
                  placeholder="Diabetes, Hipertensión, Osteoporosis... (separadas por coma)"
                  value={medicalHistory.conditions}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, conditions: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Medicamentos Actuales
                </Label>
                <Input
                  placeholder="Metformina 500mg, Warfarina... (separados por coma)"
                  value={medicalHistory.medications}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, medications: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alergias
                </Label>
                <Input
                  placeholder="Penicilina, Látex, Aspirina... (separadas por coma)"
                  value={medicalHistory.allergies}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, allergies: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notas Adicionales
                </Label>
                <Textarea
                  placeholder="Otra información médica relevante..."
                  value={medicalHistory.notes}
                  onChange={(e) => setMedicalHistory((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className={sectionClass} style={sectionStyle}>
            <div className={headerClass} style={headerStyle}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}>
                <FileText className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-bold text-sm">Notas Clínicas</h2>
            </div>
            <div className="p-5">
              <Textarea
                placeholder="Notas generales del dentista sobre este paciente..."
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pb-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none' }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Paciente
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-6"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
