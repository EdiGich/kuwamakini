'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchReports() {
    setLoading(true)

    let url = '/api/reports?sort=recent'

    if (type) url += `&type=${type}`
    if (area) url += `&area=${area}`

    const res = await fetch(url)
    const data = await res.json()

    setReports(data)
    setLoading(false)
  }

   async function fetchTrending() {
    const res = await fetch('/api/reports/trending')
    const data = await res.json()
    setTrending(data)
  }

  useEffect(() => {
    fetchReports()
  }, [type, area])

   useEffect(() => {
    fetchTrending()
  }, [])

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Mombasa Scam Watch
      </h1>
     {/* Trending Section */}
      {trending.length > 0 && (
        <div className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">
            🔥 Trending This Week
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {trending.map((item: any) => (
              <div
                key={item.type}
                className="bg-white border rounded p-3 shadow-sm"
              >
                <p className="font-medium capitalize">
                  {item.type.replaceAll('_', ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {item.count} reports
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option className='text-gray-700' value="">All Types</option>
          <option className='text-gray-700' value="fake_landlord">Fake Landlord</option>
          <option className='text-gray-700' value="fake_police">Fake Police</option>
          <option className='text-gray-700' value="fake_job">Fake Job</option>
          <option className='text-gray-700' value="mpesa">M-Pesa Scam</option>
          <option className='text-gray-700' value="fake_gold">Fake Gold</option>
          <option className='text-gray-700' value="fake_emergency">Fake Emergency Call</option>
          <option className='text-gray-700' value="atm_distraction">ATM Distraction</option>
          <option className='text-gray-700' value="marketplace">Online Marketplace</option>
          <option className='text-gray-700' value="tourist_target">Tourist Targeting</option>
          <option className='text-gray-700' value="matatu_pickpocket">Matatu Pickpocketing</option>
          <option className='text-gray-700' value="tuktuk_pickpocket">Tuk-Tuk Pickpocketing</option>
          <option className='text-gray-700' value="other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Area (e.g. Nyali)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Reports */}
      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
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
      )}
    </main>
  )}