import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

async function checkAdmin() {
  const supabase = createClient()

  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  if (!user) return { error: 'Unauthorized', status: 401 }

  const { data: profile } = await (await supabase)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 }
  }

  return { supabase }
}

/* -------------------- GET PENDING REPORTS -------------------- */

export async function GET() {
  const auth = await checkAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase } = auth
// Fetch pending reports for moderation list.
  const { data: pendingReports, error } = await (await supabase)
    .from('scam_reports')
    .select(`*, report_audit_logs(*)`)
    .eq('is_approved', false)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch metrics
  const { count: totalCount } = await (await supabase)
    .from('scam_reports')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await (await supabase)
    .from('scam_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: approvedCount } = await (await supabase)
    .from('scam_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: rejectedCount } = await (await supabase)
    .from('scam_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  return NextResponse.json({
    reports: pendingReports,
    metrics: {
      total: totalCount || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
    },
  })
  // return NextResponse.json(data)
}

/* -------------------- APPROVE REPORT -------------------- */

export async function PATCH(req: Request) {
  const auth = await checkAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase } = auth
  const { 
    id, 
    // Optional fields for AI-sanitized reports
    cleanDescription, 
    scamCategory, 
    county, 
    specificArea, 
    riskLevel,
    processingMethod = 'ai'
  } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
  }

  // If AI data is provided, insert into processed_reports (for AI-sanitized reports)
  if (cleanDescription && scamCategory) {
    // Get original report for metadata
    const { data: originalReport } = await (await supabase)
      .from('scam_reports')
      .select('*')
      .eq('id', id)
      .single()

    // Get current admin user
    const {
      data: { user },
    } = await (await supabase).auth.getUser()

    // Insert into processed_reports
    const { error: insertError } = await (await supabase)
      .from('processed_reports')
      .insert({
        original_id: id,
        clean_description: cleanDescription,
        scam_category: scamCategory,
        county: county || 'Unknown',
        specific_area: specificArea || originalReport?.area || 'Unknown',
        original_incident_date: originalReport?.incident_date,
        original_created_at: originalReport?.created_at,
        processing_method: processingMethod,
        risk_level: Number(riskLevel) || 3,
        moderated_by: user?.id
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  // 🔹 Update report status
  const { error } = await (await supabase)
    .from('scam_reports')
    .update({ is_approved: true, status: 'approved' })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 🔹 Get current admin user
  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  // 🔹 Insert audit log
  await (await supabase)
    .from('report_audit_logs')
    .insert([
      {
        report_id: id,
        admin_id: user?.id,
        action: 'approved',
      },
    ])

  return NextResponse.json({ success: true })
}

/* -------------------- reject REPORT -------------------- */

export async function DELETE(req: Request) {
  const auth = await checkAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { supabase } = auth
  const { id, reason } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
  }

  // Update report
  const { error } = await (await supabase)
    .from('scam_reports')
    .update({ is_approved: false, status: 'rejected' })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  // Insert audit log with reason
  await (await supabase)
    .from('report_audit_logs')
    .insert([
      {
        report_id: id,
        admin_id: user?.id,
        action: 'rejected',
        reason: reason || null,
      },
    ])

  return NextResponse.json({ success: true })
}