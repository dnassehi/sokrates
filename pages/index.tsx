import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { firestore, auth } from '../lib/firebase'
import { useRouter } from 'next/router'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import useRequireAuth from '../lib/useRequireAuth'  // Ny hook for å kreve innlogging

type Session = {
  id: string
  patientId: string
  startedAt: Timestamp
  status: 'in_progress' | 'awaiting_approval' | 'completed'
}

export default function DashboardPage() {
  const router = useRouter()
  useRequireAuth()  // Sikrer at bruker er logget inn (redirect til /login hvis ikke)

  const [sessions, setSessions] = useState<Session[]>([])
  const [statusFilter, setStatusFilter] = useState<'all'|'awaiting_approval'|'completed'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Hent sessions når filtre endres
  useEffect(() => {
    (async () => {
      const user = auth.currentUser
      if (!user) return  // (bruker blir uansett redirectet av useRequireAuth)
      // Hent klinikkode for innlogget lege
      const docSnap = await getDocs(
        query(collection(firestore, 'doctors'), where('__name__', '==', user.uid))
      )
      const clinicCode = docSnap.docs[0]?.data().clinicCode
      if (!clinicCode) return

      // Bygg spørring basert på filtrene
      let q = query(
        collection(firestore, 'sessions'),
        where('clinicCode', '==', clinicCode),
        orderBy('startedAt', 'desc')
      )
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter))
      }
      if (fromDate) {
        q = query(q, where('startedAt', '>=', Timestamp.fromDate(new Date(fromDate))))
      }
      if (toDate) {
        const d = new Date(toDate)
        d.setDate(d.getDate() + 1)
        q = query(q, where('startedAt', '<', Timestamp.fromDate(d)))
      }

      const snap = await getDocs(q)
      setSessions(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    })()
  }, [statusFilter, fromDate, toDate])

  // Aggreger antall sesjoner per dag for diagram
  const chartData = Object.values(
    sessions.reduce((acc, s) => {
      const date = s.startedAt.toDate().toISOString().slice(0,10)
      acc[date] = acc[date] || { date, count: 0 }
      acc[date].count++
      return acc
    }, {} as Record<string, { date: string; count: number }>)
  ).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Lege‐dashboard</h1>

      {/* Filtre */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="border px-2 py-1 rounded"
          >
            <option value="all">Alle</option>
            <option value="awaiting_approval">Venter</option>
            <option value="completed">Ferdig ratet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Fra</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Til</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
      </div>

      {/* Stolpediagram over antall gjennomførte anamneser per dag */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabell over sesjoner */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Pasient-ID</th>
            <th className="p-2 border">Startet</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Handling</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="p-2 border">{s.patientId.slice(0,8)}…</td>
              <td className="p-2 border">{s.startedAt.toDate().toLocaleString('nb-NO')}</td>
              <td className="p-2 border">
                {s.status === 'awaiting_approval' ? 'Venter' : 'Ferdig'}
              </td>
              <td className="p-2 border">
                <Link href={`/dashboard/${s.id}`} className="text-blue-600 hover:underline">
                  Vis / Rate
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
