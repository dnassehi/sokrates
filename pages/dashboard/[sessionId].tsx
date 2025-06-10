import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '../../lib/firebase'
import RatingPanel from '../../components/dashboard/RatingPanel'

export default function SessionDetailPage() {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId: string }
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [patientId, setPatientId] = useState('')

  useEffect(() => {
    if (!sessionId) return
    // Krev innlogging, ellers gå til /login
    auth.onAuthStateChanged(async user => {
      if (!user) return router.replace('/login')
      const ref = doc(firestore, 'sessions', sessionId)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        return router.replace('/dashboard')
      }
      const data = snap.data()
      if (data.doctorId !== user.uid || !data.summary) {
        return router.replace('/dashboard')
      }
      setSummary(data.summary)
      setPatientId(data.patientId)
      setLoading(false)
    })
  }, [sessionId, router])

  if (loading) {
    return <p className="p-8 text-center">Laster …</p>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline">
        ← Tilbake til dashboard
      </button>

      <h1 className="text-2xl font-bold">Anamnese – Økt {sessionId.slice(0,8)}…</h1>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">1. Hovedplage</h2>
          <p>{summary.hovedplage}</p>
        </div>
        <div>
          <h2 className="font-semibold">2. Tidligere sykdommer</h2>
          <p>{summary.tidligereSykdommer}</p>
        </div>
        <div>
          <h2 className="font-semibold">3. Medisinering & Allergier</h2>
          <p><strong>Medisinering:</strong> {summary.medisinering}</p>
          <p><strong>Allergier:</strong> {summary.allergier}</p>
        </div>
        <div>
          <h2 className="font-semibold">4. Familiehistorie</h2>
          <p>{summary.familiehistorie}</p>
        </div>
        <div>
          <h2 className="font-semibold">5. Sosial & Livsstil</h2>
          <p>{summary.sosialLivsstil}</p>
        </div>
        <div>
          <h2 className="font-semibold">6. ROS</h2>
          <p>{summary.ros}</p>
        </div>
        <div>
          <h2 className="font-semibold">7. Pasientens mål</h2>
          <p>{summary.pasientMål}</p>
        </div>
        <div>
          <h2 className="font-semibold">Fri oppsummering</h2>
          <p className="italic">{summary.friOppsummering}</p>
        </div>
      </div>

      <RatingPanel sessionId={sessionId as string} patientId={patientId} />
    </div>
  )
}
