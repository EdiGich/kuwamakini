'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuditPage() {
  const supabase = createClient()
  const router = useRouter()

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [actionFilter, setActionFilter] = useState<'all' | 'approved' | 'rejected'>('all')
  const [fromDate, setFromDate] = useState<string | null>(null)
  const [toDate, setToDate] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLogs() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Build base query with relational select; fall back handled below
      let query: any = supabase
        .from('report_audit_logs')
        .select('id, action, reason, created_at, admin_id, report_id, scam_reports(description, area), profiles(email)')

      // Apply filters
      if (actionFilter !== 'all') query = query.eq('action', actionFilter)
      if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString())
      if (toDate) query = query.lte('created_at', new Date(toDate).toISOString())

      // Pagination range
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      const { data, error } = await query.order('created_at', { ascending: false }).range(start, end)

      // Also fetch total count for the same filters
      const countQuery = supabase.from('report_audit_logs').select('id', { head: true, count: 'exact' })
      if (actionFilter !== 'all') countQuery.eq('action', actionFilter)
      if (fromDate) countQuery.gte('created_at', new Date(fromDate).toISOString())
      if (toDate) countQuery.lte('created_at', new Date(toDate).toISOString())
      const { count } = await countQuery

      if (error) {
        console.error('Error fetching audit logs', error)
        setErrorMessage(error.message)

        // Fallback: try a simpler select without related tables and with pagination
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('report_audit_logs')
          .select('id, action, reason, created_at, admin_id, report_id')
          .order('created_at', { ascending: false })
          .range(start, end)

        if (!fallbackError) {
          setLogs(fallbackData || [])
        } else {
          console.error('Fallback also failed', fallbackError)
          setLogs([])
        }
      } else {
        setLogs(data || [])
        setErrorMessage(null)
      }

      setTotal(count || 0)
      setLoading(false)
    }

    fetchLogs()
  }, [page, pageSize, actionFilter, fromDate, toDate])

  const truncate = (s: string | undefined | null, n = 120) =>
    s ? (s.length > n ? s.slice(0, n) + '...' : s) : '-' 

  if (loading) return <p className="p-8">Loading...</p>

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function exportCsv() {
    if (!logs || logs.length === 0) return
    const headers = ['created_at', 'action', 'admin', 'area', 'report', 'reason']
    const rows = logs.map((l) => [
      l.created_at,
      l.action,
      l.profiles?.[0]?.email || l.admin_id || '',
      l.scam_reports?.[0]?.area || '',
      (l.scam_reports?.[0]?.description || '').replace(/"/g, '""'),
      (l.reason || '').replace(/"/g, '""'),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c || '')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const approvedCount = logs.filter((l) => l.action === 'approved').length
  const rejectedCount = logs.filter((l) => l.action === 'rejected').length

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Filter:</label>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value as any); setPage(1) }} className="border bg-gray-500 rounded px-2 py-1">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <label className="text-sm ml-3">From:</label>
          <input type="date" value={fromDate || ''} onChange={(e) => { setFromDate(e.target.value || null); setPage(1) }} className="border bg-gray-500 rounded px-2 py-1" />

          <label className="text-sm ml-3">To:</label>
          <input type="date" value={toDate || ''} onChange={(e) => { setToDate(e.target.value || null); setPage(1) }} className="border bg-gray-500 rounded px-2 py-1" />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm mr-2">Page size:</div>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="border bg-gray-500 rounded px-2 py-1">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <button onClick={exportCsv} className="ml-4 bg-blue-400 text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm text-gray-500">Total (filtered)</div>
          <div className="text-xl font-bold text-gray-700">{total}</div>
        </div>

        <div className="bg-green-200 p-3 rounded">
          <div className="text-sm text-gray-500">Approved (page)</div>
          <div className="text-xl font-bold text-gray-700">{approvedCount}</div>
        </div>

        <div className="bg-red-200 p-3 rounded">
          <div className="text-sm text-gray-500">Rejected (page)</div>
          <div className="text-xl font-bold text-gray-700">{rejectedCount}</div>
        </div>
      </div>

      {logs.length === 0 ? (
        <p>{errorMessage || 'No audit activity yet.'}</p>
      ) : (
        <div className="overflow-x-auto bg-gray-500 rounded shadow">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-400 text-left text-xs text-gray-600 uppercase">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-blue-500">
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${log.action === 'approved' ? 'bg-green-400 text-green-700' : log.action === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{String(log.action).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{log.profiles?.[0]?.email || log.admin_id || '-'}</td>
                  <td className="px-4 py-3 text-sm">{log.scam_reports?.[0]?.area || '-'}</td>
                  <td className="px-4 py-3 text-sm">{truncate(log.scam_reports?.[0]?.description, 120)}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{truncate(log.reason, 80)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </main>
  )
}