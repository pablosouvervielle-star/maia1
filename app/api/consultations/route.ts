import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const consultationSchema = z.object({
  patient_id: z.string().uuid(),
  title: z.string().optional(),
  chief_complaint: z.string().optional(),
})

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient_id')

  let query = supabase
    .from('consultations')
    .select('*, patients(first_name, last_name)')
    .eq('dentist_id', user.id)
    .order('created_at', { ascending: false })

  if (patientId) query = query.eq('patient_id', patientId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ consultations: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = consultationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const now = new Date()
  const title = parsed.data.title ||
    `Visit — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  const { data, error } = await supabase
    .from('consultations')
    .insert({
      ...parsed.data,
      title,
      dentist_id: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ consultation: data }, { status: 201 })
}
