'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  async function fetchReports() {
    const res = await fetch('/api/admin/reports')
    const data = await res.json()

    if (!res.ok) {
      console.error(data)
      setReports([])
      setLoading(false)
      return
    }

    setReports(data.reports || [])
    setMetrics(data.metrics || {})
    setLoading(false)
  }
// Approve report by ID
  async function approveReport(id: string) {
    setActionLoading(id)

    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id))

     // 🔥 Update metrics instantly
    setMetrics((prev) => ({
      ...prev,
      pending: prev.pending - 1,
      approved: prev.approved + 1,
    }))
  }

    setActionLoading(null)
  }

  // Open reject modal
  function openRejectModal(id: string) {
    setSelectedReportId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  async function submitReject() {
    if (!selectedReportId) return
    setActionLoading(selectedReportId)

    const res = await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedReportId, reason: rejectReason }),
    })

    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== selectedReportId))
      setMetrics((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
      }))
      setShowRejectModal(false)
      setSelectedReportId(null)
      setRejectReason('')
    }

    setActionLoading(null)
  }
// Check auth on mount and fetch reports for moderation
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      fetchReports()
    }

    checkAuth()
  }, [])

  const selectedReport = selectedReportId
    ? reports.find((r) => r.id === selectedReportId)
    : null

  const previewText = selectedReport?.description
    ? selectedReport.description.length > 200
      ? selectedReport.description.slice(0, 200) + '...'
      : selectedReport.description
    : ''

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Admin Moderation
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl text-gray-700 font-bold">{metrics.total}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl text-gray-700 font-bold">{metrics.pending}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl text-gray-700 font-bold">{metrics.approved}</p>
        </div>

        <div className="bg-red-100 p-4 rounded">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl text-gray-700 font-bold">{metrics.rejected}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <p>No pending reports.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border p-4 rounded">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>
                  {report.type} • {report.area || 'No area'}
                </span>
                {report.status === 'approved' && (
                  <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">Approved</span>
                )}
                {report.status === 'rejected' && (
                  <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">Rejected</span>
                )}
              </p>

              <p className="mt-2">{report.description}</p>

              {/* Audit history inside the report card */}
              {report.report_audit_logs && report.report_audit_logs.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="text-gray-600 font-medium mb-1">Audit history:</p>
                  <ul className="space-y-1">
                    {report.report_audit_logs.slice(0, 3).map((a: any) => (
                      <li key={a.id} className="flex items-start gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs mt-0.5 ${
                            a.action === 'approved' ? 'bg-green-100 text-green-700' : a.action === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {String(a.action).toUpperCase()}
                        </span>

                        <div className="flex-1">
                          <div className="text-gray-700">
                            {a.admin_email || a.admin_id || 'admin'} • {new Date(a.created_at).toLocaleString()}
                          </div>
                          {a.reason && <div className="text-red-600 italic">Reason: {a.reason}</div>}
                        </div>
                      </li>
                    ))}

                    {report.report_audit_logs.length > 3 && (
                      <li className="text-xs text-gray-500">Showing latest 3 entries</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex mt-4 p-2">
                <button
                  onClick={() => approveReport(report.id)}
                  disabled={actionLoading === report.id}
                  className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50
                  ${
                    actionLoading === report.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
               >
                  {actionLoading === report.id ? 'Processing...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => openRejectModal(report.id)}
                  disabled={actionLoading === report.id}
                  className={`bg-red-600 ml-auto text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50
                  ${
                    actionLoading === report.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading === report.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center">
          <div className="bg-gray-500 p-6 rounded max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">Reason for rejecting report</h2>
            {selectedReport && (
              <div className="mb-2 text-sm text-gray-700">
                <p className="font-medium">Report preview:</p>
                <p className="text-sm italic">{previewText}</p>
              </div>
            )}

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border rounded p-2 mb-4"
              rows={4}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedReportId(null)
                }}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={submitReject}
                className="px-4 py-2 rounded bg-red-600 text-white"
                disabled={actionLoading === selectedReportId}
              >
                {actionLoading === selectedReportId ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}