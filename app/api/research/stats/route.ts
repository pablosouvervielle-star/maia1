import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [statsResult, diagnosesResult, trendsResult] = await Promise.all([
    supabase.rpc('get_dentist_stats', { p_dentist_id: user.id }),
    supabase.rpc('get_top_diagnoses', { p_dentist_id: user.id, p_limit: 10 }),
    supabase.rpc('get_monthly_trends', { p_dentist_id: user.id, p_months: 12 }),
  ])

  return NextResponse.json({
    stats: statsResult.data,
    top_diagnoses: diagnosesResult.data || [],
    monthly_trends: trendsResult.data || [],
  })
}
