import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
  // Get date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('scam_reports')
    .select('type, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Count occurrences by type
  const counts: Record<string, number> = {}

  data?.forEach((row) => {
    counts[row.type] = (counts[row.type] || 0) + 1
  })

  return NextResponse.json(counts)
}
