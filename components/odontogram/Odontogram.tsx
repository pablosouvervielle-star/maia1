'use client'

import { useState } from 'react'
import { ToothSVG } from './ToothSVG'
import { ToothModal } from './ToothModal'
import type { ToothInfo, ToothCondition, OdontogramState } from '@/lib/utils/odontogram'
import {
  UPPER_RIGHT,
  UPPER_LEFT,
  LOWER_LEFT,
  LOWER_RIGHT,
  defaultToothCondition,
  TOOTH_STATUS_COLORS,
} from '@/lib/utils/odontogram'
import { Separator } from '@/components/ui/separator'

interface OdontogramProps {
  state: OdontogramState
  onChange: (newState: OdontogramState) => void
  readOnly?: boolean
}

export function Odontogram({ state, onChange, readOnly }: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = useState<ToothInfo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openTooth(tooth: ToothInfo) {
    if (readOnly) return
    setSelectedTooth(tooth)
    setModalOpen(true)
  }

  function handleSave(fdi: string, condition: ToothCondition) {
    onChange({ ...state, [fdi]: condition })
  }

  const selectedCondition = selectedTooth
    ? state[selectedTooth.fdi] || defaultToothCondition()
    : defaultToothCondition()

  return (
    <div className="select-none">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(TOOTH_STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {/* Upper jaw label */}
        <div className="text-xs text-center text-muted-foreground font-medium">Upper Jaw</div>

        {/* Upper jaw */}
        <div className="flex justify-center gap-0.5 sm:gap-1">
          {UPPER_RIGHT.map((tooth) => (
            <ToothSVG
              key={tooth.fdi}
              tooth={tooth}
              condition={state[tooth.fdi]}
              onClick={() => openTooth(tooth)}
              size={36}
            />
          ))}
          <div className="w-px bg-border mx-1" />
          {UPPER_LEFT.map((tooth) => (
            <ToothSVG
              key={tooth.fdi}
              tooth={tooth}
              condition={state[tooth.fdi]}
              onClick={() => openTooth(tooth)}
              size={36}
            />
          ))}
        </div>

        <Separator />

        {/* Lower jaw */}
        <div className="flex justify-center gap-0.5 sm:gap-1">
          {[...LOWER_RIGHT].reverse().map((tooth) => (
            <ToothSVG
              key={tooth.fdi}
              tooth={tooth}
              condition={state[tooth.fdi]}
              onClick={() => openTooth(tooth)}
              size={36}
            />
          ))}
          <div className="w-px bg-border mx-1" />
          {LOWER_LEFT.map((tooth) => (
            <ToothSVG
              key={tooth.fdi}
              tooth={tooth}
              condition={state[tooth.fdi]}
              onClick={() => openTooth(tooth)}
              size={36}
            />
          ))}
        </div>

        {/* Lower jaw label */}
        <div className="text-xs text-center text-muted-foreground font-medium">Lower Jaw</div>
      </div>

      <ToothModal
        tooth={selectedTooth}
        condition={selectedCondition}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
