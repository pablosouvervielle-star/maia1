import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['active', 'completed', 'archived']).optional(),
  chief_complaint: z.string().optional(),
  subjective_notes: z.string().optional(),
  objective_notes: z.string().optional(),
  assessment_notes: z.string().optional(),
  plan_notes: z.string().optional(),
  follow_up_date: z.string().optional(),
  follow_up_notes: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      patients ( id, first_name, last_name, date_of_birth, gender, medical_history ),
      chat_messages ( id, role, content, has_images, image_ids, created_at, is_pinned ),
      diagnoses ( * ),
      images ( id, storage_path, image_type, file_name, ai_analyzed, ai_analysis, notes, created_at )
    `)
    .eq('id', id)
    .eq('dentist_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ consultation: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('consultations')
    .update(parsed.data)
    .eq('id', id)
    .eq('dentist_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ consultation: data })
}
