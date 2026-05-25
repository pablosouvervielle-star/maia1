'use client'

import { getToothColor } from '@/lib/utils/odontogram'
import type { ToothCondition, ToothInfo } from '@/lib/utils/odontogram'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ToothSVGProps {
  tooth: ToothInfo
  condition?: ToothCondition
  onClick: () => void
  size?: number
}

export function ToothSVG({ tooth, condition, onClick, size = 40 }: ToothSVGProps) {
  const color = getToothColor(condition)
  const isExtracted = condition?.status === 'extracted'

  // Simplified tooth shape based on type
  const isMolar = tooth.type === 'molar' || tooth.type === 'premolar'

  return (
    <Tooltip>
      <TooltipTrigger>
        <button
          onClick={onClick}
          className="group relative flex flex-col items-center gap-0.5 focus:outline-none"
          aria-label={`Tooth ${tooth.fdi} - ${tooth.name}`}
        >
          <span className="text-[9px] text-muted-foreground font-mono">{tooth.fdi}</span>
          <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            className="transition-transform group-hover:scale-110 cursor-pointer"
          >
            {isExtracted ? (
              // X for extracted
              <>
                <line x1="8" y1="8" x2="32" y2="32" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <line x1="32" y1="8" x2="8" y2="32" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : isMolar ? (
              // Molar shape: rounded rectangle with cusps
              <>
                <rect
                  x="4"
                  y="8"
                  width="32"
                  height="24"
                  rx="6"
                  ry="6"
                  fill={color}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border"
                  opacity="0.9"
                />
                {/* Crown cross lines for occlusal surface detail */}
                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="1" opacity="0.3" />
                <line x1="6" y1="20" x2="34" y2="20" stroke="white" strokeWidth="1" opacity="0.3" />
              </>
            ) : (
              // Incisor/canine: rounded at top
              <>
                <path
                  d="M 20 5 C 10 5, 4 12, 4 20 L 4 32 C 4 36, 8 38, 12 38 L 28 38 C 32 38, 36 36, 36 32 L 36 20 C 36 12, 30 5, 20 5 Z"
                  fill={color}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border"
                  opacity="0.9"
                />
              </>
            )}

            {/* Condition indicators */}
            {condition?.conditions && condition.conditions.length > 0 && (
              <circle cx="33" cy="7" r="5" fill="#ef4444" />
            )}
          </svg>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="font-semibold text-xs">#{tooth.fdi} — {tooth.name}</p>
        {condition?.status && condition.status !== 'healthy' && (
          <p className="text-xs capitalize text-muted-foreground">{condition.status}</p>
        )}
        {condition?.conditions && condition.conditions.length > 0 && (
          <ul className="text-xs mt-1 space-y-0.5">
            {condition.conditions.map((c) => <li key={c}>• {c}</li>)}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
