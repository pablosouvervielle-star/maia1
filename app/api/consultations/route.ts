import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

  const admin = getAdminClient()
  let query = admin
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
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return NextResponse.json({ error: firstError || 'Datos inválidos' }, { status: 400 })
  }

  const now = new Date()
  const title = parsed.data.title ||
    `Consulta — ${now.toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}`

  const admin = getAdminClient()
  const { data, error } = await admin
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
