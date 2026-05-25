'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  email: string
  license_number: string | null
  specialty: string | null
  clinic_name: string | null
  clinic_address: string | null
}

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    license_number: profile?.license_number || '',
    specialty: profile?.specialty || '',
    clinic_name: profile?.clinic_name || '',
    clinic_address: profile?.clinic_address || '',
  })
  const [saving, setSaving] = useState(false)

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update(form)
        .eq('id', profile?.id)

      if (error) throw error
      toast.success('Profile saved successfully')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Professional Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ''} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label>Professional License Number</Label>
            <Input
              placeholder="e.g. CD-123456"
              value={form.license_number}
              onChange={(e) => setField('license_number', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Input
              placeholder="e.g. General Dentistry, Orthodontics, Endodontics..."
              value={form.specialty}
              onChange={(e) => setField('specialty', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clinic Name</Label>
            <Input
              placeholder="e.g. Clínica Dental García"
              value={form.clinic_name}
              onChange={(e) => setField('clinic_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Clinic Address</Label>
            <Input
              placeholder="Full address"
              value={form.clinic_address}
              onChange={(e) => setField('clinic_address', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Profile
      </Button>
    </form>
  )
}
