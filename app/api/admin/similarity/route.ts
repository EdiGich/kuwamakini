import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  const supabase = createClient()
  
  // Call our Postgres function
  const { data, error } = await (await supabase).rpc('get_similar_reports', {
    report_id: id,
    similarity_threshold: 0.4 // Adjust this (0.1 to 1.0) based on strictness
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}