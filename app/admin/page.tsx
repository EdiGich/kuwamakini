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

  async function rejectReport(id: string) {
    setActionLoading(id)

    const res = await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id))
    
       // 🔥 Update metrics instantly
    setMetrics((prev) => ({
      ...prev,
      pending: prev.pending - 1,
      rejected: prev.rejected + 1,
    }))
  }

    setActionLoading(null)
  }

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
              <p className="text-sm text-gray-500">
                {report.type} • {report.area || 'No area'}
              </p>

              <p className="mt-2">{report.description}</p>

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
                  onClick={() => rejectReport(report.id)}
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
    </main>
  )
}