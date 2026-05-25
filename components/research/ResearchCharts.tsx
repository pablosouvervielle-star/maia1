'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { Download } from 'lucide-react'

interface TopDiagnosis {
  condition_name: string
  count: number
}

interface MonthlyTrend {
  month: string
  consultations: number
  patients: number
}

interface ResearchChartsProps {
  topDiagnoses: TopDiagnosis[]
  monthlyTrends: MonthlyTrend[]
}

export function ResearchCharts({ topDiagnoses, monthlyTrends }: ResearchChartsProps) {
  function exportCSV() {
    if (!topDiagnoses.length) return
    const rows = [
      ['Condition', 'Count'],
      ...topDiagnoses.map((d) => [d.condition_name, d.count.toString()]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maia-diagnoses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top Diagnoses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Top Diagnoses</CardTitle>
          <Button variant="ghost" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {topDiagnoses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No diagnosis data yet. Complete consultations with AI to see trends.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDiagnoses} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="condition_name"
                  width={160}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No trend data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="consultations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Consultations"
                />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={false}
                  name="Patients"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
