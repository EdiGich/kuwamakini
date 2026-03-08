import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
  // Get date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('processed_reports')
    .select('scam_category, original_created_at')
    .gte('original_created_at', sevenDaysAgo.toISOString())

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Count occurrences by scam_category
  const counts: Record<string, number> = {}

  data?.forEach((row) => {
    const category = row.scam_category?.toLowerCase().replace(/\s+/g, '_') || 'other'
    counts[category] = (counts[category] || 0) + 1
  })

  // Convert to array format for frontend
  const trending = Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(trending)
}
