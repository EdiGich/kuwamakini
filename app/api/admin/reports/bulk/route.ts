import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  const { ids, reason } = await req.json()
  const supabase = await createClient()

  // 1. Log all these rejections in the audit log first
  // (Assuming you have a logic to get the current admin ID)
  const { data: { user } } = await supabase.auth.getUser()
  
  const auditLogs = ids.map((reportId: string) => ({
    report_id: reportId,
    admin_id: user?.id,
    action: 'rejected',
    reason: `[BULK REJECT] ${reason}`
  }))

  await supabase.from('report_audit_logs').insert(auditLogs)

  // 2. Delete the reports
  const { error } = await supabase
    .from('scam_reports')
    .delete()
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}