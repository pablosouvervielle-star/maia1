export interface DiagnosisCondition {
  name: string
  icd_code: string
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  affected_teeth: string[]
  description: string
  evidence: string[]
}

export interface RecommendedTreatment {
  procedure: string
  priority: 'urgent' | 'soon' | 'elective' | 'preventive'
  affected_teeth: string[]
  estimated_sessions: number
  notes: string
}

export interface DifferentialDiagnosis {
  name: string
  confidence: number
  reasoning: string
}

export interface DiagnosisUpdate {
  conditions: DiagnosisCondition[]
  recommended_treatments: RecommendedTreatment[]
  differential_diagnosis: DifferentialDiagnosis[]
  red_flags: string[]
  follow_up_recommendations: string
  needs_more_info: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  displayContent?: string // content with JSON stripped
  diagnosis?: DiagnosisUpdate | null
  imageIds?: string[]
  createdAt: string
}

export interface UploadedImage {
  id: string
  file: File
  preview: string
  imageType: string
  uploadedId?: string // ID from DB after upload
}
