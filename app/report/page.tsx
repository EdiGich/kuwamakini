'use client'

import { useState } from 'react'

export default function ReportPage() {
  const [type, setType] = useState('other')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!description.trim()) {
      setMessage('Description is required.')
      return
    }

    if (description.length > 2000) {
      setMessage('Description is too long. Max 2000 characters allowed.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          area,
          description,
          incident_date: incidentDate || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Something went wrong.')
      } else {
        setMessage('Report Submitted for Review.')
        setDescription('')
        setArea('')
        setIncidentDate('')
        setType('other')
      }

    } catch (err) {
      setMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Report a Scam
        </h1>
        <a
          href="/"
          className="inline-block bg-linear-to-r from-gray-600 to-yellow-800 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold uppercase tracking-wide relative overflow-hidden group sword-glimmer"
        >
          Back to Home
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option className='text-gray-700' value="other">Other</option>
          <option className='text-gray-700' value="matatu_pickpocket">Matatu Pickpocketing</option>
          <option className='text-gray-700' value="tuktuk_pickpocket">Tuk-Tuk Pickpocketing</option>
          <option className='text-gray-700' value="fake_landlord">Fake Landlord</option>
          <option className='text-gray-700' value="fake_police">Fake Police</option>
          <option className='text-gray-700' value="fake_job">Fake Job</option>
          <option className='text-gray-700' value="mpesa">M-Pesa Scam</option>
          <option className='text-gray-700' value="fake_gold">Fake Gold</option>
          <option className='text-gray-700' value="fake_emergency">Fake Emergency Call</option>
          <option className='text-gray-700' value="atm_distraction">ATM Distraction</option>
          <option className='text-gray-700' value="marketplace">Online Marketplace</option>
          <option className='text-gray-700' value="tourist_target">Tourist Targeting</option>
        </select>

        <input
          type="text"
          placeholder="Area (e.g. Nyali, CBD, Likoni)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Describe what happened..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded h-32"
          required
        />

        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full bg-gray-500 text-white border p-2 rounded "
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>

        {message && (
          <p className="text-sm mt-2 text-center font-bold text-green-600">
            {message}
          </p>
        )}
      </form>

      <div className="mt-8 text-sm text-gray-500 border-t pt-4">
        <p>
          Reports are user-submitted and unverified.
          This platform documents scam methods and patterns.
          No individuals are identified or accused.
        </p>
      </div>
    </main>
  )
}