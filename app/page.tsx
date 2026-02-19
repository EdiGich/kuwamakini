async function getReports() {
  const res = await fetch('http://localhost:3000/api/reports', {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch reports')
  }

  return res.json()
}

export default async function Home() {
  const reports = await getReports()

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mombasa Scam Watch
      </h1>

      <div className="space-y-4">
        {reports.map((report: any) => (
          <div
            key={report.id}
            className="border p-4 rounded-lg shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {report.type} • {report.area || 'Area not specified'}
            </p>
            <p className="mt-2">{report.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
