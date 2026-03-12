'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    async function fetchLogs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/GateKubwa'); return; }

      let query: any = supabase
        .from('report_audit_logs')
        .select('id, action, reason, created_at, admin_id, report_id, scam_reports(description, area), profiles(email)')

      if (actionFilter !== 'all') query = query.eq('action', actionFilter)
      if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString())
      if (toDate) query = query.lte('created_at', new Date(toDate).toISOString())

      const start = (page - 1) * pageSize
      const end = start + pageSize - 1
      const { data, error } = await query.order('created_at', { ascending: false }).range(start, end)

      const countQuery = supabase.from('report_audit_logs').select('id', { head: true, count: 'exact' })
      if (actionFilter !== 'all') countQuery.eq('action', actionFilter)
      if (fromDate) countQuery.gte('created_at', new Date(fromDate).toISOString())
      if (toDate) countQuery.lte('created_at', new Date(toDate).toISOString())
      const { count } = await countQuery

      if (error) {
        setErrorMessage(error.message)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('report_audit_logs')
          .select('id, action, reason, created_at, admin_id, report_id')
          .order('created_at', { ascending: false })
          .range(start, end)
        if (!fallbackError) setLogs(fallbackData || [])
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

  function exportCsv() {
    if (!logs || logs.length === 0) return
    const headers = ['Timestamp', 'Action', 'Admin', 'Area', 'Report Content', 'Reason']
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
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
    </div>
  )

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const approvedCount = logs.filter((l) => l.action === 'approved').length
  const rejectedCount = logs.filter((l) => l.action === 'rejected').length

  async function handleLogout() {
      // const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/GateKubwa')
    }


  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
        <div>
          <Link href="/admn-nyuma-ya-tent" className="text-amber-500 hover:text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block transition-colors">
            ← Back to Moderation
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">System Audit</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Security & Action Logs</p>
        </div>
        <button 
          onClick={exportCsv} 
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/10"
        >
          Export CSV
        </button>
        <button
          onClick={ () => setShowLogoutModal(true)}
          className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
        >
          Terminate Session (Logout)
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mb-8 flex flex-wrap items-center gap-8">
        <FilterGroup label="Action Type">
          <select 
            value={actionFilter} 
            onChange={(e) => { setActionFilter(e.target.value as any); setPage(1) }} 
            className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none pr-4"
          >
            <option value="all" className="bg-slate-900 text-white">All Actions</option>
            <option value="approved" className="bg-slate-900 text-emerald-400">Approved</option>
            <option value="rejected" className="bg-slate-900 text-rose-400">Rejected</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Time Range (From)">
          <input 
            type="date" 
            value={fromDate || ''} 
            onChange={(e) => { setFromDate(e.target.value || null); setPage(1) }} 
            className="bg-transparent text-white font-bold outline-none scheme-dark" 
          />
        </FilterGroup>

        <FilterGroup label="Time Range (To)">
          <input 
            type="date" 
            value={toDate || ''} 
            onChange={(e) => { setToDate(e.target.value || null); setPage(1) }} 
            className="bg-transparent text-white font-bold outline-none scheme-dark" 
          />
        </FilterGroup>

        <FilterGroup label="Rows">
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} 
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            <option value={10} className="bg-slate-900">10</option>
            <option value={20} className="bg-slate-900">20</option>
            <option value={50} className="bg-slate-900">50</option>
          </select>
        </FilterGroup>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatItem label="Filtered Results" value={total} color="text-white" />
        <StatItem label="Approved (This Page)" value={approvedCount} color="text-emerald-500" />
        <StatItem label="Rejected (This Page)" value={rejectedCount} color="text-rose-500" />
      </div>

      {/* Table Section */}
      {logs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
          <p className="text-slate-500 font-medium">{errorMessage || 'No audit logs found for this criteria.'}</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Moderator</th>
                  <th className="px-6 py-4">Target Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-300 font-bold">{new Date(log.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 font-mono italic">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider ${
                        log.action === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {log.profiles?.[0]?.email?.split('@')[0] || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-white font-medium line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                          <span className="text-amber-500 uppercase text-[10px] font-black mr-2">[{log.scam_reports?.[0]?.area || 'Area Not Specified'}]</span>
                          {truncate(log.scam_reports?.[0]?.description, 100)}
                        </p>
                        {log.reason && (
                          <div className="mt-2 text-xs text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 italic">
                            Reason: {log.reason}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between px-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
          Page {page} <span className="mx-2 text-slate-800">/</span> {totalPages}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-5 py-2 text-xs font-bold rounded-xl border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>
          <button 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="px-5 py-2 text-xs font-bold rounded-xl border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
{showLogoutModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl scale-in-center">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Terminate Session?</h2>
        <p className="text-sm text-slate-400">
          You are about to log out of the admin terminal. You will need your security key to return.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Confirm Logout
        </button>
        <button 
          onClick={() => setShowLogoutModal(false)}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  )
}

/* Helper Components */
function FilterGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
    </div>
  )
}