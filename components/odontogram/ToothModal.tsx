'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { ToothInfo, ToothCondition } from '@/lib/utils/odontogram'
import { TOOTH_CONDITIONS, TOOTH_STATUS_COLORS } from '@/lib/utils/odontogram'

interface ToothModalProps {
  tooth: ToothInfo | null
  condition: ToothCondition
  open: boolean
  onClose: () => void
  onSave: (fdi: string, condition: ToothCondition) => void
}

const STATUSES = Object.keys(TOOTH_STATUS_COLORS) as Array<keyof typeof TOOTH_STATUS_COLORS>

export function ToothModal({ tooth, condition, open, onClose, onSave }: ToothModalProps) {
  const [localCondition, setLocalCondition] = useState<ToothCondition>(condition)

  if (!tooth) return null

  function toggleCondition(c: string) {
    setLocalCondition((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(c)
        ? prev.conditions.filter((x) => x !== c)
        : [...prev.conditions, c],
    }))
  }

  function handleSave() {
    onSave(tooth!.fdi, localCondition)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Tooth #{tooth.fdi} — {tooth.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localCondition.status}
              onValueChange={(v) =>
                setLocalCondition((prev) => ({ ...prev, status: v as ToothCondition['status'] }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: TOOTH_STATUS_COLORS[s] }}
                      />
                      {s}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Conditions</Label>
            <div className="flex flex-wrap gap-1.5">
              {TOOTH_CONDITIONS.map((c) => {
                const isSelected = localCondition.conditions.includes(c)
                return (
                  <button key={c} onClick={() => toggleCondition(c)}>
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                    >
                      {isSelected && <X className="h-2.5 w-2.5 mr-1" />}
                      {c}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea
              placeholder="Additional observations for this tooth..."
              value={localCondition.notes || ''}
              onChange={(e) => setLocalCondition((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
