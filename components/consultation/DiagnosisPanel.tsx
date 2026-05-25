'use client'

import type { DiagnosisUpdate } from '@/types/ai.types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, CheckCircle2, Clock, Info, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEVERITY_COLORS = {
  mild: 'text-green-500',
  moderate: 'text-yellow-500',
  severe: 'text-orange-500',
  critical: 'text-red-500',
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  soon: { label: 'Soon', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  elective: { label: 'Elective', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  preventive: { label: 'Preventive', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
}

interface DiagnosisPanelProps {
  diagnosis: DiagnosisUpdate | null
  className?: string
}

export function DiagnosisPanel({ diagnosis, className }: DiagnosisPanelProps) {
  if (!diagnosis) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8', className)}>
        <Stethoscope className="h-12 w-12 opacity-20" />
        <p className="text-sm text-center">
          Start the consultation. The AI diagnosis will appear here as you describe the patient&apos;s condition.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="space-y-4 p-4">
        {/* Red Flags */}
        {diagnosis.red_flags?.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Red Flags:</strong>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {diagnosis.red_flags.map((flag, i) => (
                  <li key={i} className="text-xs">{flag}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Needs More Info */}
        {diagnosis.needs_more_info?.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong className="text-xs">Additional info needed:</strong>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {diagnosis.needs_more_info.map((item, i) => (
                  <li key={i} className="text-xs">{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Conditions */}
        {diagnosis.conditions?.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {diagnosis.conditions.map((condition, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium leading-tight">{condition.name}</p>
                      <p className="text-xs text-muted-foreground">{condition.icd_code}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs shrink-0', SEVERITY_COLORS[condition.severity])}
                    >
                      {condition.severity}
                    </Badge>
                  </div>
                  {condition.affected_teeth?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {condition.affected_teeth.map((tooth) => (
                        <Badge key={tooth} variant="secondary" className="text-[10px] px-1.5 py-0">
                          #{tooth}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Confidence</span>
                      <span>{Math.round(condition.confidence * 100)}%</span>
                    </div>
                    <Progress value={condition.confidence * 100} className="h-1" />
                  </div>
                  {condition.evidence?.length > 0 && (
                    <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc list-inside">
                      {condition.evidence.map((e, ei) => <li key={ei}>{e}</li>)}
                    </ul>
                  )}
                  {i < diagnosis.conditions.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Treatments */}
        {diagnosis.recommended_treatments?.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {diagnosis.recommended_treatments.map((tx, i) => {
                const config = PRIORITY_CONFIG[tx.priority] || PRIORITY_CONFIG.elective
                return (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className={cn('text-[10px] shrink-0 mt-0.5', config.className)}>
                      {config.label}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium">{tx.procedure}</p>
                      {tx.affected_teeth?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          Teeth: {tx.affected_teeth.join(', ')}
                        </p>
                      )}
                      {tx.notes && <p className="text-[10px] text-muted-foreground">{tx.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Differential */}
        {diagnosis.differential_diagnosis?.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Differential Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {diagnosis.differential_diagnosis.map((diff, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{diff.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {Math.round(diff.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Follow-up */}
        {diagnosis.follow_up_recommendations && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">{diagnosis.follow_up_recommendations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
