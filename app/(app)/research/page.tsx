import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResearchCharts } from '@/components/research/ResearchCharts'

export default async function ResearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [statsResult, diagnosesResult, trendsResult] = await Promise.all([
    supabase.rpc('get_dentist_stats', { p_dentist_id: user.id }),
    supabase.rpc('get_top_diagnoses', { p_dentist_id: user.id, p_limit: 10 }),
    supabase.rpc('get_monthly_trends', { p_dentist_id: user.id, p_months: 12 }),
  ])

  const stats = statsResult.data
  const topDiagnoses = diagnosesResult.data || []
  const monthlyTrends = trendsResult.data || []

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Research & Analytics" subtitle="Anonymous aggregated data from your practice" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.total_consultations ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.total_patients ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.consultations_this_month ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">consultations</p>
            </CardContent>
          </Card>
        </div>

        <ResearchCharts topDiagnoses={topDiagnoses} monthlyTrends={monthlyTrends} />
      </div>
    </div>
  )
}
