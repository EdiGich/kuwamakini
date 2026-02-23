'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuditPage() {
  const supabase = createClient()
  const router = useRouter()

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('report_audit_logs')
        .select(`
          id,
          action,
          reason,
          created_at,
          scam_reports ( description, area ),
          profiles ( email )
        `)
        .order('created_at', { ascending: false })

      if (!error) setLogs(data || [])
      setLoading(false)
    }

    fetchLogs()
  }, [])

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      {logs.length === 0 ? (
        <p>No audit activity yet.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border p-4 rounded">
              <p className="text-sm text-gray-500">
                {log.action.toUpperCase()} • {new Date(log.created_at).toLocaleString()}
              </p>

              <p className="mt-2">
                <strong>Admin:</strong> {log.profiles?.email}
              </p>

              <p>
                <strong>Area:</strong> {log.scam_reports?.area || 'N/A'}
              </p>

              <p>
                <strong>Report:</strong> {log.scam_reports?.description}
              </p>

              {log.reason && (
                <p className="mt-2 text-red-600">
                  <strong>Reason:</strong> {log.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}