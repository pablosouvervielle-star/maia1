// FDI (Fédération Dentaire Internationale) tooth numbering system
// Upper right: 11-18, Upper left: 21-28
// Lower left: 31-38, Lower right: 41-48

export interface ToothInfo {
  fdi: string
  name: string
  type: 'incisor' | 'canine' | 'premolar' | 'molar'
  jaw: 'upper' | 'lower'
  side: 'right' | 'left'
}

export interface ToothCondition {
  status: 'healthy' | 'caries' | 'restored' | 'crown' | 'extracted' | 'implant' | 'missing' | 'bridge'
  conditions: string[]
  surfaces: {
    mesial?: string
    distal?: string
    buccal?: string
    lingual?: string
    occlusal?: string
    incisal?: string
  }
  notes?: string
  color?: string
}

export type OdontogramState = Record<string, ToothCondition>

export const TOOTH_STATUS_COLORS: Record<string, string> = {
  healthy: '#9ca3af',
  caries: '#ef4444',
  restored: '#3b82f6',
  crown: '#eab308',
  extracted: '#111827',
  implant: '#8b5cf6',
  missing: '#d1d5db',
  bridge: '#f97316',
}

export const TOOTH_CONDITIONS = [
  'Caries',
  'Pulpitis',
  'Periapical Abscess',
  'Periodontal Disease',
  'Fracture',
  'Attrition',
  'Erosion',
  'Hypersensitivity',
  'Impacted',
  'Supernumerary',
  'Ankylosis',
  'Root Resorption',
  'Furcation Involvement',
  'Recession',
  'Mobility',
]

// Upper jaw (quadrants 1 and 2) — displayed right to left
export const UPPER_RIGHT: ToothInfo[] = [
  { fdi: '18', name: '3rd Molar (Wisdom)', type: 'molar', jaw: 'upper', side: 'right' },
  { fdi: '17', name: '2nd Molar', type: 'molar', jaw: 'upper', side: 'right' },
  { fdi: '16', name: '1st Molar', type: 'molar', jaw: 'upper', side: 'right' },
  { fdi: '15', name: '2nd Premolar', type: 'premolar', jaw: 'upper', side: 'right' },
  { fdi: '14', name: '1st Premolar', type: 'premolar', jaw: 'upper', side: 'right' },
  { fdi: '13', name: 'Canine', type: 'canine', jaw: 'upper', side: 'right' },
  { fdi: '12', name: 'Lateral Incisor', type: 'incisor', jaw: 'upper', side: 'right' },
  { fdi: '11', name: 'Central Incisor', type: 'incisor', jaw: 'upper', side: 'right' },
]

export const UPPER_LEFT: ToothInfo[] = [
  { fdi: '21', name: 'Central Incisor', type: 'incisor', jaw: 'upper', side: 'left' },
  { fdi: '22', name: 'Lateral Incisor', type: 'incisor', jaw: 'upper', side: 'left' },
  { fdi: '23', name: 'Canine', type: 'canine', jaw: 'upper', side: 'left' },
  { fdi: '24', name: '1st Premolar', type: 'premolar', jaw: 'upper', side: 'left' },
  { fdi: '25', name: '2nd Premolar', type: 'premolar', jaw: 'upper', side: 'left' },
  { fdi: '26', name: '1st Molar', type: 'molar', jaw: 'upper', side: 'left' },
  { fdi: '27', name: '2nd Molar', type: 'molar', jaw: 'upper', side: 'left' },
  { fdi: '28', name: '3rd Molar (Wisdom)', type: 'molar', jaw: 'upper', side: 'left' },
]

export const LOWER_LEFT: ToothInfo[] = [
  { fdi: '31', name: 'Central Incisor', type: 'incisor', jaw: 'lower', side: 'left' },
  { fdi: '32', name: 'Lateral Incisor', type: 'incisor', jaw: 'lower', side: 'left' },
  { fdi: '33', name: 'Canine', type: 'canine', jaw: 'lower', side: 'left' },
  { fdi: '34', name: '1st Premolar', type: 'premolar', jaw: 'lower', side: 'left' },
  { fdi: '35', name: '2nd Premolar', type: 'premolar', jaw: 'lower', side: 'left' },
  { fdi: '36', name: '1st Molar', type: 'molar', jaw: 'lower', side: 'left' },
  { fdi: '37', name: '2nd Molar', type: 'molar', jaw: 'lower', side: 'left' },
  { fdi: '38', name: '3rd Molar (Wisdom)', type: 'molar', jaw: 'lower', side: 'left' },
]

export const LOWER_RIGHT: ToothInfo[] = [
  { fdi: '41', name: 'Central Incisor', type: 'incisor', jaw: 'lower', side: 'right' },
  { fdi: '42', name: 'Lateral Incisor', type: 'incisor', jaw: 'lower', side: 'right' },
  { fdi: '43', name: 'Canine', type: 'canine', jaw: 'lower', side: 'right' },
  { fdi: '44', name: '1st Premolar', type: 'premolar', jaw: 'lower', side: 'right' },
  { fdi: '45', name: '2nd Premolar', type: 'premolar', jaw: 'lower', side: 'right' },
  { fdi: '46', name: '1st Molar', type: 'molar', jaw: 'lower', side: 'right' },
  { fdi: '47', name: '2nd Molar', type: 'molar', jaw: 'lower', side: 'right' },
  { fdi: '48', name: '3rd Molar (Wisdom)', type: 'molar', jaw: 'lower', side: 'right' },
]

export const ALL_TEETH = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT]

export function getToothInfo(fdi: string): ToothInfo | undefined {
  return ALL_TEETH.find((t) => t.fdi === fdi)
}

export function getToothColor(condition: ToothCondition | undefined): string {
  if (!condition) return TOOTH_STATUS_COLORS.healthy
  return TOOTH_STATUS_COLORS[condition.status] || TOOTH_STATUS_COLORS.healthy
}

export function defaultToothCondition(): ToothCondition {
  return {
    status: 'healthy',
    conditions: [],
    surfaces: {},
    notes: '',
  }
}
