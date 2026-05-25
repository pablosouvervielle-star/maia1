'use client'

import { useState } from 'react'
import { Odontogram } from '@/components/odontogram/Odontogram'
import type { OdontogramState } from '@/lib/utils/odontogram'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface OdontogramTabProps {
  patientId: string
  initialOdontogram: OdontogramState
}

export function OdontogramTab({ patientId, initialOdontogram }: OdontogramTabProps) {
  const [state, setState] = useState<OdontogramState>(initialOdontogram)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function handleChange(newState: OdontogramState) {
    setState(newState)
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odontogram: state }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Odontogram saved')
      setDirty(false)
    } catch {
      toast.error('Failed to save odontogram')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Odontogram state={state} onChange={handleChange} />
      {dirty && (
        <div className="flex items-center justify-end gap-2">
          <p className="text-xs text-muted-foreground">Unsaved changes</p>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save Odontogram
          </Button>
        </div>
      )}
    </div>
  )
}
